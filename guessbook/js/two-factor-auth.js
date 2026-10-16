/**
 * Sistema de Autenticación de Dos Factores (2FA)
 * Combina códigos por email + códigos de respaldo
 * Solo para usuarios con Firebase Authentication
 */

class TwoFactorAuth {
  constructor(firebase, profileManager) {
    this.firebase = firebase;
    this.profileManager = profileManager;
    this.pendingVerification = null; // Usuario pendiente de verificar 2FA
  }

  /**
   * Genera un código de verificación de 6 dígitos
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Genera 8 códigos de respaldo únicos
   */
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      // Formato: XXXX-XXXX-XXXX (12 caracteres)
      const code = [
        this.randomString(4),
        this.randomString(4),
        this.randomString(4)
      ].join('-');
      codes.push(code);
    }
    return codes;
  }

  randomString(length) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos (I, O, 0, 1)
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Verifica si el usuario tiene 2FA activado
   */
  async is2FAEnabled(uid) {
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      const twoFactorRef = doc(this.firebase.db, 'two_factor_auth', uid);
      const twoFactorSnap = await getDoc(twoFactorRef);
      
      if (twoFactorSnap.exists()) {
        return twoFactorSnap.data().enabled === true;
      }
      return false;
    } catch (error) {
      console.error('Error verificando 2FA:', error);
      return false;
    }
  }

  /**
   * Activa 2FA para un usuario
   */
  async enable2FA(uid, email) {
    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      
      // Generar códigos de respaldo
      const backupCodes = this.generateBackupCodes();
      
      const twoFactorData = {
        enabled: true,
        email: email,
        backupCodes: backupCodes.map(code => ({
          code: code,
          used: false,
          usedAt: null
        })),
        enabledAt: Date.now(),
        domain: window.location.hostname || 'thisisfenix.github.io'
      };

      const twoFactorRef = doc(this.firebase.db, 'two_factor_auth', uid);
      await setDoc(twoFactorRef, twoFactorData);

      return {
        success: true,
        backupCodes: backupCodes
      };
    } catch (error) {
      console.error('Error activando 2FA:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Desactiva 2FA para un usuario
   */
  async disable2FA(uid) {
    try {
      const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      const twoFactorRef = doc(this.firebase.db, 'two_factor_auth', uid);
      await deleteDoc(twoFactorRef);
      return true;
    } catch (error) {
      console.error('Error desactivando 2FA:', error);
      return false;
    }
  }

  /**
   * Envía código de verificación por email
   */
  async sendVerificationCode(uid, email) {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutos

      // Guardar código en Firestore temporalmente
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      const codeRef = doc(this.firebase.db, 'verification_codes', uid);
      
      await setDoc(codeRef, {
        code: code,
        email: email,
        createdAt: Date.now(),
        expiresAt: expiresAt,
        attempts: 0,
        domain: window.location.hostname || 'thisisfenix.github.io'
      });

      // Aquí normalmente enviarías el email
      // Por ahora, lo mostramos en consola (en producción usarías Cloud Functions)
      console.log(`📧 Código de verificación para ${email}: ${code}`);
      console.log(`⏰ Expira en 10 minutos`);

      // TODO: Implementar envío de email real con Firebase Cloud Functions
      // o servicio de terceros como SendGrid, Mailgun, etc.

      return {
        success: true,
        expiresAt: expiresAt
      };
    } catch (error) {
      console.error('Error enviando código:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica un código de verificación por email
   */
  async verifyCode(uid, inputCode) {
    try {
      const { doc, getDoc, updateDoc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      const codeRef = doc(this.firebase.db, 'verification_codes', uid);
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) {
        return {
          success: false,
          error: 'No hay código de verificación pendiente'
        };
      }

      const data = codeSnap.data();

      // Verificar expiración
      if (Date.now() > data.expiresAt) {
        await deleteDoc(codeRef);
        return {
          success: false,
          error: 'El código ha expirado'
        };
      }

      // Verificar intentos
      if (data.attempts >= 3) {
        await deleteDoc(codeRef);
        return {
          success: false,
          error: 'Demasiados intentos fallidos'
        };
      }

      // Verificar código
      if (data.code === inputCode.trim()) {
        // Código correcto
        await deleteDoc(codeRef);
        return {
          success: true
        };
      } else {
        // Código incorrecto, incrementar intentos
        await updateDoc(codeRef, {
          attempts: data.attempts + 1
        });
        return {
          success: false,
          error: 'Código incorrecto',
          attemptsLeft: 2 - data.attempts
        };
      }
    } catch (error) {
      console.error('Error verificando código:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica un código de respaldo
   */
  async verifyBackupCode(uid, inputCode) {
    try {
      const { doc, getDoc, updateDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      const twoFactorRef = doc(this.firebase.db, 'two_factor_auth', uid);
      const twoFactorSnap = await getDoc(twoFactorRef);

      if (!twoFactorSnap.exists()) {
        return {
          success: false,
          error: '2FA no está activado'
        };
      }

      const data = twoFactorSnap.data();
      const backupCodes = data.backupCodes || [];

      // Buscar el código
      const codeIndex = backupCodes.findIndex(
        bc => bc.code === inputCode.trim().toUpperCase() && !bc.used
      );

      if (codeIndex === -1) {
        return {
          success: false,
          error: 'Código de respaldo inválido o ya usado'
        };
      }

      // Marcar código como usado
      backupCodes[codeIndex].used = true;
      backupCodes[codeIndex].usedAt = Date.now();

      await updateDoc(twoFactorRef, {
        backupCodes: backupCodes
      });

      return {
        success: true,
        codesRemaining: backupCodes.filter(bc => !bc.used).length
      };
    } catch (error) {
      console.error('Error verificando código de respaldo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene los códigos de respaldo del usuario
   */
  async getBackupCodes(uid) {
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      const twoFactorRef = doc(this.firebase.db, 'two_factor_auth', uid);
      const twoFactorSnap = await getDoc(twoFactorRef);

      if (!twoFactorSnap.exists()) {
        return null;
      }

      const data = twoFactorSnap.data();
      return data.backupCodes || [];
    } catch (error) {
      console.error('Error obteniendo códigos de respaldo:', error);
      return null;
    }
  }

  /**
   * Genera nuevos códigos de respaldo (invalida los anteriores)
   */
  async regenerateBackupCodes(uid) {
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      
      const newCodes = this.generateBackupCodes();
      const twoFactorRef = doc(this.firebase.db, 'two_factor_auth', uid);
      
      await updateDoc(twoFactorRef, {
        backupCodes: newCodes.map(code => ({
          code: code,
          used: false,
          usedAt: null
        })),
        regeneratedAt: Date.now()
      });

      return {
        success: true,
        backupCodes: newCodes
      };
    } catch (error) {
      console.error('Error regenerando códigos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Muestra modal de verificación 2FA durante login
   */
  showVerificationModal(uid, email, onSuccess, onCancel) {
    const modal = document.createElement('div');
    modal.id = 'twoFactorModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 450px;">
        <div class="modal-header">
          <h2>🔐 Verificación en Dos Pasos</h2>
        </div>
        <div class="modal-body">
          <div id="emailCodeSection">
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
              Hemos enviado un código de verificación a:<br>
              <strong style="color: var(--primary);">${email}</strong>
            </p>
            
            <div class="form-group">
              <label>📧 Código de Verificación</label>
              <input 
                type="text" 
                id="verificationCodeInput" 
                placeholder="123456"
                maxlength="6"
                style="text-align: center; font-size: 1.5em; letter-spacing: 0.3em;"
                autocomplete="off"
              >
              <small id="codeError" style="color: var(--error); display: none;"></small>
            </div>

            <button class="btn-primary btn-block" onclick="window.verify2FACode()">
              Verificar Código
            </button>

            <div style="text-align: center; margin-top: 15px;">
              <button class="btn-link" onclick="window.use2FABackupCode()">
                🔑 Usar código de respaldo
              </button>
            </div>
          </div>

          <div id="backupCodeSection" style="display: none;">
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
              Ingresa uno de tus códigos de respaldo
            </p>
            
            <div class="form-group">
              <label>🔑 Código de Respaldo</label>
              <input 
                type="text" 
                id="backupCodeInput" 
                placeholder="XXXX-XXXX-XXXX"
                maxlength="14"
                style="text-align: center; font-size: 1.2em; letter-spacing: 0.2em; text-transform: uppercase;"
                autocomplete="off"
              >
              <small id="backupError" style="color: var(--error); display: none;"></small>
            </div>

            <button class="btn-primary btn-block" onclick="window.verifyBackupCode()">
              Verificar Código de Respaldo
            </button>

            <div style="text-align: center; margin-top: 15px;">
              <button class="btn-link" onclick="window.backToEmailCode()">
                ← Volver a código por email
              </button>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <button class="btn-link" onclick="window.cancel2FA()">
              Cancelar
            </button>
          </div>

          <div style="margin-top: 20px; padding: 12px; background: rgba(var(--primary-rgb), 0.1); border-radius: 6px; font-size: 0.85em;">
            <strong>💡 Consejo:</strong> El código expira en 10 minutos
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-focus en el input
    setTimeout(() => {
      document.getElementById('verificationCodeInput').focus();
    }, 100);

    // Funciones globales para los botones
    window.verify2FACode = async () => {
      const code = document.getElementById('verificationCodeInput').value;
      const errorEl = document.getElementById('codeError');
      
      if (!code || code.length !== 6) {
        errorEl.textContent = 'Ingresa un código de 6 dígitos';
        errorEl.style.display = 'block';
        return;
      }

      const result = await this.verifyCode(uid, code);
      
      if (result.success) {
        modal.remove();
        if (onSuccess) onSuccess();
      } else {
        errorEl.textContent = result.error;
        if (result.attemptsLeft !== undefined) {
          errorEl.textContent += ` (${result.attemptsLeft} intentos restantes)`;
        }
        errorEl.style.display = 'block';
      }
    };

    window.verifyBackupCode = async () => {
      const code = document.getElementById('backupCodeInput').value;
      const errorEl = document.getElementById('backupError');
      
      if (!code) {
        errorEl.textContent = 'Ingresa un código de respaldo';
        errorEl.style.display = 'block';
        return;
      }

      const result = await this.verifyBackupCode(uid, code);
      
      if (result.success) {
        modal.remove();
        if (result.codesRemaining === 0) {
          alert('⚠️ Has usado tu último código de respaldo. Genera nuevos códigos en tu perfil.');
        } else if (result.codesRemaining <= 2) {
          alert(`⚠️ Solo te quedan ${result.codesRemaining} códigos de respaldo. Considera generar nuevos.`);
        }
        if (onSuccess) onSuccess();
      } else {
        errorEl.textContent = result.error;
        errorEl.style.display = 'block';
      }
    };

    window.use2FABackupCode = () => {
      document.getElementById('emailCodeSection').style.display = 'none';
      document.getElementById('backupCodeSection').style.display = 'block';
      setTimeout(() => {
        document.getElementById('backupCodeInput').focus();
      }, 100);
    };

    window.backToEmailCode = () => {
      document.getElementById('backupCodeSection').style.display = 'none';
      document.getElementById('emailCodeSection').style.display = 'block';
      setTimeout(() => {
        document.getElementById('verificationCodeInput').focus();
      }, 100);
    };

    window.cancel2FA = () => {
      modal.remove();
      if (onCancel) onCancel();
    };

    // Enter para enviar
    document.getElementById('verificationCodeInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') window.verify2FACode();
    });
    
    document.getElementById('backupCodeInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') window.verifyBackupCode();
    });
  }
}

// Exportar para uso global
window.TwoFactorAuth = TwoFactorAuth;
