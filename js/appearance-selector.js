// Sistema de apariciones dinámicas
let appearanceCount = 0;
let availableWorlds = [];

// Cargar mundos disponibles
async function loadAvailableWorlds() {
  if (typeof wikiDb === 'undefined') return;
  
  try {
    const snapshot = await wikiDb.collection('characters')
      .where('tipo_entrada', '==', 'mundo')
      .get();
    
    availableWorlds = snapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().nombre
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error cargando mundos:', error);
  }
}

// Agregar campo de aparición
function addAppearanceField() {
  if (!availableWorlds.length) {
    loadAvailableWorlds();
  }
  
  appearanceCount++;
  const container = document.getElementById('appearances-container');
  
  const appearanceDiv = document.createElement('div');
  appearanceDiv.className = 'appearance-field';
  appearanceDiv.id = `appearance-${appearanceCount}`;
  appearanceDiv.style.cssText = 'background: var(--bg-light); border: 2px solid var(--primary); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;';
  
  appearanceDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <strong style="color: var(--primary);">Aparición #${appearanceCount}</strong>
      <button type="button" class="btn btn-sm btn-danger" onclick="removeAppearanceField(${appearanceCount})">
        <i class="bi bi-trash"></i>
      </button>
    </div>
    
    <div class="mb-2">
      <label class="form-label" style="font-size: 0.9rem;">Tipo de Aparición</label>
      <select class="form-select form-select-sm appearance-type" onchange="toggleAppearanceType(${appearanceCount})">
        <option value="mundo">En mundo del catálogo</option>
        <option value="externo">En historia/proyecto externo</option>
        <option value="ambos">Ambos (Mundo + Externo)</option>
      </select>
    </div>
    
    <div class="appearance-mundo-container" id="appearance-mundo-${appearanceCount}">
      <div class="mb-2">
        <label class="form-label" style="font-size: 0.9rem;">Mundo del Catálogo</label>
        <select class="form-select form-select-sm appearance-world">
          <option value="">Selecciona un mundo...</option>
          ${availableWorlds.map(world => `<option value="${world.nombre}">${world.nombre}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div class="appearance-externo-container" id="appearance-externo-${appearanceCount}" style="display: none;">
      <div class="mb-2">
        <label class="form-label" style="font-size: 0.9rem;">Nombre de Historia/Proyecto</label>
        <input type="text" class="form-control form-control-sm appearance-external-name" placeholder="Nombre de la historia o proyecto">
      </div>
    </div>
  `;
  
  container.appendChild(appearanceDiv);
  updateAppearancesHidden();
}

// Cambiar tipo de aparición
function toggleAppearanceType(id) {
  const mundoContainer = document.getElementById(`appearance-mundo-${id}`);
  const externoContainer = document.getElementById(`appearance-externo-${id}`);
  const select = document.querySelector(`#appearance-${id} .appearance-type`);
  
  if (select.value === 'mundo') {
    mundoContainer.style.display = 'block';
    externoContainer.style.display = 'none';
  } else if (select.value === 'externo') {
    mundoContainer.style.display = 'none';
    externoContainer.style.display = 'block';
  } else {
    mundoContainer.style.display = 'block';
    externoContainer.style.display = 'block';
  }
  
  updateAppearancesHidden();
}

// Eliminar campo de aparición
function removeAppearanceField(id) {
  const field = document.getElementById(`appearance-${id}`);
  if (field) {
    field.remove();
    updateAppearancesHidden();
  }
}

// Actualizar campo oculto con todas las apariciones
function updateAppearancesHidden() {
  const container = document.getElementById('appearances-container');
  const hiddenField = document.getElementById('apariciones-hidden');
  
  if (!container || !hiddenField) return;
  
  const appearances = [];
  const appearanceFields = container.querySelectorAll('.appearance-field');
  
  appearanceFields.forEach(field => {
    const type = field.querySelector('.appearance-type').value;
    
    if (type === 'mundo') {
      const worldName = field.querySelector('.appearance-world').value;
      if (worldName) {
        appearances.push(worldName);
      }
    } else if (type === 'externo') {
      const externalName = field.querySelector('.appearance-external-name').value.trim();
      if (externalName) {
        appearances.push(externalName);
      }
    } else {
      const worldName = field.querySelector('.appearance-world').value;
      const externalName = field.querySelector('.appearance-external-name').value.trim();
      
      if (worldName) {
        appearances.push(worldName);
      }
      if (externalName) {
        appearances.push(externalName);
      }
    }
  });
  
  hiddenField.value = appearances.join(', ');
}

// Event listeners para actualizar cuando cambien los valores
document.addEventListener('DOMContentLoaded', () => {
  loadAvailableWorlds();
  
  // Actualizar cuando cambien los inputs
  document.addEventListener('input', (e) => {
    if (e.target.closest('#appearances-container')) {
      updateAppearancesHidden();
    }
  });
  
  document.addEventListener('change', (e) => {
    if (e.target.closest('#appearances-container')) {
      updateAppearancesHidden();
    }
  });
});
