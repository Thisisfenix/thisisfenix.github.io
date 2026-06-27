// Event Listeners - Listeners específicos de la página
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    setupFilterListeners();
    setupSearchListeners();
    setupNavigationAnimations();
    setupAvatarPreview();
    setupSpecialButtons();
    setupStatsDropdown();
  });

  // ── Stats Dropdown ──
  function setupStatsDropdown() {
    const item   = document.getElementById('nav-stats-item');
    const btn    = document.getElementById('nav-stats-btn');
    if (!item || !btn) return;

    // Toggle al hacer click en el trigger
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target)) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Filtros de proyectos
  function setupFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        if (window.filterRepos) {
          filterRepos(filter);
        }
        if (window.trackFilter) {
          trackFilter();
        }
      });
    });
  }

  // Búsqueda
  function setupSearchListeners() {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (window.searchRepos) {
          searchRepos(e.target.value);
        }
        if (e.target.value.length > 2) {
          if (window.trackSearch) trackSearch();
          if (window.updateChallenge) updateChallenge('use-search');
        }
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        if (window.sortRepos) {
          sortRepos(e.target.value);
        }
        if (window.trackFilter) {
          trackFilter();
        }
      });
    }
  }

  // Animaciones de navegación
  function setupNavigationAnimations() {
    document.querySelectorAll('.nav-link').forEach(link => {
      const excludedIds = ['theme-panel-btn', 'credits-btn', 'updates-btn', 'achievements-btn', 'experimentos-btn', 'plushie-btn', 'cupid-btn'];
      
      if (!excludedIds.includes(link.id)) {
        link.addEventListener('click', (e) => {
          const target = e.target.closest('.nav-link');
          const href = target.getAttribute('href');
          
          // Solo interceptar si es un enlace con href válido
          if (href && href.startsWith('#') && href !== '#') {
            e.preventDefault();
            
            // Verificar si el elemento existe en el main-content
            const targetElement = document.querySelector(href);
            if (targetElement) {
              // Si el elemento está en main-content, asegurarse de que esté visible
              const mainContent = document.getElementById('main-content');
              if (mainContent && mainContent.contains(targetElement)) {
                // Mostrar main-content si está oculto
                if (mainContent.classList.contains('hidden')) {
                  if (window.uiManager) {
                    window.uiManager.showMainContent();
                  }
                }
              }
              
              // Animación y scroll
              target.style.transform = 'scale(0.95)';
              target.style.textShadow = '0 0 15px var(--primary)';
              
              setTimeout(() => {
                target.style.transform = '';
                target.style.textShadow = '';
                targetElement.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            }
          }
        });
      }
    });
  }

  // Preview de avatar
  function setupAvatarPreview() {
    const avatarFile = document.getElementById('avatar-file');
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');
    const previewImg = document.getElementById('preview-img');

    if (avatarFile) {
      avatarFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (previewImg) previewImg.src = event.target.result;
            if (avatarPreview) avatarPreview.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (avatarInput) {
      avatarInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url && Utils.isValidURL(url)) {
          if (previewImg) previewImg.src = url;
          if (avatarPreview) avatarPreview.style.display = 'block';
        } else {
          if (avatarPreview) avatarPreview.style.display = 'none';
        }
      });
    }
  }

  // Funciones globales necesarias
  window.showNamePanel = function() {
    document.getElementById('panel-overlay')?.classList.add('show');
    document.getElementById('name-panel')?.classList.add('show');
  };

  window.hideNamePanel = function() {
    document.getElementById('panel-overlay')?.classList.remove('show');
    document.getElementById('name-panel')?.classList.remove('show');
    
    // Mostrar mensaje si no se registró
    if (window.gameData && !window.gameData.leaderboardName) {
      setTimeout(() => {
        const msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--bg-dark);border:2px solid var(--primary);padding:1rem;border-radius:8px;z-index:9999;max-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
        msg.innerHTML = `
          <p style="margin:0 0 0.5rem;color:var(--text-primary);font-size:0.85rem;">💡 ¿Quieres registrarte después?</p>
          <button onclick="showAchievements();toggleAchievementsView('leaderboard');this.parentElement.remove()" class="btn btn-outline-neon" style="width:100%;font-size:0.75rem;padding:0.4rem;">🏆 Ir a Leaderboard</button>
          <button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--text-secondary);font-size:0.7rem;width:100%;margin-top:0.25rem;cursor:pointer;">Cerrar</button>
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 10000);
      }, 500);
    }
  };

  window.submitName = async function() {
    const nameInput = document.getElementById('name-input');
    const avatarInput = document.getElementById('avatar-input');
    const avatarFile = document.getElementById('avatar-file');
    const name = nameInput?.value.trim();
    
    if (!name) {
      alert('Por favor ingresa un nombre válido');
      return;
    }
    
    let avatar = avatarInput?.value.trim();
    
    // Si hay archivo, subirlo a Firebase Storage
    if (avatarFile?.files.length > 0) {
      const file = avatarFile.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ La imagen es muy grande. Máximo 2MB');
        return;
      }
      
      try {
        if (window.showAchievementNotification) {
          showAchievementNotification({ name: '💾 Subiendo foto...', points: 0 });
        }
        if (window.firebasePoints && window.firebasePoints.uploadAvatar) {
          avatar = await window.firebasePoints.uploadAvatar(file);
        }
      } catch (error) {
        alert('❌ Error subiendo foto. Intenta con una URL en su lugar.');
        return;
      }
    }
    
    if (window.gameData) {
      window.gameData.leaderboardName = name;
      
      if (avatar && avatar.trim() !== '') {
        window.gameData.avatar = avatar;
        localStorage.setItem('avatar', avatar);
      } else if (!window.gameData.avatar) {
        window.gameData.avatar = '';
        localStorage.setItem('avatar', '');
      }
      
      localStorage.setItem('leaderboardName', name);
      if (window.saveGameData) saveGameData();
    }
    
    hideNamePanel();
    
    // Actualizar en Firebase
    if (window.firebasePoints && window.firebasePoints.updateLeaderboard) {
      const avatarToSend = avatar && avatar.trim() !== '' ? avatar : window.gameData?.avatar;
      window.firebasePoints.updateLeaderboard(name, window.gameData?.points || 0, avatarToSend);
    }
    
    // Mostrar notificación
    if (window.showAchievementNotification) {
      showAchievementNotification({ 
        name: `🏆 ¡Bienvenido al leaderboard, ${name}!`, 
        points: 25 
      });
    }
    if (window.addPoints) addPoints(25);
  };

  // Track de búsqueda y filtros
  window.trackSearch = function() {
    if (!window.gameData) return;
    window.gameData.searchCount = (window.gameData.searchCount || 0) + 1;
    if (window.addPoints) addPoints(3);
    if (window.gameData.searchCount >= 5) {
      if (window.checkAchievement) checkAchievement('search-explorer');
    }
    if (window.updateChallenge) updateChallenge('use-search');
    if (window.updateWeeklyChallenge) updateWeeklyChallenge('search-expert');
    if (window.updateBadgeProgress) updateBadgeProgress('explorer', 1);
    if (window.saveGameData) saveGameData();
  };

  window.trackFilter = function() {
    if (!window.gameData) return;
    window.gameData.filterCount = (window.gameData.filterCount || 0) + 1;
    if (window.addPoints) addPoints(2);
    if (window.gameData.filterCount >= 10) {
      if (window.checkAchievement) checkAchievement('filter-expert');
    }
    if (window.updateBadgeProgress) updateBadgeProgress('explorer', 1);
    if (window.saveGameData) saveGameData();
  };

})();


  // Botones especiales (achievements, updates, experimentos)
  function setupSpecialButtons() {
    const achievementsBtn = document.getElementById('achievements-btn');
    const updatesBtn = document.getElementById('updates-btn');
    const experimentosBtn = document.getElementById('experimentos-btn');
    const creditsBtn = document.getElementById('credits-btn');

    if (achievementsBtn) {
      achievementsBtn.addEventListener('click', () => {
        if (window.showAchievements) {
          showAchievements();
        }
      });
    }

    if (updatesBtn) {
      updatesBtn.addEventListener('click', () => {
        if (window.uiManager) {
          uiManager.showUpdates();
        }
      });
    }

    if (experimentosBtn) {
      experimentosBtn.addEventListener('click', () => {
        if (window.uiManager) {
          uiManager.hideAllSections();
          const experimentosSection = document.getElementById('experimentos-section');
          if (experimentosSection) {
            experimentosSection.classList.add('active');
            experimentosSection.style.display = 'block';
          }
        }
      });
    }

    if (creditsBtn) {
      creditsBtn.addEventListener('click', () => {
        if (window.uiManager) {
          uiManager.showCredits();
        }
      });
    }
  }
