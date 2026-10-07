// themes.js - Sistema de temas minimalista 2026

function setTheme(theme) {
  const body = document.body;
  const themes = [
    'light-theme', 'neon-theme', 'cyberpunk-theme', 'matrix-theme', 
    'synthwave-theme', 'ocean-theme', 'forest-theme', 'sunset-theme', 
    'christmas-theme', 'halloween-theme', 'valentine-theme', 'easter-theme', 
    'summer-theme', 'autumn-theme', 'funkyatlas-theme', 'funkyatlas-christmas-theme', 
    'galaxy-theme', 'gold-theme', 'rainbow-theme', 'diamond-theme', 
    'custom-theme', 'vaporwave-theme', 'hacker-theme', 'neon-city-theme', 
    'space-theme', 'fire-theme', 'ice-theme', 'toxic-theme', 
    'royal-theme', 'steampunk-theme', 'hologram-theme', 'legendary-theme', 
    'plushie-rain-theme', 'valentines-love-theme', 'pastel-kawaii-theme'
  ];
  
  themes.forEach(t => body.classList.remove(t));
  
  if (theme !== 'dark') {
    body.classList.add(theme + '-theme');
  }
  
  // Integración con sistema de logros (si existe)
  if (window.achievementSystem) {
    achievementSystem.gameData.themesUsed = achievementSystem.gameData.themesUsed || new Set();
    achievementSystem.gameData.themesUsed.add(theme);
    achievementSystem.gameData.themeChangeCount = (achievementSystem.gameData.themeChangeCount || 0) + 1;
    achievementSystem.save();
    
    // Verificar logros de temas
    if (achievementSystem.gameData.themesUsed.size === 1 && !achievementSystem.gameData.achievements['theme-explorer']) {
      achievementSystem.checkAchievement('theme-explorer'); // Primer cambio de tema
    }
    
    if (achievementSystem.gameData.themesUsed.size >= 5 && !achievementSystem.gameData.achievements['theme-collector']) {
      achievementSystem.checkAchievement('theme-collector'); // 5 temas diferentes
    }
    
    if (theme === 'funkyatlas' && !achievementSystem.gameData.achievements['funky-fan']) {
      achievementSystem.checkAchievement('funky-fan'); // Fan de FunkyAtlas
    }
    
    if (achievementSystem.gameData.themeChangeCount >= 20 && !achievementSystem.gameData.achievements['theme-addict']) {
      achievementSystem.checkAchievement('theme-addict'); // 20 cambios de tema
    }
  }
  
  // Efectos especiales
  if (theme === 'christmas' || theme === 'funkyatlas-christmas') {
    createSnowflakes();
  } else {
    removeSnowflakes();
  }
  
  // Marcar tema activo en el panel (si existe)
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
    snowflake.style.cssText = `
      position: fixed;
      top: -10px;
      left: ${Math.random() * 100}%;
      color: white;
      font-size: ${Math.random() * 1 + 0.5}em;
      opacity: ${Math.random() * 0.6 + 0.4};
      animation: snowflakeFall ${Math.random() * 4 + 6}s linear infinite;
      animation-delay: ${Math.random() * 5}s;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(snowflake);
  }
  
  // Agregar estilo de animación si no existe
  if (!document.getElementById('snowflake-style')) {
    const style = document.createElement('style');
    style.id = 'snowflake-style';
    style.textContent = `
      @keyframes snowflakeFall {
        0% { transform: translateY(-10px) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

function removeSnowflakes() {
  document.querySelectorAll('.snowflake').forEach(snowflake => snowflake.remove());
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
}

function toggleThemePanel() {
  const panel = document.getElementById('theme-panel');
  if (panel) {
    panel.classList.toggle('show');
  }
}

// Exponer funciones globales
window.setTheme = setTheme;
window.loadTheme = loadTheme;
