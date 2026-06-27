// Deadly Pursuer Warning System
class DeadlyPursuerSystem {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // El botón se maneja con onclick inline, pero podemos agregar listeners adicionales
    window.showDeadlyPursuerWarning = () => this.showWarning();
    window.closeDeadlyWarning = () => this.closeWarning();
    window.enterDeadlyPursuer = () => this.enter();
    window.finalizeEntry = () => this.finalize();
  }

  showWarning() {
    const modal = document.createElement('div');
    modal.className = 'deadly-warning-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="deadly-warning-content">
        <h3>⚠️ ADVERTENCIA FINAL ⚠️</h3>
        <p style="color: #ff6666 !important;">
          ¿Estás seguro de que quieres continuar?<br><br>
          Una vez que entres, no podrás salir hasta completar la experiencia.
        </p>
        <div class="deadly-warning-buttons">
          <button class="deadly-btn" onclick="enterDeadlyPursuer()">SÍ</button>
          <button class="deadly-btn" onclick="closeDeadlyWarning()">NO</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  closeWarning() {
    const modal = document.querySelector('.deadly-warning-modal');
    if (modal) modal.remove();
  }

  enter() {
    const survivorNumber = Math.floor(Math.random() * 100) + 1;
    this.closeWarning();
    
    const welcomeModal = document.createElement('div');
    welcomeModal.className = 'deadly-warning-modal';
    welcomeModal.style.display = 'flex';
    welcomeModal.innerHTML = `
      <div class="deadly-warning-content">
        <h3>🔴 ACCESO CONCEDIDO</h3>
        <p style="color: #ff6666 !important;">
          Una vez ingresado ya no podrás salir.<br><br>
          <strong style="color: #ff0000;">Bienvenido sobreviviente #${survivorNumber}</strong>
        </p>
        <div class="deadly-warning-buttons">
          <button class="deadly-btn" onclick="finalizeEntry()">CONTINUAR</button>
        </div>
      </div>
    `;
    document.body.appendChild(welcomeModal);
  }

  finalize() {
    this.closeWarning();
    window.open('Experimentos/public/index.html', '_blank');
    
    // Registrar logro si existe el sistema
    if (window.checkAchievement) {
      window.checkAchievement('deadly-pursuer-player');
    }
  }
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.deadlyPursuerSystem = new DeadlyPursuerSystem();
  });
} else {
  window.deadlyPursuerSystem = new DeadlyPursuerSystem();
}
