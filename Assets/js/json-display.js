// json-display.js - Visualizadores bonitos para Credits y Updates

export async function displayCredits(containerId) {
  try {
    const response = await fetch('Assets/json/credits.json');
    const data = await response.json();
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }
    
    let html = '';
    
    // Card del creador principal
    if (data.el_wey_que_hizo_esto) {
      const creator = data.el_wey_que_hizo_esto;
      html += `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-body">
            <h3 style="color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <i class="bi bi-code-slash"></i> Creador
            </h3>
            <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
              <img src="${creator.foto_perfil}" alt="${creator.quien_soy}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary);">
              <div style="flex: 1; min-width: 200px;">
                <h4 style="color: var(--text); margin: 0 0 0.5rem 0;">${creator.quien_soy}</h4>
                <p style="color: var(--text-secondary); margin: 0 0 1rem 0;">${creator.descripcion_personal}</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                  ${Object.entries(creator.redes).map(([red, url]) => `
                    <a href="${url}" target="_blank" style="color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
                      <i class="bi bi-${red === 'github' ? 'github' : red === 'twitter' ? 'twitter-x' : 'music-note'}"></i> ${red.charAt(0).toUpperCase() + red.slice(1)}
                    </a>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Card de inspiración
    if (data.creditos?.inspiracion) {
      const insp = data.creditos.inspiracion;
      html += `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-body">
            <h3 style="color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <i class="bi bi-lightbulb-fill"></i> Inspiración
            </h3>
            <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
              <img src="${insp.imagen}" alt="${insp.autor}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary);">
              <div style="flex: 1; min-width: 200px;">
                <h4 style="color: var(--text); margin: 0 0 0.5rem 0;">${insp.autor}</h4>
                <p style="color: var(--text-secondary); margin: 0 0 1rem 0;">${insp.texto}</p>
                <a href="${insp.url}" target="_blank" style="color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
                  <i class="bi bi-link-45deg"></i> Funky Atlas
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Card de tecnologías
    if (data.creditos?.tecnologias) {
      const tech = data.creditos.tecnologias;
      html += `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-body">
            <h3 style="color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <i class="bi bi-tools"></i> Tecnologías
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              ${tech.frontend ? `
                <div style="padding: 1rem; background: rgba(var(--primary-rgb), 0.1); border-left: 3px solid var(--primary); border-radius: 8px;">
                  <h4 style="color: var(--text); margin: 0 0 0.5rem 0;">Frontend</h4>
                  <ul style="margin: 0; padding-left: 1.25rem; color: var(--text-secondary);">
                    ${tech.frontend.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${tech.frameworks ? `
                <div style="padding: 1rem; background: rgba(var(--primary-rgb), 0.1); border-left: 3px solid var(--primary); border-radius: 8px;">
                  <h4 style="color: var(--text); margin: 0 0 0.5rem 0;">Frameworks</h4>
                  <ul style="margin: 0; padding-left: 1.25rem; color: var(--text-secondary);">
                    ${tech.frameworks.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${tech.apis ? `
                <div style="padding: 1rem; background: rgba(var(--primary-rgb), 0.1); border-left: 3px solid var(--primary); border-radius: 8px;">
                  <h4 style="color: var(--text); margin: 0 0 0.5rem 0;">APIs</h4>
                  <ul style="margin: 0; padding-left: 1.25rem; color: var(--text-secondary);">
                    ${tech.apis.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }
    
    // Card de mensaje final
    if (data.mensaje_final) {
      html += `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-body" style="text-align: center; padding: 2rem;">
            <i class="bi bi-emoji-smile" style="font-size: 2rem; color: var(--primary);"></i>
            <p style="margin-top: 1rem; color: var(--text);">${data.mensaje_final}</p>
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error cargando créditos:', error);
    document.getElementById(containerId).innerHTML = `
      <div class="card">
        <div class="card-body" style="text-align: center;">
          <i class="bi bi-exclamation-triangle" style="font-size: 2rem; color: var(--primary);"></i>
          <p style="margin-top: 1rem;">Error al cargar créditos</p>
        </div>
      </div>
    `;
  }
}

export async function displayUpdates(containerId) {
  try {
    const response = await fetch('Assets/json/updates.json');
    const data = await response.json();
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }
    
    let html = '';
    
    // Info de versión actual
    if (data.version || data.lastUpdate) {
      html += `
        <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--primary-rgb), 0.05));">
          <div class="card-body" style="text-align: center;">
            <h2 style="color: var(--primary); margin: 0 0 0.5rem 0;">Versión ${data.version}</h2>
            <p style="color: var(--text-secondary); margin: 0;">Última actualización: ${new Date(data.lastUpdate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      `;
    }
    
    // Updates (historial)
    if (data.updates && data.updates.length > 0) {
      const sortedUpdates = [...data.updates].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      sortedUpdates.forEach((update, index) => {
        const typeColors = {
          'major': 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          'minor': 'linear-gradient(135deg, #3b82f6, #06b6d4)',
          'patch': 'linear-gradient(135deg, #10b981, #059669)',
          'hotfix': 'linear-gradient(135deg, #f59e0b, #ef4444)'
        };
        
        html += `
          <div class="card" style="margin-bottom: 2rem;">
            <div class="card-body">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                  <h3 style="color: var(--primary); margin: 0;">${update.version}${update.title ? ` - ${update.title}` : ''}</h3>
                  <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.9rem;">
                    ${new Date(update.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span style="background: ${typeColors[update.type] || typeColors.patch}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;">
                  ${update.type}
                </span>
              </div>
              
              ${update.features && update.features.length > 0 ? `
                <h4 style="color: var(--primary); margin: 1.5rem 0 0.75rem 0;">✨ Novedades</h4>
                <ul style="list-style: none; padding: 0; display: grid; gap: 0.5rem;">
                  ${update.features.map(feature => `
                    <li style="padding: 0.75rem 1rem; background: rgba(var(--primary-rgb), 0.1); border-left: 3px solid var(--primary); border-radius: 8px;">
                      ${feature}
                    </li>
                  `).join('')}
                </ul>
              ` : ''}
              
              ${update.que_significa ? `
                <p style="margin-top: 1rem; padding: 1rem; background: rgba(var(--primary-rgb), 0.05); border-radius: 8px; font-style: italic;">
                  💡 ${update.que_significa}
                </p>
              ` : ''}
            </div>
          </div>
        `;
      });
    }
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error cargando updates:', error);
    document.getElementById(containerId).innerHTML = `
      <div class="card">
        <div class="card-body" style="text-align: center;">
          <i class="bi bi-exclamation-triangle" style="font-size: 2rem; color: var(--primary);"></i>
          <p style="margin-top: 1rem;">Error al cargar actualizaciones</p>
        </div>
      </div>
    `;
  }
}
