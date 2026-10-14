// Gestión de interfaz y modales
export class UIManager {
  constructor() {
    // Detectar versión del guestbook
    this.version = this.detectVersion();
    this.init();
  }
  
  detectVersion() {
    // Detectar basándose en elementos únicos de cada versión
    if (document.getElementById('drawCanvas') && window.location.pathname.includes('v1')) {
      return 'v1';
    } else if (document.querySelector('.mobile-toolbar')) {
      return 'new';
    } else {
      return 'old';
    }
  }
  
  init() {
    this.setupThemes();
    this.setupModals();
    this.addThemeStyles();
  }
  
  addThemeStyles() {
    const style = document.createElement('style');
    style.textContent = `
      [data-theme="neon"] {
        --text-primary: #00ff88;
        --text-secondary: #00cc66;
      }
      [data-theme="retro"] {
        --text-primary: #ffd700;
        --text-secondary: #ffb347;
      }
      [data-theme="hacker"] {
        --text-primary: #00ff00;
        --text-secondary: #00cc00;
      }
      [data-theme="ocean"] {
        --text-primary: #e8f4fd;
        --text-secondary: #b8dff0;
      }
      [data-theme="sunset"] {
        --text-primary: #fed7aa;
        --text-secondary: #fdba74;
      }
      [data-theme="forest"] {
        --text-primary: #ecfdf5;
        --text-secondary: #bbf7d0;
      }
      [data-theme="cyberpunk"] {
        --text-primary: #ff0080;
        --text-secondary: #c9d1d9;
      }
      [data-theme="gold"] {
        --text-primary: #fef3c7;
        --text-secondary: #fbbf24;
      }
      [data-theme="ice"] {
        --text-primary: #e0f6ff;
        --text-secondary: #87ceeb;
      }
      [data-theme="funky"] {
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
      }
    `;
    document.head.appendChild(style);
  }
  
  setupThemes() {
    const themes = {
      default: { name: '🎨 Clásico', primary: '#ff6b35', bgDark: '#1a1a1a', bgLight: '#2d2d2d' },
      neon: { name: '💚 Neón', primary: '#00ff88', bgDark: '#0a0a0a', bgLight: '#1a1a1a' },
      retro: { name: '💜 Retro', primary: '#ff6b9d', bgDark: '#2d1b69', bgLight: '#3e2a7a' },
      hacker: { name: '💻 Hacker', primary: '#00ff00', bgDark: '#000000', bgLight: '#0d1117' },
      ocean: { name: '🌊 Océano', primary: '#00d4ff', bgDark: '#0f3460', bgLight: '#16537e' },
      sunset: { name: '🌅 Atardecer', primary: '#f97316', bgDark: '#7c2d12', bgLight: '#9a3412' },
      forest: { name: '🌲 Bosque', primary: '#4ade80', bgDark: '#1a3d2e', bgLight: '#2d5a47' },
      cyberpunk: { name: '🤖 Cyberpunk', primary: '#ff0080', bgDark: '#0d1117', bgLight: '#161b22' },
      gold: { name: '✨ Dorado', primary: '#fbbf24', bgDark: '#451a03', bgLight: '#78350f' },
      ice: { name: '❄️ Hielo', primary: '#4682b4', bgDark: '#001133', bgLight: '#003366' },
      funky: { name: '🌈 Funky Atlas', primary: '#ff4444', bgDark: '#0f0f1a', bgLight: '#2b1055' }
    };
    
    const themeContainer = document.createElement('div');
    themeContainer.className = 'd-flex align-items-center gap-2 mb-3';
    themeContainer.innerHTML = `
      <label class="form-label text-light small mb-0">🎨 Tema:</label>
      <select id="themeSelector" class="form-select form-select-sm" style="width: 150px; background: var(--bg-light); border: 1px solid var(--primary); color: var(--text-primary);">
        ${Object.entries(themes).map(([key, theme]) => 
          `<option value="${key}">${theme.name}</option>`
        ).join('')}
      </select>
    `;
    
    const selector = themeContainer.querySelector('#themeSelector');
    
    selector.addEventListener('change', (e) => {
      const theme = e.target.value;
      this.applyTheme(theme, themes[theme]);
      localStorage.setItem('guestbook-theme', theme);
      this.saveUserTheme(theme);
    });
    
    // Añadir al panel de control
    const controlPanel = document.querySelector('.card-body');
    if (controlPanel) {
      const firstSection = controlPanel.querySelector('.control-section');
      if (firstSection) {
        firstSection.parentNode.insertBefore(themeContainer, firstSection);
      }
    }
    
    // Cargar tema guardado
    this.loadUserTheme(themes, selector);
  }
  
  applyTheme(themeName, theme) {
    const root = document.documentElement;
    
    if (themeName === 'default') {
      root.removeAttribute('data-theme');
      // Restaurar colores por defecto
      root.style.setProperty('--primary', '#ff6b35');
      root.style.setProperty('--bg-dark', '#1a1a1a');
      root.style.setProperty('--bg-light', '#2d2d2d');
    } else {
      root.setAttribute('data-theme', themeName);
      // Aplicar colores del tema
      root.style.setProperty('--primary', theme.primary);
      root.style.setProperty('--bg-dark', theme.bgDark);
      root.style.setProperty('--bg-light', theme.bgLight);
    }
  }
  
  saveUserTheme(theme) {
    localStorage.setItem('guestbook-user-theme', theme);
  }
  
  loadUserTheme(themes, selector) {
    const savedTheme = localStorage.getItem('guestbook-user-theme') || 'default';
    if (themes[savedTheme]) {
      selector.value = savedTheme;
      this.applyTheme(savedTheme, themes[savedTheme]);
    }
  }
  
  setupModals() {
    // No sobrescribir viewImage - se maneja en gallery.js
    console.log('UI Manager: Modales configurados (viewImage se maneja en gallery.js)');
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      padding: 15px 20px; border-radius: 8px; color: white;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }
  
  createConfetti() {
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed; left: ${Math.random() * window.innerWidth}px; top: -10px;
          width: 8px; height: 8px; border-radius: 50%; pointer-events: none; z-index: 9999;
          background: ${['#ff6b35', '#00ff88', '#ff6b9d', '#00ff00'][Math.floor(Math.random() * 4)]};
        `;
        document.body.appendChild(confetti);
        
        confetti.animate([
          { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
          { transform: `translateY(${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }
        ], { duration: 2000 }).onfinish = () => confetti.remove();
      }, i * 50);
    }
  }

  // ==================== UTILIDADES ====================
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================== SUGERENCIAS ====================
  
  async showSuggestionsModal() {
    try {
      const firebase = window.guestbookApp?.firebase;
      if (!firebase) {
        alert('Error: Firebase no está inicializado');
        return;
      }

      const suggestions = await firebase.getAllSuggestions();
      
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content" style="background: var(--bg-light); border: 2px solid var(--primary);">
            <div class="modal-header" style="border-bottom: 1px solid var(--primary);">
              <h5 class="modal-title" style="color: var(--primary);">
                <i data-lucide="message-square" style="width: 1.25rem; height: 1.25rem; vertical-align: middle;"></i>
                Sugerencias de la Comunidad
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
              ${suggestions.length === 0 ? `
                <div class="text-center py-5" style="color: var(--text-secondary);">
                  <i data-lucide="inbox" style="width: 3rem; height: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                  <p>No hay sugerencias aún</p>
                </div>
              ` : suggestions.map(s => `
                <div class="card mb-3" style="background: var(--bg-dark); border: 1px solid var(--primary); border-radius: 12px;">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span class="badge ${s.tipo === 'feature' ? 'bg-primary' : s.tipo === 'bug' ? 'bg-danger' : 'bg-secondary'}">
                          ${s.tipo === 'feature' ? '✨ Feature' : s.tipo === 'bug' ? '🐛 Bug' : '💡 Mejora'}
                        </span>
                        <span class="badge ${s.status === 'pending' ? 'bg-warning' : s.status === 'done' ? 'bg-success' : 'bg-secondary'} ms-2">
                          ${s.status === 'pending' ? '⏳ Pendiente' : s.status === 'done' ? '✅ Completado' : '❌ Rechazado'}
                        </span>
                      </div>
                      <small style="color: var(--text-secondary);">${new Date(s.timestamp).toLocaleDateString('es-ES')}</small>
                    </div>
                    <p style="color: var(--text-primary); margin-bottom: 0.5rem;">${this.escapeHtml(s.texto)}</p>
                    ${s.imagen ? `<div class="mt-2"><img src="${s.imagen}" style="max-width: 100%; max-height: 150px; border-radius: 8px; cursor: pointer;" onclick="this.style.maxHeight=this.style.maxHeight=='150px'?'400px':'150px'" alt="Imagen adjunta"></div>` : ''}
                    <small style="color: var(--text-secondary);">Por: ${this.escapeHtml(s.autor)}</small>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="modal-footer" style="border-top: 1px solid var(--primary);">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
      
      // Inicializar iconos de Lucide
      if (window.lucide) {
        lucide.createIcons();
      }
      
      modal.addEventListener('hidden.bs.modal', () => modal.remove());
      
    } catch (error) {
      console.error('Error mostrando sugerencias:', error);
      alert('Error al cargar sugerencias');
    }
  }
  
  showCreateSuggestionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content" style="background: var(--bg-light); border: 2px solid var(--primary);">
          <div class="modal-header" style="border-bottom: 1px solid var(--primary);">
            <h5 class="modal-title" style="color: var(--primary);">
              <i data-lucide="plus-circle" style="width: 1.25rem; height: 1.25rem; vertical-align: middle;"></i>
              Nueva Sugerencia
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label" style="color: var(--text-primary);">Tu Nombre</label>
              <input type="text" id="suggestionAuthor" class="form-control" placeholder="Nombre (opcional)" maxlength="50" 
                     style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);">
            </div>
            <div class="mb-3">
              <label class="form-label" style="color: var(--text-primary);">Tipo de Sugerencia</label>
              <select id="suggestionType" class="form-select" 
                      style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);">
                <option value="feature">✨ Nueva Funcionalidad</option>
                <option value="improvement">💡 Mejora</option>
                <option value="bug">🐛 Reporte de Bug</option>
                <option value="other">📝 Otro</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" style="color: var(--text-primary);">Descripción</label>
              <textarea id="suggestionText" class="form-control" rows="4" maxlength="1000" 
                        placeholder="Describe tu sugerencia..." required
                        style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);"></textarea>
              <small class="form-text" style="color: var(--text-secondary);">Máximo 1000 caracteres</small>
            </div>
            <div class="mb-3">
              <label class="form-label" style="color: var(--text-primary);">Imagen (opcional)</label>
              <input type="file" id="suggestionImage" class="form-control" accept="image/*" 
                     style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);">
              <small class="form-text" style="color: var(--text-secondary);">Máximo 800KB - Adjunta una captura o mockup</small>
            </div>
          </div>
          <div class="modal-footer" style="border-top: 1px solid var(--primary);">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="this.closest('.modal').querySelector('.btn-primary').disabled = true; window.guestbookApp.ui.submitSuggestion()">
              <i data-lucide="send" style="width: 1rem; height: 1rem;"></i>
              Enviar Sugerencia
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Inicializar iconos de Lucide
    if (window.lucide) {
      lucide.createIcons();
    }
    
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
  }
  
  async submitSuggestion() {
    try {
      const author = document.getElementById('suggestionAuthor').value.trim() || 'Anónimo';
      const type = document.getElementById('suggestionType').value;
      const text = document.getElementById('suggestionText').value.trim();
      const imageFile = document.getElementById('suggestionImage').files[0];
      
      if (!text) {
        alert('Por favor escribe una descripción');
        return;
      }
      
      const firebase = window.guestbookApp?.firebase;
      if (!firebase) {
        alert('Error: Firebase no está inicializado');
        return;
      }
      
      let imageData = null;
      
      // Procesar imagen si existe
      if (imageFile) {
        const maxSize = 800 * 1024; // 800KB
        if (imageFile.size > maxSize) {
          alert('La imagen es muy grande. Máximo 800KB');
          return;
        }
        
        imageData = await this.processImageForSuggestion(imageFile);
      }
      
      const suggestionData = {
        autor: author,
        tipo: type,
        texto: text,
        timestamp: Date.now(),
        status: 'pending',
        domain: window.location.hostname
      };
      
      if (imageData) {
        suggestionData.imagen = imageData;
      }
      
      await firebase.saveSuggestion(suggestionData);
      
      this.showNotification('✅ ¡Sugerencia enviada!', 'success');
      
      // Cerrar modal
      const modal = document.querySelector('.modal.show');
      if (modal) {
        bootstrap.Modal.getInstance(modal).hide();
      }
      
    } catch (error) {
      console.error('Error enviando sugerencia:', error);
      alert('Error al enviar la sugerencia. Intenta de nuevo.');
    }
  }
  
  processImageForSuggestion(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
