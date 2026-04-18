// Updates del chatbot
const UPDATES = [
  {
    version: 'v2.0',
    title: 'Redesign Visual Completo',
    emoji: '🎨',
    features: [
      'Redesign visual completo con CSS modular',
      'Glassmorphism en sidebars y paneles',
      'Gradientes modernos en botones y mensajes',
      'Sistema de sombras dinámicas (3 niveles)',
      'Animaciones suaves en todas las interacciones',
      'Micro-animaciones y feedback visual mejorado',
      'Tooltips automáticos en elementos',
      'Skeleton loading para mejor UX',
      'Toast notifications (success, error, info)',
      'Progress bar animado',
      'Context menu personalizado',
      'Chips/Tags para categorías',
      'Empty states con iconos animados',
      'CSS extraído del HTML (39KB total)',
      'Mejor organización del código',
      'Performance optimizado (60fps)',
      'Responsive mejorado para móviles',
      'Efectos glow en elementos importantes',
      'Backdrop blur en modales',
      'Animaciones de entrada slide-in'
    ]
  },
  {
    version: 'v1.1.1',
    title: 'IA Artística y Relaciones Evolutivas',
    emoji: '🎨',
    features: [
      'Generación de imágenes por personajes con Stable Diffusion XL',
      'Estilos artísticos únicos por personaje (heroico, anime, cyberpunk, etc.)',
      'Triggers: "dibuja", "crea imagen", "genera", "muestra"',
      'Modal de pantalla completa para ver imágenes (click + ESC)',
      'Sistema de confianza de 6 niveles (Desconocido → Hermano/a)',
      'Velocidades de confianza personalizadas por personaje',
      'Contexto de conversación (últimos 8 mensajes)',
      'Personalidades expandidas con libertad creativa',
      'Temperatura y tokens aumentados para más espontaneidad',
      'Imágenes adaptadas al nivel de confianza',
      'Historial compatible con imágenes generadas',
      'Integración completa con sistema existente'
    ]
  },
  {
    version: 'v1.1',
    title: 'Protección Legal y Reportes',
    emoji: '⚖️',
    features: [
      'Canal Legal con Términos y Condiciones',
      'Política de Privacidad completa',
      'Modal de aceptación de términos (primera visita)',
      'Confirmación de edad (+13 años)',
      'Botón de reporte en mensajes del bot (🚩)',
      'Sistema de reportes enviados a Discord',
      'Rate limiting (10 mensajes por minuto)',
      'Analytics anónimo de uso',
      'Estadísticas de mensajes en configuración',
      'Webhook seguro con Cloudflare Secrets',
      'Descargo de responsabilidad por contenido IA',
      'Créditos a creadores de assets'
    ]
  },
  {
    version: 'v1.0',
    title: 'Lanzamiento Inicial',
    emoji: '🚀',
    features: [
      'Diseño completo estilo WhatsApp Web',
      'Mini sidebar con navegación (Estados, Canales, Chats, Archivados)',
      'Soporte para imágenes con visión IA (Llama 4 Maverick)',
      '6 personajes de Deadly Pursuer con personalidades únicas',
      'Easter eggs (Molly Anderson, Bfmp4, Abelitogamer)',
      'Sistema de configuración (nombre, sonido, tamaño fuente)',
      'Foto de perfil personalizable',
      'Personajes personalizados con IA',
      'Panel de gestión de personajes (crear/eliminar)',
      'Canal oficial de Updates',
      'Modo Retro 3D con terminal',
      'Cloudflare Workers para protección de API keys',
      'Pantalla de carga estilo WhatsApp',
      'Guardado de conversaciones en Cloudflare KV (500 mensajes)',
      'Historial persistente por personaje',
      'Hora y checks de visto en mensajes',
      'Responsive para móviles con menú hamburguesa',
      'Sistema de archivado de personajes (long press 0.8s)',
      'Click derecho para desarchivar',
      'Filtrado automático de archivados',
      'Alertas automáticas de errores en móviles',
      'Sistema de reporte de bugs para Discord (@thisisankush)'
    ]
  }
];

function getUpdatesHTML() {
  let html = `
    <div class="message bot">
      🎉 <strong>Bienvenido al canal de Updates</strong><br><br>
      Aquí encontrarás todas las actualizaciones del chatbot.<br><br>
      💡 <strong>Novedades v2.0:</strong><br>
      ✨ Nuevo diseño visual moderno<br>
      🎨 Animaciones suaves y glassmorphism<br>
      🚀 Mejor performance y UX<br><br>
      <strong>Prueba las funciones de IA:</strong><br>
      "Angel, dibuja una batalla épica"<br>
      "Gissel, crea una imagen de ti cantando"
    </div>
  `;

  // Invertir el orden para que los más nuevos aparezcan primero (arriba)
  UPDATES.slice().reverse().forEach(update => {
    html += `
      <div class="message bot">
        ${update.emoji} <strong>${update.version} - ${update.title}</strong><br><br>
        ${update.features.map(f => `• ${f}`).join('<br>')}
      </div>
    `;
  });

  return html;
}
