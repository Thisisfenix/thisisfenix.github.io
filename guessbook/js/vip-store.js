// Sistema de Tienda VIP con Temas
export class VipStore {
  constructor() {
    this.themes = {
      free: {
        'default': { name: '🔥 Original', colors: { primary: '#ff6b35', secondary: '#ff8c42' } },
        'light': { name: '☀️ Claro', colors: { primary: '#3182ce', secondary: '#805ad5' } },
        'neon': { name: '💚 Neon', colors: { primary: '#00ff41', secondary: '#ff0080' } },
        'cyberpunk': { name: '🌃 Cyberpunk', colors: { primary: '#ff0080', secondary: '#00d4ff' } },
        'matrix': { name: '💻 Matrix', colors: { primary: '#00ff00', secondary: '#008800' } },
        'synthwave': { name: '🌆 Synthwave', colors: { primary: '#ff6b9d', secondary: '#c44569' } },
        'ocean': { name: '🌊 Ocean', colors: { primary: '#00d4ff', secondary: '#0099cc' } },
        'forest': { name: '🌲 Forest', colors: { primary: '#4ade80', secondary: '#22c55e' } },
        'sunset': { name: '🌅 Sunset', colors: { primary: '#f97316', secondary: '#ea580c' } },
        'funkyatlas': { name: '🎨 FunkyAtlas', colors: { primary: '#ff4444', secondary: '#7597de' } },
        'funkyatlas-christmas': { name: '🎅 FunkyAtlas Xmas', colors: { primary: '#FFD700', secondary: '#16a34a' } }
      },
      premium: {
        'christmas': { name: '🎄 Christmas', colors: { primary: '#dc2626', secondary: '#16a34a' }, price: 100 },
        'halloween': { name: '🎃 Halloween', colors: { primary: '#f97316', secondary: '#7c2d12' }, price: 100 },
        'valentine': { name: '💝 Valentine', colors: { primary: '#ec4899', secondary: '#be185d' }, price: 100 },
        'easter': { name: '🐰 Easter', colors: { primary: '#a855f7', secondary: '#7c3aed' }, price: 100 },
        'summer': { name: '☀️ Summer', colors: { primary: '#06b6d4', secondary: '#0891b2' }, price: 100 },
        'autumn': { name: '🍂 Autumn', colors: { primary: '#ea580c', secondary: '#dc2626' }, price: 100 },
        'galaxy': { name: '🌌 Galaxy', colors: { primary: '#7c3aed', secondary: '#4c1d95' }, price: 150 },
        'gold': { name: '👑 Gold', colors: { primary: '#f59e0b', secondary: '#d97706' }, price: 150 },
        'rainbow': { name: '🌈 Rainbow', colors: { primary: '#ec4899', secondary: '#8b5cf6' }, price: 150 },
        'diamond': { name: '💎 Diamond', colors: { primary: '#0f172a', secondary: '#334155' }, price: 150 },
        'vaporwave': { name: '🌸 Vaporwave', colors: { primary: '#3a86ff', secondary: '#06ffa5' }, price: 200 },
        'hacker': { name: '👨‍💻 Hacker', colors: { primary: '#00ff00', secondary: '#008800' }, price: 200 },
        'neon-city': { name: '🏙️ Neon City', colors: { primary: '#ff8000', secondary: '#00ff80' }, price: 200 },
        'space': { name: '🚀 Space', colors: { primary: '#6666ff', secondary: '#9999ff' }, price: 200 }
      },
      vip: {
        'fire': { name: '🔥 Fire', colors: { primary: '#ff4500', secondary: '#ff0000' }, requiresVip: true },
        'ice': { name: '❄️ Ice', colors: { primary: '#4682b4', secondary: '#191970' }, requiresVip: true },
        'toxic': { name: '☢️ Toxic', colors: { primary: '#32cd32', secondary: '#00ff00' }, requiresVip: true },
        'royal': { name: '👑 Royal', colors: { primary: '#9932cc', secondary: '#8a2be2' }, requiresVip: true },
        'steampunk': { name: '⚙️ Steampunk', colors: { primary: '#b8860b', secondary: '#8b4513' }, requiresVip: true },
        'hologram': { name: '🔮 Hologram', colors: { primary: '#ff00ff', secondary: '#cc00cc' }, requiresVip: true },
        'legendary': { name: '✨ Legendary', colors: { primary: '#ff8c00', secondary: '#ff1493' }, requiresVip: true }
      }
    };
    
    this.avatarFrames = {
      free: {
        'none': {
          name: 'Sin Marco',
          description: 'Avatar sin decoración',
          style: 'none'
        },
        'basic': {
          name: '⚪ Marco Básico',
          description: 'Marco simple blanco',
          style: 'border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);'
        },
        'colorful': {
          name: '🎨 Marco Colorido',
          description: 'Marco con colores del tema',
          style: 'border: 2px solid var(--primary); box-shadow: 0 0 10px rgba(255, 107, 53, 0.4);'
        }
      },
      premium: {
        'silver': {
          name: '🥈 Marco Plata',
          description: 'Marco plateado elegante',
          style: 'border: 3px solid #c0c0c0; box-shadow: 0 0 12px rgba(192, 192, 192, 0.6);',
          price: 50
        },
        'bronze': {
          name: '🥉 Marco Bronce',
          description: 'Marco bronce clásico',
          style: 'border: 3px solid #cd7f32; box-shadow: 0 0 12px rgba(205, 127, 50, 0.6);',
          price: 75
        }
      },
      vip: {
        'golden': {
          name: '👑 Marco Dorado',
          description: 'Elegante marco dorado',
          style: 'border: 3px solid #ffd700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);',
          requiresVip: true,
          price: 75
        },
        'diamond': {
          name: '💎 Marco Diamante',
          description: 'Marco cristalino premium',
          style: 'border: 3px solid #b4c7d9; box-shadow: 0 0 15px rgba(180, 199, 217, 0.7);',
          requiresVip: true,
          price: 100
        },
        'fire': {
          name: '🔥 Marco Fuego',
          description: 'Marco ardiente animado',
          style: 'border: 3px solid #ff4500; box-shadow: 0 0 20px rgba(255, 69, 0, 0.8); animation: fireGlow 2s ease-in-out infinite alternate;',
          requiresVip: true,
          price: 125
        }
      }
    };
    
    this.vipTags = {
      'vip14': {
        name: '👑 VIP 14 días',
        description: 'Acceso VIP temporal',
        duration: 14,
        price: 500
      },
      'vip30': {
        name: '👑 VIP 30 días',
        description: 'Acceso VIP mensual',
        duration: 30,
        price: 900
      },
      'vipPerma': {
        name: '💎 VIP Permanente',
        description: 'Acceso VIP de por vida',
        duration: 'permanent',
        price: 2500
      }
    };
    
    this.init();
  }
  
  init() {
    this.loadSavedTheme();
    this.loadSavedFrame();
    this.setupGlobalFunctions();
    this.addFrameAnimations();
    this.checkVipExpiry();
    this.initPointsSystem();
  }
  
  // Helper para verificar si el usuario está logueado
  isUserLoggedIn() {
    if (!window.guestbookApp || !window.guestbookApp.profiles) {
      return false;
    }
    const profiles = window.guestbookApp.profiles;
    return profiles.currentProfile && profiles.currentProfile.isLoggedIn === true;
  }
  
  setupGlobalFunctions() {
    window.showVipStore = () => this.showStore();
    window.applyTheme = (themeName) => this.applyTheme(themeName);
    window.loadSavedTheme = () => this.loadSavedTheme();
    window.applyAvatarFrame = (frameKey) => this.applyAvatarFrame(frameKey);
    window.purchaseTheme = (themeKey) => this.purchaseTheme(themeKey);
    window.purchaseFrame = (frameKey) => this.purchaseFrame(frameKey);
    window.getUserPoints = () => this.getUserPoints();
    window.purchaseVipTag = (tagKey) => this.purchaseVipTag(tagKey);
    window.applyProfileTheme = (username, userProfile) => this.applyProfileTheme(username, userProfile);
    window.applyUserThemeToModal = (modalElement, userTheme, isVip) => this.applyUserThemeToModal(modalElement, userTheme, isVip);
    window.awardPoints = (amount, reason) => this.awardPoints(amount, reason);
    window.checkDailyBonus = () => this.checkDailyBonus();
  }
  
  addFrameAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fireGlow {
        0% { box-shadow: 0 0 20px rgba(255, 69, 0, 0.8); }
        100% { box-shadow: 0 0 30px rgba(255, 69, 0, 1), 0 0 40px rgba(255, 140, 0, 0.5); }
      }
      
      @keyframes vipGlow {
        0% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
        100% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.6); }
      }
      
      .vip-user {
        position: relative;
        animation: vipGlow 2s ease-in-out infinite alternate;
      }
      
      .vip-user .card {
        background: linear-gradient(135deg, var(--bg-light), var(--bg-light)) !important;
        border: 2px solid var(--user-primary, var(--primary)) !important;
      }
      
      .user-panel[data-theme] {
        border-color: var(--user-primary, var(--primary)) !important;
        box-shadow: 0 0 10px var(--user-primary, var(--primary))33 !important;
      }
      
      .vip-profile .modal-content {
        animation: vipGlow 3s ease-in-out infinite alternate;
      }
      
      .vip-profile .modal-header {
        position: relative;
        overflow: hidden;
      }
      
      .vip-profile .modal-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent);
        animation: shimmer 3s infinite;
      }
      
      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      
      /* Estilos para editor de recorte de banner */
      .crop-modal {
        backdrop-filter: blur(5px);
      }
      
      #cropSelector {
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      }
      
      #cropSelector::before {
        content: '✂️ Arrastra para mover';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 0.65em;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        pointer-events: none;
        white-space: nowrap;
      }
      
      /* Estilos para editores estilo Discord */
      #discordCropCanvas, #bannerCropCanvas {
        transition: cursor 0.1s ease;
      }
      
      #discordZoomSlider, #bannerZoomSlider {
        -webkit-appearance: none;
        appearance: none;
        height: 4px;
        background: var(--bg-light);
        border-radius: 2px;
        outline: none;
      }
      
      #discordZoomSlider::-webkit-slider-thumb, #bannerZoomSlider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: var(--primary);
        border-radius: 50%;
        cursor: pointer;
      }
      
      #discordZoomSlider::-moz-range-thumb, #bannerZoomSlider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: var(--primary);
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }
      
      .resize-handle {
        transition: all 0.2s ease;
      }
      
      .resize-handle:hover {
        background: #ff8c42 !important;
        transform: scale(1.2);
      }
      
      /* Scrollbars para paneles VIP en móviles */
      @media (max-width: 768px) {
        .modal-body {
          max-height: 70vh !important;
          overflow-y: auto !important;
        }
        
        .tab-content {
          max-height: 60vh !important;
          overflow-y: auto !important;
        }
        
        .modal-body::-webkit-scrollbar,
        .tab-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .modal-body::-webkit-scrollbar-track,
        .tab-content::-webkit-scrollbar-track {
          background: var(--bg-light);
          border-radius: 3px;
        }
        
        .modal-body::-webkit-scrollbar-thumb,
        .tab-content::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 3px;
        }
        
        .modal-dialog {
          margin: 0.5rem !important;
        }
        
        .modal-content {
          max-height: 95vh !important;
        }
      }
      
      /* Colores de texto para paneles VIP */
      .modal-content {
        color: var(--text-primary) !important;
      }
      
      .modal-body,
      .tab-content,
      .tab-pane {
        color: var(--text-primary) !important;
      }
      
      .modal-body p,
      .modal-body div,
      .modal-body span,
      .tab-content p,
      .tab-content div,
      .tab-content span {
        color: var(--text-primary) !important;
      }
      
      .modal-body small {
        color: var(--text-secondary) !important;
      }

    `;
    document.head.appendChild(style);
  }
  
  showStore() {
    // Verificar integración con Laboratory antes de mostrar
    if (window.achievementSystem && !this.useLaboratoryPoints) {
      console.log('🔄 Detectado Laboratory, activando integración');
      this.useLaboratoryPoints = true;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered" style="max-width: min(92vw, 1000px); margin: 1rem auto;">
        <div class="modal-content" style="background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(15, 15, 30, 0.98)); backdrop-filter: blur(20px); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 20px; box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5); overflow: hidden; height: 85vh; display: flex; flex-direction: column;">
          
          <!-- Header -->
          <div class="modal-header" style="background: linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(247, 147, 30, 0.1)); border-bottom: 1px solid rgba(255, 107, 53, 0.2); padding: 1.25rem 1.5rem; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 1rem; width: 100%;">
              <div style="font-size: 2rem;">💎</div>
              <div style="flex: 1;">
                <h4 style="color: var(--primary); margin: 0; font-size: 1.5rem; font-weight: 700;">VIP Store</h4>
                <small style="color: rgba(255, 255, 255, 0.65); font-size: 0.85rem;">Personaliza tu experiencia</small>
              </div>
              <div style="background: rgba(255, 107, 53, 0.15); padding: 0.65rem 1.25rem; border-radius: 25px; border: 1px solid rgba(255, 107, 53, 0.3);">
                <small style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; display: block;">Puntos</small>
                <div style="font-size: 1.3rem; font-weight: 700; color: var(--primary);" data-points-display>${this.getUserPoints()}</div>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" style="opacity: 0.8;"></button>
          </div>
          
          <div class="modal-body" style="padding: 0; display: flex; flex-direction: column; flex: 1; min-height: 0;">
            <!-- Info Bar -->
            <div style="padding: 0.85rem 1.5rem; background: rgba(255, 107, 53, 0.05); border-bottom: 1px solid rgba(255, 107, 53, 0.1); display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; font-size: 0.85rem; flex-shrink: 0;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.7);">
                <span style="font-size: 1.1rem;">🎨</span>
                <span>Dibuja +10pts</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.7);">
                <span style="font-size: 1.1rem;">💬</span>
                <span>Comenta +5pts</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.7);">
                <span style="font-size: 1.1rem;">❤️</span>
                <span>Like +2pts</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.7);">
                <span style="font-size: 1.1rem;">🎁</span>
                <span>Bonus +25pts</span>
              </div>
            </div>
            
            <!-- Tabs Navigation -->
            <ul class="nav nav-tabs" role="tablist" style="padding: 1rem 1.5rem 0; border-bottom: none; gap: 0.5rem; background: transparent; overflow-x: auto; flex-shrink: 0;">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#free-content" type="button" role="tab" style="background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 147, 30, 0.15)); border: 1px solid rgba(255, 107, 53, 0.3); color: var(--primary); border-radius: 10px 10px 0 0; padding: 0.65rem 1.25rem; font-weight: 600; font-size: 0.9rem; transition: all 0.3s ease; white-space: nowrap;">
                  🆓 Gratis
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#market-content" type="button" role="tab" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); border-radius: 10px 10px 0 0; padding: 0.65rem 1.25rem; font-weight: 600; font-size: 0.9rem; transition: all 0.3s ease; white-space: nowrap;">
                  💰 Mercado
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#vip-content" type="button" role="tab" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); border-radius: 10px 10px 0 0; padding: 0.65rem 1.25rem; font-weight: 600; font-size: 0.9rem; transition: all 0.3s ease; white-space: nowrap;">
                  💎 VIP
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#vip-store" type="button" role="tab" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); border-radius: 10px 10px 0 0; padding: 0.65rem 1.25rem; font-weight: 600; font-size: 0.9rem; transition: all 0.3s ease; white-space: nowrap;">
                  🛒 Comprar VIP
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#points-history" type="button" role="tab" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); border-radius: 10px 10px 0 0; padding: 0.65rem 1.25rem; font-weight: 600; font-size: 0.9rem; transition: all 0.3s ease; white-space: nowrap;">
                  📊 Historial
                </button>
              </li>
            </ul>
            
            <div class="tab-content" style="padding: 1.5rem; flex: 1; overflow-y: auto; min-height: 0;">
              <div class="tab-pane fade show active" id="free-content" role="tabpanel">
                ${this.renderModernContent('free')}
              </div>
              
              <div class="tab-pane fade" id="market-content" role="tabpanel">
                ${this.renderModernContent('premium')}
              </div>
              
              <div class="tab-pane fade" id="vip-content" role="tabpanel">
                ${this.renderModernContent('vip')}
              </div>
              
              <div class="tab-pane fade" id="vip-store" role="tabpanel">
                ${this.renderVipTagsModern()}
              </div>
              
              <div class="tab-pane fade" id="points-history" role="tabpanel">
                ${this.renderPointsHistory()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .nav-tabs {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }
        
        .nav-tabs::-webkit-scrollbar {
          height: 4px;
        }
        
        .nav-tabs::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .nav-tabs::-webkit-scrollbar-thumb {
          background: rgba(255, 107, 53, 0.3);
          border-radius: 4px;
        }
        
        .nav-link.active {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 147, 30, 0.15)) !important;
          border-color: rgba(255, 107, 53, 0.3) !important;
          color: var(--primary) !important;
        }
        
        .nav-link:hover:not(.active) {
          background: rgba(255, 107, 53, 0.1) !important;
          border-color: rgba(255, 107, 53, 0.2) !important;
          color: var(--primary) !important;
        }
        
        .tab-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .tab-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .tab-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 10px;
        }
        
        @media (max-width: 768px) {
          .modal-dialog {
            margin: 0.5rem !important;
            max-width: calc(100vw - 1rem) !important;
          }
          
          .modal-content {
            height: 90vh !important;
          }
          
          .modal-header {
            padding: 1rem 1.25rem !important;
          }
          
          .modal-header h4 {
            font-size: 1.25rem !important;
          }
          
          .tab-content {
            padding: 1rem !important;
          }
        }
      </style>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }
  
  renderFreeThemes() {
    return `<select class="form-select form-select-sm" onchange="applyTheme(this.value); this.value=''" style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);">
      <option value="">Selecciona un tema...</option>
      ${Object.entries(this.themes.free).map(([key, theme]) => `<option value="${key}">${theme.name}</option>`).join('')}
    </select>`;
  }
  
  renderFreeFrames() {
    return `<select class="form-select form-select-sm" onchange="applyAvatarFrame(this.value); this.value=''" style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);">
      <option value="">Selecciona un marco...</option>
      ${Object.entries(this.avatarFrames.free).map(([key, frame]) => `<option value="${key}">${frame.name}</option>`).join('')}
    </select>`;
  }
  
  renderPremiumThemes() {
    return `<select class="form-select form-select-sm" onchange="purchaseTheme(this.value); this.value=''" style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);">
      <option value="">Selecciona un tema premium...</option>
      ${Object.entries(this.themes.premium).map(([key, theme]) => `<option value="${key}">${theme.name} - ${theme.price} pts</option>`).join('')}
    </select>`;
  }
  
  renderPremiumFrames() {
    return `<select class="form-select form-select-sm" onchange="purchaseFrame(this.value); this.value=''" style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);">
      <option value="">Selecciona un marco premium...</option>
      ${Object.entries(this.avatarFrames.premium).map(([key, frame]) => `<option value="${key}">${frame.name} - ${frame.price} pts</option>`).join('')}
    </select>`;
  }
  
  renderVipThemes() {
    return `<select class="form-select form-select-sm" onchange="applyTheme(this.value); this.value=''" style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);" ${this.hasVipAccess() ? '' : 'disabled'}>
      <option value="">${this.hasVipAccess() ? 'Selecciona un tema VIP...' : 'Requiere VIP'}</option>
      ${Object.entries(this.themes.vip).map(([key, theme]) => `<option value="${key}">${theme.name}</option>`).join('')}
    </select>`;
  }
  
  renderVipFrames() {
    return `<select class="form-select form-select-sm" onchange="applyAvatarFrame(this.value); this.value=''" style="background: var(--bg-dark); border: 1px solid var(--primary); color: var(--text-primary);" ${this.hasVipAccess() ? '' : 'disabled'}>
      <option value="">${this.hasVipAccess() ? 'Selecciona un marco VIP...' : 'Requiere VIP'}</option>
      ${Object.entries(this.avatarFrames.vip).map(([key, frame]) => `<option value="${key}">${frame.name}</option>`).join('')}
    </select>`;
  }
  
  applyTheme(themeName, skipFirebaseSync = false) {
    const body = document.body;
    
    if (this.themes.vip[themeName] && !this.hasVipAccess()) {
      if (window.guestbookApp && window.guestbookApp.ui) {
        window.guestbookApp.ui.showNotification('❌ Necesitas el tag VIP para usar este tema', 'error');
      }
      return;
    }
    
    if (this.themes.premium[themeName] && !this.hasPurchased('themes', themeName)) {
      if (window.guestbookApp && window.guestbookApp.ui) {
        window.guestbookApp.ui.showNotification('❌ Debes comprar este tema primero', 'error');
      }
      return;
    }
    
    // Remover todas las clases de tema
    body.className = body.className.split(' ').filter(c => !c.endsWith('-theme')).join(' ');
    
    // Aplicar nuevo tema
    if (themeName !== 'default') {
      body.classList.add(themeName + '-theme');
    }
    
    // Crear copos de nieve para temas navideños
    if (themeName === 'christmas' || themeName === 'funkyatlas-christmas') {
      this.createSnowflakes();
    } else {
      document.querySelectorAll('.snowflake').forEach(el => el.remove());
    }
    
    // Guardar en localStorage de Guestbook
    localStorage.setItem('guestbook-theme', themeName);
    
    // 🔄 SINCRONIZAR CON LABORATORY
    // Guardar también en el localStorage que usa Laboratory
    localStorage.setItem('theme', themeName);
    
    // Si existe la función setTheme de Laboratory, llamarla también
    if (typeof window.setTheme === 'function' && window.setTheme !== this.applyTheme) {
      try {
        window.setTheme(themeName);
        console.log(`🔄 Tema sincronizado con Laboratory: ${themeName}`);
      } catch (error) {
        console.warn('Error sincronizando tema con Laboratory:', error);
      }
    }
    
    // 🔥 GUARDAR EN FIREBASE (solo si NO se solicita saltar y el usuario está logueado)
    // Esto evita escrituras innecesarias cuando se carga el tema guardado al iniciar
    if (!skipFirebaseSync) {
      this.saveThemeToFirebase(themeName);
    }
    
    if (window.guestbookApp && window.guestbookApp.ui) {
      const theme = this.themes.free[themeName] || this.themes.premium[themeName] || this.themes.vip[themeName];
      if (theme) {
        window.guestbookApp.ui.showNotification(`✅ ${theme.name} aplicado`, 'success');
      }
    }
  }
  
  createSnowflakes() {
    document.querySelectorAll('.snowflake').forEach(el => el.remove());
    for (let i = 0; i < 50; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.innerHTML = '❄️';
      snowflake.style.left = Math.random() * 100 + '%';
      snowflake.style.animationDuration = (Math.random() * 3 + 5) + 's';
      snowflake.style.animationDelay = Math.random() * 5 + 's';
      snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
      snowflake.style.opacity = Math.random() * 0.6 + 0.4;
      document.body.appendChild(snowflake);
    }
  }
  
  applyAvatarFrame(frameKey) {
    const frame = this.avatarFrames.free[frameKey] || this.avatarFrames.premium[frameKey] || this.avatarFrames.vip[frameKey];
    if (!frame) return;
    
    if (frame.requiresVip && !this.hasVipAccess()) {
      if (window.guestbookApp && window.guestbookApp.ui) {
        window.guestbookApp.ui.showNotification('❌ Necesitas el tag VIP para usar este marco', 'error');
      }
      return;
    }
    
    if (this.avatarFrames.premium[frameKey] && !this.hasPurchased('frames', frameKey)) {
      if (window.guestbookApp && window.guestbookApp.ui) {
        window.guestbookApp.ui.showNotification('❌ Debes comprar este marco primero', 'error');
      }
      return;
    }
    
    localStorage.setItem('guestbook-avatar-frame', frameKey);
    
    if (this.isUserLoggedIn()) {
      window.guestbookApp.profiles.currentProfile.avatarFrame = frameKey;
      window.guestbookApp.profiles.saveProfile();
    }
    
    if (window.guestbookApp && window.guestbookApp.ui) {
      window.guestbookApp.ui.showNotification(`✅ ${frame.name} aplicado`, 'success');
    }
  }
  
  loadSavedTheme() {
    // Prioridad de carga: Guestbook > Laboratory
    let savedTheme = localStorage.getItem('guestbook-theme');
    
    // Si no hay tema guardado en Guestbook, intentar cargar desde Laboratory
    if (!savedTheme) {
      savedTheme = localStorage.getItem('theme');
      
      // Si encontramos tema de Laboratory, sincronizar con Guestbook
      if (savedTheme && savedTheme !== 'dark') {
        localStorage.setItem('guestbook-theme', savedTheme);
        console.log(`🔄 Tema importado desde Laboratory: ${savedTheme}`);
      }
    }
    
    if (savedTheme && savedTheme !== 'dark') {
      // ⚡ Pasar skipFirebaseSync=true para evitar escrituras innecesarias al cargar
      this.applyTheme(savedTheme, true);
    }
    
    // Crear copos si el tema guardado es navideño
    if (savedTheme === 'christmas' || savedTheme === 'funkyatlas-christmas') {
      setTimeout(() => this.createSnowflakes(), 100);
    }
  }
  
  loadSavedFrame() {
    const savedFrame = localStorage.getItem('guestbook-avatar-frame');
    if (savedFrame) {
      // Frame loading logic here
    }
  }
  
  hasVipAccess() {
    if (!this.isUserLoggedIn()) {
      return false;
    }
    
    const profile = window.guestbookApp.profiles.currentProfile;
    if (!profile || !profile.userTags || !Array.isArray(profile.userTags)) {
      return false;
    }
    
    const userTags = profile.userTags;
    
    // OWNER y ADMIN siempre tienen acceso VIP
    if (userTags.includes('OWNER') || userTags.includes('ADMIN')) {
      return true;
    }
    
    // Para usuarios regulares, verificar tag VIP
    if (!userTags.includes('VIP')) {
      return false;
    }
    
    // Si tiene VIP permanente, tiene acceso
    if (profile.vipExpiry === 'permanent') {
      return true;
    }
    
    // Si tiene VIP temporal, verificar expiración
    if (profile.vipExpiry) {
      const expiryDate = new Date(profile.vipExpiry);
      const now = new Date();
      return now <= expiryDate;
    }
    
    // Si tiene tag VIP pero no hay fecha de expiración válida, no tiene acceso
    return false;
  }
  
  getUserPoints() {
    // Si está conectado a Laboratory, usar sus puntos
    if (this.useLaboratoryPoints && window.achievementSystem) {
      return window.achievementSystem.getPoints();
    }
    // Fallback a puntos locales del Guestbook
    return parseInt(localStorage.getItem('guestbook-user-points') || '0');
  }
  
  initPointsSystem() {
    // Integración con sistema de puntos de Laboratory
    this.initLaboratoryPointsSync();
    this.checkDailyBonus();
    this.setupActivityListeners();
  }
  
  initLaboratoryPointsSync() {
    // Intentar cargar el sistema de achievements de Laboratory
    if (window.achievementSystem) {
      console.log('✅ Sistema de puntos de Laboratory detectado');
      this.useLaboratoryPoints = true;
      
      // 🔄 IMPORTAR TEMAS DESBLOQUEADOS DE LABORATORY
      this.importUnlockedThemesFromLaboratory();
    } else {
      console.log('⚠️ Sistema de puntos de Laboratory no detectado aún, esperando...');
      this.useLaboratoryPoints = false;
      
      // Escuchar el evento de Laboratory
      window.addEventListener('laboratory-points-ready', () => {
        console.log('✅ Laboratory cargado, activando integración de puntos');
        this.useLaboratoryPoints = true;
        this.updatePointsDisplay();
        
        // Importar temas al cargar Laboratory
        this.importUnlockedThemesFromLaboratory();
      });
    }
  }
  
  // Importar temas desbloqueados desde Laboratory
  importUnlockedThemesFromLaboratory() {
    if (!window.achievementSystem || !window.achievementSystem.gameData) {
      return;
    }
    
    const unlockedThemes = window.achievementSystem.gameData.unlockedThemes;
    if (!unlockedThemes || unlockedThemes.size === 0) {
      return;
    }
    
    // Obtener compras actuales de Guestbook
    const purchased = JSON.parse(localStorage.getItem('vip-purchased-items') || '[]');
    let imported = 0;
    
    // Importar cada tema desbloqueado de Laboratory
    unlockedThemes.forEach(themeKey => {
      const itemId = `theme-${themeKey}`;
      
      // Solo importar si no está ya en la lista (evitar duplicados)
      if (!purchased.includes(itemId)) {
        purchased.push(itemId);
        imported++;
      }
    });
    
    if (imported > 0) {
      // Remover duplicados antes de guardar
      const uniquePurchased = [...new Set(purchased)];
      localStorage.setItem('vip-purchased-items', JSON.stringify(uniquePurchased));
      console.log(`✅ Importados ${imported} temas desde Laboratory (${uniquePurchased.length} total)`);
    }
  }
  
  setupActivityListeners() {
    // Escuchar cuando se guarda un dibujo
    if (window.guestbookApp && window.guestbookApp.firebase) {
      const originalSaveDrawing = window.guestbookApp.firebase.saveDrawing.bind(window.guestbookApp.firebase);
      window.guestbookApp.firebase.saveDrawing = async (drawingData) => {
        const result = await originalSaveDrawing(drawingData);
        if (result) {
          this.awardPoints(10, 'Dibujo creado');
        }
        return result;
      };
      
      // Escuchar cuando se agrega un comentario
      const originalAddComment = window.guestbookApp.firebase.addComment.bind(window.guestbookApp.firebase);
      window.guestbookApp.firebase.addComment = async (drawingId, commentData) => {
        const result = await originalAddComment(drawingId, commentData);
        if (result) {
          this.awardPoints(5, 'Comentario agregado');
        }
        return result;
      };
      
      // Escuchar cuando se da like
      const originalToggleLike = window.guestbookApp.firebase.toggleLike.bind(window.guestbookApp.firebase);
      window.guestbookApp.firebase.toggleLike = async (drawingId, isLiked) => {
        const result = await originalToggleLike(drawingId, isLiked);
        if (result && isLiked) {
          this.awardPoints(2, 'Like dado');
        }
        return result;
      };
    }
  }
  
  awardPoints(amount, reason = '') {
    let newPoints;
    
    // Si está conectado a Laboratory, usar su sistema
    if (this.useLaboratoryPoints && window.achievementSystem) {
      const addedPoints = window.achievementSystem.addPoints(amount);
      newPoints = window.achievementSystem.getPoints();
      console.log(`💎 Puntos agregados via Laboratory: +${addedPoints} (Total: ${newPoints})`);
    } else {
      // Fallback a sistema local
      const currentPoints = this.getUserPoints();
      newPoints = currentPoints + amount;
      localStorage.setItem('guestbook-user-points', newPoints.toString());
      console.log(`💰 Puntos agregados localmente: +${amount} (Total: ${newPoints})`);
    }
    
    // Agregar al historial (mantener historial local para Guestbook)
    this.addToPointsHistory(amount, reason, 'earned');
    
    if (window.guestbookApp && window.guestbookApp.ui) {
      window.guestbookApp.ui.showNotification(`+${amount} puntos: ${reason}`, 'success');
    }
    
    // Actualizar display de puntos si está visible
    this.updatePointsDisplay();
    
    return newPoints;
  }
  
  updatePointsDisplay() {
    const pointsElements = document.querySelectorAll('[data-points-display]');
    pointsElements.forEach(el => {
      el.textContent = this.getUserPoints();
    });
  }
  
  checkDailyBonus() {
    const today = new Date().toDateString();
    const lastBonus = localStorage.getItem('guestbook-last-daily-bonus');
    
    if (lastBonus !== today) {
      const bonusAmount = 25;
      this.awardPoints(bonusAmount, 'Bonificación diaria');
      localStorage.setItem('guestbook-last-daily-bonus', today);
      
      if (window.guestbookApp && window.guestbookApp.ui) {
        setTimeout(() => {
          window.guestbookApp.ui.showNotification('🎁 ¡Bonificación diaria recibida!', 'info');
        }, 1000);
      }
    }
  }
  
  getPointsHistory() {
    return JSON.parse(localStorage.getItem('guestbook-points-history') || '[]');
  }
  
  addToPointsHistory(amount, reason, type = 'earned') {
    const history = this.getPointsHistory();
    history.unshift({
      amount,
      reason,
      type,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString()
    });
    
    // Mantener solo los últimos 50 registros
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem('guestbook-points-history', JSON.stringify(history));
  }
  
  renderModernContent(category) {
    const items = this.getItemsByCategory(category);
    
    if (!items || items.length === 0) {
      return `
        <div style="text-align: center; padding: 3rem 2rem; color: var(--text-muted);">
          <div style="font-size: 3em; margin-bottom: 1rem; opacity: 0.3;">📦</div>
          <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Próximamente</h4>
          <p style="margin: 0;">Contenido disponible próximamente</p>
        </div>
      `;
    }
    
    return `
      <div class="modern-items-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        ${items.map(item => this.renderModernItem(item, category)).join('')}
      </div>
    `;
  }
  
  getItemsByCategory(category) {
    const items = [];
    
    if (category === 'free') {
      // Temas gratis desde this.themes.free
      Object.entries(this.themes.free).forEach(([key, theme]) => {
        items.push({
          id: `theme-${key}`,
          name: theme.name,
          type: 'theme',
          price: 0,
          description: `Colores: ${theme.colors.primary} y ${theme.colors.secondary}`,
          emoji: theme.name.split(' ')[0]
        });
      });
      
      // Marcos gratis desde this.avatarFrames.free
      Object.entries(this.avatarFrames.free).forEach(([key, frame]) => {
        if (key !== 'none') { // Excluir "Sin Marco"
          items.push({
            id: `frame-${key}`,
            name: frame.name,
            type: 'frame',
            price: 0,
            description: frame.description,
            emoji: '⬜'
          });
        }
      });
    } else if (category === 'premium') {
      // Temas premium desde this.themes.premium
      Object.entries(this.themes.premium).forEach(([key, theme]) => {
        items.push({
          id: `theme-${key}`,
          name: theme.name,
          type: 'theme',
          price: theme.price || 100,
          description: `Colores: ${theme.colors.primary} y ${theme.colors.secondary}`,
          emoji: theme.name.split(' ')[0]
        });
      });
      
      // Marcos premium desde this.avatarFrames.premium
      if (this.avatarFrames.premium) {
        Object.entries(this.avatarFrames.premium).forEach(([key, frame]) => {
          items.push({
            id: `frame-${key}`,
            name: frame.name,
            type: 'frame',
            price: frame.price || 100,
            description: frame.description,
            emoji: '🖼️'
          });
        });
      }
    } else if (category === 'vip') {
      // Temas VIP desde this.themes.vip
      Object.entries(this.themes.vip).forEach(([key, theme]) => {
        items.push({
          id: `theme-${key}`,
          name: theme.name,
          type: 'theme',
          price: 0,
          description: `Exclusivo VIP: ${theme.colors.primary} y ${theme.colors.secondary}`,
          emoji: theme.name.split(' ')[0],
          vipOnly: true
        });
      });
      
      // Marcos VIP desde this.avatarFrames.vip
      if (this.avatarFrames.vip) {
        Object.entries(this.avatarFrames.vip).forEach(([key, frame]) => {
          items.push({
            id: `frame-${key}`,
            name: frame.name,
            type: 'frame',
            price: 0,
            description: frame.description + ' (VIP)',
            emoji: '👑',
            vipOnly: true
          });
        });
      }
    }
    
    return items;
  }
  
  renderModernItem(item, category) {
    const isVip = category === 'vip';
    const canPurchase = !isVip || this.hasVipAccess();
    const userPoints = this.getUserPoints();
    const canAfford = userPoints >= item.price;
    
    const isPurchased = this.isPurchased(item.id);
    
    return `
      <div class="modern-item-card" style="
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        cursor: ${canPurchase && !isPurchased ? 'pointer' : 'default'};
        position: relative;
        overflow: hidden;
      " onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='rgba(var(--primary-rgb), 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255, 255, 255, 0.1)'">
        
        ${isVip ? '<div style="position: absolute; top: 10px; right: 10px; background: linear-gradient(135deg, #FFD700, #FFA500); color: black; padding: 4px 12px; border-radius: 20px; font-size: 0.75em; font-weight: 700;">👑 VIP</div>' : ''}
        
        <div style="font-size: 3em; text-align: center; margin-bottom: 1rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
          ${item.emoji || item.name.split(' ')[0] || '🎨'}
        </div>
        
        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.1em; text-align: center;">
          ${item.name.includes(' ') ? item.name.substring(item.name.indexOf(' ') + 1) : item.name}
        </h4>
        
        <p style="color: var(--text-muted); font-size: 0.9em; text-align: center; margin-bottom: 1rem; min-height: 2.5em;">
          ${item.description}
        </p>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          ${item.price > 0 ? `
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 600; color: var(--primary);">
              <span style="font-size: 1.2em;">💎</span>
              <span>${item.price}</span>
            </div>
          ` : `
            <div style="color: #4ade80; font-weight: 600;">✨ GRATIS</div>
          `}
          
          ${isPurchased ? `
            <button onclick="vipStore.applyItem('${item.id}', '${item.type}')" style="
              background: linear-gradient(135deg, #4ade80, #22c55e);
              color: white;
              border: none;
              padding: 8px 20px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 0.9em;
            ">
              ✓ Usar
            </button>
          ` : canPurchase ? (item.price === 0 || canAfford ? `
            <button onclick="vipStore.purchaseItem('${item.id}', ${item.price})" style="
              background: linear-gradient(135deg, var(--primary), var(--secondary));
              color: white;
              border: none;
              padding: 8px 20px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 0.9em;
            ">
              ${item.price === 0 ? 'Obtener' : 'Comprar'}
            </button>
          ` : `
            <button disabled style="
              background: rgba(255, 255, 255, 0.1);
              color: rgba(255, 255, 255, 0.3);
              border: none;
              padding: 8px 20px;
              border-radius: 8px;
              font-weight: 600;
              cursor: not-allowed;
              font-size: 0.9em;
            ">
              No puedes
            </button>
          `) : `
            <button disabled style="
              background: rgba(255, 255, 255, 0.1);
              color: rgba(255, 255, 255, 0.3);
              border: none;
              padding: 8px 20px;
              border-radius: 8px;
              font-weight: 600;
              cursor: not-allowed;
              font-size: 0.9em;
            ">
              🔒 VIP
            </button>
          `}
        </div>
      </div>
    `;
  }
  
  renderVipTagsModern() {
    return `
      <div style="margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05)); border-radius: 16px; border: 2px solid rgba(255, 215, 0, 0.3);">
        <h3 style="color: #FFD700; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5em;">👑</span>
          <span>Tags VIP Exclusivos</span>
        </h3>
        <p style="color: var(--text-muted); margin: 0;">
          Personaliza tu perfil con tags únicos que solo los usuarios VIP pueden obtener
        </p>
      </div>
      
      <div class="modern-items-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
        ${this.renderVipTagsGrid()}
      </div>
    `;
  }
  
  renderVipTagsGrid() {
    const vipTags = {
      'legendary': { name: '⚡ Legendario', color: '#FFD700', price: 500, glow: true },
      'master': { name: '🎨 Maestro', color: '#9333EA', price: 300, glow: true },
      'veteran': { name: '🛡️ Veterano', color: '#3B82F6', price: 200, glow: false },
      'artist': { name: '🖌️ Artista Pro', color: '#EC4899', price: 250, glow: false },
      'patron': { name: '💎 Patrocinador', color: '#10B981', price: 400, glow: true }
    };
    
    return Object.entries(vipTags).map(([key, tag]) => {
      const isPurchased = this.isPurchased(`tag-${key}`);
      const userPoints = this.getUserPoints();
      const canAfford = userPoints >= tag.price;
      const hasVip = this.hasVipAccess();
      
      return `
        <div class="vip-tag-card" style="
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(10px);
          border: 2px solid ${tag.color}40;
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          ${tag.glow ? `box-shadow: 0 0 20px ${tag.color}30;` : ''}
        " onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='${tag.color}'" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='${tag.color}40'">
          
          <div style="font-size: 3em; margin-bottom: 1rem; filter: drop-shadow(0 4px 12px ${tag.color});">
            ${tag.name.split(' ')[0]}
          </div>
          
          <h4 style="color: ${tag.color}; margin-bottom: 1rem; font-size: 1.2em; text-shadow: 0 0 10px ${tag.color}50;">
            ${tag.name.substring(tag.name.indexOf(' ') + 1)}
          </h4>
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 1rem; font-weight: 700; font-size: 1.3em; color: var(--primary);">
            <span>💎</span>
            <span>${tag.price}</span>
          </div>
          
          ${isPurchased ? `
            <button onclick="vipStore.applyTag('${key}')" style="
              background: linear-gradient(135deg, #4ade80, #22c55e);
              color: white;
              border: none;
              padding: 10px 24px;
              border-radius: 10px;
              font-weight: 700;
              cursor: pointer;
              width: 100%;
            ">
              ✓ Equipar
            </button>
          ` : hasVip && canAfford ? `
            <button onclick="vipStore.purchaseTag('${key}', ${tag.price})" style="
              background: linear-gradient(135deg, ${tag.color}, ${tag.color}DD);
              color: white;
              border: none;
              padding: 10px 24px;
              border-radius: 10px;
              font-weight: 700;
              cursor: pointer;
              width: 100%;
            ">
              Comprar
            </button>
          ` : !hasVip ? `
            <button disabled style="
              background: rgba(255, 255, 255, 0.1);
              color: rgba(255, 255, 255, 0.3);
              border: 1px solid rgba(255, 255, 255, 0.2);
              padding: 10px 24px;
              border-radius: 10px;
              font-weight: 700;
              cursor: not-allowed;
              width: 100%;
            ">
              🔒 Requiere VIP
            </button>
          ` : `
            <button disabled style="
              background: rgba(255, 255, 255, 0.1);
              color: rgba(255, 255, 255, 0.3);
              border: 1px solid rgba(255, 255, 255, 0.2);
              padding: 10px 24px;
              border-radius: 10px;
              font-weight: 700;
              cursor: not-allowed;
              width: 100%;
            ">
              Puntos insuficientes
            </button>
          `}
        </div>
      `;
    }).join('');
  }
  
  isPurchased(itemId) {
    // Verificar en localStorage de Guestbook
    const purchased = JSON.parse(localStorage.getItem('vip-purchased-items') || '[]');
    if (purchased.includes(itemId)) {
      return true;
    }
    
    // 🔄 VERIFICAR EN LABORATORY
    if (itemId.startsWith('theme-')) {
      const themeKey = itemId.replace('theme-', '');
      
      // Verificar en achievementSystem de Laboratory
      if (window.achievementSystem && window.achievementSystem.gameData) {
        const unlockedThemes = window.achievementSystem.gameData.unlockedThemes;
        if (unlockedThemes && unlockedThemes.has(themeKey)) {
          // Si está desbloqueado en Laboratory, agregarlo a Guestbook también
          purchased.push(itemId);
          localStorage.setItem('vip-purchased-items', JSON.stringify(purchased));
          return true;
        }
      }
      
      // Verificar marca de compra de Laboratory
      if (localStorage.getItem(`purchased_${themeKey}`)) {
        // Si tiene la marca de Laboratory, agregarlo a Guestbook
        purchased.push(itemId);
        localStorage.setItem('vip-purchased-items', JSON.stringify(purchased));
        return true;
      }
    }
    
    return false;
  }
  
  purchaseItem(itemId, price) {
    const userPoints = this.getUserPoints();
    
    if (price > 0 && userPoints < price) {
      alert('❌ No tienes suficientes puntos');
      return;
    }
    
    // Gastar puntos
    if (price > 0) {
      this.spendPoints(price, `Compra: ${itemId}`);
    }
    
    // Guardar compra en Guestbook
    const purchased = JSON.parse(localStorage.getItem('vip-purchased-items') || '[]');
    if (!purchased.includes(itemId)) {
      purchased.push(itemId);
      localStorage.setItem('vip-purchased-items', JSON.stringify(purchased));
    }
    
    // 🔄 SINCRONIZAR COMPRA CON LABORATORY
    if (itemId.startsWith('theme-')) {
      const themeKey = itemId.replace('theme-', '');
      
      // Desbloquear en Laboratory si existe el sistema
      if (window.achievementSystem && window.achievementSystem.gameData) {
        if (!window.achievementSystem.gameData.unlockedThemes) {
          window.achievementSystem.gameData.unlockedThemes = new Set();
        }
        
        window.achievementSystem.gameData.unlockedThemes.add(themeKey);
        
        // Guardar marca de compra con timestamp
        localStorage.setItem(`purchased_${themeKey}`, Date.now().toString());
        
        // Guardar en achievementSystem
        window.achievementSystem.save();
        
        console.log(`✅ Tema desbloqueado en Laboratory: ${themeKey}`);
        
        // Sincronizar con Firebase de Laboratory si existe
        if (window.firebaseThemes && window.firebaseThemes.syncUnlockedThemes) {
          const themesArray = Array.from(window.achievementSystem.gameData.unlockedThemes);
          window.firebaseThemes.syncUnlockedThemes(themesArray).catch(err => 
            console.warn('Error sincronizando temas con Firebase:', err)
          );
        }
      }
    }
    
    // Actualizar UI del modal sin cerrarlo
    alert(`✅ ¡Compra exitosa! Tema desbloqueado`);
    
    // Actualizar solo el contenido del tab actual
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab) {
      const tabId = activeTab.id;
      let category = 'free';
      if (tabId === 'market-content') category = 'premium';
      if (tabId === 'vip-content') category = 'vip';
      
      activeTab.innerHTML = this.renderModernContent(category);
    }
    
    // Actualizar display de puntos
    this.updatePointsDisplay();
  }
  
  applyItem(itemId, type) {
    if (type === 'theme') {
      // Extraer el key del tema (remover 'theme-' del inicio)
      const themeKey = itemId.replace('theme-', '');
      this.applyTheme(themeKey);
      
      if (window.guestbookApp && window.guestbookApp.ui) {
        window.guestbookApp.ui.showNotification(`✨ Tema aplicado: ${themeKey}`, 'success');
      } else {
        alert(`✨ ¡Tema aplicado: ${themeKey}!`);
      }
    } else if (type === 'frame') {
      // Extraer el key del marco (remover 'frame-' del inicio)
      const frameKey = itemId.replace('frame-', '');
      this.applyAvatarFrame(frameKey);
      
      if (window.guestbookApp && window.guestbookApp.ui) {
        window.guestbookApp.ui.showNotification(`✨ Marco aplicado: ${frameKey}`, 'success');
      } else {
        alert(`✨ ¡Marco aplicado: ${frameKey}!`);
      }
    }
    
    // NO reabrir el modal, ya está abierto
  }
  
  purchaseTag(tagKey, price) {
    this.purchaseItem(`tag-${tagKey}`, price);
  }
  
  applyTag(tagKey) {
    localStorage.setItem('active-vip-tag', tagKey);
    alert(`✨ ¡Tag equipado exitosamente!`);
    this.showStore();
  }
  
  renderPointsHistory() {
    const history = this.getPointsHistory();
    
    if (history.length === 0) {
      return `
        <div class="text-center text-muted">
          <div style="font-size: 3em; margin-bottom: 15px;">📊</div>
          <p>No hay actividad aún</p>
          <small>Empieza a dibujar para ganar puntos</small>
        </div>
      `;
    }
    
    const totalEarned = history.filter(h => h.type === 'earned').reduce((sum, h) => sum + h.amount, 0);
    const totalSpent = history.filter(h => h.type === 'spent').reduce((sum, h) => sum + h.amount, 0);
    
    return `
      <div class="row mb-3">
        <div class="col-md-4">
          <div class="card" style="background: var(--bg-light); border: 1px solid #28a745;">
            <div class="card-body text-center">
              <h6 style="color: #28a745;">💰 Total Ganado</h6>
              <h4 style="color: #28a745;">${totalEarned}</h4>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card" style="background: var(--bg-light); border: 1px solid #dc3545;">
            <div class="card-body text-center">
              <h6 style="color: #dc3545;">💸 Total Gastado</h6>
              <h4 style="color: #dc3545;">${totalSpent}</h4>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card" style="background: var(--bg-light); border: 1px solid var(--primary);">
            <div class="card-body text-center">
              <h6 style="color: var(--primary);">💎 Balance Actual</h6>
              <h4 style="color: var(--primary);">${this.getUserPoints()}</h4>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" style="background: var(--bg-light); border: 1px solid var(--primary); max-height: 400px; overflow-y: auto;">
        <div class="card-header" style="background: var(--primary)11; border-bottom: 1px solid var(--primary);">
          <h6 style="color: var(--primary); margin: 0;">📋 Actividad Reciente</h6>
        </div>
        <div class="card-body p-1">
          ${history.map(entry => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-1" style="background: var(--bg-dark); border-radius: 6px; border-left: 3px solid ${entry.type === 'earned' ? '#28a745' : '#dc3545'};">
              <div>
                <div style="color: ${entry.type === 'earned' ? '#28a745' : '#dc3545'}; font-weight: bold;">
                  ${entry.type === 'earned' ? '+' : '-'}${entry.amount} pts
                </div>
                <small class="text-muted">${entry.reason}</small>
              </div>
              <div class="text-end">
                <small class="text-muted">${entry.date}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  hasPoints(amount) {
    return this.getUserPoints() >= amount;
  }
  
  spendPoints(amount, reason = '') {
    const currentPoints = this.getUserPoints();
    if (currentPoints < amount) return false;
    
    // Si está conectado a Laboratory, gastar desde ahí
    if (this.useLaboratoryPoints && window.achievementSystem) {
      window.achievementSystem.gameData.points -= amount;
      window.achievementSystem.save();
      console.log(`💸 Puntos gastados via Laboratory: -${amount} (Restante: ${window.achievementSystem.getPoints()})`);
    } else {
      // Fallback a sistema local
      const newPoints = currentPoints - amount;
      localStorage.setItem('guestbook-user-points', newPoints.toString());
      console.log(`💸 Puntos gastados localmente: -${amount} (Restante: ${newPoints})`);
    }
    
    // Agregar al historial
    this.addToPointsHistory(amount, reason, 'spent');
    
    if (window.guestbookApp && window.guestbookApp.ui) {
      window.guestbookApp.ui.showNotification(`-${amount} puntos: ${reason}`, 'info');
    }
    
    // Actualizar display
    this.updatePointsDisplay();
    
    return true;
  }
  
  purchaseTheme(themeKey) {
    const theme = this.themes.premium[themeKey];
    if (!theme) return;
    
    if (!this.hasPoints(theme.price)) {
      if (window.guestbookApp && window.guestbookApp.ui) {
        window.guestbookApp.ui.showNotification(`❌ Necesitas ${theme.price} puntos (tienes ${this.getUserPoints()})`, 'error');
      }
      return;
    }
    
    if (confirm(`¿Comprar ${theme.name} por ${theme.price} puntos?`)) {
      if (this.spendPoints(theme.price, theme.name)) {
        const purchased = JSON.parse(localStorage.getItem('guestbook-purchased-themes') || '[]');
        if (!purchased.includes(themeKey)) {
          purchased.push(themeKey);
          localStorage.setItem('guestbook-purchased-themes', JSON.stringify(purchased));
        }
        
        this.applyTheme(themeKey);
        
        if (window.guestbookApp && window.guestbookApp.ui) {
          window.guestbookApp.ui.showNotification(`✅ ${theme.name} comprado!`, 'success');
        }
      }
    }
  }
  
  purchaseFrame(frameKey) {
    const frame = this.avatarFrames.premium[frameKey];
    if (!frame) return;
    
    if (!this.hasPoints(frame.price)) {
      if (window.guestbookApp && window.guestbookApp.ui) {
        window.guestbookApp.ui.showNotification(`❌ Necesitas ${frame.price} puntos (tienes ${this.getUserPoints()})`, 'error');
      }
      return;
    }
    
    if (confirm(`¿Comprar ${frame.name} por ${frame.price} puntos?`)) {
      if (this.spendPoints(frame.price, frame.name)) {
        const purchased = JSON.parse(localStorage.getItem('guestbook-purchased-frames') || '[]');
        if (!purchased.includes(frameKey)) {
          purchased.push(frameKey);
          localStorage.setItem('guestbook-purchased-frames', JSON.stringify(purchased));
        }
        
        this.applyAvatarFrame(frameKey);
        
        if (window.guestbookApp && window.guestbookApp.ui) {
          window.guestbookApp.ui.showNotification(`✅ ${frame.name} comprado!`, 'success');
        }
      }
    }
  }
  
  hasPurchased(type, key) {
    // Convertir a formato de itemId
    const itemId = `${type === 'themes' ? 'theme' : 'frame'}-${key}`;
    
    // Usar el método isPurchased sincronizado
    return this.isPurchased(itemId);
  }
  
  renderVipTagsStore() {
    return Object.entries(this.vipTags).map(([key, tag]) => `
      <div class="col-md-4 mb-3">
        <div class="card h-100" style="background: var(--bg-light); border: 2px solid #ffd700; cursor: pointer; opacity: ${this.hasPoints(tag.price) ? '1' : '0.6'};" onclick="purchaseVipTag('${key}')">
          <div class="card-body text-center">
            <div style="font-size: 2.5em; margin-bottom: 10px;">${key === 'vipPerma' ? '💎' : '👑'}</div>
            <h5 style="color: #ffd700; margin-bottom: 10px;">${tag.name}</h5>
            <p class="text-muted" style="font-size: 0.75em;">${tag.description}</p>
            <div class="mb-3">
              <span class="badge bg-info" style="font-size: 0.65em;">
                ${tag.duration === 'permanent' ? 'Permanente' : `${tag.duration} días`}
              </span>
            </div>
            <div class="d-grid">
              <span class="btn btn-warning" style="font-weight: bold;">${tag.price} puntos</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  purchaseVipTag(tagKey) {
    const tag = this.vipTags[tagKey];
    if (!tag) return;
    
    if (!this.hasPoints(tag.price)) {
      if (window.guestbookApp && window.guestbookApp.ui) {
        window.guestbookApp.ui.showNotification(`❌ Necesitas ${tag.price} puntos (tienes ${this.getUserPoints()})`, 'error');
      }
      return;
    }
    
    if (confirm(`¿Comprar ${tag.name} por ${tag.price} puntos?`)) {
      if (this.spendPoints(tag.price, tag.name)) {
        this.grantVipAccess(tag.duration);
        
        if (window.guestbookApp && window.guestbookApp.ui) {
          window.guestbookApp.ui.showNotification(`✅ ${tag.name} comprado! Ahora tienes acceso VIP`, 'success');
        }
      }
    }
  }
  
  grantVipAccess(duration) {
    if (!this.isUserLoggedIn()) {
      alert('⚠️ Debes iniciar sesión para obtener VIP');
      return;
    }
    
    const profile = window.guestbookApp.profiles.currentProfile;
    
    if (!profile.userTags) {
      profile.userTags = [];
    }
    
    if (!profile.userTags.includes('VIP')) {
      profile.userTags.push('VIP');
    }
    
    if (duration !== 'permanent') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + duration);
      profile.vipExpiry = expiryDate.toISOString();
    } else {
      profile.vipExpiry = 'permanent';
    }
    
    window.guestbookApp.profiles.saveProfile();
  }
  
  checkVipExpiry() {
    if (!this.isUserLoggedIn()) {
      return;
    }
    
    const profile = window.guestbookApp.profiles.currentProfile;
    if (!profile || !profile.userTags) {
      return;
    }
    
    // Solo verificar si tiene tag VIP y no es OWNER/ADMIN
    if (profile.userTags.includes('VIP') && !profile.userTags.includes('OWNER') && !profile.userTags.includes('ADMIN')) {
      // Si tiene VIP pero no hay fecha de expiración y no es permanente, remover VIP
      if (!profile.vipExpiry) {
        profile.userTags = profile.userTags.filter(tag => tag !== 'VIP');
        window.guestbookApp.profiles.saveProfile();
        return;
      }
      
      // Si no es permanente, verificar expiración
      if (profile.vipExpiry !== 'permanent') {
        const expiryDate = new Date(profile.vipExpiry);
        const now = new Date();
        
        if (now > expiryDate) {
          profile.userTags = profile.userTags.filter(tag => tag !== 'VIP');
          delete profile.vipExpiry;
          window.guestbookApp.profiles.saveProfile();
          
          if (window.guestbookApp && window.guestbookApp.ui) {
            window.guestbookApp.ui.showNotification('⏰ Tu acceso VIP ha expirado', 'warning');
          }
        }
      }
    }
  }
  
  updateProfileCircleFrame(profileCircle, frameKey) {
    if (!profileCircle || !profileCircle.style) return;
    
    const frame = this.avatarFrames.free[frameKey] || this.avatarFrames.premium[frameKey] || this.avatarFrames.vip[frameKey];
    if (!frame || frame.style === 'none') {
      profileCircle.style.border = '';
      profileCircle.style.boxShadow = '';
      profileCircle.style.animation = '';
      return;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = frame.style;
    
    profileCircle.style.border = tempDiv.style.border || '2px solid var(--primary)';
    profileCircle.style.boxShadow = tempDiv.style.boxShadow || '0 0 10px rgba(255, 107, 53, 0.4)';
    profileCircle.style.animation = tempDiv.style.animation || '';
  }
  
  // Personalizar panel de usuario según tema y VIP
  customizeUserPanel(userElement, userProfile) {
    if (!userElement || !userProfile) return;
    
    const userTheme = userProfile.selectedTheme || 'default';
    const hasVip = this.checkUserVipStatus(userProfile);
    const theme = this.themes.free[userTheme] || this.themes.premium[userTheme] || this.themes.vip[userTheme];
    
    // Aplicar colores del tema al panel
    if (theme && theme.colors) {
      userElement.style.setProperty('--user-primary', theme.colors.primary);
      userElement.style.setProperty('--user-secondary', theme.colors.secondary);
      
      // Personalizar borde del panel
      const panel = userElement.querySelector('.user-panel, .card');
      if (panel) {
        panel.style.border = `2px solid ${theme.colors.primary}`;
        panel.style.boxShadow = `0 0 10px ${theme.colors.primary}33`;
      }
    }
    
    // Añadir efectos VIP
    if (hasVip) {
      userElement.classList.add('vip-user');
      const vipBadge = userElement.querySelector('.vip-badge') || this.createVipBadge();
      if (!userElement.querySelector('.vip-badge')) {
        userElement.appendChild(vipBadge);
      }
    }
  }
  
  createVipBadge() {
    const badge = document.createElement('div');
    badge.className = 'vip-badge';
    badge.innerHTML = '👑';
    badge.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
      z-index: 10;
    `;
    return badge;
  }
  
  checkUserVipStatus(userProfile) {
    if (!userProfile.userTags) return false;
    
    const userTags = userProfile.userTags;
    if (userTags.includes('OWNER') || userTags.includes('ADMIN')) return true;
    if (!userTags.includes('VIP')) return false;
    
    if (userProfile.vipExpiry === 'permanent') return true;
    if (userProfile.vipExpiry) {
      const expiryDate = new Date(userProfile.vipExpiry);
      return new Date() <= expiryDate;
    }
    
    return false;
  }
  
  // Guardar tema del usuario en Firebase (con debounce para evitar escrituras excesivas)
  async saveThemeToFirebase(themeName) {
    if (!this.isUserLoggedIn()) {
      return;
    }
    
    // Cancelar guardado pendiente anterior
    if (this._saveThemeTimeout) {
      clearTimeout(this._saveThemeTimeout);
    }
    
    // Esperar 2 segundos antes de guardar (debounce)
    this._saveThemeTimeout = setTimeout(async () => {
      try {
        const profile = window.guestbookApp.profiles.currentProfile;
        profile.selectedTheme = themeName;
        await window.guestbookApp.profiles.saveProfile();
        console.log(`✅ Tema ${themeName} guardado en Firebase para ${profile.username}`);
      } catch (error) {
        console.error('❌ Error guardando tema en Firebase:', error);
      }
    }, 2000);
  }
  
  // Aplicar personalización a todos los paneles visibles
  updateAllUserPanels() {
    const userElements = document.querySelectorAll('[data-user-id]');
    userElements.forEach(element => {
      const userId = element.getAttribute('data-user-id');
      if (window.guestbookApp && window.guestbookApp.profiles) {
        const userProfile = window.guestbookApp.profiles.getUserById(userId);
        if (userProfile) {
          this.customizeUserPanel(element, userProfile);
        }
      }
    });
  }
  
  // Personalizar panel de perfil específico (para gallery.js)
  customizeProfilePanel(username, userProfile) {
    if (!userProfile) return;
    
    const userTheme = userProfile.selectedTheme || 'default';
    const hasVip = this.checkUserVipStatus(userProfile);
    const theme = this.themes.free[userTheme] || this.themes.premium[userTheme] || this.themes.vip[userTheme];
    
    // Buscar el modal de perfil del usuario
    const profileModal = document.querySelector(`#userProfileModal-${username.replace(/\s+/g, '')}`);
    if (!profileModal) return;
    
    // Personalizar colores del modal
    if (theme && theme.colors) {
      const modalContent = profileModal.querySelector('.modal-content');
      const modalHeader = profileModal.querySelector('.modal-header');
      const badges = profileModal.querySelectorAll('.badge');
      
      if (modalContent) {
        modalContent.style.border = `2px solid ${theme.colors.primary}`;
        modalContent.style.boxShadow = `0 0 20px ${theme.colors.primary}33`;
      }
      
      if (modalHeader) {
        modalHeader.style.borderBottom = `1px solid ${theme.colors.primary}`;
        modalHeader.style.background = `linear-gradient(135deg, ${theme.colors.primary}11, ${theme.colors.secondary}11)`;
      }
      
      badges.forEach(badge => {
        if (!badge.classList.contains('vip-badge')) {
          badge.style.background = `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
        }
      });
    }
    
    // Añadir efectos VIP
    if (hasVip) {
      profileModal.classList.add('vip-profile');
      
      // Añadir badge VIP al título
      const modalTitle = profileModal.querySelector('.modal-title');
      if (modalTitle && !modalTitle.querySelector('.vip-crown')) {
        const vipCrown = document.createElement('span');
        vipCrown.className = 'vip-crown';
        vipCrown.innerHTML = ' 👑';
        vipCrown.style.cssText = `
          color: #ffd700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
          animation: vipGlow 2s ease-in-out infinite alternate;
        `;
        modalTitle.appendChild(vipCrown);
      }
      
      // Personalizar estadísticas con efectos VIP
      const statsSection = profileModal.querySelector('.stats-section');
      if (statsSection) {
        statsSection.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))';
        statsSection.style.border = '1px solid rgba(255, 215, 0, 0.3)';
        statsSection.style.borderRadius = '8px';
        statsSection.style.padding = '15px';
      }
    }
  }
  
  // Función para ser llamada desde gallery.js
  applyProfileTheme(username, userProfile) {
    // Esperar un poco para que el modal se renderice
    setTimeout(() => {
      this.customizeProfilePanel(username, userProfile);
    }, 100);
  }
  
  // Función simple para aplicar tema a cualquier modal
  applyUserThemeToModal(modalElement, userTheme, isVip = false) {
    if (!modalElement || !userTheme) return;
    
    const theme = this.themes.free[userTheme] || this.themes.premium[userTheme] || this.themes.vip[userTheme];
    if (!theme || !theme.colors) return;
    
    const modalContent = modalElement.querySelector('.modal-content');
    const modalTitle = modalElement.querySelector('.modal-title');
    
    // Aplicar colores específicos del tema (no variables CSS)
    if (modalContent) {
      modalContent.style.border = `2px solid ${theme.colors.primary}`;
      modalContent.style.boxShadow = `0 0 15px ${theme.colors.primary}44`;
    }
    
    if (modalTitle) {
      modalTitle.style.color = theme.colors.primary;
    }
    
    // Reemplazar todas las referencias a var(--primary) con el color del tema del usuario
    const allElements = modalElement.querySelectorAll('*');
    allElements.forEach(el => {
      // Reemplazar en atributos style
      if (el.style.cssText && el.style.cssText.includes('var(--primary)')) {
        el.style.cssText = el.style.cssText.replace(/var\(--primary\)/g, theme.colors.primary);
      }
      
      // Reemplazar en innerHTML para estilos inline
      if (el.innerHTML && el.innerHTML.includes('var(--primary)')) {
        el.innerHTML = el.innerHTML.replace(/var\(--primary\)/g, theme.colors.primary);
      }
    });
    
    // Aplicar colores del tema a todos los textos principales
    const titleElements = modalElement.querySelectorAll('h4, h5, h6, strong');
    titleElements.forEach(el => {
      el.style.color = theme.colors.primary;
    });
    
    // Cambiar colores de estadísticas y elementos destacados
    const statElements = modalElement.querySelectorAll('[style*="color: var(--primary)"]');
    statElements.forEach(el => {
      el.style.color = theme.colors.primary;
    });
    
    // Aplicar fondo del tema al modal
    if (modalContent) {
      modalContent.style.background = `linear-gradient(135deg, ${theme.colors.primary}11, ${theme.colors.secondary}08)`;
    }
    
    // Aplicar marco del usuario al avatar
    const avatarElement = modalElement.querySelector('[style*="border-radius: 50%"]');
    if (avatarElement && window.guestbookApp?.vipStore) {
      const currentFrame = localStorage.getItem('guestbook-avatar-frame') || 'none';
      window.guestbookApp.vipStore.updateProfileCircleFrame(avatarElement, currentFrame);
    }
    
    // Efectos VIP
    if (isVip) {
      modalElement.classList.add('vip-profile');
      if (modalTitle && !modalTitle.querySelector('.vip-crown')) {
        modalTitle.innerHTML += ' 👑';
      }
    }
  }
}






