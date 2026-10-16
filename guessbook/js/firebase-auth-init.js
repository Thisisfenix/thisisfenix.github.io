// ========================================
// INICIALIZACIÓN DE FIREBASE AUTH
// Asegura que Firebase Auth esté disponible globalmente
// ========================================

import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

// Inicializar cuando Firebase esté listo
export function initFirebaseAuth(app) {
  if (!app) {
    console.error('Firebase App no está inicializado');
    return null;
  }
  
  try {
    const auth = getAuth(app);
    
    // Exportar globalmente
    window.auth = auth;
    
    console.log('✅ Firebase Authentication inicializado');
    
    // Escuchar cambios de autenticación
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('👤 Usuario autenticado:', user.email || user.uid);
        
        // Emitir evento personalizado
        window.dispatchEvent(new CustomEvent('firebase-auth-ready', {
          detail: { user }
        }));
      } else {
        console.log('👤 Sin usuario autenticado');
      }
    });
    
    return auth;
    
  } catch (error) {
    console.error('Error inicializando Firebase Auth:', error);
    return null;
  }
}

// Auto-inicializar si Firebase ya está disponible
if (window.firebase?.app) {
  initFirebaseAuth(window.firebase.app);
}

export default initFirebaseAuth;
