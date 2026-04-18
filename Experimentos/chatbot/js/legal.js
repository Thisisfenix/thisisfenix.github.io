// Canal de Términos y Condiciones + Privacidad
function getLegalHTML() {
  return `
    <div class="message bot">
      <strong>📜 Términos y Condiciones</strong><br><br>
      
      <strong>1. Aceptación de Términos</strong><br>
      Al usar este chatbot, aceptas estos términos. Si no estás de acuerdo, no uses el servicio.<br><br>
      
      <strong>2. Uso del Servicio</strong><br>
      • Este es un proyecto personal y educativo<br>
      • El servicio se proporciona "tal cual" sin garantías<br>
      • No uses el chatbot para actividades ilegales o dañinas<br>
      • No intentes hackear o romper el sistema<br>
      • Respeta los límites de uso (rate limiting)<br><br>
      
      <strong>3. Contenido Generado por IA</strong><br>
      • Las respuestas son generadas por IA (Groq/Llama 3.3 70B)<br>
      • El contenido puede ser inexacto o inapropiado<br>
      • No tomes las respuestas como consejo profesional<br>
      • Los personajes son ficticios de Deadly Pursuer<br>
      • Las imágenes son generadas por Stable Diffusion XL<br><br>
      
      <strong>4. Propiedad Intelectual</strong><br>
      • Los personajes de Deadly Pursuer y sus assets son propiedad de sus respectivos creadores<br>
      • ThisIsFenix tiene permiso de uso de todos los assets utilizados<br>
      • No copies o redistribuyas sin permiso de los autores originales<br>
      • El código del chatbot es de uso personal<br>
      • El diseño v2.0 es propiedad de ThisIsFenix<br><br>
      
      <strong>5. Limitación de Responsabilidad</strong><br>
      • No somos responsables por daños derivados del uso<br>
      • El servicio puede interrumpirse sin previo aviso<br>
      • No garantizamos disponibilidad 24/7<br>
      • No nos hacemos responsables del contenido generado por IA<br><br>
      
      <strong>6. Modificaciones</strong><br>
      • Podemos cambiar estos términos en cualquier momento<br>
      • El uso continuado implica aceptación de cambios<br>
      • Las actualizaciones se notificarán en el canal de Updates<br><br>
      
      <strong>7. Uso Aceptable</strong><br>
      • No generes contenido ofensivo o ilegal<br>
      • No abuses del sistema de reportes<br>
      • No intentes sobrecargar el servidor<br>
      • Usa el chatbot de forma responsable y ética<br><br>
      
      <em>Última actualización: ${new Date().toLocaleDateString('es')} (v2.0)</em>
    </div>
    
    <div class="message bot">
      <strong>🔒 Política de Privacidad</strong><br><br>
      
      <strong>1. Información que Recopilamos</strong><br>
      • <strong>Mensajes:</strong> Guardamos tu historial de chat localmente y en servidor<br>
      • <strong>Imágenes:</strong> Las imágenes que subes se procesan temporalmente<br>
      • <strong>ID de Usuario:</strong> Generamos un ID único para identificar tus conversaciones<br>
      • <strong>Configuración:</strong> Guardamos tus preferencias (nombre, tema, etc.)<br>
      • <strong>Estadísticas:</strong> Contadores anónimos de uso (mensajes enviados, etc.)<br><br>
      
      <strong>2. Cómo Usamos tu Información</strong><br>
      • Para mantener el historial de conversaciones<br>
      • Para mejorar las respuestas del chatbot<br>
      • Para estadísticas anónimas de uso<br>
      • Para el sistema de confianza con personajes<br>
      • NO vendemos ni compartimos tus datos con terceros<br>
      • NO usamos tus datos para publicidad<br><br>
      
      <strong>3. Almacenamiento de Datos</strong><br>
      • <strong>LocalStorage:</strong> Configuración, preferencias, reportes y estadísticas en tu navegador<br>
      • <strong>Cloudflare Workers KV:</strong> Historial de chat en servidor (máx. 500 mensajes)<br>
      • <strong>Groq API:</strong> Mensajes procesados por IA (ver política de Groq)<br>
      • <strong>Stable Diffusion:</strong> Prompts de imágenes procesados temporalmente<br>
      • <strong>Discord Webhook:</strong> Reportes de contenido inapropiado (anónimos con User ID)<br>
      • Los datos se guardan hasta que los borres manualmente<br>
      • No guardamos contraseñas ni información bancaria<br><br>
      
      <strong>4. Cookies y Tecnologías Similares</strong><br>
      • Usamos localStorage para guardar preferencias<br>
      • No usamos cookies de terceros<br>
      • No rastreamos tu actividad fuera del chatbot<br>
      • No usamos cookies de publicidad<br>
      • Tu navegador controla el localStorage<br><br>
      
      <strong>5. Seguridad</strong><br>
      • Usamos HTTPS para comunicaciones seguras<br>
      • No guardamos información sensible (contraseñas, tarjetas, etc.)<br>
      • Tu ID de usuario es anónimo<br>
      • Las API keys están protegidas en Cloudflare Workers<br>
      • Rate limiting para prevenir abuso<br>
      • Sistema de reportes para contenido inapropiado<br><br>
      
      <strong>6. Tus Derechos</strong><br>
      • Puedes borrar tu historial en cualquier momento (Configuración → Borrar historial)<br>
      • Puedes borrar tus datos locales limpiando el localStorage<br>
      • Puedes ver tus estadísticas (Configuración → Ver estadísticas)<br>
      • Puedes reportar contenido inapropiado (botón 🚩 en mensajes del bot)<br>
      • Puedes dejar de usar el servicio cuando quieras<br>
      • Puedes solicitar la eliminación de tus datos del servidor<br><br>
      
      <strong>7. Menores de Edad</strong><br>
      • Este servicio no está dirigido a menores de 13 años<br>
      • Si eres menor, pide permiso a tus padres antes de usar<br>
      • Los padres pueden solicitar la eliminación de datos de menores<br>
      • Cumplimos con COPPA (Children's Online Privacy Protection Act)<br><br>
      
      <strong>8. Servicios de Terceros</strong><br>
      • <strong>Groq:</strong> Procesamiento de IA (<a href="https://groq.com/privacy-policy/" target="_blank" style="color: #00a884;">Ver política</a>)<br>
      • <strong>Stable Diffusion XL:</strong> Generación de imágenes<br>
      • <strong>Cloudflare:</strong> Hosting y almacenamiento (<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" style="color: #00a884;">Ver política</a>)<br>
      • <strong>GitHub Pages:</strong> Hosting del frontend (<a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" style="color: #00a884;">Ver política</a>)<br>
      • <strong>Discord:</strong> Sistema de reportes (webhooks)<br><br>
      
      <strong>9. Cambios a esta Política</strong><br>
      • Podemos actualizar esta política ocasionalmente<br>
      • Te notificaremos de cambios importantes<br>
      • La fecha de actualización se muestra al final<br>
      • Revisa esta política periódicamente<br><br>
      
      <strong>10. Contacto</strong><br>
      • GitHub: <a href="https://github.com/thisisfenix" target="_blank" style="color: #00a884;">@thisisfenix</a><br>
      • Twitter: <a href="https://twitter.com/AntiAnkush" target="_blank" style="color: #00a884;">@AntiAnkush</a><br>
      • TikTok: <a href="https://www.tiktok.com/@thefenixpro216" target="_blank" style="color: #00a884;">@thefenixpro216</a><br>
      • Email: Para solicitudes de eliminación de datos<br><br>
      
      <em>Última actualización: ${new Date().toLocaleDateString('es')} (v2.0)</em>
    </div>
    
    <div class="message bot">
      <strong>⚠️ Descargo de Responsabilidad</strong><br><br>
      
      • Este es un proyecto personal sin fines de lucro<br>
      • No somos responsables del contenido generado por la IA<br>
      • Usa el chatbot bajo tu propio riesgo<br>
      • Si encuentras contenido inapropiado, repórtalo<br>
      • No recopilamos información personal identificable intencionalmente<br>
      • Las imágenes generadas pueden contener errores o contenido inesperado<br>
      • No garantizamos la precisión de las respuestas de IA<br><br>
      
      <strong>Al usar este chatbot, confirmas que:</strong><br>
      ✅ Has leído y aceptado estos términos<br>
      ✅ Entiendes que las respuestas son generadas por IA<br>
      ✅ No compartirás información sensible o personal<br>
      ✅ Usarás el servicio de forma responsable<br>
      ✅ Tienes 13 años o más<br>
      ✅ Reportarás contenido inapropiado si lo encuentras<br>
      ✅ Aceptas que el servicio puede cambiar o interrumpirse<br>
      ✅ No usarás el servicio para actividades ilegales<br><br>
      
      <strong>🎨 Créditos del Redesign v2.0:</strong><br>
      • Diseño visual: ThisIsFenix<br>
      • CSS modular: 3 archivos (styles.css, redesign.css, ux-improvements.css)<br>
      • Inspiración: WhatsApp Web, Telegram, Discord, Material Design 3<br>
      • Total CSS: ~39KB (sin comprimir)<br><br>
      
      <em>¡Gracias por usar Deadly Pursuer Chat! 🎮</em>
    </div>
  `;
}

// Función para abrir el canal legal
function openLegalChannel() {
  const headerAvatar = document.getElementById('headerAvatar');
  const headerName = document.getElementById('headerName');
  const messagesContainer = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const imageInput = document.getElementById('imageInput');
  
  headerAvatar.src = 'https://via.placeholder.com/40/f15c6d/ffffff?text=⚖️';
  headerName.textContent = '⚖️ Legal';
  document.querySelector('.header-status').textContent = 'Canal oficial';
  
  messagesContainer.innerHTML = getLegalHTML();
  
  // Deshabilitar input
  messageInput.disabled = true;
  sendButton.disabled = true;
  imageInput.disabled = true;
  messageInput.placeholder = 'Los canales son solo lectura';
  
  messagesContainer.scrollTop = 0;
}
