// Sistema de perfiles para Guestbook v1.0 - Diseño Sidebar
export class ProfileManagerV2 {
  constructor(firebaseManager) {
    this.firebase = firebaseManager;
    this.currentProfile = {
      username: '',
      avatar: '👤',
      avatarType: 'emoji',
      avatarImage: null,
      bannerImage: null,
      bio: '',
      pronouns: '',
      isLoggedIn: false,
      sessionToken: null
    };
    
    this.init();
  }
  
  async init() {
    await this.loadProfile();
    this.createSidebar();
    this.createBurgerButton();
  }
  
  async loadProfile() {
    const saved = localStorage.getItem('userProfile');
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (saved && sessionToken) {
      const profile = JSON.parse(saved);
      if (profile.sessionToken === sessionToken && profile.isLoggedIn) {
        this.currentProfile = profile;
        console.log('✅ Sesión restaurada:', this.currentProfile.username);
        
        // Cargar datos actualizados desde Firebase
        try {
          const firebaseProfile = await this.firebase.getUserProfile(this.currentProfile.username);
          if (firebaseProfile) {
            if (firebaseProfile.avatar) this.currentProfile.avatar = firebaseProfile.avatar;
            if (firebaseProfile.avatarType) this.currentProfile.avatarType = firebaseProfile.avatarType;
            if (firebaseProfile.avatarImage) this.currentProfile.avatarImage = firebaseProfile.avatarImage;
            if (firebaseProfile.bannerImage) this.currentProfile.bannerImage = firebaseProfile.bannerImage;
            if (firebaseProfile.bio) this.currentProfile.bio = firebaseProfile.bio;
            if (firebaseProfile.pronouns) this.currentProfile.pronouns = firebaseProfile.pronouns;
            if (firebaseProfile.privacy) this.currentProfile.privacy = firebaseProfile.privacy;
            console.log('🔄 Perfil sincronizado desde Firebase');
          }
        } catch (error) {
          console.warn('Error sincronizando perfil desde Firebase:', error);
        }
      }
    }
  }
  
  createBurgerButton() {
    const btn = document.createElement('button');
    btn.id = 'profileBurger';
    btn.className = 'profile-burger-btn';
    btn.innerHTML = `
      <div class="burger-lines">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    
    btn.addEventListener('click', () => this.toggleSidebar());
    document.body.appendChild(btn);
  }
  
  createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'profileSidebar';
    sidebar.className = 'profile-sidebar';
    sidebar.innerHTML = this.getSidebarHTML();
    
    document.body.appendChild(sidebar);
    this.attachSidebarEvents();
  }
  
  getSidebarHTML() {
    const avatarContent = this.getAvatarDisplay();
    
    return `
      <div class="sidebar-header">
        <button class="sidebar-close" onclick="window.guestbookApp.profiles.toggleSidebar()">
          <i data-lucide="x"></i>
        </button>
        <h3>Mi Perfil</h3>
      </div>
      
      <div class="sidebar-content">
        ${!this.currentProfile.isLoggedIn ? `
          <!-- Login/Register -->
          <div class="auth-section">
            <div class="profile-avatar-display">
              ${avatarContent}
            </div>
            <p class="text-center text-muted">No has iniciado sesión</p>
            
            <div class="auth-tabs">
              <button class="auth-tab active" data-tab="login">Iniciar Sesión</button>
              <button class="auth-tab" data-tab="register">Registrarse</button>
            </div>
            
            <!-- Login Form -->
            <div class="auth-form" id="loginForm">
              <div class="form-group">
                <label>👤 Usuario</label>
                <input type="text" id="loginUsername" placeholder="Tu usuario">
              </div>
              <div class="form-group">
                <label>🔒 Contraseña</label>
                <input type="password" id="loginPassword" placeholder="Tu contraseña">
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="rememberMe">
                  <span>Recordar por 30 días</span>
                </label>
              </div>
              <button class="btn-primary btn-block" onclick="window.guestbookApp.profiles.login()">
                Iniciar Sesión
              </button>
              <button class="btn-link btn-block" onclick="window.guestbookApp.profiles.showRecoveryModal()" style="margin-top: 10px;">
                🔑 ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            <!-- Register Form -->
            <div class="auth-form" id="registerForm" style="display: none;">
              <div class="form-group">
                <label>👤 Usuario</label>
                <input type="text" id="registerUsername" placeholder="Elige un usuario">
              </div>
              <div class="form-group">
                <label>🔒 Contraseña</label>
                <input type="password" id="registerPassword" placeholder="Mínimo 4 caracteres">
              </div>
              <div class="form-group">
                <label>🔒 Confirmar</label>
                <input type="password" id="confirmPassword" placeholder="Repite tu contraseña">
              </div>
              
              <div class="recovery-method-selector">
                <label style="font-weight: 600; margin-bottom: 10px; display: block;">🔐 Método de Recuperación:</label>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                  <button type="button" class="recovery-method-btn active" data-method="question" style="flex: 1; padding: 8px; border: 2px solid var(--primary); background: var(--primary); color: white; border-radius: 6px; cursor: pointer;">
                    💭 Pregunta
                  </button>
                  <button type="button" class="recovery-method-btn" data-method="code" style="flex: 1; padding: 8px; border: 2px solid rgba(var(--primary-rgb), 0.3); background: var(--bg-dark); color: var(--text); border-radius: 6px; cursor: pointer;">
                    🔑 Código
                  </button>
                </div>
              </div>
              
              <!-- Pregunta de Seguridad -->
              <div id="questionMethod">
                <div class="form-group">
                  <label>❓ Pregunta de Seguridad</label>
                  <select id="securityQuestion">
                    <option value="color">¿Tu color favorito?</option>
                    <option value="animal">¿Tu animal favorito?</option>
                    <option value="comida">¿Tu comida favorita?</option>
                    <option value="juego">¿Tu juego favorito?</option>
                    <option value="personaje">¿Tu personaje favorito?</option>
                    <option value="lugar">¿Tu lugar favorito?</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>💡 Respuesta</label>
                  <input type="text" id="securityAnswer" placeholder="Tu respuesta (recuérdala bien)">
                  <small>Esta respuesta te permitirá recuperar tu cuenta</small>
                </div>
              </div>
              
              <!-- Solo Código (se genera automático) -->
              <div id="codeMethod" style="display: none;">
                <div style="padding: 15px; background: rgba(var(--primary-rgb), 0.1); border-radius: 8px; border-left: 4px solid var(--primary);">
                  <strong>🔑 Código de Recuperación</strong>
                  <p style="margin: 10px 0 0 0; font-size: 0.9em;">Al registrarte recibirás un código único. <strong>Guárdalo en un lugar seguro</strong>, lo necesitarás para recuperar tu cuenta.</p>
                </div>
              </div>
              
              <button class="btn-primary btn-block" onclick="window.guestbookApp.profiles.register()">
                Registrarse
              </button>
            </div>
          </div>
        ` : `
          <!-- Logged In Profile -->
          <div class="profile-section">
            <!-- Banner y Avatar -->
            <div id="profileBanner" class="profile-banner" style="background: ${this.currentProfile.bannerImage ? `url(${this.currentProfile.bannerImage}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))'};">
              ${!this.currentProfile.bannerImage ? '<div style="font-size: 3.5em; opacity: 0.25; color: rgba(255,255,255,0.5);">🎨</div>' : ''}
            </div>
            
            <div class="profile-avatar-display" style="margin-top: -70px; position: relative; z-index: 2; margin-bottom: 10px;">
              ${avatarContent}
            </div>
            
            <h4 class="profile-username">${this.currentProfile.username}</h4>
            <p class="profile-status">🟢 Conectado</p>
            
            <!-- Navigation Tabs -->
            <div class="profile-nav-tabs">
              <button class="profile-nav-tab active" data-section="profile">
                <i data-lucide="user"></i>
                <span>Perfil</span>
              </button>
              <button class="profile-nav-tab" data-section="likes">
                <i data-lucide="heart"></i>
                <span>Likes</span>
              </button>
              <button class="profile-nav-tab" data-section="comments">
                <i data-lucide="message-circle"></i>
                <span>Comentarios</span>
              </button>
              <button class="profile-nav-tab" data-section="appearance">
                <i data-lucide="palette"></i>
                <span>Apariencia</span>
              </button>
              <button class="profile-nav-tab" data-section="security">
                <i data-lucide="shield"></i>
                <span>Seguridad</span>
              </button>
            </div>
            
            <!-- Profile Section -->
            <div class="profile-tab-content active" data-content="profile">
              <div class="profile-settings">
                <h5>📊 Estadísticas</h5>
                <div class="profile-stats">
                  <div class="stat-item">
                    <span class="stat-label">🎨 Dibujos</span>
                    <span class="stat-value">${this.currentProfile.totalDrawings || 0}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">❤️ Likes</span>
                    <span class="stat-value">${this.currentProfile.totalLikes || 0}</span>
                  </div>
                </div>
              </div>
              
              <div class="profile-settings">
                <h5>📝 Biografía</h5>
                <div class="form-group">
                  <textarea id="bioInput" placeholder="Cuéntanos sobre ti..." maxlength="200" style="width: 100%; padding: 8px; border: 1px solid var(--primary); background: var(--bg-dark); color: var(--text); border-radius: 6px; resize: vertical; min-height: 80px;">${this.currentProfile.bio || ''}</textarea>
                  <small>Máximo 200 caracteres</small>
                </div>
              </div>
              
              <div class="profile-settings">
                <h5>💬 Pronombres</h5>
                <div class="form-group">
                  <input type="text" id="pronounsInput" placeholder="ej: él/ella, elle, él, ella" maxlength="50" value="${this.currentProfile.pronouns || ''}" style="width: 100%; padding: 8px; border: 1px solid var(--primary); background: var(--bg-dark); color: var(--text); border-radius: 6px;">
                  <small>¿Cómo te gustaría que te mencionen? (opcional)</small>
                </div>
              </div>
            </div>
            
            <!-- Likes Section -->
            <div class="profile-tab-content" data-content="likes" style="display: none;">
              <div class="profile-settings">
                <h5>❤️ Tus Likes</h5>
                <div id="userLikesContent">
                  <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <div style="font-size: 2em; margin-bottom: 10px;">⏳</div>
                    <p>Cargando likes...</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Comments Section -->
            <div class="profile-tab-content" data-content="comments" style="display: none;">
              <div class="profile-settings">
                <h5>💬 Tus Comentarios</h5>
                <div id="userCommentsContent">
                  <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <div style="font-size: 2em; margin-bottom: 10px;">⏳</div>
                    <p>Cargando comentarios...</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Appearance Section -->
            <div class="profile-tab-content" data-content="appearance" style="display: none;">
              <!-- Banner Upload -->
              <div class="profile-settings">
                <h5>🖼️ Banner</h5>
                <div class="form-group">
                  <input type="file" id="bannerImageUpload" accept="image/*">
                  <small>Sube una imagen para tu banner (se optimizará automáticamente)</small>
                  ${this.currentProfile.bannerImage ? `<button class="btn-danger btn-sm" id="removeBannerBtn" style="margin-top: 8px;">❌ Quitar Banner</button>` : ''}
                </div>
              </div>
              
              <!-- Avatar Selector -->
              <div class="profile-settings">
                <h5>😀 Avatar</h5>
                
                <div class="avatar-type-selector">
                  <button class="avatar-type-btn ${this.currentProfile.avatarType === 'emoji' ? 'active' : ''}" data-type="emoji">
                    📱 Emoji
                  </button>
                  <button class="avatar-type-btn ${this.currentProfile.avatarType === 'image' ? 'active' : ''}" data-type="image">
                    🖼️ Imagen
                  </button>
                  <button class="avatar-type-btn ${this.currentProfile.avatarType === 'text' ? 'active' : ''}" data-type="text">
                    ✏️ Texto
                  </button>
                </div>
                
                <!-- Emoji Grid -->
                <div class="emoji-grid" style="display: ${this.currentProfile.avatarType === 'emoji' ? 'grid' : 'none'}">
                  ${['👤', '😀', '😎', '🤓', '🎨', '🖌️', '🎭', '🦄', '🐱', '🐶', '🦊', '🐼', '🐸', '🦁', '🐯', '🐻'].map(emoji => `
                    <button class="emoji-btn ${this.currentProfile.avatar === emoji ? 'active' : ''}" data-emoji="${emoji}">
                      ${emoji}
                    </button>
                  `).join('')}
                </div>
                
                <!-- Image Upload -->
                <div class="image-upload" style="display: ${this.currentProfile.avatarType === 'image' ? 'block' : 'none'}">
                  <input type="file" id="avatarImageUpload" accept="image/*">
                  <small>Sube una imagen (se optimizará automáticamente)</small>
                </div>
                
                <!-- Text Input -->
                <div class="text-input" style="display: ${this.currentProfile.avatarType === 'text' ? 'block' : 'none'}">
                  <input type="text" id="avatarTextInput" placeholder="Ej: JD" maxlength="3" value="${this.currentProfile.avatarType === 'text' ? this.currentProfile.avatar : ''}">
                  <small>Máx 3 caracteres</small>
                </div>
              </div>
              
              <!-- Canvas Mode Selector -->
              <div class="profile-settings">
                <h5>🎨 Modo de Canvas</h5>
                <p style="font-size: 0.9em; color: var(--text-muted); margin-bottom: 1rem;">Elige el nivel de complejidad del canvas de dibujo.</p>
                
                <div class="canvas-mode-selector" style="display: flex; gap: 10px;">
                  <button class="canvas-mode-btn ${!this.currentProfile.canvasMode || this.currentProfile.canvasMode === 'simple' ? 'active' : ''}" data-mode="simple" style="flex: 1; padding: 15px; background: var(--bg-dark); border: 2px solid ${!this.currentProfile.canvasMode || this.currentProfile.canvasMode === 'simple' ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.3)'}; border-radius: 10px; cursor: pointer; transition: all 0.3s; text-align: left;">
                    <div style="font-size: 1.5em; margin-bottom: 8px;">✨</div>
                    <strong style="display: block; color: var(--primary); margin-bottom: 5px;">Modo Simple</strong>
                    <small style="color: var(--text-secondary); font-size: 0.85em; display: block;">Herramientas básicas: pincel, borrador, colores y tamaños</small>
                  </button>
                  
                  <button class="canvas-mode-btn ${this.currentProfile.canvasMode === 'expert' ? 'active' : ''}" data-mode="expert" style="flex: 1; padding: 15px; background: var(--bg-dark); border: 2px solid ${this.currentProfile.canvasMode === 'expert' ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.3)'}; border-radius: 10px; cursor: pointer; transition: all 0.3s; text-align: left;">
                    <div style="font-size: 1.5em; margin-bottom: 8px;">🚀</div>
                    <strong style="display: block; color: var(--primary); margin-bottom: 5px;">Modo Experto</strong>
                    <small style="color: var(--text-secondary); font-size: 0.85em; display: block;">Herramientas avanzadas: capas, efectos, formas, filtros y más</small>
                  </button>
                </div>
                
                <small style="display: block; margin-top: 0.75rem; color: var(--text-secondary); font-size: 0.85em;">
                  💡 Los cambios se aplicarán la próxima vez que abras el canvas.
                </small>
              </div>
            </div>
            
            <!-- Security Section -->
            <div class="profile-tab-content" data-content="security" style="display: none;">
              <div class="recovery-methods-section">
                <h5>🔐 Métodos de Recuperación</h5>
                <div id="recoveryMethodsDisplay">
                  <div class="loading-text">Cargando...</div>
                </div>
              </div>
              
              <div class="profile-settings">
                <h5>🔒 Privacidad del Perfil</h5>
                <p style="font-size: 0.9em; color: var(--text-muted); margin-bottom: 1rem;">Controla qué información de tu perfil es visible para otros usuarios.</p>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-dark); border-radius: 8px; cursor: pointer; transition: background 0.2s;">
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                      <span>🔒</span>
                      <span>Perfil privado</span>
                    </span>
                    <input type="checkbox" id="privateProfile" onchange="window.guestbookApp.profiles.savePrivacySettings()" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>
                  
                  <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-dark); border-radius: 8px; cursor: pointer; transition: background 0.2s;">
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                      <span>🎨</span>
                      <span>Ocultar dibujos</span>
                    </span>
                    <input type="checkbox" id="hideDrawings" onchange="window.guestbookApp.profiles.savePrivacySettings()" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>
                  
                  <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-dark); border-radius: 8px; cursor: pointer; transition: background 0.2s;">
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                      <span>❤️</span>
                      <span>Ocultar likes</span>
                    </span>
                    <input type="checkbox" id="hideLikes" onchange="window.guestbookApp.profiles.savePrivacySettings()" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>
                  
                  <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-dark); border-radius: 8px; cursor: pointer; transition: background 0.2s;">
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                      <span>💬</span>
                      <span>Ocultar comentarios</span>
                    </span>
                    <input type="checkbox" id="hideComments" onchange="window.guestbookApp.profiles.savePrivacySettings()" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>
                </div>
                
                <small style="display: block; margin-top: 0.75rem; color: var(--text-secondary); font-size: 0.85em;">
                  💡 Si activas "Perfil privado", todo tu perfil será privado. Las demás opciones te permiten ocultar cosas específicas.
                </small>
              </div>
              
              <div class="profile-settings">
                <h5>🔒 Cambiar Contraseña</h5>
                <p style="font-size: 0.9em; color: var(--text-muted);">Usa la recuperación de contraseña para cambiarla de forma segura.</p>
                <button class="btn-secondary btn-block" onclick="window.guestbookApp.profiles.showRecoveryModal()">
                  🔑 Recuperar Contraseña
                </button>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="profile-actions">
              <button class="btn-secondary btn-block" onclick="window.guestbookApp.profiles.logout()">
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        `}
      </div>
    `;
  }
  
  getAvatarDisplay() {
    if (this.currentProfile.avatarImage) {
      return `<div class="profile-avatar" style="background-image: url(${this.currentProfile.avatarImage})"></div>`;
    } else if (this.currentProfile.avatarType === 'text') {
      return `<div class="profile-avatar profile-avatar-text">${this.currentProfile.avatar}</div>`;
    } else {
      return `<div class="profile-avatar profile-avatar-emoji">${this.currentProfile.avatar}</div>`;
    }
  }
  
  attachSidebarEvents() {
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabType = e.target.dataset.tab;
        
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        document.getElementById('loginForm').style.display = tabType === 'login' ? 'block' : 'none';
        document.getElementById('registerForm').style.display = tabType === 'register' ? 'block' : 'none';
      });
    });
    
    // Profile navigation tabs
    document.querySelectorAll('.profile-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        
        // Update active tab
        document.querySelectorAll('.profile-nav-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.profile-tab-content').forEach(content => {
          content.style.display = 'none';
          content.classList.remove('active');
        });
        
        const targetContent = document.querySelector(`[data-content="${section}"]`);
        if (targetContent) {
          targetContent.style.display = 'block';
          targetContent.classList.add('active');
        }
        
        // Load data when specific tabs are opened
        if (this.currentProfile.isLoggedIn) {
          if (section === 'security') {
            this.loadRecoveryMethods();
            this.loadPrivacySettings();
          } else if (section === 'likes') {
            this.loadUserLikes();
          } else if (section === 'comments') {
            this.loadUserComments();
          }
        }
      });
    });
    
    // Recovery method selector (registro)
    document.querySelectorAll('.recovery-method-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const method = e.target.dataset.method;
        
        // Actualizar botones
        document.querySelectorAll('.recovery-method-btn').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'var(--bg-dark)';
          b.style.color = 'var(--text)';
          b.style.borderColor = 'rgba(var(--primary-rgb), 0.3)';
        });
        
        e.target.classList.add('active');
        e.target.style.background = 'var(--primary)';
        e.target.style.color = 'white';
        e.target.style.borderColor = 'var(--primary)';
        
        // Mostrar/ocultar secciones
        document.getElementById('questionMethod').style.display = method === 'question' ? 'block' : 'none';
        document.getElementById('codeMethod').style.display = method === 'code' ? 'block' : 'none';
      });
    });
    
    // Bio textarea
    const bioInput = document.getElementById('bioInput');
    if (bioInput) {
      bioInput.addEventListener('blur', () => {
        this.currentProfile.bio = bioInput.value;
        this.saveProfile();
      });
    }
    
    // Pronouns input
    const pronounsInput = document.getElementById('pronounsInput');
    if (pronounsInput) {
      pronounsInput.addEventListener('blur', () => {
        this.currentProfile.pronouns = pronounsInput.value;
        this.saveProfile();
      });
    }
    
    // Avatar type selector
    document.querySelectorAll('.avatar-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        this.currentProfile.avatarType = type;
        
        document.querySelectorAll('.avatar-type-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        document.querySelector('.emoji-grid').style.display = type === 'emoji' ? 'grid' : 'none';
        document.querySelector('.image-upload').style.display = type === 'image' ? 'block' : 'none';
        document.querySelector('.text-input').style.display = type === 'text' ? 'block' : 'none';
      });
    });
    
    // Emoji selection
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const emoji = e.target.dataset.emoji;
        this.currentProfile.avatar = emoji;
        this.currentProfile.avatarType = 'emoji';
        this.currentProfile.avatarImage = null;
        
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        this.saveProfile();
        this.updateSidebarAvatar();
      });
    });
    
    // Text avatar
    const textInput = document.getElementById('avatarTextInput');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        const text = e.target.value.toUpperCase();
        this.currentProfile.avatar = text;
        this.currentProfile.avatarType = 'text';
        this.currentProfile.avatarImage = null;
        
        this.saveProfile();
        this.updateSidebarAvatar();
      });
    }
    
    // Image upload
    const imageUpload = document.getElementById('avatarImageUpload');
    if (imageUpload) {
      imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const compressed = await this.compressImage(file, 500 * 1024); // 500KB target
            this.currentProfile.avatarImage = compressed;
            this.currentProfile.avatarType = 'image';
            
            this.saveProfile();
            this.updateSidebarAvatar();
          } catch (error) {
            alert('❌ Error al procesar imagen: ' + error.message);
          }
        }
      });
    }
    
    // Banner upload
    const bannerUpload = document.getElementById('bannerImageUpload');
    if (bannerUpload) {
      bannerUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const compressed = await this.compressImage(file, 700 * 1024); // 700KB target
            this.currentProfile.bannerImage = compressed;
            this.saveProfile();
            this.updateProfileBanner();
            // Recrear sidebar para mostrar botón de eliminar
            this.refreshSidebar();
          } catch (error) {
            alert('❌ Error al procesar imagen: ' + error.message);
          }
        }
      });
    }
    
    // Remove banner button
    const removeBannerBtn = document.getElementById('removeBannerBtn');
    if (removeBannerBtn) {
      removeBannerBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar el banner?')) {
          this.currentProfile.bannerImage = null;
          this.saveProfile();
          this.updateProfileBanner();
          // Recrear sidebar para ocultar botón de eliminar
          this.refreshSidebar();
        }
      });
    }
    
    // Canvas mode selector
    document.querySelectorAll('.canvas-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.currentProfile.canvasMode = mode;
        this.saveProfile();
        
        // Actualizar UI
        document.querySelectorAll('.canvas-mode-btn').forEach(b => {
          b.classList.remove('active');
          b.style.border = '2px solid rgba(var(--primary-rgb), 0.3)';
        });
        e.currentTarget.classList.add('active');
        e.currentTarget.style.border = '2px solid var(--primary)';
        
        // Notificar al usuario
        if (window.guestbookApp?.ui?.showNotification) {
          const modeName = mode === 'simple' ? 'Simple' : 'Experto';
          window.guestbookApp.ui.showNotification(
            `✅ Modo ${modeName} activado`,
            'success'
          );
        }
      });
    });
    
    // Reinitializar iconos Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    // Cargar métodos de recuperación si está en la pestaña de seguridad
    if (this.currentProfile.isLoggedIn) {
      const securityTab = document.querySelector('[data-content="security"]');
      if (securityTab && securityTab.classList.contains('active')) {
        this.loadRecoveryMethods();
      }
    }
  }
  
  updateSidebarAvatar() {
    const avatarDisplay = document.querySelector('.profile-avatar-display');
    if (avatarDisplay) {
      avatarDisplay.innerHTML = this.getAvatarDisplay();
    }
  }
  
  updateProfileBanner() {
    const banner = document.getElementById('profileBanner');
    if (banner) {
      if (this.currentProfile.bannerImage) {
        banner.style.background = `url(${this.currentProfile.bannerImage}) center/cover`;
        banner.innerHTML = '';
      } else {
        banner.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        banner.innerHTML = '<div style="font-size: 3.5em; opacity: 0.25;">🎨</div>';
      }
    }
  }
  
  refreshSidebar() {
    const sidebar = document.getElementById('profileSidebar');
    if (sidebar) {
      const wasOpen = sidebar.classList.contains('open');
      sidebar.innerHTML = this.getSidebarHTML();
      if (wasOpen) {
        sidebar.classList.add('open');
      }
      this.attachSidebarEvents();
      
      // Cargar métodos de recuperación si está logueado
      if (this.currentProfile.isLoggedIn) {
        this.loadRecoveryMethods();
      }
    }
  }
  
  toggleSidebar() {
    const sidebar = document.getElementById('profileSidebar');
    const burger = document.getElementById('profileBurger');
    
    if (sidebar && burger) {
      const isOpen = sidebar.classList.contains('open');
      
      if (isOpen) {
        sidebar.classList.remove('open');
        burger.classList.remove('open');
      } else {
        sidebar.classList.add('open');
        burger.classList.add('open');
      }
    }
  }
  
  async login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
      alert('⚠️ Completa todos los campos');
      return;
    }
    
    try {
      // Verificar credenciales en Firebase
      const credentials = await this.firebase.getUserCredentials(username);
      
      if (!credentials) {
        alert('❌ Usuario no encontrado');
        return;
      }
      
      const passwordHash = await this.hashPassword(password);
      
      if (credentials.passwordHash !== passwordHash) {
        alert('❌ Contraseña incorrecta');
        return;
      }
      
      // Login exitoso
      this.currentProfile = {
        username: username,
        avatar: '👤',
        avatarType: 'emoji',
        avatarImage: null,
        bio: '',
        isLoggedIn: true,
        sessionToken: this.generateSessionToken(),
        lastLogin: Date.now()
      };
      
      // Cargar perfil desde Firebase
      const firebaseProfile = await this.firebase.getUserProfile(username);
      if (firebaseProfile) {
        this.currentProfile.avatar = firebaseProfile.avatar || this.currentProfile.avatar;
        this.currentProfile.avatarType = firebaseProfile.avatarType || this.currentProfile.avatarType;
        this.currentProfile.avatarImage = firebaseProfile.avatarImage || this.currentProfile.avatarImage;
        this.currentProfile.bannerImage = firebaseProfile.bannerImage || this.currentProfile.bannerImage;
        this.currentProfile.bio = firebaseProfile.bio || this.currentProfile.bio;
        this.currentProfile.pronouns = firebaseProfile.pronouns || this.currentProfile.pronouns;
      }
      
      this.saveProfile();
      localStorage.setItem('rememberMe', rememberMe.toString());
      
      // Migrar likes de localStorage a Firebase (en segundo plano)
      this.migrateLikesInBackground(username);
      
      // Recargar sidebar
      this.refreshSidebar();
      alert('✅ Sesión iniciada correctamente');
      
    } catch (error) {
      console.error('Error en login:', error);
      alert('❌ Error al iniciar sesión');
    }
  }
  
  async register() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    
    // Determinar qué método de recuperación eligió
    const selectedMethod = document.querySelector('.recovery-method-btn.active').dataset.method;
    
    if (!username || !password || !confirmPass) {
      alert('⚠️ Completa todos los campos');
      return;
    }
    
    if (password.length < 4) {
      alert('⚠️ La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    if (password !== confirmPass) {
      alert('⚠️ Las contraseñas no coinciden');
      return;
    }
    
    try {
      // Verificar si el usuario ya existe
      const existing = await this.firebase.getUserCredentials(username);
      if (existing) {
        alert('❌ El usuario ya existe');
        return;
      }
      
      const passwordHash = await this.hashPassword(password);
      const credentialsData = {
        username: username,
        email: '',
        joinDate: Date.now(),
        recoveryMethod: selectedMethod
      };
      
      let recoveryCode = null;
      
      // Configurar según el método elegido
      if (selectedMethod === 'question') {
        const securityQuestion = document.getElementById('securityQuestion').value;
        const securityAnswer = document.getElementById('securityAnswer').value.trim().toLowerCase();
        
        if (!securityAnswer) {
          alert('⚠️ Ingresa una respuesta a la pregunta de seguridad');
          return;
        }
        
        const securityAnswerHash = await this.hashPassword(securityAnswer);
        credentialsData.securityQuestion = securityQuestion;
        credentialsData.securityAnswerHash = securityAnswerHash;
        
      } else if (selectedMethod === 'code') {
        // Generar código de recuperación
        recoveryCode = this.generateRecoveryCode();
        await this.firebase.saveRecoveryCode(username, recoveryCode);
      }
      
      // Guardar credenciales
      await this.firebase.saveUserCredentials(username, passwordHash, credentialsData);
      
      // Auto-login
      this.currentProfile = {
        username: username,
        avatar: '👤',
        avatarType: 'emoji',
        avatarImage: null,
        bio: '',
        isLoggedIn: true,
        sessionToken: this.generateSessionToken(),
        lastLogin: Date.now()
      };
      
      this.saveProfile();
      
      // Mostrar mensaje según el método
      if (recoveryCode) {
        this.showRecoveryCodeModal(recoveryCode);
      } else {
        this.showSuccessModal('✅ Cuenta creada exitosamente!\n\nTu pregunta de seguridad ha sido configurada.\nPuedes usarla para recuperar tu cuenta si olvidas tu contraseña.');
      }
      
      // Recargar sidebar
      this.refreshSidebar();
      
    } catch (error) {
      console.error('Error en registro:', error);
      alert('❌ Error al crear la cuenta');
    }
  }
  
  logout() {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
      this.currentProfile = {
        username: '',
        avatar: '👤',
        avatarType: 'emoji',
        avatarImage: null,
        bio: '',
        isLoggedIn: false,
        sessionToken: null
      };
      
      localStorage.removeItem('userProfile');
      localStorage.removeItem('sessionToken');
      
      this.refreshSidebar();
      alert('👋 Sesión cerrada');
    }
  }
  
  refreshSidebar() {
    const sidebar = document.getElementById('profileSidebar');
    if (sidebar) {
      sidebar.innerHTML = this.getSidebarHTML();
      this.attachSidebarEvents();
      
      // Cargar métodos de recuperación si está logueado
      if (this.currentProfile.isLoggedIn) {
        this.loadRecoveryMethods();
      }
    }
  }
  
  async loadRecoveryMethods() {
    const container = document.getElementById('recoveryMethodsDisplay');
    if (!container) return;
    
    try {
      const methods = [];
      
      // Intentar cargar credenciales
      let credentials = null;
      try {
        credentials = await this.firebase.getUserCredentials(this.currentProfile.username);
      } catch (error) {
        console.warn('No se pudieron cargar credenciales:', error);
      }
      
      // Intentar cargar código de recuperación
      let recoveryCode = null;
      try {
        recoveryCode = await this.firebase.getRecoveryCode(this.currentProfile.username);
      } catch (error) {
        console.warn('No se pudo cargar código de recuperación:', error);
      }
      
      // Verificar pregunta de seguridad
      if (credentials && credentials.securityQuestion) {
        const questions = {
          'color': '¿Tu color favorito?',
          'animal': '¿Tu animal favorito?',
          'comida': '¿Tu comida favorita?',
          'juego': '¿Tu juego favorito?',
          'personaje': '¿Tu personaje favorito?',
          'lugar': '¿Tu lugar favorito?'
        };
        methods.push({
          type: 'question',
          icon: '❓',
          title: 'Pregunta de Seguridad',
          description: questions[credentials.securityQuestion] || 'Configurada',
          status: 'active'
        });
      }
      
      // Verificar código de recuperación
      if (recoveryCode && !recoveryCode.used) {
        methods.push({
          type: 'code',
          icon: '🔑',
          title: 'Código de Recuperación',
          description: 'Código disponible (guárdalo seguro)',
          status: 'active',
          action: 'show'
        });
      }
      
      // Si no tiene métodos, es usuario antiguo
      if (methods.length === 0) {
        container.innerHTML = `
          <div class="no-recovery-methods">
            <div class="warning-box">
              <strong>⚠️ Usuario Antiguo</strong>
              <p>No tienes métodos de recuperación configurados. Te recomendamos añadir uno ahora.</p>
            </div>
            <div class="add-recovery-methods">
              <button class="btn-primary btn-block" onclick="window.guestbookApp.profiles.showAddRecoveryMethod()">
                ➕ Añadir Método de Recuperación
              </button>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="recovery-methods-list">
            ${methods.map(method => `
              <div class="recovery-method-item">
                <div class="recovery-method-icon">${method.icon}</div>
                <div class="recovery-method-info">
                  <strong>${method.title}</strong>
                  <small>${method.description}</small>
                </div>
                ${method.action === 'show' ? `
                  <button class="btn-secondary btn-sm" onclick="window.guestbookApp.profiles.showRecoveryCode()">
                    Ver Código
                  </button>
                ` : `
                  <span class="recovery-status">✓</span>
                `}
              </div>
            `).join('')}
          </div>
          ${methods.length < 2 ? `
            <button class="btn-secondary btn-block" style="margin-top: 10px;" onclick="window.guestbookApp.profiles.showAddRecoveryMethod()">
              ➕ Añadir Otro Método
            </button>
          ` : ''}
        `;
      }
      
    } catch (error) {
      console.error('Error cargando métodos de recuperación:', error);
      // Si hay error, asumir que es usuario antiguo sin métodos
      container.innerHTML = `
        <div class="no-recovery-methods">
          <div class="warning-box">
            <strong>⚠️ Usuario Antiguo</strong>
            <p>No tienes métodos de recuperación configurados. Te recomendamos añadir uno ahora.</p>
          </div>
          <div class="add-recovery-methods">
            <button class="btn-primary btn-block" onclick="window.guestbookApp.profiles.showAddRecoveryMethod()">
              ➕ Añadir Método de Recuperación
            </button>
          </div>
        </div>
      `;
    }
  }
  
  async showRecoveryCode() {
    try {
      const recoveryCode = await this.firebase.getRecoveryCode(this.currentProfile.username);
      
      if (!recoveryCode || recoveryCode.used) {
        this.showErrorModal('❌ No tienes un código de recuperación válido');
        return;
      }
      
      this.showRecoveryCodeModal(recoveryCode.code);
      
    } catch (error) {
      console.error('Error mostrando código:', error);
      this.showErrorModal('❌ Error al obtener el código');
    }
  }
  
  showAddRecoveryMethod() {
    const modal = document.createElement('div');
    modal.className = 'recovery-modal-overlay';
    modal.innerHTML = `
      <div class="recovery-modal" style="max-width: 450px;">
        <div class="recovery-header">
          <h3>➕ Añadir Método de Recuperación</h3>
          <button class="recovery-close" onclick="this.closest('.recovery-modal-overlay').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        
        <div class="recovery-content">
          <p style="margin-bottom: 20px; color: var(--text-muted);">
            Elige qué método deseas configurar:
          </p>
          
          <div class="add-method-options">
            <button class="add-method-btn" onclick="window.guestbookApp.profiles.configureSecurityQuestion()">
              <div class="add-method-icon">❓</div>
              <div class="add-method-info">
                <strong>Pregunta de Seguridad</strong>
                <small>Responde una pregunta personal</small>
              </div>
            </button>
            
            <button class="add-method-btn" onclick="window.guestbookApp.profiles.generateNewRecoveryCode()">
              <div class="add-method-icon">🔑</div>
              <div class="add-method-info">
                <strong>Código de Recuperación</strong>
                <small>Genera un código único</small>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    if (window.lucide) {
      setTimeout(() => window.lucide.createIcons(), 10);
    }
  }
  
  async configureSecurityQuestion() {
    // Cerrar modal anterior
    document.querySelector('.recovery-modal-overlay')?.remove();
    
    // Crear modal de configuración
    const modal = document.createElement('div');
    modal.className = 'recovery-modal-overlay';
    modal.innerHTML = `
      <div class="recovery-modal" style="max-width: 450px;">
        <div class="recovery-header">
          <h3>❓ Configurar Pregunta de Seguridad</h3>
          <button class="recovery-close" onclick="this.closest('.recovery-modal-overlay').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        
        <div class="recovery-content">
          <div class="form-group">
            <label>❓ Pregunta</label>
            <select id="newSecurityQuestion">
              <option value="color">¿Tu color favorito?</option>
              <option value="animal">¿Tu animal favorito?</option>
              <option value="comida">¿Tu comida favorita?</option>
              <option value="juego">¿Tu juego favorito?</option>
              <option value="personaje">¿Tu personaje favorito?</option>
              <option value="lugar">¿Tu lugar favorito?</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>💡 Respuesta</label>
            <input type="text" id="newSecurityAnswer" placeholder="Tu respuesta">
            <small>Recuérdala bien, la necesitarás para recuperar tu cuenta</small>
          </div>
          
          <button class="btn-primary btn-block" onclick="window.guestbookApp.profiles.saveSecurityQuestion()">
            Guardar Pregunta
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    if (window.lucide) {
      setTimeout(() => window.lucide.createIcons(), 10);
    }
  }
  
  async saveSecurityQuestion() {
    const question = document.getElementById('newSecurityQuestion').value;
    const answer = document.getElementById('newSecurityAnswer').value.trim().toLowerCase();
    
    if (!answer) {
      alert('⚠️ Ingresa una respuesta');
      return;
    }
    
    try {
      const answerHash = await this.hashPassword(answer);
      
      await this.firebase.updateUserSecurityQuestion(
        this.currentProfile.username,
        question,
        answerHash
      );
      
      alert('✅ Pregunta de seguridad configurada correctamente');
      
      // Cerrar modal y recargar
      document.querySelector('.recovery-modal-overlay').remove();
      this.loadRecoveryMethods();
      
    } catch (error) {
      console.error('Error guardando pregunta:', error);
      alert('❌ Error al guardar la pregunta');
    }
  }
  
  async generateNewRecoveryCode() {
    if (!confirm('¿Generar un nuevo código de recuperación?\n\nSi ya tenías uno, será reemplazado.')) {
      return;
    }
    
    try {
      const newCode = this.generateRecoveryCode();
      await this.firebase.saveRecoveryCode(this.currentProfile.username, newCode);
      
      // Cerrar modal anterior
      document.querySelector('.recovery-modal-overlay')?.remove();
      
      alert(`✅ Código generado exitosamente!\n\n🔑 CÓDIGO DE RECUPERACIÓN:\n${newCode}\n\n⚠️ GUÁRDALO EN UN LUGAR SEGURO\nEste código solo se puede usar una vez.`);
      
      this.loadRecoveryMethods();
      
    } catch (error) {
      console.error('Error generando código:', error);
      alert('❌ Error al generar el código');
    }
  }
  
  saveProfile() {
    if (this.currentProfile.isLoggedIn) {
      localStorage.setItem('userProfile', JSON.stringify(this.currentProfile));
      localStorage.setItem('sessionToken', this.currentProfile.sessionToken);
      
      // Guardar en Firebase - solo campos definidos
      this.firebase.saveUserProfile({
        username: this.currentProfile.username,
        avatar: this.currentProfile.avatar || '👤',
        avatarType: this.currentProfile.avatarType || 'emoji',
        avatarImage: this.currentProfile.avatarImage || null,
        bannerImage: this.currentProfile.bannerImage || null,
        bio: this.currentProfile.bio || '',
        pronouns: this.currentProfile.pronouns || '',
        lastLogin: this.currentProfile.lastLogin || Date.now()
      }).catch(err => console.warn('Error guardando en Firebase:', err));
    }
  }
  
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'FenixGuestbook2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  generateRecoveryCode() {
    // Generar código de 12 caracteres: XXX-XXX-XXX-XXX
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 3 === 0) code += '-';
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
  
  showRecoveryModal() {
    // Cerrar sidebar
    this.toggleSidebar();
    
    // Crear modal de recuperación
    const modal = document.createElement('div');
    modal.className = 'recovery-modal-overlay';
    modal.innerHTML = `
      <div class="recovery-modal">
        <div class="recovery-header">
          <h3>🔑 Recuperar Cuenta</h3>
          <button class="recovery-close" onclick="this.closest('.recovery-modal-overlay').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        
        <div class="recovery-content">
          <p style="color: var(--text-muted); margin-bottom: 20px;">
            Elige un método de recuperación:
          </p>
          
          <div class="recovery-tabs">
            <button class="recovery-tab active" data-tab="question">Pregunta de Seguridad</button>
            <button class="recovery-tab" data-tab="code">Código</button>
            <button class="recovery-tab" data-tab="discord">Discord</button>
          </div>
          
          <!-- Pregunta de Seguridad -->
          <div class="recovery-method" id="recoveryQuestion">
            <div class="form-group">
              <label>👤 Usuario</label>
              <input type="text" id="recoveryUsername" placeholder="Tu nombre de usuario">
            </div>
            <button class="btn-primary btn-block" onclick="window.guestbookApp.profiles.loadSecurityQuestion()">
              Cargar Pregunta
            </button>
            
            <div id="securityQuestionSection" style="display: none; margin-top: 20px;">
              <div class="security-question-display">
                <strong id="questionDisplay"></strong>
              </div>
              <div class="form-group">
                <label>💡 Tu Respuesta</label>
                <input type="text" id="recoveryAnswer" placeholder="Escribe tu respuesta">
              </div>
              <div class="form-group">
                <label>🔒 Nueva Contraseña</label>
                <input type="password" id="newPassword" placeholder="Mínimo 4 caracteres">
              </div>
              <div class="form-group">
                <label>🔒 Confirmar Nueva Contraseña</label>
                <input type="password" id="confirmNewPassword" placeholder="Repite tu nueva contraseña">
              </div>
              <button class="btn-primary btn-block" onclick="window.guestbookApp.profiles.recoverWithQuestion()">
                Recuperar Cuenta
              </button>
            </div>
          </div>
          
          <!-- Código de Recuperación -->
          <div class="recovery-method" id="recoveryCode" style="display: none;">
            <div class="form-group">
              <label>👤 Usuario</label>
              <input type="text" id="recoveryUsernameCode" placeholder="Tu nombre de usuario">
            </div>
            <div class="form-group">
              <label>🔑 Código de Recuperación</label>
              <input type="text" id="recoveryCodeInput" placeholder="XXX-XXX-XXX-XXX" style="text-transform: uppercase;">
              <small>El código que recibiste al registrarte</small>
            </div>
            <div class="form-group">
              <label>🔒 Nueva Contraseña</label>
              <input type="password" id="newPasswordCode" placeholder="Mínimo 4 caracteres">
            </div>
            <div class="form-group">
              <label>🔒 Confirmar Nueva Contraseña</label>
              <input type="password" id="confirmNewPasswordCode" placeholder="Repite tu nueva contraseña">
            </div>
            <button class="btn-primary btn-block" onclick="window.guestbookApp.profiles.recoverWithCode()">
              Recuperar Cuenta
            </button>
          </div>
          
          <!-- Recuperación por Discord -->
          <div class="recovery-method" id="recoveryDiscord" style="display: none;">
            <div class="discord-info">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 4em;">💬</div>
                <h4 style="color: var(--primary); margin: 10px 0;">Recuperación por Discord</h4>
              </div>
              
              <div style="background: rgba(var(--primary-rgb), 0.1); padding: 20px; border-radius: 12px; border: 2px solid var(--primary); margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; color: var(--text); line-height: 1.6;">
                  <strong>¿Olvidaste tu contraseña y no tienes método de recuperación?</strong>
                </p>
                <p style="margin: 0 0 15px 0; color: var(--text); line-height: 1.6;">
                  No te preocupes, puedes contactar a un moderador en Discord para recuperar tu cuenta de forma manual.
                </p>
                <div style="padding: 15px; background: var(--bg-dark); border-radius: 8px; margin-bottom: 15px;">
                  <strong style="color: var(--primary);">📝 Información necesaria:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px; color: var(--text-muted);">
                    <li>Tu nombre de usuario</li>
                    <li>Algunos dibujos o comentarios que hayas hecho</li>
                    <li>Fecha aproximada de registro</li>
                  </ul>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="https://discord.gg/TU_SERVIDOR_AQUI" target="_blank" class="btn-discord">
                  <svg width="24" height="24" viewBox="0 0 127.14 96.36" style="vertical-align: middle; margin-right: 8px;">
                    <path fill="currentColor" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                  </svg>
                  Unirse al Discord
                </a>
                <p style="margin-top: 15px; font-size: 0.9em; color: var(--text-muted);">
                  Un moderador te ayudará a recuperar tu cuenta
                </p>
              </div>
              
              <div style="margin-top: 25px; padding: 15px; background: rgba(255, 193, 7, 0.1); border-radius: 8px; border-left: 4px solid #ffc107;">
                <strong style="color: #ffc107;">⚠️ Usuarios Antiguos:</strong>
                <p style="margin: 8px 0 0 0; color: var(--text); font-size: 0.9em;">
                  Si te registraste antes de que existieran los métodos de recuperación, este es el único método disponible para ti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners para tabs
    modal.querySelectorAll('.recovery-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabType = e.target.dataset.tab;
        
        modal.querySelectorAll('.recovery-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        modal.querySelector('#recoveryQuestion').style.display = tabType === 'question' ? 'block' : 'none';
        modal.querySelector('#recoveryCode').style.display = tabType === 'code' ? 'block' : 'none';
        modal.querySelector('#recoveryDiscord').style.display = tabType === 'discord' ? 'block' : 'none';
      });
    });
    
    // Reinicializar iconos Lucide
    if (window.lucide) {
      setTimeout(() => window.lucide.createIcons(), 10);
    }
  }
  
  async loadSecurityQuestion() {
    const username = document.getElementById('recoveryUsername').value.trim();
    
    if (!username) {
      alert('⚠️ Ingresa tu nombre de usuario');
      return;
    }
    
    try {
      const credentials = await this.firebase.getUserCredentials(username);
      
      if (!credentials) {
        alert('❌ Usuario no encontrado');
        return;
      }
      
      // Usuario antiguo sin pregunta de seguridad
      if (!credentials.securityQuestion) {
        const setup = confirm('⚠️ Tu cuenta no tiene pregunta de seguridad configurada.\n\n¿Deseas configurarla ahora?\n\nSi no recuerdas tu contraseña, tendrás que usar la verificación por actividad.');
        
        if (setup) {
          this.showSecuritySetupForOldUser(username);
        } else {
          // Mostrar opción de verificación por actividad
          alert('💡 Puedes intentar la "Verificación por Actividad" desde el modal de recuperación.');
        }
        return;
      }
      
      // Mostrar pregunta
      const questions = {
        'color': '¿Tu color favorito?',
        'animal': '¿Tu animal favorito?',
        'comida': '¿Tu comida favorita?',
        'juego': '¿Tu juego favorito?',
        'personaje': '¿Tu personaje favorito?'
      };
      
      document.getElementById('questionDisplay').textContent = questions[credentials.securityQuestion];
      document.getElementById('securityQuestionSection').style.display = 'block';
      
    } catch (error) {
      console.error('Error cargando pregunta:', error);
      alert('❌ Error al cargar la pregunta de seguridad');
    }
  }
  
  showSecuritySetupForOldUser(username) {
    alert(`🔐 CONFIGURACIÓN DE SEGURIDAD\n\nPara configurar tu pregunta de seguridad, necesitas:\n\n1. Iniciar sesión con tu contraseña actual\n2. Ir a tu perfil\n3. Configurar pregunta de seguridad\n\nSi olvidaste tu contraseña, usa la "Verificación por Actividad" o contacta a un moderador.`);
  }
  
  async recoverWithQuestion() {
    const username = document.getElementById('recoveryUsername').value.trim();
    const answer = document.getElementById('recoveryAnswer').value.trim().toLowerCase();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!username || !answer || !newPassword || !confirmPassword) {
      alert('⚠️ Completa todos los campos');
      return;
    }
    
    if (newPassword.length < 4) {
      alert('⚠️ La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('⚠️ Las contraseñas no coinciden');
      return;
    }
    
    try {
      // Verificar límite de intentos
      const attempts = await this.firebase.checkRecoveryAttempts(username);
      if (attempts.blocked) {
        const timeLeft = Math.ceil((attempts.blockUntil - Date.now()) / 1000 / 60);
        alert(`🚫 Cuenta temporalmente bloqueada por seguridad\n\nDemasiados intentos fallidos.\nIntenta de nuevo en ${timeLeft} minutos.`);
        return;
      }
      
      const credentials = await this.firebase.getUserCredentials(username);
      
      if (!credentials) {
        alert('❌ Usuario no encontrado');
        return;
      }
      
      // Verificar respuesta de seguridad
      const answerHash = await this.hashPassword(answer);
      
      if (answerHash !== credentials.securityAnswerHash) {
        // Registrar intento fallido
        await this.firebase.registerRecoveryAttempt(username, false);
        
        const remaining = 3 - (attempts.count + 1);
        if (remaining > 0) {
          alert(`❌ Respuesta incorrecta\n\nIntentos restantes: ${remaining}\n\n⚠️ Después de 3 intentos fallidos, la cuenta se bloqueará por 30 minutos.`);
        } else {
          alert(`🚫 Cuenta bloqueada por seguridad\n\nDemasiados intentos fallidos.\nIntenta de nuevo en 30 minutos.`);
        }
        return;
      }
      
      // Respuesta correcta - actualizar contraseña
      const newPasswordHash = await this.hashPassword(newPassword);
      await this.firebase.updateUserPassword(username, newPasswordHash);
      
      // Limpiar intentos fallidos
      await this.firebase.clearRecoveryAttempts(username);
      
      // Registrar recuperación exitosa
      await this.firebase.registerRecoveryAttempt(username, true);
      
      alert('✅ Contraseña actualizada correctamente\nYa puedes iniciar sesión con tu nueva contraseña');
      
      // Cerrar modal
      document.querySelector('.recovery-modal-overlay').remove();
      
      // Abrir sidebar
      this.toggleSidebar();
      
    } catch (error) {
      console.error('Error en recuperación:', error);
      alert('❌ Error al recuperar la cuenta');
    }
  }
  
  async recoverWithCode() {
    const username = document.getElementById('recoveryUsernameCode').value.trim();
    const code = document.getElementById('recoveryCodeInput').value.trim().toUpperCase();
    const newPassword = document.getElementById('newPasswordCode').value;
    const confirmPassword = document.getElementById('confirmNewPasswordCode').value;
    
    if (!username || !code || !newPassword || !confirmPassword) {
      alert('⚠️ Completa todos los campos');
      return;
    }
    
    if (newPassword.length < 4) {
      alert('⚠️ La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('⚠️ Las contraseñas no coinciden');
      return;
    }
    
    try {
      // Verificar código de recuperación
      const isValid = await this.firebase.verifyRecoveryCode(username, code);
      
      if (!isValid) {
        alert('❌ Código de recuperación inválido');
        return;
      }
      
      // Actualizar contraseña
      const newPasswordHash = await this.hashPassword(newPassword);
      await this.firebase.updateUserPassword(username, newPasswordHash);
      
      // Invalidar código usado
      await this.firebase.invalidateRecoveryCode(username, code);
      
      alert('✅ Contraseña actualizada correctamente\nYa puedes iniciar sesión con tu nueva contraseña');
      
      // Cerrar modal
      document.querySelector('.recovery-modal-overlay').remove();
      
      // Abrir sidebar
      this.toggleSidebar();
      
    } catch (error) {
      console.error('Error en recuperación:', error);
      alert('❌ Error al recuperar la cuenta');
    }
  }
  
  async startActivityVerification() {
    const username = document.getElementById('recoveryUsernameActivity').value.trim();
    
    if (!username) {
      alert('⚠️ Ingresa tu nombre de usuario');
      return;
    }
    
    try {
      // Verificar que el usuario existe
      const credentials = await this.firebase.getUserCredentials(username);
      if (!credentials) {
        alert('❌ Usuario no encontrado');
        return;
      }
      
      // Obtener dibujos del usuario
      const allDrawings = await this.firebase.getAllDrawings();
      const userDrawings = allDrawings.filter(d => 
        d.data.autor && d.data.autor.toLowerCase() === username.toLowerCase()
      );
      
      if (userDrawings.length === 0) {
        alert('❌ No se encontraron dibujos de este usuario.\n\nContacta a un moderador para recuperar tu cuenta.');
        return;
      }
      
      // Obtener comentarios del usuario
      const allComments = await this.firebase.getAllComments();
      const userComments = allComments.filter(c => 
        c.data.autor && c.data.autor.toLowerCase() === username.toLowerCase()
      );
      
      // Generar preguntas de verificación
      const questions = [];
      
      // Pregunta 1: Contar dibujos
      if (userDrawings.length > 0) {
        questions.push({
          type: 'count_drawings',
          question: `¿Cuántos dibujos aproximadamente has publicado?`,
          answer: userDrawings.length,
          tolerance: Math.ceil(userDrawings.length * 0.3) // 30% de margen
        });
      }
      
      // Pregunta 2: Categoría más usada
      if (userDrawings.length > 0) {
        const categories = {};
        userDrawings.forEach(d => {
          const cat = d.data.categoria || 'Arte';
          categories[cat] = (categories[cat] || 0) + 1;
        });
        const mostUsed = Object.keys(categories).reduce((a, b) => 
          categories[a] > categories[b] ? a : b
        );
        
        questions.push({
          type: 'favorite_category',
          question: `¿Cuál es tu categoría más usada?`,
          answer: mostUsed,
          options: ['Arte', 'Anime', 'Paisajes', 'Abstracto', 'Retratos', 'Dibujos', 'Digital']
        });
      }
      
      // Pregunta 3: Identificar dibujo
      if (userDrawings.length >= 3) {
        const randomDrawing = userDrawings[Math.floor(Math.random() * Math.min(5, userDrawings.length))];
        questions.push({
          type: 'identify_drawing',
          question: `¿Reconoces este dibujo tuyo?`,
          imageData: randomDrawing.data.imagenData,
          answer: true
        });
      }
      
      if (questions.length < 2) {
        alert('❌ No hay suficiente actividad para verificar tu identidad.\n\nContacta a un moderador.');
        return;
      }
      
      // Guardar preguntas temporalmente
      this.tempVerificationQuestions = questions;
      this.tempVerificationUsername = username;
      
      // Renderizar preguntas
      this.renderVerificationQuestions(questions);
      document.getElementById('activityVerificationSection').style.display = 'block';
      
    } catch (error) {
      console.error('Error iniciando verificación:', error);
      alert('❌ Error al cargar la verificación');
    }
  }
  
  renderVerificationQuestions(questions) {
    const container = document.getElementById('verificationQuestions');
    container.innerHTML = questions.map((q, index) => {
      if (q.type === 'count_drawings') {
        return `
          <div class="verification-question">
            <label><strong>${index + 1}. ${q.question}</strong></label>
            <input type="number" id="answer_${index}" class="form-control" placeholder="Número aproximado" min="0">
            <small>Se permite un margen de error</small>
          </div>
        `;
      } else if (q.type === 'favorite_category') {
        return `
          <div class="verification-question">
            <label><strong>${index + 1}. ${q.question}</strong></label>
            <select id="answer_${index}" class="form-control">
              <option value="">Selecciona...</option>
              ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (q.type === 'identify_drawing') {
        return `
          <div class="verification-question">
            <label><strong>${index + 1}. ${q.question}</strong></label>
            <div style="text-align: center; margin: 10px 0;">
              <img src="${q.imageData}" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 2px solid var(--primary);">
            </div>
            <select id="answer_${index}" class="form-control">
              <option value="">Selecciona...</option>
              <option value="true">Sí, es mi dibujo</option>
              <option value="false">No, no es mío</option>
            </select>
          </div>
        `;
      }
    }).join('');
  }
  
  async recoverWithActivity() {
    const newPassword = document.getElementById('newPasswordActivity').value;
    const confirmPassword = document.getElementById('confirmNewPasswordActivity').value;
    
    if (!newPassword || !confirmPassword) {
      alert('⚠️ Ingresa la nueva contraseña');
      return;
    }
    
    if (newPassword.length < 4) {
      alert('⚠️ La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('⚠️ Las contraseñas no coinciden');
      return;
    }
    
    try {
      // Verificar límite de intentos
      const attempts = await this.firebase.checkRecoveryAttempts(this.tempVerificationUsername);
      if (attempts.blocked) {
        const timeLeft = Math.ceil((attempts.blockUntil - Date.now()) / 1000 / 60);
        alert(`🚫 Cuenta temporalmente bloqueada por seguridad\n\nDemasiados intentos fallidos.\nIntenta de nuevo en ${timeLeft} minutos.`);
        return;
      }
      
      // Verificar respuestas
      let correctAnswers = 0;
      const questions = this.tempVerificationQuestions;
      
      questions.forEach((q, index) => {
        const answerInput = document.getElementById(`answer_${index}`);
        const userAnswer = answerInput.value;
        
        if (q.type === 'count_drawings') {
          const numAnswer = parseInt(userAnswer);
          if (Math.abs(numAnswer - q.answer) <= q.tolerance) {
            correctAnswers++;
          }
        } else if (q.type === 'favorite_category') {
          if (userAnswer === q.answer) {
            correctAnswers++;
          }
        } else if (q.type === 'identify_drawing') {
          if (userAnswer === 'true') {
            correctAnswers++;
          }
        }
      });
      
      const requiredCorrect = Math.ceil(questions.length * 0.7); // 70% correcto
      
      if (correctAnswers < requiredCorrect) {
        // Registrar intento fallido
        await this.firebase.registerRecoveryAttempt(this.tempVerificationUsername, false);
        
        const remaining = 3 - (attempts.count + 1);
        if (remaining > 0) {
          alert(`❌ Verificación fallida\n\nRespondiste correctamente ${correctAnswers} de ${questions.length} preguntas.\nNecesitas al menos ${requiredCorrect} correctas.\n\nIntentos restantes: ${remaining}`);
        } else {
          alert(`🚫 Cuenta bloqueada por seguridad\n\nDemasiados intentos fallidos.\nIntenta de nuevo en 30 minutos.`);
        }
        return;
      }
      
      // Actualizar contraseña
      const newPasswordHash = await this.hashPassword(newPassword);
      await this.firebase.updateUserPassword(this.tempVerificationUsername, newPasswordHash);
      
      // Limpiar intentos fallidos
      await this.firebase.clearRecoveryAttempts(this.tempVerificationUsername);
      
      // Registrar recuperación exitosa
      await this.firebase.registerRecoveryAttempt(this.tempVerificationUsername, true);
      
      alert(`✅ Verificación exitosa (${correctAnswers}/${questions.length})\n\nTu contraseña ha sido actualizada.\nYa puedes iniciar sesión.`);
      
      // Limpiar
      delete this.tempVerificationQuestions;
      delete this.tempVerificationUsername;
      
      // Cerrar modal
      document.querySelector('.recovery-modal-overlay').remove();
      
      // Abrir sidebar
      this.toggleSidebar();
      
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      alert('❌ Error al actualizar la contraseña');
    }
  }
  
  // Método público para obtener el perfil actual
  getCurrentProfile() {
    return this.currentProfile;
  }
  
  // Mostrar modal con código de recuperación
  showRecoveryCodeModal(code) {
    const modal = document.createElement('div');
    modal.className = 'recovery-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.9); z-index: 10001; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;';
    
    modal.innerHTML = `
      <div class="recovery-modal" style="max-width: 500px; width: 90%;">
        <div class="recovery-header">
          <h3>🔑 Tu Código de Recuperación</h3>
        </div>
        
        <div class="recovery-content" style="text-align: center;">
          <div style="background: rgba(var(--primary-rgb), 0.1); padding: 20px; border-radius: 12px; border: 2px solid var(--primary); margin: 20px 0;">
            <p style="color: var(--primary); font-weight: bold; margin: 0 0 15px 0; font-size: 0.9em;">
              ⚠️ GUÁRDALO EN UN LUGAR SEGURO
            </p>
            <div style="background: var(--bg-dark); padding: 20px; border-radius: 8px; margin-bottom: 15px;">
              <code id="recoveryCodeText" style="font-size: 1.5em; font-weight: bold; color: var(--primary); letter-spacing: 2px; user-select: all;">
                ${code}
              </code>
            </div>
            <button id="copyCodeBtn" class="btn-primary btn-block" style="margin-bottom: 10px;">
              📋 Copiar Código
            </button>
          </div>
          
          <div style="background: rgba(255, 193, 7, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; text-align: left; margin-bottom: 20px;">
            <strong style="color: #ffc107; display: block; margin-bottom: 8px;">⚠️ Importante:</strong>
            <ul style="margin: 0; padding-left: 20px; color: var(--text); font-size: 0.9em; line-height: 1.6;">
              <li>Este código solo se muestra UNA VEZ</li>
              <li>Guárdalo en un lugar seguro (notas, administrador de contraseñas)</li>
              <li>Lo necesitarás si olvidas tu contraseña</li>
              <li>No lo compartas con nadie</li>
            </ul>
          </div>
          
          <button id="closeCodeModal" class="btn-primary btn-block">
            ✅ Lo guardé, continuar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listener para copiar
    document.getElementById('copyCodeBtn').addEventListener('click', () => {
      const codeText = document.getElementById('recoveryCodeText').textContent.trim();
      navigator.clipboard.writeText(codeText).then(() => {
        const btn = document.getElementById('copyCodeBtn');
        btn.textContent = '✅ Copiado!';
        btn.style.background = '#28a745';
        setTimeout(() => {
          btn.textContent = '📋 Copiar Código';
          btn.style.background = '';
        }, 2000);
      }).catch(err => {
        alert('Error al copiar. Selecciona el código manualmente.');
      });
    });
    
    // Event listener para cerrar
    document.getElementById('closeCodeModal').addEventListener('click', () => {
      modal.remove();
      this.refreshSidebar();
    });
    
    // Inicializar iconos si es necesario
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
  
  // Mostrar modal de éxito simple
  showSuccessModal(message) {
    const modal = document.createElement('div');
    modal.className = 'recovery-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.9); z-index: 10001; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;';
    
    modal.innerHTML = `
      <div class="recovery-modal" style="max-width: 450px; width: 90%;">
        <div class="recovery-header" style="background: linear-gradient(135deg, #28a745, #20c997);">
          <h3>✅ Éxito</h3>
        </div>
        
        <div class="recovery-content" style="text-align: center; padding: 30px 20px;">
          <p style="color: var(--text); line-height: 1.6; margin: 0 0 20px 0; white-space: pre-line;">
            ${message}
          </p>
          
          <button id="closeSuccessModal" class="btn-primary btn-block">
            Continuar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeSuccessModal').addEventListener('click', () => {
      modal.remove();
      this.refreshSidebar();
    });
  }
  
  // Mostrar modal de error
  showErrorModal(message) {
    const modal = document.createElement('div');
    modal.className = 'recovery-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.9); z-index: 10001; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;';
    
    modal.innerHTML = `
      <div class="recovery-modal" style="max-width: 450px; width: 90%;">
        <div class="recovery-header" style="background: linear-gradient(135deg, #dc3545, #c82333);">
          <h3>❌ Error</h3>
        </div>
        
        <div class="recovery-content" style="text-align: center; padding: 30px 20px;">
          <p style="color: var(--text); line-height: 1.6; margin: 0 0 20px 0;">
            ${message}
          </p>
          
          <button id="closeErrorModal" class="btn-primary btn-block">
            Cerrar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeErrorModal').addEventListener('click', () => {
      modal.remove();
    });
  }
  
  /**
   * Comprime una imagen manteniendo la calidad visual
   * @param {File} file - Archivo de imagen
   * @param {number} targetSize - Tamaño objetivo en bytes
   * @returns {Promise<string>} - Base64 de la imagen comprimida
   */
  async compressImage(file, targetSize) {
    return new Promise((resolve, reject) => {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        reject(new Error('El archivo no es una imagen válida'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Crear canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calcular dimensiones máximas (mantener aspecto)
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920; // Máximo ancho/alto
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Función para intentar con diferentes calidades
          const tryCompress = (quality) => {
            const base64 = canvas.toDataURL('image/jpeg', quality);
            const sizeInBytes = Math.ceil((base64.length - 'data:image/jpeg;base64,'.length) * 0.75);
            
            console.log(`🖼️ Compresión: calidad ${(quality * 100).toFixed(0)}% → ${(sizeInBytes / 1024).toFixed(1)}KB`);
            
            return { base64, sizeInBytes };
          };
          
          // Estrategia de compresión inteligente
          let quality = 0.92; // Empezar con alta calidad
          let result = tryCompress(quality);
          
          // Si ya está dentro del límite, usar esa calidad
          if (result.sizeInBytes <= targetSize) {
            console.log('✅ Imagen dentro del límite sin compresión adicional');
            resolve(result.base64);
            return;
          }
          
          // Búsqueda binaria de la calidad óptima
          let minQuality = 0.3; // Calidad mínima aceptable
          let maxQuality = 0.92;
          let bestResult = null;
          
          for (let i = 0; i < 10; i++) {
            quality = (minQuality + maxQuality) / 2;
            result = tryCompress(quality);
            
            if (result.sizeInBytes <= targetSize) {
              bestResult = result;
              minQuality = quality; // Intentar mejorar calidad
            } else {
              maxQuality = quality; // Reducir calidad
            }
            
            // Si estamos muy cerca del target, terminar
            if (Math.abs(result.sizeInBytes - targetSize) < targetSize * 0.05) {
              break;
            }
          }
          
          if (bestResult) {
            const finalSizeKB = (bestResult.sizeInBytes / 1024).toFixed(1);
            const targetKB = (targetSize / 1024).toFixed(0);
            console.log(`✅ Imagen comprimida: ${finalSizeKB}KB de ${targetKB}KB objetivo`);
            resolve(bestResult.base64);
          } else {
            // Si no pudimos comprimir lo suficiente, usar la menor calidad
            result = tryCompress(minQuality);
            const finalSizeKB = (result.sizeInBytes / 1024).toFixed(1);
            const targetKB = (targetSize / 1024).toFixed(0);
            
            if (result.sizeInBytes > targetSize * 1.2) {
              reject(new Error(`Imagen demasiado grande: ${finalSizeKB}KB (máx ${targetKB}KB). Usa una imagen más pequeña.`));
            } else {
              console.log(`⚠️ Imagen ligeramente sobre límite: ${finalSizeKB}KB`);
              resolve(result.base64);
            }
          }
        };
        
        img.onerror = () => {
          reject(new Error('Error al cargar la imagen'));
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Carga los dibujos que el usuario ha dado like
   */
  async loadUserLikes() {
    const container = document.getElementById('userLikesContent');
    if (!container) return;

    try {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
          <div style="font-size: 2em; margin-bottom: 10px;">⏳</div>
          <p>Cargando tus likes...</p>
        </div>
      `;

      // Obtener todos los dibujos
      const allDrawings = await this.firebase.getAllDrawings();
      
      // Filtrar dibujos donde el usuario dio like (Firebase)
      let likedDrawings = allDrawings.filter(drawing => {
        const likedBy = drawing.data?.likedBy || [];
        return likedBy.includes(this.currentProfile.username);
      });
      
      // FALLBACK: También buscar en localStorage (para likes antiguos)
      const localLikes = [];
      for (const drawing of allDrawings) {
        const storageKey = `liked_${drawing.id}`;
        if (localStorage.getItem(storageKey) === 'true') {
          // Solo agregar si no está ya en likedDrawings
          if (!likedDrawings.find(d => d.id === drawing.id)) {
            localLikes.push(drawing);
          }
        }
      }
      
      // Combinar ambos
      likedDrawings = [...likedDrawings, ...localLikes];

      if (likedDrawings.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px 20px; color: var(--text-secondary);">
            <div style="font-size: 3em; margin-bottom: 15px; opacity: 0.5;">💔</div>
            <p style="margin: 0; font-size: 1.1em;">No has dado like a ningún dibujo todavía</p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em; opacity: 0.7;">Explora la galería y apoya a otros artistas</p>
          </div>
        `;
        return;
      }

      // Ordenar por fecha de like (más recientes primero)
      likedDrawings.sort((a, b) => (b.data?.timestamp || 0) - (a.data?.timestamp || 0));

      // Renderizar lista de likes
      const likesHTML = likedDrawings.map(drawing => {
        const data = drawing.data || {};
        const imageData = data.imagenData || data.imageData || '';
        const autor = data.autor || 'Anónimo';
        const timestamp = data.timestamp || Date.now();
        const date = new Date(timestamp);
        const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

        return `
          <div class="liked-drawing-item" style="display: flex; gap: 12px; padding: 12px; background: var(--bg-dark); border-radius: 8px; border: 1px solid rgba(var(--primary-rgb), 0.3); margin-bottom: 10px; cursor: pointer; transition: all 0.2s;" onclick="window.guestbookApp.gallery.viewDrawing('${drawing.id}')">
            <div class="liked-drawing-preview" style="width: 80px; height: 80px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: white;">
              ${imageData ? `<img src="${imageData}" style="width: 100%; height: 100%; object-fit: contain;">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2em;">🎨</div>'}
            </div>
            <div class="liked-drawing-info" style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; color: var(--text); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                Por ${autor}
              </div>
              <div style="font-size: 0.85em; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                <span>❤️ Te gustó</span>
                <span>•</span>
                <span>${dateStr}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div style="margin-bottom: 15px; padding: 12px; background: rgba(var(--primary-rgb), 0.1); border-radius: 8px; text-align: center;">
          <strong style="color: var(--primary);">❤️ ${likedDrawings.length} dibujo${likedDrawings.length !== 1 ? 's' : ''} que te ${likedDrawings.length !== 1 ? 'gustan' : 'gusta'}</strong>
        </div>
        <div style="max-height: 500px; overflow-y: auto; padding-right: 5px;">
          ${likesHTML}
        </div>
      `;

    } catch (error) {
      console.error('Error cargando likes:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 30px 20px; color: var(--text-secondary);">
          <div style="font-size: 3em; margin-bottom: 15px; opacity: 0.5;">⚠️</div>
          <p style="margin: 0; color: #ff4444;">Error al cargar tus likes</p>
          <p style="margin: 10px 0 0 0; font-size: 0.9em;">${error.message}</p>
        </div>
      `;
    }
  }

  /**
   * Carga los comentarios que el usuario ha hecho
   */
  async loadUserComments() {
    const container = document.getElementById('userCommentsContent');
    if (!container) return;

    try {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
          <div style="font-size: 2em; margin-bottom: 10px;">⏳</div>
          <p>Cargando tus comentarios...</p>
        </div>
      `;

      // Obtener todos los dibujos
      const allDrawings = await this.firebase.getAllDrawings();
      
      // Recopilar comentarios del usuario desde:
      // 1. Array comments en los dibujos (sistema viejo)
      // 2. Colección comments de Firebase (sistema nuevo)
      const userComments = [];
      
      // 1. Buscar en array de comments de cada dibujo (sistema viejo)
      for (const drawing of allDrawings) {
        const comments = drawing.data?.comments || [];
        
        for (const comment of comments) {
          // Comparación case-insensitive para evitar problemas con mayúsculas
          const commentAuthor = (comment.autor || '').toLowerCase();
          const currentUsername = (this.currentProfile.username || '').toLowerCase();
          
          if (commentAuthor === currentUsername) {
            userComments.push({
              ...comment,
              drawingId: drawing.id,
              drawingAutor: drawing.data?.autor || 'Anónimo',
              drawingImage: drawing.data?.imagenData || drawing.data?.imageData || ''
            });
          }
        }
      }
      
      // 2. Buscar en colección separada de comments (sistema nuevo, si existe)
      try {
        const allComments = await this.firebase.getAllComments();
        
        for (const comment of allComments) {
          const commentData = comment.data || comment;
          
          // Comparación case-insensitive
          const commentAuthor = (commentData.autor || '').toLowerCase();
          const currentUsername = (this.currentProfile.username || '').toLowerCase();
          
          if (commentAuthor === currentUsername) {
            // Buscar el dibujo correspondiente
            const drawing = allDrawings.find(d => d.id === commentData.drawingId);
            
            if (drawing) {
              userComments.push({
                ...commentData,
                id: comment.id,
                drawingId: commentData.drawingId,
                drawingAutor: drawing.data?.autor || 'Anónimo',
                drawingImage: drawing.data?.imagenData || drawing.data?.imageData || ''
              });
            }
          }
        }
      } catch (error) {
        console.warn('No se pudieron cargar comentarios de la colección separada:', error);
      }

      if (userComments.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px 20px; color: var(--text-secondary);">
            <div style="font-size: 3em; margin-bottom: 15px; opacity: 0.5;">💬</div>
            <p style="margin: 0; font-size: 1.1em;">No has comentado todavía</p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em; opacity: 0.7;">Comparte tu opinión sobre los dibujos</p>
          </div>
        `;
        return;
      }

      // Eliminar duplicados por ID y timestamp
      const uniqueComments = [];
      const seenKeys = new Set();
      
      for (const comment of userComments) {
        const key = `${comment.drawingId}_${comment.timestamp}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueComments.push(comment);
        }
      }

      // Ordenar por timestamp más reciente
      uniqueComments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // Renderizar lista de comentarios
      const commentsHTML = uniqueComments.map(comment => {
        const date = new Date(comment.timestamp || Date.now());
        const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        return `
          <div class="user-comment-item" style="padding: 12px; background: var(--bg-dark); border-radius: 8px; border: 1px solid rgba(var(--primary-rgb), 0.3); margin-bottom: 10px; cursor: pointer; transition: all 0.2s;" onclick="window.guestbookApp.gallery.viewDrawing('${comment.drawingId}')">
            <div style="display: flex; gap: 12px; margin-bottom: 10px;">
              <div class="comment-drawing-preview" style="width: 60px; height: 60px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: white;">
                ${comment.drawingImage ? `<img src="${comment.drawingImage}" style="width: 100%; height: 100%; object-fit: contain;">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.5em;">🎨</div>'}
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.85em; color: var(--text-muted); margin-bottom: 4px;">
                  Comentaste en el dibujo de <strong style="color: var(--primary);">${comment.drawingAutor}</strong>
                </div>
                <div style="font-size: 0.8em; color: var(--text-secondary);">
                  ${dateStr} a las ${timeStr}
                </div>
              </div>
            </div>
            <div class="comment-text" style="padding: 10px; background: rgba(var(--primary-rgb), 0.05); border-radius: 6px; border-left: 3px solid var(--primary); color: var(--text); line-height: 1.5;">
              ${this.renderCommentMarkdown(comment.texto || comment.text || 'Sin texto')}
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div style="margin-bottom: 15px; padding: 12px; background: rgba(var(--primary-rgb), 0.1); border-radius: 8px; text-align: center;">
          <strong style="color: var(--primary);">💬 ${uniqueComments.length} comentario${uniqueComments.length !== 1 ? 's' : ''} realizado${uniqueComments.length !== 1 ? 's' : ''}</strong>
        </div>
        <div style="max-height: 500px; overflow-y: auto; padding-right: 5px;">
          ${commentsHTML}
        </div>
      `;

    } catch (error) {
      console.error('Error cargando comentarios:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 30px 20px; color: var(--text-secondary);">
          <div style="font-size: 3em; margin-bottom: 15px; opacity: 0.5;">⚠️</div>
          <p style="margin: 0; color: #ff4444;">Error al cargar tus comentarios</p>
          <p style="margin: 10px 0 0 0; font-size: 0.9em;">${error.message}</p>
        </div>
      `;
    }
  }

  /**
   * Migra los likes en segundo plano sin bloquear la UI
   * @param {string} username - Usuario logueado
   */
  migrateLikesInBackground(username) {
    // Ejecutar en segundo plano con un pequeño delay
    setTimeout(async () => {
      try {
        console.log('🔄 Verificando migración de likes...');
        const result = await this.firebase.migrateLikesToFirebase(username);
        
        if (result.alreadyMigrated) {
          console.log('✅ Likes ya migrados anteriormente');
        } else if (result.migrated > 0) {
          console.log(`✅ Se migraron ${result.migrated} likes a Firebase`);
          
          // Mostrar notificación sutil
          if (result.migrated > 0) {
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: linear-gradient(135deg, var(--primary), var(--secondary));
              color: white;
              padding: 15px 20px;
              border-radius: 10px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              z-index: 10000;
              animation: slideInUp 0.3s ease;
            `;
            notification.innerHTML = `
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 1.5em;">✅</div>
                <div>
                  <div style="font-weight: 600;">Likes sincronizados</div>
                  <div style="font-size: 0.9em; opacity: 0.9;">${result.migrated} like${result.migrated !== 1 ? 's' : ''} migrado${result.migrated !== 1 ? 's' : ''} a la nube</div>
                </div>
              </div>
            `;
            
            document.body.appendChild(notification);
            
            // Remover después de 4 segundos
            setTimeout(() => {
              notification.style.animation = 'slideOutDown 0.3s ease';
              setTimeout(() => notification.remove(), 300);
            }, 4000);
          }
        }
      } catch (error) {
        console.error('Error en migración de likes:', error);
      }
    }, 2000); // Esperar 2 segundos después del login
  }

  /**
   * Renderizar markdown de imágenes/GIFs en comentarios
   * @param {string} text - Texto del comentario
   * @returns {string} HTML con imágenes renderizadas
   */
  renderCommentMarkdown(text) {
    if (!text) return '';
    
    // Convertir ![GIF](url) o ![cualquier texto](url) en <img>
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    
    return text.replace(imageRegex, (match, alt, url) => {
      const escapedAlt = this.escapeHtml(alt);
      return `<img src="${url}" alt="${escapedAlt}" class="comment-media" style="max-width: 100%; border-radius: 8px; margin-top: 8px; display: block;">`;
    });
  }

  /**
   * Escapar HTML para prevenir XSS
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Guardar configuración de privacidad
   */
  async savePrivacySettings() {
    if (!this.currentProfile.isLoggedIn) return;
    
    try {
      const privacy = {
        privateProfile: document.getElementById('privateProfile')?.checked || false,
        hideDrawings: document.getElementById('hideDrawings')?.checked || false,
        hideLikes: document.getElementById('hideLikes')?.checked || false,
        hideComments: document.getElementById('hideComments')?.checked || false
      };
      
      // Guardar en localStorage
      this.currentProfile.privacy = privacy;
      localStorage.setItem('guestbook-profile', JSON.stringify(this.currentProfile));
      
      // Guardar en Firebase
      await this.firebase.updateUserPrivacy(this.currentProfile.username, privacy);
      
      console.log('✅ Configuración de privacidad guardada');
    } catch (error) {
      console.error('Error guardando privacidad:', error);
    }
  }

  /**
   * Cargar configuración de privacidad
   */
  loadPrivacySettings() {
    if (!this.currentProfile.isLoggedIn) return;
    
    const privacy = this.currentProfile.privacy || {};
    
    setTimeout(() => {
      const privateProfile = document.getElementById('privateProfile');
      const hideDrawings = document.getElementById('hideDrawings');
      const hideLikes = document.getElementById('hideLikes');
      const hideComments = document.getElementById('hideComments');
      
      if (privateProfile) privateProfile.checked = privacy.privateProfile || false;
      if (hideDrawings) hideDrawings.checked = privacy.hideDrawings || false;
      if (hideLikes) hideLikes.checked = privacy.hideLikes || false;
      if (hideComments) hideComments.checked = privacy.hideComments || false;
    }, 100);
  }
}

// Agregar animaciones CSS si no existen
if (!document.getElementById('migration-animations')) {
  const style = document.createElement('style');
  style.id = 'migration-animations';
  style.textContent = `
    @keyframes slideInUp {
      from {
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutDown {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(100px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
