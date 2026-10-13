// ==================== GUESTBOOK V1.0 ====================
// Inicialización y orquestación de módulos existentes

// Importar módulos ES6
import { MobileOptimizer } from './mobile-optimizer.js';
import { UIManager } from './ui.js';
import { FirebaseManager } from './firebase.js';
import { CanvasManager } from './canvas.js';
import { GalleryManager } from './gallery.js';
import { CommentsManager } from './comments.js';
import { SoundSystem } from './sound-system.js';

// Instancias globales
let uiManager, firebaseManager, canvasManager, galleryManager, commentsManager;

// ==================== ESPERAR A QUE LOS MÓDULOS ESTÉN LISTOS ====================
window.addEventListener('DOMContentLoaded', async () => {
  console.log('[V1] Inicializando Guestbook v1.0...');
  
  // Inicializar Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Inicializar tema (ya se auto-carga en theme-adapter.js)
  console.log('[V1] Tema sincronizado');
  
  // Inicializar optimizador móvil
  const mobileOptimizer = new MobileOptimizer();
  console.log('[V1] Optimización móvil activa');
  
  // Inicializar sistema de sonido (opcional)
  try {
    SoundSystem.init();
    console.log('[V1] Sistema de sonido listo');
  } catch (e) {
    console.log('[V1] Sistema de sonido no disponible');
  }
  
  // Inicializar UI Manager
  uiManager = new UIManager();
  window.uiManager = uiManager;
  console.log('[V1] UI Manager inicializado');
  
  // Inicializar Canvas Manager
  canvasManager = new CanvasManager();
  window.canvasManager = canvasManager;
  console.log('[V1] Canvas inicializado');
  
  // Inicializar Firebase Manager
  try {
    firebaseManager = new FirebaseManager();
    window.firebaseManager = firebaseManager;
    console.log('[V1] Firebase conectado');
  } catch (error) {
    console.error('[V1] Error al conectar Firebase:', error);
    uiManager?.showNotification('Error al conectar con Firebase', 'error');
  }
  
  // Inicializar Gallery Manager
  galleryManager = new GalleryManager(firebaseManager);
  window.galleryManager = galleryManager;
  console.log('[V1] Gallery Manager inicializado');
  
  // Cargar galería inicial (solo cargar, sin init completo que busca elementos que no existen en v1)
  try {
    await galleryManager.loadGallery();
    console.log('[V1] Galería cargada');
  } catch (error) {
    console.error('[V1] Error al cargar galería:', error);
  }
  
  // Inicializar Comments Manager
  commentsManager = new CommentsManager(firebaseManager);
  window.commentsManager = commentsManager;
  console.log('[V1] Comments Manager inicializado');
  
  console.log('[V1] ✅ Guestbook v1.0 listo');
});

// ==================== FUNCIONES GLOBALES DE HERRAMIENTAS ====================
window.selectTool = function(tool) {
  if (!canvasManager) return;
  
  // Actualizar UI
  document.querySelectorAll('.btn-tool').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tool-${tool}`)?.classList.add('active');
  
  // Cambiar herramienta en el módulo de canvas
  canvasManager.setTool(tool);
};

window.undoCanvas = function() {
  if (canvasManager) {
    canvasManager.undo();
  }
};

window.clearCanvas = function() {
  if (confirm('¿Seguro que quieres borrar todo el dibujo?')) {
    if (canvasManager) {
      canvasManager.clear();
    }
  }
};

window.exportDrawing = function(transparent = false) {
  if (canvasManager) {
    canvasManager.exportImage(transparent);
  }
};

window.saveDrawing = async function() {
  if (!canvasManager || !firebaseManager || !uiManager) {
    alert('Los módulos no están listos. Intenta de nuevo.');
    return;
  }
  
  const authorName = document.getElementById('authorName').value.trim() || 'Anónimo';
  const category = document.getElementById('categorySelect').value;
  const comment = document.getElementById('drawingComment').value.trim();
  
  // Obtener imagen del canvas
  const imageData = canvasManager.getImageData(false); // Con fondo blanco
  
  if (!imageData) {
    uiManager.showNotification('No hay nada que guardar', 'warning');
    return;
  }
  
  try {
    // Mostrar loading
    uiManager.showNotification('Guardando dibujo...', 'info');
    
    // Preparar datos según las reglas de Firebase
    const drawingData = {
      titulo: comment || `Dibujo de ${authorName}`,
      imagenData: imageData, // Nota: Firebase espera "imagenData" no "imageData"
      timestamp: Date.now(),
      autor: authorName,
      categoria: category,
      domain: window.location.hostname || 'localhost',
      likes: 0,
      comments: [],
      views: 0
    };
    
    // Guardar en Firebase
    await firebaseManager.saveDrawing(drawingData);
    
    // Éxito
    uiManager.showNotification('¡Dibujo guardado con éxito!', 'success');
    uiManager.createConfetti();
    
    // Limpiar canvas y recargar galería
    canvasManager.clear();
    document.getElementById('authorName').value = '';
    document.getElementById('drawingComment').value = '';
    
    if (galleryManager) {
      setTimeout(() => galleryManager.loadDrawings(), 1000);
    }
    
  } catch (error) {
    console.error('Error al guardar:', error);
    uiManager.showNotification('Error al guardar el dibujo', 'error');
  }
};

window.loadDrawings = function() {
  if (galleryManager) {
    galleryManager.loadDrawings();
  }
};

// ==================== PALETTE DE COLORES ====================
function initColorPalette() {
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#808080', '#FF6B35', '#FFA500', '#00FF88', '#4169E1', '#FF1493', '#9370DB'
  ];
  
  const palette = document.getElementById('colorPalette');
  if (!palette) return;
  
  colors.forEach((color, i) => {
    const btn = document.createElement('button');
    btn.className = 'color-btn' + (i === 10 ? ' active' : '');
    btn.style.backgroundColor = color;
    btn.onclick = () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (canvasManager) {
        canvasManager.setColor(color);
      }
    };
    palette.appendChild(btn);
  });
}

// Custom color input y brush size
document.addEventListener('DOMContentLoaded', () => {
  initColorPalette();
  
  const customColor = document.getElementById('customColor');
  if (customColor) {
    customColor.addEventListener('change', (e) => {
      if (canvasManager) {
        canvasManager.setColor(e.target.value);
      }
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    });
  }
  
  const brushSize = document.getElementById('brushSize');
  const brushSizeValue = document.getElementById('brushSizeValue');
  if (brushSize && brushSizeValue) {
    brushSize.addEventListener('input', (e) => {
      brushSizeValue.textContent = e.target.value;
      if (canvasManager) {
        canvasManager.setSize(parseInt(e.target.value));
      }
    });
  }
});
