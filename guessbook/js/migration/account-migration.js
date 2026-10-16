// ========================================
// SISTEMA DE MIGRACIÓN DE CUENTAS
// Firestore → Firebase Authentication
// 100% Opcional y con visualización de progreso
// ========================================

export class AccountMigration {
  constructor(firebase, profileManager) {
    this.firebase = firebase;
    this.profileManager = profileManager;
    this.currentUser = null;
    this.migrationInProgress = false;
  }

  // ========================================
  // DETECTAR SI EL USUARIO DEBE MIGRAR
  // ========================================
  
  async checkMigrationStatus(username) {
    try {
      // Verificar si el usuario ya está en Firebase Auth
      const authUser = await this.isUserInAuth(username);
      
      if (authUser) {
        return {
          needsMigration: false,
          reason: 'already_migrated'
        };
      }
      
      // Verificar si tiene cuenta en Firestore (sistema antiguo)
      const firestoreUser = await this.firebase.getUserCredentials(username);
      
      if (firestoreUser) {
        // Usuario existe en Firestore pero no en Auth → debe migrar
        const userDrawings = await this.getUserDrawingsCount(username);
        
        return {
          needsMigration: true,
          reason: 'legacy_account',
          username: username,
          drawingsCount: userDrawings,
          joinDate: firestoreUser.joinDate || Date.now()
        };
      }
      
      return {
        needsMigration: false,
        reason: 'no_account'
      };
      
    } catch (error) {
      console.error('Error verificando estado de migración:', error);
      return { needsMigration: false, reason: 'error' };
    }
  }

  async isUserInAuth(username) {
    // Firebase Auth no tiene búsqueda directa por username
    // Usaremos una colección auxiliar para mapear username → UID
    try {
      const userDoc = await this.firebase.db.collection('auth_usernames').doc(username).get();
      return userDoc.exists;
    } catch (error) {
      return false;
    }
  }

  async getUserDrawingsCount(username) {
    try {
      const drawings = await this.firebase.getAllDrawings();
      return drawings.filter(d => d.autor === username).length;
    } catch (error) {
      return 0;
    }
  }

  // ========================================
  // MOSTRAR MODAL DE MIGRACIÓN
  // ========================================
  
  showMigrationModal(migrationData) {
    const modal = document.createElement('div');
    modal.id = 'migrationModal';
    modal.className = 'modal fade';
    modal.setAttribute('data-bs-backdrop', 'static');
    modal.setAttribute('data-bs-keyboard', 'false');
    
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="background: var(--bg-dark); border: 2px solid var(--primary);">
          <div class="modal-header" style="border-bottom: 2px solid var(--primary);">
            <div>
              <h5 class="modal-title" style="color: var(--primary);">
                <i data-lucide="shield-check"></i>
                🚀 Actualiza tu Cuenta
              </h5>
              <small class="text-muted">Sistema de seguridad mejorado</small>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Pantalla de información -->
            <div id="migrationInfo">
              <div class="text-center mb-4">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔐</div>
                <h4 style="color: var(--text);">¡Actualización Disponible!</h4>
                <p class="text-muted">Hemos mejorado la seguridad de las cuentas</p>
              </div>
              
              <div class="card mb-3" style="background: rgba(var(--primary-rgb), 0.1); border: 1px solid var(--primary);">
                <div class="card-body">
                  <h6 style="color: var(--primary);">
                    <i data-lucide="user"></i>
                    Tu Cuenta
                  </h6>
                  <div class="row mt-3">
                    <div class="col-md-6">
                      <p class="mb-1"><strong>Usuario:</strong> ${migrationData.username}</p>
                      <p class="mb-0"><strong>Dibujos:</strong> ${migrationData.drawingsCount}</p>
                    </div>
                    <div class="col-md-6">
                      <p class="mb-1"><strong>Miembro desde:</strong> ${new Date(migrationData.joinDate).toLocaleDateString()}</p>
                      <p class="mb-0"><strong>Estado:</strong> <span class="badge bg-warning">Legacy</span></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="alert alert-info">
                <h6><i data-lucide="info"></i> ¿Qué incluye la actualización?</h6>
                <ul class="mb-0">
                  <li>✅ <strong>Seguridad mejorada</strong> con Firebase Authentication</li>
                  <li>✅ <strong>Todos tus dibujos</strong> se mantienen intactos</li>
                  <li>✅ <strong>Tus likes y comentarios</strong> se conservan</li>
                  <li>✅ <strong>Recuperación de contraseña</strong> por email</li>
                  <li>✅ <strong>Inicio de sesión más rápido</strong></li>
                </ul>
              </div>
              
              <div class="alert alert-warning">
                <h6><i data-lucide="alert-triangle"></i> Importante</h6>
                <p class="mb-0">Deberás crear una nueva contraseña. Tu contraseña antigua no se puede transferir por seguridad.</p>
              </div>
              
              <div class="card" style="background: var(--bg-light); border: 1px solid rgba(var(--primary-rgb), 0.3);">
                <div class="card-body">
                  <h6 class="mb-3">Crear nueva contraseña</h6>
                  
                  <div class="mb-3">
                    <label class="form-label">
                      <i data-lucide="mail"></i>
                      Email (para recuperación)
                    </label>
                    <input type="email" id="migrationEmail" class="form-control" 
                           placeholder="tu-email@ejemplo.com" 
                           style="background: var(--bg-dark); color: var(--text); border: 1px solid var(--primary);">
                    <small class="text-muted">Opcional pero recomendado para recuperar tu cuenta</small>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">
                      <i data-lucide="lock"></i>
                      Nueva Contraseña
                    </label>
                    <input type="password" id="migrationPassword" class="form-control" 
                           placeholder="Mínimo 6 caracteres"
                           style="background: var(--bg-dark); color: var(--text); border: 1px solid var(--primary);">
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">
                      <i data-lucide="lock"></i>
                      Confirmar Contraseña
                    </label>
                    <input type="password" id="migrationPasswordConfirm" class="form-control" 
                           placeholder="Repite tu contraseña"
                           style="background: var(--bg-dark); color: var(--text); border: 1px solid var(--primary);">
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-between mt-4">
                <button class="btn btn-secondary" data-bs-dismiss="modal">
                  <i data-lucide="x"></i>
                  Ahora no
                </button>
                <button class="btn btn-primary btn-lg" onclick="accountMigration.startMigration('${migrationData.username}')">
                  <i data-lucide="rocket"></i>
                  Actualizar Mi Cuenta
                </button>
              </div>
            </div>
            
            <!-- Pantalla de progreso -->
            <div id="migrationProgress" style="display: none;">
              <div class="text-center mb-4">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⏳</div>
                <h4 style="color: var(--text);">Actualizando tu cuenta...</h4>
                <p class="text-muted">Por favor no cierres esta ventana</p>
              </div>
              
              <div class="progress mb-3" style="height: 30px; background: var(--bg-light);">
                <div id="migrationProgressBar" class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" style="width: 0%; background: var(--primary);">
                  <span id="migrationProgressText">0%</span>
                </div>
              </div>
              
              <div id="migrationSteps" class="card" style="background: var(--bg-light); border: 1px solid rgba(var(--primary-rgb), 0.3);">
                <div class="card-body">
                  <div id="step1" class="migration-step">
                    <i data-lucide="loader" class="spinner"></i>
                    <span>Creando cuenta en Firebase Auth...</span>
                  </div>
                  <div id="step2" class="migration-step" style="opacity: 0.5;">
                    <i data-lucide="loader"></i>
                    <span>Migrando dibujos...</span>
                  </div>
                  <div id="step3" class="migration-step" style="opacity: 0.5;">
                    <i data-lucide="loader"></i>
                    <span>Transfiriendo likes y comentarios...</span>
                  </div>
                  <div id="step4" class="migration-step" style="opacity: 0.5;">
                    <i data-lucide="loader"></i>
                    <span>Finalizando migración...</span>
                  </div>
                </div>
              </div>
              
              <div id="migrationLog" class="mt-3 p-3" style="background: var(--bg-light); border-radius: 8px; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 0.85rem;">
              </div>
            </div>
            
            <!-- Pantalla de éxito -->
            <div id="migrationSuccess" style="display: none;">
              <div class="text-center py-4">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🎉</div>
                <h3 style="color: var(--primary);">¡Cuenta Actualizada!</h3>
                <p class="text-muted mb-4">Tu cuenta ahora usa el nuevo sistema de seguridad</p>
                
                <div class="card mb-4" style="background: rgba(76, 175, 80, 0.1); border: 2px solid #4caf50;">
                  <div class="card-body">
                    <h5 style="color: #4caf50;">✅ Migración Completa</h5>
                    <div class="row mt-3">
                      <div class="col-md-4">
                        <p class="mb-0"><strong id="migratedDrawings">0</strong></p>
                        <small class="text-muted">Dibujos migrados</small>
                      </div>
                      <div class="col-md-4">
                        <p class="mb-0"><strong id="migratedLikes">0</strong></p>
                        <small class="text-muted">Likes transferidos</small>
                      </div>
                      <div class="col-md-4">
                        <p class="mb-0"><strong id="migratedComments">0</strong></p>
                        <small class="text-muted">Comentarios</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="alert alert-info">
                  <p class="mb-2"><strong>Ahora puedes:</strong></p>
                  <ul class="mb-0 text-start">
                    <li>Iniciar sesión con tu email y nueva contraseña</li>
                    <li>Recuperar tu cuenta por email si olvidas tu contraseña</li>
                    <li>Disfrutar de mayor seguridad en tu cuenta</li>
                  </ul>
                </div>
                
                <button class="btn btn-primary btn-lg" onclick="accountMigration.finishMigration()">
                  <i data-lucide="check"></i>
                  ¡Entendido!
                </button>
              </div>
            </div>
            
            <!-- Pantalla de error -->
            <div id="migrationError" style="display: none;">
              <div class="text-center py-4">
                <div style="font-size: 4rem; margin-bottom: 1rem;">❌</div>
                <h4 style="color: #ff4444;">Error en la Migración</h4>
                <p class="text-muted mb-4">No se pudo completar la actualización</p>
                
                <div class="alert alert-danger" id="migrationErrorMessage">
                  Error desconocido
                </div>
                
                <div class="alert alert-warning">
                  <p class="mb-0">No te preocupes, tu cuenta antigua sigue funcionando. Puedes intentar nuevamente más tarde.</p>
                </div>
                
                <button class="btn btn-secondary" data-bs-dismiss="modal">
                  <i data-lucide="x"></i>
                  Cerrar
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Agregar estilos
    this.addMigrationStyles();
    
    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Inicializar iconos
    if (window.lucide) {
      lucide.createIcons();
    }
    
    // Limpiar al cerrar
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  addMigrationStyles() {
    if (document.getElementById('migrationStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'migrationStyles';
    style.textContent = `
      .migration-step {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;
      }
      
      .migration-step.active {
        background: rgba(var(--primary-rgb), 0.2);
        opacity: 1 !important;
      }
      
      .migration-step.completed {
        background: rgba(76, 175, 80, 0.2);
        opacity: 1 !important;
      }
      
      .migration-step.completed i {
        color: #4caf50;
      }
      
      .migration-step i.spinner {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      #migrationLog {
        color: var(--text-secondary);
        line-height: 1.6;
      }
      
      #migrationLog .log-entry {
        margin-bottom: 0.25rem;
      }
      
      #migrationLog .log-success {
        color: #4caf50;
      }
      
      #migrationLog .log-error {
        color: #ff4444;
      }
      
      #migrationLog .log-info {
        color: var(--primary);
      }
    `;
    
    document.head.appendChild(style);
  }

  // ========================================
  // PROCESO DE MIGRACIÓN
  // ========================================
  
  async startMigration(username) {
    if (this.migrationInProgress) {
      alert('Ya hay una migración en curso');
      return;
    }
    
    // Validar datos
    const email = document.getElementById('migrationEmail').value.trim();
    const password = document.getElementById('migrationPassword').value;
    const confirmPassword = document.getElementById('migrationPasswordConfirm').value;
    
    if (!password || password.length < 6) {
      alert('⚠️ La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('⚠️ Las contraseñas no coinciden');
      return;
    }
    
    // Confirmar migración
    if (!confirm(`¿Actualizar la cuenta de ${username}?\n\nEsto no se puede deshacer.`)) {
      return;
    }
    
    this.migrationInProgress = true;
    
    // Cambiar a pantalla de progreso
    document.getElementById('migrationInfo').style.display = 'none';
    document.getElementById('migrationProgress').style.display = 'block';
    
    try {
      // Paso 1: Crear cuenta en Firebase Auth
      await this.migrateStep1_CreateAuthAccount(username, email, password);
      
      // Paso 2: Migrar dibujos
      await this.migrateStep2_MigrateDrawings(username);
      
      // Paso 3: Migrar likes y comentarios
      await this.migrateStep3_MigrateLikesComments(username);
      
      // Paso 4: Finalizar
      await this.migrateStep4_Finalize(username);
      
      // Mostrar éxito
      this.showSuccessScreen();
      
    } catch (error) {
      console.error('Error en migración:', error);
      this.showErrorScreen(error.message);
    } finally {
      this.migrationInProgress = false;
    }
  }

  async migrateStep1_CreateAuthAccount(username, email, password) {
    this.activateStep(1);
    this.updateProgress(10, 'Creando cuenta segura...');
    this.log('info', `Iniciando migración para ${username}...`);
    
    try {
      // Importar Firebase Auth - SDK v11.0.2
      const { getAuth, createUserWithEmailAndPassword, updateProfile } = 
        await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');
      
      const auth = getAuth();
      
      // Crear cuenta con email si se proporcionó, sino usar username@fenix.local
      const authEmail = email || `${username}@fenix.local`;
      
      this.log('info', 'Creando usuario en Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
      const user = userCredential.user;
      
      // Actualizar displayName
      await updateProfile(user, {
        displayName: username
      });
      
      this.currentUser = {
        uid: user.uid,
        email: authEmail,
        username: username
      };
      
      // Guardar mapeo username → UID en Firestore
      await this.saveUsernameMapping(username, user.uid);
      
      this.log('success', `✅ Cuenta creada con UID: ${user.uid.substring(0, 8)}...`);
      this.updateProgress(25, 'Cuenta creada exitosamente');
      this.completeStep(1);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        // El email ya existe, intentar con email alternativo
        const altEmail = `${username}-${Date.now()}@fenix.local`;
        this.log('info', 'Email en uso, usando alternativo...');
        
        const { getAuth, createUserWithEmailAndPassword, updateProfile } = 
          await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');
        
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, altEmail, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: username });
        
        this.currentUser = {
          uid: user.uid,
          email: altEmail,
          username: username
        };
        
        await this.saveUsernameMapping(username, user.uid);
        
        this.log('success', '✅ Cuenta creada con email alternativo');
        this.updateProgress(25, 'Cuenta creada exitosamente');
        this.completeStep(1);
      } else {
        throw new Error(`Error creando cuenta: ${error.message}`);
      }
    }
  }

  async migrateStep2_MigrateDrawings(username) {
    this.activateStep(2);
    this.updateProgress(30, 'Migrando perfil completo y dibujos...');
    
    try {
      // ============================================
      // PASO 2A: MIGRAR PERFIL COMPLETO DEL USUARIO
      // ============================================
      this.log('info', 'Migrando perfil del usuario...');
      const userProfile = await this.firebase.getUserProfile(username);
      
      if (userProfile) {
        // Guardar perfil con el nuevo UID y el username correcto
        const profileToSave = {
          ...userProfile,
          username: username, // CRÍTICO: asegurar que username existe
          uid: this.currentUser.uid,
          email: this.currentUser.email,
          migratedAt: Date.now()
        };
        
        await this.firebase.saveUserProfile(profileToSave);
        
        this.log('success', `✅ Perfil migrado (avatar, banner, bio, etc.)`);
      }
      
      // ============================================
      // PASO 2B: MIGRAR CONFIGURACIÓN DE PRIVACIDAD
      // ============================================
      this.log('info', 'Migrando configuración de privacidad...');
      if (userProfile?.privacy) {
        this.log('success', `✅ Privacidad configurada`);
      }
      
      // ============================================
      // PASO 2C: MIGRAR ACHIEVEMENTS
      // ============================================
      if (userProfile?.achievements && userProfile.achievements.length > 0) {
        this.log('success', `✅ ${userProfile.achievements.length} logros migrados`);
      }
      
      // ============================================
      // PASO 2D: MIGRAR TAGS DE USUARIO
      // ============================================
      if (userProfile?.userTags && userProfile.userTags.length > 0) {
        this.log('success', `✅ ${userProfile.userTags.length} tags migradas`);
      }
      
      this.updateProgress(35, 'Perfil completo migrado');
      
      // ============================================
      // PASO 2E: MIGRAR DIBUJOS
      // ============================================
      this.log('info', 'Buscando dibujos del usuario...');
      const allDrawings = await this.firebase.getAllDrawings();
      const userDrawings = allDrawings.filter(d => d.autor === username);
      
      this.log('info', `Encontrados ${userDrawings.length} dibujos`);
      
      if (userDrawings.length > 0) {
        for (let i = 0; i < userDrawings.length; i++) {
          const drawing = userDrawings[i];
          
          // Actualizar dibujo con UID del nuevo usuario (mantener el nombre de autor)
          await this.firebase.updateDrawing(drawing.id, {
            userId: this.currentUser.uid,
            autor: username, // IMPORTANTE: mantener el username original
            migratedAt: Date.now()
          });
          
          const progress = 35 + ((i + 1) / userDrawings.length) * 20;
          this.updateProgress(progress, `Migrando dibujo ${i + 1}/${userDrawings.length}...`);
          
          // Pequeña pausa para no sobrecargar
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.log('success', `✅ ${userDrawings.length} dibujos migrados`);
        
        // Actualizar estadísticas en pantalla de éxito
        document.getElementById('migratedDrawings').textContent = userDrawings.length;
      } else {
        this.log('info', 'No hay dibujos para migrar');
        document.getElementById('migratedDrawings').textContent = '0';
      }
      
      this.updateProgress(55, 'Dibujos y perfil migrados');
      this.completeStep(2);
      
    } catch (error) {
      this.log('error', `❌ Error migrando datos: ${error.message}`);
      console.error('Error completo:', error);
      // Continuar con el siguiente paso aunque falle
      this.completeStep(2);
    }
  }

  async migrateStep3_MigrateLikesComments(username) {
    this.activateStep(3);
    this.updateProgress(60, 'Migrando likes y comentarios...');
    this.log('info', 'Procesando likes y comentarios...');
    
    try {
      let totalLikes = 0;
      let totalComments = 0;
      
      // MIGRAR LIKES
      this.log('info', 'Migrando likes...');
      
      // 1. Obtener todos los dibujos
      const allDrawings = await this.firebase.getAllDrawings();
      
      // 2. Buscar likes en localStorage del navegador
      const localLikes = [];
      for (const drawing of allDrawings) {
        const storageKey = `liked_${drawing.id}`;
        if (localStorage.getItem(storageKey) === 'true') {
          localLikes.push(drawing.id);
        }
      }
      
      // 3. Migrar likes a Firebase (actualizar campo likedBy)
      if (localLikes.length > 0) {
        for (const drawingId of localLikes) {
          try {
            const drawing = allDrawings.find(d => d.id === drawingId);
            if (drawing) {
              const likedBy = drawing.data?.likedBy || [];
              
              // Solo agregar si no está ya
              if (!likedBy.includes(username)) {
                likedBy.push(username);
                
                await this.firebase.updateDrawing(drawingId, {
                  likedBy: likedBy,
                  likes: likedBy.length
                });
                
                totalLikes++;
              }
            }
          } catch (error) {
            console.warn(`Error migrando like en dibujo ${drawingId}:`, error);
          }
        }
        
        this.log('success', `✅ ${totalLikes} likes migrados`);
      } else {
        this.log('info', 'No hay likes en localStorage para migrar');
      }
      
      this.updateProgress(70, `${totalLikes} likes migrados`);
      
      // MIGRAR COMENTARIOS
      this.log('info', 'Verificando comentarios...');
      
      // Los comentarios ya están en Firestore (no necesitan migración)
      // Solo contar cuántos tiene el usuario
      for (const drawing of allDrawings) {
        const comments = drawing.data?.comments || [];
        const userComments = comments.filter(c => {
          const author = c.author || c.autor || '';
          return author.toLowerCase() === username.toLowerCase();
        });
        totalComments += userComments.length;
      }
      
      this.log('success', `✅ ${totalComments} comentarios encontrados`);
      
      // Actualizar estadísticas en pantalla de éxito
      document.getElementById('migratedLikes').textContent = totalLikes;
      document.getElementById('migratedComments').textContent = totalComments;
      
      this.updateProgress(80, 'Datos migrados');
      this.completeStep(3);
      
    } catch (error) {
      this.log('error', `⚠️ Error en likes/comentarios: ${error.message}`);
      console.error('Error completo:', error);
      this.completeStep(3);
    }
  }

  async migrateStep4_Finalize(username) {
    this.activateStep(4);
    this.updateProgress(85, 'Finalizando migración...');
    this.log('info', 'Guardando datos finales...');
    
    try {
      // Obtener perfil completo del usuario desde Firestore
      const fullProfile = await this.firebase.getUserProfile(username);
      
      // Contar dibujos del usuario para estadísticas
      let totalDrawings = 0;
      try {
        const galleryManager = window.galleryManager || window.guestbookApp?.gallery;
        
        if (galleryManager && galleryManager.allDrawings) {
          totalDrawings = galleryManager.allDrawings.filter(d => {
            const autor = d.autor || d.data?.autor;
            return autor && autor.toLowerCase() === username.toLowerCase();
          }).length;
        } else {
          const allDrawings = await this.firebase.getAllDrawings();
          totalDrawings = allDrawings.filter(d => {
            const autor = d.autor || d.data?.autor;
            return autor && autor.toLowerCase() === username.toLowerCase();
          }).length;
        }
        
        this.log('info', `📊 ${totalDrawings} dibujos encontrados`);
        
        // Actualizar estadística en pantalla de éxito
        document.getElementById('migratedDrawings').textContent = totalDrawings;
      } catch (error) {
        console.warn('Error contando dibujos:', error);
      }
      
      // Marcar cuenta antigua como migrada
      await this.markOldAccountAsMigrated(username, this.currentUser.uid);
      
      // Actualizar perfil COMPLETO en localStorage con TODOS los datos
      const profile = {
        username: username,
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        // Copiar TODOS los datos del perfil existente
        avatar: fullProfile?.avatar || '👤',
        avatarType: fullProfile?.avatarType || 'emoji',
        avatarImage: fullProfile?.avatarImage || null,
        bannerImage: fullProfile?.bannerImage || null,
        bio: fullProfile?.bio || '',
        pronouns: fullProfile?.pronouns || '',
        privacy: fullProfile?.privacy || {},
        totalDrawings: totalDrawings, // Estadística actualizada
        totalLikes: fullProfile?.totalLikes || 0,
        // Datos de sesión
        isLoggedIn: true,
        isLegacyUser: false, // Ya NO es legacy
        migrated: true,
        migrationDate: Date.now(),
        sessionToken: this.generateSessionToken()
      };
      
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('sessionToken', profile.sessionToken);
      localStorage.setItem('accountMigrated', 'true');
      
      // Actualizar el ProfileManager si existe
      if (this.profileManager && this.profileManager.currentProfile) {
        this.profileManager.currentProfile = profile;
      }
      
      this.log('success', `✅ Perfil completo guardado`);
      this.log('success', `✅ Avatar: ${profile.avatar}`);
      this.log('success', `✅ Banner: ${profile.bannerImage ? 'Sí' : 'No'}`);
      this.log('success', `✅ Bio: ${profile.bio ? 'Sí' : 'No'}`);
      this.log('success', `✅ Dibujos: ${profile.totalDrawings}`);
      
      // Informar sobre el cambio en recuperación de cuenta
      this.log('info', '');
      this.log('info', '🔐 Nota importante sobre recuperación:');
      this.log('info', 'Ahora puedes recuperar tu cuenta por email');
      this.log('info', 'Los métodos antiguos (pregunta/código) ya no aplican');
      
      this.updateProgress(100, 'Migración completada');
      this.completeStep(4);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      this.log('error', `❌ Error finalizando: ${error.message}`);
      console.error('Error completo:', error);
      throw error;
    }
  }
  
  generateSessionToken() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  async saveUsernameMapping(username, uid) {
    // Guardar mapeo en Firestore para búsquedas futuras
    try {
      // Usar UID como document ID (no username que puede tener espacios)
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      
      const mappingRef = doc(this.firebase.db, 'auth_usernames', uid);
      
      // IMPORTANTE: Incluir el campo 'domain' requerido por las reglas de Firestore
      await setDoc(mappingRef, {
        username: username,
        uid: uid,
        domain: window.location.hostname || 'thisisfenix.github.io', // Requerido por isValidDomain()
        createdAt: Date.now()
      });
      
      this.log('success', '✅ Mapeo username guardado en Firestore');
      console.log('✅ Mapeo guardado:', username, '→', uid);
    } catch (error) {
      // Si falla, guardar en el perfil del usuario como fallback
      this.log('warning', '⚠️ No se pudo guardar mapeo en auth_usernames, usando perfil');
      console.warn('Error guardando mapeo:', error.code || error.message);
      
      // NO FALLAR - El username ya está en displayName y se puede buscar desde ahí
    }
  }

  async markOldAccountAsMigrated(username, newUid) {
    try {
      // Marcar la cuenta antigua en Firestore como migrada
      const oldAccount = await this.firebase.getUserCredentials(username);
      
      if (oldAccount && oldAccount.id) {
        await this.firebase.db.collection('user_credentials').doc(oldAccount.id).update({
          migrated: true,
          migratedToUid: newUid,
          migrationDate: Date.now()
        });
      }
    } catch (error) {
      console.error('Error marcando cuenta antigua:', error);
    }
  }

  // ========================================
  // UTILIDADES DE UI
  // ========================================
  
  activateStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    if (step) {
      step.classList.add('active');
      step.style.opacity = '1';
    }
  }

  completeStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    if (step) {
      step.classList.remove('active');
      step.classList.add('completed');
      
      // Cambiar icono a check
      const icon = step.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'check-circle');
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  updateProgress(percentage, text) {
    const progressBar = document.getElementById('migrationProgressBar');
    const progressText = document.getElementById('migrationProgressText');
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${Math.round(percentage)}%`;
    }
    
    if (text) {
      this.log('info', text);
    }
  }

  log(type, message) {
    const logContainer = document.getElementById('migrationLog');
    if (!logContainer) return;
    
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  showSuccessScreen() {
    document.getElementById('migrationProgress').style.display = 'none';
    document.getElementById('migrationSuccess').style.display = 'block';
    
    // Actualizar estadísticas (simuladas)
    setTimeout(() => {
      if (window.lucide) lucide.createIcons();
    }, 100);
  }

  showErrorScreen(errorMessage) {
    document.getElementById('migrationProgress').style.display = 'none';
    document.getElementById('migrationError').style.display = 'block';
    document.getElementById('migrationErrorMessage').textContent = errorMessage;
  }

  finishMigration() {
    // Cerrar modal
    const modal = document.getElementById('migrationModal');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    }
    
    // Actualizar estadísticas del perfil si ProfileManager está disponible
    if (window.profileManager || window.guestbookApp?.profiles) {
      const profileManager = window.profileManager || window.guestbookApp.profiles;
      
      // Actualizar estadísticas después de migrar
      setTimeout(() => {
        if (profileManager.updateProfileStats) {
          profileManager.updateProfileStats();
          console.log('📊 Estadísticas actualizadas después de migración');
        }
      }, 500);
    }
    
    // Recargar página para aplicar cambios
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}

// Instancia global
window.accountMigration = null;

// Función de inicialización
window.initAccountMigration = function(firebase, profileManager) {
  if (!window.accountMigration) {
    window.accountMigration = new AccountMigration(firebase, profileManager);
    console.log('✅ Sistema de migración inicializado');
  }
  return window.accountMigration;
};
