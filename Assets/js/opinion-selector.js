let opinionCount = 0;
let catalogCharacters = [];

// Cargar personajes del cat\u00e1logo
async function loadCatalogCharacters() {
  if (catalogCharacters.length > 0) return;
  
  try {
    const snapshot = await wikiDb.collection('characters')
      .where('tipo_entrada', '==', 'personaje')
      .get();
    catalogCharacters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    catalogCharacters.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error cargando personajes:', error);
  }
}

function addOpinionField() {
  loadCatalogCharacters();
  
  opinionCount++;
  const container = document.getElementById('opinions-container');
  
  const opinionDiv = document.createElement('div');
  opinionDiv.id = `opinion-${opinionCount}`;
  opinionDiv.className = 'mb-3 p-3';
  opinionDiv.style.cssText = 'background: var(--bg-light); border: 2px solid var(--primary); border-radius: 8px;';
  
  opinionDiv.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 style="color: var(--primary); margin: 0;">Opini\u00f3n #${opinionCount}</h6>
      <button type="button" class="btn btn-sm btn-danger" onclick="removeOpinion(${opinionCount})">
        <i class="bi bi-trash"></i>
      </button>
    </div>
    <div class="mb-2">
      <label class="form-label">Selecciona Personaje</label>
      <select class="form-select opinion-character" id="char-${opinionCount}" onchange="updateOpinions()">
        <option value="">Cargando personajes...</option>
      </select>
    </div>
    <div class="mb-2">
      <label class="form-label">Opini\u00f3n Corta</label>
      <input type="text" class="form-control opinion-short" placeholder="Resumen en una l\u00ednea" onchange="updateOpinions()">
    </div>
    <div class="mb-2">
      <label class="form-label">Opini\u00f3n Extendida</label>
      <textarea class="form-control opinion-long" rows="3" placeholder="Opini\u00f3n detallada (puedes usar m\u00faltiples p\u00e1rrafos)" onchange="updateOpinions()"></textarea>
    </div>
  `;
  
  container.appendChild(opinionDiv);
  
  // Cargar personajes en el select
  setTimeout(() => {
    const select = document.getElementById(`char-${opinionCount}`);
    if (select && catalogCharacters.length > 0) {
      select.innerHTML = '<option value="">Selecciona un personaje</option>' +
        catalogCharacters.map(char => `<option value="${char.nombre}">${char.nombre}</option>`).join('');
    }
  }, 500);
}

function removeOpinion(id) {
  const element = document.getElementById(`opinion-${id}`);
  if (element) {
    element.remove();
    updateOpinions();
  }
}

function updateOpinions() {
  const container = document.getElementById('opinions-container');
  const opinions = [];
  
  container.querySelectorAll('[id^="opinion-"]').forEach(opDiv => {
    const charSelect = opDiv.querySelector('.opinion-character');
    const shortInput = opDiv.querySelector('.opinion-short');
    const longTextarea = opDiv.querySelector('.opinion-long');
    
    if (charSelect && charSelect.value && shortInput && shortInput.value) {
      const opinionText = `${charSelect.value}\n\n${shortInput.value}\n\n${longTextarea.value || ''}`;
      opinions.push(opinionText);
    }
  });
  
  document.getElementById('opiniones-hidden').value = opinions.join('\n\n---\n\n');
}
