// Leaderboard Panel - Redirige a la página completa
(function() {
  'use strict';

  // Event listener para el botón del navbar
  document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBtn = document.getElementById('leaderboard-btn-nav');
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', () => {
        if (window.showLeaderboard) {
          window.showLeaderboard();
        }
      });
    }
  });

})();
