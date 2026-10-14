// ==================== MEDIA PICKER MANAGER ====================
// Sistema de selección de GIFs, Stickers e Imágenes para comentarios

export class MediaPickerManager {
  constructor(firebaseManager, profileManager) {
    this.firebase = firebaseManager;
    this.profiles = profileManager;
    this.isOpen = false;
    this.favorites = {
      gifs: [],
      stickers: [],
      images: []
    };
    
    // Giphy API (segura para uso público)
    this.giphyApiKey = 'l8Gj9vUxfYXTpHUbZDj0PyQx5ZXiyJCa';
    this.giphyBaseUrl = 'https://api.giphy.com/v1';
    
    this.init();
  }
  
  async init() {
    await this.loadFavorites();
    // NO cargar GIFs aquí - se cargarán cuando se abra el panel
    console.log('[MediaPicker] Inicializado con Giphy API');
  }
  
  // ==================== TOGGLE PANEL ====================
  togglePicker() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('mediaPickerPanel');
    
    console.log('[MediaPicker] togglePicker llamado, isOpen:', this.isOpen);
    console.log('[MediaPicker] Panel encontrado:', !!panel);
    
    if (!panel) {
      console.error('[MediaPicker] ❌ Panel NO encontrado en el DOM');
      // Buscar todos los IDs que contienen "media"
      const allElements = document.querySelectorAll('[id*="media"]');
      console.log('[MediaPicker] Elementos con "media" en ID:', allElements);
      return;
    }
    
    console.log('[MediaPicker] Classes antes:', panel.className);
    console.log('[MediaPicker] Display antes:', getComputedStyle(panel).display);
    
    if (this.isOpen) {
      panel.classList.remove('hidden');
      panel.style.display = 'block'; // Forzar con inline style también
      panel.style.opacity = '1';
      panel.style.visibility = 'visible';
      
      console.log('[MediaPicker] ✅ Panel debería estar visible ahora');
      console.log('[MediaPicker] Classes después:', panel.className);
      console.log('[MediaPicker] Display después:', getComputedStyle(panel).display);
      
      // Cargar GIFs trending cuando se abre el panel
      const gifsGrid = document.getElementById('gifsGrid');
      console.log('[MediaPicker] gifsGrid encontrado:', !!gifsGrid);
      
      if (gifsGrid) {
        console.log('[MediaPicker] gifsGrid tiene', gifsGrid.children.length, 'elementos');
        if (gifsGrid.children.length === 0) {
          console.log('[MediaPicker] 🔄 Cargando GIFs trending...');
          this.loadTrendingGifs();
        }
      } else {
        console.error('[MediaPicker] ❌ gifsGrid no existe en el DOM');
      }
    } else {
      panel.classList.add('hidden');
      panel.style.display = 'none';
      console.log('[MediaPicker] Panel ocultado');
    }
    
    console.log('[MediaPicker] ===== FIN togglePicker =====');
  }
  
  // ==================== GIFs ====================
  async searchGifs(query) {
    if (!query || query.trim() === '') {
      this.loadTrendingGifs();
      return;
    }
    
    try {
      const limit = 20;
      const url = `${this.giphyBaseUrl}/gifs/search?api_key=${this.giphyApiKey}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g&lang=es`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.meta.status === 200) {
        this.renderGifs(data.data || []);
      } else {
        throw new Error(data.meta.msg || 'Error en la búsqueda');
      }
    } catch (error) {
      console.error('[MediaPicker] Error buscando GIFs:', error);
      document.getElementById('gifsGrid').innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">
          ❌ Error cargando GIFs
        </div>
      `;
    }
  }
  
  async loadTrendingGifs() {
    try {
      const limit = 20;
      const url = `${this.giphyBaseUrl}/gifs/trending?api_key=${this.giphyApiKey}&limit=${limit}&rating=g`;
      
      console.log('[MediaPicker] Fetching:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('[MediaPicker] Giphy response:', data.meta, 'results:', data.data?.length);
      
      if (data.meta.status === 200) {
        this.renderGifs(data.data || []);
      } else {
        console.error('[MediaPicker] Error en respuesta Giphy:', data.meta);
      }
    } catch (error) {
      console.error('[MediaPicker] Error cargando GIFs trending:', error);
    }
  }
  
  renderGifs(gifs) {
    const grid = document.getElementById('gifsGrid');
    console.log('[MediaPicker] renderGifs - grid:', !!grid, 'gifs:', gifs.length);
    
    if (!grid) {
      console.error('[MediaPicker] No se encontró gifsGrid en renderGifs');
      return;
    }
    
    if (gifs.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">
          😔 No se encontraron GIFs
        </div>
      `;
      return;
    }
    
    grid.innerHTML = gifs.map(gif => {
      const gifUrl = gif.images.fixed_height_small.url;
      const title = gif.title || 'GIF';
      const isFavorite = this.isFavorite('gifs', gifUrl);
      
      return `
        <div class="media-item" data-url="${gifUrl}" data-title="${this.escapeHtml(title)}">
          <img src="${gifUrl}" alt="${this.escapeHtml(title)}" loading="lazy">
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); window.mediaPickerManager.toggleFavorite('gifs', '${this.escapeHtml(gifUrl)}', '${this.escapeHtml(title)}')">
            ${isFavorite ? '⭐' : '☆'}
          </button>
        </div>
      `;
    }).join('');
    
    console.log('[MediaPicker] GIFs renderizados:', grid.children.length);
    
    // Agregar event listeners
    grid.querySelectorAll('.media-item').forEach(item => {
      item.addEventListener('click', () => {
        this.insertMedia(item.dataset.url, 'gif');
      });
    });
  }
  
  // ==================== STICKERS ====================
  async searchStickers(query) {
    if (!query || query.trim() === '') {
      this.loadTrendingStickers();
      return;
    }
    
    try {
      const limit = 20;
      const url = `${this.giphyBaseUrl}/stickers/search?api_key=${this.giphyApiKey}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g&lang=es`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.meta.status === 200) {
        this.renderStickers(data.data || []);
      } else {
        throw new Error(data.meta.msg || 'Error en la búsqueda');
      }
    } catch (error) {
      console.error('[MediaPicker] Error buscando stickers:', error);
      document.getElementById('stickersGrid').innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">
          ❌ Error cargando stickers
        </div>
      `;
    }
  }
  
  async loadTrendingStickers() {
    try {
      const limit = 20;
      const url = `${this.giphyBaseUrl}/stickers/trending?api_key=${this.giphyApiKey}&limit=${limit}&rating=g`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.meta.status === 200) {
        this.renderStickers(data.data || []);
      }
    } catch (error) {
      console.error('[MediaPicker] Error cargando stickers trending:', error);
    }
  }
  
  renderStickers(stickers) {
    const grid = document.getElementById('stickersGrid');
    if (!grid) return;
    
    if (stickers.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">
          😔 No se encontraron stickers
        </div>
      `;
      return;
    }
    
    grid.innerHTML = stickers.map(sticker => {
      const stickerUrl = sticker.images.fixed_height_small.url;
      const title = sticker.title || 'Sticker';
      const isFavorite = this.isFavorite('stickers', stickerUrl);
      
      return `
        <div class="media-item" data-url="${stickerUrl}" data-title="${this.escapeHtml(title)}">
          <img src="${stickerUrl}" alt="${this.escapeHtml(title)}" loading="lazy">
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); window.mediaPickerManager.toggleFavorite('stickers', '${this.escapeHtml(stickerUrl)}', '${this.escapeHtml(title)}')">
            ${isFavorite ? '⭐' : '☆'}
          </button>
        </div>
      `;
    }).join('');
    
    // Agregar event listeners
    grid.querySelectorAll('.media-item').forEach(item => {
      item.addEventListener('click', () => {
        this.insertMedia(item.dataset.url, 'sticker');
      });
    });
  }
  
  // ==================== FAVORITOS ====================
  async loadFavorites() {
    if (!this.profiles?.currentProfile?.isLoggedIn) {
      console.log('[MediaPicker] Usuario no logueado, omitiendo carga de favoritos');
      return;
    }
    
    try {
      // Usar username en lugar de userId
      const username = this.profiles.currentProfile.username;
      if (!username) {
        console.warn('[MediaPicker] Username no disponible');
        return;
      }
      
      const userDoc = await this.firebase.getUserProfile(username);
      
      if (userDoc && userDoc.favorites) {
        this.favorites = {
          gifs: userDoc.favorites.gifs || [],
          stickers: userDoc.favorites.stickers || [],
          images: userDoc.favorites.images || []
        };
      }
      
      this.renderFavorites();
    } catch (error) {
      console.error('[MediaPicker] Error cargando favoritos:', error);
    }
  }
  
  renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;
    
    const allFavorites = [
      ...this.favorites.gifs.map(f => ({ ...f, type: 'gif' })),
      ...this.favorites.stickers.map(f => ({ ...f, type: 'sticker' })),
      ...this.favorites.images.map(f => ({ ...f, type: 'image' }))
    ];
    
    if (allFavorites.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">
          ⭐ No tienes favoritos aún<br>
          <small>Haz click en ☆ para agregar a favoritos</small>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = allFavorites.map(item => `
      <div class="media-item" data-url="${item.url}" data-type="${item.type}">
        <img src="${item.url}" alt="${item.title}" loading="lazy">
        <button class="favorite-btn active" onclick="event.stopPropagation(); window.mediaPickerManager.toggleFavorite('${item.type}s', '${item.url}', '${item.title}')">
          ⭐
        </button>
      </div>
    `).join('');
    
    // Agregar event listeners
    grid.querySelectorAll('.media-item').forEach(item => {
      item.addEventListener('click', () => {
        this.insertMedia(item.dataset.url, item.dataset.type);
      });
    });
  }
  
  async toggleFavorite(type, url, title) {
    if (!this.profiles?.currentProfile?.isLoggedIn) {
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification('⚠️ Debes iniciar sesión para guardar favoritos', 'warning');
      }
      return;
    }
    
    const index = this.favorites[type].findIndex(f => f.url === url);
    
    if (index > -1) {
      // Remover de favoritos
      this.favorites[type].splice(index, 1);
    } else {
      // Agregar a favoritos
      this.favorites[type].push({ url, title, addedAt: Date.now() });
    }
    
    // Guardar en Firebase
    await this.saveFavorites();
    
    // Re-renderizar todo
    this.renderFavorites();
    
    // Actualizar la vista actual
    const activeTab = document.querySelector('.nav-link.active').dataset.bsTarget;
    if (activeTab === '#gifsTab') {
      document.getElementById('gifSearch').dispatchEvent(new Event('keyup'));
    } else if (activeTab === '#stickersTab') {
      document.getElementById('stickerSearch').dispatchEvent(new Event('keyup'));
    }
  }
  
  isFavorite(type, url) {
    return this.favorites[type].some(f => f.url === url);
  }
  
  async saveFavorites() {
    if (!this.profiles?.currentProfile?.isLoggedIn) return;
    
    try {
      const username = this.profiles.currentProfile.username;
      if (!username) {
        console.warn('[MediaPicker] Username no disponible para guardar favoritos');
        return;
      }
      
      await this.firebase.updateUserProfile(username, {
        favorites: this.favorites
      });
    } catch (error) {
      console.error('[MediaPicker] Error guardando favoritos:', error);
    }
  }
  
  // ==================== INSERTAR MEDIA ====================
  insertMedia(url, type) {
    // Intentar encontrar el campo de comentarios (puede estar en diferentes modales)
    const commentInput = document.getElementById('commentInput') || document.getElementById('commentText');
    if (!commentInput) return;
    
    // Insertar como markdown/HTML
    const mediaMarkdown = type === 'gif' ? 
      `![GIF](${url})` : 
      `![${type}](${url})`;
    
    const currentValue = commentInput.value;
    const newValue = currentValue + (currentValue ? ' ' : '') + mediaMarkdown;
    
    commentInput.value = newValue;
    commentInput.focus();
    
    // Cerrar el picker
    this.togglePicker();
    
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification(`✅ ${type === 'gif' ? 'GIF' : 'Sticker'} agregado`, 'success');
    }
  }
  
  // ==================== UTILIDADES ====================
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
