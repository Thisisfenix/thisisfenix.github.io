// Effects Manager - Efectos visuales y animaciones
class EffectsManager {
  constructor() {
    this.particlesContainer = null;
    this.matrixCanvas = null;
    this.mouseParticleActive = false;
  }

  // Crear partículas en el hero
  createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      const size = Math.random() * 2 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100 + 100}%`;

      const duration = Math.random() * 10 + 10;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;

      container.appendChild(particle);
    }
  }

  // Efecto typewriter
  typeWriterEffect() {
    const title = document.getElementById('typewriter');
    if (!title) return;
    
    const text = "THISISFENIX LABORATORY";
    let i = 0;

    title.textContent = '';

    const type = () => {
      if (i < text.length) {
        title.textContent = text.substring(0, i + 1);
        i++;
        setTimeout(type, 80);
      }
    };

    type();
  }

  // Parallax background
  setupParallax() {
    const parallaxBg = document.getElementById('parallax-bg');
    if (!parallaxBg) return;
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        parallaxBg.style.transform = `translateY(${rate}px)`;
      }, { passive: true });
    }
  }

  // Lazy loading para imágenes
  setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if (!images.length) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Transiciones de página
  setupPageTransitions() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });

    document.querySelectorAll('section').forEach(section => {
      section.classList.add('page-transition');
      observer.observe(section);
    });
  }

  // Matrix Rain Effect
  activateMatrixRain(duration = 300000) {
    if (this.matrixCanvas) return; // Ya está activo
    
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:-1';
    document.body.appendChild(canvas);
    this.matrixCanvas = canvas;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = 'function(){return Math.random();}console.log("Hello World");if(true){code=awesome;}for(let i=0;i<10;i++){}';
    const drops = Array(Math.floor(canvas.width/20)).fill(1);
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#00ff00';
      ctx.font = '12px "Courier New", monospace';
      
      drops.forEach((y,i) => {
        const char = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillText(char, i*20, y*20);
        if(y*20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    
    const interval = setInterval(draw, 33);
    
    setTimeout(() => {
      clearInterval(interval);
      canvas.remove();
      this.matrixCanvas = null;
    }, duration);
  }

  // Mouse Particles Effect
  activateMouseParticles(duration = 300000) {
    if (this.mouseParticleActive) return;
    
    this.mouseParticleActive = true;
    
    const handler = (e) => {
      if (!this.mouseParticleActive) return;
      if (Math.random() < 0.3) {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position:fixed;width:4px;height:4px;background:var(--primary);
          border-radius:50%;left:${e.clientX}px;top:${e.clientY}px;
          pointer-events:none;z-index:9999;animation:fadeOut 1s ease-out forwards;
        `;
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }
    };
    
    document.addEventListener('mousemove', handler);
    
    setTimeout(() => {
      this.mouseParticleActive = false;
      document.removeEventListener('mousemove', handler);
    }, duration);
  }

  // Combo indicator
  showComboIndicator(comboCount) {
    const indicator = document.createElement('div');
    indicator.className = 'combo-indicator';
    indicator.innerHTML = `🔥 COMBO x${comboCount}!`;
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--primary);
      color: white;
      padding: 2rem 3rem;
      border-radius: 12px;
      font-size: 2rem;
      font-weight: bold;
      z-index: 10000;
      animation: comboPopup 3s ease-out forwards;
      box-shadow: 0 0 30px var(--primary);
    `;
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      indicator.remove();
    }, 3000);
  }

  // Inicializar todos los efectos
  initializeAll() {
    // Usar requestIdleCallback si está disponible
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.setupLazyLoading();
        this.setupParallax();
        this.setupPageTransitions();
      });
    } else {
      setTimeout(() => {
        this.setupLazyLoading();
        this.setupParallax();
        this.setupPageTransitions();
      }, 100);
    }
    
    // Efectos críticos inmediatos
    this.createParticles();
    this.typeWriterEffect();
  }
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.effectsManager = new EffectsManager();
    window.effectsManager.initializeAll();
  });
} else {
  window.effectsManager = new EffectsManager();
  window.effectsManager.initializeAll();
}
