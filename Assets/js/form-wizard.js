let currentStep = 1;
const totalSteps = 5;

function initFormWizard() {
  showStep(1);
  
  const tipoEntrada = document.querySelector('select[name="tipo_entrada"]');
  if (tipoEntrada) {
    tipoEntrada.addEventListener('change', () => {
      if (typeof toggleFormFields === 'function') toggleFormFields();
    });
    if (typeof toggleFormFields === 'function') toggleFormFields();
  }
}

function showStep(step) {
  document.querySelectorAll('.wizard-step').forEach(s => {
    s.style.opacity = '0';
    s.style.display = 'none';
  });
  
  const stepEl = document.getElementById(`step-${step}`);
  if (stepEl) {
    stepEl.style.display = 'block';
    setTimeout(() => stepEl.style.opacity = '1', 50);
  }
  
  currentStep = step;
  updateProgress();
  updateButtons();
}

function nextStep() {
  if (!validateCurrentStep()) return;
  
  if (currentStep < totalSteps) {
    const stepEl = document.getElementById(`step-${currentStep}`);
    stepEl.style.opacity = '0';
    
    let nextStepNum = currentStep + 1;
    const tipoEntrada = document.querySelector('select[name="tipo_entrada"]')?.value;
    
    if (tipoEntrada === 'mundo' && nextStepNum === 4) {
      nextStepNum = 5;
    }
    
    setTimeout(() => showStep(nextStepNum), 300);
  }
}

function validateCurrentStep() {
  const stepEl = document.getElementById(`step-${currentStep}`);
  const inputs = stepEl.querySelectorAll('input[required], select[required], textarea[required]');
  
  for (let input of inputs) {
    if (!input.value.trim()) {
      input.focus();
      input.style.borderColor = 'red';
      setTimeout(() => input.style.borderColor = '', 2000);
      return false;
    }
  }
  return true;
}

function prevStep() {
  if (currentStep > 1) {
    const stepEl = document.getElementById(`step-${currentStep}`);
    stepEl.style.opacity = '0';
    
    let prevStepNum = currentStep - 1;
    const tipoEntrada = document.querySelector('select[name="tipo_entrada"]')?.value;
    
    if (tipoEntrada === 'mundo' && currentStep === 5) {
      prevStepNum = 3;
    }
    
    setTimeout(() => showStep(prevStepNum), 300);
  }
}

function updateProgress() {
  const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
  document.getElementById('wizard-progress').style.width = percent + '%';
  
  document.querySelectorAll('.step-indicator').forEach((ind, i) => {
    if (i + 1 < currentStep) {
      ind.className = 'step-indicator completed';
    } else if (i + 1 === currentStep) {
      ind.className = 'step-indicator active';
    } else {
      ind.className = 'step-indicator';
    }
  });
}

function updateButtons() {
  document.getElementById('prev-btn').style.display = currentStep === 1 ? 'none' : 'inline-block';
  document.getElementById('next-btn').style.display = currentStep === totalSteps ? 'none' : 'inline-block';
  document.getElementById('submit-btn').style.display = currentStep === totalSteps ? 'inline-block' : 'none';
}
