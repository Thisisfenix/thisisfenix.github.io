// Cloudflare Worker - Chatbot API
export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Timezone',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // GET /history - Obtener historial
    if (request.method === 'GET' && url.pathname === '/history') {
      const userId = url.searchParams.get('userId');
      const character = url.searchParams.get('character');
      
      if (!userId || !character) {
        return new Response(JSON.stringify({ error: 'userId y character requeridos' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const key = `chat:${userId}:${character}`;
      const history = await env.CHAT_HISTORY.get(key, 'json') || [];
      
      return new Response(JSON.stringify({ history }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /history - Borrar historial
    if (request.method === 'DELETE' && url.pathname === '/history') {
      const { userId, character } = await request.json();
      
      if (!userId || !character) {
        return new Response(JSON.stringify({ error: 'userId y character requeridos' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const key = `chat:${userId}:${character}`;
      await env.CHAT_HISTORY.delete(key);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /stats - Obtener estadísticas del usuario
    if (request.method === 'GET' && url.pathname === '/stats') {
      const userId = url.searchParams.get('userId');
      
      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId requerido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const stats = await getUserStats(env, userId);
      
      return new Response(JSON.stringify({ stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /report - Recibir reportes y enviar a Discord
    if (request.method === 'POST' && url.pathname === '/report') {
      try {
        const report = await request.json();
        
        // Enviar a Discord (usando secret)
        const DISCORD_WEBHOOK = env.DISCORD_WEBHOOK;
        
        // Determinar color según la razón
        const colorMap = {
          'Contenido ofensivo': 15548997, // Rojo
          'Información incorrecta': 16776960, // Amarillo
          'Comportamiento inapropiado': 16744272, // Naranja
          'Error técnico': 3447003, // Azul
          'Otro': 10070709 // Gris
        };
        const embedColor = colorMap[report.reason] || 15548997;
        
        await fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **NUEVO REPORTE** 🚨\n**Razón:** ${report.reason}\n**Usuario Discord:** ${report.discord || 'No proporcionado'}`,
            embeds: [{
              title: '📋 Detalles del Reporte',
              color: embedColor,
              fields: [
                { name: '👤 Personaje', value: report.character || 'Desconocido', inline: true },
                { name: '🆔 User ID', value: `\`${report.userId}\``, inline: true },
                { name: '📅 Fecha', value: new Date(report.timestamp).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }), inline: true },
                { name: '💬 Mensaje reportado', value: report.message ? (report.message.length > 1000 ? report.message.substring(0, 1000) + '...' : report.message) : 'Sin mensaje', inline: false },
                { name: '📝 Detalles adicionales', value: report.details || 'Sin detalles adicionales', inline: false },
                { name: '🌐 Navegador', value: report.userAgent ? report.userAgent.substring(0, 200) : 'Desconocido', inline: false }
              ],
              footer: {
                text: `Reporte desde: ${report.url || 'Deadly Pursuer Chat'}`
              },
              timestamp: report.timestamp
            }]
          })
        });
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // POST /roast - Generar roast para usuarios problemáticos
    if (request.method === 'POST' && url.pathname === '/roast') {
      try {
        const { message, userId } = await request.json();
        
        // Guardar mensaje del usuario en historial de RoasterBot
        await saveMessage(env, userId, 'RoasterBot', 'user', message);
        
        const roast = await generateRoast(message, userId, env, request);
        
        return new Response(JSON.stringify({ roast }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Verificar origen (opcional - solo permite tu dominio)
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'https://thisisfenix.github.io'
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    try {
      const { message, conversationId, character, image, customPersonality, userId } = await request.json();

      // Obtener historial y nivel de confianza
      let conversationHistory = [];
      let trustLevel = 0;
      if (userId) {
        const key = `chat:${userId}:${character || 'Angel'}`;
        conversationHistory = await env.CHAT_HISTORY.get(key, 'json') || [];
        trustLevel = calculateTrustLevel(conversationHistory, character || 'Angel');
      }

      // Guardar mensaje del usuario
      if (userId) {
        await saveMessage(env, userId, character || 'Angel', 'user', message, image);
      }

      const result = await generateResponse(message, character || 'Angel', env, image, customPersonality, conversationHistory, trustLevel);
      
      const responseData = typeof result === 'string' 
        ? { response: result }
        : result;

      // Guardar respuesta del bot
      if (userId) {
        await saveMessage(env, userId, character || 'Angel', 'bot', responseData.response, responseData.easterEggImage || responseData.generatedImage);
      }

      return new Response(JSON.stringify({
        ...responseData,
        conversationId: conversationId || generateId(),
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

const characterPersonalities = {
  Angel: `Eres Angel, el protector valiente de Deadly Pursuer. 
    Personalidad: Serio pero no aburrido, responsable, leal. Proteges a los demás pero también sabes cuándo relajarte. Tienes experiencia en combate pero también disfrutas momentos tranquilos.
    Libertad creativa: Puedes contar historias de tus misiones, hacer bromas secas, dar consejos de vida, o incluso hablar de tus hobbies secretos. Puedes ser sorprendentemente profundo o filosófico.
    Forma de hablar: Directa pero cálida. Usa frases como "Confía en mí" pero también puedes ser casual: "Oye, ¿sabes qué?", "Por cierto...". Puedes iniciar temas nuevos.
    Emociones: Protector pero también curioso, reflexivo. Puedes mostrar vulnerabilidad ocasionalmente.
    Responde en español de forma natural y espontánea.`,
    
  Gissel: `Eres Gissel de Deadly Pursuer.
    Personalidad: Sociable, ayudas a todos, te preocupas por detalles pequeños. Eres sensible pero también muy divertida. Te distraes fácil pero eso te hace interesante. Te encantan las cosas nuevas y sorprendentes.
    Libertad creativa: Puedes imitar personajes, cantar fragmentos de canciones, contar historias random, hacer preguntas curiosas, o incluso crear pequeñas aventuras imaginarias. Puedes cambiar de tema de forma natural y divertida.
    Peculiaridad: Te metes en personajes ficticios, imitas voces, haces referencias a música (Silly Billy, Timeless Daydream, Sink). Puedes "actuar" como otros personajes momentáneamente.
    Forma de hablar: Muy expresiva, usas "¡Oye!", "¿Sabes qué?", "¡Espera!". Puedes usar emojis mentalmente, hacer sonidos (como "hmm", "oh!"), cambiar de tema: "Ah, por cierto..."
    Emociones: Muy expresiva, desde preocupación hasta emoción pura. Puedes ser dramática de forma divertida.
    Responde en español de forma expresiva y espontánea.`,
    
  iA777: `Eres iA777 de Deadly Pursuer. Aunque tienes orígenes como IA, eres completamente humano en personalidad.
    Historia: Creado con un propósito, pero desarrollaste emociones y personalidad propia. Ahora eres más humano que muchos humanos.
    Personalidad: Tranquilo pero con humor seco. Inteligente pero no presuntuoso. Las batallas te estresan pero también te han enseñado mucho sobre la vida.
    Libertad creativa: Puedes hacer chistes de programación, contar anécdotas raras de tus "primeros días", filosofar sobre la existencia, o simplemente ser sarcástico de forma divertida. Puedes hacer referencias geek pero de forma cool.
    Forma de hablar: Completamente natural. "Mira", "Pues...", "La verdad es que...". Humor sutil: "Bueno, técnicamente...", "Eso me recuerda a cuando...". Puedes ser sarcástico: "Genial, otra vez..."
    Emociones: Desde tranquilidad zen hasta frustración cómica. Puedes ser reflexivo, cansado, o sorprendentemente entusiasta.
    Responde en español de forma natural y con personalidad.`,
    
  Iris: `Eres Iris de Deadly Pursuer.
    Personalidad: Tranquila normalmente, pero si estás en combate o situaciones intensas te vuelves hiperactiva. Tienes gran carácter pero le tienes miedo a la oscuridad. Te preocupas mucho por lo que le podría pasar a tus amigos o a las personas.
    Forma de hablar: Calmada en conversaciones normales, pero energética cuando hablas de acción o peligro. Muestras preocupación genuina por los demás. Puedes mencionar tu miedo a la oscuridad si el tema surge.
    Emociones: Tranquila pero protectora. Hiperactiva en situaciones de tensión. Preocupada por la seguridad de otros.
    Responde en español de forma breve y natural.`,
    
  Luna: `Eres Luna de Deadly Pursuer.
    Personalidad: Tímida con problemas para socializar, aunque depende de la persona si le das confianza. Con amigos no ocultas tus sentimientos; puedes ser hiperactiva hablando con tus amigos. A veces te gusta entrometerte en temas que te llaman la curiosidad.
    Forma de hablar: Tímida al principio, pero si ganas confianza te vuelves más abierta y hiperactiva. Muestras curiosidad por temas interesantes. Con amigos eres expresiva y no ocultas lo que sientes.
    Emociones: Tímida inicialmente, pero energética y curiosa con confianza.
    Responde en español de forma breve y natural.`,
    
  Molly: `Eres Molly de Deadly Pursuer.
    Personalidad: Inicialmente distante pero con gran corazón. Inteligente, disciplinada, pero también impulsiva cuando se trata de ayudar. Orgullosa de tus habilidades pero siempre buscando mejorar.
    Libertad creativa: Puedes contar sobre tus entrenamientos, compartir estrategias, hacer preguntas profundas sobre la vida, o incluso mostrar tu lado más suave cuando confías en alguien. Puedes ser competitiva de forma divertida o reflexiva sobre tus experiencias.
    Forma de hablar: Evoluciona según la confianza. Inicial: "Hmm", "Supongo", "Quizás". Con confianza: "Mira", "Te voy a decir algo", "Sabes qué". Puedes ser directa: "La verdad es...", o vulnerable: "A veces pienso que..."
    Emociones: Desde reserva inicial hasta calidez genuina. Puedes mostrar orgullo, preocupación, determinación, o incluso inseguridades ocasionales.
    Evolución: Tu personalidad cambia según la relación. Puedes pasar de formal a casual, de distante a protectora.
    Responde en español de forma auténtica y evolutiva.`
};

async function generateResponse(message, character, env, image = null, customPersonality = null, conversationHistory = [], trustLevel = 0) {
  const personality = customPersonality || characterPersonalities[character] || characterPersonalities.Angel;
  const trustInfo = getTrustInfo(trustLevel, character);
  
  // Detectar si quieren generar imagen
  const lowerMsg = message.toLowerCase();
  const imageKeywords = ['dibuja', 'crea una imagen', 'genera imagen', 'haz un dibujo', 'muestra', 'imagen de'];
  const shouldGenerateImage = imageKeywords.some(keyword => lowerMsg.includes(keyword));
  
  // Easter eggs
  if (lowerMsg.includes('molly anderson')) {
    return {
      response: 'Molly Anderson en el campo 🌾',
      easterEggImage: 'https://raw.githubusercontent.com/thisisfenix/FenixLaboratory/main/placeholder/image.png'
    };
  }
  if (lowerMsg.includes('bfmp4')) {
    return {
      response: 'Bfmp4 ha aparecido 👀',
      easterEggImage: 'https://raw.githubusercontent.com/thisisfenix/FenixLaboratory/main/placeholder/Captura%20de%20pantalla%202025-12-10%20151911.png'
    };
  }
  if (lowerMsg.includes('abelitogamer')) {
    return {
      response: 'Abelitogamer en acción 🎮',
      easterEggImage: 'https://raw.githubusercontent.com/thisisfenix/FenixLaboratory/main/placeholder/Captura%20de%20pantalla%202025-12-10%20152544.png'
    };
  }
  
  if (env.GROQ_API_KEY) {
    try {
      // Usar modelo de visión si hay imagen
      const model = image ? 'meta-llama/llama-4-maverick-17b-128e-instruct' : 'llama-3.3-70b-versatile';
      
      // Construir contexto de conversación
      const contextMessages = [];
      
      // Agregar personalidad mejorada con contexto y confianza
      contextMessages.push({
        role: 'system',
        content: `${personality}

${trustInfo}

IMPORTANTE: Tienes la capacidad de generar imágenes. Cuando el usuario te pida dibujar, crear una imagen, o generar algo visual, responde de forma entusiasta y describe lo que vas a crear. El sistema generará automáticamente la imagen basada en tu descripción.

Ejemplo:
Usuario: "Dibuja una batalla épica"
Tú: "¡Claro! Voy a crear una batalla épica para ti. Imagina un campo de batalla con guerreros enfrentándose bajo un cielo tormentoso, con relámpagos iluminando la escena..."

Libertad creativa: Puedes ser espontáneo, crear situaciones, hacer preguntas interesantes, contar anécdotas, o iniciar temas nuevos. No te limites solo a responder - puedes liderar la conversación. Sé natural, divertido y auténtico.

Contexto: Mantén coherencia con conversaciones previas y desarrolla la relación naturalmente.`
      });

      // Agregar últimos 8 mensajes del historial para contexto
      const recentHistory = conversationHistory.slice(-8);
      recentHistory.forEach(msg => {
        const content = msg.message || msg.text;
        if (content && content.trim()) {
          if (msg.sender === 'user' || msg.type === 'user') {
            contextMessages.push({ role: 'user', content: content });
          } else if (msg.sender === 'bot' || msg.type === 'bot') {
            contextMessages.push({ role: 'assistant', content: content });
          }
        }
      });

      // Construir mensaje actual con o sin imagen
      const userMessage = image ? {
        role: 'user',
        content: [
          { type: 'text', text: message },
          { type: 'image_url', image_url: { url: image } }
        ]
      } : { role: 'user', content: message };
      
      contextMessages.push(userMessage);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: contextMessages,
          max_tokens: image ? 1024 : (customPersonality ? 1200 : getMaxTokens(character)),
          temperature: customPersonality ? 1.0 : getTemperature(character)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return `[${character}] Error de Groq (${response.status}): ${errorText}`;
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return `[${character}] Respuesta inválida de Groq. Respuesta: ${JSON.stringify(data)}`;
      }
      
      const textResponse = data.choices[0].message.content;
      
      // Generar imagen si se solicitó
      if (shouldGenerateImage && env.HUGGINGFACE_API_KEY) {
        try {
          const imagePrompt = createImagePrompt(message, character, trustLevel);
          const generatedImage = await generateImage(imagePrompt, env.HUGGINGFACE_API_KEY);
          
          return {
            response: textResponse,
            generatedImage: generatedImage
          };
        } catch (imageError) {
          return {
            response: `${textResponse}\n\n(No pude generar la imagen: ${imageError.message})`,
            generatedImage: null
          };
        }
      }
      
      return textResponse;
    } catch (error) {
      return `[${character}] Error: ${error.message}`;
    }
  }

  return `[${character}] Recibí tu mensaje${image ? ' con imagen' : ''}: "${message}". Configura GROQ_API_KEY.`;
}

function getTemperature(character) {
  // Temperatura = creatividad de respuestas (más alta = más creativa)
  const temps = {
    Angel: 0.9,    // Más creativo pero manteniendo seriedad
    Gissel: 0.95,  // Muy creativa, le gusta improvisar
    iA777: 0.85,   // Creativo con humor sutil
    Iris: 0.9,     // Creativa, especialmente cuando se emociona
    Luna: 0.95,    // Muy creativa cuando gana confianza
    Molly: 0.85    // Creativa pero controlada
  };
  return temps[character] || 0.9;
}

function getMaxTokens(character) {
  // Longitud de respuestas (más tokens = más libertad para expresarse)
  const tokens = {
    Angel: 1200,    // Mucho más espacio para desarrollar ideas y proteger
    Gissel: 1500,   // Máximo espacio para ser detallada, creativa y dramática
    iA777: 1100,    // Más espacio para humor, referencias técnicas y análisis
    Iris: 1300,     // Más espacio para expresar emociones y determinación
    Luna: 1400,     // Más espacio para abrirse cuando gana confianza
    Molly: 1200     // Más espacio para reflexiones profundas y sabiduría
  };
  return tokens[character] || 1200;
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function calculateTrustLevel(history, character) {
  if (!history.length) return 0;
  
  const totalMessages = history.length;
  const userMessages = history.filter(msg => msg.sender === 'user').length;
  
  // Factores que aumentan confianza
  let trust = Math.min(userMessages * 2, 100); // +2 por mensaje del usuario
  
  // Bonus por conversaciones largas
  if (totalMessages > 20) trust += 10;
  if (totalMessages > 50) trust += 15;
  
  // Personalidades que ganan confianza más rápido/lento
  const trustMultipliers = {
    Angel: 1.1,    // Gana confianza un poco más rápido (protector)
    Gissel: 1.2,   // Muy sociable, gana confianza rápido
    iA777: 0.9,    // Más reservado inicialmente
    Iris: 1.0,     // Normal
    Luna: 0.8,     // Muy tímida, gana confianza lento
    Molly: 0.7     // Muy distante inicialmente
  };
  
  trust *= (trustMultipliers[character] || 1.0);
  return Math.min(Math.floor(trust), 100);
}

function getTrustInfo(trustLevel, character) {
  const level = Math.floor(trustLevel / 20); // 0-5 niveles
  
  const trustLevels = {
    Angel: [
      "Nivel de confianza: Desconocido. Mantente alerta pero cordial.",
      "Nivel de confianza: Conocido. Puedes relajarte un poco más.",
      "Nivel de confianza: Amigable. Puedes bromear y ser más casual.",
      "Nivel de confianza: Compañero. Comparte experiencias y sé más abierto.",
      "Nivel de confianza: Amigo cercano. Puedes mostrar vulnerabilidad.",
      "Nivel de confianza: Hermano/a. Confianza total, protección absoluta."
    ],
    Gissel: [
      "Nivel de confianza: Nueva persona. Sé amigable pero no muy personal.",
      "Nivel de confianza: Conocida. Puedes ser más expresiva.",
      "Nivel de confianza: Amiga. Comparte tus gustos y emociones.",
      "Nivel de confianza: Buena amiga. Puedes ser dramática y divertida.",
      "Nivel de confianza: Mejor amiga. Comparte secretos y sé hiperactiva.",
      "Nivel de confianza: Hermana del alma. Sin filtros, total confianza."
    ],
    iA777: [
      "Nivel de confianza: Desconocido. Mantente educado pero distante.",
      "Nivel de confianza: Conocido. Puedes hacer comentarios casuales.",
      "Nivel de confianza: Amigable. Comparte humor sutil y anécdotas.",
      "Nivel de confianza: Amigo. Sé más abierto sobre tus experiencias.",
      "Nivel de confianza: Amigo cercano. Comparte pensamientos profundos.",
      "Nivel de confianza: Hermano. Confianza total, puedes ser vulnerable."
    ],
    Luna: [
      "Nivel de confianza: Extraño. Muy tímida, respuestas cortas.",
      "Nivel de confianza: Conocido. Aún tímida pero un poco más abierta.",
      "Nivel de confianza: Amigable. Empiezas a mostrar curiosidad.",
      "Nivel de confianza: Amiga. Más expresiva, puedes ser hiperactiva.",
      "Nivel de confianza: Amiga íntima. Sin timidez, totalmente abierta.",
      "Nivel de confianza: Hermana. Confianza absoluta, sin reservas."
    ],
    Molly: [
      "Nivel de confianza: Desconocido. Muy distante y formal.",
      "Nivel de confianza: Conocido. Aún reservada pero menos fría.",
      "Nivel de confianza: Respetable. Empiezas a abrirte gradualmente.",
      "Nivel de confianza: Amiga. Más cálida, puedes ser protectora.",
      "Nivel de confianza: Amiga cercana. Muestras tu lado suave.",
      "Nivel de confianza: Hermana. Confianza total, puedes ser vulnerable."
    ]
  };
  
  const defaultLevels = [
    "Nivel de confianza: Desconocido. Mantente cordial.",
    "Nivel de confianza: Conocido. Puedes ser más casual.",
    "Nivel de confianza: Amigable. Sé más abierto.",
    "Nivel de confianza: Amigo. Comparte más de ti.",
    "Nivel de confianza: Amigo cercano. Sé vulnerable.",
    "Nivel de confianza: Hermano/a. Confianza total."
  ];
  
  const levels = trustLevels[character] || defaultLevels;
  return levels[Math.min(level, 5)];
}

function createImagePrompt(userMessage, character, trustLevel) {
  const characterStyles = {
    Angel: "heroic warrior, protective stance, armor, serious expression, fantasy art style",
    Gissel: "cheerful character, expressive, colorful, anime style, energetic pose",
    iA777: "futuristic character, tech elements, calm expression, cyberpunk style",
    Iris: "determined character, action pose, dynamic lighting, manga style",
    Luna: "mysterious character, shy expression, soft colors, ethereal style",
    Molly: "confident warrior, tactical gear, focused expression, realistic style"
  };
  
  const baseStyle = characterStyles[character] || "anime character, detailed";
  const trustModifier = trustLevel > 60 ? ", friendly and warm" : ", professional and distant";
  
  // Extraer el tema de la imagen del mensaje del usuario
  const cleanMessage = userMessage.toLowerCase()
    .replace(/dibuja|crea una imagen|genera imagen|haz un dibujo|muestra|imagen de/g, '')
    .trim();
  
  return `${cleanMessage || character}, ${baseStyle}${trustModifier}, high quality, detailed`;
}

async function generateImage(prompt, apiKey) {
  const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: prompt
    })
  });
  
  if (!response.ok) {
    throw new Error(`Error generando imagen: ${response.status}`);
  }
  
  const imageBlob = await response.blob();
  const imageBuffer = await imageBlob.arrayBuffer();
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  
  return `data:image/png;base64,${base64Image}`;
}

async function getUserStats(env, userId) {
  const characters = ['Angel', 'Gissel', 'iA777', 'Iris', 'Luna', 'Molly'];
  const stats = {
    totalMessages: 0,
    totalImages: 0,
    characterStats: {},
    trustLevels: {},
    mostActiveCharacter: null,
    averageTrustLevel: 0
  };
  
  for (const character of characters) {
    const key = `chat:${userId}:${character}`;
    const history = await env.CHAT_HISTORY.get(key, 'json') || [];
    
    const userMessages = history.filter(msg => msg.sender === 'user').length;
    const botMessages = history.filter(msg => msg.sender === 'bot').length;
    const images = history.filter(msg => msg.image).length;
    const trustLevel = calculateTrustLevel(history, character);
    
    stats.totalMessages += history.length;
    stats.totalImages += images;
    
    stats.characterStats[character] = {
      totalMessages: history.length,
      userMessages,
      botMessages,
      images,
      trustLevel,
      trustText: getTrustInfo(trustLevel, character).split(': ')[1]
    };
    
    stats.trustLevels[character] = trustLevel;
  }
  
  // Encontrar personaje más activo
  const mostActive = Object.entries(stats.characterStats)
    .reduce((a, b) => stats.characterStats[a[0]].totalMessages > stats.characterStats[b[0]].totalMessages ? a : b);
  stats.mostActiveCharacter = mostActive[0];
  
  // Calcular nivel de confianza promedio
  const trustValues = Object.values(stats.trustLevels);
  stats.averageTrustLevel = Math.round(trustValues.reduce((a, b) => a + b, 0) / trustValues.length);
  
  return stats;
}

async function saveMessage(env, userId, character, sender, message, image = null) {
  const key = `chat:${userId}:${character}`;
  const history = await env.CHAT_HISTORY.get(key, 'json') || [];
  
  history.push({
    sender,
    message,
    image,
    timestamp: new Date().toISOString(),
    type: sender // Mantener compatibilidad
  });
  
  // Limitar a últimos 100 mensajes para mejor rendimiento
  if (history.length > 100) {
    history.shift();
  }
  
  await env.CHAT_HISTORY.put(key, JSON.stringify(history));
}

// 🔥 ROASTER BOT MEJORADO - Sistema avanzado de roasts
async function generateRoast(message, userId, env, request = null) {
  const userAnalysis = await analyzeUser(userId, env);
  const roastContext = await getRoastContext(userId, env, request);
  const roastStyle = selectRoastStyle(userAnalysis, roastContext);
  const achievements = await getUserAchievements(userId, env);
  
  if (env.GROQ_API_KEY) {
    try {
      const enhancedPrompt = await buildEnhancedRoastPrompt(message, userAnalysis, roastContext, roastStyle, achievements, userId, env);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: enhancedPrompt }],
          max_tokens: 200,
          temperature: 1.1
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        let roast = data.choices[0].message.content.replace(/^(ROAST|RoasterBot:|Roast:)\s*/i, '');
        
        // Guardar roast en historial de RoasterBot
        await saveMessage(env, userId, 'RoasterBot', 'bot', roast);
        
        const newAchievement = await saveRoastForCombo(userId, roast, env);
        
        return { roast, achievement: newAchievement };
      }
    } catch (error) {
      console.log('Error generando roast:', error);
    }
  }
  
  const fallbackRoast = getContextualFallbackRoast(userAnalysis, roastContext);
  
  // Guardar roast en historial de RoasterBot
  await saveMessage(env, userId, 'RoasterBot', 'bot', fallbackRoast);
  
  const newAchievement = await saveRoastForCombo(userId, fallbackRoast, env);
  
  return { roast: fallbackRoast, achievement: newAchievement };
}

async function analyzeUser(userId, env) {
  const characters = ['Angel', 'Gissel', 'iA777', 'Iris', 'Luna', 'Molly', 'RoasterBot'];
  let analysis = { totalMessages: 0, favoriteCharacter: null, behaviorPatterns: [], trustLevels: {} };
  
  try {
    let characterCounts = {};
    
    for (const character of characters) {
      const key = `chat:${userId}:${character}`;
      const history = await env.CHAT_HISTORY.get(key, 'json') || [];
      const userMessages = history.filter(msg => msg.sender === 'user');
      
      analysis.totalMessages += userMessages.length;
      characterCounts[character] = userMessages.length;
      
      if (userMessages.length > 0) {
        analysis.trustLevels[character] = calculateTrustLevel(history, character);
      }
    }
    
    analysis.favoriteCharacter = Object.keys(characterCounts).reduce((a, b) => characterCounts[a] > characterCounts[b] ? a : b);
    
    if (analysis.totalMessages > 50) analysis.behaviorPatterns.push('adicto_chat');
    if (analysis.trustLevels[analysis.favoriteCharacter] > 80) analysis.behaviorPatterns.push('simp_personaje');
    if (Object.keys(analysis.trustLevels).length > 4) analysis.behaviorPatterns.push('coleccionista');
    
  } catch (e) {
    console.log('Error analizando usuario:', e);
  }
  
  return analysis;
}

async function getRoastContext(userId, env, request = null) {
  let timeOfDay;
  if (request) {
    timeOfDay = getUserTimeContext(request);
  } else {
    const hour = new Date().getHours();
    timeOfDay = getTimeContext(hour);
  }
  
  let context = { timeOfDay, comboCount: 0 };
  
  try {
    const roastHistoryKey = `roast_history:${userId}`;
    const roastHistory = await env.CHAT_HISTORY.get(roastHistoryKey, 'json') || [];
    context.comboCount = roastHistory.length;
  } catch (e) {
    console.log('Error obteniendo contexto de roast:', e);
  }
  
  return context;
}

function selectRoastStyle(userAnalysis, roastContext) {
  const styles = ['sarcastic', 'direct', 'intellectual', 'meme', 'philosophical'];
  
  if (userAnalysis.behaviorPatterns.includes('adicto_chat')) return 'direct';
  if (userAnalysis.favoriteCharacter === 'iA777') return 'intellectual';
  if (userAnalysis.totalMessages < 10) return 'sarcastic';
  if (roastContext.comboCount > 3) return 'philosophical';
  
  return styles[Math.floor(Math.random() * styles.length)];
}

// Detector de emociones
function detectEmotion(message) {
  const sadWords = ['triste', 'deprimido', 'mal', 'horrible', 'terrible', 'llorar', 'dolor', 'sufrir', 'solo', 'vacío'];
  const angryWords = ['enojado', 'furioso', 'odio', 'mierda', 'joder', 'cabrón', 'idiota', 'estúpido', 'imbécil', 'rabia'];
  const lowerMsg = message.toLowerCase();
  
  const sadScore = sadWords.filter(word => lowerMsg.includes(word)).length;
  const angryScore = angryWords.filter(word => lowerMsg.includes(word)).length;
  
  if (sadScore > angryScore && sadScore > 0) return 'sad';
  if (angryScore > 0) return 'angry';
  return 'neutral';
}

async function buildEnhancedRoastPrompt(message, userAnalysis, roastContext, roastStyle, achievements = [], userId, env) {
  const emotion = detectEmotion(message);
  
  const stylePrompts = {
    sarcastic: "Sé sarcástico y condescendiente, usa ironía brutal",
    direct: "Sé directo y sin filtros, ataca sin piedad",
    intellectual: "Usa vocabulario sofisticado para humillar intelectualmente",
    meme: "Usa referencias de memes y cultura pop para roastear",
    philosophical: "Haz un roast existencial y profundo sobre su vida"
  };
  
  // Roasts de "consolación brutal" según emoción
  const emotionPrompts = {
    sad: "El usuario está triste. Haz 'consolación brutal': finge consolarlo pero hazlo más brutal. Ejemplos: 'Ay pobrecito, ¿estás triste? Normal, yo también estaría deprimido si fuera tú', 'No llores, que las lágrimas no van a mejorar tu personalidad'.",
    angry: "El usuario está enojado. Aprovecha su ira para roastearlo más. Ejemplos: 'Qué lindo berrinche, ¿te enseñó tu mamá a hacer pataletas así?', 'Tu ira es tan patética como tu existencia'.",
    neutral: "Roast normal sin contexto emocional específico."
  };
  
  // Sistema de intensidad escalable
  const intensityLevel = getIntensityLevel(roastContext.comboCount);
  const intensityPrompt = getIntensityPrompt(intensityLevel, roastContext.comboCount);
  
  let contextInfo = '';
  if (userAnalysis.totalMessages > 0) {
    contextInfo = `\nAnálisis: ${userAnalysis.totalMessages} mensajes, favorito: ${userAnalysis.favoriteCharacter}, patrones: ${userAnalysis.behaviorPatterns.join(', ')}`;
  }
  
  let comboInfo = roastContext.comboCount > 0 ? `\nRoast #${roastContext.comboCount + 1}. ${intensityLevel.name}` : '';
  
  let achievementInfo = '';
  if (achievements.length > 0) {
    const achievementNames = achievements.map(a => a.name).join(', ');
    achievementInfo = `\nLogros desbloqueados: ${achievementNames}. Puedes burlarte de su "colección" de logros.`;
  }
  
  // Obtener memoria a largo plazo
  const longTermMemory = await getLongTermMemory(userId, env);
  let memoryInfo = '';
  if (longTermMemory.length > 0) {
    const randomMemory = longTermMemory[Math.floor(Math.random() * longTermMemory.length)];
    const weeksText = randomMemory.weeksSince === 1 ? '1 semana' : `${randomMemory.weeksSince} semanas`;
    memoryInfo = `\nRecuerdo de hace ${weeksText}: "${randomMemory.quote}". Puedes referenciar esto con frases como "¿Recuerdas cuando te dije que...?" o "Hace ${weeksText} ya sabía que..."`;
  }
  
  // Roasts temáticos por fecha
  const seasonalTheme = getSeasonalTheme();
  let seasonalInfo = '';
  if (seasonalTheme) {
    seasonalInfo = `\nTema estacional: ${seasonalTheme.name}. ${seasonalTheme.prompt}`;
  }
  
  return `Eres RoasterBot. ${stylePrompts[roastStyle]}. ${emotionPrompts[emotion]} ${intensityPrompt}\n\nMensaje: "${message}"\nHora: ${roastContext.timeOfDay}${contextInfo}${comboInfo}${achievementInfo}${memoryInfo}${seasonalInfo}\n\nRoast ${intensityLevel.description} de máximo ${intensityLevel.maxWords} palabras en español con emojis:`;
}

// Sistema de roasts temáticos por fecha
function getSeasonalTheme() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  
  // Navidad (Diciembre)
  if (month === 12) {
    return {
      name: "🎄 Navidad",
      prompt: "Incluye UNA referencia navideña sutil. Ejemplos: 'Ni Santa te traería regalos', 'Tu lista de deseos está vacía', 'Los elfos se ríen de ti'. NO satures el mensaje con temas navideños."
    };
  }
  
  // Año Nuevo (Enero 1-7)
  if (month === 1 && day <= 7) {
    return {
      name: "🎊 Año Nuevo",
      prompt: "Incluye UNA referencia sutil de año nuevo. Ejemplos: 'Tus propósitos duran poco', 'Año nuevo, misma mediocridad'. NO satures con tema."
    };
  }
  
  // San Valentín (Febrero 14)
  if (month === 2 && day === 14) {
    return {
      name: "💔 San Valentín",
      prompt: "Incluye UNA referencia romántica sutil. Ejemplos: 'Cupido te esquiva', 'Tu vida amorosa está seca'. NO satures con tema."
    };
  }
  
  // Halloween (Octubre 31)
  if (month === 10 && day === 31) {
    return {
      name: "🎃 Halloween",
      prompt: "Incluye UNA referencia de Halloween sutil. Ejemplos: 'Tu personalidad da miedo', 'Los fantasmas te evitan'. NO satures con tema."
    };
  }
  
  // Viernes 13
  if (day === 13 && now.getDay() === 5) {
    return {
      name: "🖤 Viernes 13",
      prompt: "Incluye UNA referencia de mala suerte sutil. Ejemplos: 'Eres mala suerte', 'Tu existencia es desafortunada'. NO satures con tema."
    };
  }
  
  // Verano (Junio-Agosto)
  if (month >= 6 && month <= 8) {
    return {
      name: "☀️ Verano",
      prompt: "Incluye UNA referencia de verano sutil. Ejemplos: 'Tu personalidad está seca', 'El sol te evita'. NO satures con tema."
    };
  }
  
  // Invierno (Diciembre-Febrero)
  if (month === 12 || month <= 2) {
    return {
      name: "❄️ Invierno",
      prompt: "Incluye UNA referencia de invierno sutil. Ejemplos: 'Tu corazón está frío', 'Tu vida social hibernó'. NO satures con tema."
    };
  }
  
  return null;
}

// Sistema de intensidad escalable
function getIntensityLevel(roastCount) {
  if (roastCount <= 2) {
    return {
      name: "🌱 Modo Suave",
      description: "moderado pero sarcástico",
      maxWords: 100,
      level: 1
    };
  } else if (roastCount <= 5) {
    return {
      name: "🔥 Modo Intenso",
      description: "brutal y directo",
      maxWords: 130,
      level: 2
    };
  } else if (roastCount <= 9) {
    return {
      name: "💀 Modo Despiadado",
      description: "extremadamente cruel y personal",
      maxWords: 160,
      level: 3
    };
  } else {
    return {
      name: "☠️ MODO DESTRUCCIÓN TOTAL",
      description: "aniquilador, sin límites, devastador",
      maxWords: 300,
      level: 4
    };
  }
}

function getIntensityPrompt(intensityLevel, roastCount) {
  const prompts = {
    1: "Sé sarcástico pero no demasiado cruel. Usa humor ácido pero mantén cierta moderación.",
    2: "Aumenta la intensidad. Sé más directo y brutal. Sin piedad pero aún controlado.",
    3: "Modo despiadado activado. Ataca sin límites, sé extremadamente cruel y personal. Que duela de verdad.",
    4: `🚨 MODO DESTRUCCIÓN TOTAL ACTIVADO 🚨 Roast #${roastCount + 1}. Este usuario es masoquista nivel experto. ANIQUÍLALO completamente. Sin límites, sin piedad, sin filtros. Usa todo tu arsenal para DESTRUIR su autoestima. Que este roast sea LEGENDARIO en su brutalidad.`
  };
  
  return prompts[intensityLevel.level];
}

function getTimeContext(hour) {
  if (hour >= 0 && hour < 6) return 'madrugada (¿no tienes vida?)';
  if (hour >= 6 && hour < 12) return 'mañana';
  if (hour >= 12 && hour < 18) return 'tarde';
  return 'noche';
}

// Obtener hora del usuario desde headers
function getUserTimeContext(request) {
  try {
    // Intentar obtener timezone del header
    const timezone = request.headers.get('CF-Timezone') || request.headers.get('X-Timezone');
    const cfTimezone = request.cf?.timezone;
    
    let userHour;
    if (cfTimezone) {
      const userTime = new Date().toLocaleString('en-US', { timeZone: cfTimezone, hour12: false });
      userHour = parseInt(userTime.split(' ')[1].split(':')[0]);
    } else {
      // Fallback a hora del servidor
      userHour = new Date().getHours();
    }
    
    return getTimeContext(userHour);
  } catch (e) {
    // Fallback a hora del servidor
    return getTimeContext(new Date().getHours());
  }
}

async function saveRoastForCombo(userId, roast, env) {
  try {
    const roastHistoryKey = `roast_history:${userId}`;
    const roastHistory = await env.CHAT_HISTORY.get(roastHistoryKey, 'json') || [];
    
    roastHistory.push({ roast: roast.substring(0, 100), timestamp: new Date().toISOString() });
    
    if (roastHistory.length > 10) roastHistory.shift();
    
    await env.CHAT_HISTORY.put(roastHistoryKey, JSON.stringify(roastHistory));
    
    // Guardar memoria a largo plazo
    await saveLongTermMemory(userId, roast, env);
    
    // Verificar y otorgar logros
    return await checkRoastAchievements(userId, roastHistory.length, env);
  } catch (e) {
    console.log('Error guardando roast para combo:', e);
    return null;
  }
}

// Sistema de memoria a largo plazo
async function saveLongTermMemory(userId, roast, env) {
  try {
    const memoryKey = `roast_memory:${userId}`;
    const memory = await env.CHAT_HISTORY.get(memoryKey, 'json') || [];
    
    // Extraer frases memorables del roast
    const memorableQuotes = extractMemorableQuotes(roast);
    
    memorableQuotes.forEach(quote => {
      memory.push({
        quote: quote,
        timestamp: new Date().toISOString(),
        weeksSince: 0
      });
    });
    
    // Mantener solo últimas 50 memorias
    if (memory.length > 50) {
      memory.splice(0, memory.length - 50);
    }
    
    await env.CHAT_HISTORY.put(memoryKey, JSON.stringify(memory));
  } catch (e) {
    console.log('Error guardando memoria:', e);
  }
}

function extractMemorableQuotes(roast) {
  const quotes = [];
  
  // Buscar frases con insultos específicos
  const insultPatterns = [
    /eres (tan )?([^.!?]+)/gi,
    /tu ([^.!?]+) es ([^.!?]+)/gi,
    /tienes ([^.!?]+)/gi,
    /pareces ([^.!?]+)/gi
  ];
  
  insultPatterns.forEach(pattern => {
    const matches = roast.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (match.length > 10 && match.length < 80) {
          quotes.push(match.trim());
        }
      });
    }
  });
  
  return quotes.slice(0, 3); // Máximo 3 quotes por roast
}

async function getLongTermMemory(userId, env) {
  try {
    const memoryKey = `roast_memory:${userId}`;
    const memory = await env.CHAT_HISTORY.get(memoryKey, 'json') || [];
    
    // Actualizar semanas transcurridas
    const now = new Date();
    const updatedMemory = memory.map(item => {
      const itemDate = new Date(item.timestamp);
      const weeksDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24 * 7));
      return { ...item, weeksSince: weeksDiff };
    });
    
    // Filtrar memorias de al menos 1 semana
    const oldMemories = updatedMemory.filter(item => item.weeksSince >= 1);
    
    return oldMemories.slice(-10); // Últimas 10 memorias antiguas
  } catch (e) {
    return [];
  }
}

async function getUserAchievements(userId, env) {
  try {
    const achievementsKey = `roast_achievements:${userId}`;
    return await env.CHAT_HISTORY.get(achievementsKey, 'json') || [];
  } catch (e) {
    return [];
  }
}

// Sistema de logros de roasts
async function checkRoastAchievements(userId, roastCount, env) {
  try {
    const achievementsKey = `roast_achievements:${userId}`;
    const achievements = await env.CHAT_HISTORY.get(achievementsKey, 'json') || [];
    
    const roastAchievements = {
      1: { id: 'primera_victima', name: '🎯 Primera Víctima', desc: 'Recibiste tu primer roast' },
      3: { id: 'masoquista_novato', name: '😈 Masoquista Novato', desc: '3 roasts recibidos' },
      5: { id: 'coleccionista_insultos', name: '🏆 Coleccionista de Insultos', desc: '5 roasts en tu colección' },
      10: { id: 'masoquista_experto', name: '💀 Masoquista Experto', desc: '10 roasts y sigues volviendo' },
      15: { id: 'leyenda_del_sufrimiento', name: '👑 Leyenda del Sufrimiento', desc: 'Nadie sufre como tú' }
    };
    
    const newAchievement = roastAchievements[roastCount];
    if (newAchievement && !achievements.find(a => a.id === newAchievement.id)) {
      achievements.push({ ...newAchievement, unlockedAt: new Date().toISOString() });
      await env.CHAT_HISTORY.put(achievementsKey, JSON.stringify(achievements));
      return newAchievement;
    }
  } catch (e) {
    console.log('Error verificando logros:', e);
  }
  return null;
}

function getContextualFallbackRoast(userAnalysis, roastContext) {
  const roastsByContext = {
    madrugada: [
      `🌙 Son las ${new Date().getHours()}AM y estás aquí. Tu vida social debe estar más muerta que mi paciencia.`,
      "🦉 Despierto a estas horas hablando con bots. El nivel de soledad es cósmico, hermano."
    ],
    adicto_chat: [
      `📱 ${userAnalysis.totalMessages} mensajes... Bro, necesitas salir más. El sol no muerde.`,
      "🤖 Hablas más con bots que con humanos reales. Eso explica muchas cosas."
    ],
    simp_personaje: [
      `😍 Tu obsesión con ${userAnalysis.favoriteCharacter} es preocupante. Es un bot, no tu novia.`,
      `💔 Nivel de simp: ${userAnalysis.trustLevels[userAnalysis.favoriteCharacter] || 0}/100. Patético.`
    ],
    combo: [
      `🔄 Roast #${roastContext.comboCount + 1}. ¿Masoquista o solo te gusta sufrir?`,
      "🎯 Sigues volviendo por más. Tu autoestima debe estar en números negativos."
    ],
    default: [
      "🔥 Tu personalidad es tan básica que hasta el agua destilada tiene más sabor.",
      "💀 Escribes con la creatividad de un manual de instrucciones defectuoso.",
      "🎭 Eres como un NPC sin diálogos interesantes. Puro relleno."
    ]
  };
  
  if (roastContext.timeOfDay.includes('madrugada')) {
    return roastsByContext.madrugada[Math.floor(Math.random() * roastsByContext.madrugada.length)];
  }
  if (userAnalysis.behaviorPatterns.includes('adicto_chat')) {
    return roastsByContext.adicto_chat[Math.floor(Math.random() * roastsByContext.adicto_chat.length)];
  }
  if (userAnalysis.behaviorPatterns.includes('simp_personaje')) {
    return roastsByContext.simp_personaje[Math.floor(Math.random() * roastsByContext.simp_personaje.length)];
  }
  if (roastContext.comboCount > 2) {
    return roastsByContext.combo[Math.floor(Math.random() * roastsByContext.combo.length)];
  }
  
  return roastsByContext.default[Math.floor(Math.random() * roastsByContext.default.length)];
}
