// ==================== GUESTBOOK V1.0 ====================
// Sistema modular de dibujo con Firebase
// Importar módulos de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
  apiKey: "AIzaSyCZk8rs_Vq9ZGgOEiP3_P6zUvZoM1QQOAM",
  authDomain: "fenix-guestbook.firebaseapp.com",
  projectId: "fenix-guestbook",
  storageBucket: "fenix-guestbook.firebasestorage.app",
  messagingSenderId: "90606615201",
  appId: "1:90606615201:web:7126a42ca59b57bdc58ee0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== UI MANAGER ====================
class UIManager {
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      padding: 15px 20px; border-radius: 8px; color: white;
      background: ${colors[type] || colors.info};
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  createConfetti() {
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed; left: ${Math.random() * window.innerWidth}px; top: -10px;
          width: 8px; height: 8px; border-radius: 50%; pointer-events: none; z-index: 9999;
          background: ${['#ff6b35', '#00ff88', '#ff6b9d', '#00ff00'][Math.floor(Math.random() * 4)]};
        `;
        document.body.appendChild(confetti);
        
        confetti.animate([
          { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
          { transform: `translateY(${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }
        ], { duration: 2000 }).onfinish = () => confetti.remove();
      }, i * 50);
    }
  }
}

// ==================== CANVAS MANAGER ====================
class CanvasManager {
  constructor() {
    this.canvas = document.getElementById('drawCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.currentColor = '#ff6b35';
    this.currentSize = 5;
    this.currentTool = 'brush';
    this.history = [];
    this.historyStep = -1;
    this.init();
  }

  init() {
    // Establecer fondo blanco inicial
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.setupEvents();
    this.saveState();
  }

  setupEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    }, { passive: false });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.stopDrawing();
    }, { passive: false });
  }

  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  startDrawing(e) {
    this.isDrawing = true;
    const coords = this.getCoordinates(e);
    
    if (this.currentTool === 'bucket') {
      this.bucketFill(Math.floor(coords.x), Math.floor(coords.y));
      this.stopDrawing();
      return;
    }
    
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  draw(e) {
    if (!this.isDrawing) return;
    
    const coords = this.getCoordinates(e);
    this.ctx.lineWidth = this.currentSize;
    
    if (this.currentTool === 'brush') {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.lineTo(coords.x, coords.y);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(coords.x, coords.y);
    } else if (this.currentTool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineTo(coords.x, coords.y);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(coords.x, coords.y);
    } else if (this.currentTool === 'spray') {
      this.drawSpray(coords.x, coords.y);
    }
  }

  drawSpray(x, y) {
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = this.currentColor;
    for (let i = 0; i < 20; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      this.ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
    }
  }

  bucketFill(startX, startY) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const startPos = (startY * this.canvas.width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];
    
    const fillColor = this.hexToRgb(this.currentColor);
    if (!fillColor) return;
    
    const stack = [[startX, startY]];
    const visited = new Set();
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      
      if (visited.has(key) || x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) continue;
      visited.add(key);
      
      const pos = (y * this.canvas.width + x) * 4;
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      const a = data[pos + 3];
      
      if (r === startR && g === startG && b === startB && a === startA) {
        data[pos] = fillColor.r;
        data[pos + 1] = fillColor.g;
        data[pos + 2] = fillColor.b;
        data[pos + 3] = 255;
        
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
    this.saveState();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.ctx.beginPath();
      this.ctx.globalCompositeOperation = 'source-over';
      this.saveState();
    }
  }

  setTool(tool) {
    this.currentTool = tool;
  }

  setColor(color) {
    this.currentColor = color;
  }

  setSize(size) {
    this.currentSize = size;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Restaurar fondo blanco
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';
    this.saveState();
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.restoreState();
    }
  }

  saveState() {
    this.historyStep++;
    if (this.historyStep < this.history.length) {
      this.history.length = this.historyStep;
    }
    this.history.push(this.canvas.toDataURL());
    if (this.history.length > 50) {
      this.history.shift();
      this.historyStep--;
    }
  }

  restoreState() {
    const state = this.history[this.historyStep];
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Fondo blanco antes de restaurar
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = state;
  }

  isEmpty() {
    const blank = document.createElement('canvas');
    blank.width = this.canvas.width;
    blank.height = this.canvas.height;
    return this.canvas.toDataURL() === blank.toDataURL();
  }

  getImageData(transparent = false) {
    if (transparent) {
      // Retornar con transparencia
      return this.canvas.toDataURL('image/png');
    }
    
    // Crear canvas temporal con fondo blanco
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Rellenar con blanco
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Dibujar el canvas encima
    tempCtx.drawImage(this.canvas, 0, 0);
    
    return tempCanvas.toDataURL('image/png');
  }

  exportImage(transparent = false) {
    const link = document.createElement('a');
    link.download = `dibujo-fenixlab-${Date.now()}.png`;
    link.href = this.getImageData(transparent);
    link.click();
  }
}

// ==================== GALLERY MANAGER ====================
class GalleryManager {
  constructor(db) {
    this.db = db;
  }

  async loadDrawings() {
    const gallery = document.getElementById('drawingsGallery');
    
    try {
      const q = query(
        collection(this.db, 'dibujos'),
        orderBy('timestamp', 'desc'),
        limit(24)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        gallery.innerHTML = `
          <div class="col-12">
            <div class="text-center text-muted py-5">
              <i data-lucide="inbox" style="width: 3rem; height: 3rem;"></i>
              <p class="mt-3">Todavía no hay dibujos. ¡Sé el primero!</p>
            </div>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      gallery.innerHTML = '';
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
          <div class="drawing-card" onclick="window.guestbookApp.viewDrawing('${docSnap.id}')" style="cursor: pointer;">
            <img src="${data.imagenData}" class="drawing-img" alt="Dibujo de ${data.autor}" loading="lazy">
            <div class="drawing-info">
              <div class="drawing-author">
                <i data-lucide="user" style="width: 1rem; height: 1rem;"></i>
                <strong>${data.autor}</strong>
                ${data.categoria ? `<span class="badge bg-secondary ms-2" style="font-size: 0.7rem;">${data.categoria}</span>` : ''}
              </div>
              ${data.titulo && !data.titulo.includes('Dibujo de') ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0.5rem 0 0 0;">${data.titulo}</p>` : ''}
              <div class="drawing-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); window.guestbookApp.likeDrawing('${docSnap.id}', this)">
                  <i data-lucide="heart" style="width: 0.875rem; height: 0.875rem;"></i>
                  <span class="like-count">${data.likes || 0}</span>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); window.guestbookApp.viewComments('${docSnap.id}')">
                  <i data-lucide="message-circle" style="width: 0.875rem; height: 0.875rem;"></i>
                  <span>${(data.comments || []).length}</span>
                </button>
                <span style="color: var(--text-secondary); font-size: 0.75rem; align-self: center;">
                  ${this.formatDate(data.timestamp)}
                </span>
              </div>
            </div>
          </div>
        `;
        gallery.appendChild(col);
      });

      lucide.createIcons();
    } catch (error) {
      console.error('Error cargando dibujos:', error);
      gallery.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">Error al cargar dibujos</div>
        </div>
      `;
    }
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'hace un momento';
    if (diff < 3600000) return `hace ${Math.floor(diff/60000)}m`;
    if (diff < 86400000) return `hace ${Math.floor(diff/3600000)}h`;
    if (diff < 604800000) return `hace ${Math.floor(diff/86400000)}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}

// ==================== GUESTBOOK APP ====================
class GuestbookApp {
  constructor() {
    this.ui = new UIManager();
    this.canvas = new CanvasManager();
    this.gallery = new GalleryManager(db);
    this.db = db;
    this.currentDrawingId = null;
    this.init();
  }

  init() {
    this.setupControls();
    this.initColorPalette();
    this.gallery.loadDrawings();
    console.log('✅ Guestbook v1.0 inicializado');
  }

  setupControls() {
    // Brush size
    document.getElementById('brushSize').addEventListener('input', (e) => {
      this.canvas.setSize(parseInt(e.target.value));
      document.getElementById('brushSizeValue').textContent = e.target.value;
    });

    // Custom color
    document.getElementById('customColor').addEventListener('change', (e) => {
      this.selectColor(e.target.value, null);
    });
  }

  initColorPalette() {
    const colorPalette = [
      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#FF6B35', '#F7931E', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#6366F1'
    ];

    const paletteEl = document.getElementById('colorPalette');
    colorPalette.forEach((color, index) => {
      const btn = document.createElement('button');
      btn.className = 'color-btn' + (index === 8 ? ' active' : '');
      btn.style.background = color;
      btn.onclick = () => this.selectColor(color, btn);
      paletteEl.appendChild(btn);
    });

    this.canvas.setColor(colorPalette[8]);
    document.getElementById('customColor').value = colorPalette[8];
  }

  selectColor(color, btn) {
    this.canvas.setColor(color);
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.getElementById('customColor').value = color;
  }

  selectTool(tool) {
    this.canvas.setTool(tool);
    document.querySelectorAll('.btn-tool').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tool-' + tool).classList.add('active');
  }

  clearCanvas() {
    if (confirm('¿Estás seguro de que quieres borrar todo?')) {
      this.canvas.clear();
      this.ui.showNotification('🗑️ Canvas limpiado', 'info');
    }
  }

  undoCanvas() {
    this.canvas.undo();
    this.ui.showNotification('↩️ Deshacer', 'info');
  }

  async saveDrawing() {
    if (this.canvas.isEmpty()) {
      this.ui.showNotification('¡Dibuja algo primero!', 'error');
      return;
    }

    const authorName = document.getElementById('authorName').value.trim() || 'Anónimo';
    const comment = document.getElementById('drawingComment').value.trim();
    const category = document.getElementById('categorySelect').value;
    const imageData = this.canvas.getImageData(false); // false = con fondo blanco

    try {
      const drawingData = {
        titulo: comment || `Dibujo de ${authorName}`,
        imagenData: imageData,
        timestamp: Date.now(),
        autor: authorName,
        categoria: category,
        domain: 'thisisfenix.github.io',
        likes: 0,
        comments: []
      };

      await addDoc(collection(this.db, 'dibujos'), drawingData);
      
      this.ui.showNotification('✅ ¡Dibujo guardado!', 'success');
      this.ui.createConfetti();
      this.canvas.clear();
      document.getElementById('authorName').value = '';
      document.getElementById('drawingComment').value = '';
      document.getElementById('categorySelect').value = 'Arte';
      
      setTimeout(() => {
        this.gallery.loadDrawings();
        document.getElementById('drawingsGallery').scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    } catch (error) {
      console.error('Error guardando dibujo:', error);
      this.ui.showNotification('❌ Error al guardar', 'error');
    }
  }

  exportDrawing(transparent) {
    this.canvas.exportImage(transparent);
    this.ui.showNotification(`💾 Descargando ${transparent ? 'PNG transparente' : 'PNG con fondo blanco'}`, 'success');
  }

  async likeDrawing(drawingId, button) {
    try {
      const docRef = doc(this.db, 'dibujos', drawingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentLikes = docSnap.data().likes || 0;
        await updateDoc(docRef, {
          likes: currentLikes + 1
        });
        
        const likeCount = button.querySelector('.like-count');
        if (likeCount) {
          likeCount.textContent = currentLikes + 1;
        }
        
        button.disabled = true;
        button.classList.add('text-danger');
        this.ui.showNotification('❤️ ¡Like agregado!', 'success');
      }
    } catch (error) {
      console.error('Error agregando like:', error);
      this.ui.showNotification('❌ Error al dar like', 'error');
    }
  }

  async viewDrawing(drawingId) {
    try {
      const docRef = doc(this.db, 'dibujos', drawingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.currentDrawingId = drawingId;
        
        document.getElementById('modalDrawingTitle').textContent = data.titulo || `Dibujo de ${data.autor}`;
        document.getElementById('modalDrawingImage').src = data.imagenData;
        document.getElementById('modalDrawingInfo').textContent = `Por ${data.autor} • ${data.categoria || 'Arte'}`;
        document.getElementById('modalDrawingStats').innerHTML = `
          <span><i data-lucide="heart"></i> ${data.likes || 0} likes</span>
          <span><i data-lucide="message-circle"></i> ${(data.comments || []).length} comentarios</span>
        `;
        
        // Manejar GIF de fondo si existe
        if (data.backgroundGif) {
          document.getElementById('modalGifBackgroundImg').src = data.backgroundGif;
          document.getElementById('modalGifBackground').style.display = 'block';
        } else {
          document.getElementById('modalGifBackground').style.display = 'none';
        }
        
        // Manejar stickers GIF si existen
        const stickersContainer = document.getElementById('modalGifStickers');
        stickersContainer.innerHTML = '';
        if (data.gifStickers && data.gifStickers.length > 0) {
          data.gifStickers.forEach(sticker => {
            const img = document.createElement('img');
            img.src = sticker.src;
            img.style.cssText = `
              position: absolute;
              left: ${sticker.x}px;
              top: ${sticker.y}px;
              width: ${sticker.width}px;
              height: ${sticker.height}px;
            `;
            stickersContainer.appendChild(img);
          });
        }
        
        const modal = new bootstrap.Modal(document.getElementById('imageModal'));
        modal.show();
        
        setTimeout(() => lucide.createIcons(), 100);
      }
    } catch (error) {
      console.error('Error cargando dibujo:', error);
      this.ui.showNotification('❌ Error al cargar dibujo', 'error');
    }
  }

  showComments() {
    const imageModal = bootstrap.Modal.getInstance(document.getElementById('imageModal'));
    if (imageModal) imageModal.hide();
    
    setTimeout(() => {
      this.viewComments(this.currentDrawingId);
    }, 300);
  }

  async viewComments(drawingId) {
    try {
      this.currentDrawingId = drawingId;
      const docRef = doc(this.db, 'dibujos', drawingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const comments = data.comments || [];
        const container = document.getElementById('commentsContainer');
        
        if (comments.length === 0) {
          container.innerHTML = `
            <div class="text-center text-muted py-4">
              <i data-lucide="message-circle" style="width: 2rem; height: 2rem;"></i>
              <p class="mt-2">Todavía no hay comentarios. ¡Sé el primero!</p>
            </div>
          `;
        } else {
          container.innerHTML = comments.map(comment => `
            <div class="comment-item p-3 mb-2" style="background: var(--bg-dark); border-radius: 8px; border-left: 3px solid var(--primary);">
              <div class="d-flex justify-content-between mb-1">
                <strong style="color: var(--primary);">${comment.autor || 'Anónimo'}</strong>
                <small style="color: var(--text-secondary);">${this.gallery.formatDate(comment.timestamp)}</small>
              </div>
              <p style="color: var(--text); margin: 0;">${comment.texto}</p>
            </div>
          `).join('');
        }
        
        const modal = new bootstrap.Modal(document.getElementById('commentsModal'));
        modal.show();
        
        setTimeout(() => lucide.createIcons(), 100);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      this.ui.showNotification('❌ Error al cargar comentarios', 'error');
    }
  }

  async addComment() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
      this.ui.showNotification('Escribe un comentario primero', 'warning');
      return;
    }
    
    try {
      const docRef = doc(this.db, 'dibujos', this.currentDrawingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentComments = docSnap.data().comments || [];
        const newComment = {
          texto: commentText,
          autor: document.getElementById('authorName').value.trim() || 'Anónimo',
          timestamp: Date.now()
        };
        
        await updateDoc(docRef, {
          comments: [...currentComments, newComment]
        });
        
        commentInput.value = '';
        this.ui.showNotification('✅ Comentario agregado', 'success');
        this.viewComments(this.currentDrawingId);
        this.gallery.loadDrawings();
      }
    } catch (error) {
      console.error('Error agregando comentario:', error);
      this.ui.showNotification('❌ Error al comentar', 'error');
    }
  }

  loadDrawings() {
    this.gallery.loadDrawings();
  }
}

// ==================== INICIALIZAR ====================
document.addEventListener('DOMContentLoaded', () => {
  window.guestbookApp = new GuestbookApp();
  
  // Exponer funciones globales
  window.selectTool = (tool) => window.guestbookApp.selectTool(tool);
  window.clearCanvas = () => window.guestbookApp.clearCanvas();
  window.undoCanvas = () => window.guestbookApp.undoCanvas();
  window.saveDrawing = () => window.guestbookApp.saveDrawing();
  window.loadDrawings = () => window.guestbookApp.loadDrawings();
  window.exportDrawing = (transparent) => window.guestbookApp.exportDrawing(transparent);
  
  // Inicializar Lucide icons
  lucide.createIcons();
});
