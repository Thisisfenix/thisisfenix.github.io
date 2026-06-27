// Achievements Display - Funciones de visualización de logros
(function() {
  'use strict';

  // Actualizar display de desafíos diarios
  window.updateDailyChallengesDisplay = function() {
    const container = document.getElementById('daily-challenges');
    if (!container) return;
    
    const today = new Date().toDateString();
    const todayChallenges = window.gameData.dailyChallenges[today] || {};
    
    let html = '<h5 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 0.9rem;">🎯 Desafíos Diarios</h5>';
    Object.entries(window.dailyChallenges).forEach(([id, challenge]) => {
      const progress = todayChallenges[id] || { completed: false, progress: 0 };
      const isCompleted = progress.completed;
      const progressText = challenge.target ? `${progress.progress}/${challenge.target}` : (isCompleted ? 'Completado' : 'Pendiente');
      
      html += `
        <div class="achievement-item ${isCompleted ? 'unlocked' : ''}" style="margin-bottom: 0.3rem; padding: 0.4rem;">
          <div class="achievement-icon" style="font-size: 0.9rem;">${isCompleted ? '✅' : '🎯'}</div>
          <div class="achievement-info">
            <h4 style="font-size: 0.75rem;">${challenge.desc}</h4>
            <p style="font-size: 0.65rem;">${progressText} - ${challenge.reward} pts</p>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  };

  // Actualizar display de desafíos semanales
  window.updateWeeklyChallengesDisplay = function() {
    const container = document.getElementById('weekly-challenges');
    if (!container) return;
    
    const thisWeek = window.achievementSystem.getWeekString(new Date());
    const weekChallenges = window.gameData.weeklyChallenges[thisWeek] || {};
    
    let html = '<h5 style="color: var(--secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">📅 Desafíos Semanales</h5>';
    Object.entries(window.weeklyChallenges).forEach(([id, challenge]) => {
      const progress = weekChallenges[id] || { completed: false, progress: 0 };
      const isCompleted = progress.completed;
      const progressText = `${progress.progress}/${challenge.target}`;
      
      html += `
        <div class="achievement-item ${isCompleted ? 'unlocked' : ''}" style="margin-bottom: 0.3rem; padding: 0.4rem;">
          <div class="achievement-icon" style="font-size: 0.9rem;">${isCompleted ? '🏆' : '📅'}</div>
          <div class="achievement-info">
            <h4 style="font-size: 0.75rem;">${challenge.desc}</h4>
            <p style="font-size: 0.65rem;">${progressText} - ${challenge.reward} pts</p>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  };

  // Actualizar display de badges
  window.updateBadgesDisplay = function() {
    const container = document.getElementById('badges-display');
    if (!container) return;
    
    let html = '<h5 style="color: var(--primary); margin-bottom: 1rem;">🏅 Badges/Medallas</h5>';
    Object.entries(window.gameData.badges).forEach(([id, badge]) => {
      const progress = Math.min(badge.level, badge.maxLevel);
      const percentage = (progress / badge.maxLevel) * 100;
      const isMaxed = badge.level >= badge.maxLevel;
      
      html += `
        <div class="badge-item ${isMaxed ? 'maxed' : ''}" style="margin-bottom: 1rem; padding: 0.75rem; background: var(--bg-dark); border-radius: 8px; border-left: 3px solid ${isMaxed ? 'var(--primary)' : 'var(--text-secondary)'}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h6 style="margin: 0; color: var(--text-primary); text-transform: capitalize;">${id.replace('-', ' ')}</h6>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">${progress}/${badge.maxLevel}</span>
          </div>
          <div style="background: var(--bg-light); height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: ${isMaxed ? 'var(--primary)' : 'var(--secondary)'}; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
          </div>
          <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.25rem; text-transform: capitalize;">${badge.category}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  };

  // Actualizar display de eventos especiales
  window.updateSpecialEventsDisplay = function() {
    const container = document.getElementById('special-events');
    if (!container) return;
    
    if (!window.gameData.specialEvents || typeof window.gameData.specialEvents !== 'object') {
      window.gameData.specialEvents = {
        'double-points': { active: false, endTime: null, multiplier: 2 },
        'theme-festival': { active: false, endTime: null, discount: 50 },
        'streak-boost': { active: false, endTime: null, bonus: 10 }
      };
      if (window.saveGameData) saveGameData();
    }
    
    const activeEvents = Object.entries(window.gameData.specialEvents).filter(([id, event]) => event && event.active);
    if (activeEvents.length === 0) {
      container.innerHTML = '';
      return;
    }
    
    let html = '<h5 style="color: var(--primary); margin-bottom: 1rem;">🎪 Eventos Especiales Activos</h5>';
    activeEvents.forEach(([id, event]) => {
      const timeLeft = Math.max(0, (event.endTime || 0) - Date.now());
      const minutes = Math.floor(timeLeft / 60000);
      const eventInfo = {
        'double-points': { name: 'Doble Puntos', icon: '🔥', desc: `${event.multiplier || 2}x puntos` },
        'theme-festival': { name: 'Festival de Temas', icon: '🎆', desc: `${event.discount || 50}% descuento` },
        'streak-boost': { name: 'Boost de Racha', icon: '⚡', desc: `+${event.bonus || 10} puntos extra` }
      };
      const info = eventInfo[id] || { name: 'Evento', icon: '🎪', desc: 'Evento especial' };
      
      html += `
        <div class="achievement-item unlocked" style="margin-bottom: 0.5rem; padding: 0.75rem; background: linear-gradient(135deg, rgba(255,107,53,0.1), rgba(247,147,30,0.1));">
          <div class="achievement-icon" style="font-size: 1.5rem;">${info.icon}</div>
          <div class="achievement-info">
            <h4 style="font-size: 0.9rem;">${info.name}</h4>
            <p style="font-size: 0.75rem;">${info.desc} - ${minutes} min restantes</p>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  };

  // Setup de lista de logros
  window.setupAchievements = function() {
    const list = document.getElementById('achievements-list');
    if (!list) return;
    
    list.innerHTML = '';
    Object.entries(window.achievements).forEach(([id, achievement]) => {
      const item = document.createElement('div');
      item.className = `achievement-item ${window.gameData.achievements[id] ? 'unlocked' : ''}`;
      item.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h4>${achievement.name}</h4>
          <p>${achievement.desc} (+${achievement.points} pts)</p>
        </div>
      `;
      list.appendChild(item);
    });
  };

  // Actualizar display del leaderboard
  window.updateLeaderboardDisplay = async function() {
    const container = document.getElementById('leaderboard-display');
    if (!container) return;
    
    let globalData = [];
    
    // Intentar obtener desde Firebase primero
    if (window.firebasePoints && window.firebasePoints.getLeaderboard) {
      try {
        globalData = await window.firebasePoints.getLeaderboard();
      } catch (error) {
        console.warn('Error obteniendo leaderboard de Firebase:', error);
      }
    }
    
    // Fallback a datos locales
    if (globalData.length === 0) {
      globalData = JSON.parse(localStorage.getItem('fenix-global-leaderboard') || '[]');
      if (globalData.length === 0) {
        globalData = JSON.parse(localStorage.getItem('fenix-leaderboard') || '[]');
      }
    }
    
    if (globalData.length === 0) {
      container.innerHTML = `
        <p style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; padding: 1rem;">
          🏆 Sé el primero en el leaderboard<br>
          <button onclick="showNamePanel()" class="btn btn-outline-neon" style="margin-top: 0.5rem; font-size: 0.7rem; padding: 0.3rem 0.6rem;">
            📝 Registrar Nombre
          </button>
        </p>
      `;
      return;
    }
    
    let html = '<div style="margin-bottom: 0.5rem;"><strong style="color: var(--primary);">🏆 Top Global:</strong></div>';
    
    globalData.slice(0, 10).forEach((entry, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const isMe = entry.name === window.gameData.leaderboardName || entry.userId === Utils.getUserId();
      const avatar = entry.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(entry.name || 'User') + '&background=random&size=128';
      
      html += `
        <div class="achievement-item ${isMe ? 'unlocked' : ''}" style="margin-bottom: 0.3rem; padding: 0.4rem; display: flex; align-items: center; gap: 0.5rem;">
          <div class="achievement-icon" style="font-size: 0.9rem;">${medal}</div>
          <img src="${avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name || 'User')}&background=random&size=128'" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);" alt="Avatar">
          <div class="achievement-info" style="flex: 1;">
            <h4 style="font-size: 0.75rem;">${entry.name || 'Anónimo'} ${isMe ? '(Tú)' : ''}</h4>
            <p style="font-size: 0.65rem;">${entry.points} pts</p>
          </div>
        </div>
      `;
    });
    
    // Botón para registrarse si no tiene nombre
    if (!window.gameData.leaderboardName) {
      html += `
        <div style="text-align: center; margin-top: 1rem;">
          <button onclick="showNamePanel()" class="btn btn-outline-neon" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">
            📝 Unirse al Leaderboard
          </button>
        </div>
      `;
    }
    
    container.innerHTML = html;
  };

})();
