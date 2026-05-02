// themes.js - Sistema de gestión de temas

function setTheme(theme) {
  const body = document.body;
  const themes = ['light-theme', 'neon-theme', 'cyberpunk-theme', 'matrix-theme', 'synthwave-theme', 'ocean-theme', 'forest-theme', 'sunset-theme', 'christmas-theme', 'halloween-theme', 'valentine-theme', 'easter-theme', 'summer-theme', 'autumn-theme', 'funkyatlas-theme', 'funkyatlas-christmas-theme', 'galaxy-theme', 'gold-theme', 'rainbow-theme', 'diamond-theme', 'custom-theme', 'vaporwave-theme', 'hacker-theme', 'neon-city-theme', 'space-theme', 'fire-theme', 'ice-theme', 'toxic-theme', 'royal-theme', 'steampunk-theme', 'hologram-theme', 'legendary-theme', 'plushie-rain-theme', 'valentines-love-theme', 'pastel-kawaii-theme'];
  
  themes.forEach(t => body.classList.remove(t));
  
  if (theme !== 'dark') {
    body.classList.add(theme + '-theme');
  }
  
  // Achievement system integration
  if (window.achievementSystem) {
    // Track theme usage
    achievementSystem.gameData.themesUsed.add(theme);
    achievementSystem.gameData.themeChangeCount++;
    
    // Check theme-related achievements
    if (achievementSystem.gameData.themesUsed.size === 1) {
      achievementSystem.checkAchievement('theme-explorer');
    }
    if (achievementSystem.gameData.themesUsed.size >= 5) {
      achievementSystem.checkAchievement('theme-collector');
    }
    if (theme === 'funkyatlas' || theme === 'funkyatlas-christmas') {
      achievementSystem.checkAchievement('funky-fan');
    }
    if (achievementSystem.gameData.themeChangeCount >= 20) {
      achievementSystem.checkAchievement('theme-addict');
    }
    if (achievementSystem.gameData.unlockedThemes.size >= 15) {
      achievementSystem.checkAchievement('theme-hoarder');
    }
    
    // Hidden achievements
    if (theme === 'matrix') {
      achievementSystem.gameData.hiddenProgress.matrixStartTime = Date.now();
    } else if (achievementSystem.gameData.hiddenProgress.matrixStartTime) {
      const matrixTime = Date.now() - achievementSystem.gameData.hiddenProgress.matrixStartTime;
      achievementSystem.trackMatrixTime(matrixTime);
      delete achievementSystem.gameData.hiddenProgress.matrixStartTime;
    }
    
    // Theme speedrun tracking
    if (!achievementSystem.gameData.hiddenProgress.themeSpeedrunStart) {
      achievementSystem.startThemeSpeedrun();
    }
    achievementSystem.incrementThemeSpeedrun();
    
    // Update challenges
    achievementSystem.updateChallenge('change-theme');
    achievementSystem.updateWeeklyChallenge('theme-explorer');
    
    achievementSystem.save();
  }
  
  if (theme === 'custom') {
    applyCustomTheme();
  }
  
  if (theme === 'christmas' || theme === 'funkyatlas-christmas') {
    createSnowflakes();
  } else {
    removeSnowflakes();
  }
  
  if (theme === 'plushie-rain') {
    createPlushieRain();
  } else {
    removePlushieRain();
  }
  
  if (theme === 'valentines-love') {
    createValentineRain();
  } else {
    removeValentineRain();
  }
  
  if (theme !== 'matrix') {
    removeMatrixRain();
  }
  
  document.querySelectorAll('.theme-card').forEach(card => {
    card.classList.remove('active');
    if (card.dataset.theme === theme) {
      card.classList.add('active');
    }
  });
  
  localStorage.setItem('theme', theme);
}

function createSnowflakes() {
  removeSnowflakes();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const snowflakeCount = isMobile ? 15 : 50;
  const snowflakes = ['❄', '❅', '❆'];
  
  for (let i = 0; i < snowflakeCount; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animation = `snowflakeFall ${Math.random() * 4 + 6}s linear infinite`;
    snowflake.style.animationDelay = Math.random() * 5 + 's';
    snowflake.style.fontSize = (Math.random() * 1 + 0.5) + 'em';
    snowflake.style.opacity = Math.random() * 0.6 + 0.4;
    document.body.appendChild(snowflake);
  }
}

function removeSnowflakes() {
  document.querySelectorAll('.snowflake').forEach(snowflake => snowflake.remove());
}

function createPlushieRain() {
  removePlushieRain();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const plushieCount = isMobile ? 10 : 30;
  
  for (let i = 0; i < plushieCount; i++) {
    const plushie = document.createElement('img');
    plushie.className = 'falling-plushie';
    plushie.src = Math.random() > 0.5 ? 'placeholder/gisselplushie.png' : 'placeholder/molly plushie.png';
    plushie.style.left = Math.random() * 100 + '%';
    plushie.style.animation = `plushieFall ${Math.random() * 4 + 6}s linear infinite`;
    plushie.style.animationDelay = Math.random() * 5 + 's';
    plushie.style.width = (Math.random() * 20 + 30) + 'px';
    plushie.style.height = plushie.style.width;
    document.body.appendChild(plushie);
  }
}

function removeValentineRain() {
  document.querySelectorAll('.falling-valentine').forEach(v => v.remove());
}

function createValentineRain() {
  removeValentineRain();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const valentineCount = isMobile ? 10 : 30;
  
  for (let i = 0; i < valentineCount; i++) {
    const valentine = document.createElement('img');
    valentine.className = 'falling-valentine';
    valentine.src = 'placeholder/AnkushCat.png';
    valentine.style.left = Math.random() * 100 + '%';
    valentine.style.animation = `plushieFall ${Math.random() * 4 + 6}s linear infinite`;
    valentine.style.animationDelay = Math.random() * 5 + 's';
    valentine.style.width = (Math.random() * 20 + 30) + 'px';
    valentine.style.height = valentine.style.width;
    document.body.appendChild(valentine);
  }
}

function removePlushieRain() {
  document.querySelectorAll('.falling-plushie').forEach(plushie => plushie.remove());
}

function removeMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (canvas) canvas.remove();
}

function applyCustomTheme() {
  const colors = achievementSystem.gameData.customColors;
  document.documentElement.style.setProperty('--custom-bg', colors.bg);
  document.documentElement.style.setProperty('--custom-bg-light', colors.bg + '33');
  document.documentElement.style.setProperty('--custom-text', colors.text);
  document.documentElement.style.setProperty('--custom-text-secondary', colors.text + '99');
  document.documentElement.style.setProperty('--custom-primary', colors.primary);
  document.documentElement.style.setProperty('--custom-secondary', colors.secondary);
}

function showCustomColors() {
  document.getElementById('custom-colors').style.display = 'block';
  document.getElementById('bg-color').value = achievementSystem.gameData.customColors.bg;
  document.getElementById('text-color').value = achievementSystem.gameData.customColors.text;
  document.getElementById('primary-color').value = achievementSystem.gameData.customColors.primary;
  document.getElementById('secondary-color').value = achievementSystem.gameData.customColors.secondary;
}

function loadTheme() {
  const seasonalTheme = getSeasonalTheme();
  const savedTheme = localStorage.getItem('theme') || seasonalTheme || 'dark';
  const lastThemeChange = localStorage.getItem('last-theme-change');
  const today = new Date().toDateString();
  
  // Achievement system integration
  if (window.achievementSystem) {
    const autoSeasonalThemes = achievementSystem.gameData.autoSeasonalThemes;
    
    if (seasonalTheme && lastThemeChange !== today && autoSeasonalThemes) {
      setTheme(seasonalTheme);
      showSeasonalNotification(seasonalTheme);
      localStorage.setItem('last-theme-change', today);
    } else {
      setTheme(savedTheme);
    }
  } else {
    if (seasonalTheme && lastThemeChange !== today && gameData?.autoSeasonalThemes) {
      setTheme(seasonalTheme);
      showSeasonalNotification(seasonalTheme);
    } else {
      setTheme(savedTheme);
    }
  }
}

function getSeasonalTheme() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  if (month === 10) return 'halloween';
  if (month === 12) return 'christmas';
  if (month === 2 && day === 14) return 'valentine';
  if (month === 4) return 'easter';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  
  return null;
}

function showSeasonalNotification(theme) {
  const themeNames = {
    'halloween': '🎃 Halloween',
    'christmas': '🎄 Navidad', 
    'valentine': '💕 San Valentín',
    'easter': '🐰 Pascua',
    'summer': '☀️ Verano',
    'autumn': '🍂 Otoño'
  };
  
  const notification = document.getElementById('achievement-notification');
  document.getElementById('notification-text').textContent = `Tema ${themeNames[theme]} activado automáticamente`;
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 4000);
}

function showThemePanel() {
  document.getElementById('theme-overlay').classList.add('show');
  document.getElementById('theme-panel').classList.add('show');
  
  // Actualizar puntos disponibles
  if (window.gameData) {
    const pointsDisplay = document.getElementById('theme-points-display');
    if (pointsDisplay) {
      pointsDisplay.textContent = window.gameData.points || 0;
    }
  }
  
  // Actualizar estado de temas premium cada vez que se abre el panel
  setTimeout(() => {
    updatePremiumThemes();
    updateSeasonalIndicator();
  }, 50);
}

function hideThemePanel() {
  document.getElementById('theme-overlay').classList.remove('show');
  document.getElementById('theme-panel').classList.remove('show');
}

function updatePremiumThemes() {
  if (!window.achievementSystem) return;
  
  // Actualizar UI de todas las tarjetas premium
  document.querySelectorAll('.premium-theme').forEach(card => {
    const theme = card.dataset.theme;
    const isUnlocked = achievementSystem.gameData.unlockedThemes.has(theme);
    
    if (isUnlocked) {
      // Tema desbloqueado
      card.classList.remove('locked');
      card.classList.add('owned');
      
      // Cambiar texto del badge a "Obtenido"
      const badge = card.querySelector('.points-badge');
      if (badge) {
        badge.innerHTML = '✅ Obtenido';
        badge.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
      }
      
      // Remover el overlay de bloqueo si existe
      const lockOverlay = card.querySelector('.lock-overlay');
      if (lockOverlay) {
        lockOverlay.remove();
      }
    } else {
      // Tema bloqueado
      card.classList.add('locked');
      card.classList.remove('owned');
      
      // Restaurar el costo en el badge
      const cost = parseInt(card.dataset.cost) || 0;
      const badge = card.querySelector('.points-badge');
      if (badge) {
        badge.innerHTML = `${cost} pts`;
        badge.style.background = '';
      }
    }
  });
  
  // Actualizar temas de eventos especiales
  const plushieCard = document.querySelector('[data-theme="plushie-rain"]');
  if (plushieCard) {
    const plushieUnlocked = localStorage.getItem('plushie-theme-unlocked') === 'true';
    const badge = plushieCard.querySelector('.points-badge');
    if (badge) {
      badge.innerHTML = plushieUnlocked ? '✅ Obtenido' : 'Evento Exclusivo';
      if (plushieUnlocked) {
        badge.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        plushieCard.classList.remove('locked');
        plushieCard.classList.add('owned');
      }
    }
  }
  
  const valentineCard = document.querySelector('[data-theme="valentines-love"]');
  if (valentineCard) {
    const valentineUnlocked = localStorage.getItem('valentine-theme-unlocked') === 'true';
    const badge = valentineCard.querySelector('.points-badge');
    if (badge) {
      badge.innerHTML = valentineUnlocked ? '✅ Obtenido' : 'Evento Exclusivo';
      if (valentineUnlocked) {
        badge.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        valentineCard.classList.remove('locked');
        valentineCard.classList.add('owned');
      }
    }
  }
}

function updateSeasonalIndicator() {
  const currentSeason = getSeasonalTheme();
  const indicator = document.getElementById('seasonal-indicator');
  
  document.querySelectorAll('.seasonal-theme').forEach(card => {
    card.classList.remove('current-season');
  });
  
  if (currentSeason) {
    const seasonNames = {
      'halloween': '(Activo: Halloween 🎃)',
      'christmas': '(Activo: Navidad 🎄)', 
      'valentine': '(Activo: San Valentín 💕)',
      'easter': '(Activo: Pascua 🐰)',
      'summer': '(Activo: Verano ☀️)',
      'autumn': '(Activo: Otoño 🍂)'
    };
    
    indicator.textContent = seasonNames[currentSeason] || '';
    const currentCard = document.querySelector(`[data-theme="${currentSeason}"]`);
    if (currentCard) {
      currentCard.classList.add('current-season');
    }
  } else {
    indicator.textContent = '';
  }
}

function buyTheme(theme, cost) {
  if (window.achievementSystem) {
    const result = achievementSystem.buyTheme(theme, cost);
    if (result) {
      updatePointsDisplay();
      updatePremiumThemes();
    }
    return result;
  }
  return false;
}

async function buyThemeAsync(theme, cost) {
  if (window.achievementSystem && window.firebasePoints) {
    // Obtener puntos actualizados desde Firebase
    const firebasePoints = await window.firebasePoints.getPoints();
    achievementSystem.gameData.points = firebasePoints;
    
    const result = achievementSystem.buyTheme(theme, cost);
    if (result) {
      updatePointsDisplay();
      updatePremiumThemes();
    }
    return result;
  }
  return false;
}

function applyEditorTheme(preview = false) {
  const bg = document.getElementById('editor-bg').value;
  const bgLight = document.getElementById('editor-bg-light').value;
  const text = document.getElementById('editor-text').value;
  const textSec = document.getElementById('editor-text-sec').value;
  const primary = document.getElementById('editor-primary').value;
  const secondary = document.getElementById('editor-secondary').value;
  const shadows = document.getElementById('editor-shadows').checked;
  const gradients = document.getElementById('editor-gradients').checked;
  const animations = document.getElementById('editor-animations').checked;
  const opacity = document.getElementById('editor-opacity').value;
  const root = document.documentElement;
  root.style.setProperty('--bg-dark', bg);
  root.style.setProperty('--bg-light', bgLight);
  root.style.setProperty('--text-primary', text);
  root.style.setProperty('--text-secondary', textSec);
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--secondary', secondary);
  if (!shadows) root.style.setProperty('--box-shadow', 'none');
  if (!animations) root.style.setProperty('--animation-duration', '0s');
  document.body.style.opacity = opacity;
  if (!preview) {
    gameData.customColors = { bg, bgLight, text, textSec, primary, secondary };
    gameData.editorSettings = { shadows, gradients, animations, opacity };
    setTheme('custom');
    saveGameData();
  }
}

function checkAutoDayNight() {
  if (!gameData.autoDayNight) return;
  
  const hour = new Date().getHours();
  const isDayTime = hour >= 6 && hour < 20;
  const currentTheme = localStorage.getItem('theme') || 'dark';
  
  if (isDayTime && currentTheme === 'dark') {
    setTheme('light');
  } else if (!isDayTime && currentTheme === 'light') {
    setTheme('dark');
  }
}

function initThemeListeners() {
  document.getElementById('theme-panel-btn').addEventListener('click', showThemePanel);
  document.getElementById('close-theme-panel').addEventListener('click', hideThemePanel);
  document.getElementById('theme-overlay').addEventListener('click', hideThemePanel);
  
  document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', async (e) => {
      const clickedCard = e.target.closest('.theme-card');
      if (!clickedCard) return;
      
      const theme = clickedCard.dataset.theme;
      const cost = parseInt(clickedCard.dataset.cost) || 0;
      const isPremium = clickedCard.classList.contains('premium-theme');
      
      // Verificar temas de eventos especiales
      if (theme === 'plushie-rain') {
        const plushieUnlocked = localStorage.getItem('plushie-theme-unlocked') === 'true';
        if (!plushieUnlocked) {
          alert('🧸 Este tema se desbloquea completando el evento de Plushies (40/40 peluches).\n\n📅 Evento: 2 dic 2025 - 1 ene 2026');
          return;
        }
      }
      
      if (theme === 'valentines-love') {
        const valentineUnlocked = localStorage.getItem('valentine-theme-unlocked') === 'true';
        if (!valentineUnlocked) {
          alert('💕 Este tema se desbloquea completando el evento de San Valentín.\n\n📅 Evento: 14 feb 2026');
          return;
        }
      }
      
      // Sincronizar puntos desde Firebase si está disponible
      if (window.firebasePoints && window.achievementSystem) {
        const firebasePoints = await window.firebasePoints.getPoints();
        achievementSystem.gameData.points = firebasePoints;
        updatePointsDisplay();
      }
      
      // Verificar si necesita comprar el tema
      const isUnlocked = window.achievementSystem ? achievementSystem.gameData.unlockedThemes.has(theme) : false;
      
      if (isPremium && !isUnlocked && window.achievementSystem) {
        // Intentar comprar
        if (!achievementSystem.buyTheme(theme, cost)) {
          alert(`Necesitas ${cost} puntos para desbloquear este tema. Tienes ${achievementSystem.gameData.points} puntos.`);
          return;
        }
        
        // Actualizar UI inmediatamente después de la compra
        setTimeout(() => {
          updatePremiumThemes();
          updatePointsDisplay();
        }, 50);
        
        // NO aplicar el tema automáticamente, solo desbloquearlo
        // El usuario puede aplicarlo manualmente si quiere
        hideThemePanel();
        
        // Mostrar notificación de que se desbloqueó
        if (window.achievementSystem) {
          achievementSystem.showNotification({
            name: `Tema ${theme} desbloqueado!`,
            points: 0,
            icon: '🎨'
          });
        }
        
        return; // Salir sin aplicar el tema
      }
      
      // Solo aplicar el tema si ya está desbloqueado o es gratuito
      setTheme(theme);
      hideThemePanel();
      if (theme === 'custom') showCustomColors();
      
      localStorage.setItem('last-theme-change', new Date().toDateString());
      
      achievementSystem.gameData.themesUsed.add(theme);
      achievementSystem.gameData.themeChangeCount++;
      updateChallenge('change-theme');
      updateWeeklyChallenge('theme-explorer');
      updateBadgeProgress('theme-master', 1);
      updateBadgeProgress('customization', 1);
      
      if (achievementSystem.gameData.themesUsed.size === 1) achievementSystem.checkAchievement('theme-explorer');
      if (achievementSystem.gameData.themesUsed.size >= 5) achievementSystem.checkAchievement('theme-collector');
      if (achievementSystem.gameData.themeChangeCount >= 20) achievementSystem.checkAchievement('theme-addict');
      if (theme === 'funkyatlas' || theme === 'funkyatlas-christmas') {
        achievementSystem.checkAchievement('funky-fan');
        const creditsPanel = document.createElement('div');
        creditsPanel.style.cssText = 'position: fixed; bottom: 20px; left: 20px; background: linear-gradient(135deg, rgba(43,16,85,0.95), rgba(117,151,222,0.95)); padding: 1rem; border-radius: 12px; border: 2px solid #ff4444; z-index: 9999; max-width: 250px; backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0,0,0,0.4);';
        creditsPanel.innerHTML = '<div style="color: white; font-size: 0.9rem;"><strong style="color: #ff4444;">🎨 Tema FunkyAtlas</strong><br><span style="font-size: 0.8rem;">Creado por <a href="https://funkyatlas.abelitogamer.com/" target="_blank" style="color: #7597de; text-decoration: none;">AbelitoGamer</a></span></div>';
        document.body.appendChild(creditsPanel);
        setTimeout(() => creditsPanel.remove(), 5000);
      }
      if (theme === 'legendary') {
        achievementSystem.checkAchievement('legendary-hunter');
      }
      
      const allAchievements = Object.keys(achievementSystem.achievements);
      const completedAchievements = allAchievements.filter(id => achievementSystem.gameData.achievements[id]);
      if (completedAchievements.length === allAchievements.length - 1) {
        achievementSystem.checkAchievement('perfectionist');
      }
      
      achievementSystem.save();
    });
  });
  
  const applyCustomBtn = document.getElementById('apply-custom');
  if (applyCustomBtn) {
    applyCustomBtn.addEventListener('click', () => {
      achievementSystem.gameData.customColors.bg = document.getElementById('bg-color').value;
      achievementSystem.gameData.customColors.text = document.getElementById('text-color').value;
      achievementSystem.gameData.customColors.primary = document.getElementById('primary-color').value;
      achievementSystem.gameData.customColors.secondary = document.getElementById('secondary-color').value;
      
      applyCustomTheme();
      achievementSystem.save();
      
      showAchievementNotification({ name: 'Colores personalizados aplicados!', points: 0 });
    });
  }
}

// Inicializar temas premium cuando el DOM esté listo
function initPremiumThemes() {
  // Esperar a que achievementSystem esté disponible
  if (!window.achievementSystem) {
    setTimeout(initPremiumThemes, 100);
    return;
  }
  
  // Cargar temas desde Firebase primero
  if (window.firebaseThemes) {
    window.firebaseThemes.loadThemesFromFirebase().then(() => {
      updatePremiumThemes();
      console.log('✅ Temas premium inicializados desde Firebase');
      console.log('📊 Temas desbloqueados:', Array.from(achievementSystem.gameData.unlockedThemes));
    });
  } else {
    updatePremiumThemes();
    console.log('✅ Temas premium inicializados (solo localStorage)');
    console.log('📊 Temas desbloqueados:', Array.from(achievementSystem.gameData.unlockedThemes));
  }
}

// Función de debug para verificar estado de temas
window.debugThemes = function() {
  if (!window.achievementSystem) {
    console.log('❌ achievementSystem no disponible');
    return;
  }
  
  console.log('=== DEBUG TEMAS ===');
  console.log('💰 Puntos actuales:', achievementSystem.gameData.points);
  console.log('🎨 Temas desbloqueados:', Array.from(achievementSystem.gameData.unlockedThemes));
  
  // Verificar Firebase
  if (window.firebaseThemes) {
    window.firebaseThemes.getUnlockedThemes().then(firebaseThemes => {
      console.log('☁️ Temas en Firebase:', firebaseThemes);
    });
  } else {
    console.log('⚠️ Firebase no disponible');
  }
  
  document.querySelectorAll('.premium-theme').forEach(card => {
    const theme = card.dataset.theme;
    const cost = card.dataset.cost;
    const isUnlocked = achievementSystem.gameData.unlockedThemes.has(theme);
    const hasLocked = card.classList.contains('locked');
    const hasOwned = card.classList.contains('owned');
    
    console.log(`${theme}:`, {
      costo: cost,
      desbloqueado: isUnlocked,
      clasesBloqueado: hasLocked,
      clasesObtenido: hasOwned,
      estado: isUnlocked ? '✅ OK' : '🔒 Bloqueado'
    });
  });
  
  console.log('===================');
}

// Función para forzar sincronización manual
window.syncThemesToFirebase = async function() {
  if (!window.achievementSystem || !window.firebaseThemes) {
    console.log('❌ Sistema no disponible');
    return;
  }
  
  const themes = Array.from(achievementSystem.gameData.unlockedThemes);
  console.log('🔄 Sincronizando temas a Firebase:', themes);
  
  await window.firebaseThemes.syncUnlockedThemes(themes);
  console.log('✅ Sincronización completada');
}

// Función para ver estado de migración
window.checkMigrationStatus = function() {
  if (!window.firebaseThemes) {
    console.log('❌ Firebase no disponible');
    return;
  }
  
  const status = window.firebaseThemes.checkMigrationStatus();
  console.log('=== ESTADO DE MIGRACIÓN ===');
  console.log('📦 Versión:', status.version);
  console.log('💰 Puntos migrados:', status.points ? '✅' : '❌');
  console.log('🎨 Temas migrados:', status.themes ? '✅' : '❌');
  console.log('🏆 Logros migrados:', status.achievements ? '✅' : '❌');
  console.log('===========================');
  
  return status;
}

// Función para resetear migraciones (solo para debug)
window.resetMigrations = function() {
  const confirm = prompt('⚠️ Esto reseteará el estado de migración. Escribe "RESET" para confirmar:');
  if (confirm === 'RESET') {
    localStorage.removeItem('migration-status');
    console.log('✅ Estado de migración reseteado. Recarga la página.');
  } else {
    console.log('❌ Operación cancelada');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPremiumThemes);
} else {
  initPremiumThemes();
}


// Inicializar listeners de temas cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initThemeListeners();
  });
} else {
  initThemeListeners();
}
