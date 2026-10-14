// ==================== GUESTBOOK V1.0 ====================
// Inicialización y orquestación de módulos existentes

// Importar módulos ES6
import { MobileOptimizer } from './mobile-optimizer.js';
import { UIManager } from './ui.js';
import { FirebaseManager } from './firebase.js';
import { CanvasManager } from './canvas.js';
import { GalleryManagerV2 as GalleryManager } from './gallery-v2.js';
import { CommentsManager } from './comments.js';
import { SoundSystem } from './sound-system.js';
import { AdvancedTools } from './tools.js';
import { ProfileManagerV2 } from './profiles-v2.js';
import { MediaPickerManager } from './media-picker.js';

// Instancias globales
let uiManager, firebaseManager, canvasManager, galleryManager, commentsManager, advancedTools, profileManager;

// Crear objeto guestbookApp global para compatibilidad con funciones de gallery.js
window.guestbookApp = {
  firebase: null,
  ui: null,
  canvas: null,
  gallery: null,
  comments: null,
  profiles: null,
  tools: null // Herramientas avanzadas
};

// ==================== MODO CANVAS: SIMPLE VS EXPERTO ====================
let currentCanvasMode = 'simple'; // Por defecto modo simple

window.switchCanvasMode = function(mode) {
  currentCanvasMode = mode;
  
  // Actualizar UI de los botones
  document.getElementById('modeSimple')?.classList.toggle('active', mode === 'simple');
  document.getElementById('modeExpert')?.classList.toggle('active', mode === 'expert');
  
  // Guardar preferencia
  localStorage.setItem('canvasMode', mode);
  
  // Aplicar cambios visuales
  if (mode === 'simple') {
    // Ocultar herramientas avanzadas
    document.querySelectorAll('.expert-only').forEach(el => {
      el.style.display = 'none';
    });
    
    // Notificar
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification('✨ Modo Simple activado - Herramientas básicas', 'success');
    }
  } else {
    // Mostrar todas las herramientas
    document.querySelectorAll('.expert-only').forEach(el => {
      el.style.display = '';
    });
    
    // Notificar
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification('🚀 Modo Experto activado - Todas las herramientas', 'success');
    }
  }
  
  // Reinicializar iconos
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

// ==================== FUNCIONES GLOBALES DE HERRAMIENTAS ====================
window.selectTool = function(tool) {
  if (!window.canvasManager) return;
  
  // Actualizar UI
  document.querySelectorAll('.btn-tool').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tool-${tool}`)?.classList.add('active');
  
  // Cambiar herramienta en el módulo de canvas
  window.canvasManager.setTool(tool);
};

window.undoCanvas = function() {
  if (window.canvasManager) {
    window.canvasManager.undo();
  }
};

window.clearCanvas = function() {
  if (confirm('¿Seguro que quieres borrar todo el dibujo?')) {
    if (window.canvasManager) {
      window.canvasManager.clear();
    }
  }
};

window.exportDrawing = function(transparent = false) {
  if (window.canvasManager) {
    window.canvasManager.exportImage(transparent);
  }
};

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
  window.guestbookApp.ui = uiManager;
  console.log('[V1] UI Manager inicializado');
  
  // Inicializar Canvas Manager
  canvasManager = new CanvasManager();
  window.canvasManager = canvasManager;
  window.guestbookApp.canvas = canvasManager;
  console.log('[V1] Canvas inicializado');
  
  // Inicializar herramientas avanzadas
  advancedTools = new AdvancedTools(canvasManager);
  window.advancedTools = advancedTools;
  window.guestbookApp.tools = advancedTools;
  console.log('[V1] Herramientas avanzadas inicializadas');
  
  // Inicializar Firebase Manager
  try {
    firebaseManager = new FirebaseManager();
    window.firebaseManager = firebaseManager;
    window.guestbookApp.firebase = firebaseManager;
    console.log('[V1] Firebase conectado');
  } catch (error) {
    console.error('[V1] Error al conectar Firebase:', error);
    uiManager?.showNotification('Error al conectar con Firebase', 'error');
  }
  
  // Inicializar Gallery Manager
  galleryManager = new GalleryManager(firebaseManager);
  window.galleryManager = galleryManager;
  window.guestbookApp.gallery = galleryManager;
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
  window.guestbookApp.comments = commentsManager;
  console.log('[V1] Comments Manager inicializado');
  
  // Inicializar Profile Manager V2 (Sidebar)
  profileManager = new ProfileManagerV2(firebaseManager);
  window.profileManager = profileManager;
  window.guestbookApp.profiles = profileManager;
  console.log('[V1] Profile Manager V2 inicializado');
  
  // Inicializar Media Picker Manager
  const mediaPickerManager = new MediaPickerManager(firebaseManager, profileManager);
  window.mediaPickerManager = mediaPickerManager;
  window.guestbookApp.mediaPicker = mediaPickerManager;
  console.log('[V1] Media Picker inicializado');
  
  console.log('[V1] ✅ Guestbook v1.0 listo');
});

// ==================== FUNCIÓN PARA GUARDAR DIBUJO ====================
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
  
  // Cargar modo guardado al iniciar
  const savedMode = localStorage.getItem('canvasMode') || 'simple';
  setTimeout(() => {
    switchCanvasMode(savedMode);
  }, 500);
});
