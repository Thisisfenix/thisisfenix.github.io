/**
 * Sistema de sincronización de logros entre Guestbook y Laboratory
 * Este script se ejecuta en el guestbook para marcar actividades y sincronizar logros
 */

class GuestbookAchievementSync {
  constructor() {
    this.init();
  }

  init() {
    // Marcar visita al guestbook
    this.markGuestbookVisit();
    
    // Configurar listeners para actividades
    this.setupActivityListeners();
    
    // Sincronizar datos existentes
    this.syncExistingData();
  }

  // Marcar que el usuario visitó el guestbook
  markGuestbookVisit() {
    localStorage.setItem('guestbook-visited', 'true');
    localStorage.setItem('guestbook-last-visit', Date.now().toString());
    
    // Notificar al laboratory si está disponible
    this.notifyLaboratory('guestbook-visit');
  }

  // Configurar listeners para actividades del guestbook
  setupActivityListeners() {
    // Listener para cuando se guarda un dibujo
    document.addEventListener('drawing-saved', (event) => {
      this.incrementDrawingCount();
      this.notifyLaboratory('drawing-created', event.detail);
    });

    // Listener para cuando se hace un comentario
    document.addEventListener('comment-posted', (event) => {
      this.incrementCommentCount();
      this.notifyLaboratory('comment-posted', event.detail);
    });

    // Listener para cuando se da un like
    document.addEventListener('like-given', (event) => {
      this.incrementLikeCount();
      this.notifyLaboratory('like-given', event.detail);
    });

    // Listener para cuando se crea/actualiza el perfil
    document.addEventListener('profile-updated', (event) => {
      this.updateProfile(event.detail);
      this.notifyLaboratory('profile-updated', event.detail);
    });

    // Listeners para botones específicos del guestbook
    this.setupButtonListeners();
  }

  // Configurar listeners para botones específicos
  setupButtonListeners() {
    // Listener para el botón de guardar dibujo
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        // Esperar un poco para que se complete el guardado
        setTimeout(() => {
          this.incrementDrawingCount();
        }, 1000);
      });
    }

    // Listeners para botones de like
    document.addEventListener('click', (event) => {
      if (event.target.matches('.like-btn, .btn-like, [data-action="like"]')) {
        this.incrementLikeCount();
      }
    });

    // Listeners para formularios de comentarios
    document.addEventListener('submit', (event) => {
      if (event.target.matches('.comment-form, [data-form="comment"]')) {
        this.incrementCommentCount();
      }
    });
  }

  // Incrementar contador de dibujos
  incrementDrawingCount() {
    const current = parseInt(localStorage.getItem('guestbook-drawings-count') || '0');
    const newCount = current + 1;
    localStorage.setItem('guestbook-drawings-count', newCount.toString());
    
    // Actualizar perfil
    this.updateProfileStats('totalDrawings', newCount);
    
    console.log(`🎨 Dibujos creados: ${newCount}`);
  }

  // Incrementar contador de comentarios
  incrementCommentCount() {
    const current = parseInt(localStorage.getItem('guestbook-comments-count') || '0');
    const newCount = current + 1;
    localStorage.setItem('guestbook-comments-count', newCount.toString());
    
    // Actualizar perfil
    this.updateProfileStats('totalComments', newCount);
    
    console.log(`💬 Comentarios hechos: ${newCount}`);
  }

  // Incrementar contador de likes
  incrementLikeCount() {
    const current = parseInt(localStorage.getItem('guestbook-likes-count') || '0');
    const newCount = current + 1;
    localStorage.setItem('guestbook-likes-count', newCount.toString());
    
    // Actualizar perfil
    this.updateProfileStats('totalLikes', newCount);
    
    console.log(`❤️ Likes dados: ${newCount}`);
  }

  // Actualizar estadísticas del perfil
  updateProfileStats(stat, value) {
    try {
      const profile = JSON.parse(localStorage.getItem('guestbook-profile') || '{}');
      profile[stat] = value;
      profile.lastActivity = Date.now();
      localStorage.setItem('guestbook-profile', JSON.stringify(profile));
    } catch (error) {
      console.warn('Error updating profile stats:', error);
    }
  }

  // Actualizar perfil completo
  updateProfile(profileData) {
    try {
      const existingProfile = JSON.parse(localStorage.getItem('guestbook-profile') || '{}');
      const updatedProfile = { ...existingProfile, ...profileData, lastActivity: Date.now() };
      localStorage.setItem('guestbook-profile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.warn('Error updating profile:', error);
    }
  }

  // Sincronizar datos existentes del guestbook
  syncExistingData() {
    // Verificar si hay datos del ProfileManager
    if (window.guestbookApp && window.guestbookApp.profiles) {
      const profileManager = window.guestbookApp.profiles;
      
      if (profileManager.isLoggedIn()) {
        const profile = profileManager.currentProfile;
        this.updateProfile({
          username: profile.username,
          totalDrawings: profile.totalDrawings || 0,
          totalComments: profile.totalComments || 0,
          totalLikes: profile.totalLikes || 0,
          joinDate: profile.joinDate
        });
      }
    }

    // Verificar si hay datos de Firebase
    this.syncFirebaseData();
  }

  // Sincronizar datos de Firebase
  async syncFirebaseData() {
    try {
      if (window.guestbookApp && window.guestbookApp.firebase) {
        const firebase = window.guestbookApp.firebase;
        
        // Obtener datos del usuario actual si está disponible
        const userData = await this.getUserDataFromFirebase(firebase);
        if (userData) {
          this.updateProfile(userData);
        }
      }
    } catch (error) {
      console.warn('Error syncing Firebase data:', error);
    }
  }

  // Obtener datos del usuario desde Firebase
  async getUserDataFromFirebase(firebase) {
    try {
      // Esta función debería implementarse según la estructura de Firebase del guestbook
      // Por ahora, retornamos null
      return null;
    } catch (error) {
      console.warn('Error getting user data from Firebase:', error);
      return null;
    }
  }

  // Notificar al laboratory sobre actividades
  notifyLaboratory(action, data = {}) {
    // Crear evento personalizado para comunicación entre páginas
    const eventData = {
      action,
      data,
      timestamp: Date.now(),
      source: 'guestbook'
    };

    // Guardar en localStorage para que el laboratory pueda leerlo
    const notifications = JSON.parse(localStorage.getItem('guestbook-notifications') || '[]');
    notifications.push(eventData);
    
    // Mantener solo las últimas 50 notificaciones
    if (notifications.length > 50) {
      notifications.splice(0, notifications.length - 50);
    }
    
    localStorage.setItem('guestbook-notifications', JSON.stringify(notifications));

    // Intentar comunicación directa si el laboratory está abierto en otra pestaña
    try {
      if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('fenix-achievements');
        channel.postMessage(eventData);
      }
    } catch (error) {
      console.warn('BroadcastChannel not available:', error);
    }

    console.log(`📡 Notificación enviada al laboratory:`, action, data);
  }

  // Obtener estadísticas actuales
  getStats() {
    return {
      drawings: parseInt(localStorage.getItem('guestbook-drawings-count') || '0'),
      comments: parseInt(localStorage.getItem('guestbook-comments-count') || '0'),
      likes: parseInt(localStorage.getItem('guestbook-likes-count') || '0'),
      hasProfile: localStorage.getItem('guestbook-profile') !== null,
      lastVisit: localStorage.getItem('guestbook-last-visit'),
      visited: localStorage.getItem('guestbook-visited') === 'true'
    };
  }

  // Resetear estadísticas (para testing)
  resetStats() {
    localStorage.removeItem('guestbook-drawings-count');
    localStorage.removeItem('guestbook-comments-count');
    localStorage.removeItem('guestbook-likes-count');
    localStorage.removeItem('guestbook-profile');
    localStorage.removeItem('guestbook-visited');
    localStorage.removeItem('guestbook-last-visit');
    localStorage.removeItem('guestbook-notifications');
    console.log('🔄 Estadísticas del guestbook reseteadas');
  }
}

// Inicializar el sistema de sincronización cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  window.guestbookSync = new GuestbookAchievementSync();
  console.log('🔗 Sistema de sincronización de logros del guestbook inicializado');
});

// Hacer disponible globalmente
window.GuestbookAchievementSync = GuestbookAchievementSync;

// Funciones de utilidad para el guestbook
window.markDrawingCreated = () => {
  if (window.guestbookSync) {
    window.guestbookSync.incrementDrawingCount();
  }
};

window.markCommentPosted = () => {
  if (window.guestbookSync) {
    window.guestbookSync.incrementCommentCount();
  }
};

window.markLikeGiven = () => {
  if (window.guestbookSync) {
    window.guestbookSync.incrementLikeCount();
  }
};

window.getGuestbookStats = () => {
  if (window.guestbookSync) {
    return window.guestbookSync.getStats();
  }
  return null;
};