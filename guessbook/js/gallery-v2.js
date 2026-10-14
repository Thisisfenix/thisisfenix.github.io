// ==================== GALLERY V2 - REESCRITO DESDE CERO ====================
// Versión limpia con mejores prácticas y arquitectura modular
// Compatible con: v1, new, old

export class GalleryManager {
  constructor(firebaseManager) {
    this.firebase = firebaseManager;
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.currentFilter = 'all';
    this.allDrawings = [];
    this.filteredDrawings = [];
    this.version = this.detectVersion();
    
    console.log(`[GalleryV2] Inicializado para versión: ${this.version}`);
  }
  
  detectVersion() {
    if (window.location.pathname.includes('v1') || window.location.pathname.includes('v2')) return 'v1';
    if (window.location.pathname.includes('new')) return 'new';
    return 'old';
  }

  // ==================== CARGA DE DATOS ====================
  async loadGallery() {
    try {
      console.log('[GalleryV2] Cargando dibujos...');
      const drawings = await this.firebase.getDrawings();
      this.allDrawings = drawings.sort((a, b) => b.data.timestamp - a.data.timestamp);
      this.applyFilter();
      this.displayGallery();
      console.log(`[GalleryV2] ${this.allDrawings.length} dibujos cargados`);
    } catch (error) {
      console.error('[GalleryV2] Error cargando galería:', error);
      this.showError('Error al cargar la galería');
    }
  }

  async loadDrawings() {
    return this.loadGallery();
  }

  // ==================== FILTROS ====================
  applyFilter() {
    if (this.currentFilter === 'all') {
      this.filteredDrawings = [...this.allDrawings];
    } else {
      this.filteredDrawings = this.allDrawings.filter(d => 
        d.data.categoria === this.currentFilter
      );
    }
    this.currentPage = 1;
  }

  // ==================== RENDERIZADO ====================
  displayGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) {
      console.warn('[GalleryV2] Elemento #gallery no encontrado');
      return;
    }

    if (this.filteredDrawings.length === 0) {
      gallery.innerHTML = this.createEmptyState();
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    let pageDrawings = this.filteredDrawings.slice(startIndex, endIndex);

    // Obtener top 3 por likes para primera página
    let topDrawings = [];
    if (this.currentPage === 1 && this.currentFilter === 'all') {
      topDrawings = [...this.allDrawings]
        .filter(d => (d.data.likes || 0) > 0)
        .sort((a, b) => (b.data.likes || 0) - (a.data.likes || 0))
        .slice(0, 3);
      
      // Remover top 3 de pageDrawings para evitar duplicados
      const topIds = topDrawings.map(d => d.id);
      pageDrawings = pageDrawings.filter(d => !topIds.includes(d.id));
    }

    let galleryHTML = '';
    
    // Agregar top 3 al principio si es primera página
    if (topDrawings.length > 0) {
      galleryHTML += topDrawings.map((drawing, index) => 
        this.createDrawingCard(drawing, index + 1)
      ).join('');
    }
    
    // Agregar resto de dibujos
    galleryHTML += pageDrawings.map(drawing => this.createDrawingCard(drawing)).join('');
    
    gallery.innerHTML = galleryHTML;
    console.log('[GalleryV2] HTML insertado, longitud:', galleryHTML.length);
    console.log('[GalleryV2] Elementos .drawing-card encontrados:', document.querySelectorAll('.drawing-card').length);
    
    // Renderizar paginación
    this.renderPagination();
    
    // Debug: verificar si las imágenes se renderizaron
    setTimeout(() => {
      const images = document.querySelectorAll('#gallery img');
      console.log('[GalleryV2] Total de <img> tags:', images.length);
      images.forEach((img, i) => {
        if (i < 3) { // Solo las primeras 3
          console.log(`  Img ${i}:`, {
            src: img.src ? img.src.substring(0, 50) + '...' : 'NO SRC',
            width: img.offsetWidth,
            height: img.offsetHeight,
            display: getComputedStyle(img).display,
            visibility: getComputedStyle(img).visibility,
            position: getComputedStyle(img).position,
            parent: img.parentElement.className
          });
        }
      });
      
      // Ver el HTML de la primera card
      const firstCard = document.querySelector('.drawing-image-container');
      if (firstCard) {
        console.log('[GalleryV2] HTML de primera card:');
        console.log(firstCard.innerHTML.substring(0, 500));
        console.log('[GalleryV2] Container dimensions:', {
          width: firstCard.offsetWidth,
          height: firstCard.offsetHeight,
          display: getComputedStyle(firstCard).display,
          position: getComputedStyle(firstCard).position
        });
      }
    }, 100);
    
    this.setupLikeButtons();
    
    // Cargar avatares de usuarios
    this.loadUserAvatars();
  }

  createEmptyState() {
    return `
      <div class="col-12 text-center py-5">
        <div style="color: var(--text-secondary); font-size: 1.2em;">
          <i class="fas fa-palette" style="font-size: 3em; margin-bottom: 20px; opacity: 0.5;"></i>
          <p>No hay dibujos para mostrar</p>
        </div>
      </div>
    `;
  }

  createDrawingCard(drawing, rank = null) {
    const likes = drawing.data.likes || 0;
    const comments = drawing.data.comments || [];
    const isLiked = localStorage.getItem(`liked_${drawing.id}`) === 'true';
    
    const imageData = drawing.data.imagenData || drawing.data.imageData;
    const author = drawing.data.autor || drawing.data.author || 'Anónimo';
    const title = drawing.data.titulo || drawing.data.title || 'Sin título';
    const category = drawing.data.categoria || drawing.data.category || 'General';
    const timestamp = drawing.data.timestamp || Date.now();
    const description = drawing.data.descripcion || drawing.data.description || '';
    
    // Debug: verificar si hay imageData
    if (!imageData) {
      console.warn('⚠️ Drawing sin imageData:', drawing.id, title);
    } else {
      console.log('✅ Drawing con imageData:', title, 'Length:', imageData.length);
    }

    // Detectar contenido animado
    const hasBackgroundGif = drawing.data.backgroundGif && drawing.data.backgroundGif !== '';
    const hasGifStickers = drawing.data.gifStickers && Array.isArray(drawing.data.gifStickers) && drawing.data.gifStickers.length > 0;
    const isAnimated = hasBackgroundGif || drawing.data.isAnimated || hasGifStickers;

    // Crear contenido de imagen - SIMPLIFICADO con background-image
    let imageContent = '';
    if (hasBackgroundGif || hasGifStickers) {
      // Caso complejo: con capas de GIF
      imageContent = `
        <div style="position: relative; width: 100%; height: 200px; background: white; border-radius: 4px; overflow: hidden;">
          ${hasBackgroundGif ? `<img src="${drawing.data.backgroundGif}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1;" alt="Fondo GIF">` : ''}
          <img src="${imageData}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 2; ${hasBackgroundGif ? 'mix-blend-mode: multiply;' : ''}" alt="Dibujo">
          ${hasGifStickers ? drawing.data.gifStickers.map(sticker => `<img src="${sticker.src}" style="position: absolute; left: ${(sticker.x / 600) * 100}%; top: ${(sticker.y / 400) * 100}%; width: ${(sticker.width / 600) * 100}%; height: ${(sticker.height / 400) * 100}%; z-index: 3;" alt="Sticker">`).join('') : ''}
        </div>
      `;
    } else {
      // Caso simple: usar background-image en lugar de <img>
      imageContent = `<div style="width: 100%; height: 200px; background-image: url('${imageData}'); background-size: contain; background-position: center; background-repeat: no-repeat; background-color: white; border-radius: 4px;"></div>`;
    }

    // Badge animado
    const animatedBadge = isAnimated ? `
      <span class="animated-badge">🎬 ${hasGifStickers && hasBackgroundGif ? 'GIF+Stickers' : hasGifStickers ? 'Stickers' : 'GIF'}</span>
    ` : '';

    // Badge de rank para tops
    const rankClass = rank ? `top-drawing rank-${rank}` : '';
    const rankBadge = rank ? `<div class="rank-badge rank-${rank}">${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</div>` : '';

    // Descripción truncada
    const descriptionHTML = description ? `
      <p class="drawing-description" style="color: var(--text-secondary); font-size: 0.85em; margin: 0.5rem 0; line-height: 1.4; max-height: 2.8em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
        ${description}
      </p>
    ` : '';

    return `
      <div class="col">
        <div class="drawing-card ${rankClass}" data-id="${drawing.id}">
          ${rankBadge}
          <div class="drawing-image-container" onclick="openDrawingModal('${drawing.id}')">
            ${imageContent}
            <div class="drawing-overlay">
              <span class="category-badge">${category}</span>
              <div>
                ${comments.length > 0 ? `<span class="comments-badge">💬 ${comments.length}</span>` : ''}
                ${animatedBadge}
              </div>
            </div>
          </div>
          
          <div class="drawing-info">
            <h6 class="drawing-title">${title}</h6>
            ${descriptionHTML}
            <div class="drawing-author">
              <span class="author-avatar" data-author="${author}">👤</span>
              <span class="author-name" ${author !== 'Anónimo' ? `style="cursor: pointer;" onclick="showUserProfile('${author}')"` : ''}>${author}</span>
            </div>
            
            <div class="drawing-actions">
              <div class="drawing-stats">
                <button class="btn-like ${isLiked ? 'liked' : ''}" 
                        data-id="${drawing.id}" 
                        onclick="event.stopPropagation(); likeDrawing('${drawing.id}')">
                  ❤️ <span class="like-count">${likes}</span>
                </button>
                
                <button class="btn-comment" onclick="event.stopPropagation(); openDrawingModal('${drawing.id}')">
                  💬 ${comments.length}
                </button>
              </div>
              
              <small class="drawing-date">${new Date(timestamp).toLocaleDateString('es-ES')}</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== LIKES ====================
  setupLikeButtons() {
    document.querySelectorAll('.btn-like').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const drawingId = btn.dataset.id;
        await this.toggleLike(drawingId);
      });
    });
  }
  
  // ==================== PAGINACIÓN ====================
  renderPagination() {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) {
      console.warn('[GalleryV2] Contenedor de paginación no encontrado');
      return;
    }
    
    const totalPages = Math.ceil(this.filteredDrawings.length / this.itemsPerPage);
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    let paginationHTML = '<nav aria-label="Paginación de galería"><ul class="pagination justify-content-center">';
    
    // Botón anterior
    paginationHTML += `
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="window.galleryManager.goToPage(${this.currentPage - 1}); return false;">
          ‹ Anterior
        </a>
      </li>
    `;
    
    // Primera página
    if (startPage > 1) {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" onclick="window.galleryManager.goToPage(1); return false;">1</a>
        </li>
      `;
      if (startPage > 2) {
        paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
    }
    
    // Páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" onclick="window.galleryManager.goToPage(${i}); return false;">${i}</a>
        </li>
      `;
    }
    
    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" onclick="window.galleryManager.goToPage(${totalPages}); return false;">${totalPages}</a>
        </li>
      `;
    }
    
    // Botón siguiente
    paginationHTML += `
      <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="window.galleryManager.goToPage(${this.currentPage + 1}); return false;">
          Siguiente ›
        </a>
      </li>
    `;
    
    paginationHTML += '</ul></nav>';
    
    // Agregar info de página actual
    const start = ((this.currentPage - 1) * this.itemsPerPage) + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredDrawings.length);
    paginationHTML += `
      <div class="text-center text-muted mt-2" style="font-size: 0.9rem;">
        Mostrando ${start}-${end} de ${this.filteredDrawings.length} dibujos
      </div>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
  }
  
  goToPage(page) {
    const totalPages = Math.ceil(this.filteredDrawings.length / this.itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    this.currentPage = page;
    this.displayGallery();
    
    // Scroll suave al inicio de la galería
    const gallery = document.getElementById('gallery');
    if (gallery) {
      gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async toggleLike(drawingId) {
    const storageKey = `liked_${drawingId}`;
    const isCurrentlyLiked = localStorage.getItem(storageKey) === 'true';
    const newLikedState = !isCurrentlyLiked;
    
    // Obtener username del perfil actual
    const username = window.guestbookApp?.profiles?.currentProfile?.username || 'Anónimo';
    
    try {
      const drawing = await this.firebase.getDrawing(drawingId);
      if (!drawing) return;

      // Usar el nuevo método que guarda likedBy
      await this.firebase.toggleLike(drawingId, username, newLikedState);
      
      // Actualizar localStorage
      localStorage.setItem(storageKey, newLikedState.toString());

      // Actualizar UI
      const btn = document.querySelector(`.btn-like[data-id="${drawingId}"]`);
      if (btn) {
        btn.classList.toggle('liked');
        const currentLikes = drawing.data.likes || 0;
        const newLikes = newLikedState ? currentLikes + 1 : Math.max(0, currentLikes - 1);
        btn.querySelector('.like-count').textContent = newLikes;
      }

      // Actualizar en memoria
      const drawingIndex = this.allDrawings.findIndex(d => d.id === drawingId);
      if (drawingIndex !== -1) {
        const currentLikes = this.allDrawings[drawingIndex].data.likes || 0;
        this.allDrawings[drawingIndex].data.likes = newLikedState ? currentLikes + 1 : Math.max(0, currentLikes - 1);
        
        // Actualizar likedBy en memoria
        const likedBy = this.allDrawings[drawingIndex].data.likedBy || [];
        if (newLikedState) {
          this.allDrawings[drawingIndex].data.likedBy = [...new Set([...likedBy, username])];
        } else {
          this.allDrawings[drawingIndex].data.likedBy = likedBy.filter(user => user !== username);
        }
      }
      
      console.log(`${newLikedState ? '❤️' : '💔'} Like ${newLikedState ? 'dado' : 'removido'} por ${username}`);
    } catch (error) {
      console.error('[GalleryV2] Error al dar like:', error);
    }
  }
  
  // ==================== USER AVATARS ====================
  async loadUserAvatars() {
    // Obtener todos los avatares únicos que necesitamos cargar
    const authorElements = document.querySelectorAll('.author-avatar[data-author]');
    const uniqueAuthors = new Set();
    
    authorElements.forEach(el => {
      const author = el.dataset.author;
      if (author && author !== 'Anónimo') {
        uniqueAuthors.add(author);
      }
    });
    
    // Cargar perfiles de usuarios en batch
    const profilesCache = {};
    
    for (const username of uniqueAuthors) {
      try {
        const profile = await this.firebase.getUserProfile(username);
        if (profile) {
          profilesCache[username] = profile;
        }
      } catch (error) {
        console.warn(`No se pudo cargar perfil de ${username}:`, error);
      }
    }
    
    // Actualizar avatares en el DOM
    authorElements.forEach(el => {
      const author = el.dataset.author;
      const profile = profilesCache[author];
      
      if (profile) {
        // Limpiar contenido anterior
        el.innerHTML = '';
        
        if (profile.avatarImage) {
          // Avatar de imagen
          el.style.backgroundImage = `url(${profile.avatarImage})`;
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
          el.classList.add('has-image');
        } else if (profile.avatarType === 'text') {
          // Avatar de texto
          el.textContent = profile.avatar;
          el.classList.add('avatar-text');
        } else {
          // Avatar emoji
          el.textContent = profile.avatar || '👤';
          el.classList.add('avatar-emoji');
        }
      }
    });
    
    console.log(`✅ Cargados ${Object.keys(profilesCache).length} avatares de usuario`);
  }

  // ==================== ERROR HANDLING ====================
  showError(message) {
    const gallery = document.getElementById('gallery');
    if (gallery) {
      gallery.innerHTML = `
        <div class="col-12 text-center py-5">
          <div style="color: var(--text-secondary);">
            <p>⚠️ ${message}</p>
          </div>
        </div>
      `;
    }
  }
}

// ==================== MODAL DE IMAGEN - CLASE LIMPIA ====================
class DrawingModal {
  constructor(drawingId) {
    this.drawingId = drawingId;
    this.drawing = null;
    this.modal = null;
    this.attachedMedia = []; // Array para GIFs/imágenes adjuntas
  }

  async load() {
    try {
      const result = await window.guestbookApp.firebase.getDrawing(this.drawingId);
      this.drawing = result?.data;
      return this.drawing !== null;
    } catch (error) {
      console.error('[DrawingModal] Error cargando dibujo:', error);
      return false;
    }
  }

  async show() {
    const loaded = await this.load();
    if (!loaded) {
      alert('Error al cargar el dibujo');
      return;
    }

    this.removeExisting();
    this.create();
    this.render();
    this.attachEvents();
    await this.loadComments();
    
    // Exponer globalmente para acceso desde onclick
    window.currentDrawingModal = this;
  }

  removeExisting() {
    const existing = document.querySelector('.drawing-modal');
    if (existing) existing.remove();
  }

  create() {
    this.modal = document.createElement('div');
    this.modal.className = 'drawing-modal';
    this.modal.innerHTML = this.getTemplate();
    document.body.appendChild(this.modal);
  }

  getTemplate() {
    const isMobile = window.innerWidth <= 768;
    const imageData = this.drawing.imagenData || this.drawing.imageData;
    const author = this.drawing.autor || this.drawing.author || 'Anónimo';
    const title = this.drawing.titulo || this.drawing.title || 'Sin título';
    const timestamp = this.drawing.timestamp || Date.now();
    const likes = this.drawing.likes || 0;
    const commentsCount = (this.drawing.comments || []).length;

    // Detectar contenido animado
    const hasBackgroundGif = this.drawing.backgroundGif && this.drawing.backgroundGif !== '';
    const hasGifStickers = this.drawing.gifStickers && Array.isArray(this.drawing.gifStickers) && this.drawing.gifStickers.length > 0;

    // Crear contenido de imagen
    let imageHTML = '';
    if (hasBackgroundGif || hasGifStickers) {
      const containerStyle = `position: relative; width: 600px; height: 400px; max-width: 100%; max-height: 60vh; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3); background: white; margin: 0 auto;`;
      
      imageHTML = `
        <div style="${containerStyle}">
          ${hasBackgroundGif ? `<img src="${this.drawing.backgroundGif}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1;" alt="GIF de fondo">` : ''}
          <img src="${imageData}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 2; ${hasBackgroundGif ? 'mix-blend-mode: multiply; opacity: 0.9;' : ''}" alt="Dibujo">
          ${hasGifStickers ? this.drawing.gifStickers.map((sticker, idx) => `<img src="${sticker.src}" style="position: absolute; left: ${(sticker.x / 600) * 100}%; top: ${(sticker.y / 400) * 100}%; width: ${(sticker.width / 600) * 100}%; height: ${(sticker.height / 400) * 100}%; z-index: 3;" alt="Sticker ${idx}">`).join('') : ''}
        </div>
      `;
    } else {
      imageHTML = `<img src="${imageData}" class="modal-image" alt="${title}">`;
    }

    return `
      <div class="modal-overlay">
        <div class="modal-container ${isMobile ? 'mobile' : ''}">
          <div class="modal-image-section">
            <button class="modal-close" onclick="this.closest('.drawing-modal').remove()">✖</button>
            ${imageHTML}
            <div class="modal-actions">
              <button class="btn-secondary" onclick="this.closest('.drawing-modal').remove()">
                Cerrar
              </button>
              <div class="download-container">
                <button class="btn-primary" onclick="toggleDownloadOptions('${this.drawingId}')">
                  💾 Descargar
                  <i data-lucide="chevron-down" style="width: 16px; height: 16px; margin-left: 4px;"></i>
                </button>
                
                <!-- Menú desplegable de opciones de descarga -->
                <div id="download-options-${this.drawingId}" class="download-options-menu" style="display: none;">
                  <button class="download-option" onclick="executeDownload('${this.drawingId}', 'white')">
                    <i data-lucide="image" style="width: 18px; height: 18px;"></i>
                    <div>
                      <strong>PNG con fondo blanco</strong>
                      <small>Ideal para imprimir</small>
                    </div>
                  </button>
                  <button class="download-option" onclick="executeDownload('${this.drawingId}', 'transparent')">
                    <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>
                    <div>
                      <strong>PNG transparente</strong>
                      <small>Perfecto para edición</small>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-comments-section">
            <div class="modal-header">
              <div class="author-info">
                <span class="author-avatar" data-author="${author}">👤</span>
                <div>
                  <h6 ${author !== 'Anónimo' ? `style="cursor: pointer;" onclick="showUserProfile('${author}')"` : ''}>${author}</h6>
                  <small>${new Date(timestamp).toLocaleDateString('es-ES')}</small>
                </div>
              </div>
              <div class="drawing-stats">
                <span>❤️ ${likes}</span>
                <span>💬 ${commentsCount}</span>
              </div>
            </div>

            <h5 class="comments-title">💬 Comentarios</h5>
            <div class="comments-list">
              <div class="loading">Cargando comentarios...</div>
            </div>

            <div class="comment-form">
              ${this.getCommentFormFields()}
              
              <!-- Panel de Media Picker (antes del textarea) -->
              <div id="mediaPickerPanel" class="hidden">
                <ul class="nav nav-pills nav-fill mb-2" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="gifsTabBtn" type="button">🎬 GIFs</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="imagesTabBtn" type="button">🖼️ Imágenes</button>
                  </li>
                </ul>
                
                <div class="tab-content">
                  <!-- Tab de GIFs -->
                  <div class="tab-pane show active" id="gifsTab">
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                      <input type="text" class="form-control form-control-sm" id="gifSearch" placeholder="Buscar GIFs..." style="flex: 1;">
                      <button class="btn-secondary btn-sm" id="gifSearchBtn" style="padding: 4px 12px;">🔍 Buscar</button>
                    </div>
                    <div id="gifsGrid" class="media-grid"></div>
                  </div>
                  
                  <!-- Tab de Imágenes -->
                  <div class="tab-pane" id="imagesTab">
                    <div style="text-align: center; padding: 1rem;">
                      <input type="file" id="imageUpload" accept="image/*" style="display: none;">
                      <button class="btn-primary btn-sm" id="uploadImageBtn" style="padding: 8px 16px;">
                        📤 Subir Imagen
                      </button>
                      <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-secondary);">
                        PNG, JPG, GIF • Las imágenes >1MB se optimizan automáticamente
                      </div>
                    </div>
                    <div id="uploadedImages" class="media-grid"></div>
                  </div>
                </div>
              </div>
              
              <!-- Textarea con controles integrados -->
              <div class="textarea-container">
                <!-- Preview de medias adjuntos -->
                <div id="mediaPreview" class="comment-media-preview" style="display: none;"></div>
                
                <textarea id="commentText" 
                          placeholder="Escribe un comentario..." 
                          maxlength="500" 
                          rows="3"></textarea>
                <div class="textarea-actions">
                  <button class="media-picker-btn" id="mediaPickerBtn" title="Agregar GIF o Sticker">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </button>
                  <button class="btn-primary btn-comment" onclick="submitComment('${this.drawingId}')">
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    // Modal ya renderizado en create()
  }

  // ==================== MÉTODOS AUXILIARES PARA FORMULARIOS ====================
  getCommentFormFields() {
    const isLoggedIn = window.guestbookApp?.profiles?.currentProfile?.isLoggedIn || false;
    
    if (isLoggedIn) {
      const profile = window.guestbookApp.profiles.currentProfile;
      
      // Generar avatar según el tipo
      let avatarDisplay = '';
      if (profile.avatarImage) {
        // Avatar de imagen
        avatarDisplay = `<div class="avatar-image-mini" style="background-image: url(${profile.avatarImage});"></div>`;
      } else if (profile.avatarType === 'text') {
        // Avatar de texto
        avatarDisplay = `<span class="avatar-text-mini">${profile.avatar}</span>`;
      } else {
        // Avatar emoji
        avatarDisplay = `<span class="avatar-emoji-mini">${profile.avatar}</span>`;
      }
      
      return `
        <div class="logged-user-info" style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(var(--primary-rgb), 0.1); border-radius: 8px; margin-bottom: 8px;">
          ${avatarDisplay}
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.9rem;">${profile.username}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Comentando como ${profile.username}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <input type="text" 
               id="commentAuthor" 
               placeholder="Tu nombre (o deja vacío para ser Anónimo)" 
               maxlength="50"
               style="margin-bottom: 8px;">
      `;
    }
  }
  
  getReplyFormFields() {
    const isLoggedIn = window.guestbookApp?.profiles?.currentProfile?.isLoggedIn || false;
    
    if (isLoggedIn) {
      const profile = window.guestbookApp.profiles.currentProfile;
      
      // Generar avatar según el tipo
      let avatarDisplay = '';
      if (profile.avatarImage) {
        // Avatar de imagen
        avatarDisplay = `<div class="avatar-image-mini" style="background-image: url(${profile.avatarImage});"></div>`;
      } else if (profile.avatarType === 'text') {
        // Avatar de texto
        avatarDisplay = `<span class="avatar-text-mini">${profile.avatar}</span>`;
      } else {
        // Avatar emoji
        avatarDisplay = `<span class="avatar-emoji-mini">${profile.avatar}</span>`;
      }
      
      return `
        <div class="logged-user-info" style="display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: rgba(var(--primary-rgb), 0.1); border-radius: 8px; margin-bottom: 8px;">
          ${avatarDisplay}
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.85rem;">${profile.username}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <input type="text" 
               class="reply-author" 
               placeholder="Tu nombre (o deja vacío para ser Anónimo)" 
               maxlength="50"
               style="margin-bottom: 8px;">
      `;
    }
  }

  // ==================== MEDIA PICKER INTEGRADO ====================
  toggleMediaPicker() {
    const panel = this.modal.querySelector('#mediaPickerPanel');
    if (!panel) return;
    
    if (panel.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      // Cargar GIFs si está vacío
      const grid = panel.querySelector('#gifsGrid');
      if (grid && grid.children.length === 0) {
        this.loadTrendingGifs();
      }
    } else {
      panel.classList.add('hidden');
    }
  }

  async loadTrendingGifs() {
    const grid = this.modal.querySelector('#gifsGrid');
    if (!grid) return;

    // Mostrar loading con spinner
    grid.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">🎬 Cargando GIFs...</div>
      </div>
    `;

    try {
      const apiKey = 'l8Gj9vUxfYXTpHUbZDj0PyQx5ZXiyJCa';
      const url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.meta.status === 200) {
        this.renderGifs(data.data || []);
      } else {
        grid.innerHTML = '<div style="text-align: center; padding: 1rem; color: var(--text-secondary);">❌ Error: ' + data.meta.msg + '</div>';
      }
    } catch (error) {
      console.error('[Gallery] Error cargando GIFs:', error);
      grid.innerHTML = '<div style="text-align: center; padding: 1rem; color: var(--text-secondary);">❌ Error cargando GIFs</div>';
    }
  }

  async searchGifs(query) {
    const grid = this.modal.querySelector('#gifsGrid');
    if (!grid) return;

    if (!query || query.trim() === '') {
      this.loadTrendingGifs();
      return;
    }

    // Mostrar loading con spinner
    grid.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">🔍 Buscando "${query}"...</div>
      </div>
    `;

    try {
      const apiKey = 'l8Gj9vUxfYXTpHUbZDj0PyQx5ZXiyJCa';
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g&lang=es`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.meta.status === 200) {
        this.renderGifs(data.data || []);
      }
    } catch (error) {
      console.error('[Gallery] Error buscando GIFs:', error);
      grid.innerHTML = '<div style="text-align: center; padding: 1rem; color: var(--text-secondary);">❌ Error en la búsqueda</div>';
    }
  }

  renderGifs(gifs) {
    const grid = this.modal.querySelector('#gifsGrid');
    if (!grid) return;

    if (gifs.length === 0) {
      grid.innerHTML = '<div style="text-align: center; padding: 1rem; color: var(--text-secondary);">😔 No se encontraron GIFs</div>';
      return;
    }

    console.log('[Gallery] Renderizando', gifs.length, 'GIFs');
    console.log('[Gallery] Primer GIF URL:', gifs[0]?.images?.fixed_height_small?.url);

    grid.innerHTML = gifs.map((gif, index) => {
      const gifUrl = gif.images.fixed_height_small.url;
      const title = (gif.title || 'GIF').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
      
      return `
        <div class="media-item" data-url="${gifUrl}" data-index="${index}" title="${title}">
          <img 
            src="${gifUrl}" 
            alt="${title}" 
            loading="eager"
            crossorigin="anonymous"
            onload="console.log('✅ GIF ${index} cargado')"
            onerror="console.error('❌ GIF ${index} falló:', this.src); this.style.background='#ff0000';"
            style="width: 100%; height: 100%; object-fit: cover; display: block;">
        </div>
      `;
    }).join('');

    console.log('[Gallery] Grid innerHTML length:', grid.innerHTML.length);
    console.log('[Gallery] Grid tiene', grid.querySelectorAll('.media-item').length, 'items');

    // Event listeners para insertar GIF
    grid.querySelectorAll('.media-item').forEach(item => {
      item.addEventListener('click', () => {
        console.log('[Gallery] Click en GIF:', item.dataset.url);
        this.insertMedia(item.dataset.url);
      });
    });
  }

  insertMedia(url, type = 'gif') {
    // Agregar al array de medias
    this.attachedMedia.push({ url, type });
    
    // Actualizar preview
    this.updateMediaPreview();
    
    // Cerrar el picker
    this.toggleMediaPicker();
    
    console.log('[Gallery] Media agregado:', { url: url.substring(0, 50) + '...', type });
    console.log('[Gallery] Total adjuntos:', this.attachedMedia.length);
  }

  updateMediaPreview() {
    const preview = this.modal.querySelector('#mediaPreview');
    if (!preview) return;

    if (this.attachedMedia.length === 0) {
      preview.style.display = 'none';
      return;
    }

    preview.style.display = 'flex';
    preview.innerHTML = this.attachedMedia.map((media, index) => {
      const label = media.type === 'image' ? 'Imagen' : 'GIF';
      return `
        <div class="media-preview-item">
          <img src="${media.url}" alt="${label} ${index + 1}">
          <button class="media-preview-remove" onclick="window.currentDrawingModal?.removeMedia(${index})" title="Eliminar">
            ✕
          </button>
        </div>
      `;
    }).join('');
  }

  removeMedia(index) {
    this.attachedMedia.splice(index, 1);
    this.updateMediaPreview();
  }

  getAttachedMediaMarkdown() {
    if (this.attachedMedia.length === 0) return '';
    
    return this.attachedMedia.map(media => {
      const label = media.type === 'image' ? 'Imagen' : 'GIF';
      return `![${label}](${media.url})`;
    }).join('\n');
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) {
      console.log('[Gallery] No se seleccionó archivo');
      return;
    }

    console.log('[Gallery] Archivo seleccionado:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`
    });

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Solo se permiten imágenes');
      return;
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('⚠️ La imagen es demasiado grande. Máximo 10MB');
      return;
    }

    try {
      // Mostrar spinner de carga
      this.showUploadSpinner(true);

      let fileToUpload = file;
      const fileSizeMB = file.size / (1024 * 1024);

      // Si es mayor a 2MB, optimizar primero
      if (fileSizeMB > 2) {
        console.log(`[Gallery] Imagen grande (${fileSizeMB.toFixed(2)}MB), optimizando antes de subir...`);
        fileToUpload = await this.optimizeImageToBlob(file);
        const optimizedMB = fileToUpload.size / (1024 * 1024);
        console.log('[Gallery] Imagen optimizada:', {
          originalSize: `${fileSizeMB.toFixed(2)}MB`,
          optimizedSize: `${optimizedMB.toFixed(2)}MB`
        });
      }

      // Subir a Cloudinary
      console.log('[Gallery] Subiendo a Cloudinary...');
      const result = await this.uploadToCloudinary(fileToUpload);

      if (!result.success) {
        throw new Error(result.error || 'Error al subir la imagen');
      }

      console.log('[Gallery] ✅ Imagen subida a Cloudinary:', result.url);

      // Insertar URL de Cloudinary
      this.insertMedia(result.url, 'image');
      
      console.log('[Gallery] ✅ Imagen insertada en attachedMedia');
      
      // Limpiar el input
      event.target.value = '';
    } catch (error) {
      console.error('[Gallery] ❌ Error subiendo imagen:', error);
      alert(`❌ Error al subir la imagen: ${error.message}`);
    } finally {
      this.showUploadSpinner(false);
    }
  }

  // Subir imagen a Cloudinary
  async uploadToCloudinary(imageFile) {
    const cloudName = 'dkci24erg';
    const uploadPreset = 'fenixlab_guestbook'; // Preset específico para guestbook
    const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'guestbook/comments');
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Cloudinary error: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height
      };
    } catch (error) {
      console.error('[Cloudinary] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Optimizar imagen y convertir a Blob
  async optimizeImageToBlob(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Calcular dimensiones óptimas
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          // Crear canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a Blob con calidad alta
          canvas.toBlob((blob) => {
            if (blob) {
              console.log(`[Gallery] Optimizado: ${width}x${height}, ${(blob.size / 1024).toFixed(0)}KB`);
              resolve(blob);
            } else {
              reject(new Error('Error al crear blob'));
            }
          }, 'image/jpeg', 0.85); // JPEG con calidad 85%
        };
        
        img.onerror = () => reject(new Error('Error al cargar imagen'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    });
  }

  // Mostrar/ocultar spinner de carga
  showUploadSpinner(show) {
    const mediaPickerContent = this.modal.querySelector('.media-picker-content');
    if (!mediaPickerContent) return;

    let spinner = mediaPickerContent.querySelector('.upload-spinner-overlay');
    
    if (show && !spinner) {
      spinner = document.createElement('div');
      spinner.className = 'upload-spinner-overlay';
      spinner.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner-circle"></div>
          <p>Subiendo imagen...</p>
        </div>
      `;
      mediaPickerContent.appendChild(spinner);
    } else if (!show && spinner) {
      spinner.remove();
    }
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async optimizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Calcular dimensiones óptimas manteniendo aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920; // Max width/height
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          // Crear canvas para redimensionar
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          
          // Usar algoritmo de alta calidad
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a base64 con calidad alta
          // Para GIF usar PNG, para otros usar JPEG de alta calidad
          const isGif = file.type === 'image/gif';
          let quality = 0.92; // Alta calidad
          let mimeType = isGif ? 'image/png' : 'image/jpeg';
          
          let dataUrl = canvas.toDataURL(mimeType, quality);
          
          // Si aún es muy grande, reducir calidad gradualmente
          let attempts = 0;
          while (dataUrl.length > 1024 * 1024 && quality > 0.7 && attempts < 5) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL(mimeType, quality);
            attempts++;
            console.log(`[Gallery] Intento ${attempts}: calidad ${quality.toFixed(2)}, tamaño ${(dataUrl.length / 1024).toFixed(0)}KB`);
          }
          
          const finalSizeKB = (dataUrl.length / 1024).toFixed(0);
          console.log(`[Gallery] ✅ Imagen optimizada: ${width}x${height}, ${finalSizeKB}KB, calidad ${quality.toFixed(2)}`);
          
          resolve(dataUrl);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  attachEvents() {
    // Cerrar al hacer click en overlay
    const overlay = this.modal.querySelector('.modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.modal.remove();
      }
    });

    // ESC para cerrar
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    // Botón de media picker
    const mediaBtn = this.modal.querySelector('#mediaPickerBtn');
    if (mediaBtn) {
      mediaBtn.addEventListener('click', () => this.toggleMediaPicker());
    }
    
    // Tabs
    const gifsTabBtn = this.modal.querySelector('#gifsTabBtn');
    const imagesTabBtn = this.modal.querySelector('#imagesTabBtn');
    const gifsTab = this.modal.querySelector('#gifsTab');
    const imagesTab = this.modal.querySelector('#imagesTab');
    
    if (gifsTabBtn) {
      gifsTabBtn.addEventListener('click', () => {
        gifsTabBtn.classList.add('active');
        imagesTabBtn.classList.remove('active');
        gifsTab.classList.add('show', 'active');
        imagesTab.classList.remove('show', 'active');
      });
    }
    
    if (imagesTabBtn) {
      imagesTabBtn.addEventListener('click', () => {
        imagesTabBtn.classList.add('active');
        gifsTabBtn.classList.remove('active');
        imagesTab.classList.add('show', 'active');
        gifsTab.classList.remove('show', 'active');
      });
    }
    
    // Búsqueda de GIFs - Enter o botón
    const gifSearch = this.modal.querySelector('#gifSearch');
    const gifSearchBtn = this.modal.querySelector('#gifSearchBtn');
    
    if (gifSearch) {
      gifSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchGifs(e.target.value);
        }
      });
    }
    
    if (gifSearchBtn) {
      gifSearchBtn.addEventListener('click', () => {
        const query = gifSearch?.value || '';
        this.searchGifs(query);
      });
    }
    
    // Upload de imágenes
    const uploadImageBtn = this.modal.querySelector('#uploadImageBtn');
    const imageUpload = this.modal.querySelector('#imageUpload');
    
    if (uploadImageBtn && imageUpload) {
      uploadImageBtn.addEventListener('click', () => imageUpload.click());
      imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
    }
    
    // Cargar avatar del autor
    this.loadAuthorAvatar();
  }
  
  async loadAuthorAvatar() {
    const avatarEl = this.modal.querySelector('.author-avatar[data-author]');
    if (!avatarEl) return;
    
    const author = avatarEl.dataset.author;
    if (!author || author === 'Anónimo') return;
    
    try {
      const profile = await window.guestbookApp.firebase.getUserProfile(author);
      
      if (profile) {
        // Limpiar contenido anterior
        avatarEl.innerHTML = '';
        
        if (profile.avatarImage) {
          // Avatar de imagen
          avatarEl.style.backgroundImage = `url(${profile.avatarImage})`;
          avatarEl.style.backgroundSize = 'cover';
          avatarEl.style.backgroundPosition = 'center';
          avatarEl.classList.add('has-image');
        } else if (profile.avatarType === 'text') {
          // Avatar de texto
          avatarEl.textContent = profile.avatar;
          avatarEl.classList.add('avatar-text');
        } else {
          // Avatar emoji
          avatarEl.textContent = profile.avatar || '👤';
          avatarEl.classList.add('avatar-emoji');
        }
      }
    } catch (error) {
      console.warn(`No se pudo cargar avatar de ${author}:`, error);
    }
  }

  async loadComments() {
    const container = this.modal.querySelector('.comments-list');
    if (!container) return;

    try {
      container.innerHTML = '<div class="loading">Cargando comentarios...</div>';
      
      // Usar el nuevo método que carga comentarios con replies
      const commentsWithReplies = await window.guestbookApp.firebase.getCommentsWithReplies(this.drawingId);
      
      if (commentsWithReplies.length === 0) {
        container.innerHTML = `
          <div class="empty-comments">
            <p>💬 Aún no hay comentarios</p>
            <small>¡Sé el primero en comentar!</small>
          </div>
        `;
        return;
      }

      container.innerHTML = commentsWithReplies.map(comment => this.renderCommentWithReplies(comment)).join('');
      
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      container.innerHTML = '<div class="error">Error al cargar comentarios</div>';
    }
  }
  
  renderCommentWithReplies(comment) {
    const commentData = comment.data || comment;
    const author = commentData.autor || 'Anónimo';
    let text = commentData.texto || '';
    const timestamp = commentData.timestamp || Date.now();
    const commentUserId = commentData.userId || null;
    const replies = comment.replies || [];
    
    // Verificar si el usuario actual es el autor de este comentario
    const currentUserId = window.getUserId ? window.getUserId() : null;
    const isOwner = currentUserId && commentUserId && currentUserId === commentUserId;
    
    // Renderizar markdown de imágenes/GIFs
    text = this.renderMarkdownImages(text);
    
    // Generar campos de reply según si está logueado
    const replyFormFields = this.getReplyFormFields();
    
    return `
      <div class="comment-item" data-comment-id="${comment.id}">
        <div class="comment-main">
          <div class="comment-avatar">👤</div>
          <div class="comment-content">
            <div class="comment-header">
              <strong>${this.escapeHtml(author)}</strong>
              <span class="comment-time">${this.formatTimeAgo(timestamp)}</span>
              ${isOwner ? `
                <button class="btn-delete-comment" onclick="deleteComment('${this.drawingId}', '${comment.id}')" title="Eliminar mi comentario">
                  <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
              ` : ''}
            </div>
            <div class="comment-text">${text}</div>
            <button class="btn-reply" onclick="showReplyBox('${comment.id}')">
              <i data-lucide="corner-down-right" style="width: 14px; height: 14px;"></i>
              Responder
            </button>
          </div>
        </div>
        
        <!-- Caja de respuesta (oculta por defecto) -->
        <div class="reply-box" id="reply-box-${comment.id}" style="display: none;">
          <div class="reply-form">
            ${replyFormFields}
            <textarea class="reply-text" 
                      placeholder="Escribe tu respuesta..." 
                      maxlength="300" 
                      rows="2"></textarea>
            <div class="reply-actions">
              <button class="btn-secondary btn-sm" onclick="hideReplyBox('${comment.id}')">Cancelar</button>
              <button class="btn-primary btn-sm" onclick="submitReply('${this.drawingId}', '${comment.id}')">Responder</button>
            </div>
          </div>
        </div>
        
        <!-- Respuestas (threads) -->
        ${replies.length > 0 ? `
          <div class="replies-list">
            ${replies.map(reply => this.renderReply(reply)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
  
  renderReply(reply) {
    const author = reply.autor || 'Anónimo';
    let text = reply.texto || '';
    const timestamp = reply.timestamp || Date.now();
    const replyUserId = reply.userId || null;
    
    // Verificar si el usuario actual es el autor de esta respuesta
    const currentUserId = window.getUserId ? window.getUserId() : null;
    const isOwner = currentUserId && replyUserId && currentUserId === replyUserId;
    
    // Renderizar markdown de imágenes/GIFs también en replies
    text = this.renderMarkdownImages(text);
    
    return `
      <div class="reply-item" data-reply-id="${reply.id}">
        <div class="reply-avatar">👤</div>
        <div class="reply-content">
          <div class="reply-header">
            <strong>${this.escapeHtml(author)}</strong>
            <span class="reply-time">${this.formatTimeAgo(timestamp)}</span>
            ${isOwner ? `
              <button class="btn-delete-comment" onclick="deleteReply('${this.drawingId}', '${reply.parentId}', '${reply.id}')" title="Eliminar mi respuesta">
                <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
              </button>
            ` : ''}
          </div>
          <div class="reply-text">${text}</div>
        </div>
      </div>
    `;
  }

  renderMarkdownImages(text) {
    if (!text) return '';
    
    // Convertir ![GIF](url) o ![cualquier texto](url) en <img>
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    
    return text.replace(imageRegex, (match, alt, url) => {
      return `<img src="${url}" alt="${this.escapeHtml(alt)}" class="comment-media" style="max-width: 100%; border-radius: 8px; margin-top: 8px; display: block;">`;
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'ahora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    
    return new Date(timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}

// ==================== FUNCIONES GLOBALES ====================
window.openDrawingModal = async function(drawingId) {
  const modal = new DrawingModal(drawingId);
  await modal.show();
};

window.likeDrawing = async function(drawingId) {
  if (window.galleryManager) {
    await window.galleryManager.toggleLike(drawingId);
  }
};

window.toggleDownloadOptions = function(drawingId) {
  const menu = document.getElementById(`download-options-${drawingId}`);
  if (!menu) return;
  
  const isVisible = menu.style.display !== 'none';
  menu.style.display = isVisible ? 'none' : 'block';
  
  // Reinicializar iconos de Lucide si están disponibles
  if (window.lucide && !isVisible) {
    setTimeout(() => window.lucide.createIcons(), 10);
  }
};

window.executeDownload = async function(drawingId, backgroundType) {
  console.log('� Ejecutando descarga:', { drawingId, backgroundType });
  
  try {
    // Ocultar el menú
    const menu = document.getElementById(`download-options-${drawingId}`);
    if (menu) menu.style.display = 'none';
    
    // Obtener el dibujo
    const drawing = await window.guestbookApp.firebase.getDrawing(drawingId);
    if (!drawing || !drawing.data || !drawing.data.imagenData) {
      alert('❌ No se pudo cargar el dibujo');
      return;
    }

    const imageData = drawing.data.imagenData;
    const author = drawing.data.autor || 'Anonimo';
    const timestamp = drawing.data.timestamp || Date.now();
    
    console.log('📦 Procesando imagen...');
    
    // Crear un canvas temporal para procesar la imagen
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = function() {
      console.log('✅ Imagen cargada:', img.width, 'x', img.height);
      
      // Establecer dimensiones del canvas
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Aplicar fondo según opción
      if (backgroundType === 'white') {
        console.log('🎨 Aplicando fondo blanco');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        console.log('✨ Manteniendo transparencia');
      }
      
      // Dibujar la imagen encima
      ctx.drawImage(img, 0, 0);
      
      // Convertir a blob y descargar
      canvas.toBlob(function(blob) {
        console.log('📦 Blob creado:', blob.size, 'bytes');
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Nombre del archivo
        const date = new Date(timestamp).toISOString().split('T')[0];
        const bgType = backgroundType === 'white' ? 'bg' : 'transparent';
        const cleanAuthor = author.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `guestbook_${cleanAuthor}_${date}_${bgType}.png`;
        
        console.log('💾 Descargando:', filename);
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Descarga completada');
      }, 'image/png');
    };
    
    img.onerror = function(error) {
      console.error('❌ Error al cargar imagen:', error);
      alert('❌ Error al procesar la imagen');
    };
    
    img.src = imageData;
    
  } catch (error) {
    console.error('❌ Error en descarga:', error);
    alert('❌ Error al descargar: ' + error.message);
  }
};

window.submitComment = async function(drawingId) {
  const textInput = document.getElementById('commentText');
  
  console.log('[GalleryV2] submitComment llamado');
  console.log('[GalleryV2] attachedMedia:', window.currentDrawingModal?.attachedMedia);
  
  if (!textInput || !textInput.value.trim()) {
    // Verificar si hay al menos un GIF adjunto
    if (!window.currentDrawingModal?.attachedMedia?.length) {
      alert('⚠️ Escribe un comentario o adjunta un GIF');
      return;
    }
  }

  // Determinar el autor basado en si está logueado
  let author = 'Anónimo';
  
  if (window.guestbookApp?.profiles?.currentProfile?.isLoggedIn) {
    author = window.guestbookApp.profiles.currentProfile.username;
  } else {
    const authorInput = document.getElementById('commentAuthor');
    author = authorInput?.value.trim() || 'Anónimo';
  }

  // Combinar texto + GIFs adjuntos
  let commentText = textInput.value.trim();
  
  if (window.currentDrawingModal?.attachedMedia?.length) {
    const mediaMarkdown = window.currentDrawingModal.getAttachedMediaMarkdown();
    console.log('[GalleryV2] Media markdown:', mediaMarkdown);
    commentText = commentText ? `${commentText}\n\n${mediaMarkdown}` : mediaMarkdown;
  }

  console.log('[GalleryV2] Texto final del comentario:', commentText.substring(0, 200) + '...');

  const commentData = {
    autor: author,
    texto: commentText,
    timestamp: Date.now(),
    userId: window.getUserId ? window.getUserId() : null // Identificar autor
  };

  try {
    const drawing = await window.guestbookApp.firebase.getDrawing(drawingId);
    if (!drawing) return;

    const comments = drawing.data.comments || [];
    comments.push(commentData);

    await window.guestbookApp.firebase.updateDrawing(drawingId, { comments });

    console.log('[GalleryV2] ✅ Comentario guardado en Firebase');

    // Limpiar form
    const authorInput = document.getElementById('commentAuthor');
    if (authorInput) authorInput.value = '';
    textInput.value = '';
    
    // Limpiar GIFs adjuntos
    if (window.currentDrawingModal) {
      window.currentDrawingModal.attachedMedia = [];
      window.currentDrawingModal.updateMediaPreview();
    }

    // Recargar modal
    document.querySelector('.drawing-modal')?.remove();
    await openDrawingModal(drawingId);

    console.log('[GalleryV2] Comentario agregado por:', author);
  } catch (error) {
    console.error('[GalleryV2] Error al comentar:', error);
    alert('Error al enviar comentario');
  }
};

// Exponer para uso externo
export { GalleryManager as GalleryManagerV2 };
export { DrawingModal };


// ==================== FUNCIONES GLOBALES PARA REPLIES ====================

window.showReplyBox = function(commentId) {
  const replyBox = document.getElementById(`reply-box-${commentId}`);
  if (replyBox) {
    replyBox.style.display = 'block';
    replyBox.querySelector('.reply-text').focus();
  }
};

window.hideReplyBox = function(commentId) {
  const replyBox = document.getElementById(`reply-box-${commentId}`);
  if (replyBox) {
    replyBox.style.display = 'none';
    
    // Solo limpiar el campo de autor si existe (usuario NO logueado)
    const authorInput = replyBox.querySelector('.reply-author');
    if (authorInput) {
      authorInput.value = '';
    }
    
    // Siempre limpiar el campo de texto
    const textInput = replyBox.querySelector('.reply-text');
    if (textInput) {
      textInput.value = '';
    }
  }
};

window.submitReply = async function(drawingId, parentCommentId) {
  try {
    const replyBox = document.getElementById(`reply-box-${parentCommentId}`);
    if (!replyBox) return;
    
    const textInput = replyBox.querySelector('.reply-text');
    const text = textInput.value.trim();
    
    if (!text) {
      alert('Por favor escribe una respuesta');
      return;
    }
    
    // Determinar el autor basado en si está logueado
    let author = 'Anónimo';
    
    if (window.guestbookApp?.profiles?.currentProfile?.isLoggedIn) {
      // Usuario logueado: usar su username
      author = window.guestbookApp.profiles.currentProfile.username;
    } else {
      // Usuario NO logueado: usar el input o Anónimo
      const authorInput = replyBox.querySelector('.reply-author');
      author = authorInput?.value.trim() || 'Anónimo';
    }
    
    const replyData = {
      autor: author,
      texto: text,
      timestamp: Date.now(),
      userId: window.getUserId ? window.getUserId() : null, // Identificar autor
      parentId: commentId // Importante para saber a qué comentario responde
    };
    
    await window.guestbookApp.firebase.addSubcomment(drawingId, parentCommentId, replyData);
    
    // Recargar el modal
    const modal = document.querySelector('.drawing-modal');
    if (modal) {
      const drawingModal = new DrawingModal(drawingId);
      await drawingModal.show();
    }
    
    console.log('[GalleryV2] Respuesta agregada por:', author);
    
  } catch (error) {
    console.error('Error al enviar respuesta:', error);
    alert('Error al enviar la respuesta');
  }
};


// ==================== FUNCIÓN PARA MOSTRAR PERFIL DE USUARIO ====================
window.showUserProfile = async function(username) {
  const existingModal = document.querySelector('.user-profile-modal');
  if (existingModal) existingModal.remove();
  
  // Bloquear usuarios anónimos/guest
  if (!username || username === 'Anónimo' || username.toLowerCase() === 'anónimo' || username.toLowerCase() === 'anonimo') {
    return; // Simplemente no hacer nada, no mostrar error
  }
  
  try {
    // Cargar perfil desde Firebase
    const firebase = window.guestbookApp?.firebase;
    if (!firebase) {
      alert('❌ Error al cargar perfil');
      return;
    }
    
    const userProfile = await firebase.getUserProfile(username);
    const userCredentials = await firebase.getUserCredentials(username);
    
    // Verificar configuración de privacidad
    const privacy = userProfile?.privacy || {};
    
    // Si el perfil es completamente privado
    if (privacy.privateProfile) {
      const modal = document.createElement('div');
      modal.className = 'user-profile-modal';
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.9); z-index: 100000;
        display: flex; align-items: center; justify-content: center; padding: 20px;
      `;
      
      modal.innerHTML = `
        <div style="background: var(--bg-light); border: 2px solid var(--primary); border-radius: 20px; padding: 3rem; max-width: 500px; text-align: center;">
          <div style="font-size: 4em; margin-bottom: 1rem;">🔒</div>
          <h3 style="color: var(--primary); margin-bottom: 1rem;">Perfil Privado</h3>
          <p style="color: var(--text); margin-bottom: 2rem;">Este usuario ha configurado su perfil como privado.</p>
          <button onclick="this.closest('.user-profile-modal').remove()" 
                  style="background: var(--primary); color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Cerrar
          </button>
        </div>
      `;
      
      document.body.appendChild(modal);
      return;
    }
    
    // Cargar SOLO los dibujos del usuario (optimizado)
    const userDrawings = await firebase.getUserDrawings(username);
    
    // Calcular estadísticas
    const totalLikes = userDrawings.reduce((sum, d) => sum + (d.data.likes || 0), 0);
    const totalComments = userDrawings.reduce((sum, d) => sum + (d.data.comments?.length || 0), 0);
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'user-profile-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.3s ease;
    `;
    
    const card = document.createElement('div');
    card.style.cssText = `
      background: var(--bg-light);
      border: 2px solid var(--primary);
      border-radius: 20px;
      padding: 0;
      max-width: 650px;
      width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    `;
    
    // Avatar display
    let avatarContent = '';
    if (userProfile?.avatarImage) {
      avatarContent = `<img src="${userProfile.avatarImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else if (userProfile?.avatarType === 'text') {
      avatarContent = `<span style="font-size: 2.5em; font-weight: bold;">${userProfile.avatar}</span>`;
    } else {
      avatarContent = `<span style="font-size: 3.5em;">${userProfile?.avatar || '👤'}</span>`;
    }
    
    const formatDate = (timestamp) => {
      if (!timestamp) return 'hace poco';
      try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 1) return 'hoy';
        if (diffDays === 1) return 'ayer';
        if (diffDays < 7) return `hace ${diffDays} días`;
        if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
        if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} meses`;
        
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      } catch {
        return 'hace poco';
      }
    };
    
    // Usar la fecha de las credenciales (cuando se registró) en vez del perfil
    const joinDate = userCredentials?.joinDate || userProfile?.joinDate || Date.now();
    
    card.innerHTML = `
      <button onclick="this.closest('.user-profile-modal').remove()" 
              style="position: absolute; top: 15px; right: 20px; background: rgba(0,0,0,0.5); border: none; color: white; font-size: 1.8rem; cursor: pointer; z-index: 100; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s ease;">
        &times;
      </button>
      
      <!-- Banner con avatar centrado -->
      <div style="width: 100%; position: relative; overflow: visible; margin: 0; padding: 0;">
        <!-- Banner -->
        <div class="profile-banner-other" style="background: ${userProfile?.bannerImage ? `url(${userProfile.bannerImage}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))'};">
          ${!userProfile?.bannerImage ? '<div style="font-size: 3.5em; opacity: 0.25; color: rgba(255,255,255,0.5);">🎨</div>' : ''}
        </div>
        
        <!-- Espaciador para el avatar -->
        <div style="height: 65px; background: var(--bg-light);"></div>
        
        <!-- Avatar centrado -->
        <div style="width: 130px; height: 130px; border-radius: 50%; background: ${userProfile?.avatarImage ? '#f5f5f5' : 'linear-gradient(135deg, var(--primary), var(--secondary))'}; display: flex; align-items: center; justify-content: center; color: white; position: absolute; left: 50%; top: 135px; transform: translateX(-50%); overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.4); border: 6px solid var(--bg-light); z-index: 10;">
          ${avatarContent}
        </div>
      </div>
      
      <!-- Contenido con padding y scroll -->
      <div style="padding: 0 25px 25px 25px; overflow-y: auto; flex: 1; scrollbar-width: thin; scrollbar-color: var(--primary) transparent;">
      
      <!-- Nombre y fecha -->
      <div style="text-align: center; margin: 20px 0 30px 0;">
        <h3 style="color: var(--primary); margin: 0 0 8px 0; font-size: 1.6em; font-weight: 600;">
          ${username}
        </h3>
        <small style="color: var(--text-secondary); font-size: 0.95em;">Miembro desde ${formatDate(joinDate)}</small>
      </div>
      
      <!-- Bio -->
      ${userProfile?.bio ? `
        <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-dark); border-radius: 10px; border-left: 4px solid var(--primary);">
          <h5 style="color: var(--primary); margin: 0 0 10px 0; font-size: 0.9em;">📝 Biografía</h5>
          <p style="color: var(--text); margin: 0; line-height: 1.5; font-size: 0.9em;">
            ${userProfile.bio}
          </p>
          ${userProfile.pronouns ? `
            <p style="color: var(--text-secondary); margin: 10px 0 0 0; font-size: 0.85em; font-style: italic;">
              Pronombres: ${userProfile.pronouns}
            </p>
          ` : ''}
        </div>
      ` : userProfile?.pronouns ? `
        <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-dark); border-radius: 10px; border-left: 4px solid var(--primary);">
          <p style="color: var(--text-secondary); margin: 0; font-size: 0.9em; font-style: italic;">
            Pronombres: ${userProfile.pronouns}
          </p>
        </div>
      ` : ''}
      
      <!-- Estadísticas -->
      <div style="margin-bottom: 20px;">
        <h5 style="color: var(--primary); margin: 0 0 10px 0; font-size: 0.9em;">📊 Estadísticas</h5>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="padding: 15px; background: var(--bg-dark); border-radius: 10px; text-align: center; border: 1px solid var(--primary);">
            <div style="font-size: 1.8em; margin-bottom: 5px;">🎨</div>
            <strong style="color: var(--primary); font-size: 1.3em; display: block;">${userDrawings.length}</strong>
            <small style="color: var(--text-secondary);">Dibujos</small>
          </div>
          <div style="padding: 15px; background: var(--bg-dark); border-radius: 10px; text-align: center; border: 1px solid var(--primary);">
            <div style="font-size: 1.8em; margin-bottom: 5px;">❤️</div>
            <strong style="color: var(--primary); font-size: 1.3em; display: block;">${totalLikes}</strong>
            <small style="color: var(--text-secondary);">Likes</small>
          </div>
          <div style="padding: 15px; background: var(--bg-dark); border-radius: 10px; text-align: center; border: 1px solid var(--primary);">
            <div style="font-size: 1.8em; margin-bottom: 5px;">💬</div>
            <strong style="color: var(--primary); font-size: 1.3em; display: block;">${totalComments}</strong>
            <small style="color: var(--text-secondary);">Comentarios</small>
          </div>
        </div>
      </div>
      
      <!-- Tabs de contenido -->
      <div style="margin-bottom: 20px;">
        <div style="display: flex; gap: 5px; border-bottom: 2px solid var(--primary); margin-bottom: 15px;">
          <button onclick="switchProfileTab(event, 'drawings')" class="profile-tab active" style="flex: 1; padding: 12px; background: var(--primary); border: none; color: var(--bg-dark); font-weight: 600; cursor: pointer; border-radius: 8px 8px 0 0; transition: all 0.2s ease;">
            🎨 Dibujos
          </button>
          <button onclick="switchProfileTab(event, 'likes')" class="profile-tab" style="flex: 1; padding: 12px; background: var(--bg-dark); border: none; color: var(--text); font-weight: 600; cursor: pointer; border-radius: 8px 8px 0 0; transition: all 0.2s ease;">
            ❤️ Likes
          </button>
          <button onclick="switchProfileTab(event, 'comments')" class="profile-tab" style="flex: 1; padding: 12px; background: var(--bg-dark); border: none; color: var(--text); font-weight: 600; cursor: pointer; border-radius: 8px 8px 0 0; transition: all 0.2s ease;">
            💬 Comentarios
          </button>
        </div>
        
        <!-- Tab: Dibujos -->
        <div class="profile-tab-content" id="tab-drawings" style="display: block;">
          ${userDrawings.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-height: 300px; overflow-y: auto; padding: 5px;">
              ${userDrawings.slice(0, 12).map(drawing => {
                const imageData = drawing.data.imagenData || drawing.data.imageData;
                const title = drawing.data.titulo || drawing.data.title || 'Sin título';
                return `
                  <div onclick="openDrawingModal('${drawing.id}')" 
                       style="aspect-ratio: 1; background-image: url('${imageData}'); background-size: cover; background-position: center; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease; position: relative; overflow: hidden;" 
                       onmouseover="this.style.border='2px solid var(--primary)'; this.style.transform='scale(1.05)';" 
                       onmouseout="this.style.border='2px solid transparent'; this.style.transform='scale(1)';" 
                       title="${title}">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 8px 5px; font-size: 0.7em; color: white; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${title}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            ${userDrawings.length > 12 ? `<small style="color: var(--text-secondary); display: block; text-align: center; margin-top: 8px;">Y ${userDrawings.length - 12} dibujos más...</small>` : ''}
          ` : `
            <div style="padding: 30px; text-align: center; color: var(--text-secondary); background: var(--bg-dark); border-radius: 10px; border: 1px dashed var(--primary);">
              <div style="font-size: 3em; margin-bottom: 10px; opacity: 0.5;">🎨</div>
              <p style="margin: 0;">Este usuario aún no ha publicado dibujos</p>
            </div>
          `}
        </div>
        
        <!-- Tab: Likes (cargado dinámicamente) -->
        <div class="profile-tab-content" id="tab-likes" style="display: none;">
          <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
            <div class="spinner-border" role="status" style="color: var(--primary);">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p style="margin-top: 10px;">Cargando likes...</p>
          </div>
        </div>
        
        <!-- Tab: Comentarios (cargado dinámicamente) -->
        <div class="profile-tab-content" id="tab-comments" style="display: none;">
          <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
            <div class="spinner-border" role="status" style="color: var(--primary);">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p style="margin-top: 10px;">Cargando comentarios...</p>
          </div>
        </div>
      </div>
      
      </div><!-- Cierre del padding container -->
    `;
    
    modal.appendChild(card);
    document.body.appendChild(modal);
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
  } catch (error) {
    console.error('Error mostrando perfil:', error);
    alert('❌ Error al cargar el perfil del usuario');
  }
};


// ==================== FUNCIONES PARA TABS DE PERFIL ====================
window.switchProfileTab = async function(event, tabName) {
  const button = event.target;
  const modal = button.closest('.user-profile-modal');
  
  // Actualizar botones
  modal.querySelectorAll('.profile-tab').forEach(tab => {
    tab.style.background = 'var(--bg-dark)';
    tab.style.color = 'var(--text)';
    tab.classList.remove('active');
  });
  button.style.background = 'var(--primary)';
  button.style.color = 'var(--bg-dark)';
  button.classList.add('active');
  
  // Mostrar contenido correcto
  modal.querySelectorAll('.profile-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  const targetTab = modal.querySelector(`#tab-${tabName}`);
  targetTab.style.display = 'block';
  
  // Cargar datos si es necesario
  if (tabName === 'likes' && !targetTab.dataset.loaded) {
    await loadUserLikes(modal);
    targetTab.dataset.loaded = 'true';
  } else if (tabName === 'comments' && !targetTab.dataset.loaded) {
    await loadUserComments(modal);
    targetTab.dataset.loaded = 'true';
  }
};

// Cargar dibujos que el usuario ha dado like
async function loadUserLikes(modal) {
  const likesTab = modal.querySelector('#tab-likes');
  const username = modal.querySelector('h3').textContent.trim();
  
  try {
    const firebase = window.guestbookApp?.firebase;
    if (!firebase) throw new Error('Firebase no disponible');
    
    // Verificar privacidad
    const userProfile = await firebase.getUserProfile(username);
    const privacy = userProfile?.privacy || {};
    
    if (privacy.hideLikes) {
      likesTab.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-secondary); background: var(--bg-dark); border-radius: 10px; border: 1px dashed var(--primary);">
          <div style="font-size: 3em; margin-bottom: 10px; opacity: 0.5;">🔒</div>
          <p style="margin: 0; font-size: 0.95em; color: var(--primary);">El usuario ha ocultado sus likes</p>
        </div>
      `;
      return;
    }
    
    // Obtener todos los dibujos
    const allDrawings = await firebase.getAllDrawings();
    
    // Filtrar los que el usuario ha dado like
    const likedDrawings = allDrawings.filter(drawing => {
      const likedBy = drawing.data.likedBy || [];
      return likedBy.includes(username);
    });
    
    if (likedDrawings.length === 0) {
      likesTab.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-secondary); background: var(--bg-dark); border-radius: 10px; border: 1px dashed var(--primary);">
          <div style="font-size: 3em; margin-bottom: 10px; opacity: 0.5;">❤️</div>
          <p style="margin: 0;">Este usuario no ha dado like a ningún dibujo</p>
        </div>
      `;
      return;
    }
    
    likesTab.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-height: 300px; overflow-y: auto; padding: 5px;">
        ${likedDrawings.slice(0, 12).map(drawing => {
          const imageData = drawing.data.imagenData || drawing.data.imageData;
          const title = drawing.data.titulo || drawing.data.title || 'Sin título';
          const author = drawing.data.autor || 'Anónimo';
          return `
            <div onclick="openDrawingModal('${drawing.id}')" 
                 style="aspect-ratio: 1; background-image: url('${imageData}'); background-size: cover; background-position: center; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease; position: relative; overflow: hidden;" 
                 onmouseover="this.style.border='2px solid var(--primary)'; this.style.transform='scale(1.05)';" 
                 onmouseout="this.style.border='2px solid transparent'; this.style.transform='scale(1)';" 
                 title="${title} por ${author}">
              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 8px 5px; font-size: 0.7em; color: white; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${title}<br><span style="font-size: 0.85em; opacity: 0.8;">por ${author}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${likedDrawings.length > 12 ? `<small style="color: var(--text-secondary); display: block; text-align: center; margin-top: 8px;">Y ${likedDrawings.length - 12} likes más...</small>` : ''}
    `;
  } catch (error) {
    console.error('Error cargando likes:', error);
    likesTab.innerHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-secondary); background: var(--bg-dark); border-radius: 10px; border: 1px dashed rgba(255,0,0,0.5);">
        <div style="font-size: 3em; margin-bottom: 10px; opacity: 0.5;">❌</div>
        <p style="margin: 0;">Error al cargar los likes</p>
      </div>
    `;
  }
}

// Cargar comentarios que el usuario ha hecho
async function loadUserComments(modal) {
  const commentsTab = modal.querySelector('#tab-comments');
  const username = modal.querySelector('h3').textContent.trim();
  
  try {
    const firebase = window.guestbookApp?.firebase;
    if (!firebase) throw new Error('Firebase no disponible');
    
    // Verificar privacidad
    const userProfile = await firebase.getUserProfile(username);
    const privacy = userProfile?.privacy || {};
    
    if (privacy.hideComments) {
      commentsTab.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-secondary); background: var(--bg-dark); border-radius: 10px; border: 1px dashed var(--primary);">
          <div style="font-size: 3em; margin-bottom: 10px; opacity: 0.5;">🔒</div>
          <p style="margin: 0; font-size: 0.95em; color: var(--primary);">El usuario ha ocultado sus comentarios</p>
        </div>
      `;
      return;
    }
    
    // Obtener todos los dibujos
    const allDrawings = await firebase.getAllDrawings();
    
    // Encontrar todos los comentarios del usuario
    const userComments = [];
    allDrawings.forEach(drawing => {
      const comments = drawing.data.comments || [];
      comments.forEach(comment => {
        // Comparación case-insensitive para autor
        const commentAuthor = (comment.autor || comment.author || '').toLowerCase();
        const searchUsername = username.toLowerCase();
        
        if (commentAuthor === searchUsername) {
          userComments.push({
            ...comment,
            drawingId: drawing.id,
            drawingTitle: drawing.data.titulo || drawing.data.title || 'Sin título',
            drawingImage: drawing.data.imagenData || drawing.data.imageData
          });
        }
        // También buscar en respuestas
        if (comment.replies && Array.isArray(comment.replies)) {
          comment.replies.forEach(reply => {
            const replyAuthor = (reply.autor || reply.author || '').toLowerCase();
            if (replyAuthor === searchUsername) {
              userComments.push({
                ...reply,
                isReply: true,
                drawingId: drawing.id,
                drawingTitle: drawing.data.titulo || drawing.data.title || 'Sin título',
                drawingImage: drawing.data.imagenData || drawing.data.imageData
              });
            }
          });
        }
      });
    });
    
    if (userComments.length === 0) {
      commentsTab.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-secondary); background: var(--bg-dark); border-radius: 10px; border: 1px dashed var(--primary);">
          <div style="font-size: 3em; margin-bottom: 10px; opacity: 0.5;">💬</div>
          <p style="margin: 0;">Este usuario no ha comentado en ningún dibujo</p>
        </div>
      `;
      return;
    }
    
    // Ordenar por fecha (más recientes primero)
    userComments.sort((a, b) => b.timestamp - a.timestamp);
    
    commentsTab.innerHTML = `
      <div style="max-height: 300px; overflow-y: auto; padding: 5px;">
        ${userComments.slice(0, 20).map(comment => {
          const timeAgo = formatTimeAgo(comment.timestamp);
          return `
            <div onclick="openDrawingModal('${comment.drawingId}')" 
                 style="padding: 12px; background: var(--bg-dark); border-radius: 8px; margin-bottom: 10px; cursor: pointer; border-left: 3px solid var(--primary); transition: all 0.2s ease;" 
                 onmouseover="this.style.background='rgba(var(--primary-rgb), 0.1)'" 
                 onmouseout="this.style.background='var(--bg-dark)'">
              <div style="display: flex; gap: 10px; align-items: start;">
                <div style="width: 60px; height: 60px; flex-shrink: 0; background-image: url('${comment.drawingImage}'); background-size: cover; background-position: center; border-radius: 6px; border: 2px solid var(--primary);"></div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 0.75em; color: var(--primary); font-weight: 600; margin-bottom: 3px;">
                    ${comment.isReply ? '↳ Respuesta en' : 'Comentario en'} "${comment.drawingTitle}"
                  </div>
                  <div style="color: var(--text); font-size: 0.85em; margin-bottom: 5px; line-height: 1.3;">
                    ${renderCommentMarkdown(comment.texto || comment.text || comment.comment || 'Sin texto')}
                  </div>
                  <div style="font-size: 0.7em; color: var(--text-secondary);">
                    ${timeAgo}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${userComments.length > 20 ? `<small style="color: var(--text-secondary); display: block; text-align: center; margin-top: 8px;">Y ${userComments.length - 20} comentarios más...</small>` : ''}
    `;
  } catch (error) {
    console.error('Error cargando comentarios:', error);
    commentsTab.innerHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-secondary); background: var(--bg-dark); border-radius: 10px; border: 1px dashed rgba(255,0,0,0.5);">
        <div style="font-size: 3em; margin-bottom: 10px; opacity: 0.5;">❌</div>
        <p style="margin: 0;">Error al cargar los comentarios</p>
      </div>
    `;
  }
}

function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days < 7) return `hace ${days} d`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  if (days < 365) return `hace ${Math.floor(days / 30)} mes`;
  return `hace ${Math.floor(days / 365)} año`;
}


// ==================== ELIMINAR COMENTARIOS ====================
window.deleteComment = async function(drawingId, commentId) {
  if (!confirm('¿Seguro que quieres eliminar tu comentario?')) {
    return;
  }
  
  try {
    await window.guestbookApp.firebase.deleteComment(drawingId, commentId);
    
    // Recargar comentarios
    if (window.currentDrawingModal) {
      await window.currentDrawingModal.loadComments();
      
      // Re-inicializar Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
    
    console.log('✅ Comentario eliminado');
  } catch (error) {
    console.error('❌ Error eliminando comentario:', error);
    alert('Error al eliminar el comentario');
  }
};

window.deleteReply = async function(drawingId, parentCommentId, replyId) {
  if (!confirm('¿Seguro que quieres eliminar tu respuesta?')) {
    return;
  }
  
  try {
    await window.guestbookApp.firebase.deleteReply(drawingId, parentCommentId, replyId);
    
    // Recargar comentarios
    if (window.currentDrawingModal) {
      await window.currentDrawingModal.loadComments();
      
      // Re-inicializar Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
    
    console.log('✅ Respuesta eliminada');
  } catch (error) {
    console.error('❌ Error eliminando respuesta:', error);
    alert('Error al eliminar la respuesta');
  }
};


// Helper function para renderizar markdown de imágenes/GIFs
function renderCommentMarkdown(text) {
  if (!text) return '';
  
  // Convertir ![GIF](url) o ![cualquier texto](url) en <img>
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  return text.replace(imageRegex, (match, alt, url) => {
    const escapedAlt = escapeHtml(alt);
    return `<img src="${url}" alt="${escapedAlt}" class="comment-media" style="max-width: 100%; border-radius: 8px; margin-top: 8px; display: block;">`;
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
