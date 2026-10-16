// ========================================
// ADMIN PANEL LEGACY - DEPRECATED
// ========================================
// 
// ⚠️ ESTE ARCHIVO HA SIDO DESACTIVADO
// 
// Razón: Sistema de autenticación inseguro con contraseña hardcodeada
// Reemplazo: admin-panel-secure.js con Firebase Authentication
// 
// Este archivo solo contiene stubs para evitar errores de compatibilidad
// NO USAR ESTE SISTEMA - Migrar a admin-panel-secure.js
// 
// ========================================

class AdminPanel {
  constructor(firebase) {
    this.firebase = firebase;
    this.isLoggedIn = false;
    this.currentUser = null;
    this.allDrawings = [];
    this.allUsers = [];
    this.allReports = [];
    
    // NO inicializar - sistema desactivado
    console.warn('⚠️ AdminPanel legacy está desactivado. Usa SecureAdminPanel en su lugar.');
  }

  // Stubs para compatibilidad - NO HACEN NADA
  init() {
    console.warn('⚠️ admin-panel.js está desactivado. Usa admin-panel-secure.js');
  }

  createAdminButton() {
    // Stub vacío
  }

  createAdminModal() {
    // Stub vacío - no crear modal
    return;
    
    // Código antiguo desactivado:
    const modalHTML = `
      <div id="adminPanel" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content" style="background: var(--bg-dark); border: 2px solid #dc3545;">
            <div class="modal-header" style="border-bottom: 1px solid #dc3545;">
              <h5 class="modal-title" style="color: #dc3545;">🔐 Panel de Administración</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div id="adminLogin" class="text-center">
                <h6>Acceso Administrativo</h6>
                <input type="password" id="adminPassword" class="form-control mb-3" placeholder="Contraseña de administrador">
                <button class="btn btn-danger" onclick="adminPanel.login()">Iniciar Sesión</button>
              </div>
              <div id="adminContent" style="display: none;">
                <div class="d-flex justify-content-between mb-3">
                  <div class="btn-group" role="group">
                    <button class="btn btn-outline-danger btn-sm" onclick="adminPanel.showTab('stats')">📊 Estadísticas</button>
                    <button class="btn btn-outline-danger btn-sm" onclick="adminPanel.showTab('drawings')">🎨 Dibujos</button>
                    <button class="btn btn-outline-danger btn-sm" onclick="adminPanel.showTab('users')">👥 Usuarios</button>
                    <button class="btn btn-outline-danger btn-sm" onclick="adminPanel.showTab('reports')">📋 Reportes</button>
                    <button class="btn btn-outline-danger btn-sm" onclick="adminPanel.showTab('config')">⚙️ Config</button>
                  </div>
                  <button class="btn btn-outline-secondary btn-sm" onclick="adminPanel.exportData()">📤 Exportar</button>
                </div>
                
                <div id="adminStats" class="admin-tab">
                  <div class="row mb-4">
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-primary" id="totalDrawings">0</h5>
                          <p class="card-text">Total Dibujos</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-success" id="totalUsers">0</h5>
                          <p class="card-text">Usuarios Únicos</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-warning" id="totalReports">0</h5>
                          <p class="card-text">Reportes</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-info" id="totalComments">0</h5>
                          <p class="card-text">Comentarios</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="adminCharts"></div>
                </div>
                
                <div id="adminDrawings" class="admin-tab" style="display: none;">
                  <div class="d-flex justify-content-between mb-3">
                    <div class="d-flex gap-2">
                      <input type="text" id="drawingSearch" class="form-control" placeholder="Buscar por autor..." style="width: 200px;">
                      <select id="drawingFilter" class="form-select" style="width: 150px;">
                        <option value="">Todas las categorías</option>
                        <option value="Arte">Arte</option>
                        <option value="Meme">Meme</option>
                        <option value="Divertido">Divertido</option>
                        <option value="Abstracto">Abstracto</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <button class="btn btn-outline-primary btn-sm" onclick="adminPanel.filterDrawings()">🔍 Filtrar</button>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" onclick="adminPanel.bulkDeleteDrawings()">🗑️ Eliminar Seleccionados</button>
                  </div>
                  <div id="adminDrawingsList"></div>
                </div>
                
                <div id="adminUsers" class="admin-tab" style="display: none;">
                  <div class="d-flex justify-content-between mb-3">
                    <input type="text" id="userSearch" class="form-control" placeholder="Buscar usuario..." style="width: 200px;">
                    <div class="btn-group">
                      <button class="btn btn-outline-warning btn-sm" onclick="adminPanel.showBlockedUsers()">🚫 Bloqueados</button>
                      <button class="btn btn-outline-info btn-sm" onclick="adminPanel.exportUsers()">📤 Exportar</button>
                    </div>
                  </div>
                  <div id="adminUsersList"></div>
                </div>
                
                <div id="adminReports" class="admin-tab" style="display: none;">
                  <div class="d-flex justify-content-between mb-3">
                    <div class="btn-group">
                      <button class="btn btn-outline-warning btn-sm" onclick="adminPanel.filterReports('pending')">⏳ Pendientes</button>
                      <button class="btn btn-outline-success btn-sm" onclick="adminPanel.filterReports('resolved')">✅ Resueltos</button>
                      <button class="btn btn-outline-danger btn-sm" onclick="adminPanel.filterReports('rejected')">❌ Rechazados</button>
                    </div>
                    <button class="btn btn-outline-primary btn-sm" onclick="adminPanel.clearOldReports()">🧹 Limpiar Antiguos</button>
                  </div>
                  <div id="adminReportsList"></div>
                </div>
                
                <div id="adminConfig" class="admin-tab" style="display: none;">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="card">
                        <div class="card-header">🔧 Configuración General</div>
                        <div class="card-body">
                          <div class="mb-3">
                            <label class="form-label">Máximo de dibujos por usuario/día</label>
                            <input type="number" id="maxDrawingsPerDay" class="form-control" value="10">
                          </div>
                          <div class="mb-3">
                            <label class="form-label">Tamaño máximo de imagen (KB)</label>
                            <input type="number" id="maxImageSize" class="form-control" value="800">
                          </div>
                          <div class="mb-3">
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox" id="enableAutoModeration">
                              <label class="form-check-label">Activar moderación automática</label>
                            </div>
                          </div>
                          <button class="btn btn-primary" onclick="adminPanel.saveConfig()">💾 Guardar</button>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card">
                        <div class="card-header">🛡️ Filtros de Contenido</div>
                        <div class="card-body">
                          <div class="mb-3">
                            <label class="form-label">Palabras prohibidas (separadas por comas)</label>
                            <textarea id="bannedWords" class="form-control" rows="3"></textarea>
                          </div>
                          <div class="mb-3">
                            <label class="form-label">IPs bloqueadas</label>
                            <textarea id="blockedIPs" class="form-control" rows="3"></textarea>
                          </div>
                          <button class="btn btn-warning" onclick="adminPanel.saveFilters()">🛡️ Actualizar Filtros</button>
                        </div>
                      </div>
                    </div>
                  </div>
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
    // Stub - redirigir al panel seguro
    console.warn('⚠️ Panel de admin legacy desactivado');
    alert('⚠️ El panel de admin antiguo ha sido desactivado por seguridad.\n\nUsa el nuevo panel seguro con Firebase Authentication.');
  }

  async login() {
    // DESACTIVADO - Contraseña hardcodeada removida por seguridad
    console.error('❌ Login con contraseña hardcodeada desactivado');
    alert('❌ Sistema de autenticación legacy desactivado.\n\nUsa admin-panel-secure.js con Firebase Authentication.');
    return false;
  }

  showTab(tabName) {
    // Stub vacío
  }

  async loadAdminData() {
    // Stub vacío
    return [];
  }

  async loadDrawings() {
    // Stub vacío
    return [];
  }

  displayDrawings(drawings) {
    // Stub vacío
    const container = document.getElementById('adminDrawingsList');
    container.innerHTML = drawings.map((d, index) => `
      <div class="card mb-2">
        <div class="card-body">
          <div class="row">
            <div class="col-md-2">
              <input type="checkbox" class="form-check-input" data-drawing-id="${d.id}">
              <img src="${d.imagenData}" class="img-thumbnail" style="width: 80px; height: 60px; object-fit: cover;">
            </div>
            <div class="col-md-6">
              <h6>${d.titulo}</h6>
              <p><strong>Autor:</strong> ${d.autor} | <strong>Categoría:</strong> ${d.categoria}</p>
              <p><strong>Fecha:</strong> ${new Date(d.timestamp).toLocaleString()}</p>
              <p><strong>Likes:</strong> ${d.likes || 0} | <strong>Comentarios:</strong> ${d.comments?.length || 0}</p>
            </div>
            <div class="col-md-4 text-end">
              <div class="btn-group-vertical">
                <button class="btn btn-sm btn-outline-primary" onclick="adminPanel.viewDrawing('${d.id}')">👁️ Ver</button>
                <button class="btn btn-sm btn-outline-warning" onclick="adminPanel.editDrawing('${d.id}')">✏️ Editar</button>
                <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteDrawing('${d.id}')">🗑️ Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  async loadUsers() {
    // Stub vacío
    return [];
  }

  displayUsers(users) {
    // Stub vacío
    const container = document.getElementById('adminUsersList');
    container.innerHTML = users.map(u => `
      <div class="card mb-2">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-6">
              <h6>${u.name} ${u.isBlocked ? '<span class="badge bg-danger">BLOQUEADO</span>' : ''}</h6>
              <p><strong>Dibujos:</strong> ${u.drawings} | <strong>Likes totales:</strong> ${u.totalLikes}</p>
              <p><strong>Última actividad:</strong> ${new Date(u.lastActivity).toLocaleString()}</p>
            </div>
            <div class="col-md-6 text-end">
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-info" onclick="adminPanel.viewUserHistory('${u.name}')">📊 Historial</button>
                <button class="btn btn-sm btn-outline-warning" onclick="adminPanel.warnUser('${u.name}')">⚠️ Advertir</button>
                <button class="btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-danger'}" onclick="adminPanel.toggleBlockUser('${u.name}')">
                  ${u.isBlocked ? '✅ Desbloquear' : '🚫 Bloquear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  async loadReports() {
    // Stub vacío
    return [];
  }

  displayReports(reports) {
    // Stub vacío
    const container = document.getElementById('adminReportsList');
    if (!reports || reports.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No hay reportes</p>';
      return;
    }
    
    container.innerHTML = reports.map(r => `
      <div class="card mb-2">
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <h6>Reporte: ${r.type || 'General'}</h6>
              <p><strong>Reportado por:</strong> ${r.reporter} | <strong>Usuario reportado:</strong> ${r.reportedUser}</p>
              <p><strong>Razón:</strong> ${r.reason}</p>
              <p><strong>Fecha:</strong> ${new Date(r.timestamp).toLocaleString()}</p>
              <span class="badge ${r.status === 'pending' ? 'bg-warning' : r.status === 'resolved' ? 'bg-success' : 'bg-danger'}">
                ${r.status === 'pending' ? '⏳ Pendiente' : r.status === 'resolved' ? '✅ Resuelto' : '❌ Rechazado'}
              </span>
            </div>
            <div class="col-md-4 text-end">
              <div class="btn-group-vertical">
                <button class="btn btn-sm btn-success" onclick="adminPanel.resolveReport('${r.id}')">✅ Resolver</button>
                <button class="btn btn-sm btn-danger" onclick="adminPanel.rejectReport('${r.id}')">❌ Rechazar</button>
                <button class="btn btn-sm btn-outline-info" onclick="adminPanel.viewReportDetails('${r.id}')">👁️ Detalles</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  updateStats() {
    // Stub vacío
  }

  filterDrawings() {
    // Stub vacío
    const search = document.getElementById('drawingSearch').value.toLowerCase();
    const filter = document.getElementById('drawingFilter').value;
    
    let filtered = this.allDrawings;
    
    if (search) {
      filtered = filtered.filter(d => d.autor.toLowerCase().includes(search));
    }
    
    if (filter) {
      filtered = filtered.filter(d => d.categoria === filter);
    }
    
    this.displayDrawings(filtered);
  }

  async deleteDrawing(drawingId) {
    console.warn('⚠️ Función desactivada - usa admin-panel-secure.js');
    return false;
  }

  async bulkDeleteDrawings() {
    console.warn('⚠️ Función desactivada - usa admin-panel-secure.js');
    return false;
    const checkboxes = document.querySelectorAll('input[data-drawing-id]:checked');
    if (checkboxes.length === 0) {
      alert('Selecciona al menos un dibujo');
      return;
    }
    
    if (confirm(`¿Eliminar ${checkboxes.length} dibujos seleccionados?`)) {
      for (const checkbox of checkboxes) {
        try {
          await this.firebase.deleteDrawing(checkbox.dataset.drawingId);
        } catch (error) {
          console.error('Error deleting drawing:', error);
        }
      }
      await this.loadDrawings();
      this.updateStats();
      alert('Dibujos eliminados');
    }
  }

  viewDrawing(drawingId) {
    console.warn('⚠️ Función desactivada');
    return;
    // Código antiguo desactivado:
    const drawing = this.allDrawings.find(d => d.id === drawingId);
    if (drawing) {
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="modal fade" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${drawing.titulo}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body text-center">
                <img src="${drawing.imagenData}" class="img-fluid" style="max-height: 400px;">
                <p class="mt-3"><strong>Autor:</strong> ${drawing.autor}</p>
                <p><strong>Fecha:</strong> ${new Date(drawing.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      const bootstrapModal = new bootstrap.Modal(modal.querySelector('.modal'));
      bootstrapModal.show();
      modal.addEventListener('hidden.bs.modal', () => modal.remove());
    }
  }

  async toggleBlockUser(username) {
    console.warn('⚠️ Función desactivada');
    return false;
    const user = this.allUsers.find(u => u.name === username);
    if (user) {
      user.isBlocked = !user.isBlocked;
      // Aquí guardarías el estado en Firebase
      this.displayUsers(this.allUsers);
      alert(`Usuario ${user.isBlocked ? 'bloqueado' : 'desbloqueado'}`);
    }
  }

  warnUser(username) {
    console.warn('⚠️ Función desactivada');
    return;
    const reason = prompt('Razón de la advertencia:');
    if (reason) {
      alert(`Advertencia enviada a ${username}: ${reason}`);
      // Aquí enviarías la advertencia
    }
  }

  viewUserHistory(username) {
    console.warn('⚠️ Función desactivada');
    return;
    // Código antiguo desactivado:
    const userDrawings = this.allDrawings.filter(d => d.autor === username);
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Historial de ${username}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                ${userDrawings.map(d => `
                  <div class="col-md-4 mb-3">
                    <div class="card">
                      <img src="${d.imagenData}" class="card-img-top" style="height: 150px; object-fit: cover;">
                      <div class="card-body">
                        <h6 class="card-title">${d.titulo}</h6>
                        <p class="card-text small">${new Date(d.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal.querySelector('.modal'));
    bootstrapModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
  }

  async resolveReport(reportId) {
    console.warn('⚠️ Función desactivada');
    return false;
    const report = this.allReports.find(r => r.id === reportId);
    if (report) {
      report.status = 'resolved';
      // Aquí actualizarías en Firebase
      this.displayReports(this.allReports);
      alert('Reporte marcado como resuelto');
    }
  }

  async rejectReport(reportId) {
    console.warn('⚠️ Función desactivada');
    return false;
    const report = this.allReports.find(r => r.id === reportId);
    if (report) {
      report.status = 'rejected';
      // Aquí actualizarías en Firebase
      this.displayReports(this.allReports);
      alert('Reporte rechazado');
    }
  }

  filterReports(status) {
    console.warn('⚠️ Función desactivada');
    return;
    const filtered = this.allReports.filter(r => r.status === status);
    this.displayReports(filtered);
  }

  saveConfig() {
    console.warn('⚠️ Función desactivada');
    return;
    const config = {
      maxDrawingsPerDay: document.getElementById('maxDrawingsPerDay').value,
      maxImageSize: document.getElementById('maxImageSize').value,
      enableAutoModeration: document.getElementById('enableAutoModeration').checked
    };
    
    localStorage.setItem('guestbook-admin-config', JSON.stringify(config));
    alert('Configuración guardada');
  }

  saveFilters() {
    console.warn('⚠️ Función desactivada');
    return;
    const filters = {
      bannedWords: document.getElementById('bannedWords').value.split(',').map(w => w.trim()),
      blockedIPs: document.getElementById('blockedIPs').value.split('\n').map(ip => ip.trim())
    };
    
    localStorage.setItem('guestbook-filters', JSON.stringify(filters));
    alert('Filtros actualizados');
  }

  exportData() {
    console.warn('⚠️ Función desactivada - usa admin-panel-secure.js');
    return;
    const data = {
      drawings: this.allDrawings,
      users: this.allUsers,
      reports: this.allReports,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guestbook-admin-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  setupEventListeners() {
    // Stub vacío - no configurar listeners
  }
}

// ========================================
// INICIALIZACIÓN DESACTIVADA
// ========================================

window.adminPanel = null;

// Función global para inicializar admin panel - DESACTIVADA
window.initAdminPanel = function(firebase) {
  console.warn('⚠️ AdminPanel legacy desactivado. Usa SecureAdminPanel:');
  console.warn('   import { SecureAdminPanel } from "./js/admin-panel-secure.js";');
  console.warn('   window.secureAdminPanel = new SecureAdminPanel(firebase);');
  
  // NO crear instancia del panel antiguo
  // if (!window.adminPanel) {
  //   window.adminPanel = new AdminPanel(firebase);
  // }
  
  return null;
};

// Exportar clase para compatibilidad pero con advertencia
console.warn('⚠️ admin-panel.js está DESACTIVADO');
console.warn('   Razón: Contraseña hardcodeada y sistema inseguro');
console.warn('   Usa: admin-panel-secure.js con Firebase Authentication');