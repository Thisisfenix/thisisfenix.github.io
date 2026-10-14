// Integración del sistema de puntos de Laboratory con Guestbook
// Este archivo carga el sistema de achievements de Laboratory para usar puntos unificados

(async function() {
  'use strict';
  
  console.log('🔄 Iniciando integración con Laboratory...');
  
  // Verificar si AchievementSystem ya existe
  if (typeof AchievementSystem !== 'undefined') {
    console.log('✅ AchievementSystem ya disponible, inicializando...');
    initializeLaboratoryPoints();
    return;
  }
  
  // Si no existe, intentar cargar
  try {
    const achievementsScript = document.createElement('script');
    achievementsScript.src = '../Assets/js/achievements.js';
    achievementsScript.type = 'text/javascript';
    achievementsScript.async = false;
    
    achievementsScript.onload = function() {
      console.log('✅ Sistema de Achievements de Laboratory cargado');
      initializeLaboratoryPoints();
    };
    
    achievementsScript.onerror = function() {
      console.warn('⚠️ No se pudo cargar el sistema de Laboratory, usando puntos locales');
    };
    
    document.head.appendChild(achievementsScript);
    
  } catch (error) {
    console.error('❌ Error cargando sistema de Laboratory:', error);
  }
  
  function initializeLaboratoryPoints() {
    // Inicializar el sistema de achievements si existe la clase
    if (typeof AchievementSystem !== 'undefined') {
      window.achievementSystem = new AchievementSystem('fenix-lab-game');
      
      // Cargar datos guardados
      window.achievementSystem.load().then(() => {
        console.log('💰 Puntos de Laboratory cargados:', window.achievementSystem.getPoints());
        
        // Migrar puntos locales del Guestbook si existen
        migrateLocalPoints();
        
        // Notificar que el sistema está listo
        window.dispatchEvent(new CustomEvent('laboratory-points-ready', {
          detail: {
            points: window.achievementSystem.getPoints(),
            level: window.achievementSystem.getLevel(),
            streak: window.achievementSystem.getStreak()
          }
        }));
        
        // Registrar logro de visitar el guestbook
        window.achievementSystem.checkAchievement('guestbook-visitor');
      });
    }
  }
  
  function migrateLocalPoints() {
    const localPoints = parseInt(localStorage.getItem('guestbook-user-points') || '0');
    
    // Si hay puntos locales del Guestbook y no se han migrado
    if (localPoints > 0 && !localStorage.getItem('guestbook-points-migrated')) {
      const currentLabPoints = window.achievementSystem.getPoints();
      
      // Solo migrar si Laboratory tiene menos puntos (evitar duplicar)
      if (currentLabPoints < localPoints) {
        const difference = localPoints - currentLabPoints;
        window.achievementSystem.addPoints(difference);
        console.log(`✅ Migrados ${difference} puntos locales a Laboratory`);
      }
      
      // Marcar como migrado
      localStorage.setItem('guestbook-points-migrated', 'true');
      console.log('✅ Migración de puntos completada');
    }
  }
  
  // Sincronizar logros del Guestbook con Laboratory
  window.syncGuestbookAchievements = function() {
    if (!window.achievementSystem) return;
    
    // Verificar dibujos en el guestbook
    const drawings = JSON.parse(localStorage.getItem('guestbook-drawings') || '[]');
    if (drawings.length >= 1) {
      window.achievementSystem.checkAchievement('guestbook-visitor');
    }
    if (drawings.length >= 10) {
      window.achievementSystem.checkAchievement('guestbook-master');
    }
    
    // Verificar comentarios (si hay sistema de stats)
    if (window.guestbookApp && window.guestbookApp.stats) {
      const stats = window.guestbookApp.stats.getUserStats();
      if (stats.comments >= 5) {
        window.achievementSystem.checkAchievement('comment-king');
      }
      if (stats.likes >= 20) {
        window.achievementSystem.checkAchievement('like-master');
      }
    }
  };
  
  // Recompensar actividad del Guestbook con puntos de Laboratory
  window.rewardGuestbookActivity = function(activity, amount) {
    if (!window.achievementSystem) return;
    
    const rewards = {
      'draw': { points: 10, achievement: null },
      'comment': { points: 5, achievement: null },
      'like': { points: 2, achievement: null },
      'visit': { points: 15, achievement: 'guestbook-visitor' },
      'master': { points: 100, achievement: 'guestbook-master' }
    };
    
    const reward = rewards[activity];
    if (reward) {
      window.achievementSystem.addPoints(reward.points);
      if (reward.achievement) {
        window.achievementSystem.checkAchievement(reward.achievement);
      }
    }
  };
  
})();
