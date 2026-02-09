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
    <div class="character-card" onclick="showMundoDetail('${mundo.id}')">
      <img src="${mundo.iconos?.[0] || 'https://via.placeholder.com/100'}" 
           alt="${mundo.nombre}" 
           class="character-icon">
      <h3>${mundo.nombre}</h3>
      <p class="text-center text-muted">🌍 Mundo/Lore</p>
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
  
  document.querySelector('.container').style.display = 'none';
  
  const detailView = document.getElementById('character-detail');
  detailView.style.display = 'block';
  detailView.innerHTML = `
    <div class="container mt-4">
      <button class="btn btn-outline-light mb-3" onclick="showAllMundos()">
        <i class="bi bi-arrow-left"></i> Volver
      </button>
      
      <div class="character-detail-container">
        <div class="character-header">
          <img src="${mundo.renders?.[0] || mundo.iconos?.[0]}" alt="${mundo.nombre}" class="character-render">
          <div>
            <h1>${mundo.nombre}</h1>
            <span class="character-status">🌍 Mundo/Lore</span>
          </div>
        </div>
        
        ${mundo.descripcion_general ? `<h3 class="section-title">📝 Descripción</h3><p>${mundo.descripcion_general}</p>` : ''}
        ${mundo.apariencia ? `<h3 class="section-title">🏞️ Apariencia del Mundo</h3><p>${mundo.apariencia}</p>` : ''}
        ${mundo.personalidad ? `<h3 class="section-title">⚡ Características</h3><p>${mundo.personalidad}</p>` : ''}
        
        ${mundo.galeria?.length ? `<h3 class="section-title">🖼️ Galería</h3><div class="gallery-grid">${mundo.galeria.map(img => `<img src="${img}" class="gallery-img" onclick="window.open('${img}', '_blank')">`).join('')}</div>` : ''}
      </div>
    </div>
  `;
  
  window.scrollTo(0, 0);
}

function showAllMundos() {
  document.querySelector('.container').style.display = 'block';
  document.getElementById('character-detail').style.display = 'none';
  window.scrollTo(0, 0);
}
