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
    const pageDrawings = this.filteredDrawings.slice(startIndex, endIndex);

    gallery.innerHTML = pageDrawings
      .map(drawing => this.createDrawingCard(drawing))
      .join('');

    this.setupLikeButtons();
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

  createDrawingCard(drawing) {
    const likes = drawing.data.likes || 0;
    const comments = drawing.data.comments || [];
    const isLiked = localStorage.getItem(`liked_${drawing.id}`) === 'true';
    
    const imageData = drawing.data.imagenData || drawing.data.imageData;
    const author = drawing.data.autor || drawing.data.author || 'Anónimo';
    const title = drawing.data.titulo || drawing.data.title || 'Sin título';
    const category = drawing.data.categoria || drawing.data.category || 'General';
    const timestamp = drawing.data.timestamp || Date.now();

    return `
      <div class="col">
        <div class="drawing-card" data-id="${drawing.id}">
          <div class="drawing-image-container" onclick="openDrawingModal('${drawing.id}')">
            <img src="${imageData}" class="drawing-img" alt="${title}" loading="lazy">
            <div class="drawing-overlay">
              <span class="category-badge">${category}</span>
              ${comments.length > 0 ? `<span class="comments-badge">💬 ${comments.length}</span>` : ''}
            </div>
          </div>
          
          <div class="drawing-info">
            <h6 class="drawing-title">${title}</h6>
            <div class="drawing-author">
              <span class="author-avatar">👤</span>
              <span class="author-name">${author}</span>
            </div>
            
            <div class="drawing-actions">
              <button class="btn-like ${isLiked ? 'liked' : ''}" 
                      data-id="${drawing.id}" 
                      onclick="event.stopPropagation(); likeDrawing('${drawing.id}')">
                ❤️ <span class="like-count">${likes}</span>
              </button>
              
              <button class="btn-comment" onclick="event.stopPropagation(); openDrawingModal('${drawing.id}')">
                💬 ${comments.length}
              </button>
              
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

  async toggleLike(drawingId) {
    const storageKey = `liked_${drawingId}`;
    const isLiked = localStorage.getItem(storageKey) === 'true';
    
    try {
      const drawing = await this.firebase.getDrawing(drawingId);
      if (!drawing) return;

      const currentLikes = drawing.data.likes || 0;
      const newLikes = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

      await this.firebase.updateDrawing(drawingId, { likes: newLikes });
      localStorage.setItem(storageKey, (!isLiked).toString());

      // Actualizar UI
      const btn = document.querySelector(`.btn-like[data-id="${drawingId}"]`);
      if (btn) {
        btn.classList.toggle('liked');
        btn.querySelector('.like-count').textContent = newLikes;
      }

      // Actualizar en memoria
      const drawingIndex = this.allDrawings.findIndex(d => d.id === drawingId);
      if (drawingIndex !== -1) {
        this.allDrawings[drawingIndex].data.likes = newLikes;
      }
    } catch (error) {
      console.error('[GalleryV2] Error al dar like:', error);
    }
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

    return `
      <div class="modal-overlay">
        <div class="modal-container ${isMobile ? 'mobile' : ''}">
          <div class="modal-image-section">
            <button class="modal-close" onclick="this.closest('.drawing-modal').remove()">✖</button>
            <img src="${imageData}" class="modal-image" alt="${title}">
            <div class="modal-actions">
              <button class="btn-secondary" onclick="this.closest('.drawing-modal').remove()">
                Cerrar
              </button>
              <button class="btn-primary" onclick="downloadDrawing('${this.drawingId}')">
                💾 Descargar
              </button>
            </div>
          </div>
          
          <div class="modal-comments-section">
            <div class="modal-header">
              <div class="author-info">
                <span class="author-avatar">👤</span>
                <div>
                  <h6>${author}</h6>
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
              <input type="text" 
                     id="commentAuthor" 
                     placeholder="Tu nombre (opcional)" 
                     maxlength="50">
              <textarea id="commentText" 
                        placeholder="Escribe un comentario..." 
                        maxlength="500" 
                        rows="3"></textarea>
              <button class="btn-primary" onclick="submitComment('${this.drawingId}')">
                Comentar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    // Modal ya renderizado en create()
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
  }

  async loadComments() {
    const container = this.modal.querySelector('.comments-list');
    if (!container) return;

    const comments = this.drawing.comments || [];
    
    if (comments.length === 0) {
      container.innerHTML = `
        <div class="empty-comments">
          <p>💬 Aún no hay comentarios</p>
          <small>¡Sé el primero en comentar!</small>
        </div>
      `;
      return;
    }

    container.innerHTML = comments
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .map(comment => this.createCommentHTML(comment))
      .join('');
  }

  createCommentHTML(comment) {
    const author = comment.autor || comment.author || 'Anónimo';
    const text = comment.texto || comment.text || '';
    const timestamp = comment.timestamp || Date.now();
    const date = new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-author">👤 ${author}</span>
          <span class="comment-date">${date}</span>
        </div>
        <div class="comment-text">${text}</div>
      </div>
    `;
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

window.downloadDrawing = function(drawingId) {
  // TODO: Implementar descarga
  console.log('[GalleryV2] Descarga pendiente:', drawingId);
};

window.submitComment = async function(drawingId) {
  const authorInput = document.getElementById('commentAuthor');
  const textInput = document.getElementById('commentText');
  
  if (!textInput || !textInput.value.trim()) {
    alert('⚠️ Escribe un comentario');
    return;
  }

  const commentData = {
    autor: authorInput?.value.trim() || 'Anónimo',
    texto: textInput.value.trim(),
    timestamp: Date.now()
  };

  try {
    const drawing = await window.guestbookApp.firebase.getDrawing(drawingId);
    if (!drawing) return;

    const comments = drawing.data.comments || [];
    comments.push(commentData);

    await window.guestbookApp.firebase.updateDrawing(drawingId, { comments });

    // Limpiar form
    if (authorInput) authorInput.value = '';
    textInput.value = '';

    // Recargar modal
    document.querySelector('.drawing-modal')?.remove();
    await openDrawingModal(drawingId);

    console.log('[GalleryV2] Comentario agregado');
  } catch (error) {
    console.error('[GalleryV2] Error al comentar:', error);
    alert('Error al enviar comentario');
  }
};

// Exponer para uso externo
window.GalleryManagerV2 = GalleryManager;
window.DrawingModal = DrawingModal;
