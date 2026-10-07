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
    
    // El wey que hizo esto
    if (data.el_wey_que_hizo_esto) {
      html += `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-body">
            <h3 style="color: var(--primary); margin-bottom: 1rem;">👨‍💻 ${data.el_wey_que_hizo_esto.nombre}</h3>
            <p>${data.el_wey_que_hizo_esto.descripcion}</p>
            ${data.el_wey_que_hizo_esto.links ? `
              <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
                ${Object.entries(data.el_wey_que_hizo_esto.links).map(([name, url]) => `
                  <a href="${url}" target="_blank" style="color: var(--primary); text-decoration: none;">
                    ${name} →
                  </a>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }
    
    // Créditos
    if (data.creditos) {
      Object.entries(data.creditos).forEach(([category, items]) => {
        const categoryNames = {
          'arte': '🎨 Arte',
          'musica': '🎵 Música',
          'testing': '🧪 Testing',
          'ideas': '💡 Ideas',
          'soporte': '🤝 Soporte'
        };
        
        html += `
          <div class="card" style="margin-bottom: 2rem;">
            <div class="card-body">
              <h3 style="color: var(--primary); margin-bottom: 1rem;">${categoryNames[category] || category}</h3>
              <div style="display: grid; gap: 1rem;">
                ${items.map(person => `
                  <div style="padding: 1rem; background: rgba(var(--primary-rgb), 0.1); border-left: 3px solid var(--primary); border-radius: 8px;">
                    <h4 style="color: var(--text); margin: 0 0 0.5rem 0;">${person.nombre}</h4>
                    ${person.rol ? `<p style="color: var(--text-secondary); margin: 0;">${person.rol}</p>` : ''}
                    ${person.contribucion ? `<p style="color: var(--text-secondary); margin: 0.5rem 0 0 0;">${person.contribucion}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // Mensaje final
    if (data.mensaje_final) {
      html += `
        <div class="card">
          <div class="card-body" style="text-align: center;">
            <p style="font-size: 1.2rem; color: var(--primary);">${data.mensaje_final}</p>
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
