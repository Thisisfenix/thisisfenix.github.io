async function loadRejected() {
  const grid = document.getElementById('characters-grid');
  grid.innerHTML = '<div class="loading">Cargando entradas rechazadas</div>';
  
  try {
    const snapshot = await wikiDb.collection('rejected_characters').get();
    allCharacters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    allCharacters.sort((a, b) => {
      const timeA = a.rejectedAt?.toMillis() || 0;
      const timeB = b.rejectedAt?.toMillis() || 0;
      return timeB - timeA;
    });
    
    if (allCharacters.length === 0) {
      grid.innerHTML = '<p class="text-center">No hay entradas rechazadas</p>';
      return;
    }
    
    displayRejected(allCharacters);
  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<p class="text-center">Error al cargar</p>';
  }
}

function displayRejected(rejected) {
  const grid = document.getElementById('characters-grid');
  
  if (rejected.length === 0) {
    grid.innerHTML = '<p class="text-center">No se encontraron resultados</p>';
    return;
  }
  
  grid.innerHTML = rejected.map(char => `
    <div onclick="showRejectedDetail('${char.id}')" style="position: relative; overflow: hidden; cursor: pointer; transition: all 0.3s ease; background: var(--bg-dark); border: 2px solid #dc3545; border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;" onmouseover="this.style.borderColor='#ff4444'; this.style.transform='translateX(10px)'; this.style.boxShadow='0 0 20px #dc3545'" onmouseout="this.style.borderColor='#dc3545'; this.style.transform='translateX(0)'; this.style.boxShadow='none'">
      <img src="${char.iconos?.[0] || 'https://via.placeholder.com/80'}" 
           alt="${char.nombre}" 
           style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; position: relative; z-index: 1;">
      <div style="flex: 1; position: relative; z-index: 1;">
        <h3 style="color: #dc3545; margin: 0; font-size: 1.5rem;">${char.nombre}</h3>
        <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.9rem;">Por: ${char.discord}</p>
        <p style="color: #ff6b6b; margin: 0.25rem 0 0 0; font-size: 0.85rem; font-style: italic;">❌ ${char.rejectionReason || 'Sin razón especificada'}</p>
      </div>
      <i class="bi bi-chevron-right" style="color: #dc3545; font-size: 1.5rem; position: relative; z-index: 1;"></i>
    </div>
  `).join('');
}

async function showRejectedDetail(id) {
  const snapshot = await wikiDb.collection('rejected_characters').doc(id).get();
  if (!snapshot.exists) return;
  
  const char = { id: snapshot.id, ...snapshot.data() };
  
  document.getElementById('characters-view').style.display = 'none';
  document.getElementById('submit-form').style.display = 'none';
  
  const detailView = document.getElementById('character-detail');
  detailView.style.display = 'block';
  detailView.innerHTML = `
    <button class="btn btn-outline-light mb-3" onclick="showAllCharacters(); showView('rechazados')">
      <i class="bi bi-arrow-left"></i> Volver
    </button>
    
    <div style="background: var(--bg-dark); border: 2px solid #dc3545; border-radius: 12px; padding: 2rem;">
      <div style="background: linear-gradient(135deg, rgba(220,53,69,0.1), rgba(255,0,0,0.05)); border-left: 4px solid #dc3545; padding: 1.5rem; margin-bottom: 2rem; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <i class="bi bi-x-circle" style="color: #dc3545; font-size: 1.5rem;"></i>
          <strong style="color: #dc3545;">Entrada Rechazada</strong>
        </div>
        <p style="color: var(--text-color); margin: 0;"><strong>Razón:</strong> ${char.rejectionReason || 'No especificada'}</p>
      </div>
      
      <h1 style="color: #dc3545; margin-bottom: 1rem;">${char.nombre}</h1>
      <p style="color: var(--text-secondary);">Por: ${char.discord}</p>
      
      ${char.descripcion_general ? `
        <div style="margin-top: 2rem;">
          <h3 style="color: var(--primary);">Descripción</h3>
          <p style="color: var(--text-color);">${char.descripcion_general}</p>
        </div>
      ` : ''}
    </div>
  `;
  
  window.scrollTo(0, 0);
}
