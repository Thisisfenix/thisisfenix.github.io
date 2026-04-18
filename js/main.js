// Main.js - Inicialización principal y manejo de errores
(function() {
  'use strict';

  // Configuración global
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // Manejo de errores global optimizado
  window.addEventListener('error', function(e) {
    // Ignorar errores de imágenes 404
    if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'LINK')) {
      return true;
    }
    if (e.filename && !e.filename.includes('extension')) {
      console.error('Error:', e.error?.message || e.message);
      if (isMobile) {
        alert(`❌ Error: ${e.error?.message || e.message}\nArchivo: ${e.filename}\nLínea: ${e.lineno}`);
      }
    }
    return true;
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    if (!e.reason?.message?.includes('extension')) {
      console.error('Promise rechazada:', e.reason);
      if (isMobile) {
        alert(`❌ Promise Error: ${e.reason}`);
      }
    }
    e.preventDefault();
  });

  // Inicialización cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 FenixLaboratory inicializando...');
    
    // Verificar elementos requeridos
    const requiredElements = [
      'main-content', 'credits-section', 'updates-section',
      'theme-panel', 'nerd-panel', 'achievements-section'
    ];
    
    requiredElements.forEach(id => {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`⚠️ Elemento requerido no encontrado: ${id}`);
      }
    });

    // Inicializar sistemas en orden de prioridad
    initializeCriticalSystems();
    
    // Diferir sistemas no críticos
    setTimeout(() => {
      initializeNonCriticalSystems();
    }, 100);

    // Configurar listeners de navegación
    setupNavigationListeners();

    console.log('✅ FenixLaboratory inicializado correctamente');
  });

  // Sistemas críticos (cargan inmediatamente)
  function initializeCriticalSystems() {
    // Cargar versión
    loadVersionNumber();
    
    // Sistema de logros
    if (window.AchievementSystem) {
      window.achievementSystem = new AchievementSystem('fenix-lab-game');
      window.achievements = achievementSystem.achievements;
      window.dailyChallenges = achievementSystem.dailyChallenges;
      window.weeklyChallenges = achievementSystem.weeklyChallenges;
      window.premiumThemes = achievementSystem.premiumThemes;
      window.cursors = achievementSystem.cursors;
      window.premiumEffects = achievementSystem.premiumEffects;
      
      // gameData como getter (solo si no existe)
      if (!Object.getOwnPropertyDescriptor(window, 'gameData')) {
        Object.defineProperty(window, 'gameData', {
          get: () => achievementSystem.gameData,
          configurable: true
        });
      }

      // Listener para notificaciones de logros
      window.addEventListener('achievement-unlocked', (e) => {
        showAchievementNotification(e.detail);
        updatePointsDisplay();
      });

      // Cargar datos del juego
      loadGameData();
      checkDailyVisit();
    }

    // Cargar tema
    if (window.loadTheme) {
      loadTheme();
    }
  }

  // Sistemas no críticos (cargan después)
  function initializeNonCriticalSystems() {
    // Cargar repositorios
    if (window.fetchRepos) {
      fetchRepos();
    }

    // Inicializar PWA
    if ('serviceWorker' in navigator) {
      initCompletePWA();
    }

    // Verificar actualizaciones
    checkForUpdates();
  }

  // Configurar listeners de navegación
  function setupNavigationListeners() {
    // Fix para navegación suave
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        const targetId = link.getAttribute('href').substring(1);
        if (targetId && targetId.length > 0) {
          e.preventDefault();
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            Utils.safeScrollIntoView(targetId);
          } else {
            console.warn(`Elemento con ID '${targetId}' no encontrado`);
          }
        }
      }
    });
  }

  // Funciones globales necesarias
  window.loadGameData = function() {
    if (!window.achievementSystem) return;
    
    achievementSystem.load();
    
    // Fix: Migración de datos para usuarios existentes
    if (!gameData.specialEvents || typeof gameData.specialEvents !== 'object') {
      gameData.specialEvents = {
        'double-points': { active: false, endTime: null, multiplier: 2 },
        'theme-festival': { active: false, endTime: null, discount: 50 },
        'streak-boost': { active: false, endTime: null, bonus: 10 }
      };
      saveGameData();
    }
    
    // Configurar listener para notificaciones del guestbook
    setupGuestbookListener();
    
    updatePointsDisplay();
    if (window.updateCursorShop) updateCursorShop();
  };

  window.saveGameData = function() {
    if (window.achievementSystem) {
      achievementSystem.save();
    }
  };

  window.addPoints = function(points) {
    if (window.achievementSystem) {
      achievementSystem.addPoints(points);
      updatePointsDisplay();
    }
  };

  window.checkAchievement = function(id) {
    if (window.achievementSystem) {
      achievementSystem.checkAchievement(id);
    }
  };

  window.checkDailyVisit = function() {
    if (window.achievementSystem) {
      achievementSystem.checkDailyVisit();
      updatePointsDisplay();
    }
  };

  window.updateChallenge = function(id, increment) {
    if (window.achievementSystem) {
      achievementSystem.updateChallenge(id, increment);
    }
  };

  window.updateWeeklyChallenge = function(id, increment) {
    if (window.achievementSystem) {
      achievementSystem.updateWeeklyChallenge(id, increment);
    }
  };

  window.updateBadgeProgress = function(badgeId, progress) {
    if (window.achievementSystem) {
      achievementSystem.updateBadgeProgress(badgeId, progress);
    }
  };

  window.showAchievementNotification = function(achievement) {
    const notification = document.getElementById('achievement-notification');
    if (!notification) return;
    
    document.getElementById('notification-text').textContent = `${achievement.name} (+${achievement.points} pts)`;
    notification.classList.add('show');
    
    if (notification.hideTimeout) clearTimeout(notification.hideTimeout);
    notification.hideTimeout = setTimeout(() => notification.classList.remove('show'), 3000);
  };

  window.updatePointsDisplay = function() {
    if (!window.gameData) return;
    
    const pointsDisplay = document.getElementById('points-display');
    if (pointsDisplay) pointsDisplay.textContent = gameData.points;
    
    const totalPoints = document.getElementById('total-points');
    if (totalPoints) totalPoints.textContent = gameData.points;
    
    const streakDisplay = document.getElementById('streak-display');
    if (streakDisplay) streakDisplay.textContent = gameData.streak;
    
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) levelDisplay.textContent = gameData.level;
    
    updateStreakDisplay();
    updateTitle();
  };

  window.updateStreakDisplay = function() {
    if (!window.gameData) return;
    
    const indicator = document.getElementById('streak-indicator');
    if (!indicator) return;
    
    if (gameData.streak > 0) {
      indicator.textContent = `🔥${gameData.streak}`;
      if (gameData.streak >= 7) indicator.classList.add('streak-fire');
    } else {
      indicator.textContent = '';
      indicator.classList.remove('streak-fire');
    }
  };

  window.updateTitle = function() {
    if (!window.achievementSystem) return;
    
    const titleDisplay = document.getElementById('user-title');
    if (titleDisplay) {
      const title = achievementSystem.getTitle();
      titleDisplay.textContent = title;
    }
  };

  // Configurar listener para comunicación con el guestbook
  function setupGuestbookListener() {
    // Listener para BroadcastChannel
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel('fenix-achievements');
      channel.addEventListener('message', (event) => {
        handleGuestbookNotification(event.data);
      });
    }
    
    // Verificar notificaciones pendientes
    checkPendingGuestbookNotifications();
    
    // Verificar periódicamente
    setInterval(checkPendingGuestbookNotifications, 5000);
  }

  function handleGuestbookNotification(data) {
    if (data.source !== 'guestbook') return;
    
    console.log('📨 Notificación recibida del guestbook:', data);
    
    switch (data.action) {
      case 'guestbook-visit':
        if (window.achievementSystem) achievementSystem.markGuestbookVisit();
        break;
      case 'drawing-created':
        if (window.achievementSystem) achievementSystem.updateGuestbookStats(1, 0, 0);
        addPoints(10);
        showAchievementNotification({ name: '🎨 Dibujo creado en el guestbook!', points: 10 });
        break;
      case 'comment-posted':
        if (window.achievementSystem) achievementSystem.updateGuestbookStats(0, 1, 0);
        addPoints(5);
        showAchievementNotification({ name: '💬 Comentario en el guestbook!', points: 5 });
        break;
      case 'like-given':
        if (window.achievementSystem) achievementSystem.updateGuestbookStats(0, 0, 1);
        addPoints(2);
        showAchievementNotification({ name: '❤️ Like dado en el guestbook!', points: 2 });
        break;
      case 'profile-updated':
        localStorage.setItem('guestbook-has-profile', 'true');
        checkAchievement('social-butterfly');
        break;
    }
    
    updatePointsDisplay();
  }

  function checkPendingGuestbookNotifications() {
    try {
      const notifications = JSON.parse(localStorage.getItem('guestbook-notifications') || '[]');
      const processedIds = JSON.parse(localStorage.getItem('processed-guestbook-notifications') || '[]');
      
      notifications.forEach(notification => {
        const notificationId = `${notification.action}-${notification.timestamp}`;
        if (!processedIds.includes(notificationId)) {
          handleGuestbookNotification(notification);
          processedIds.push(notificationId);
        }
      });
      
      // Mantener solo los últimos 100 IDs procesados
      if (processedIds.length > 100) {
        processedIds.splice(0, processedIds.length - 100);
      }
      
      localStorage.setItem('processed-guestbook-notifications', JSON.stringify(processedIds));
    } catch (error) {
      console.warn('Error checking guestbook notifications:', error);
    }
  }

  // PWA Completa
  function initCompletePWA() {
    console.log('📱 PWA Completa inicializada');
    
    // Detectar modo standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.body.classList.add('pwa-standalone');
      checkAchievement('pwa-user');
    }
    
    // Manejar cambios de conectividad
    window.addEventListener('online', () => {
      showAchievementNotification({ name: '🌐 Conexión restaurada', points: 0 });
    });
    
    window.addEventListener('offline', () => {
      showAchievementNotification({ name: '🚫 Modo offline activado', points: 0 });
    });
    
    // Prevenir zoom en PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) e.preventDefault();
      }, { passive: false });
    }
  }

  // Verificar actualizaciones
  function checkForUpdates() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
    }
  }
  
  // Cargar número de versión (solo una vez)
  let versionLoaded = false;
  async function loadVersionNumber() {
    if (versionLoaded) return; // Evitar cargas múltiples
    
    try {
      const response = await fetch('json/updates.json');
      const data = await response.json();
      const versionSpan = document.getElementById('version-number');
      if (versionSpan) {
        versionSpan.textContent = 'v' + data.version;
      }
      
      // Establecer título una sola vez
      const newTitle = `🔬 FenixLaboratory v${data.version} - Experimentos y Proyectos`;
      if (document.title !== newTitle) {
        document.title = newTitle;
        console.log('✅ Título establecido:', newTitle);
      }
      
      versionLoaded = true;
    } catch (error) {
      console.warn('Error cargando versión:', error);
    }
  }

  // Exponer funciones necesarias globalmente
  window.showAchievements = async function() {
    try {
      if (window.uiManager) {
        window.uiManager.hideAllSections();
        const achievementsSection = document.getElementById('achievements-section');
        if (achievementsSection) {
          achievementsSection.classList.add('active');
          achievementsSection.style.display = 'block';
        }
      }
      
      // Actualizar todos los displays
      if (window.updatePointsDisplay) updatePointsDisplay();
      if (window.updateDailyChallengesDisplay) updateDailyChallengesDisplay();
      if (window.updateWeeklyChallengesDisplay) updateWeeklyChallengesDisplay();
      if (window.updateBadgesDisplay) updateBadgesDisplay();
      if (window.updateSpecialEventsDisplay) updateSpecialEventsDisplay();
      if (window.setupAchievements) setupAchievements();
      
      // Actualizar badges de eventos especiales
      if (window.plushieSystem) plushieSystem.updateEventBadge();
      if (window.cupidGame) cupidGame.updateBadge();
      
      // Mostrar vista de logros por defecto
      if (window.toggleAchievementsView) toggleAchievementsView('achievements');
      
      // Actualizar leaderboard
      if (window.updateLeaderboardDisplay) await updateLeaderboardDisplay();
      
    } catch (error) {
      console.error('Error mostrando logros:', error);
    }
  };

  window.toggleAchievementsView = function(view) {
    const achievementsView = document.getElementById('achievements-view');
    const leaderboardView = document.getElementById('leaderboard-view');
    const btnAchievements = document.getElementById('btn-view-achievements');
    const btnLeaderboard = document.getElementById('btn-view-leaderboard');
    
    if (view === 'achievements') {
      if (achievementsView) achievementsView.style.display = 'block';
      if (leaderboardView) leaderboardView.style.display = 'none';
      if (btnAchievements) {
        btnAchievements.style.background = 'var(--primary)';
        btnAchievements.style.color = 'white';
      }
      if (btnLeaderboard) {
        btnLeaderboard.style.background = '';
        btnLeaderboard.style.color = '';
      }
    } else {
      if (achievementsView) achievementsView.style.display = 'none';
      if (leaderboardView) leaderboardView.style.display = 'block';
      if (btnLeaderboard) {
        btnLeaderboard.style.background = 'var(--primary)';
        btnLeaderboard.style.color = 'white';
      }
      if (btnAchievements) {
        btnAchievements.style.background = '';
        btnAchievements.style.color = '';
      }
    }
  };

})();
