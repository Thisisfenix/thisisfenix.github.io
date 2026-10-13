// ==================== GUESTBOOK V1.0 ====================
// Inicialización y orquestación de módulos existentes

// Importar módulos ES6
import { MobileOptimizer } from './mobile-optimizer.js';

// ==================== ESPERAR A QUE LOS MÓDULOS ESTÉN LISTOS ====================
window.addEventListener('DOMContentLoaded', () => {
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
  if (window.SoundSystem) {
    window.SoundSystem.init();
    console.log('[V1] Sistema de sonido listo');
  }
  
  // Inicializar canvas
  if (window.CanvasModule) {
    window.CanvasModule.init('drawCanvas');
    console.log('[V1] Canvas inicializado');
  }
  
  // Inicializar Firebase y galería
  if (window.FirebaseModule) {
    window.FirebaseModule.init().then(() => {
      console.log('[V1] Firebase conectado');
      
      // Cargar galería inicial
      if (window.GalleryModule) {
        window.GalleryModule.loadDrawings();
        console.log('[V1] Galería cargada');
      }
    });
  }
  
  // Inicializar stats si está disponible
  if (window.StatsModule) {
    console.log('[V1] Módulo de estadísticas disponible');
  }
  
  console.log('[V1] ✅ Guestbook v1.0 listo');
});

// ==================== FUNCIONES GLOBALES DE HERRAMIENTAS ====================
window.selectTool = function(tool) {
  if (!window.CanvasModule) return;
  
  // Actualizar UI
  document.querySelectorAll('.btn-tool').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tool-${tool}`)?.classList.add('active');
  
  // Cambiar herramienta en el módulo de canvas
  window.CanvasModule.setTool(tool);
};

window.undoCanvas = function() {
  if (window.CanvasModule) {
    window.CanvasModule.undo();
  }
};

window.clearCanvas = function() {
  if (confirm('¿Seguro que quieres borrar todo el dibujo?')) {
    if (window.CanvasModule) {
      window.CanvasModule.clear();
    }
  }
};

window.exportDrawing = function(transparent = false) {
  if (window.CanvasModule) {
    window.CanvasModule.exportImage(transparent);
  }
};

window.saveDrawing = async function() {
  if (!window.CanvasModule || !window.FirebaseModule) {
    alert('Los módulos no están listos. Intenta de nuevo.');
    return;
  }
  
  const authorName = document.getElementById('authorName').value.trim() || 'Anónimo';
  const category = document.getElementById('categorySelect').value;
  const comment = document.getElementById('drawingComment').value.trim();
  
  // Obtener imagen del canvas
  const imageData = window.CanvasModule.getImageData(false); // Con fondo blanco
  
  if (!imageData) {
    alert('No hay nada que guardar');
    return;
  }
  
  try {
    // Mostrar loading
    if (window.UIModule) {
      window.UIModule.showNotification('Guardando dibujo...', 'info');
    }
    
    // Guardar en Firebase
    await window.FirebaseModule.saveDrawing({
      imageData,
      author: authorName,
      category,
      comment,
      timestamp: new Date()
    });
    
    // Éxito
    if (window.UIModule) {
      window.UIModule.showNotification('¡Dibujo guardado con éxito!', 'success');
      window.UIModule.createConfetti();
    }
    
    // Limpiar canvas y recargar galería
    window.CanvasModule.clear();
    document.getElementById('authorName').value = '';
    document.getElementById('drawingComment').value = '';
    
    if (window.GalleryModule) {
      setTimeout(() => window.GalleryModule.loadDrawings(), 1000);
    }
    
  } catch (error) {
    console.error('Error al guardar:', error);
    if (window.UIModule) {
      window.UIModule.showNotification('Error al guardar el dibujo', 'error');
    }
  }
};

window.loadDrawings = function() {
  if (window.GalleryModule) {
    window.GalleryModule.loadDrawings();
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
      if (window.CanvasModule) {
        window.CanvasModule.setColor(color);
      }
    };
    palette.appendChild(btn);
  });
}

// Custom color input
document.addEventListener('DOMContentLoaded', () => {
  initColorPalette();
  
  const customColor = document.getElementById('customColor');
  if (customColor) {
    customColor.addEventListener('change', (e) => {
      if (window.CanvasModule) {
        window.CanvasModule.setColor(e.target.value);
      }
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    });
  }
  
  const brushSize = document.getElementById('brushSize');
  const brushSizeValue = document.getElementById('brushSizeValue');
  if (brushSize && brushSizeValue) {
    brushSize.addEventListener('input', (e) => {
      brushSizeValue.textContent = e.target.value;
      if (window.CanvasModule) {
        window.CanvasModule.setSize(parseInt(e.target.value));
      }
    });
  }
});
