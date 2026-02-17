let mundosDb;

if (typeof firebase !== 'undefined') {
  mundosDb = firebase.firestore();
}

let allMundos = [];

async function loadMundos() {
  const grid = document.getElementById('characters-grid');
  grid.innerHTML = '<div class="loading">Cargando mundos</div>';
  
  try {
    const snapshot = await mundosDb.collection('characters')
      .where('tipo_entrada', '==', 'mundo')
      .get();
    allMundos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    allMundos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    displayMundos(allMundos);
  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<p class="text-center">Error al cargar mundos</p>';
  }
}

function displayMundos(mundos) {
  const grid = document.getElementById('characters-grid');
  
  if (mundos.length === 0) {
    grid.innerHTML = '<p class="text-center">No hay mundos aún</p>';
    return;
  }
  
  grid.innerHTML = mundos.map(mundo => `
    <div class="character-card" onclick="showMundoDetail('${mundo.id}')" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1)); border: 2px solid rgba(6, 182, 212, 0.3);">
      ${mundo.galeria?.[0] ? `
        <div style="width: 100%; height: 200px; overflow: hidden; border-radius: 12px 12px 0 0; margin: -1rem -1rem 1rem -1rem;">
          <img src="${mundo.galeria[0]}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      ` : ''}
      <div style="padding: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <i class="bi bi-globe" style="font-size: 2.5rem; color: var(--wiki-accent);"></i>
          <div style="flex: 1;">
            <h3 style="color: var(--wiki-accent); margin: 0; font-size: 1.5rem;">${mundo.nombre}</h3>
            <span style="color: var(--wiki-text-dim); font-size: 0.85rem;">🌍 Mundo/Lore</span>
          </div>
        </div>
        ${mundo.descripcion_general ? `<p style="color: var(--wiki-text-dim); font-size: 0.9rem; line-height: 1.6; margin: 0;">${mundo.descripcion_general.substring(0, 120)}${mundo.descripcion_general.length > 120 ? '...' : ''}</p>` : ''}
      </div>
    </div>
  `).join('');
}

function filterMundos() {
  const search = document.getElementById('search-box').value.toLowerCase();
  
  let filtered = allMundos;
  
  if (search) {
    filtered = filtered.filter(mundo => 
      mundo.nombre.toLowerCase().includes(search)
    );
  }
  
  displayMundos(filtered);
}

function showMundoDetail(id) {
  const mundo = allMundos.find(m => m.id === id);
  if (!mundo) return;
  
  document.getElementById('characters-view').style.display = 'none';
  
  const detailView = document.getElementById('character-detail');
  detailView.style.display = 'block';
  detailView.innerHTML = `
    <button class="btn btn-outline-light mb-3" onclick="showAllMundos()">
      <i class="bi bi-arrow-left"></i> Volver
    </button>
    
    <div style="background: var(--wiki-bg-card); border: 2px solid var(--wiki-accent); border-radius: 20px; padding: 2rem; box-shadow: 0 10px 40px rgba(6, 182, 212, 0.3);">
      <div style="text-align: center; margin-bottom: 3rem;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 100px; height: 100px; background: linear-gradient(135deg, var(--wiki-accent), var(--wiki-primary)); border-radius: 50%; margin-bottom: 1.5rem; box-shadow: 0 8px 24px rgba(6, 182, 212, 0.4);">
          <i class="bi bi-globe" style="font-size: 3rem; color: white;"></i>
        </div>
        <h1 style="color: var(--wiki-accent); font-size: 3rem; font-weight: 900; margin: 0;">${mundo.nombre}</h1>
        <span style="color: var(--wiki-text-dim); font-size: 1.1rem;">🌍 Mundo/Lore</span>
      </div>
      
      ${mundo.descripcion_general ? `
        <div class="detail-section" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05)); border-left: 4px solid var(--wiki-accent);">
          <h3 style="color: var(--wiki-accent);"><i class="bi bi-file-text"></i> Descripción</h3>
          <div class="detail-content">${mundo.descripcion_general}</div>
        </div>
      ` : ''}
      
      ${mundo.apariencia ? `
        <div class="detail-section" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05)); border-left: 4px solid var(--wiki-accent);">
          <h3 style="color: var(--wiki-accent);"><i class="bi bi-image"></i> Apariencia del Mundo</h3>
          <div class="detail-content">${mundo.apariencia}</div>
        </div>
      ` : ''}
      
      ${mundo.personalidad ? `
        <div class="detail-section" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05)); border-left: 4px solid var(--wiki-accent);">
          <h3 style="color: var(--wiki-accent);"><i class="bi bi-lightning"></i> Características</h3>
          <div class="detail-content">${mundo.personalidad}</div>
        </div>
      ` : ''}
      
      ${mundo.trivia ? `
        <div class="detail-section" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05)); border-left: 4px solid var(--wiki-accent);">
          <h3 style="color: var(--wiki-accent);"><i class="bi bi-lightbulb"></i> Trivia</h3>
          <ul class="detail-list">${mundo.trivia.split(',').map(item => `<li style="border-left-color: var(--wiki-accent);">${item.trim()}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      ${mundo.galeria?.length ? `
        <div class="detail-section" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05)); border-left: 4px solid var(--wiki-accent);">
          <h3 style="color: var(--wiki-accent);"><i class="bi bi-images"></i> Galería</h3>
          <div class="gallery-grid">
            ${mundo.galeria.map(img => `
              <div class="gallery-item" onclick="openImageModal('${img}')" style="border: 2px solid var(--wiki-accent);">
                <img src="${img}" alt="Galería">
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  window.scrollTo(0, 0);
}

function showAllMundos() {
  document.getElementById('characters-view').style.display = 'block';
  document.getElementById('character-detail').style.display = 'none';
  window.scrollTo(0, 0);
}
