// Main.js - Versión minimalista 2026
(function() {
  'use strict';

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // Manejo de errores global
  window.addEventListener('error', function(e) {
    if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'LINK')) {
      return true;
    }
    if (e.filename && !e.filename.includes('extension')) {
      console.error('Error:', e.error?.message || e.message);
    }
    return true;
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    if (!e.reason?.message?.includes('extension')) {
      console.error('Promise rechazada:', e.reason);
    }
    e.preventDefault();
  });

  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 FenixLaboratory inicializando...');
    
    updateCurrentYear();
    initializeSystems();
    setupNavigation();
    
    console.log('✅ FenixLaboratory listo');
  });

  function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  function initializeSystems() {
    // Cargar versión
    loadVersionNumber();
    
    // Sistema de logros (si existe)
    if (window.AchievementSystem) {
      try {
        window.achievementSystem = new AchievementSystem('fenix-lab-game');
        window.achievements = achievementSystem.achievements;
        window.gameData = achievementSystem.gameData;
        
        window.addEventListener('achievement-unlocked', (e) => {
          showAchievementNotification(e.detail);
          updatePointsDisplay();
        });
        
        achievementSystem.load();
        achievementSystem.checkDailyVisit();
        updatePointsDisplay();
        
        console.log('✅ Sistema de logros inicializado. Puntos:', window.gameData.points);
      } catch (error) {
        console.error('❌ Error inicializando logros:', error);
        // Crear gameData básico sin achievements
        window.gameData = {
          points: 0,
          unlockedThemes: new Set(['dark', 'light']),
          achievements: {},
          streak: 0,
          level: 1
        };
        updatePointsDisplay();
      }
    } else {
      console.warn('⚠️ AchievementSystem no encontrado, usando datos básicos');
      // Crear gameData básico
      window.gameData = {
        points: 0,
        unlockedThemes: new Set(['dark', 'light']),
        achievements: {},
        streak: 0,
        level: 1
      };
      updatePointsDisplay();
    }
    
    // Cargar tema
    if (window.loadTheme) {
      loadTheme();
    }
    
    // Esperar sincronización de Firebase y actualizar puntos
    if (window.firebasePoints) {
      setTimeout(async () => {
        try {
          const firebasePoints = await window.firebasePoints.syncPointsSafe();
          if (firebasePoints > 0 && window.gameData) {
            console.log('🔄 Actualizando puntos desde Firebase:', firebasePoints);
            window.gameData.points = firebasePoints;
            if (window.achievementSystem) {
              window.achievementSystem.gameData.points = firebasePoints;
              window.achievementSystem.save();
            }
            updatePointsDisplay();
          }
        } catch (error) {
          console.error('❌ Error sincronizando puntos:', error);
        }
      }, 2500); // Esperar a que Firebase termine de sincronizar
    }
    
    // Delegación de eventos para cards de temas
    document.addEventListener('click', (e) => {
      const themeCard = e.target.closest('.theme-card');
      if (themeCard && themeCard.dataset.theme) {
        const themeName = themeCard.dataset.theme;
        
        // Verificar si está desbloqueado (si existe sistema de logros)
        if (themeCard.classList.contains('locked') && window.achievementSystem) {
          const cost = parseInt(themeCard.dataset.cost);
          if (window.gameData.points >= cost) {
            if (confirm(`¿Desbloquear tema por ${cost} puntos?`)) {
              window.gameData.points -= cost;
              window.gameData.unlockedThemes = window.gameData.unlockedThemes || new Set();
              window.gameData.unlockedThemes.add(themeName);
              window.achievementSystem.save();
              themeCard.classList.remove('locked');
              window.setTheme(themeName);
              window.updatePointsDisplay();
              window.loadThemesGrid(); // Recargar grid
              
              // Sincronizar con Firebase
              if (window.firebaseThemes) {
                const themesArray = Array.from(window.gameData.unlockedThemes);
                window.firebaseThemes.syncUnlockedThemes(themesArray);
                console.log('✅ Tema desbloqueado y sincronizado con Firebase:', themeName);
              }
              
              // Actualizar puntos en Firebase
              if (window.firebasePoints) {
                window.firebasePoints.updatePoints(window.gameData.points);
              }
            }
          } else {
            alert(`Necesitas ${cost} puntos. Tienes ${window.gameData.points}`);
          }
        } else {
          window.setTheme(themeName);
        }
      }
    });
    
    // Cargar repositorios después
    setTimeout(() => {
      if (window.fetchRepos) {
        fetchRepos();
      }
    }, 100);
  }

  function setupNavigation() {
    // Navegación suave
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        const targetId = link.getAttribute('href').substring(1);
        if (targetId && targetId.length > 0) {
          e.preventDefault();
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
    
    // Botón scroll to top
    const btnTop = document.getElementById('btn-top');
    if (btnTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          btnTop.classList.add('visible');
        } else {
          btnTop.classList.remove('visible');
        }
      });
      
      btnTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    // Botón de temas
    const themeBtn = document.getElementById('theme-btn');
    const themePanel = document.getElementById('theme-panel');
    const closeThemePanel = document.getElementById('close-theme-panel');
    const themeOverlay = document.getElementById('theme-overlay');
    
    if (themeBtn && themePanel) {
      themeBtn.addEventListener('click', () => {
        themePanel.classList.add('show');
        if (themeOverlay) themeOverlay.classList.add('show');
        if (window.loadThemesGrid) loadThemesGrid();
      });
      
      if (closeThemePanel) {
        closeThemePanel.addEventListener('click', () => {
          themePanel.classList.remove('show');
          if (themeOverlay) themeOverlay.classList.remove('show');
        });
      }
      
      if (themeOverlay) {
        themeOverlay.addEventListener('click', () => {
          themePanel.classList.remove('show');
          themeOverlay.classList.remove('show');
        });
      }
    }
    
    // Botón de logros
    const achievementsBtn = document.getElementById('achievements-btn-nav');
    const achievementsPanel = document.getElementById('achievements-panel');
    const closeAchievementsPanel = document.getElementById('close-achievements-panel');
    
    if (achievementsBtn && achievementsPanel) {
      achievementsBtn.addEventListener('click', () => {
        achievementsPanel.classList.add('show');
        if (themeOverlay) themeOverlay.classList.add('show');
        if (window.loadAchievementsPanel) loadAchievementsPanel();
      });
      
      if (closeAchievementsPanel) {
        closeAchievementsPanel.addEventListener('click', () => {
          achievementsPanel.classList.remove('show');
          if (themeOverlay) themeOverlay.classList.remove('show');
        });
      }
      
      if (themeOverlay) {
        themeOverlay.addEventListener('click', () => {
          achievementsPanel.classList.remove('show');
          themePanel.classList.remove('show');
          themeOverlay.classList.remove('show');
        });
      }
    }
  }

  async function loadVersionNumber() {
    try {
      const response = await fetch('Assets/json/updates.json');
      const data = await response.json();
      
      const versionSpan = document.getElementById('version-number');
      if (versionSpan) {
        versionSpan.textContent = 'v' + data.version;
      }
      
      const footerVersion = document.getElementById('footer-version');
      if (footerVersion) {
        footerVersion.textContent = 'v' + data.version;
      }
      
      document.title = `🔬 FenixLaboratory v${data.version}`;
    } catch (error) {
      console.warn('Error cargando versión:', error);
    }
  }

  // Funciones globales necesarias
  window.updatePointsDisplay = function() {
    if (!window.gameData) {
      console.warn('⚠️ gameData no disponible');
      return;
    }
    
    console.log('🔄 Actualizando displays de puntos:', window.gameData.points);
    
    const pointsDisplay = document.getElementById('points-display');
    if (pointsDisplay) pointsDisplay.textContent = window.gameData.points;
    
    const pointsNav = document.getElementById('points-nav');
    if (pointsNav) {
      pointsNav.textContent = window.gameData.points;
      console.log('✅ Puntos actualizados en navbar:', window.gameData.points);
    }
    
    const totalPoints = document.getElementById('total-points');
    if (totalPoints) totalPoints.textContent = window.gameData.points;
    
    const themePointsDisplay = document.getElementById('theme-points-display');
    if (themePointsDisplay) themePointsDisplay.textContent = window.gameData.points;
    
    const streakDisplay = document.getElementById('streak-display');
    if (streakDisplay) streakDisplay.textContent = window.gameData.streak;
    
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) levelDisplay.textContent = window.gameData.level;
  };

  window.showAchievementNotification = function(achievement) {
    console.log('🏆', achievement.name, `+${achievement.points} pts`);
    // Podrías agregar una notificación visual aquí si quieres
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

  window.saveGameData = function() {
    if (window.achievementSystem) {
      achievementSystem.save();
    }
  };

  window.loadThemesGrid = function() {
    const container = document.getElementById('themes-container');
    if (!container) return;
    
    // Lista COMPLETA de todos los temas disponibles en CSS
    const themes = [
      // Gratis
      { id: 'dark', name: '🌑 Dark', color: '#1a1a1a', free: true },
      { id: 'light', name: '☀️ Light', color: '#f8fafc', free: true },
      
      // Básicos (50-100)
      { id: 'neon', name: '💠 Neon', color: '#00ff41', cost: 50 },
      { id: 'ocean', name: '🌊 Ocean', color: '#0f3460', cost: 75 },
      { id: 'forest', name: '🌲 Forest', color: '#1a3d2e', cost: 75 },
      { id: 'sunset', name: '🌅 Sunset', color: '#7c2d12', cost: 100 },
      { id: 'cyberpunk', name: '🌆 Cyberpunk', color: '#ff0080', cost: 100 },
      
      // Temporadas (100)
      { id: 'christmas', name: '🎄 Christmas', color: '#dc2626', cost: 100 },
      { id: 'halloween', name: '🎃 Halloween', color: '#f97316', cost: 100 },
      { id: 'valentine', name: '💝 Valentine', color: '#ec4899', cost: 100 },
      { id: 'easter', name: '🐰 Easter', color: '#a855f7', cost: 100 },
      { id: 'summer', name: '☀️ Summer', color: '#06b6d4', cost: 100 },
      { id: 'autumn', name: '🍂 Autumn', color: '#ea580c', cost: 100 },
      
      // Premium (150-200)
      { id: 'matrix', name: '💚 Matrix', color: '#00ff00', cost: 150 },
      { id: 'vaporwave', name: '🌴 Vaporwave', color: '#ff006e', cost: 150 },
      { id: 'synthwave', name: '🌸 Synthwave', color: '#ff6b9d', cost: 200 },
      { id: 'galaxy', name: '🌌 Galaxy', color: '#7c3aed', cost: 200 },
      { id: 'space', name: '🚀 Space', color: '#6666ff', cost: 200 },
      
      // Avanzados (200-300)
      { id: 'hacker', name: '💻 Hacker', color: '#00ff00', cost: 200 },
      { id: 'neon-city', name: '🏙️ Neon City', color: '#ff8000', cost: 200 },
      { id: 'fire', name: '🔥 Fire', color: '#ff4500', cost: 250 },
      { id: 'ice', name: '❄️ Ice', color: '#4682b4', cost: 250 },
      { id: 'toxic', name: '☢️ Toxic', color: '#32cd32', cost: 250 },
      { id: 'royal', name: '👑 Royal', color: '#9932cc', cost: 300 },
      { id: 'steampunk', name: '⚙️ Steampunk', color: '#b8860b', cost: 300 },
      { id: 'hologram', name: '✨ Hologram', color: '#00ffff', cost: 300 },
      { id: 'gold', name: '✨ Gold', color: '#f59e0b', cost: 300 },
      
      // Especiales (400-500)
      { id: 'funkyatlas', name: '🎮 FunkyAtlas', color: '#ff4444', cost: 400 },
      { id: 'funkyatlas-christmas', name: '🎄 FunkyAtlas Xmas', color: '#dc2626', cost: 400 },
      { id: 'diamond', name: '💎 Diamond', color: '#f8fafc', cost: 400 },
      { id: 'rainbow', name: '🌈 Rainbow', color: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)', cost: 500 },
      { id: 'legendary', name: '🏆 Legendary', color: 'linear-gradient(45deg, #ffd700, #ffff00, #ff8c00)', cost: 500 },
      
      // Ultra Premium (600-1000)
      { id: 'plushie-rain', name: '🧸 Plushie Rain', color: '#ff0000', cost: 600 },
      { id: 'valentines-love', name: '💖 Valentine Love', color: '#ff1493', cost: 600 },
      { id: 'cyberpunk2077', name: '🤖 Cyberpunk 2077', color: '#ffff00', cost: 750 },
      { id: 'retro-synthwave', name: '🎹 Retro Synthwave', color: '#ff0080', cost: 750 },
      { id: 'glassmorphism', name: '🔮 Glassmorphism', color: '#00d4ff', cost: 800 },
      { id: 'terminal-hacker', name: '⌨️ Terminal', color: '#00ff00', cost: 800 },
      { id: 'pastel-kawaii', name: '🌸 Pastel Kawaii', color: '#ec4899', cost: 1000 },
      
      // Custom
      { id: 'custom', name: '🎨 Custom', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', cost: 2000 }
    ];
    
    container.innerHTML = '<div class="theme-grid">' + themes.map(theme => {
      const isUnlocked = theme.free || (window.gameData && window.gameData.unlockedThemes && window.gameData.unlockedThemes.has(theme.id));
      const isActive = localStorage.getItem('theme') === theme.id;
      
      return `
        <div class="theme-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}" 
             data-theme="${theme.id}" 
             data-cost="${theme.cost || 0}">
          <div class="theme-preview" style="background: ${theme.color};"></div>
          <div class="theme-info">
            <div class="theme-name">${theme.name}</div>
            ${!isUnlocked ? `<div class="theme-cost">🪙 ${theme.cost}</div>` : ''}
            ${isActive ? '<div style="color: var(--primary); font-size: 0.7rem; margin-top: 0.25rem;">Activo</div>' : ''}
          </div>
        </div>
      `;
    }).join('') + '</div>';
  };

  window.loadAchievements = function() {
    console.log('🏆 Cargando logros...');
    console.log('  achievements:', window.achievements);
    console.log('  gameData:', window.gameData);
    
    const list = document.getElementById('achievements-list');
    if (!list) {
      console.error('❌ No se encontró el elemento achievements-list');
      return;
    }
    
    if (!window.achievements) {
      console.warn('⚠️ No hay achievements disponibles');
      list.innerHTML = '<p class="text-center">No hay logros disponibles</p>';
      return;
    }
    
    const achievementArray = Object.values(window.achievements);
    console.log('  Total logros:', achievementArray.length);
    
    if (achievementArray.length === 0) {
      list.innerHTML = '<p class="text-center">No hay logros configurados</p>';
      return;
    }
    
    list.innerHTML = '<div class="row g-3">' + achievementArray.map(ach => {
      const isUnlocked = window.gameData && window.gameData.achievements && window.gameData.achievements[ach.id];
      
      return `
        <div class="col-md-4 col-6">
          <div class="card" style="padding: 1rem; text-align: center; opacity: ${isUnlocked ? '1' : '0.5'}; background: var(--bg-light); border: 1px solid ${isUnlocked ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${ach.icon}</div>
            <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--text-primary);">${ach.name}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${ach.description}</div>
            <div style="margin-top: 0.5rem; color: var(--primary); font-weight: 700;">+${ach.points} pts</div>
            ${isUnlocked ? '<div style="color: var(--primary); font-size: 0.8rem; margin-top: 0.25rem;">✓ Desbloqueado</div>' : ''}
          </div>
        </div>
      `;
    }).join('') + '</div>';
    
    console.log('✅ Logros cargados');
  };

  window.loadAchievementsPanel = function() {
    console.log('🏆 Cargando panel de logros...');
    
    if (!window.achievements || !window.gameData) {
      console.warn('⚠️ No hay datos disponibles');
      return;
    }
    
    // Actualizar stats
    const pointsDisplay = document.getElementById('achievements-points-display');
    if (pointsDisplay) pointsDisplay.textContent = window.gameData.points;
    
    const levelDisplay = document.getElementById('panel-level');
    if (levelDisplay) levelDisplay.textContent = window.gameData.level;
    
    const streakDisplay = document.getElementById('panel-streak');
    if (streakDisplay) streakDisplay.textContent = window.gameData.streak;
    
    // Contar logros desbloqueados
    const unlockedCount = Object.keys(window.gameData.achievements || {}).length;
    const totalCount = Object.keys(window.achievements).length;
    const unlockedDisplay = document.getElementById('panel-unlocked');
    if (unlockedDisplay) unlockedDisplay.textContent = `${unlockedCount}/${totalCount}`;
    
    // Cargar logros en el contenedor
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    const achievementArray = Object.values(window.achievements);
    
    container.innerHTML = '<div class="achievements-grid">' + achievementArray.map(ach => {
      const isUnlocked = window.gameData.achievements && window.gameData.achievements[ach.id];
      
      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${ach.icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.description}</div>
            <div class="achievement-points">+${ach.points} pts</div>
          </div>
          ${isUnlocked ? '<div class="achievement-badge">✓</div>' : ''}
        </div>
      `;
    }).join('') + '</div>';
    
    console.log('✅ Panel de logros cargado');
  };

})();
