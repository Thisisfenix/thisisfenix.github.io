// Sistema de relaciones dinámicas
let relationCount = 0;
let availableCharacters = [];

// Cargar personajes disponibles
async function loadAvailableCharacters() {
  if (typeof wikiDb === 'undefined') return;
  
  try {
    const snapshot = await wikiDb.collection('characters')
      .where('tipo_entrada', '==', 'personaje')
      .get();
    
    availableCharacters = snapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().nombre
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error cargando personajes:', error);
  }
}

// Agregar campo de relación
function addRelationField() {
  if (!availableCharacters.length) {
    loadAvailableCharacters();
  }
  
  relationCount++;
  const container = document.getElementById('relations-container');
  
  const relationDiv = document.createElement('div');
  relationDiv.className = 'relation-field';
  relationDiv.id = `relation-${relationCount}`;
  relationDiv.style.cssText = 'background: var(--bg-light); border: 2px solid var(--primary); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;';
  
  relationDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <strong style="color: var(--primary);">Relación #${relationCount}</strong>
      <button type="button" class="btn btn-sm btn-danger" onclick="removeRelationField(${relationCount})">
        <i class="bi bi-trash"></i>
      </button>
    </div>
    
    <div class="mb-2">
      <label class="form-label" style="font-size: 0.9rem;">Tipo de Relación</label>
      <select class="form-select form-select-sm relation-type" onchange="toggleRelationType(${relationCount})">
        <option value="oc">Con OC del catálogo</option>
        <option value="externo">Con personaje externo</option>
        <option value="ambos">Ambos (OC + Externo)</option>
      </select>
    </div>
    
    <div class="relation-oc-container" id="relation-oc-${relationCount}">
      <div class="mb-2">
        <label class="form-label" style="font-size: 0.9rem;">Personaje del Catálogo</label>
        <select class="form-select form-select-sm relation-character">
          <option value="">Selecciona un personaje...</option>
          ${availableCharacters.map(char => `<option value="${char.nombre}">${char.nombre}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div class="relation-externo-container" id="relation-externo-${relationCount}" style="display: none;">
      <div class="mb-2">
        <label class="form-label" style="font-size: 0.9rem;">Nombre del Personaje Externo</label>
        <input type="text" class="form-control form-control-sm relation-external-name" placeholder="Nombre del personaje">
      </div>
    </div>
    
    <div class="mb-2">
      <label class="form-label" style="font-size: 0.9rem;">Tipo de Relación</label>
      <input type="text" class="form-control form-control-sm relation-type-text" placeholder="Ej: Amigo, Hermano, Rival...">
    </div>
  `;
  
  container.appendChild(relationDiv);
  updateRelationsHidden();
}

// Cambiar tipo de relación
function toggleRelationType(id) {
  const ocContainer = document.getElementById(`relation-oc-${id}`);
  const externoContainer = document.getElementById(`relation-externo-${id}`);
  const select = document.querySelector(`#relation-${id} .relation-type`);
  
  if (select.value === 'oc') {
    ocContainer.style.display = 'block';
    externoContainer.style.display = 'none';
  } else if (select.value === 'externo') {
    ocContainer.style.display = 'none';
    externoContainer.style.display = 'block';
  } else {
    ocContainer.style.display = 'block';
    externoContainer.style.display = 'block';
  }
  
  updateRelationsHidden();
}

// Eliminar campo de relación
function removeRelationField(id) {
  const field = document.getElementById(`relation-${id}`);
  if (field) {
    field.remove();
    updateRelationsHidden();
  }
}

// Actualizar campo oculto con todas las relaciones
function updateRelationsHidden() {
  const container = document.getElementById('relations-container');
  const hiddenField = document.getElementById('relaciones-hidden');
  
  if (!container || !hiddenField) return;
  
  const relations = [];
  const relationFields = container.querySelectorAll('.relation-field');
  
  relationFields.forEach(field => {
    const type = field.querySelector('.relation-type').value;
    const relationType = field.querySelector('.relation-type-text').value.trim();
    
    if (type === 'oc') {
      const characterName = field.querySelector('.relation-character').value;
      if (characterName && relationType) {
        relations.push(`${characterName} (${relationType})`);
      }
    } else if (type === 'externo') {
      const characterName = field.querySelector('.relation-external-name').value.trim();
      if (characterName && relationType) {
        relations.push(`${characterName} (${relationType})`);
      }
    } else {
      const ocName = field.querySelector('.relation-character').value;
      const externalName = field.querySelector('.relation-external-name').value.trim();
      
      if (ocName && relationType) {
        relations.push(`${ocName} (${relationType})`);
      }
      if (externalName && relationType) {
        relations.push(`${externalName} (${relationType})`);
      }
    }
  });
  
  hiddenField.value = relations.join(', ');
}

// Event listeners para actualizar cuando cambien los valores
document.addEventListener('DOMContentLoaded', () => {
  loadAvailableCharacters();
  
  // Actualizar cuando cambien los inputs
  document.addEventListener('input', (e) => {
    if (e.target.closest('#relations-container')) {
      updateRelationsHidden();
    }
  });
  
  document.addEventListener('change', (e) => {
    if (e.target.closest('#relations-container')) {
      updateRelationsHidden();
    }
  });
});
