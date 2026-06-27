// Inicializar Firebase
let wikiDb;

if (typeof firebase !== 'undefined') {
  wikiDb = firebase.firestore();
}

let allCharacters = [];
let currentCharacter = null;

function setupEventListeners() {
  const searchBox = document.getElementById('search-box');
  const categoryFilter = document.getElementById('category-filter');
  const characterForm = document.getElementById('character-form');
  const tipoAporte = document.getElementById('tipo-aporte');
  const discordInput = document.querySelector('input[name="discord"]');
  
  if (searchBox) searchBox.addEventListener('input', filterCharacters);
  if (categoryFilter) categoryFilter.addEventListener('change', filterCharacters);
  if (characterForm) characterForm.addEventListener('submit', handleFormSubmit);
  
  if (tipoAporte) {
    tipoAporte.addEventListener('change', async (e) => {
      const container = document.getElementById('entrada-modificar-container');
      const passwordContainer = document.getElementById('password-container');
      
      if (e.target.value === 'actualizacion') {
        container.style.display = 'block';
        passwordContainer.style.display = 'none';
        await loadUserEntries();
      } else {
        container.style.display = 'none';
        passwordContainer.style.display = 'block';
      }
    });
  }
  
  if (discordInput) {
    discordInput.addEventListener('blur', loadUserEntries);
  }
  
  const avatarFile = document.querySelector('input[name="iconos"]');
  if (avatarFile) {
    avatarFile.addEventListener('change', previewIcons);
  }
}

// Cargar entradas del usuario
async function loadUserEntries() {
  const discordInput = document.querySelector('input[name="discord"]');
  const select = document.getElementById('entrada-modificar');
  
  if (!discordInput || !discordInput.value || !select) return;
  
  const deviceId = DeviceAuth.getDeviceId();
  
  try {
    const [approved, pending, rejected] = await Promise.all([
      wikiDb.collection('characters').where('discord', '==', discordInput.value).where('deviceId', '==', deviceId).get(),
      wikiDb.collection('pending_characters').where('discord', '==', discordInput.value).where('deviceId', '==', deviceId).get(),
      wikiDb.collection('rejected_characters').where('discord', '==', discordInput.value).where('deviceId', '==', deviceId).get()
    ]);
    
    const entries = [
      ...approved.docs.map(doc => ({ id: doc.id, ...doc.data(), status: 'approved' })),
      ...pending.docs.map(doc => ({ id: doc.id, ...doc.data(), status: 'pending' })),
      ...rejected.docs.map(doc => ({ id: doc.id, ...doc.data(), status: 'rejected' }))
    ].sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    if (entries.length === 0) {
      select.innerHTML = '<option value="">No tienes entradas en este dispositivo</option>';
      return;
    }
    
    select.innerHTML = '<option value="">Selecciona una entrada</option>' +
      entries.map(entry => {
        const icon = entry.status === 'approved' ? '✅' : entry.status === 'pending' ? '⏳' : '❌';
        const text = entry.status === 'approved' ? 'Aprobado' : entry.status === 'pending' ? 'Pendiente' : 'Rechazado';
        return `<option value="${entry.id}" data-status="${entry.status}">${icon} ${entry.nombre} (${text})</option>`;
      }).join('');
    
    select.addEventListener('change', async function(event) {
      const option = event.target.options[event.target.selectedIndex];
      if (option.getAttribute('data-status') === 'rejected') {
        const doc = await wikiDb.collection('rejected_characters').doc(event.target.value).get();
        if (doc.exists) {
          alert('❌ Esta entrada fue rechazada\n\nRazón: ' + (doc.data().rejectionReason || 'No especificada'));
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

function filterByCategory(category) {
  document.getElementById('category-filter').value = category;
  filterCharacters();
  showAllCharacters();
}

async function loadCharacters() {
  const grid = document.getElementById('characters-grid');
  grid.innerHTML = '<div class="loading">Cargando personajes</div>';
  
  try {
    const snapshot = await wikiDb.collection('characters')
      .where('tipo_entrada', '==', 'personaje')
      .get();
    allCharacters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenar por nombre en el cliente
    allCharacters.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    displayCharacters(allCharacters);
  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<p class="text-center">Error al cargar personajes</p>';
  }
}

function displayCharacters(characters) {
  const grid = document.getElementById('characters-grid');
  
  if (characters.length === 0) {
    grid.innerHTML = '<p class="text-center">No hay personajes aún</p>';
    return;
  }
  
  grid.innerHTML = characters.map(char => `
    <div onclick="showCharacterDetail('${char.id}')" style="position: relative; overflow: hidden; cursor: pointer; transition: all 0.3s ease; background: var(--bg-dark); border: 2px solid transparent; border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;" onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateX(10px)'; this.style.boxShadow='0 0 20px var(--primary)'" onmouseout="this.style.borderColor='transparent'; this.style.transform='translateX(0)'; this.style.boxShadow='none'">
      <div style="position: absolute; inset: 0; background: linear-gradient(90deg, var(--primary), transparent); opacity: 0; transition: opacity 0.3s ease;" onmouseover="this.style.opacity='0.1'"></div>
      <img src="${char.iconos?.[0] || 'https://via.placeholder.com/80'}" 
           alt="${char.nombre}" 
           style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; position: relative; z-index: 1;">
      <div style="flex: 1; position: relative; z-index: 1;">
        <h3 style="color: var(--primary); margin: 0; font-size: 1.5rem;">${char.nombre}</h3>
        <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.9rem;">${char.aliases?.split(',')[0] || 'Personaje'}</p>
      </div>
      <i class="bi bi-chevron-right" style="color: var(--primary); font-size: 1.5rem; position: relative; z-index: 1;"></i>
    </div>
  `).join('');
}

function filterCharacters() {
  const search = document.getElementById('search-box').value.toLowerCase();
  
  let filtered = allCharacters;
  
  if (search) {
    filtered = filtered.filter(char => 
      char.nombre.toLowerCase().includes(search) ||
      char.aliases?.toLowerCase().includes(search)
    );
  }
  
  displayCharacters(filtered);
}

async function showCharacterDetail(id) {
  const char = allCharacters.find(c => c.id === id);
  if (!char) return;
  
  currentCharacter = char;
  
  document.getElementById('characters-view').style.display = 'none';
  document.getElementById('submit-form').style.display = 'none';
  
  const detailView = document.getElementById('character-detail');
  detailView.style.display = 'block';
  detailView.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--primary);"><i class="bi bi-hourglass-split hourglass-loading" style="font-size: 3rem;"></i><p style="margin-top: 1rem;">Cargando personaje...</p></div>';
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  detailView.innerHTML = `
    <button class="btn btn-outline-light mb-3" onclick="showAllCharacters()">
      <i class="bi bi-arrow-left"></i> Volver
    </button>
    
    <div style="background: var(--bg-dark); border: 2px solid var(--primary); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1 style="color: var(--primary); margin: 0; font-size: 3rem; font-weight: bold;">${char.nombre}</h1>
      </div>
      
      <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
        <button class="tab-btn active" onclick="switchWikiTab(event, 'info')" style="background: none; border: none; color: var(--primary); font-size: 1.2rem; font-weight: bold; cursor: pointer; padding: 0.5rem 1rem; border-bottom: 3px solid var(--primary);">Informacion principal</button>
        <button class="tab-btn" onclick="switchWikiTab(event, 'galeria')" style="background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; font-weight: bold; cursor: pointer; padding: 0.5rem 1rem;">Galeria</button>
        <button class="tab-btn" onclick="switchWikiTab(event, 'opiniones')" style="background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; font-weight: bold; cursor: pointer; padding: 0.5rem 1rem;">Opiniones</button>
      </div>
      
      <div class="character-detail-grid" style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
        <div>
          <div class="tab-content" id="wiki-tab-info">
            ${char.descripcion_general ? `
              <div class="detail-section">
                <h3><i class="bi bi-file-text"></i> Descripción general</h3>
                <div class="detail-content">${char.descripcion_general}</div>
              </div>
            ` : ''}
            
            ${char.apariencia ? `
              <div class="detail-section">
                <h3><i class="bi bi-eye"></i> Apariencia</h3>
                <div class="detail-content">${char.apariencia}</div>
              </div>
            ` : ''}
            
            ${char.personalidad ? `
              <div class="detail-section">
                <h3><i class="bi bi-heart"></i> Personalidad</h3>
                <div class="detail-content">${char.personalidad}</div>
              </div>
            ` : ''}
            
            ${char.le_gusta || char.no_le_gusta ? `
              <div class="detail-grid">
                ${char.le_gusta ? `
                  <div class="detail-section">
                    <h3><i class="bi bi-hand-thumbs-up"></i> Le Gusta</h3>
                    <ul class="detail-list">${char.le_gusta.split(',').map(item => `<li>${item.trim()}</li>`).join('')}</ul>
                  </div>
                ` : ''}
                ${char.no_le_gusta ? `
                  <div class="detail-section">
                    <h3><i class="bi bi-hand-thumbs-down"></i> No Le Gusta</h3>
                    <ul class="detail-list">${char.no_le_gusta.split(',').map(item => `<li>${item.trim()}</li>`).join('')}</ul>
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            ${char.trivia ? `
              <div class="detail-section">
                <h3><i class="bi bi-lightbulb"></i> Trivia</h3>
                <ul class="detail-list">${char.trivia.split(',').map(item => `<li>${item.trim()}</li>`).join('')}</ul>
              </div>
            ` : ''}
          </div>
          
          <div class="tab-content" id="wiki-tab-galeria" style="display: none;">
            ${char.galeria?.length ? `
              <div class="detail-section">
                <h3><i class="bi bi-images"></i> Galería</h3>
                <div class="gallery-grid">
                  ${char.galeria.map(img => `
                    <div class="gallery-item" onclick="openImageModal('${img}')">
                      <img src="${img}" alt="Galería">
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : '<p class="detail-content">No hay imágenes en la galería</p>'}
            
            ${char.fanarts?.length ? `
              <div class="detail-section">
                <h3><i class="bi bi-palette"></i> Fanarts</h3>
                <div class="gallery-grid">
                  ${char.fanarts.map(img => `
                    <div class="gallery-item" onclick="openImageModal('${img}')">
                      <img src="${img}" alt="Fanart">
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="tab-content" id="wiki-tab-opiniones" style="display: none;">
            ${char.opiniones_parsed?.length ? `
              ${char.opiniones_parsed.map(op => `
                <div class="opinion-card">
                  <h4>${op.nombre}</h4>
                  <p>"${op.corta}"</p>
                  ${op.extendida.map(texto => `<div class="detail-content" style="margin-top: 0.5rem;">${texto}</div>`).join('')}
                </div>
              `).join('')}
            ` : '<p class="detail-content">No hay opiniones</p>'}
          </div>
        </div>
        
        <div>
          <div style="background: var(--bg-light); border: 2px solid var(--primary); border-radius: 12px; padding: 1.5rem;">
            <h2 style="color: var(--primary); margin-bottom: 1rem; text-align: center;">${char.nombre}</h2>
            <img src="${char.renders?.[0] || char.iconos?.[0]}" style="max-width: 100%; border-radius: 8px; margin-bottom: 1.5rem; display: block;">
            
            ${char.aliases ? createWikiAccordion('Aliases', char.aliases) : ''}
            ${char.genero ? createWikiAccordion('Género', char.genero) : ''}
            ${char.pronombres ? createWikiAccordion('Pronombres', char.pronombres) : ''}
            ${char.orientacion ? createWikiAccordion('Orientacion', char.orientacion) : ''}
            ${char.relaciones ? createWikiAccordion('Relaciones', char.relaciones) : ''}
            ${char.afiliaciones ? createWikiAccordion('Afiliación', char.afiliaciones) : ''}
            ${char.ocupacion ? createWikiAccordion('Ocupación', char.ocupacion) : ''}
            ${char.edad || char.fecha_nacimiento ? createWikiAccordion('Información biográfica', `${char.edad ? `Edad: ${char.edad}<br>` : ''}${char.fecha_nacimiento ? `Nacimiento: ${char.fecha_nacimiento}` : ''}`) : ''}
            ${char.especie || char.altura || char.ojos || char.cabello ? createWikiAccordion('Descripción física', `${char.especie ? `Especie: ${char.especie}<br>` : ''}${char.altura ? `Altura: ${char.altura}m<br>` : ''}${char.ojos ? `Ojos: ${char.ojos}<br>` : ''}${char.cabello ? `Cabello: ${char.cabello}` : ''}`) : ''}
            ${char.apariciones ? createWikiAccordion('Apariciones', char.apariciones) : ''}
            ${char.voz ? createWikiAccordion('Voz', char.voz) : ''}
            ${char.iconos?.length ? createWikiAccordion('Iconos', char.iconos.map(url => `<img src="${url}" style="width: 50px; height: 50px; margin: 5px; border-radius: 4px;">`).join('')) : ''}
          </div>
        </div>
      </div>
      
      <style>
        @media (min-width: 992px) {
          .character-detail-grid { grid-template-columns: 1fr 400px !important; }
        }
      </style>
    </div>
  `;
  
  window.scrollTo(0, 0);
}

function createWikiAccordion(title, content) {
  const id = 'wiki-acc-' + title.replace(/\s+/g, '-').toLowerCase();
  return `
    <div style="margin-bottom: 0.5rem; overflow: hidden; border-radius: 8px; background: linear-gradient(90deg, rgba(var(--primary-rgb, 138,43,226),0.05), transparent);">
      <button onclick="toggleWikiAccordion('${id}')" style="width: 100%; background: rgba(var(--primary-rgb, 138,43,226),0.1); border: none; color: var(--primary); font-size: 1rem; font-weight: bold; padding: 1rem 1.5rem; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; border-left: 3px solid transparent;" onmouseover="this.style.borderLeft='3px solid var(--primary)'; this.style.background='rgba(var(--primary-rgb, 138,43,226),0.15)'" onmouseout="this.style.borderLeft='3px solid transparent'; this.style.background='rgba(var(--primary-rgb, 138,43,226),0.1)'">
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="bi bi-circle-fill" style="font-size: 0.4rem;"></i>
          ${title}
        </span>
        <i class="bi bi-chevron-down" id="${id}-icon" style="transition: transform 0.3s ease;"></i>
      </button>
      <div id="${id}" style="display: none; padding: 1rem 1.5rem; color: var(--text-color); line-height: 1.8; background: rgba(0,0,0,0.2); border-left: 3px solid var(--primary);">
        ${content}
      </div>
    </div>
  `;
}

function toggleWikiAccordion(id) {
  const content = document.getElementById(id);
  const icon = document.getElementById(id + '-icon');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  } else {
    content.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  }
}

function switchWikiTab(event, tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.style.color = 'var(--text-secondary)';
    btn.style.borderBottom = 'none';
    btn.classList.remove('active');
  });
  
  document.getElementById('wiki-tab-' + tabName).style.display = 'block';
  event.target.style.color = 'var(--primary)';
  event.target.style.borderBottom = '3px solid var(--primary)';
  event.target.classList.add('active');
}

function showAllCharacters() {
  document.getElementById('characters-view').style.display = 'block';
  document.getElementById('character-detail').style.display = 'none';
  document.getElementById('submit-form').style.display = 'none';
  window.scrollTo(0, 0);
}

function showSubmitForm() {
  document.getElementById('characters-view').style.display = 'none';
  document.getElementById('character-detail').style.display = 'none';
  document.getElementById('submit-form').style.display = 'block';
  
  // Escanear dispositivo y mostrar mensaje
  const deviceId = DeviceAuth.getDeviceId();
  const passwordContainer = document.getElementById('password-container');
  
  if (passwordContainer) {
    passwordContainer.style.display = 'block';
    passwordContainer.innerHTML = `
      <div class="alert" style="background: rgba(139, 92, 246, 0.1); border: 2px solid var(--wiki-primary); color: var(--wiki-text); border-radius: 12px; padding: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <i class="bi bi-shield-check" style="font-size: 2.5rem; color: var(--wiki-primary);"></i>
          <div>
            <h5 style="color: var(--wiki-primary); margin: 0 0 0.5rem 0;">🔐 Dispositivo Confiable Detectado</h5>
            <p style="margin: 0; font-size: 0.9rem;">Tu dispositivo ha sido escaneado y registrado automáticamente</p>
          </div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <p style="margin: 0; font-size: 0.85rem; color: var(--wiki-text-dim);"><strong>ID del Dispositivo:</strong></p>
            <button type="button" onclick="toggleDeviceId()" style="background: rgba(139, 92, 246, 0.2); border: 1px solid var(--wiki-primary); color: var(--wiki-primary); padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(139, 92, 246, 0.3)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.2)'">
              <i class="bi bi-eye" id="device-id-icon"></i> <span id="device-id-text">Mostrar</span>
            </button>
          </div>
          <code id="device-id-code" style="background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 4px; display: block; font-size: 0.75rem; word-break: break-all; color: var(--wiki-primary); filter: blur(8px); transition: filter 0.3s ease; user-select: none;">${deviceId}</code>
        </div>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.3);">
          <p style="margin: 0; font-size: 0.85rem;"><i class="bi bi-info-circle"></i> Solo podrás editar tus entradas desde este dispositivo</p>
        </div>
      </div>
    `;
  }
  
  if (typeof initFormWizard === 'function') initFormWizard();
  if (typeof startAutosave === 'function') startAutosave();
  window.scrollTo(0, 0);
}

function toggleDeviceId() {
  const code = document.getElementById('device-id-code');
  const icon = document.getElementById('device-id-icon');
  const text = document.getElementById('device-id-text');
  
  if (code.style.filter === 'blur(8px)' || code.style.filter === '') {
    code.style.filter = 'blur(0px)';
    code.style.userSelect = 'text';
    icon.className = 'bi bi-eye-slash';
    text.textContent = 'Ocultar';
  } else {
    code.style.filter = 'blur(8px)';
    code.style.userSelect = 'none';
    icon.className = 'bi bi-eye';
    text.textContent = 'Mostrar';
  }
}

function showRecoveryCodeModal(code) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 10000;';
  modal.innerHTML = `
    <div style="background: var(--wiki-bg-card); border: 3px solid var(--wiki-primary); border-radius: 20px; padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(139, 92, 246, 0.5);">
      <div style="text-align: center; margin-bottom: 2rem;">
        <i class="bi bi-shield-check" style="font-size: 4rem; color: var(--wiki-primary);"></i>
        <h3 style="color: var(--wiki-primary); margin: 1rem 0 0.5rem 0;">✅ ¡Entrada Enviada!</h3>
        <p style="color: var(--wiki-text-dim); margin: 0;">Espera aprobación</p>
      </div>
      
      <div style="background: rgba(139, 92, 246, 0.1); border: 2px solid var(--wiki-primary); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <h4 style="color: var(--wiki-secondary); margin: 0 0 1rem 0; font-size: 1.1rem;">🔑 Código de Recuperación</h4>
        <p style="color: var(--wiki-text-dim); font-size: 0.9rem; margin-bottom: 1rem;">Guarda este código para transferir tu entrada a otro dispositivo:</p>
        <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; text-align: center; margin-bottom: 1rem;">
          <code style="color: var(--wiki-primary); font-size: 1.2rem; font-weight: bold; letter-spacing: 2px; word-break: break-all;">${code}</code>
        </div>
        <button onclick="copyRecoveryCode('${code}')" style="width: 100%; background: var(--wiki-primary); border: none; color: white; padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(139, 92, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          <i class="bi bi-clipboard"></i> Copiar Código
        </button>
      </div>
      
      <div style="background: rgba(236, 72, 153, 0.1); border-left: 3px solid var(--wiki-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <p style="margin: 0; font-size: 0.85rem; color: var(--wiki-text);"><strong>⚠️ Importante:</strong></p>
        <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; font-size: 0.85rem; color: var(--wiki-text-dim);">
          <li>Guarda este código en un lugar seguro</li>
          <li>Solo se muestra una vez</li>
          <li>Necesario si cambias de dispositivo</li>
        </ul>
      </div>
      
      <button onclick="closeRecoveryModal()" style="width: 100%; background: transparent; border: 2px solid var(--wiki-primary); color: var(--wiki-primary); padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='var(--wiki-primary)'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='var(--wiki-primary)'">
        Entendido
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.id = 'recovery-modal';
}

function copyRecoveryCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-circle"></i> ¡Copiado!';
    btn.style.background = '#10b981';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = 'var(--wiki-primary)';
    }, 2000);
  });
}

function closeRecoveryModal() {
  const modal = document.getElementById('recovery-modal');
  if (modal) modal.remove();
  showAllCharacters();
}

function showRecoveryTransferModal() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 10000;';
  modal.innerHTML = `
    <div style="background: var(--wiki-bg-card); border: 3px solid var(--wiki-primary); border-radius: 20px; padding: 2rem; max-width: 500px; width: 90%;">
      <h3 style="color: var(--wiki-primary); margin: 0 0 1rem 0; text-align: center;">🔑 Transferir Entrada</h3>
      <p style="color: var(--wiki-text-dim); text-align: center; margin-bottom: 2rem;">Ingresa tu código de recuperación para acceder a tu entrada desde este dispositivo</p>
      
      <div style="margin-bottom: 1.5rem;">
        <label style="color: var(--wiki-primary); font-weight: 600; margin-bottom: 0.5rem; display: block;">Código de Recuperación</label>
        <input type="text" id="recovery-code-input" placeholder="XXXX-XXXX-XXXX-XXXX" style="width: 100%; padding: 0.75rem; background: var(--wiki-bg-dark); border: 2px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: var(--wiki-text); font-size: 1rem; text-transform: uppercase; letter-spacing: 2px;" maxlength="19">
      </div>
      
      <div style="display: flex; gap: 1rem;">
        <button onclick="closeTransferModal()" style="flex: 1; background: transparent; border: 2px solid var(--wiki-primary); color: var(--wiki-primary); padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
          Cancelar
        </button>
        <button onclick="processRecoveryCode()" style="flex: 1; background: var(--wiki-primary); border: none; color: white; padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
          Transferir
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.id = 'transfer-modal';
}

function closeTransferModal() {
  const modal = document.getElementById('transfer-modal');
  if (modal) modal.remove();
}

async function processRecoveryCode() {
  const input = document.getElementById('recovery-code-input');
  const code = input.value.trim().toUpperCase();
  
  if (!code) {
    alert('❌ Ingresa un código válido');
    return;
  }
  
  try {
    // Buscar entrada con este código en Firebase
    const snapshot = await wikiDb.collection('characters').where('recoveryCode', '==', code).get();
    
    if (snapshot.empty) {
      const pendingSnapshot = await wikiDb.collection('pending_characters').where('recoveryCode', '==', code).get();
      if (pendingSnapshot.empty) {
        alert('❌ Código inválido o entrada no encontrada');
        return;
      }
    }
    
    const newDeviceId = DeviceAuth.getDeviceId();
    const doc = snapshot.empty ? (await wikiDb.collection('pending_characters').where('recoveryCode', '==', code).get()).docs[0] : snapshot.docs[0];
    const collection = snapshot.empty ? 'pending_characters' : 'characters';
    
    // Actualizar deviceId en Firebase
    await wikiDb.collection(collection).doc(doc.id).update({
      deviceId: newDeviceId
    });
    
    // Agregar al dispositivo local
    DeviceAuth.addEntry(doc.id);
    DeviceAuth.saveRecoveryCode(doc.id, code);
    
    closeTransferModal();
    alert('✅ ¡Entrada transferida exitosamente!\n\nAhora puedes editarla desde este dispositivo.');
    
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al procesar el código');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const tipoAporte = formData.get('tipo_aporte');
  const deviceId = DeviceAuth.getDeviceId();
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Procesando...';
  
  try {
    // Si es actualización, verificar dispositivo
    if (tipoAporte === 'actualizacion') {
      const entryId = formData.get('entrada_modificar');
      if (!entryId) {
        alert('❌ Selecciona una entrada para actualizar');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send"></i> Enviar Entrada';
        return;
      }
      
      let entryDoc = await wikiDb.collection('characters').doc(entryId).get();
      let collection = 'characters';
      
      if (!entryDoc.exists) {
        entryDoc = await wikiDb.collection('pending_characters').doc(entryId).get();
        collection = 'pending_characters';
      }
      
      if (!entryDoc.exists) {
        alert('❌ Entrada no encontrada');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send"></i> Enviar Entrada';
        return;
      }
      
      const entryData = entryDoc.data();
      if (entryData.deviceId !== deviceId) {
        alert('❌ No puedes editar esta entrada desde este dispositivo');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send"></i> Enviar Entrada';
        return;
      }
    }
    
    const characterData = {};
    
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) continue;
      if (value) characterData[key] = value;
    }
    
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Subiendo imágenes...';
    
    const iconos = await uploadFiles(formData.getAll('iconos'), 'iconos');
    const renders = await uploadFiles(formData.getAll('render'), 'renders');
    const galeria = await uploadFiles(formData.getAll('galeria'), 'galeria');
    const fanarts = await uploadFiles(formData.getAll('fanarts'), 'fanarts');
    
    characterData.iconos = iconos;
    characterData.renders = renders;
    characterData.galeria = galeria;
    characterData.fanarts = fanarts;
    characterData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    characterData.deviceId = deviceId;
    
    if (characterData.opiniones) {
      characterData.opiniones_parsed = parseOpiniones(characterData.opiniones);
    }
    
    if (tipoAporte === 'adicion') {
      characterData.status = 'pending';
      const docRef = await wikiDb.collection('pending_characters').add(characterData);
      DeviceAuth.addEntry(docRef.id);
      
      // Generar código de recuperación
      const recoveryCode = DeviceAuth.generateRecoveryCode();
      DeviceAuth.saveRecoveryCode(docRef.id, recoveryCode);
      
      // Guardar código en Firebase
      await wikiDb.collection('pending_characters').doc(docRef.id).update({
        recoveryCode: recoveryCode
      });
      
      // Mostrar modal con código
      showRecoveryCodeModal(recoveryCode);
    } else {
      characterData.status = 'pending';
      await wikiDb.collection('pending_characters').add(characterData);
      alert('✅ ¡Actualización enviada! Espera aprobación.');
    }
    
    if (typeof clearFormProgress === 'function') clearFormProgress();
    form.reset();
    showAllCharacters();
    
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-send"></i> Enviar Entrada';
  }
}

async function uploadFiles(files, folder) {
  const urls = [];
  const cloudName = 'dkci24erg';
  const uploadPreset = 'fenixlab_wiki';
  
  for (let file of files) {
    if (!file || !file.size) continue;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      urls.push(data.secure_url);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }
  
  return urls;
}

function parseOpiniones(opinionesText) {
  const bloques = opinionesText.split('---').filter(b => b.trim());
  const opiniones = [];
  
  for (let bloque of bloques) {
    const lineas = bloque.split('\n').filter(l => l.trim());
    if (lineas.length >= 3) {
      opiniones.push({
        nombre: lineas[0].trim(),
        corta: lineas[1].trim(),
        extendida: lineas.slice(2).map(l => l.trim()).filter(l => l)
      });
    }
  }
  
  return opiniones;
}

function previewIcons(e) {
  const files = e.target.files;
  if (files.length > 0) {
    console.log(`${files.length} iconos seleccionados`);
  }
}

function openImageModal(imgUrl) {
  const modal = document.createElement('div');
  modal.id = 'image-modal';
  modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; z-index: 9999; cursor: pointer; transition: background 0.3s ease;';
  modal.innerHTML = `
    <button onclick="closeImageModal()" style="position: absolute; top: 20px; right: 20px; background: var(--primary); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; z-index: 10000; opacity: 0; transform: rotate(90deg); transition: all 0.3s ease 0.2s;">&times;</button>
    <img src="${imgUrl}" style="max-width: 90%; max-height: 90%; border-radius: 8px; cursor: default; opacity: 0; transform: scale(0.8); transition: all 0.3s ease;" onclick="event.stopPropagation()">
  `;
  modal.onclick = closeImageModal;
  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.style.background = 'rgba(0,0,0,0.9)';
    modal.querySelector('img').style.opacity = '1';
    modal.querySelector('img').style.transform = 'scale(1)';
    modal.querySelector('button').style.opacity = '1';
    modal.querySelector('button').style.transform = 'rotate(0deg)';
  }, 10);
}

function closeImageModal() {
  const modal = document.getElementById('image-modal');
  if (!modal) return;
  
  modal.style.background = 'rgba(0,0,0,0)';
  modal.querySelector('img').style.opacity = '0';
  modal.querySelector('img').style.transform = 'scale(0.8)';
  modal.querySelector('button').style.opacity = '0';
  modal.querySelector('button').style.transform = 'rotate(90deg)';
  
  setTimeout(() => modal.remove(), 300);
}
