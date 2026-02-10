// Sistema de Cupid's Arrow Game para San Valentín
class CupidArrowGame {
  constructor() {
    this.startDate = new Date('2026-02-10T06:00:00Z');
    this.endDate = new Date('2026-03-01T06:00:00Z');
    this.score = parseInt(localStorage.getItem('cupid-score') || '0');
    this.highScore = parseInt(localStorage.getItem('cupid-highscore') || '0');
    this.gameActive = false;
    this.arrows = [];
    this.spawnInterval = null;
    this.speedMultiplier = 1;
    this.leaderboard = [];
    this.init();
    this.loadLeaderboard();
  }

  async loadLeaderboard() {
    try {
      const snapshot = await db.collection('cupid-leaderboard').orderBy('date').limit(10).get();
      this.leaderboard = [];
      snapshot.forEach(doc => this.leaderboard.push(doc.data()));
    } catch (error) {
      console.error('Error cargando leaderboard:', error);
    }
  }

  async saveToLeaderboard() {
    if (this.score < 500) return;
    const username = prompt('🎉 ¡Completaste el desafío! Ingresa tu nombre:')?.trim();
    if (!username) return;
    const entry = { name: username, score: this.score, date: Date.now() };
    try {
      await db.collection('cupid-leaderboard').add(entry);
      await this.loadLeaderboard();
    } catch (error) {
      console.error('Error guardando en leaderboard:', error);
    }
  }

  showLeaderboardModal() {
    const modal = document.createElement('div');
    modal.className = 'cupid-leaderboard-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.9); display: flex; align-items: center;
      justify-content: center; z-index: 10002;
    `;

    const top10 = this.leaderboard.slice(0, 10);
    const medals = ['🥇', '🥈', '🥉'];
    const colors = ['#ffd700', '#c0c0c0', '#cd7f32'];

    modal.innerHTML = `
      <div style="background: var(--bg-dark); padding: 2rem; border-radius: 12px; border: 2px solid #ff1493; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <button onclick="this.closest('.cupid-leaderboard-modal').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #ff1493; font-size: 2rem; cursor: pointer;">&times;</button>
        
        <h2 style="color: #ff1493; text-align: center; margin-bottom: 2rem;">🏆 Hall of Fame</h2>
        
        ${top10.length === 0 ? '<p style="text-align: center; color: var(--text-secondary);">Nadie ha completado el desafío aún</p>' : `
          <div style="display: flex; align-items: flex-end; justify-content: center; gap: 1rem; margin-bottom: 2rem;">
            ${top10.slice(0, 3).map((p, i) => `
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${medals[i]}</div>
                <div style="background: linear-gradient(135deg, ${colors[i]}, rgba(255,20,147,0.3)); padding: 1rem; border-radius: 8px; height: ${['180px', '140px', '100px'][i]}; display: flex; flex-direction: column; justify-content: center; border: 2px solid ${colors[i]};">
                  <div style="font-weight: bold; color: white; margin-bottom: 0.5rem; font-size: 1.1rem;">${p.name}</div>
                  <div style="font-size: 1rem; color: #ffd700;">${p.score} pts</div>
                  <div style="font-size: 0.7rem; color: rgba(255,255,255,0.7);">${new Date(p.date).toLocaleDateString()}</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          ${top10.length > 3 ? `
            <div style="background: rgba(255,20,147,0.1); padding: 1rem; border-radius: 8px;">
              <h3 style="color: #ff1493; margin-bottom: 1rem; text-align: center;">Top 10</h3>
              ${top10.slice(3).map((p, i) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-light); border-radius: 6px; margin-bottom: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: var(--text-secondary); font-weight: bold;">#${i + 4}</span>
                    <span style="color: var(--text-color);">${p.name}</span>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: #ffd700; font-weight: bold;">${p.score} pts</span>
                    <span style="font-size: 0.7rem; color: var(--text-secondary);">${new Date(p.date).toLocaleDateString()}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        `}
      </div>
    `;

    document.body.appendChild(modal);
  }

  isEventActive() {
    const now = new Date();
    return now >= this.startDate && now < this.endDate;
  }

  init() {
    if (!this.isEventActive()) {
      const btn = document.getElementById('cupid-btn');
      if (btn) btn.style.display = 'none';
      return;
    }
    document.getElementById('cupid-btn')?.addEventListener('click', () => this.showPanel());
    this.updateBadge();
  }

  showPanel() {
    if (!this.isEventActive()) {
      alert('💘 El evento de San Valentín finalizó. ¡Gracias por jugar!');
      return;
    }

    const panel = document.createElement('div');
    panel.className = 'cupid-panel';
    panel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    panel.innerHTML = `
      <div class="cupid-panel-content" style="background: var(--bg-dark); padding: 2rem; border-radius: 12px; border: 2px solid #ff1493; max-width: 500px; width: 90%; position: relative;">
        <button onclick="this.closest('.cupid-panel').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #ff1493; font-size: 2rem; cursor: pointer;">&times;</button>
        
        <h2 style="color: #ff1493; text-align: center; margin-bottom: 0.5rem;">🏹 Cupid's Arrow Game</h2>
        <p style="text-align: center; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">📅 10 feb - 1 mar 2026</p>
        
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <p style="color: var(--text-color); margin-bottom: 0.5rem;">Atrapa las flechas doradas, evita las negras</p>
          <div style="display: flex; justify-content: center; gap: 2rem; margin: 1rem 0;">
            <div>
              <div style="font-size: 2rem;">💛</div>
              <div style="font-size: 0.8rem; color: #ffd700;">+10 pts</div>
            </div>
            <div>
              <div style="font-size: 2rem;">🖤</div>
              <div style="font-size: 0.8rem; color: #666;">-10 pts</div>
            </div>
          </div>
        </div>

        <div style="background: rgba(255,20,147,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: var(--text-color);">Puntuación actual:</span>
            <span style="color: #ffd700; font-weight: bold;">${this.score} pts</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-color);">Récord:</span>
            <span style="color: #ff1493; font-weight: bold;">${this.highScore} pts</span>
          </div>
        </div>

        ${this.score >= 500 ? `
          <div style="background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,20,147,0.2)); padding: 1rem; border-radius: 8px; border: 2px solid #ffd700; margin-bottom: 1rem; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
            <div style="color: #ffd700; font-weight: bold; margin-bottom: 0.5rem;">¡TEMA DESBLOQUEADO!</div>
            <div style="font-size: 0.9rem; color: var(--text-color);">Tema "Valentine's Love" disponible</div>
          </div>
        ` : `
          <div style="background: rgba(255,20,147,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="color: var(--text-color);">Progreso:</span>
              <span style="color: #ff1493; font-weight: bold;">${this.score}/500</span>
            </div>
            <div style="background: var(--bg-light); height: 10px; border-radius: 5px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #ff1493, #ffd700); height: 100%; width: ${Math.min(this.score / 5, 100)}%; transition: width 0.3s;"></div>
            </div>
          </div>
        `}

        <button onclick="cupidGame.showLeaderboardModal()" style="width: 100%; padding: 0.75rem; background: rgba(255,20,147,0.2); color: #ff1493; border: 2px solid #ff1493; border-radius: 8px; cursor: pointer; margin-bottom: 0.5rem; font-weight: bold;">
          🏆 Ver Hall of Fame
        </button>

        <button onclick="cupidGame.startGame()" style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #ff1493, #ff69b4); color: white; border: none; border-radius: 8px; font-size: 1.2rem; font-weight: bold; cursor: pointer; margin-bottom: 0.5rem;">
          🎮 ${this.gameActive ? 'Juego en curso...' : 'Iniciar Juego'}
        </button>

        ${this.score >= 500 && !this.leaderboard.some(e => e.score === this.score) ? `
          <button onclick="cupidGame.saveToLeaderboard(); cupidGame.showPanel();" style="width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #ffd700, #ff1493); color: white; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 0.5rem; font-weight: bold;">
            ⭐ Guardar en Hall of Fame
          </button>
        ` : ''}

        <button onclick="localStorage.removeItem('cupid-score'); localStorage.removeItem('cupid-highscore'); location.reload();" style="width: 100%; padding: 0.75rem; background: var(--bg-light); color: var(--text-color); border: 2px solid #ff1493; border-radius: 8px; cursor: pointer;">
          🔄 Reiniciar Progreso
        </button>
      </div>
    `;

    document.body.appendChild(panel);
  }

  startGame() {
    if (this.gameActive) return;
    
    this.gameActive = true;
    this.arrows = [];
    this.speedMultiplier = 1;
    
    const gameContainer = document.createElement('div');
    gameContainer.id = 'cupid-game-container';
    gameContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255,20,147,0.3), rgba(255,105,180,0.3));
      z-index: 10001;
      overflow: hidden;
    `;

    gameContainer.innerHTML = `
      <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); padding: 1rem 2rem; border-radius: 12px; border: 2px solid #ff1493;">
        <div style="text-align: center; color: white;">
          <div style="font-size: 2rem; font-weight: bold; color: #ffd700;" id="game-score">${this.score}</div>
          <div style="font-size: 0.8rem; color: #ff1493;">puntos</div>
        </div>
      </div>
      <button onclick="cupidGame.endGame()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,20,147,0.8); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold;">
        ❌ Salir
      </button>
      <img src="placeholder/AnkushCat.png" style="position: absolute; bottom: 20px; right: 20px; width: 150px; height: auto; opacity: 0.8; pointer-events: none;">
    `;

    document.body.appendChild(gameContainer);
    document.querySelector('.cupid-panel')?.remove();

    this.spawnInterval = setInterval(() => this.spawnArrow(), 1000 / this.speedMultiplier);
    
    setTimeout(() => {
      this.speedMultiplier = 1.5;
      clearInterval(this.spawnInterval);
      this.spawnInterval = setInterval(() => this.spawnArrow(), 1000 / this.speedMultiplier);
    }, 10000);

    setTimeout(() => {
      this.speedMultiplier = 2;
      clearInterval(this.spawnInterval);
      this.spawnInterval = setInterval(() => this.spawnArrow(), 1000 / this.speedMultiplier);
    }, 20000);
  }

  spawnArrow() {
    const container = document.getElementById('cupid-game-container');
    if (!container) return;

    const isGolden = Math.random() > 0.5;
    const arrow = document.createElement('div');
    arrow.className = 'cupid-arrow';
    arrow.dataset.type = isGolden ? 'golden' : 'black';
    
    const size = 40;
    const startX = Math.random() * (window.innerWidth - size);
    
    arrow.style.cssText = `
      position: absolute;
      left: ${startX}px;
      top: -50px;
      font-size: 2rem;
      cursor: pointer;
      transition: transform 0.2s;
      animation: arrowFall ${4 / this.speedMultiplier}s linear;
    `;
    
    arrow.textContent = isGolden ? '💛' : '🖤';
    
    arrow.addEventListener('click', () => this.catchArrow(arrow, isGolden));
    
    container.appendChild(arrow);
    this.arrows.push(arrow);

    setTimeout(() => {
      if (arrow.parentElement) {
        arrow.remove();
        this.arrows = this.arrows.filter(a => a !== arrow);
      }
    }, 4000 / this.speedMultiplier);
  }

  catchArrow(arrow, isGolden) {
    arrow.style.animation = 'arrowCatch 0.3s ease-out';
    
    if (isGolden) {
      this.score += 10;
      this.showFloatingText('+10', arrow, '#ffd700');
    } else {
      this.score = Math.max(0, this.score - 10);
      this.showFloatingText('-10', arrow, '#ff0000');
    }

    localStorage.setItem('cupid-score', this.score);
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('cupid-highscore', this.highScore);
    }

    document.getElementById('game-score').textContent = this.score;
    document.getElementById('cupid-score').textContent = this.score;

    if (this.score >= 500) {
      localStorage.setItem('valentine-theme-unlocked', 'true');
      if (typeof gameData !== 'undefined') {
        gameData.unlockedThemes.add('valentines-love');
        if (typeof saveGameData === 'function') saveGameData();
      }
      if (typeof achievementSystem !== 'undefined') {
        achievementSystem.checkAchievement('cupid-master');
      }
    }

    setTimeout(() => arrow.remove(), 300);
    this.arrows = this.arrows.filter(a => a !== arrow);
  }

  showFloatingText(text, element, color) {
    const floating = document.createElement('div');
    floating.textContent = text;
    floating.style.cssText = `
      position: absolute;
      left: ${element.offsetLeft}px;
      top: ${element.offsetTop}px;
      color: ${color};
      font-size: 2rem;
      font-weight: bold;
      pointer-events: none;
      animation: floatUp 1s ease-out;
      z-index: 10002;
    `;
    document.getElementById('cupid-game-container').appendChild(floating);
    setTimeout(() => floating.remove(), 1000);
  }

  endGame() {
    this.gameActive = false;
    clearInterval(this.spawnInterval);
    this.arrows.forEach(arrow => arrow.remove());
    this.arrows = [];
    document.getElementById('cupid-game-container')?.remove();
    this.updateBadge();
    this.showPanel();
  }

  updateBadge() {
    const container = document.getElementById('event-badge-container');
    if (!container) return;

    const isActive = this.isEventActive();
    const isComplete = this.score >= 500;

    // Obtener el HTML existente del contenedor
    let existingHTML = container.innerHTML;
    
    // Remover cualquier badge anterior de Cupid
    existingHTML = existingHTML.replace(/<div[^>]*cupid-badge[^>]*>.*?<\/div>/gs, '');

    let cupidHTML = '';
    if (isComplete) {
      cupidHTML = `
        <div class="cupid-badge" style="margin-bottom: 1rem; padding: 1rem; background: linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,20,147,0.3)); border: 2px solid #ffd700; border-radius: 12px; box-shadow: 0 0 20px rgba(255,215,0,0.4); animation: pulse 2s infinite;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">🏹</span>
            <div style="flex: 1;">
              <strong style="color: #ffd700; text-shadow: 0 0 10px rgba(255,215,0,0.5);">¡MEDALLA CUPID MASTER DESBLOQUEADA!</strong>
              <div style="font-size: 0.7rem; color: #ff1493;">Puntuación: ${this.score} pts | +300 pts de logro</div>
            </div>
          </div>
          <div style="background: rgba(255,215,0,0.2); height: 12px; border-radius: 6px; overflow: hidden; margin-top: 0.5rem;">
            <div style="background: linear-gradient(90deg, #FFD700, #ff1493); height: 100%; width: 100%; box-shadow: 0 0 10px #FFD700;"></div>
          </div>
        </div>
      `;
    } else if (isActive) {
      cupidHTML = `
        <div class="cupid-badge" style="margin-bottom: 1rem; padding: 1rem; background: linear-gradient(135deg, rgba(255,20,147,0.2), rgba(255,105,180,0.2)); border: 2px solid #ff1493; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.5rem;">🏹</span>
            <div style="flex: 1;">
              <strong style="color: #ff1493;">Cupid's Arrow Game</strong>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">10 feb - 1 mar 2026</div>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-color); margin-bottom: 0.5rem;">
            Puntuación: ${this.score}/500 | Récord: ${this.highScore}
          </div>
          <div style="background: var(--bg-light); height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #ff1493, #ffd700); height: 100%; width: ${Math.min((this.score / 500) * 100, 100)}%; transition: width 0.3s;"></div>
          </div>
        </div>
      `;
    }
    
    // Agregar el badge de Cupid al final
    container.innerHTML = existingHTML + cupidHTML;
  }
}

const cupidStyles = document.createElement('style');
cupidStyles.textContent = `
  @keyframes arrowFall {
    from { transform: translateY(0) rotate(0deg); }
    to { transform: translateY(calc(100vh + 100px)) rotate(360deg); }
  }
  @keyframes arrowCatch {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); }
    100% { transform: scale(0); opacity: 0; }
  }
  @keyframes floatUp {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-50px); opacity: 0; }
  }
`;
document.head.appendChild(cupidStyles);

let cupidGame;
document.addEventListener('DOMContentLoaded', () => {
  cupidGame = new CupidArrowGame();
});
