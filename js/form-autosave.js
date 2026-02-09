// Sistema de autoguardado del formulario
const AUTOSAVE_KEY = 'wiki_form_autosave';
const AUTOSAVE_INTERVAL = 3000;

let autosaveTimer = null;
let formHasChanges = false;

function saveFormProgress() {
  const form = document.getElementById('character-form');
  if (!form) return;
  
  const formData = new FormData(form);
  const data = { currentStep: window.currentStep || 1 };
  
  for (let [key, value] of formData.entries()) {
    if (!(value instanceof File) && value) {
      data[key] = value;
    }
  }
  
  const relaciones = document.getElementById('relaciones-hidden');
  const opiniones = document.getElementById('opiniones-hidden');
  const apariciones = document.getElementById('apariciones-hidden');
  
  if (relaciones) data.relaciones = relaciones.value;
  if (opiniones) data.opiniones = opiniones.value;
  if (apariciones) data.apariciones = apariciones.value;
  
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
  formHasChanges = true;
  console.log('✅ Progreso guardado (paso ' + data.currentStep + ')');
}

function restoreFormProgress() {
  const saved = localStorage.getItem(AUTOSAVE_KEY);
  if (!saved) return false;
  
  try {
    const data = JSON.parse(saved);
    const form = document.getElementById('character-form');
    if (!form) return false;
    
    for (let [key, value] of Object.entries(data)) {
      if (key === 'currentStep') continue;
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = value === 'on';
        } else if (input.type !== 'file') {
          input.value = value;
        }
      }
    }
    
    if (data.currentStep && typeof showStep === 'function') {
      setTimeout(() => showStep(data.currentStep), 100);
    }
    
    console.log('✅ Progreso restaurado (paso ' + data.currentStep + ')');
    return true;
  } catch (error) {
    console.error('Error restaurando progreso:', error);
    return false;
  }
}

function clearFormProgress() {
  localStorage.removeItem(AUTOSAVE_KEY);
  formHasChanges = false;
  console.log('🗑️ Progreso eliminado');
}

function startAutosave() {
  const form = document.getElementById('character-form');
  if (!form) return;
  
  form.addEventListener('input', () => {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(saveFormProgress, AUTOSAVE_INTERVAL);
  });
  
  form.addEventListener('change', () => {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(saveFormProgress, AUTOSAVE_INTERVAL);
  });
  
  window.addEventListener('beforeunload', (e) => {
    if (formHasChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  
  const saved = localStorage.getItem(AUTOSAVE_KEY);
  if (saved) {
    const restore = confirm('📝 Se encontró un borrador guardado. ¿Quieres restaurarlo?');
    if (restore) {
      restoreFormProgress();
    } else {
      clearFormProgress();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('character-form');
  if (form) {
    form.addEventListener('submit', () => {
      setTimeout(clearFormProgress, 1000);
    });
  }
});
