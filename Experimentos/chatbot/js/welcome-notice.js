// Sistema de aviso de bienvenida para el rediseño
class WelcomeNotice {
  constructor() {
    this.storageKey = 'chatbot_redesign_notice_shown';
    this.version = '2.5.0'; // Versión del rediseño
    this.init();
  }

  init() {
    // Verificar si ya se mostró el aviso para esta versión
    const shownVersion = localStorage.getItem(this.storageKey);
    if (shownVersion !== this.version) {
      this.showWelcomeModal();
    }
  }

  showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'welcome-modal';
    modal.innerHTML = `
      <div class="welcome-content">
        <div class="welcome-header">
          <div class="welcome-icon">🎉</div>
          <h2>¡Bienvenido de vuelta!</h2>
          <p class="welcome-subtitle">El chatbot ha recibido un lavado de cara completo</p>
        </div>
        
        <div class="welcome-body">
          <div class="redesign-highlights">
            <h3>✨ Novedades del Rediseño v${this.version}</h3>
            <div class="highlight-grid">
              <div class="highlight-item">
                <div class="highlight-icon">🎵</div>
                <div class="highlight-text">
                  <strong>Reproductor de Música</strong>
                  <p>Escucha música mientras chateas con playlist personalizable</p>
                </div>
              </div>
              
              <div class="highlight-item">
                <div class="highlight-icon">🎨</div>
                <div class="highlight-text">
                  <strong>Interfaz Renovada</strong>
                  <p>Diseño más moderno y fluido inspirado en WhatsApp</p>
                </div>
              </div>
              
              <div class="highlight-item">
                <div class="highlight-icon">🚀</div>
                <div class="highlight-text">
                  <strong>Mejor Rendimiento</strong>
                  <p>Carga más rápida y experiencia más suave</p>
                </div>
              </div>
              
              <div class="highlight-item">
                <div class="highlight-icon">🔧</div>
                <div class="highlight-text">
                  <strong>Corrección de Bugs</strong>
                  <p>Múltiples mejoras y parches de estabilidad</p>
                </div>
              </div>
              
              <div class="highlight-item">
                <div class="highlight-icon">📱</div>
                <div class="highlight-text">
                  <strong>Mejor Móvil</strong>
                  <p>Experiencia optimizada para dispositivos táctiles</p>
                </div>
              </div>
              
              <div class="highlight-item">
                <div class="highlight-icon">🏆</div>
                <div class="highlight-text">
                  <strong>Sistema de Logros</strong>
                  <p>Nuevos logros y estadísticas mejoradas</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="update-info">
            <p>📋 Para más detalles sobre todas las mejoras, parches y correcciones, 
            visita la <strong>zona de actualizaciones</strong> en el menú principal.</p>
          </div>
        </div>
        
        <div class="welcome-footer">
          <button class="welcome-btn secondary" onclick="welcomeNotice.showUpdatesPage()">
            📋 Ver Actualizaciones Completas
          </button>
          <button class="welcome-btn primary" onclick="welcomeNotice.closeWelcome()">
            🚀 ¡Empezar a Chatear!
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Animación de entrada
    setTimeout(() => {
      modal.classList.add('show');
    }, 100);
  }

  showUpdatesPage() {
    // Crear página de actualizaciones detalladas
    const updatesModal = document.createElement('div');
    updatesModal.className = 'updates-modal';
    updatesModal.innerHTML = `
      <div class="updates-content">
        <div class="updates-header">
          <h2>📋 Actualizaciones Detalladas v${this.version}</h2>
          <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
        </div>
        
        <div class="updates-body">
          <div class="update-section">
            <h3>🎵 Sistema de Música</h3>
            <ul>
              <li>Reproductor de música integrado con controles completos</li>
              <li>Soporte para playlist personalizable</li>
              <li>Subida de archivos de audio propios (MP3, WAV, OGG, M4A)</li>
              <li>Controles de volumen, repetición y reproducción aleatoria</li>
              <li>Almacenamiento local de preferencias musicales</li>
            </ul>
          </div>
          
          <div class="update-section">
            <h3>🎨 Mejoras de Interfaz</h3>
            <ul>
              <li>Rediseño completo inspirado en aplicaciones modernas</li>
              <li>Mejor organización de elementos y navegación</li>
              <li>Animaciones más suaves y transiciones mejoradas</li>
              <li>Iconografía actualizada y más consistente</li>
              <li>Mejor contraste y legibilidad de texto</li>
            </ul>
          </div>
          
          <div class="update-section">
            <h3>🔧 Correcciones y Parches</h3>
            <ul>
              <li>Corregido problema de carga de imágenes en algunos navegadores</li>
              <li>Mejorada la sincronización de mensajes</li>
              <li>Optimizado el rendimiento del sistema de logros</li>
              <li>Corregidos errores de responsive en dispositivos pequeños</li>
              <li>Mejorada la gestión de memoria y limpieza de recursos</li>
            </ul>
          </div>
          
          <div class="update-section">
            <h3>📱 Optimizaciones Móviles</h3>
            <ul>
              <li>Mejor detección y manejo de eventos táctiles</li>
              <li>Optimizado el teclado virtual en dispositivos móviles</li>
              <li>Mejorada la navegación con gestos</li>
              <li>Ajustado el tamaño de elementos para mejor usabilidad</li>
            </ul>
          </div>
          
          <div class="update-section">
            <h3>🏆 Sistema de Logros Expandido</h3>
            <ul>
              <li>Nuevos logros relacionados con el uso del reproductor</li>
              <li>Estadísticas mejoradas de uso y actividad</li>
              <li>Mejor visualización del progreso de logros</li>
              <li>Sistema de notificaciones de logros más elegante</li>
            </ul>
          </div>
          
          <div class="update-section">
            <h3>⚡ Mejoras de Rendimiento</h3>
            <ul>
              <li>Carga inicial 40% más rápida</li>
              <li>Optimización de recursos y assets</li>
              <li>Mejor gestión de caché del navegador</li>
              <li>Reducido el uso de memoria en sesiones largas</li>
            </ul>
          </div>
        </div>
        
        <div class="updates-footer">
          <button class="welcome-btn primary" onclick="this.parentElement.parentElement.parentElement.remove()">
            ✅ Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(updatesModal);
    
    // Cerrar el modal de bienvenida
    const welcomeModal = document.querySelector('.welcome-modal');
    if (welcomeModal) {
      welcomeModal.remove();
    }
    
    // Marcar como visto
    this.markAsShown();
  }

  closeWelcome() {
    const modal = document.querySelector('.welcome-modal');
    if (modal) {
      modal.classList.add('hide');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
    this.markAsShown();
  }

  markAsShown() {
    localStorage.setItem(this.storageKey, this.version);
  }

  // Método para forzar mostrar el aviso (para testing)
  forceShow() {
    localStorage.removeItem(this.storageKey);
    this.showWelcomeModal();
  }
}

// Inicializar el sistema de bienvenida
let welcomeNotice;
document.addEventListener('DOMContentLoaded', () => {
  welcomeNotice = new WelcomeNotice();
});

// Función global para testing
window.showWelcomeNotice = () => {
  if (welcomeNotice) {
    welcomeNotice.forceShow();
  }
};