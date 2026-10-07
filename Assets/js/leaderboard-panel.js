// Leaderboard Panel - Sistema completo de ranking con fotos
(function() {
  'use strict';

  // Función para abrir el panel
  window.showLeaderboardPanel = async function() {
    const modal = new bootstrap.Modal(document.getElementById('leaderboard-panel'));
    modal.show();
    await loadLeaderboardData();
  };

  // Función para refrescar el leaderboard
  window.refreshLeaderboard = async function() {
    const listContainer = document.getElementById('leaderboard-list');
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p style="margin-top: 1rem;">Actualizando ranking...</p>
      </div>
    `;
    await loadLeaderboardData();
  };

  // Cargar datos del leaderboard
  async function loadLeaderboardData() {
    try {
      let leaderboardData = [];
      
      // Obtener desde Firebase
      if (window.firebasePoints && window.firebasePoints.getLeaderboard) {
        try {
          leaderboardData = await window.firebasePoints.getLeaderboard();
        } catch (error) {
          console.warn('Error obteniendo leaderboard de Firebase:', error);
        }
      }
      
      // Fallback a localStorage
      if (leaderboardData.length === 0) {
        leaderboardData = JSON.parse(localStorage.getItem('fenix-global-leaderboard') || '[]');
      }
      
      // Si no hay datos, mostrar mensaje vacío
      if (leaderboardData.length === 0) {
        showEmptyLeaderboard();
        return;
      }
      
      // Renderizar
      renderCurrentUser(leaderboardData);
      renderTop3(leaderboardData);
      renderRestOfRanking(leaderboardData);
      
    } catch (error) {
      console.error('Error cargando leaderboard:', error);
      showErrorLeaderboard();
    }
  }

  // Mostrar card del usuario actual
  function renderCurrentUser(leaderboardData) {
    const container = document.getElementById('current-user-card');
    const currentUserId = window.Utils ? Utils.getUserId() : localStorage.getItem('userId');
    const currentUserName = window.gameData?.leaderboardName;
    const currentUserPoints = window.gameData?.points || 0;
    const currentUserAvatar = window.gameData?.avatar || '';
    
    if (!currentUserName) {
      // No tiene nombre registrado
      container.innerHTML = `
        <div style="text-align: center;">
          <i class="bi bi-person-circle" style="font-size: 3rem; color: var(--text-secondary);"></i>
          <h5 style="color: var(--text); margin: 1rem 0 0.5rem;">No estás en el ranking</h5>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
            Registra tu nombre para aparecer en el leaderboard global
          </p>
          <button onclick="bootstrap.Modal.getInstance(document.getElementById('leaderboard-panel')).hide(); setTimeout(() => showNamePanel(), 300);" class="btn btn-primary" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none;">
            <i class="bi bi-person-plus"></i> Registrar Nombre
          </button>
        </div>
      `;
      return;
    }
    
    // Encontrar posición del usuario
    const userIndex = leaderboardData.findIndex(u => u.userId === currentUserId || u.name === currentUserName);
    const position = userIndex + 1;
    const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '';
    
    const avatar = currentUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=random&size=128`;
    
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <img src="${avatar}" 
             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=random&size=128'"
             style="width: 64px; height: 64px; border-radius: 50%; border: 3px solid var(--primary); object-fit: cover;" 
             alt="${currentUserName}">
        <div style="flex: 1;">
          <h5 style="color: var(--text); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            ${currentUserName}
            ${position > 0 ? `<span style="background: var(--primary); color: white; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem;">#${position} ${medal}</span>` : ''}
          </h5>
          <p style="color: var(--primary); font-weight: bold; font-size: 1.2rem; margin: 0.5rem 0 0;">
            <i class="bi bi-award"></i> ${currentUserPoints} pts
          </p>
        </div>
        <button onclick="bootstrap.Modal.getInstance(document.getElementById('leaderboard-panel')).hide(); setTimeout(() => showNamePanel(), 300);" 
                class="btn btn-outline-primary btn-sm"
                title="Cambiar nombre o foto">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
    `;
  }

  // Renderizar Top 3 con podio
  function renderTop3(leaderboardData) {
    const container = document.getElementById('top-3-podium');
    const top3 = leaderboardData.slice(0, 3);
    
    if (top3.length === 0) {
      container.style.display = 'none';
      return;
    }
    
    container.style.display = 'block';
    
    const podiumOrder = top3.length === 3 ? [1, 0, 2] : top3.length === 2 ? [1, 0] : [0];
    const medals = ['🥇', '🥈', '🥉'];
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const heights = ['180px', '140px', '110px'];
    
    let html = '<div style="display: flex; align-items: flex-end; justify-content: center; gap: 1rem; margin-bottom: 1rem;">';
    
    podiumOrder.forEach(idx => {
      if (!top3[idx]) return;
      
      const user = top3[idx];
      const position = idx;
      const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=128`;
      
      html += `
        <div style="flex: 1; max-width: 200px; text-align: center;">
          <img src="${avatar}" 
               onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=128'"
               style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid ${colors[position]}; object-fit: cover; margin-bottom: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" 
               alt="${user.name || 'Usuario'}">
          <div style="background: linear-gradient(135deg, ${colors[position]}, rgba(${position === 0 ? '255,215,0' : position === 1 ? '192,192,192' : '205,127,50'},0.3)); 
                      padding: 1rem; border-radius: 12px; border: 3px solid ${colors[position]}; 
                      height: ${heights[position]}; display: flex; flex-direction: column; justify-content: center;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${medals[position]}</div>
            <div style="font-weight: bold; color: white; margin-bottom: 0.25rem; font-size: 1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${user.name || 'Anónimo'}</div>
            <div style="font-size: 1.1rem; color: rgba(255,255,255,0.9); font-weight: bold;">${user.points} pts</div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  }

  // Renderizar resto del ranking (4+)
  function renderRestOfRanking(leaderboardData) {
    const container = document.getElementById('leaderboard-list');
    const rest = leaderboardData.slice(3);
    
    if (rest.length === 0) {
      container.innerHTML = '';
      return;
    }
    
    let html = '<h6 style="color: var(--primary); margin-bottom: 1rem; padding: 0 0.5rem;"><i class="bi bi-list-ol"></i> Resto del Ranking</h6>';
    
    rest.forEach((user, idx) => {
      const position = idx + 4;
      const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=128`;
      const currentUserId = window.Utils ? Utils.getUserId() : localStorage.getItem('userId');
      const isCurrentUser = user.userId === currentUserId || user.name === window.gameData?.leaderboardName;
      
      html += `
        <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}" 
             style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; margin-bottom: 0.5rem; 
                    background: ${isCurrentUser ? 'rgba(255,107,53,0.1)' : 'var(--bg-light)'}; 
                    border-radius: 8px; border-left: 3px solid ${isCurrentUser ? 'var(--primary)' : 'var(--text-secondary)'}; 
                    transition: all 0.3s;">
          <span style="font-weight: bold; color: var(--text-secondary); min-width: 35px; font-size: 1.1rem;">#${position}</span>
          <img src="${avatar}" 
               onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=128'"
               style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--primary); object-fit: cover;" 
               alt="${user.name || 'Usuario'}">
          <div style="flex: 1;">
            <div style="font-weight: bold; color: var(--text); font-size: 0.95rem;">
              ${user.name || 'Anónimo'} ${isCurrentUser ? '<span style="color: var(--primary);">(Tú)</span>' : ''}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${user.points} puntos</div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }

  // Mostrar mensaje cuando está vacío
  function showEmptyLeaderboard() {
    document.getElementById('current-user-card').innerHTML = `
      <div style="text-align: center;">
        <i class="bi bi-trophy" style="font-size: 3rem; color: var(--text-secondary);"></i>
        <h5 style="color: var(--text); margin: 1rem 0 0.5rem;">Leaderboard Vacío</h5>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
          Sé el primero en registrarte
        </p>
        <button onclick="bootstrap.Modal.getInstance(document.getElementById('leaderboard-panel')).hide(); setTimeout(() => showNamePanel(), 300);" class="btn btn-primary" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none;">
          <i class="bi bi-person-plus"></i> Registrar Nombre
        </button>
      </div>
    `;
    document.getElementById('top-3-podium').style.display = 'none';
    document.getElementById('leaderboard-list').innerHTML = '';
  }

  // Mostrar mensaje de error
  function showErrorLeaderboard() {
    document.getElementById('current-user-card').style.display = 'none';
    document.getElementById('top-3-podium').style.display = 'none';
    document.getElementById('leaderboard-list').innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #dc3545;"></i>
        <h5 style="color: var(--text); margin: 1rem 0;">Error al cargar</h5>
        <p>No se pudo obtener el ranking. Intenta de nuevo.</p>
        <button onclick="refreshLeaderboard()" class="btn btn-primary">
          <i class="bi bi-arrow-clockwise"></i> Reintentar
        </button>
      </div>
    `;
  }

  // Event listener para el botón del navbar
  document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBtn = document.getElementById('leaderboard-btn-nav');
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', showLeaderboardPanel);
    }
  });

})();
