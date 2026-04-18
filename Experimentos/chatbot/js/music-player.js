// Sistema de reproductor de música para el chatbot
class MusicPlayer {
  constructor() {
    this.currentTrack = null;
    this.audio = new Audio();
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 0.3;
    this.isLooping = true;
    this.isShuffling = false;
    this.userTracks = JSON.parse(localStorage.getItem('userMusicTracks') || '[]');
    
    this.init();
  }

  async init() {
    await this.loadDefaultPlaylist();
    this.setupAudioEvents();
    this.createMusicUI();
    this.loadUserSettings();
  }

  async loadDefaultPlaylist() {
    try {
      const response = await fetch('./Music/default-playlist.json');
      const data = await response.json();
      this.playlist = [...data.tracks, ...this.userTracks];
      this.volume = data.settings.volume;
      this.isLooping = data.settings.loop;
      this.isShuffling = data.settings.shuffle;
    } catch (error) {
      console.warn('No se pudo cargar la playlist por defecto:', error);
      this.playlist = [...this.userTracks];
    }
  }

  setupAudioEvents() {
    this.audio.addEventListener('ended', () => {
      if (this.isLooping) {
        if (this.isShuffling) {
          this.playRandom();
        } else {
          this.playNext();
        }
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      this.updateProgress();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.updateTrackInfo();
    });
  }

  createMusicUI() {
    const musicPanel = document.createElement('div');
    musicPanel.className = 'music-panel hidden';
    musicPanel.id = 'musicPanel';
    musicPanel.innerHTML = `
      <div class="music-header">
        <span>🎵 Reproductor</span>
        <button class="music-toggle" onclick="musicPlayer.togglePanel()">✕</button>
      </div>
      <div class="music-content">
        <div class="track-info">
          <div class="track-title" id="trackTitle">Sin música</div>
          <div class="track-artist" id="trackArtist">Selecciona una canción</div>
        </div>
        <div class="progress-container">
          <div class="progress-bar" id="progressBar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="time-info">
            <span id="currentTime">0:00</span>
            <span id="totalTime">0:00</span>
          </div>
        </div>
        <div class="music-controls">
          <button class="control-btn" onclick="musicPlayer.playPrevious()" title="Anterior">⏮️</button>
          <button class="control-btn play-btn" id="playBtn" onclick="musicPlayer.togglePlay()" title="Reproducir/Pausar">▶️</button>
          <button class="control-btn" onclick="musicPlayer.playNext()" title="Siguiente">⏭️</button>
          <button class="control-btn" id="shuffleBtn" onclick="musicPlayer.toggleShuffle()" title="Aleatorio">🔀</button>
          <button class="control-btn" id="loopBtn" onclick="musicPlayer.toggleLoop()" title="Repetir">🔁</button>
        </div>
        <div class="volume-control">
          <span>🔊</span>
          <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="${this.volume}" onchange="musicPlayer.setVolume(this.value)">
        </div>
        <div class="playlist-section">
          <div class="playlist-header">
            <span>📋 Playlist</span>
            <button class="control-btn" onclick="musicPlayer.showUploadModal()" title="Subir música">➕</button>
          </div>
          <div class="playlist" id="playlist"></div>
        </div>
      </div>
    `;

    document.body.appendChild(musicPanel);
    this.updatePlaylist();
    this.updateControls();
  }

  updatePlaylist() {
    const playlistEl = document.getElementById('playlist');
    if (!playlistEl) return;

    playlistEl.innerHTML = this.playlist.map((track, index) => `
      <div class="playlist-item ${index === this.currentIndex ? 'active' : ''}" onclick="musicPlayer.playTrack(${index})">
        <div class="track-info">
          <div class="track-name">${track.title}</div>
          <div class="track-artist">${track.artist}</div>
        </div>
        <div class="track-actions">
          ${track.isUserTrack ? `<button class="remove-btn" onclick="musicPlayer.removeTrack(${index})" title="Eliminar">🗑️</button>` : ''}
          <span class="track-duration">${track.duration || '?:??'}</span>
        </div>
      </div>
    `).join('');
  }

  showUploadModal() {
    const modal = document.createElement('div');
    modal.className = 'music-upload-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          🎵 Subir Música
          <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
        </div>
        <div class="upload-warning">
          ⚠️ <strong>Importante:</strong> Las canciones subidas se almacenan localmente en tu navegador. 
          Pueden perderse si borras los datos del navegador o cambias de dispositivo. 
          Te recomendamos hacer respaldo de tus archivos.
        </div>
        <div class="upload-section">
          <input type="file" id="musicFileInput" accept="audio/*" multiple>
          <label for="musicFileInput" class="upload-btn">📁 Seleccionar archivos de audio</label>
        </div>
        <div class="upload-info">
          <p>Formatos soportados: MP3, WAV, OGG, M4A</p>
          <p>Tamaño máximo recomendado: 10MB por archivo</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const fileInput = modal.querySelector('#musicFileInput');
    fileInput.addEventListener('change', (e) => {
      this.handleFileUpload(e.target.files);
      modal.remove();
    });
  }

  async handleFileUpload(files) {
    for (const file of files) {
      if (file.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const track = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: 'Usuario',
            file: e.target.result,
            duration: '?:??',
            isUserTrack: true
          };

          this.userTracks.push(track);
          this.playlist.push(track);
          localStorage.setItem('userMusicTracks', JSON.stringify(this.userTracks));
          this.updatePlaylist();
          
          this.showNotification(`✅ "${track.title}" añadida a la playlist`);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeTrack(index) {
    if (confirm('¿Eliminar esta canción de la playlist?')) {
      const track = this.playlist[index];
      if (track.isUserTrack) {
        this.userTracks = this.userTracks.filter(t => t.id !== track.id);
        localStorage.setItem('userMusicTracks', JSON.stringify(this.userTracks));
      }
      
      this.playlist.splice(index, 1);
      if (this.currentIndex >= index) {
        this.currentIndex = Math.max(0, this.currentIndex - 1);
      }
      this.updatePlaylist();
      this.showNotification('🗑️ Canción eliminada');
    }
  }

  playTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    
    this.currentIndex = index;
    this.currentTrack = this.playlist[index];
    
    // Si es un archivo del usuario (base64), usar directamente
    if (this.currentTrack.file.startsWith('data:')) {
      this.audio.src = this.currentTrack.file;
    } else {
      this.audio.src = this.currentTrack.file;
    }
    
    this.audio.volume = this.volume;
    this.audio.play();
    this.isPlaying = true;
    this.updateControls();
    this.updatePlaylist();
  }

  togglePlay() {
    if (!this.currentTrack && this.playlist.length > 0) {
      this.playTrack(0);
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.audio.play();
      this.isPlaying = true;
    }
    this.updateControls();
  }

  playNext() {
    if (this.playlist.length === 0) return;
    
    if (this.isShuffling) {
      this.playRandom();
    } else {
      const nextIndex = (this.currentIndex + 1) % this.playlist.length;
      this.playTrack(nextIndex);
    }
  }

  playPrevious() {
    if (this.playlist.length === 0) return;
    
    const prevIndex = this.currentIndex === 0 ? this.playlist.length - 1 : this.currentIndex - 1;
    this.playTrack(prevIndex);
  }

  playRandom() {
    if (this.playlist.length <= 1) return;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.playlist.length);
    } while (randomIndex === this.currentIndex);
    
    this.playTrack(randomIndex);
  }

  toggleShuffle() {
    this.isShuffling = !this.isShuffling;
    this.updateControls();
    this.saveSettings();
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
    this.updateControls();
    this.saveSettings();
  }

  setVolume(value) {
    this.volume = parseFloat(value);
    this.audio.volume = this.volume;
    this.saveSettings();
  }

  updateControls() {
    const playBtn = document.getElementById('playBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const loopBtn = document.getElementById('loopBtn');

    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
    }

    if (shuffleBtn) {
      shuffleBtn.style.opacity = this.isShuffling ? '1' : '0.5';
    }

    if (loopBtn) {
      loopBtn.style.opacity = this.isLooping ? '1' : '0.5';
    }
    
    // Actualizar indicador en el botón de la sidebar
    this.updateSidebarIndicator();
  }
  
  updateSidebarIndicator() {
    const musicBtn = document.querySelector('.mini-sidebar-btn[title="Música"]');
    if (musicBtn) {
      if (this.isPlaying) {
        musicBtn.classList.add('music-playing');
      } else {
        musicBtn.classList.remove('music-playing');
      }
    }
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    
    if (progressFill && this.audio.duration) {
      const progress = (this.audio.currentTime / this.audio.duration) * 100;
      progressFill.style.width = progress + '%';
    }

    if (currentTimeEl) {
      currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }
  }

  updateTrackInfo() {
    const trackTitle = document.getElementById('trackTitle');
    const trackArtist = document.getElementById('trackArtist');
    const totalTime = document.getElementById('totalTime');

    if (this.currentTrack) {
      if (trackTitle) trackTitle.textContent = this.currentTrack.title;
      if (trackArtist) trackArtist.textContent = this.currentTrack.artist;
      if (totalTime) totalTime.textContent = this.formatTime(this.audio.duration);
    }
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  togglePanel() {
    const panel = document.getElementById('musicPanel');
    if (panel.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      panel.classList.add('show');
    } else {
      panel.classList.add('hidden');
      panel.classList.remove('show');
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'music-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  saveSettings() {
    const settings = {
      volume: this.volume,
      isLooping: this.isLooping,
      isShuffling: this.isShuffling
    };
    localStorage.setItem('musicPlayerSettings', JSON.stringify(settings));
  }

  loadUserSettings() {
    const settings = JSON.parse(localStorage.getItem('musicPlayerSettings') || '{}');
    this.volume = settings.volume || 0.3;
    this.isLooping = settings.isLooping !== undefined ? settings.isLooping : true;
    this.isShuffling = settings.isShuffling || false;
    
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
      volumeSlider.value = this.volume;
    }
    
    this.updateControls();
  }
}

// Inicializar el reproductor cuando se carga la página
let musicPlayer;
document.addEventListener('DOMContentLoaded', () => {
  musicPlayer = new MusicPlayer();
});