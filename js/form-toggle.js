function toggleFormFields() {
  const tipoEntrada = document.querySelector('select[name="tipo_entrada"]')?.value;
  if (!tipoEntrada) return;
  
  if (tipoEntrada === 'mundo') {
    const fieldsToHide = [
      'genero', 'pronombres', 'orientacion', 'edad', 'fecha_nacimiento',
      'estado', 'especie', 'altura', 'ojos', 'cabello', 'relaciones',
      'afiliaciones', 'ocupacion', 'apariciones', 'voz', 'le_gusta',
      'no_le_gusta', 'estado_personaje'
    ];
    
    fieldsToHide.forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const container = field.closest('.mb-3') || field.closest('.row');
        if (container) container.style.display = 'none';
      }
    });
    
    document.getElementById('step-4')?.style.setProperty('display', 'none', 'important');
    
    const step2Title = document.querySelector('#step-2 h3');
    if (step2Title) step2Title.innerHTML = '🌍 Información del Mundo';
    
    const step3Labels = document.querySelectorAll('#step-3 .form-label');
    step3Labels.forEach(l => {
      if (l.textContent === 'Apariencia *') l.textContent = 'Apariencia del Mundo *';
      if (l.textContent === 'Personalidad *') l.textContent = 'Características del Mundo *';
    });
    
  } else {
    const allContainers = document.querySelectorAll('.mb-3, .row');
    allContainers.forEach(el => {
      if (el.id !== 'entrada-modificar-container') el.style.display = '';
    });
    
    const step4 = document.getElementById('step-4');
    if (step4) step4.style.removeProperty('display');
    
    const step2Title = document.querySelector('#step-2 h3');
    if (step2Title) step2Title.innerHTML = '👤 Datos del Personaje';
    
    const step3Labels = document.querySelectorAll('#step-3 .form-label');
    step3Labels.forEach(l => {
      if (l.textContent === 'Apariencia del Mundo *') l.textContent = 'Apariencia *';
      if (l.textContent === 'Características del Mundo *') l.textContent = 'Personalidad *';
    });
  }
}
