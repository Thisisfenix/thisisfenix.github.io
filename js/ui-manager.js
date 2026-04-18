// UI Manager - Manejo de interfaz y navegación
class UIManager {
  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Navegación
    const creditsBtn = document.getElementById('credits-btn');
    const updatesBtn = document.getElementById('updates-btn');
    const experimentosBtn = document.getElementById('experimentos-btn');
    const navbarBrand = document.querySelector('.navbar-brand');
    
    if (creditsBtn) creditsBtn.addEventListener('click', () => this.showCredits());
    if (updatesBtn) updatesBtn.addEventListener('click', () => this.showUpdates());
    if (experimentosBtn) experimentosBtn.addEventListener('click', () => this.showExperimentos());
    if (navbarBrand) navbarBrand.addEventListener('click', (e) => {
      e.preventDefault();
      this.showMainContent();
      // Scroll hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Botón volver arriba
    const btnTop = document.getElementById('btn-top');
    if (btnTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          btnTop.classList.add('visible');
        } else {
          btnTop.classList.remove('visible');
        }
      });
      btnTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Scroll optimizado con requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateActiveNav();
          this.checkScrollToBottom();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  hideAllSections() {
    const sections = [
      'credits-section',
      'updates-section',
      'achievements-section',
      'experimentos-section'
    ];
    
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.remove('active');
        element.style.display = 'none';
      }
    });
    
    // Ocultar main-content con clase hidden
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.classList.add('hidden');
  }

  showMainContent() {
    // Ocultar secciones especiales
    const sections = [
      'credits-section',
      'updates-section',
      'achievements-section',
      'experimentos-section'
    ];
    
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.remove('active');
        element.style.display = 'none';
      }
    });
    
    // Mostrar main-content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('hidden');
      mainContent.style.display = ''; // Restaurar display
    }
    
    // Restaurar título original si fue modificado
    this.restoreTitle();
  }
  
  restoreTitle() {
    // Obtener la versión del botón si existe
    const versionSpan = document.getElementById('version-number');
    if (versionSpan && versionSpan.textContent) {
      const version = versionSpan.textContent;
      document.title = `🔬 FenixLaboratory ${version} - Experimentos y Proyectos`;
    } else {
      document.title = '🔬 FenixLaboratory - Experimentos y Proyectos';
    }
  }

  showExperimentos() {
    this.hideAllSections();
    const experimentosSection = document.getElementById('experimentos-section');
    if (experimentosSection) {
      experimentosSection.classList.add('active');
      experimentosSection.style.display = 'block';
    }
  }

  async showCredits() {
    try {
      this.hideAllSections();
      const creditsSection = document.getElementById('credits-section');
      if (creditsSection) {
        creditsSection.classList.add('active');
        creditsSection.style.display = 'block';
      }

      // Cargar Font Awesome solo cuando se necesita
      if (!document.getElementById('font-awesome-css')) {
        const fa = document.createElement('link');
        fa.id = 'font-awesome-css';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        fa.integrity = 'sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==';
        fa.crossOrigin = 'anonymous';
        fa.referrerPolicy = 'no-referrer';
        document.head.appendChild(fa);
      }

      const [creditsResponse, updatesResponse] = await Promise.all([
        fetch('json/credits.json'),
        fetch('json/updates.json')
      ]);
      const credits = await creditsResponse.json();
      const updates = await updatesResponse.json();
      
      this.renderCredits(credits, updates);
      
      // Cargar primer personaje por defecto
      setTimeout(() => this.loadOC('ankush'), 100);
    } catch (error) {
      document.getElementById('json-viewer').innerHTML = 
        '<p style="color: var(--text-secondary);">Error al cargar credits.json: ' + error.message + '</p>';
    }
  }

  renderCredits(credits, updates) {
    let html = `
      <div class="credit-header">
        <div class="credit-badge">🏆 ${updates.version}</div>
        <h3>${credits["que es esto wey"]}</h3>
        <p>${credits.descripcion}</p>
        <div class="status-badge">${credits.estado} • ${credits.hosting}</div>
      </div>
    `;
    
    // Información del desarrollador
    if (credits.el_wey_que_hizo_esto) {
      const dev = credits.el_wey_que_hizo_esto;
      html += `
        <div class="credit-section">
          <h4>👨‍💻 Desarrollador</h4>
          <div class="credit-item">
            <div class="developer-info">
              <img src="${dev.foto_perfil}" alt="${dev.quien_soy}" style="width: 60px; height: 60px; border-radius: 50%; float: left; margin-right: 1rem; object-fit: cover;">
              <div>
                <strong>${dev.quien_soy}</strong><br>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.5rem 0;">${dev.descripcion_personal}</p>
                <div class="social-links">
      `;
      if (dev.redes) {
        Object.entries(dev.redes).forEach(([platform, url]) => {
          const icon = platform === 'github' ? 'fab fa-github' : 
                      platform === 'twitter' ? 'fab fa-twitter' : 
                      platform === 'tiktok' ? 'fab fa-tiktok' : 'fas fa-link';
          html += `<a href="${url}" target="_blank" class="social-link"><i class="${icon}"></i> ${platform}</a>`;
        });
      }
      html += `</div></div><div style="clear: both;"></div></div></div></div>`;
    }
    
    // Sección de OCs
    html += this.renderOCSection();
    
    // Características
    if (credits.que_hace) {
      html += `
        <div class="credit-section">
          <h4 onclick="window.uiManager.toggleSection('features')" style="cursor:pointer;user-select:none;">
            ✨ Características <span id="arrow-features" style="float:right;transition:transform 0.3s;">▼</span>
          </h4>
          <div id="content-features" class="features-grid" style="transition:max-height 0.3s ease,opacity 0.3s ease;overflow:hidden;">
      `;
      credits.que_hace.forEach(feature => {
        html += `<div class="feature-item">• ${feature}</div>`;
      });
      html += `</div></div>`;
    }
    
    // Resto de secciones...
    html += this.renderCreditsOtherSections(credits);
    
    document.getElementById('json-viewer').innerHTML = html;
  }

  renderOCSection() {
    return `
      <div class="credit-section">
        <h4 onclick="window.uiManager.toggleSection('ocs')" style="cursor:pointer;user-select:none;">
          🎨 Mis Personajes Originales <span id="arrow-ocs" style="float:right;transition:transform 0.3s;">▼</span>
        </h4>
        <div id="content-ocs" style="transition:max-height 0.3s ease,opacity 0.3s ease;overflow:hidden;">
          <div style="text-align: center; margin-bottom: 1rem;">
            <button onclick="window.uiManager.loadOC('ankush')" class="btn btn-outline-neon" style="margin: 0.25rem;">Ankush</button>
            <button onclick="window.uiManager.loadOC('anna')" class="btn btn-outline-neon" style="margin: 0.25rem;">Anna Moonred</button>
          </div>
          <div id="oc-container" style="width: 100%; height: 600px; border-radius: 8px; overflow: hidden; border: 2px solid var(--primary); background: var(--bg-dark);"></div>
        </div>
      </div>
    `;
  }

  renderCreditsOtherSections(credits) {
    let html = '';
    
    // Créditos especiales
    if (credits.creditos) {
      html += `<div class="credit-section"><h4 onclick="window.uiManager.toggleSection('credits')" style="cursor:pointer;user-select:none;">🙏 Créditos <span id="arrow-credits" style="float:right;transition:transform 0.3s;">▼</span></h4><div id="content-credits" style="transition:max-height 0.3s ease,opacity 0.3s ease;overflow:hidden;">`;
      
      if (credits.creditos.inspiracion) {
        const insp = credits.creditos.inspiracion;
        html += `
          <div class="credit-item">
            <div class="credit-key">Inspiración:</div>
            <div class="credit-value">
              <img src="${insp.imagen}" alt="${insp.autor}" style="width: 60px; height: 60px; border-radius: 50%; float: left; margin-right: 1rem; object-fit: cover;">
              <div>
                <strong>${insp.autor}</strong><br>
                ${insp.texto}<br>
                <a href="${insp.url}" target="_blank" class="credit-link">Ver sitio original</a>
              </div>
              <div style="clear: both;"></div>
            </div>
          </div>
        `;
      }
      
      if (credits.creditos.tecnologias) {
        const tech = credits.creditos.tecnologias;
        html += `
          <div class="credit-item">
            <div class="credit-key">Tecnologías:</div>
            <div class="credit-value">
              <strong>Frontend:</strong> ${tech.frontend.join(', ')}<br>
              <strong>Frameworks:</strong> ${tech.frameworks.join(', ')}<br>
              <strong>APIs:</strong> ${tech.apis.join(', ')}<br>
              <strong>Hosting:</strong> ${tech.hosting}<br>
              <strong>PWA:</strong> ${tech.pwa}<br>
              <strong>Fuentes:</strong> ${tech.fuentes}
            </div>
          </div>
        `;
      }

      if (credits.creditos.testing) {
        html += `<div class="credit-item"><div class="credit-key">Testing:</div><div class="credit-value">${credits.creditos.testing}</div></div>`;
      }
      
      html += `</div></div>`;
    }
    
    // Legal, bugs, planes futuros, mensaje final...
    if (credits.legal_stuff) {
      html += `
        <div class="credit-section">
          <h4 onclick="window.uiManager.toggleSection('legal')" style="cursor:pointer;user-select:none;">
            ⚖️ Legal <span id="arrow-legal" style="float:right;transition:transform 0.3s;">▼</span>
          </h4>
          <div id="content-legal" style="transition:max-height 0.3s ease,opacity 0.3s ease;overflow:hidden;">
            <div class="credit-item">
              <div class="credit-key">Licencia:</div>
              <div class="credit-value">${credits.legal_stuff.licencia}</div>
            </div>
            <div class="credit-item">
              <div class="credit-key">Disclaimer:</div>
              <div class="credit-value">${credits.legal_stuff.disclaimer}</div>
            </div>
          </div>
        </div>
      `;
    }
    
    if (credits.mensaje_final) {
      html += `
        <div class="credit-section final-message">
          <div class="message-box">
            <i class="fas fa-heart"></i>
            <p>${credits.mensaje_final}</p>
          </div>
        </div>
      `;
    }
    
    return html;
  }

  toggleSection(id) {
    const content = document.getElementById('content-' + id);
    const arrow = document.getElementById('arrow-' + id);
    if (content && arrow) {
      if (content.style.maxHeight && content.style.maxHeight !== '0px') {
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        arrow.style.transform = 'rotate(-90deg)';
        arrow.textContent = '▶';
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
        arrow.style.transform = 'rotate(0deg)';
        arrow.textContent = '▼';
      }
    }
  }

  loadOC(character) {
    const urls = {
      'ankush': 'https://funkyatlas.abelitogamer.com/FunkyerPlaza/FunkyerPlaza.html#Personajes/Fenix/Ankush.md',
      'anna': 'https://funkyatlas.abelitogamer.com/FunkyerPlaza/FunkyerPlaza.html#Personajes/Fenix/AnnaMoonred.md'
    };
    
    const container = document.getElementById('oc-container');
    if (container) {
      container.innerHTML = '';
      const frame = document.createElement('iframe');
      frame.style.cssText = 'width:100%;height:100%;border:none';
      frame.scrolling = 'no';
      frame.src = urls[character];
      container.appendChild(frame);
    }
  }

  async showUpdates() {
    try {
      this.hideAllSections();
      const updatesSection = document.getElementById('updates-section');
      if (updatesSection) {
        updatesSection.classList.add('active');
        updatesSection.style.display = 'block';
      }
      
      const response = await fetch('json/updates.json');
      const data = await response.json();
      
      this.renderUpdates(data);
      
      const updatesViewer = document.getElementById('updates-viewer');
      if (updatesViewer) {
        window.updatesData = data;
      }
    } catch (error) {
      const updatesViewer = document.getElementById('updates-viewer');
      if (updatesViewer) {
        updatesViewer.innerHTML = '<p style="color: var(--text-secondary);">Error al cargar updates.json: ' + error.message + '</p>';
      }
    }
  }

  renderUpdates(data) {
    let html = `
      <div class="mb-3 text-center">
        <div class="points-badge" style="background: var(--primary); display: inline-block;">
          Versión Actual: ${data.version}
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start;">
        <div id="versions-list" style="background: var(--bg-dark); border-radius: 12px; padding: 1.5rem; max-height: 600px; overflow-y: auto; position: sticky; top: 100px;">
          <h5 style="color: var(--primary); margin-bottom: 1.5rem; font-size: 1rem; text-align: center;">📝 Versiones</h5>
    `;
    
    data.updates.forEach((update, index) => {
      const typeColor = this.getUpdateTypeColor(update.type);
      const isDeprecated = update.status === 'discarded';
      html += `
        <div class="version-card ${index === 0 ? 'active' : ''}" 
             onclick="window.uiManager.showVersionDetails(${index})" 
             data-index="${index}" 
             style="padding: 1rem; margin-bottom: 0.75rem; border-radius: 10px; cursor: pointer; border-left: 4px solid ${typeColor}; background: var(--bg-light); transition: all 0.3s; ${isDeprecated ? 'opacity: 0.6;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div style="font-weight: bold; font-size: 1rem; color: var(--text-primary);">v${update.version}</div>
            <span style="background: ${typeColor}; padding: 0.2rem 0.5rem; border-radius: 12px; color: white; font-size: 0.65rem; font-weight: bold;">
              ${update.type.toUpperCase()}
            </span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${update.date}</div>
        </div>
      `;
    });
    
    html += `
        </div>
        <div id="version-details" style="background: var(--bg-dark); border-radius: 12px; padding: 2rem; min-height: 400px;">
    `;
    
    const firstUpdate = data.updates[0];
    html += this.generateVersionDetails(firstUpdate);
    
    html += '</div></div>';
    
    if (data.roadmap?.length) {
      html += '<h4 style="color: var(--primary); margin: 2rem 0 1rem;">🗺️ Próximas Funciones</h4>';
      html += '<div style="display: grid; gap: 1rem;">';
      data.roadmap.forEach(item => {
        html += `
          <div class="credit-item" style="margin-bottom: 0; opacity: 0.8;">
            <div class="credit-key">${item.title}</div>
            <ul class="credit-list">
        `;
        item.features.forEach(feature => {
          html += `<li style="font-size: 0.8rem;">${feature}</li>`;
        });
        html += '</ul></div>';
      });
      html += '</div>';
    }
    
    document.getElementById('updates-viewer').innerHTML = html;
  }

  getUpdateTypeColor(type) {
    const colors = {
      'major': '#22c55e',
      'release': '#3b82f6',
      'new': '#ff6b35',
      'deprecated': '#dc2626'
    };
    return colors[type] || '#6b7280';
  }

  generateVersionDetails(update) {
    const typeColor = this.getUpdateTypeColor(update.type);
    let html = `
      <div style="border-bottom: 2px solid ${typeColor}; padding-bottom: 1.5rem; margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="color: ${typeColor}; margin: 0; font-size: 2rem;">v${update.version}</h3>
          <span style="background: ${typeColor}; padding: 0.5rem 1.25rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; color: white;">
            ${update.type.toUpperCase()}
          </span>
        </div>
        <p style="color: var(--text-secondary); margin: 0.5rem 0; font-size: 0.9rem;">📅 ${update.date}</p>
        <h4 style="color: var(--text-primary); margin: 1rem 0 0; font-size: 1.3rem;">${update.title}</h4>
      </div>
    `;
    
    if (update.features?.length) {
      html += '<div style="margin-bottom: 2rem;"><h5 style="color: var(--secondary); font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;"><span>✨</span> Características</h5><ul class="credit-list" style="display: grid; gap: 0.75rem;">';
      update.features.forEach(feature => {
        html += `<li style="font-size: 0.95rem; padding: 0.75rem; background: var(--bg-light); border-radius: 8px; border-left: 3px solid var(--secondary);">${feature}</li>`;
      });
      html += '</ul></div>';
    }
    
    if (update.fixes?.length) {
      html += '<div style="margin-bottom: 2rem;"><h5 style="color: #fbbf24; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;"><span>🔧</span> Correcciones</h5><ul class="credit-list" style="display: grid; gap: 0.75rem;">';
      update.fixes.forEach(fix => {
        html += `<li style="font-size: 0.95rem; padding: 0.75rem; background: var(--bg-light); border-radius: 8px; border-left: 3px solid #fbbf24; color: var(--text-primary);">${fix}</li>`;
      });
      html += '</ul></div>';
    }
    
    return html;
  }

  showVersionDetails(index) {
    if (!window.updatesData) return;
    
    document.querySelectorAll('.version-card').forEach(card => card.classList.remove('active'));
    const card = document.querySelector(`.version-card[data-index="${index}"]`);
    if (card) card.classList.add('active');
    
    const update = window.updatesData.updates[index];
    const detailsContainer = document.getElementById('version-details');
    if (detailsContainer) {
      detailsContainer.innerHTML = this.generateVersionDetails(update);
    }
  }

  updateActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link:not(#theme-toggle)');

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        const id = section.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  checkScrollToBottom() {
    if (window.gameData && !window.gameData.hasScrolledToBottom && 
        (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      window.gameData.hasScrolledToBottom = true;
      if (window.addPoints) window.addPoints(5);
      if (window.checkAchievement) window.checkAchievement('scroll-master');
      if (window.updateChallenge) window.updateChallenge('scroll-bottom');
      if (window.saveGameData) window.saveGameData();
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
  });
} else {
  window.uiManager = new UIManager();
}
