// Utilities - Funciones de utilidad y helpers
class Utils {
  // Scroll seguro con fallback
  static safeScrollIntoView(elementId, options = { behavior: 'smooth' }) {
    try {
      const element = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
      if (element && element.scrollIntoView && typeof element.scrollIntoView === 'function') {
        element.scrollIntoView(options);
        return true;
      } else {
        console.warn(`Elemento no encontrado o no tiene scrollIntoView: ${elementId}`);
        // Fallback: scroll manual
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          window.scrollTo({
            top: scrollTop + rect.top - 100,
            behavior: 'smooth'
          });
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error en safeScrollIntoView:', error);
      return false;
    }
  }

  // Generar ID único para dispositivo
  static generateDeviceId() {
    const id = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('device-id', id);
    return id;
  }

  // Obtener ID de usuario
  static getUserId() {
    let userId = localStorage.getItem('user-id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('user-id', userId);
    }
    return userId;
  }

  // Detectar navegador
  static detectBrowser() {
    const ua = navigator.userAgent;
    let browserInfo = 'Desconocido';
    
    if (ua.includes('Edg/')) browserInfo = `Edge ${ua.match(/Edg\/(\d+)/)?.[1] || ''}`;
    else if (ua.includes('Chrome/') && !ua.includes('Edg')) browserInfo = `Chrome ${ua.match(/Chrome\/(\d+)/)?.[1] || ''}`;
    else if (ua.includes('Firefox/')) browserInfo = `Firefox ${ua.match(/Firefox\/(\d+)/)?.[1] || ''}`;
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browserInfo = `Safari ${ua.match(/Version\/(\d+)/)?.[1] || ''}`;
    
    return browserInfo;
  }

  // Detectar dispositivo y OS
  static detectDevice() {
    const ua = navigator.userAgent;
    let deviceInfo = 'Escritorio';
    
    if (/iPhone|iPad|iPod/.test(ua)) deviceInfo = `iOS ${ua.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || ''}`;
    else if (/Android/.test(ua)) deviceInfo = `Android ${ua.match(/Android (\d+\.\d+)/)?.[1] || ''}`;
    else if (/Windows NT/.test(ua)) deviceInfo = `Windows ${ua.match(/Windows NT (\d+\.\d+)/)?.[1] || ''}`;
    else if (/Mac OS X/.test(ua)) deviceInfo = `macOS ${ua.match(/Mac OS X (\d+_\d+)/)?.[1]?.replace('_', '.') || ''}`;
    else if (/Linux/.test(ua)) deviceInfo = 'Linux';
    
    return deviceInfo;
  }

  // Detectar capacidades JavaScript
  static detectJSCapabilities() {
    const jsFeatures = [];
    if ('serviceWorker' in navigator) jsFeatures.push('Service Workers');
    if ('WebAssembly' in window) jsFeatures.push('WebAssembly');
    if ('fetch' in window) jsFeatures.push('Fetch API');
    if ('localStorage' in window) jsFeatures.push('LocalStorage');
    return jsFeatures.length > 0 ? jsFeatures.join(', ') : 'Básico';
  }

  // Detectar capacidades CSS
  static detectCSSCapabilities() {
    const cssFeatures = [];
    if (CSS.supports('display', 'grid')) cssFeatures.push('Grid');
    if (CSS.supports('display', 'flex')) cssFeatures.push('Flexbox');
    if (CSS.supports('backdrop-filter', 'blur(10px)')) cssFeatures.push('Backdrop Filter');
    if (CSS.supports('color', 'color(display-p3 1 0 0)')) cssFeatures.push('P3 Colors');
    return cssFeatures.length > 0 ? cssFeatures.join(', ') : 'Básico';
  }

  // Detectar APIs disponibles
  static detectAPIs() {
    const apis = [];
    if ('geolocation' in navigator) apis.push('Geolocation');
    if ('mediaDevices' in navigator) apis.push('Media Devices');
    if ('Notification' in window) apis.push('Notifications');
    if ('IntersectionObserver' in window) apis.push('Intersection Observer');
    return apis.length > 0 ? apis.join(', ') : 'Limitadas';
  }

  // Detectar hosting
  static detectHosting() {
    const hostname = window.location.hostname;
    let hostingInfo = 'Local';
    if (hostname.includes('github.io')) hostingInfo = 'GitHub Pages';
    else if (hostname.includes('netlify')) hostingInfo = 'Netlify';
    else if (hostname.includes('vercel')) hostingInfo = 'Vercel';
    else if (hostname !== 'localhost' && hostname !== '127.0.0.1') hostingInfo = 'Servidor Web';
    return hostingInfo;
  }

  // Detectar optimizaciones de performance
  static detectPerformance() {
    const perfFeatures = [];
    if ('requestIdleCallback' in window) perfFeatures.push('Idle Callback');
    if ('IntersectionObserver' in window) perfFeatures.push('Lazy Loading');
    if ('serviceWorker' in navigator) perfFeatures.push('Service Worker');
    return perfFeatures.length > 0 ? perfFeatures.join(', ') : 'Básico';
  }

  // Detectar características SEO
  static detectSEO() {
    const seoFeatures = [];
    if (document.querySelector('meta[property="og:title"]')) seoFeatures.push('Open Graph');
    if (document.querySelector('meta[name="description"]')) seoFeatures.push('Meta Description');
    if (document.querySelector('link[rel="canonical"]')) seoFeatures.push('Canonical');
    return seoFeatures.length > 0 ? seoFeatures.join(', ') : 'Básico';
  }

  // Detectar accesibilidad
  static detectAccessibility() {
    const a11yFeatures = [];
    if (document.querySelector('[aria-label]')) a11yFeatures.push('ARIA Labels');
    if (document.querySelector('main, nav, header, footer')) a11yFeatures.push('Semántica HTML5');
    if (document.querySelector('[alt]')) a11yFeatures.push('Alt Text');
    return a11yFeatures.length > 0 ? a11yFeatures.join(', ') : 'Básico';
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Sanitizar HTML para prevenir XSS
  static sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  // Formatear fecha
  static formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener string de semana
  static getWeekString(date) {
    const year = date.getFullYear();
    const week = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
    return `${year}-W${week}`;
  }

  // Verificar si es móvil
  static isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Verificar si prefiere movimiento reducido
  static prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Copiar al portapapeles
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
      return false;
    }
  }

  // Mostrar notificación temporal
  static showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--bg-dark);
      color: var(--text-primary);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      border: 2px solid var(--primary);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Validar email
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validar URL
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Formatear número con separadores
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Obtener parámetros de URL
  static getURLParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }

  // Establecer parámetro de URL sin recargar
  static setURLParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
  }
}

// Exportar para uso global
window.Utils = Utils;

// Función global de scroll seguro para compatibilidad
window.safeScrollIntoView = Utils.safeScrollIntoView;
