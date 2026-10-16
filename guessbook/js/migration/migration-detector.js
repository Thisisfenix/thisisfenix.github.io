// ========================================
// DETECTOR DE MIGRACIÓN AUTOMÁTICO
// Muestra banner cuando usuarios legacy inician sesión
// ========================================

export class MigrationDetector {
  constructor() {
    this.checkInterval = null;
    this.bannerShown = false;
  }

  init() {
    // Revisar al cargar la página
    this.checkUserMigrationStatus();
    
    // Revisar cada vez que cambie el perfil
    this.startWatching();
  }

  startWatching() {
    // Observar cambios en localStorage (cuando el usuario haga login/logout)
    window.addEventListener('storage', (e) => {
      if (e.key === 'userProfile') {
        this.checkUserMigrationStatus();
      }
    });
    
    // Revisar periódicamente (cada 30 segundos)
    this.checkInterval = setInterval(() => {
      this.checkUserMigrationStatus();
    }, 30000);
  }

  async checkUserMigrationStatus() {
    try {
      // Verificar si ya se migró
      const migrated = localStorage.getItem('accountMigrated');
      if (migrated === 'true') {
        this.removeMigrationBanner();
        return;
      }
      
      // Obtener perfil actual
      const profileData = localStorage.getItem('userProfile');
      if (!profileData) {
        this.removeMigrationBanner();
        return;
      }
      
      const profile = JSON.parse(profileData);
      
      // Verificar si está logueado
      if (!profile.isLoggedIn || !profile.username) {
        this.removeMigrationBanner();
        return;
      }
      
      // Verificar si ya tiene UID (ya migrado)
      if (profile.uid) {
        this.removeMigrationBanner();
        return;
      }
      
      // Usuario legacy detectado - mostrar banner
      if (!this.bannerShown) {
        this.showMigrationBanner(profile.username);
      }
      
    } catch (error) {
      console.error('Error detectando migración:', error);
    }
  }

  showMigrationBanner(username) {
    // Evitar duplicados
    if (document.getElementById('migrationBanner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'migrationBanner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideDown 0.5s ease-out;
      ">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
            <div style="font-size: 2rem;">🚀</div>
            <div>
              <h6 style="margin: 0; font-weight: 700; font-size: 1.1rem;">
                ¡Actualización Disponible!
              </h6>
              <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">
                Mejora la seguridad de tu cuenta con Firebase Authentication. Tus dibujos se migrarán automáticamente.
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button onclick="migrationDetector.triggerMigration('${username}')" style="
              background: white;
              color: #667eea;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.2)'">
              <span style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="shield-check" style="width: 1.25rem; height: 1.25rem;"></i>
                Actualizar Ahora
              </span>
            </button>
            <button onclick="migrationDetector.dismissBanner()" style="
              background: transparent;
              color: white;
              border: 2px solid rgba(255,255,255,0.5);
              padding: 0.75rem 1rem;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
              Después
            </button>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          #migrationBanner > div > div:first-child {
            flex-direction: column;
            text-align: center;
          }
          
          #migrationBanner > div > div:last-child {
            flex-direction: column;
            width: 100%;
          }
          
          #migrationBanner button {
            width: 100%;
          }
        }
      </style>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
    this.bannerShown = true;
    
    // Inicializar iconos
    if (window.lucide) {
      lucide.createIcons();
    }
    
    // Ajustar padding del body para que el contenido no quede oculto
    document.body.style.paddingTop = banner.offsetHeight + 'px';
  }

  removeMigrationBanner() {
    const banner = document.getElementById('migrationBanner');
    if (banner) {
      banner.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => {
        banner.remove();
        document.body.style.paddingTop = '0';
      }, 300);
      this.bannerShown = false;
    }
  }

  dismissBanner() {
    // Guardar que el usuario decidió no migrar por ahora
    localStorage.setItem('migrationDismissed', Date.now().toString());
    this.removeMigrationBanner();
    
    // Volver a mostrar el banner después de 24 horas
    setTimeout(() => {
      localStorage.removeItem('migrationDismissed');
    }, 24 * 60 * 60 * 1000);
  }

  async triggerMigration(username) {
    if (!window.accountMigration) {
      alert('Sistema de migración no disponible');
      return;
    }
    
    try {
      // Obtener datos de migración
      const migrationData = await window.accountMigration.checkMigrationStatus(username);
      
      if (migrationData.needsMigration) {
        // Remover banner
        this.removeMigrationBanner();
        
        // Mostrar modal de migración
        window.accountMigration.showMigrationModal(migrationData);
      } else {
        alert('Tu cuenta ya está actualizada');
        this.removeMigrationBanner();
      }
      
    } catch (error) {
      console.error('Error iniciando migración:', error);
      alert('Error al iniciar migración. Intenta más tarde.');
    }
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Instancia global
window.migrationDetector = new MigrationDetector();

// Auto-inicializar cuando la página cargue
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.migrationDetector.init();
  });
} else {
  window.migrationDetector.init();
}

export default MigrationDetector;
