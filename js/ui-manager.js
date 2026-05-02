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
    const dev = credits.el_wey_que_hizo_esto;
    const tech = credits.creditos?.tecnologias;
    const insp = credits.creditos?.inspiracion;

    const allTech = [
      ...(tech?.frontend || []),
      ...(tech?.frameworks || []),
      ...(tech?.apis || []),
      tech?.hosting,
      tech?.pwa
    ].filter(Boolean);

    const html = `
      <!-- Perfil centrado -->
      <div class="cr-profile">
        <div class="cr-profile-glow"></div>
        <img src="${dev.foto_perfil}" alt="${dev.quien_soy}" class="cr-profile-avatar">
        <span class="cr-profile-badge">v${updates.version} • ${credits.estado}</span>
        <h2 class="cr-profile-name">${dev.quien_soy}</h2>
        <p class="cr-profile-bio">${dev.descripcion_personal}</p>
        <div class="cr-profile-socials">
          ${dev.redes?.github  ? `<a href="${dev.redes.github}"  target="_blank" class="cr-social"><i class="bi bi-github"></i><span>GitHub</span></a>` : ''}
          ${dev.redes?.twitter ? `<a href="${dev.redes.twitter}" target="_blank" class="cr-social"><i class="bi bi-twitter-x"></i><span>Twitter</span></a>` : ''}
          ${dev.redes?.tiktok  ? `<a href="${dev.redes.tiktok}"  target="_blank" class="cr-social"><i class="bi bi-tiktok"></i><span>TikTok</span></a>` : ''}
        </div>
      </div>

      <!-- Línea de tiempo / secciones verticales -->
      <div class="cr-timeline">

        <!-- Inspiración -->
        <div class="cr-tl-item">
          <div class="cr-tl-dot">💡</div>
          <div class="cr-tl-content">
            <h4 class="cr-tl-title">Inspiración</h4>
            <div class="cr-insp-card">
              <img src="${insp?.imagen}" alt="${insp?.autor}" class="cr-insp-img">
              <div class="cr-insp-body">
                <strong class="cr-insp-name">${insp?.autor}</strong>
                <p class="cr-insp-text">${insp?.texto}</p>
                <a href="${insp?.url}" target="_blank" class="cr-insp-link">Ver sitio →</a>
              </div>
            </div>
          </div>
        </div>

        <!-- OCs -->
        <div class="cr-tl-item">
          <div class="cr-tl-dot">🎨</div>
          <div class="cr-tl-content">
            <h4 class="cr-tl-title">Mis Personajes Originales</h4>
            <div class="cr-oc-tabs">
              <button onclick="window.uiManager.loadOC('ankush')" class="cr-oc-tab active" id="tab-ankush">Ankush</button>
              <button onclick="window.uiManager.loadOC('anna')"   class="cr-oc-tab"        id="tab-anna">Anna Moonred</button>
            </div>
            <div id="oc-container" class="cr-oc-frame"></div>
          </div>
        </div>

        <!-- Planes futuros -->
        <div class="cr-tl-item">
          <div class="cr-tl-dot">🚀</div>
          <div class="cr-tl-content">
            <h4 class="cr-tl-title">Planes futuros</h4>
            <div class="cr-plans">
              ${(credits.planes_a_futuro || []).map(p => `<div class="cr-plan-item">${p}</div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Bugs & Legal -->
        <div class="cr-tl-item">
          <div class="cr-tl-dot">⚖️</div>
          <div class="cr-tl-content">
            <h4 class="cr-tl-title">Estado & Legal</h4>
            <div class="cr-legal-row">
              <span>Bugs graves</span>
              <span class="cr-legal-ok">✅ ${credits.bugs?.bugs_graves}</span>
            </div>
            <div class="cr-legal-row">
              <span>Filosofía</span>
              <em>${credits.bugs?.features_no_planeadas}</em>
            </div>
            <div class="cr-legal-row">
              <span>Licencia</span>
              <span class="cr-license">${credits.legal_stuff?.licencia}</span>
            </div>
            <p class="cr-disclaimer">${credits.legal_stuff?.disclaimer}</p>
          </div>
        </div>

      </div>

      <!-- Mensaje final -->
      <div class="cr-farewell">
        <p class="cr-farewell-text">${credits.mensaje_final}</p>
      </div>
    `;

    document.getElementById('json-viewer').innerHTML = html;
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
    
    // Actualizar tab activo
    document.querySelectorAll('.cr-oc-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.getElementById('tab-' + character);
    if (activeTab) activeTab.classList.add('active');

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
      <div class="updates-header" style="text-align: center; margin-bottom: 2.5rem;">
        <div class="version-badge-large" style="display: inline-flex; align-items: center; gap: 1rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); padding: 1rem 2rem; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
          <span style="font-size: 2.5rem;">🚀</span>
          <div style="text-align: left;">
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.8); font-weight: 500;">Versión Actual</div>
            <div style="font-size: 1.8rem; color: white; font-weight: 700; line-height: 1;">v${data.version}</div>
          </div>
        </div>
        <p style="color: var(--text-secondary); margin-top: 1rem; font-size: 0.9rem;">
          Última actualización: ${data.lastUpdate}
        </p>
      </div>
      
      <div class="updates-layout" style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; align-items: start;">
        <!-- Sidebar de versiones -->
        <div id="versions-list" class="versions-sidebar" style="background: var(--bg-dark); border-radius: 16px; padding: 1.5rem; max-height: 650px; overflow-y: auto; position: sticky; top: 100px; border: 1px solid rgba(var(--primary-rgb, 255,107,53), 0.15);">
          <h5 style="color: var(--primary); margin-bottom: 1.5rem; font-size: 1.1rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <span>📝</span> Historial de Versiones
          </h5>
    `;
    
    data.updates.forEach((update, index) => {
      const typeColor = this.getUpdateTypeColor(update.type);
      const typeIcon = this.getUpdateTypeIcon(update.type);
      const isDeprecated = update.status === 'discarded';
      html += `
        <div class="version-card ${index === 0 ? 'active' : ''}" 
             onclick="window.uiManager.showVersionDetails(${index})" 
             data-index="${index}" 
             style="padding: 1rem; margin-bottom: 0.75rem; border-radius: 12px; cursor: pointer; border: 2px solid ${index === 0 ? typeColor : 'transparent'}; background: ${index === 0 ? 'rgba(var(--primary-rgb, 255,107,53), 0.08)' : 'var(--bg-light)'}; transition: all 0.3s; ${isDeprecated ? 'opacity: 0.6;' : ''} position: relative; overflow: hidden;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${typeColor};"></div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding-left: 0.5rem;">
            <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-primary);">v${update.version}</div>
            <span style="background: ${typeColor}; padding: 0.25rem 0.6rem; border-radius: 12px; color: white; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; gap: 0.3rem;">
              ${typeIcon} ${update.type.toUpperCase()}
            </span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); padding-left: 0.5rem;">📅 ${update.date}</div>
          ${index === 0 ? '<div style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 1.2rem;">✨</div>' : ''}
        </div>
      `;
    });
    
    html += `
        </div>
        
        <!-- Panel de detalles -->
        <div id="version-details" class="version-details-panel" style="background: var(--bg-dark); border-radius: 16px; padding: 2.5rem; min-height: 500px; border: 1px solid rgba(var(--primary-rgb, 255,107,53), 0.15); box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
    `;
    
    const firstUpdate = data.updates[0];
    html += this.generateVersionDetails(firstUpdate);
    
    html += '</div></div>';
    
    // Roadmap section
    if (data.roadmap?.length) {
      html += `
        <div class="roadmap-section" style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid rgba(var(--primary-rgb, 255,107,53), 0.2);">
          <h4 style="color: var(--primary); margin-bottom: 1.5rem; font-size: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 2rem;">🗺️</span> Próximas Funciones
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
      `;
      data.roadmap.forEach(item => {
        html += `
          <div class="roadmap-card" style="background: var(--bg-dark); border-radius: 12px; padding: 1.5rem; border: 1px solid rgba(var(--primary-rgb, 255,107,53), 0.15); transition: all 0.3s;">
            <h5 style="color: var(--secondary); margin-bottom: 1rem; font-size: 1.1rem;">${item.title}</h5>
            <ul class="credit-list" style="margin: 0; padding-left: 1.2rem;">
        `;
        item.features.forEach(feature => {
          html += `<li style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${feature}</li>`;
        });
        html += '</ul></div>';
      });
      html += '</div></div>';
    }
    
    document.getElementById('updates-viewer').innerHTML = html;
    
    // Agregar estilos hover dinámicos
    this.addUpdateStyles();
  }

  addUpdateStyles() {
    if (document.getElementById('updates-dynamic-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'updates-dynamic-styles';
    style.textContent = `
      .version-card:hover {
        transform: translateX(4px);
        border-color: var(--primary) !important;
        box-shadow: 0 4px 12px rgba(var(--primary-rgb, 255,107,53), 0.2);
      }
      
      .version-card.active {
        box-shadow: 0 4px 16px rgba(var(--primary-rgb, 255,107,53), 0.3);
      }
      
      .roadmap-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        border-color: var(--primary);
      }
      
      .versions-sidebar::-webkit-scrollbar {
        width: 8px;
      }
      
      .versions-sidebar::-webkit-scrollbar-track {
        background: var(--bg-light);
        border-radius: 4px;
      }
      
      .versions-sidebar::-webkit-scrollbar-thumb {
        background: var(--primary);
        border-radius: 4px;
      }
      
      .versions-sidebar::-webkit-scrollbar-thumb:hover {
        background: var(--secondary);
      }
      
      @media (max-width: 991px) {
        .updates-layout {
          grid-template-columns: 1fr !important;
        }
        
        .versions-sidebar {
          position: static !important;
          max-height: 400px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  getUpdateTypeIcon(type) {
    const icons = {
      'major': '🚀',
      'minor': '✨',
      'release': '🎉',
      'new': '🆕',
      'hotfix': '🔥',
      'deprecated': '⚠️'
    };
    return icons[type] || '📦';
  }

  getUpdateTypeColor(type) {
    const colors = {
      'major': '#22c55e',
      'minor': '#3b82f6',
      'release': '#8b5cf6',
      'new': '#ff6b35',
      'hotfix': '#ef4444',
      'deprecated': '#dc2626'
    };
    return colors[type] || '#6b7280';
  }

  generateVersionDetails(update) {
    const typeColor = this.getUpdateTypeColor(update.type);
    const typeIcon = this.getUpdateTypeIcon(update.type);
    
    let html = `
      <div class="version-header" style="border-bottom: 3px solid ${typeColor}; padding-bottom: 1.5rem; margin-bottom: 2rem; position: relative;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <h3 style="color: ${typeColor}; margin: 0; font-size: 2.5rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            ${typeIcon} v${update.version}
          </h3>
          <span style="background: ${typeColor}; padding: 0.6rem 1.5rem; border-radius: 24px; font-size: 0.85rem; font-weight: 700; color: white; box-shadow: 0 4px 12px ${typeColor}40;">
            ${update.type.toUpperCase()}
          </span>
        </div>
        <p style="color: var(--text-secondary); margin: 0.5rem 0; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>📅</span> ${update.date}
        </p>
        <h4 style="color: var(--text-primary); margin: 1rem 0 0; font-size: 1.5rem; font-weight: 600;">${update.title}</h4>
      </div>
    `;
    
    // Features
    if (update.features?.length) {
      html += `
        <div class="update-section" style="margin-bottom: 2.5rem;">
          <h5 style="color: var(--secondary); font-size: 1.2rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; font-weight: 700;">
            <span style="font-size: 1.5rem;">✨</span> Características Nuevas
          </h5>
          <ul class="features-list" style="list-style: none; padding: 0; display: grid; gap: 0.75rem;">
      `;
      update.features.forEach(feature => {
        html += `
          <li style="font-size: 0.95rem; padding: 1rem 1.25rem; background: linear-gradient(135deg, var(--bg-light), rgba(var(--secondary-rgb, 247,147,30), 0.05)); border-radius: 10px; border-left: 4px solid var(--secondary); transition: all 0.3s; position: relative; overflow: hidden;" 
              onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" 
              onmouseout="this.style.transform=''; this.style.boxShadow=''">
            ${feature}
          </li>
        `;
      });
      html += '</ul></div>';
    }
    
    // Qué significa (nueva sección)
    if (update.que_significa?.length) {
      html += `
        <div class="update-section" style="margin-bottom: 2.5rem;">
          <h5 style="color: #10b981; font-size: 1.2rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; font-weight: 700;">
            <span style="font-size: 1.5rem;">💡</span> ¿Qué Significa Esto?
          </h5>
          <ul class="explanation-list" style="list-style: none; padding: 0; display: grid; gap: 0.75rem;">
      `;
      update.que_significa.forEach(explanation => {
        html += `
          <li style="font-size: 0.95rem; padding: 1rem 1.25rem; background: linear-gradient(135deg, var(--bg-light), rgba(16, 185, 129, 0.05)); border-radius: 10px; border-left: 4px solid #10b981; color: var(--text-primary);">
            ${explanation}
          </li>
        `;
      });
      html += '</ul></div>';
    }
    
    // Fixes
    if (update.fixes?.length) {
      html += `
        <div class="update-section" style="margin-bottom: 2.5rem;">
          <h5 style="color: #fbbf24; font-size: 1.2rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; font-weight: 700;">
            <span style="font-size: 1.5rem;">🔧</span> Correcciones
          </h5>
          <ul class="fixes-list" style="list-style: none; padding: 0; display: grid; gap: 0.75rem;">
      `;
      update.fixes.forEach(fix => {
        html += `
          <li style="font-size: 0.95rem; padding: 1rem 1.25rem; background: linear-gradient(135deg, var(--bg-light), rgba(251, 191, 36, 0.05)); border-radius: 10px; border-left: 4px solid #fbbf24; color: var(--text-primary);">
            ${fix}
          </li>
        `;
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
