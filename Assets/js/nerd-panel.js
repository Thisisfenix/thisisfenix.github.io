// Nerd Panel - Panel de información técnica
class NerdPanel {
  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const nerdBtn = document.getElementById('nerd-btn');
    const closePanel = document.getElementById('close-panel');
    const overlay = document.getElementById('panel-overlay');

    if (nerdBtn) {
      nerdBtn.addEventListener('click', () => this.show());
    }

    if (closePanel) {
      closePanel.addEventListener('click', () => this.hide());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.hide());
    }
  }

  show() {
    this.updateInfo();
    document.getElementById('panel-overlay')?.classList.add('show');
    document.getElementById('nerd-panel')?.classList.add('show');
  }

  hide() {
    document.getElementById('panel-overlay')?.classList.remove('show');
    document.getElementById('nerd-panel')?.classList.remove('show');
  }

  updateInfo() {
    // Usar Utils para obtener información
    const browserInfo = Utils.detectBrowser();
    const deviceInfo = Utils.detectDevice();
    const resolution = `${screen.width}x${screen.height} (${window.innerWidth}x${window.innerHeight})`;
    const jsInfo = Utils.detectJSCapabilities();
    const cssInfo = Utils.detectCSSCapabilities();
    const apiInfo = Utils.detectAPIs();
    const hostingInfo = Utils.detectHosting();
    const perfInfo = Utils.detectPerformance();
    const seoInfo = Utils.detectSEO();
    const a11yInfo = Utils.detectAccessibility();

    // Actualizar elementos
    this.setElementText('browser-info', browserInfo);
    this.setElementText('device-info', deviceInfo);
    this.setElementText('resolution-info', resolution);
    this.setElementText('js-info', jsInfo);
    this.setElementText('css-info', cssInfo);
    this.setElementText('api-info', apiInfo);
    this.setElementText('hosting-info', hostingInfo);
    this.setElementText('performance-info', perfInfo);
    this.setElementText('seo-info', seoInfo);
    this.setElementText('accessibility-info', a11yInfo);
  }

  setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.nerdPanel = new NerdPanel();
  });
} else {
  window.nerdPanel = new NerdPanel();
}
