// page-views.js — Vistas de subsecciones (Créditos, Updates, Leaderboard) y manejo de avatar
(function () {
  'use strict';

  let uploadedAvatarBase64 = null;

  const SUBVIEWS = new Set(['credits', 'updates', 'leaderboard']);

  // Mostrar secciones principales y ocultar sub-vistas
  window.showMainSections = function (scrollToId) {
    document.querySelectorAll('.main-content > section').forEach((section) => {
      section.style.display = SUBVIEWS.has(section.id) ? 'none' : 'block';
    });

    if (scrollToId) {
      const target = document.getElementById(scrollToId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function openSubview(sectionId) {
    document.querySelectorAll('.main-content > section').forEach((section) => {
      section.style.display = section.id === sectionId ? 'block' : 'none';
    });

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return target;
  }

  // Preview de avatar al subir archivo
  window.previewAvatar = function (input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('La imagen es muy grande. Máximo 500KB.');
      input.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 200;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        uploadedAvatarBase64 = canvas.toDataURL('image/jpeg', 0.7);
        const preview = document.getElementById('avatar-preview');
        if (preview) preview.src = uploadedAvatarBase64;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  window.updateAvatarPreview = function (name) {
    const urlInput = document.getElementById('avatar-url-input');
    if (!uploadedAvatarBase64 && (!urlInput || !urlInput.value)) {
      const preview = document.getElementById('avatar-preview');
      if (preview) {
        preview.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&size=128`;
      }
    }
  };

  window.updateAvatarFromUrl = function (url) {
    if (url && url.trim()) {
      const preview = document.getElementById('avatar-preview');
      if (preview) preview.src = url;
      uploadedAvatarBase64 = null;
    }
  };

  window.toggleAvatarInput = function (type) {
    const urlInput = document.getElementById('avatar-url-input');
    const fileInput = document.getElementById('avatar-file-input');
    const nameInput = document.getElementById('leaderboard-name-input');
    const preview = document.getElementById('avatar-preview');
    const name = nameInput ? nameInput.value : '';

    if (type === 'url') {
      if (urlInput) urlInput.style.display = 'block';
      uploadedAvatarBase64 = null;
      if (fileInput) fileInput.value = '';
    } else if (type === 'auto') {
      if (urlInput) {
        urlInput.style.display = 'none';
        urlInput.value = '';
      }
      uploadedAvatarBase64 = null;
      if (fileInput) fileInput.value = '';
      if (preview) {
        preview.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&size=128`;
      }
    } else {
      if (urlInput) urlInput.style.display = 'none';
    }
  };

  window.showDeadlyPursuerWarning = function () {
    if (confirm('Deadly Pursuer es multijugador y requiere conexión.\n\n¿Continuar?')) {
      window.location.href = 'Experimentos/public/index.html';
    }
  };

  // Créditos
  window.showCredits = async function () {
    const creditsSection = openSubview('credits');
    if (!creditsSection) return;

    if (creditsSection.dataset.loaded !== 'true') {
      await import('./json-display.js')
        .then((module) => module.displayCredits('credits-content'))
        .catch((error) => {
          console.error('Error importando json-display:', error);
          loadCreditsLegacy();
        });
      creditsSection.dataset.loaded = 'true';
    }
  };

  async function loadCreditsLegacy() {
    try {
      const response = await fetch('Assets/json/credits.json');
      const data = await response.json();
      const container = document.getElementById('credits-content');
      if (!container) return;
      container.innerHTML = '';

      if (data.el_wey_que_hizo_esto) {
        const creator = data.el_wey_que_hizo_esto;
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
          <div class="card-body">
            <h3 class="card-title mb-3"><i class="bi bi-code-slash me-2"></i>Creador</h3>
            <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
              <img src="${creator.foto_perfil}" alt="${creator.quien_soy}" style="width: 72px; height: 72px; border-radius: 50%; border: 2px solid var(--primary); object-fit: cover;">
              <div style="flex: 1; min-width: 200px;">
                <h4 style="margin: 0 0 0.4rem 0;">${creator.quien_soy}</h4>
                <p class="card-text" style="margin-bottom: 0.75rem;">${creator.descripcion_personal}</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                  ${Object.entries(creator.redes).map(([red, url]) => `
                    <a href="${url}" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.9rem;">
                      <i class="bi bi-${red === 'github' ? 'github' : red === 'twitter' ? 'twitter-x' : 'music-note'}"></i> ${red.charAt(0).toUpperCase() + red.slice(1)}
                    </a>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
        container.appendChild(card);
      }

      if (data.creditos?.inspiracion) {
        const insp = data.creditos.inspiracion;
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
          <div class="card-body">
            <h3 class="card-title mb-3"><i class="bi bi-lightbulb me-2"></i>Inspiración</h3>
            <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
              <img src="${insp.imagen}" alt="${insp.autor}" style="width: 72px; height: 72px; border-radius: 50%; border: 2px solid var(--border-strong); object-fit: cover;">
              <div style="flex: 1; min-width: 200px;">
                <h4 style="margin: 0 0 0.4rem 0;">${insp.autor}</h4>
                <p class="card-text" style="margin-bottom: 0.75rem;">${insp.texto}</p>
                <a href="${insp.url}" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">
                  <i class="bi bi-link-45deg"></i> Funky Atlas
                </a>
              </div>
            </div>
          </div>
        `;
        container.appendChild(card);
      }

      if (data.mensaje_final) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-body" style="text-align: center; padding: 1.5rem;">
            <p class="card-text" style="margin: 0; color: var(--text-primary);">${data.mensaje_final}</p>
          </div>
        `;
        container.appendChild(card);
      }
    } catch (error) {
      console.error('Error cargando créditos:', error);
      const container = document.getElementById('credits-content');
      if (container) {
        container.innerHTML = `
          <div class="card">
            <div class="card-body" style="text-align: center; padding: 2rem;">
              <i class="bi bi-exclamation-triangle" style="font-size: 1.75rem; color: var(--primary);"></i>
              <p class="card-text mt-2 mb-0">No se pudieron cargar los créditos.</p>
            </div>
          </div>
        `;
      }
    }
  }

  // Updates
  window.showUpdates = async function () {
    const updatesSection = openSubview('updates');
    if (!updatesSection) return;

    if (updatesSection.dataset.loaded !== 'true') {
      try {
        const response = await fetch('Assets/json/updates.json');
        const data = await response.json();

        const container = document.getElementById('updates-content');
        container.innerHTML = '';

        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-old-versions';
        toggleButton.className = 'btn btn-outline-neon mb-4';
        toggleButton.innerHTML = '<i class="bi bi-clock-history"></i> Mostrar versiones antiguas';
        toggleButton.onclick = function () {
          const oldVersions = document.querySelectorAll('.update-card.old-version');
          const isHidden = oldVersions[0]?.style.display === 'none';

          oldVersions.forEach((card) => {
            card.style.display = isHidden ? 'block' : 'none';
          });

          this.innerHTML = isHidden
            ? '<i class="bi bi-clock-history"></i> Ocultar versiones antiguas'
            : '<i class="bi bi-clock-history"></i> Mostrar versiones antiguas';
        };

        container.appendChild(toggleButton);

        const sortedUpdates = data.updates.sort((a, b) => {
          return new Date(b.fecha || b.date) - new Date(a.fecha || a.date);
        });

        sortedUpdates.forEach((update, index) => {
          const fecha = update.fecha || update.date;
          const tipo = update.tipo || update.type;
          const card = document.createElement('div');
          card.className = 'card update-card mb-3';

          if (index >= 3) {
            card.classList.add('old-version');
            card.style.display = 'none';
          }

          let contentHTML = '';
          const sections = {
            nuevo: { title: 'Nuevo' },
            features: { title: 'Nuevo' },
            mejoras: { title: 'Mejoras' },
            correcciones: { title: 'Correcciones' },
            fixes: { title: 'Correcciones' },
            eliminado: { title: 'Eliminado' }
          };

          Object.entries(sections).forEach(([key, sec]) => {
            if (update[key]?.length) {
              contentHTML += `
                <h5 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 1.1rem 0 0.5rem;">${sec.title}</h5>
                <ul style="margin: 0; padding-left: 1.25rem; color: var(--text-secondary); display: grid; gap: 0.3rem; font-size: 0.92rem;">
                  ${update[key].map((item) => `<li>${item}</li>`).join('')}
                </ul>
              `;
            }
          });

          card.innerHTML = `
            <div class="card-body">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.75rem;">
                <div>
                  <h3 style="margin: 0; font-size: 1.15rem;">${update.version}</h3>
                  <span style="color: var(--text-secondary); font-size: 0.85rem;">
                    ${fecha ? new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible'}
                  </span>
                </div>
                <span class="lab-tag">${tipo || 'patch'}</span>
              </div>
              ${contentHTML}
            </div>
          `;

          container.appendChild(card);
        });

        updatesSection.dataset.loaded = 'true';
      } catch (error) {
        console.error('Error cargando updates:', error);
        document.getElementById('updates-content').innerHTML = `
          <div class="card">
            <div class="card-body" style="text-align: center; padding: 2rem;">
              <i class="bi bi-exclamation-triangle" style="font-size: 1.75rem; color: var(--primary);"></i>
              <p class="card-text mt-2 mb-0">No se pudieron cargar las actualizaciones.</p>
            </div>
          </div>
        `;
      }
    }
  };

  // Leaderboard
  window.showLeaderboard = async function () {
    const leaderboardSection = openSubview('leaderboard');
    if (!leaderboardSection) return;

    if (leaderboardSection.dataset.loaded !== 'true') {
      await window.loadLeaderboardPage();
      leaderboardSection.dataset.loaded = 'true';
    }
  };

  window.loadLeaderboardPage = async function () {
    const container = document.getElementById('leaderboard-content');
    if (!container) return;

    try {
      let leaderboardData = [];

      if (window.firebasePoints && window.firebasePoints.getLeaderboard) {
        try {
          leaderboardData = await window.firebasePoints.getLeaderboard();
        } catch (error) {
          console.warn('Error obteniendo leaderboard:', error);
        }
      }

      if (leaderboardData.length === 0) {
        leaderboardData = JSON.parse(localStorage.getItem('fenix-global-leaderboard') || '[]');
      }

      if (leaderboardData.length === 0) {
        container.innerHTML = `
          <div class="card">
            <div class="card-body" style="text-align: center; padding: 2.5rem;">
              <i class="bi bi-trophy" style="font-size: 2.5rem; color: var(--text-secondary);"></i>
              <h3 class="mt-3 mb-2">Aún no hay registros</h3>
              <p class="card-text mb-3">Sé el primero en registrar tu nombre en el ranking.</p>
              ${!window.gameData?.leaderboardName ? `
                <button onclick="showNamePanel()" class="btn btn-neon">
                  <i class="bi bi-person-plus"></i> Registrar nombre
                </button>
              ` : ''}
            </div>
          </div>
        `;
        return;
      }

      const currentUserId = window.Utils ? Utils.getUserId() : localStorage.getItem('userId');
      const currentUserName = window.gameData?.leaderboardName;
      const currentUserPoints = window.gameData?.points || 0;
      const currentUserAvatar = window.gameData?.avatar || '';

      let placeholderCounter = 1;
      leaderboardData = leaderboardData.map((user) => {
        if (!user.name || user.name.trim() === '') {
          return { ...user, name: `Usuario ${placeholderCounter++}`, isPlaceholder: true };
        }
        return user;
      });

      let html = '';

      if (!currentUserName) {
        html += `
          <div class="card mb-4">
            <div class="card-body" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
              <div>
                <h4 style="margin: 0 0 0.25rem; font-size: 1.05rem;">No estás en el ranking</h4>
                <p class="card-text" style="margin: 0;">Registra tu nombre para guardar tus puntos en el leaderboard.</p>
              </div>
              <button onclick="showNamePanel()" class="btn btn-neon">
                <i class="bi bi-person-plus"></i> Registrar nombre
              </button>
            </div>
          </div>
        `;
      } else {
        const userIndex = leaderboardData.findIndex((u) => u.userId === currentUserId || u.name === currentUserName);
        const position = userIndex + 1;
        const avatar = currentUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=random&size=128`;

        html += `
          <div class="card mb-4" style="border-color: var(--primary) !important;">
            <div class="card-body">
              <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <img src="${avatar}"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=random&size=128'"
                     style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid var(--primary); object-fit: cover;"
                     alt="${currentUserName}">
                <div style="flex: 1; min-width: 160px;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h4 style="margin: 0; font-size: 1.05rem;">${currentUserName}</h4>
                    ${position > 0 ? `<span class="lab-tag">#${position}</span>` : ''}
                  </div>
                  <p style="color: var(--primary); font-weight: 600; margin: 0.2rem 0 0; font-size: 0.95rem;">
                    ${currentUserPoints} pts
                  </p>
                </div>
                <button onclick="showNamePanel()" class="btn btn-outline-neon btn-sm" title="Editar perfil">
                  <i class="bi bi-pencil"></i> Editar
                </button>
              </div>
            </div>
          </div>
        `;
      }

      // Top 3
      const top3 = leaderboardData.slice(0, 3);
      if (top3.length > 0) {
        html += `<div class="row g-3 mb-4">`;
        top3.forEach((user, idx) => {
          const userName = user.name || 'Usuario';
          const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=128`;
          const rank = idx + 1;
          const borderHighlight = rank === 1 ? 'var(--primary)' : 'var(--border-strong)';

          html += `
            <div class="col-md-4">
              <div class="card h-100" style="border-color: ${borderHighlight} !important;">
                <div class="card-body" style="display: flex; align-items: center; gap: 0.9rem;">
                  <span style="font-family: 'IBM Plex Mono', monospace; font-size: 1.15rem; font-weight: 700; color: ${rank === 1 ? 'var(--primary)' : 'var(--text-secondary)'}; min-width: 28px;">#${rank}</span>
                  <img src="${avatar}"
                       onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=128'"
                       style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-subtle);"
                       alt="${userName}">
                  <div style="min-width: 0;">
                    <h5 style="margin: 0; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userName}</h5>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">${user.points} pts</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      // Resto del ranking
      const rest = leaderboardData.slice(3);
      if (rest.length > 0) {
        html += `<div class="d-grid gap-2">`;
        rest.forEach((user, idx) => {
          const position = idx + 4;
          const userName = user.name || 'Usuario';
          const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=128`;
          const isCurrentUser = user.userId === currentUserId || user.name === currentUserName;

          html += `
            <div class="card ${isCurrentUser ? 'current-user' : ''}" ${isCurrentUser ? 'style="border-color: var(--primary) !important;"' : ''}>
              <div class="card-body" style="padding: 0.85rem 1.15rem;">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <span style="font-family: 'IBM Plex Mono', monospace; color: var(--text-secondary); min-width: 34px; font-size: 0.88rem;">#${position}</span>
                  <img src="${avatar}"
                       onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=128'"
                       style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;"
                       alt="${userName}">
                  <div style="flex: 1; min-width: 0;">
                    <span style="font-weight: 500; font-size: 0.95rem;">
                      ${userName} ${isCurrentUser ? '<span style="color: var(--primary); font-size: 0.82rem;">(Tú)</span>' : ''}
                    </span>
                  </div>
                  <span style="font-family: 'IBM Plex Mono', monospace; font-size: 0.88rem; color: var(--text-secondary);">${user.points} pts</span>
                </div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      container.innerHTML = html;
    } catch (error) {
      console.error('Error cargando leaderboard:', error);
      container.innerHTML = `
        <div class="card">
          <div class="card-body" style="text-align: center; padding: 2rem;">
            <i class="bi bi-exclamation-triangle" style="font-size: 1.75rem; color: var(--primary);"></i>
            <p class="card-text mt-2 mb-0">Error al cargar el ranking.</p>
          </div>
        </div>
      `;
    }
  };
})();
