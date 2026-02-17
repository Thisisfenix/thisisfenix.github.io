// Sistema de autenticación por dispositivo
const DeviceAuth = {
  // Generar ID único del dispositivo
  getDeviceId() {
    let deviceId = localStorage.getItem('wiki_device_id');
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem('wiki_device_id', deviceId);
    }
    return deviceId;
  },

  // Generar ID único
  generateDeviceId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const userAgent = navigator.userAgent.substring(0, 50);
    return `${timestamp}-${random}-${btoa(userAgent).substring(0, 20)}`;
  },

  // Verificar si el dispositivo tiene acceso a una entrada
  canEdit(entryDeviceId) {
    return this.getDeviceId() === entryDeviceId;
  },

  // Obtener entradas del dispositivo actual
  getDeviceEntries() {
    return localStorage.getItem('wiki_device_entries') || '[]';
  },

  // Agregar entrada al dispositivo
  addEntry(entryId) {
    const entries = JSON.parse(this.getDeviceEntries());
    if (!entries.includes(entryId)) {
      entries.push(entryId);
      localStorage.setItem('wiki_device_entries', JSON.stringify(entries));
    }
  },

  // Generar código de recuperación
  generateRecoveryCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i < 15) code += '-';
    }
    return code;
  },

  // Guardar código de recuperación
  saveRecoveryCode(entryId, code) {
    const codes = JSON.parse(localStorage.getItem('wiki_recovery_codes') || '{}');
    codes[entryId] = code;
    localStorage.setItem('wiki_recovery_codes', JSON.stringify(codes));
  },

  // Transferir entrada con código
  transferEntry(code, newDeviceId) {
    const codes = JSON.parse(localStorage.getItem('wiki_recovery_codes') || '{}');
    const entryId = Object.keys(codes).find(id => codes[id] === code);
    if (entryId) {
      this.addEntry(entryId);
      return entryId;
    }
    return null;
  },
};

// Exportar para uso global
window.DeviceAuth = DeviceAuth;
