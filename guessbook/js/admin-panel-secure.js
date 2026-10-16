// ========================================
// ADMIN PANEL SEGURO - 100% GRATUITO
// Usa Firebase Authentication (gratis hasta 50k usuarios)
// ========================================

export class SecureAdminPanel {
  constructor(firebase) {
    this.firebase = firebase;
    this.isAuthenticated = false;
    this.currentAdmin = null;
    this.allDrawings = [];
    this.allUsers = [];
    this.allReports = [];
    
    // Cache de admins autorizados (se carga desde Firestore)
    this.authorizedAdmins = [];
    this.adminsLoaded = false;
    
    this.init();
  }

  async init() {
    // Cargar lista de admins desde Firestore
    await this.loadAuthorizedAdmins();
    
    this.createAdminButton();
    this.createAdminModal();
    this.setupFirebaseAuthListener();
  }
  
  // ========================================
  // CARGAR ADMINS DESDE FIRESTORE
  // ========================================
  
  async loadAuthorizedAdmins() {
    try {
      // Intentar cargar desde Firestore
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${this.firebase.firebaseConfig.projectId}/databases/(default)/documents/admin_config/authorized_admins`
      );
      
      if (response.ok) {
        const data = await response.json();
        const uids = data.fields?.uids?.arrayValue?.values || [];
        this.authorizedAdmins = uids.map(uid => uid.stringValue);
        this.adminsLoaded = true;
        
        console.log(`✅ ${this.authorizedAdmins.length} admin(s) autorizados cargados desde Firestore`);
      } else if (response.status === 404) {
        // Documento no existe - crear uno vacío para referencia
        console.warn('⚠️ Lista de admins no encontrada en Firestore');
        console.warn('   Crea el documento: admin_config/authorized_admins');
        console.warn('   Con campo: uids (array de strings)');
        
        // Fallback a lista hardcodeada temporal
        this.authorizedAdmins = [];
        this.adminsLoaded = true;
      }
    } catch (error) {
      console.error('Error cargando admins:', error);
      // Fallback vacío
      this.authorizedAdmins = [];
      this.adminsLoaded = true;
    }
  }

  // ========================================
  // AUTENTICACIÓN SEGURA CON FIREBASE
  // ========================================
  
  setupFirebaseAuthListener() {
    // Escuchar cambios en el estado de autenticación
    if (window.auth) {
      window.auth.onAuthStateChanged(async (user) => {
        if (user) {
          // Usuario autenticado, verificar si es admin
          await this.verifyAdminAccess(user);
        } else {
          this.isAuthenticated = false;
          this.currentAdmin = null;
        }
      });
    }
  }

  async verifyAdminAccess(user) {
    try {
      // Verificar si el UID está en la lista de admins autorizados
      if (this.authorizedAdmins.includes(user.uid)) {
        this.isAuthenticated = true;
        this.currentAdmin = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email
        };
        
        console.log('✅ Admin autenticado:', this.currentAdmin.email);
        return true;
      } else {
        console.warn('⚠️ Usuario no autorizado como admin');
        this.isAuthenticated = false;
        return false;
      }
    } catch (error) {
      console.error('Error verificando acceso admin:', error);
      return false;
    }
  }

  createAdminButton() {
    const adminBtn = document.createElement('button');
    adminBtn.id = 'adminToggle';
    adminBtn.className = 'btn btn-outline-danger btn-sm';
    adminBtn.innerHTML = '<i data-lucide="shield-check" style="width: 1rem; height: 1rem;"></i> Admin';
    adminBtn.onclick = () => this.showAdminModal();
    
    // Buscar el header para agregar el botón
    const header = document.querySelector('.text-center.mb-4 .d-flex');
    if (header) {
      header.appendChild(adminBtn);
    }
  }

  createAdminModal() {
    const modalHTML = `
      <div id="adminPanelSecure" class="modal fade" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content" style="background: var(--bg-dark); border: 2px solid #dc3545;">
            <div class="modal-header" style="border-bottom: 2px solid #dc3545;">
              <div>
                <h5 class="modal-title" style="color: #dc3545;">
                  <i data-lucide="shield-check"></i>
                  Panel de Administración Seguro
                </h5>
                <small class="text-muted" id="adminUserInfo"></small>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              
              <!-- Login Screen -->
              <div id="adminLoginScreen" class="text-center py-5">
                <div class="mb-4">
                  <i data-lucide="shield-alert" style="width: 4rem; height: 4rem; color: #dc3545;"></i>
                </div>
                <h4 class="mb-3">Acceso Restringido</h4>
                <p class="text-muted mb-4">Inicia sesión con tu cuenta de administrador</p>
                
                <div class="row justify-content-center">
                  <div class="col-md-6">
                    <div class="card" style="background: var(--bg-light); border: 1px solid rgba(220, 53, 69, 0.3);">
                      <div class="card-body">
                        <div class="mb-3">
                          <input type="email" id="adminEmail" class="form-control" placeholder="Email de administrador" autocomplete="username">
                        </div>
                        <div class="mb-3">
                          <input type="password" id="adminPassword" class="form-control" placeholder="Contraseña" autocomplete="current-password">
                        </div>
                        <button class="btn btn-danger w-100" onclick="secureAdminPanel.loginWithEmail()">
                          <i data-lucide="log-in"></i>
                          Iniciar Sesión
                        </button>
                        <div id="loginError" class="alert alert-danger mt-3" style="display: none;"></div>
                        <div id="loginSuccess" class="alert alert-success mt-3" style="display: none;"></div>
                      </div>
                    </div>
                    
                    <div class="mt-4">
                      <p class="text-muted small">
                        <i data-lucide="info"></i>
                        Solo cuentas autorizadas pueden acceder
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Admin Dashboard -->
              <div id="adminDashboard" style="display: none;">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="btn-group" role="group">
                    <button class="btn btn-outline-danger btn-sm active" data-tab="stats" onclick="secureAdminPanel.showTab('stats')">
                      <i data-lucide="bar-chart"></i> Estadísticas
                    </button>
                    <button class="btn btn-outline-danger btn-sm" data-tab="drawings" onclick="secureAdminPanel.showTab('drawings')">
                      <i data-lucide="image"></i> Dibujos
                    </button>
                    <button class="btn btn-outline-danger btn-sm" data-tab="users" onclick="secureAdminPanel.showTab('users')">
                      <i data-lucide="users"></i> Usuarios
                    </button>
                    <button class="btn btn-outline-danger btn-sm" data-tab="reports" onclick="secureAdminPanel.showTab('reports')">
                      <i data-lucide="flag"></i> Reportes
                    </button>
                  </div>
                  <div class="btn-group">
                    <button class="btn btn-outline-secondary btn-sm" onclick="secureAdminPanel.exportData()">
                      <i data-lucide="download"></i> Exportar
                    </button>
                    <button class="btn btn-outline-warning btn-sm" onclick="secureAdminPanel.logout()">
                      <i data-lucide="log-out"></i> Cerrar Sesión
                    </button>
                  </div>
                </div>
                
                <!-- Tabs Content -->
                <div id="adminTabStats" class="admin-tab-content">
                  <div class="row g-3 mb-4">
                    <div class="col-md-3">
                      <div class="card text-center" style="background: var(--bg-light); border: 1px solid var(--primary);">
                        <div class="card-body">
                          <h3 class="card-title text-primary mb-0" id="statDrawings">0</h3>
                          <p class="card-text small text-muted">Total Dibujos</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center" style="background: var(--bg-light); border: 1px solid #28a745;">
                        <div class="card-body">
                          <h3 class="card-title text-success mb-0" id="statUsers">0</h3>
                          <p class="card-text small text-muted">Usuarios</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center" style="background: var(--bg-light); border: 1px solid #ffc107;">
                        <div class="card-body">
                          <h3 class="card-title text-warning mb-0" id="statReports">0</h3>
                          <p class="card-text small text-muted">Reportes</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center" style="background: var(--bg-light); border: 1px solid #17a2b8;">
                        <div class="card-body">
                          <h3 class="card-title text-info mb-0" id="statComments">0</h3>
                          <p class="card-text small text-muted">Comentarios</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div id="adminTabDrawings" class="admin-tab-content" style="display: none;">
                  <div class="d-flex gap-2 mb-3">
                    <input type="text" id="drawingSearch" class="form-control" placeholder="Buscar por autor...">
                    <select id="drawingFilter" class="form-select" style="max-width: 200px;">
                      <option value="">Todas</option>
                      <option value="Arte">Arte</option>
                      <option value="Meme">Meme</option>
                      <option value="Divertido">Divertido</option>
                      <option value="Abstracto">Abstracto</option>
                    </select>
                    <button class="btn btn-primary" onclick="secureAdminPanel.filterDrawings()">
                      <i data-lucide="search"></i>
                    </button>
                  </div>
                  <div id="drawingsList" style="max-height: 500px; overflow-y: auto;"></div>
                </div>
                
                <div id="adminTabUsers" class="admin-tab-content" style="display: none;">
                  <div id="usersList" style="max-height: 500px; overflow-y: auto;"></div>
                </div>
                
                <div id="adminTabReports" class="admin-tab-content" style="display: none;">
                  <div id="reportsList" style="max-height: 500px; overflow-y: auto;"></div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  showAdminModal() {
    const modal = new bootstrap.Modal(document.getElementById('adminPanelSecure'));
    modal.show();
    
    // Verificar si ya está autenticado
    if (this.isAuthenticated) {
      this.showDashboard();
    }
  }

  // ========================================
  // LOGIN CON FIREBASE AUTH
  // ========================================
  
  async loginWithEmail() {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    const successDiv = document.getElementById('loginSuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    if (!email || !password) {
      this.showLoginError('Por favor ingresa email y contraseña');
      return;
    }
    
    try {
      // Autenticar con Firebase - SDK v11.0.2
      const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');
      
      if (!window.auth) {
        throw new Error('Firebase Auth no está inicializado');
      }
      
      const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
      const user = userCredential.user;
      
      // Verificar si es admin autorizado
      const isAuthorized = await this.verifyAdminAccess(user);
      
      if (isAuthorized) {
        this.showLoginSuccess('Autenticación exitosa');
        setTimeout(() => this.showDashboard(), 1000);
      } else {
        // No autorizado, cerrar sesión inmediatamente
        await window.auth.signOut();
        this.showLoginError('Tu cuenta no tiene permisos de administrador');
      }
      
    } catch (error) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error de autenticación';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
      }
      
      this.showLoginError(errorMessage);
    }
  }

  showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  showLoginSuccess(message) {
    const successDiv = document.getElementById('loginSuccess');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
  }

  async logout() {
    if (confirm('¿Cerrar sesión de administrador?')) {
      try {
        await window.auth.signOut();
        this.isAuthenticated = false;
        this.currentAdmin = null;
        
        // Volver a la pantalla de login
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('adminLoginScreen').style.display = 'block';
        
        // Limpiar campos
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPassword').value = '';
        
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
  }

  showDashboard() {
    document.getElementById('adminLoginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    if (this.currentAdmin) {
      document.getElementById('adminUserInfo').textContent = `Admin: ${this.currentAdmin.email}`;
    }
    
    // Cargar datos
    this.loadAllData();
    
    // Inicializar iconos de Lucide
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // ========================================
  // GESTIÓN DE DATOS
  // ========================================
  
  async loadAllData() {
    if (!this.isAuthenticated) {
      console.warn('No autenticado');
      return;
    }
    
    try {
      await Promise.all([
        this.loadDrawings(),
        this.loadUsers(),
        this.loadReports()
      ]);
      
      this.updateStats();
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }

  async loadDrawings() {
    try {
      this.allDrawings = await this.firebase.getAllDrawings() || [];
      this.displayDrawings(this.allDrawings);
    } catch (error) {
      console.error('Error cargando dibujos:', error);
      this.allDrawings = [];
    }
  }

  displayDrawings(drawings) {
    const container = document.getElementById('drawingsList');
    if (!container) return;
    
    if (drawings.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No hay dibujos</p>';
      return;
    }
    
    container.innerHTML = drawings.map(d => `
      <div class="card mb-2" style="background: var(--bg-light);">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-2">
              <img src="${d.imagenData || ''}" class="img-thumbnail" style="width: 80px; height: 60px; object-fit: cover;">
            </div>
            <div class="col-md-7">
              <h6 class="mb-1">${d.titulo || 'Sin título'}</h6>
              <p class="mb-1 small">
                <strong>Autor:</strong> ${d.autor || 'Anónimo'} | 
                <strong>Categoría:</strong> ${d.categoria || 'N/A'}
              </p>
              <p class="mb-0 small text-muted">
                ${new Date(d.timestamp).toLocaleString()} | 
                ❤️ ${d.likes || 0} | 
                💬 ${d.comments?.length || 0}
              </p>
            </div>
            <div class="col-md-3 text-end">
              <button class="btn btn-sm btn-outline-danger" onclick="secureAdminPanel.confirmDelete('${d.id}')">
                <i data-lucide="trash-2"></i> Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
  }

  async loadUsers() {
    try {
      const userMap = new Map();
      
      this.allDrawings.forEach(d => {
        if (!userMap.has(d.autor)) {
          userMap.set(d.autor, {
            name: d.autor,
            drawings: 0,
            totalLikes: 0,
            lastActivity: d.timestamp
          });
        }
        const user = userMap.get(d.autor);
        user.drawings++;
        user.totalLikes += d.likes || 0;
        if (d.timestamp > user.lastActivity) {
          user.lastActivity = d.timestamp;
        }
      });
      
      this.allUsers = Array.from(userMap.values());
      this.displayUsers(this.allUsers);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  }

  displayUsers(users) {
    const container = document.getElementById('usersList');
    if (!container) return;
    
    if (users.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No hay usuarios</p>';
      return;
    }
    
    container.innerHTML = users.map(u => `
      <div class="card mb-2" style="background: var(--bg-light);">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h6 class="mb-1">${u.name}</h6>
              <p class="mb-0 small">
                🎨 ${u.drawings} dibujos | 
                ❤️ ${u.totalLikes} likes totales | 
                🕐 ${new Date(u.lastActivity).toLocaleDateString()}
              </p>
            </div>
            <div class="col-md-4 text-end">
              <button class="btn btn-sm btn-outline-info" onclick="secureAdminPanel.viewUserDrawings('${u.name}')">
                <i data-lucide="eye"></i> Ver dibujos
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
  }

  async loadReports() {
    try {
      this.allReports = await this.firebase.getReports() || [];
      this.displayReports(this.allReports);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      this.allReports = [];
    }
  }

  displayReports(reports) {
    const container = document.getElementById('reportsList');
    if (!container) return;
    
    if (reports.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No hay reportes</p>';
      return;
    }
    
    container.innerHTML = reports.map(r => `
      <div class="card mb-2" style="background: var(--bg-light);">
        <div class="card-body">
          <h6>${r.type || 'Reporte'}</h6>
          <p class="mb-1 small">
            <strong>De:</strong> ${r.reporter || 'Anónimo'} | 
            <strong>Sobre:</strong> ${r.reportedUser || 'N/A'}
          </p>
          <p class="mb-2 small">${r.reason || 'Sin razón'}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge ${r.status === 'pending' ? 'bg-warning' : 'bg-success'}">
              ${r.status === 'pending' ? 'Pendiente' : 'Resuelto'}
            </span>
            <small class="text-muted">${new Date(r.timestamp).toLocaleDateString()}</small>
          </div>
        </div>
      </div>
    `).join('');
  }

  updateStats() {
    document.getElementById('statDrawings').textContent = this.allDrawings.length;
    document.getElementById('statUsers').textContent = this.allUsers.length;
    document.getElementById('statReports').textContent = this.allReports.length;
    
    const totalComments = this.allDrawings.reduce((sum, d) => sum + (d.comments?.length || 0), 0);
    document.getElementById('statComments').textContent = totalComments;
  }

  showTab(tabName) {
    // Desactivar todos los botones
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Activar botón actual
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Ocultar todos los tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
      tab.style.display = 'none';
    });
    
    // Mostrar tab actual
    const currentTab = document.getElementById(`adminTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (currentTab) {
      currentTab.style.display = 'block';
    }
  }

  filterDrawings() {
    const search = document.getElementById('drawingSearch').value.toLowerCase();
    const filter = document.getElementById('drawingFilter').value;
    
    let filtered = this.allDrawings;
    
    if (search) {
      filtered = filtered.filter(d => d.autor?.toLowerCase().includes(search));
    }
    
    if (filter) {
      filtered = filtered.filter(d => d.categoria === filter);
    }
    
    this.displayDrawings(filtered);
  }

  async confirmDelete(drawingId) {
    if (confirm('¿Eliminar este dibujo permanentemente?')) {
      try {
        await this.firebase.deleteDrawing(drawingId);
        await this.loadDrawings();
        this.updateStats();
        alert('✅ Dibujo eliminado');
      } catch (error) {
        alert('❌ Error: ' + error.message);
      }
    }
  }

  viewUserDrawings(username) {
    const userDrawings = this.allDrawings.filter(d => d.autor === username);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content" style="background: var(--bg-dark);">
          <div class="modal-header">
            <h5 class="modal-title">Dibujos de ${username}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              ${userDrawings.map(d => `
                <div class="col-md-4">
                  <div class="card">
                    <img src="${d.imagenData}" class="card-img-top" style="height: 150px; object-fit: cover;">
                    <div class="card-body p-2">
                      <h6 class="card-title small">${d.titulo}</h6>
                      <p class="card-text small text-muted">${new Date(d.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
  }

  exportData() {
    const data = {
      drawings: this.allDrawings.length,
      users: this.allUsers.length,
      reports: this.allReports.length,
      exportDate: new Date().toISOString(),
      exportedBy: this.currentAdmin?.email
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guestbook-admin-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Instancia global
window.secureAdminPanel = null;

// Función de inicialización
window.initSecureAdmin = function(firebase) {
  if (!window.secureAdminPanel) {
    window.secureAdminPanel = new SecureAdminPanel(firebase);
    console.log('✅ Admin Panel Seguro inicializado');
  }
};
