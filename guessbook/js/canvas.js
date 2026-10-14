export class CanvasManager {
  constructor() {
    this.canvas = document.getElementById('drawCanvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    // Detectar versión
    this.version = this.detectVersion();
    
    this.isDrawing = false;
    this.currentColor = '#000000';
    this.currentSize = 3;
    this.currentOpacity = 1;
    this.currentTool = 'brush';
    this.currentBrushType = 'normal';
    this.currentEffect = null;
    this.symmetryEnabled = false;
    this.strokeCount = 0;
    this.history = [];
    this.historyStep = -1;
    this.stickers = [];
    this.isShapeDrawing = false;
    this.shapeStartX = 0;
    this.shapeStartY = 0;
    this.zoomLevel = 1;
    this.appliedFilters = [];
    this.layers = [];
    this.currentLayer = 0;
    this.layerMode = false; // Modo simple por defecto
    this.initializeLayers();
    this.originalImageData = null;
    this.activeTextBox = null; // Para la herramienta de texto estilo Paint
    this.activeImage = null; // Para la herramienta de imagen
    
    this.init();
  }
  
  detectVersion() {
    if (window.location.pathname.includes('v1')) return 'v1';
    if (window.location.pathname.includes('new')) return 'new';
    return 'old';
  }
  
  init() {
    // Para v1, establecer fondo blanco inicial
    if (this.version === 'v1') {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.setupEvents();
    this.saveState();
    this.initImageSystem();
  }
  
  initializeLayers() {
    // Crear capa base
    const baseLayer = {
      id: 0,
      name: 'Fondo',
      canvas: document.createElement('canvas'),
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'normal'
    };
    baseLayer.canvas.width = this.canvas.width;
    baseLayer.canvas.height = this.canvas.height;
    this.layers = [baseLayer];
  }
  
  setupEvents() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // Touch events
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
      const mouseEvent = new MouseEvent('mouseup', {});
      this.canvas.dispatchEvent(mouseEvent);
    }, { passive: false });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
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
    // Verificar si la capa está bloqueada
    if (this.layerMode && this.layers[this.currentLayer]?.locked) {
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification(
          `🔒 ${this.layers[this.currentLayer].name} está bloqueada`,
          'warning'
        );
      }
      return;
    }
    
    // En modo capas, crear un canvas temporal para el trazo
    if (this.layerMode) {
      this.tempLayerCanvas = document.createElement('canvas');
      this.tempLayerCanvas.width = this.canvas.width;
      this.tempLayerCanvas.height = this.canvas.height;
      this.tempLayerCtx = this.tempLayerCanvas.getContext('2d');
    }
    
    this.isDrawing = true;
    const coords = this.getCoordinates(e);
    
    if (this.currentTool === 'brush') {
      this.ctx.beginPath();
      this.ctx.moveTo(coords.x, coords.y);
      
      // También inicializar en el canvas temporal
      if (this.layerMode && this.tempLayerCtx) {
        this.tempLayerCtx.beginPath();
        this.tempLayerCtx.moveTo(coords.x, coords.y);
      }
    } else if (this.currentTool === 'eraser') {
      this.ctx.beginPath();
      this.ctx.moveTo(coords.x, coords.y);
      
      // También inicializar en el canvas temporal
      if (this.layerMode && this.tempLayerCtx) {
        this.tempLayerCtx.beginPath();
        this.tempLayerCtx.moveTo(coords.x, coords.y);
      }
    } else if (this.currentTool === 'text') {
      this.createTextBox(coords.x, coords.y);
      this.isDrawing = false;
      return;
    } else if (['circle', 'line'].includes(this.currentTool)) {
      this.isShapeDrawing = true;
      this.shapeStartX = coords.x;
      this.shapeStartY = coords.y;
    } else if (this.currentTool === 'select') {
      console.log('Selection tool activated');
    }
  }
  
  draw(e) {
    if (!this.isDrawing) return;
    
    const coords = this.getCoordinates(e);
    
    // En modo capas, dibujar en el canvas temporal además del principal
    if (this.layerMode && this.tempLayerCtx) {
      // Configurar el canvas temporal
      this.setupBrush(this.tempLayerCtx);
      
      // Dibujar en el canvas temporal
      if (this.currentTool === 'brush') {
        this.tempLayerCtx.lineTo(coords.x, coords.y);
        this.tempLayerCtx.stroke();
      } else if (this.currentTool === 'eraser') {
        this.tempLayerCtx.lineTo(coords.x, coords.y);
        this.tempLayerCtx.stroke();
      } else if (this.currentTool === 'spray') {
        this.drawSprayOn(coords.x, coords.y, this.tempLayerCtx);
      }
    }
    
    // Configurar el canvas principal
    this.setupBrush();
    
    if (this.currentTool === 'brush') {
      this.ctx.lineTo(coords.x, coords.y);
      this.ctx.stroke();
      
      if (this.symmetryEnabled) {
        const centerX = this.canvas.width / 2;
        const mirrorX = centerX + (centerX - coords.x);
        this.ctx.lineTo(mirrorX, coords.y);
        this.ctx.stroke();
      }
      this.strokeCount++;
    } else if (this.currentTool === 'eraser') {
      this.ctx.lineTo(coords.x, coords.y);
      this.ctx.stroke();
    } else if (this.currentTool === 'spray') {
      this.drawSpray(coords.x, coords.y);
    } else if (this.currentTool === 'smudge') {
      this.drawSmudge(coords.x, coords.y);
    } else if (this.currentTool === 'blur') {
      this.drawBlur(coords.x, coords.y);
    } else if (this.currentTool === 'dodge') {
      this.drawDodge(coords.x, coords.y);
    } else if (this.currentTool === 'burn') {
      this.drawBurn(coords.x, coords.y);
    } else if (this.currentTool === 'sharpen') {
      this.drawSharpen(coords.x, coords.y);
    } else if (this.currentTool === 'sponge') {
      this.drawSponge(coords.x, coords.y, true);
    } else if (this.currentTool === 'bucket') {
      this.bucketFill(coords.x, coords.y);
    } else if (this.currentTool === 'eyedropper') {
      this.pickColor(coords.x, coords.y);
    }
  }
  
  renderAllLayersImmediate() {
    // Usar el método seguro que no modifica contenido
    this.renderLayersOnly();
  }
  
  setupBrush(ctx = this.ctx) {
    // Configurar para todas las herramientas excepto borrador
    if (this.currentTool !== 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = this.currentOpacity;
      ctx.strokeStyle = this.getEffectColor(ctx);
    } else {
      // Configuración específica para borrador
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
    }
    ctx.lineWidth = this.getBrushSize();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  
  drawBrush(coords, ctx = this.ctx) {
    // Aplicar efectos
    if (this.currentEffect === 'neon') {
      ctx.shadowColor = this.currentColor;
      ctx.shadowBlur = 10;
    } else if (this.currentEffect === 'watercolor') {
      ctx.globalAlpha = 0.3;
    }
    
    // Dibujar línea principal
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    // Simetría si está habilitada
    if (this.symmetryEnabled) {
      const centerX = this.canvas.width / 2;
      const mirrorX = centerX + (centerX - coords.x);
      ctx.lineTo(mirrorX, coords.y);
      ctx.stroke();
    }
    
    // Limpiar efectos
    ctx.shadowBlur = 0;
    this.strokeCount++;
  }
  
  getEffectColor(ctx = this.ctx) {
    if (this.currentEffect === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, 0);
      gradient.addColorStop(0, this.currentColor);
      gradient.addColorStop(1, '#ffffff');
      return gradient;
    }
    return this.currentColor;
  }
  
  getBrushSize() {
    const multipliers = {
      'fine': 0.5,
      'normal': 1,
      'thick': 2,
      'art': 1.5
    };
    return this.currentSize * (multipliers[this.currentBrushType] || 1);
  }
  
  stopDrawing(e) {
    if (this.isDrawing || this.isShapeDrawing) {
      if (this.isShapeDrawing && e) {
        const coords = this.getCoordinates(e);
        this.drawShape(this.shapeStartX, this.shapeStartY, coords.x, coords.y);
        this.isShapeDrawing = false;
      }
      this.isDrawing = false;
      
      // Restaurar configuración por defecto
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = 1;
      
      // En modo capas, guardar el trazo en la capa actual
      if (this.layerMode && this.tempLayerCanvas) {
        // Copiar el contenido del canvas temporal a la capa actual
        const layerCtx = this.layers[this.currentLayer].canvas.getContext('2d');
        layerCtx.drawImage(this.tempLayerCanvas, 0, 0);
        
        // Limpiar el canvas temporal
        this.tempLayerCanvas = null;
        
        // Re-renderizar todas las capas
        this.renderLayers();
      }
      
      this.saveState();
    }
  }
  
  drawShape(startX, startY, endX, endY, ctx = this.ctx) {
    ctx.strokeStyle = this.currentColor;
    ctx.lineWidth = this.currentSize;
    ctx.globalCompositeOperation = 'source-over';
    
    if (this.currentTool === 'circle') {
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (this.currentTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
  
  drawSpray(x, y, ctx = this.ctx) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = this.currentColor;
    for (let i = 0; i < 20; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
    }
  }
  
  bucketFill(startX, startY) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const startPos = (Math.floor(startY) * this.canvas.width + Math.floor(startX)) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];
    
    const fillColor = this.hexToRgb(this.currentColor);
    if (!fillColor) return;
    
    const stack = [[Math.floor(startX), Math.floor(startY)]];
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
  
  pickColor(x, y) {
    const imageData = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
    const data = imageData.data;
    const r = data[0];
    const g = data[1];
    const b = data[2];
    
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    this.currentColor = hex;
    document.getElementById('customColor').value = hex;
    document.querySelector('.color-btn.active')?.classList.remove('active');
    this.setTool('brush');
  }
  
  // Herramienta de Texto estilo Paint
  createTextBox(x, y) {
    // Si ya hay una caja de texto, finalizarla primero
    if (this.activeTextBox) {
      this.finalizeTextBox();
    }
    
    // Crear contenedor principal
    const container = document.createElement('div');
    container.className = 'text-box-container';
    container.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      z-index: 10000;
    `;
    
    // Barra de herramientas para el texto
    const toolbar = document.createElement('div');
    toolbar.className = 'text-toolbar';
    toolbar.style.cssText = `
      display: flex;
      gap: 4px;
      padding: 4px;
      background: var(--bg-dark);
      border: 1px solid var(--primary);
      border-radius: 4px 4px 0 0;
      align-items: center;
    `;
    
    // Botón reducir tamaño
    const btnSmallerFont = document.createElement('button');
    btnSmallerFont.innerHTML = '🔽';
    btnSmallerFont.title = 'Reducir texto';
    btnSmallerFont.style.cssText = 'background: var(--primary); color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 0.8em;';
    
    // Indicador de tamaño
    const fontSizeDisplay = document.createElement('span');
    fontSizeDisplay.style.cssText = 'color: var(--text); font-size: 0.8em; min-width: 30px; text-align: center;';
    fontSizeDisplay.textContent = `${this.currentSize * 3}px`;
    
    // Botón aumentar tamaño
    const btnBiggerFont = document.createElement('button');
    btnBiggerFont.innerHTML = '🔼';
    btnBiggerFont.title = 'Aumentar texto';
    btnBiggerFont.style.cssText = 'background: var(--primary); color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 0.8em;';
    
    // Botón negrita
    const btnBold = document.createElement('button');
    btnBold.innerHTML = '<b>B</b>';
    btnBold.title = 'Negrita';
    btnBold.style.cssText = 'background: var(--bg-light); color: var(--text); border: 1px solid var(--primary); padding: 2px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;';
    
    // Botón cursiva
    const btnItalic = document.createElement('button');
    btnItalic.innerHTML = '<i>I</i>';
    btnItalic.title = 'Cursiva';
    btnItalic.style.cssText = 'background: var(--bg-light); color: var(--text); border: 1px solid var(--primary); padding: 2px 8px; border-radius: 3px; cursor: pointer; font-style: italic;';
    
    // Botón finalizar
    const btnDone = document.createElement('button');
    btnDone.innerHTML = '✓';
    btnDone.title = 'Finalizar (Escape)';
    btnDone.style.cssText = 'background: #28a745; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer; margin-left: auto;';
    
    toolbar.appendChild(btnSmallerFont);
    toolbar.appendChild(fontSizeDisplay);
    toolbar.appendChild(btnBiggerFont);
    toolbar.appendChild(btnBold);
    toolbar.appendChild(btnItalic);
    toolbar.appendChild(btnDone);
    
    // Crear caja de texto
    const textBox = document.createElement('div');
    textBox.contentEditable = true;
    textBox.className = 'paint-text-box';
    textBox.style.cssText = `
      min-width: 150px;
      min-height: ${this.currentSize * 3 * 1.2}px;
      padding: 8px;
      margin: 0;
      border: 2px solid ${this.currentColor};
      border-top: none;
      background: rgba(255, 255, 255, 0.95);
      color: ${this.currentColor};
      font-family: Arial, sans-serif;
      font-size: ${this.currentSize * 3}px;
      line-height: 1.2;
      outline: none;
      white-space: pre-wrap;
      word-wrap: break-word;
      cursor: text;
      resize: both;
      overflow: auto;
      box-sizing: border-box;
    `;
    
    container.appendChild(toolbar);
    container.appendChild(textBox);
    
    // Agregar al contenedor del canvas
    const canvasSection = this.canvas.parentElement;
    canvasSection.style.position = 'relative';
    canvasSection.appendChild(container);
    textBox.focus();
    
    // Variables para el texto
    let currentFontSize = this.currentSize * 3;
    let isBold = false;
    let isItalic = false;
    
    // Guardar referencia
    this.activeTextBox = {
      element: textBox,
      container: container,
      x: x,
      y: y,
      fontSize: currentFontSize,
      bold: isBold,
      italic: isItalic
    };
    
    // Eventos de los botones
    btnSmallerFont.onclick = (e) => {
      e.preventDefault();
      currentFontSize = Math.max(12, currentFontSize - 4);
      textBox.style.fontSize = currentFontSize + 'px';
      fontSizeDisplay.textContent = currentFontSize + 'px';
      this.activeTextBox.fontSize = currentFontSize;
      textBox.focus();
    };
    
    btnBiggerFont.onclick = (e) => {
      e.preventDefault();
      currentFontSize = Math.min(120, currentFontSize + 4);
      textBox.style.fontSize = currentFontSize + 'px';
      fontSizeDisplay.textContent = currentFontSize + 'px';
      this.activeTextBox.fontSize = currentFontSize;
      textBox.focus();
    };
    
    btnBold.onclick = (e) => {
      e.preventDefault();
      isBold = !isBold;
      textBox.style.fontWeight = isBold ? 'bold' : 'normal';
      btnBold.style.background = isBold ? 'var(--primary)' : 'var(--bg-light)';
      btnBold.style.color = isBold ? 'white' : 'var(--text)';
      this.activeTextBox.bold = isBold;
      textBox.focus();
    };
    
    btnItalic.onclick = (e) => {
      e.preventDefault();
      isItalic = !isItalic;
      textBox.style.fontStyle = isItalic ? 'italic' : 'normal';
      btnItalic.style.background = isItalic ? 'var(--primary)' : 'var(--bg-light)';
      btnItalic.style.color = isItalic ? 'white' : 'var(--text)';
      this.activeTextBox.italic = isItalic;
      textBox.focus();
    };
    
    btnDone.onclick = (e) => {
      e.preventDefault();
      this.finalizeTextBox();
    };
    
    // Evento para detectar Escape
    textBox.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.finalizeTextBox();
      }
    });
    
    // Click en el canvas finaliza el texto
    const canvasClickHandler = (e) => {
      const rect = container.getBoundingClientRect();
      const isClickInside = e.clientX >= rect.left && e.clientX <= rect.right &&
                           e.clientY >= rect.top && e.clientY <= rect.bottom;
      
      if (e.target === this.canvas && !isClickInside) {
        this.finalizeTextBox();
        this.canvas.removeEventListener('mousedown', canvasClickHandler);
      }
    };
    
    setTimeout(() => {
      this.canvas.addEventListener('mousedown', canvasClickHandler);
    }, 100);
  }
  
  finalizeTextBox() {
    if (!this.activeTextBox) return;
    
    const text = this.activeTextBox.element.innerText;
    
    if (text && text.trim()) {
      const ctx = this.layerMode && this.layers[this.currentLayer] 
        ? this.layers[this.currentLayer].canvas.getContext('2d')
        : this.ctx;
      
      ctx.save();
      
      // Aplicar estilo de fuente
      let fontStyle = '';
      if (this.activeTextBox.italic) fontStyle += 'italic ';
      if (this.activeTextBox.bold) fontStyle += 'bold ';
      
      ctx.font = `${fontStyle}${this.activeTextBox.fontSize}px Arial`;
      ctx.fillStyle = this.currentColor;
      ctx.textBaseline = 'top';
      
      if (this.currentEffect === 'neon') {
        ctx.shadowColor = this.currentColor;
        ctx.shadowBlur = 15;
      }
      
      const lines = text.split('\n');
      const lineHeight = this.activeTextBox.fontSize * 1.2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, this.activeTextBox.x, this.activeTextBox.y + (index * lineHeight));
      });
      
      ctx.restore();
      
      if (this.layerMode) {
        this.renderLayers();
      }
      
      this.saveState();
    }
    
    if (this.activeTextBox && this.activeTextBox.container) {
      this.activeTextBox.container.remove();
    }
    this.activeTextBox = null;
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  setTool(tool) {
    this.currentTool = tool;
    this.currentEffect = null;
    this.canvas.style.cursor = 'crosshair';
    
    // Si se selecciona la herramienta de imagen, abrir selector
    if (tool === 'image') {
      this.selectImageTool();
    }
  }
  
  setEffect(effect) {
    this.currentEffect = effect;
    if (effect === 'symmetry') {
      this.symmetryEnabled = !this.symmetryEnabled;
    }
  }
  
  setBrushType(type) {
    this.currentBrushType = type;
  }
  
  setColor(color) {
    this.currentColor = color;
  }
  
  setSize(size) {
    this.currentSize = size;
  }
  
  setOpacity(opacity) {
    this.currentOpacity = opacity / 100;
  }
  
  saveState() {
    // Solo guardar estado en modo simple
    if (this.layerMode) return;
    
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
  
  undo() {
    if (this.layerMode) {
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification('⚠️ Deshacer no disponible en modo capas. Usa el borrador.', 'info');
      }
      return;
    }
    if (this.historyStep > 0) {
      this.historyStep--;
      this.restoreState();
    }
  }
  
  redo() {
    if (this.layerMode) {
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification('⚠️ Rehacer no disponible en modo capas. Usa el borrador.', 'info');
      }
      return;
    }
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.restoreState();
    }
  }
  
  restoreState() {
    const state = this.history[this.historyStep];
    
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Para v1, restaurar fondo blanco antes de dibujar
      if (this.version === 'v1') {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = 1;
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = state;
  }
  
  clear() {
    // Solo limpiar el canvas principal, no las capas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Para v1, restaurar fondo blanco
    if (this.version === 'v1') {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.strokeCount = 0;
    this.stickers = [];
    
    // Restaurar configuración por defecto
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1;
    
    this.saveState();
  }
  
  isEmpty() {
    const blank = document.createElement('canvas');
    blank.width = this.canvas.width;
    blank.height = this.canvas.height;
    return this.canvas.toDataURL() === blank.toDataURL();
  }
  
  getImageData() {
    // Si hay frames capturados, crear GIF animado
    if (this.animationFrames && this.animationFrames.length > 1) {
      return this.createAnimatedGIF();
    }
    return this.canvas.toDataURL();
  }
  
  // Crear GIF animado del proceso de dibujo
  createAnimatedGIF() {
    return new Promise((resolve) => {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: this.canvas.width,
        height: this.canvas.height
      });
      
      // Agregar cada frame capturado
      this.animationFrames.forEach(frameData => {
        const img = new Image();
        img.onload = () => {
          gif.addFrame(img, { delay: 800 }); // 800ms entre frames
        };
        img.src = frameData;
      });
      
      gif.on('finished', (blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      
      gif.render();
    });
  }
  
  // Capturar frame del estado actual
  captureFrame() {
    if (!this.animationFrames) {
      this.animationFrames = [];
    }
    this.animationFrames.push(this.canvas.toDataURL());
    
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification(`📸 Frame ${this.animationFrames.length} capturado`, 'success');
    }
  }
  
  // Limpiar frames capturados
  clearFrames() {
    this.animationFrames = [];
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification('🗑️ Frames eliminados', 'info');
    }
  }
  
  // Obtener número de frames
  getFrameCount() {
    return this.animationFrames ? this.animationFrames.length : 0;
  }
  

  
  exportImage(transparent = false) {
    const link = document.createElement('a');
    link.download = `dibujo-fenixlab-${Date.now()}.png`;
    
    // Para v1, soportar transparencia
    if (this.version === 'v1') {
      if (transparent) {
        link.href = this.canvas.toDataURL('image/png');
      } else {
        // Crear canvas temporal con fondo blanco
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(this.canvas, 0, 0);
        
        link.href = tempCanvas.toDataURL('image/png');
      }
    } else {
      // Otras versiones, comportamiento normal
      link.href = this.canvas.toDataURL();
    }
    
    link.click();
    
    if (window.guestbookApp?.ui?.showNotification) {
      const msg = this.version === 'v1' && transparent
        ? '💾 Descargando PNG transparente'
        : '💾 Imagen exportada';
      window.guestbookApp.ui.showNotification(msg, 'success');
    }
  }
  
  handleKeyboard(e) {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
          break;
        case 'y':
          e.preventDefault();
          this.redo();
          break;
      }
    }
    
    // Tool shortcuts
    switch(e.key) {
      case 'b': this.setTool('brush'); break;
      case 's': this.setTool('spray'); break;
      case 'e': this.setTool('eraser'); break;
      case 't': this.setTool('text'); break;
      case 'c': this.setTool('circle'); break;
      case 'l': this.setTool('line'); break;
      case 'f': this.setTool('bucket'); break;
      case 'i': this.setTool('eyedropper'); break;
      case 'v': this.setTool('select'); break;
      case 'g': this.setEffect('gradient'); break;
      case 'n': this.setEffect('neon'); break;
      case 'w': this.setEffect('watercolor'); break;
      case 'm': this.setEffect('symmetry'); break;
      case '=': case '+': this.zoomIn(); break;
      case '-': case '_': this.zoomOut(); break;
    }
  }
  
  // Zoom functionality
  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3);
    this.applyZoom();
  }
  
  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
    this.applyZoom();
  }
  
  applyZoom() {
    const container = this.canvas.parentElement;
    this.canvas.style.transform = `scale(${this.zoomLevel})`;
    this.canvas.style.transformOrigin = 'center center';
  }
  
  // Filter functionality
  applyFilter(filterType) {
    if (!this.originalImageData) {
      this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    switch(filterType) {
      case 'blur':
        this.applyBlurFilter(imageData);
        break;
      case 'pixel':
        this.applyPixelFilter(imageData);
        break;
      case 'vintage':
        this.applyVintageFilter(data);
        break;
      case 'oleo':
        this.applyOleoFilter(data);
        break;
      case 'carbon':
        this.applyCarbonFilter(data);
        break;
    }
    
    this.ctx.putImageData(imageData, 0, 0);
    this.appliedFilters.push(filterType);
    this.saveState();
  }
  
  applyBlurFilter(imageData) {
    // Simple blur implementation
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
        }
        
        output[idx] = r / 9;
        output[idx + 1] = g / 9;
        output[idx + 2] = b / 9;
      }
    }
    
    for (let i = 0; i < data.length; i++) {
      data[i] = output[i];
    }
  }
  
  applyPixelFilter(imageData) {
    const data = imageData.data;
    const pixelSize = 8;
    
    for (let y = 0; y < imageData.height; y += pixelSize) {
      for (let x = 0; x < imageData.width; x += pixelSize) {
        const idx = (y * imageData.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        for (let dy = 0; dy < pixelSize && y + dy < imageData.height; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < imageData.width; dx++) {
            const i = ((y + dy) * imageData.width + (x + dx)) * 4;
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
        }
      }
    }
  }
  
  applyVintageFilter(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = Math.min(255, r * 1.2 + 30);
      data[i + 1] = Math.min(255, g * 1.1 + 20);
      data[i + 2] = Math.min(255, b * 0.8 + 10);
    }
  }
  
  applyOleoFilter(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = Math.min(255, r * 1.3);
      data[i + 1] = Math.min(255, g * 1.2);
      data[i + 2] = Math.min(255, b * 1.1);
    }
  }
  
  applyCarbonFilter(data) {
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const carbon = Math.max(0, 255 - gray * 1.5);
      
      data[i] = carbon;
      data[i + 1] = carbon;
      data[i + 2] = carbon;
    }
  }
  
  clearFilters() {
    if (this.originalImageData) {
      this.ctx.putImageData(this.originalImageData, 0, 0);
      this.appliedFilters = [];
      this.saveState();
    }
  }
  
  // Layer functionality
  toggleLayerMode() {
    this.layerMode = !this.layerMode;
    
    if (this.layerMode) {
      // Activar modo capas
      this.history = []; // Limpiar historial
      this.historyStep = -1;
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification('🎨 Modo Capas activado. Deshacer/Rehacer deshabilitado.', 'info');
      }
    } else {
      // Activar modo simple
      this.saveState(); // Guardar estado actual
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification('✏️ Modo Simple activado. Deshacer/Rehacer habilitado.', 'success');
      }
    }
    
    this.updateModeUI();
  }
  
  updateModeUI() {
    const layerControls = document.getElementById('layerControls');
    const layerControlsNew = document.getElementById('layerControlsNew');
    const modeToggle = document.getElementById('layerModeToggle');
    
    // Priorizar el nuevo UI si existe, sino usar el viejo
    const activeLayerUI = layerControlsNew || layerControls;
    
    if (activeLayerUI) {
      activeLayerUI.style.display = this.layerMode ? 'block' : 'none';
    }
    
    if (modeToggle) {
      modeToggle.textContent = this.layerMode ? '✏️ Modo Simple' : '🎨 Modo Capas';
      modeToggle.title = this.layerMode ? 'Cambiar a modo simple (con deshacer/rehacer)' : 'Cambiar a modo capas (sin deshacer/rehacer)';
    }
  }
  
  addLayer() {
    if (!this.layerMode) {
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification('⚠️ Activa el modo capas primero', 'warning');
      }
      return;
    }
    
    const newLayer = {
      id: this.layers.length,
      name: `Capa ${this.layers.length + 1}`,
      canvas: document.createElement('canvas'),
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'normal'
    };
    
    newLayer.canvas.width = this.canvas.width;
    newLayer.canvas.height = this.canvas.height;
    this.layers.push(newLayer);
    this.currentLayer = newLayer.id;
    
    // Limpiar canvas para la nueva capa
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Renderizar capas anteriores como referencia
    for (let i = 0; i < this.currentLayer; i++) {
      if (this.layers[i] && this.layers[i].visible && this.layers[i].canvas) {
        this.ctx.globalAlpha = this.layers[i].opacity * 0.5; // Más transparente como referencia
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.drawImage(this.layers[i].canvas, 0, 0);
      }
    }
    
    // Restaurar configuración
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
    
    this.updateLayersList();
    
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification(`✨ ${newLayer.name} creada`, 'success');
    }
  }
  
  deleteLayer() {
    if (this.layers.length > 1) {
      if (confirm(`¿Eliminar Capa ${this.currentLayer + 1}? Esta acción no se puede deshacer.`)) {
        this.layers.splice(this.currentLayer, 1);
        this.currentLayer = Math.max(0, this.currentLayer - 1);
        this.updateLayersList();
        this.renderLayers();
        
        // Mostrar notificación
        if (window.guestbookApp?.ui?.showNotification) {
          window.guestbookApp.ui.showNotification('🗑️ Capa eliminada', 'info');
        }
      }
    } else {
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification('⚠️ No puedes eliminar la única capa', 'error');
      }
    }
  }
  
  updateLayersList() {
    // Soportar tanto el diseño viejo como el nuevo
    const layersList = document.getElementById('layersList') || document.getElementById('layersListNew');
    if (!layersList) return;
    
    layersList.innerHTML = '';
    
    // Determinar si es el diseño compacto
    const isCompact = layersList.id === 'layersListNew';
    
    // Renderizar capas en orden inverso (última arriba)
    [...this.layers].reverse().forEach((layer, reverseIndex) => {
      const index = this.layers.length - 1 - reverseIndex;
      const isActive = index === this.currentLayer;
      
      if (isCompact) {
        this.renderCompactLayer(layersList, layer, index, isActive);
      } else {
        this.renderFullLayer(layersList, layer, index, isActive);
      }
    });
  }
  
  renderCompactLayer(container, layer, index, isActive) {
    const layerItem = document.createElement('div');
    layerItem.className = `layer-item-compact ${isActive ? 'active' : ''}`;
    layerItem.dataset.layer = index;
    layerItem.draggable = true;
    layerItem.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 6px;
      margin-bottom: 3px;
      background: ${isActive ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.1)'};
      border: 1px solid ${isActive ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.3)'};
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.8em;
    `;
    
    // Botón de visibilidad
    const visBtn = document.createElement('button');
    visBtn.textContent = layer.visible ? '👁️' : '🙈';
    visBtn.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 0.9em; padding: 2px;';
    visBtn.onclick = (e) => {
      e.stopPropagation();
      this.toggleLayerVisibility(index);
    };
    
    // Nombre
    const name = document.createElement('span');
    name.textContent = layer.name;
    name.style.cssText = `flex: 1; color: ${isActive ? 'white' : 'var(--text)'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`;
    
    // Slider de opacidad mini
    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = '0';
    opacitySlider.max = '100';
    opacitySlider.value = layer.opacity * 100;
    opacitySlider.style.cssText = 'width: 50px; height: 3px; accent-color: var(--primary);';
    opacitySlider.onclick = (e) => e.stopPropagation();
    opacitySlider.onmousedown = (e) => e.stopPropagation();
    opacitySlider.oninput = (e) => {
      e.stopPropagation();
      this.setLayerOpacity(index, parseFloat(e.target.value) / 100);
    };
    
    layerItem.appendChild(visBtn);
    layerItem.appendChild(name);
    layerItem.appendChild(opacitySlider);
    
    // Evento de selección
    layerItem.onclick = () => {
      if (!layer.locked) {
        this.switchToLayer(index);
      }
    };
    
    // Drag and drop
    layerItem.addEventListener('dragstart', (e) => {
      if (!layer.locked) {
        this.switchToLayer(index);
      }
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index);
      layerItem.style.opacity = '0.5';
    });
    
    layerItem.addEventListener('dragend', () => {
      layerItem.style.opacity = '1';
    });
    
    layerItem.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      layerItem.style.borderColor = 'var(--primary)';
    });
    
    layerItem.addEventListener('dragleave', () => {
      layerItem.style.borderColor = isActive ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.3)';
    });
    
    layerItem.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = index;
      this.reorderLayers(fromIndex, toIndex);
      layerItem.style.borderColor = isActive ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.3)';
    });
    
    container.appendChild(layerItem);
  }
  
  renderFullLayer(container, layer, index, isActive) {
    const layerItem = document.createElement('div');
    layerItem.className = `layer-item ${isActive ? 'active' : ''} ${layer.locked ? 'locked' : ''}`;
    layerItem.dataset.layer = index;
    layerItem.draggable = true;
    layerItem.style.cssText = `
      display: flex; flex-direction: column; gap: 6px; padding: 10px;
      background: ${isActive ? 'var(--primary)' : 'var(--bg-dark)'};
      border: 1px solid ${isActive ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.3)'};
      border-radius: 8px; margin-bottom: 6px;
      cursor: ${layer.locked ? 'not-allowed' : 'pointer'};
      transition: all 0.2s ease;
      ${layer.locked ? 'opacity: 0.7;' : ''}
    `;
    
    // Fila superior: miniatura + nombre + controles
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display: flex; align-items: center; gap: 8px;';
    
    // Miniatura
    const thumbnail = document.createElement('canvas');
    thumbnail.width = 40;
    thumbnail.height = 30;
    thumbnail.style.cssText = `
      border: 1px solid rgba(var(--primary-rgb), 0.3);
      border-radius: 4px;
      background: white;
      image-rendering: pixelated;
    `;
    const thumbCtx = thumbnail.getContext('2d');
    if (layer.canvas) {
      thumbCtx.drawImage(layer.canvas, 0, 0, 40, 30);
    }
    
    // Campo de nombre editable
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = layer.name;
    nameInput.className = 'layer-name-input';
    nameInput.style.cssText = `
      flex: 1; background: transparent; border: none;
      color: var(--text-primary); font-size: 0.85em;
      padding: 4px 6px; border-radius: 4px;
      transition: background 0.2s ease;
    `;
    nameInput.addEventListener('click', (e) => e.stopPropagation());
    nameInput.addEventListener('mousedown', (e) => e.stopPropagation());
    nameInput.addEventListener('dragstart', (e) => e.preventDefault());
    nameInput.addEventListener('focus', function() {
      this.style.background = 'rgba(var(--primary-rgb), 0.2)';
    });
    nameInput.addEventListener('blur', function() {
      this.style.background = 'transparent';
      layer.name = this.value || `Capa ${index + 1}`;
    });
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        nameInput.blur();
      }
    });
    
    // Botones de control
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'display: flex; gap: 4px;';
    
    // Botón de visibilidad
    const visibilityBtn = this.createLayerButton(
      layer.visible ? '👁️' : '🙈',
      layer.visible ? '#28a745' : '#dc3545',
      'Mostrar/Ocultar'
    );
    visibilityBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleLayerVisibility(index);
    });
    
    // Botón de bloqueo
    const lockBtn = this.createLayerButton(
      layer.locked ? '🔒' : '🔓',
      layer.locked ? '#ffc107' : '#6c757d',
      'Bloquear/Desbloquear'
    );
    lockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleLayerLock(index);
    });
    
    controlsDiv.appendChild(visibilityBtn);
    controlsDiv.appendChild(lockBtn);
    
    topRow.appendChild(thumbnail);
    topRow.appendChild(nameInput);
    topRow.appendChild(controlsDiv);
    
    // Fila inferior: opacidad + blend mode
    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 0.75em;';
    
    // Opacidad
    const opacityDiv = document.createElement('div');
    opacityDiv.style.cssText = 'display: flex; align-items: center; gap: 4px; flex: 1;';
    
    const opacityLabel = document.createElement('span');
    opacityLabel.textContent = '💧';
    opacityLabel.style.cssText = 'font-size: 0.9em;';
    
    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = '0';
    opacitySlider.max = '100';
    opacitySlider.value = layer.opacity * 100;
    opacitySlider.style.cssText = 'flex: 1; accent-color: var(--primary); height: 4px;';
    opacitySlider.addEventListener('input', (e) => {
      const opacity = parseFloat(e.target.value) / 100;
      this.setLayerOpacity(index, opacity);
      percentSpan.textContent = `${Math.round(opacity * 100)}%`;
    });
    opacitySlider.addEventListener('click', (e) => e.stopPropagation());
    opacitySlider.addEventListener('mousedown', (e) => e.stopPropagation());
    opacitySlider.addEventListener('dragstart', (e) => e.preventDefault());
    
    const percentSpan = document.createElement('span');
    percentSpan.style.cssText = 'color: var(--text-secondary); min-width: 35px;';
    percentSpan.textContent = `${Math.round(layer.opacity * 100)}%`;
    
    opacityDiv.appendChild(opacityLabel);
    opacityDiv.appendChild(opacitySlider);
    opacityDiv.appendChild(percentSpan);
    
    // Modo de fusión
    const blendSelect = document.createElement('select');
    blendSelect.style.cssText = `
      background: rgba(var(--primary-rgb), 0.1);
      border: 1px solid rgba(var(--primary-rgb), 0.3);
      color: var(--text-primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75em;
      cursor: pointer;
    `;
    blendSelect.innerHTML = `
      <option value="normal">Normal</option>
      <option value="multiply">Multiplicar</option>
      <option value="screen">Pantalla</option>
      <option value="overlay">Superponer</option>
      <option value="darken">Oscurecer</option>
      <option value="lighten">Aclarar</option>
      <option value="color-dodge">Subexponer color</option>
      <option value="color-burn">Sobreexponer color</option>
      <option value="hard-light">Luz fuerte</option>
      <option value="soft-light">Luz suave</option>
      <option value="difference">Diferencia</option>
      <option value="exclusion">Exclusión</option>
    `;
    blendSelect.value = layer.blendMode;
    blendSelect.addEventListener('change', (e) => {
      this.setLayerBlendMode(index, e.target.value);
    });
    blendSelect.addEventListener('click', (e) => e.stopPropagation());
    blendSelect.addEventListener('mousedown', (e) => e.stopPropagation());
    
    bottomRow.appendChild(opacityDiv);
    bottomRow.appendChild(blendSelect);
    
    // Fila de acciones
    const actionsRow = document.createElement('div');
    actionsRow.style.cssText = 'display: flex; gap: 4px; margin-top: 4px;';
    
    const duplicateBtn = this.createSmallButton('📋', 'Duplicar', '#17a2b8');
    duplicateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.duplicateLayer(index);
    });
    
    const mergeBtn = this.createSmallButton('⬇️', 'Fusionar abajo', '#6c757d');
    mergeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.mergeLayerDown(index);
    });
    mergeBtn.disabled = index === 0;
    if (index === 0) mergeBtn.style.opacity = '0.5';
    
    const deleteBtn = this.createSmallButton('🗑️', 'Eliminar', '#dc3545');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteLayer();
    });
    
    actionsRow.appendChild(duplicateBtn);
    actionsRow.appendChild(mergeBtn);
    actionsRow.appendChild(deleteBtn);
    
    // Agregar todo al layerItem
    layerItem.appendChild(topRow);
    layerItem.appendChild(bottomRow);
    layerItem.appendChild(actionsRow);
    
    // Event listener para seleccionar capa
    layerItem.addEventListener('click', () => {
      if (!layer.locked) {
        this.switchToLayer(index);
      }
    });
    
    // Drag and drop
    layerItem.addEventListener('dragstart', (e) => {
      // Seleccionar la capa al empezar a arrastrar
      if (!layer.locked) {
        this.switchToLayer(index);
      }
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index);
      layerItem.style.opacity = '0.5';
    });
    
    layerItem.addEventListener('dragend', () => {
      layerItem.style.opacity = '1';
    });
    
    layerItem.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      layerItem.style.borderColor = 'var(--primary)';
    });
    
    layerItem.addEventListener('dragleave', () => {
      layerItem.style.borderColor = isActive ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.3)';
    });
    
    layerItem.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = index;
      this.reorderLayers(fromIndex, toIndex);
      layerItem.style.borderColor = isActive ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.3)';
    });
    
    container.appendChild(layerItem);
  }
  
  createLayerButton(text, color, title) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.title = title;
    btn.style.cssText = `
      background: ${color};
      color: white;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
    return btn;
  }
  
  createSmallButton(text, title, color) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.title = title;
    btn.style.cssText = `
      background: ${color};
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
      flex: 1;
    `;
    btn.addEventListener('mouseenter', function() {
      if (!this.disabled) {
        this.style.opacity = '0.8';
      }
    });
    btn.addEventListener('mouseleave', function() {
      this.style.opacity = '1';
    });
    return btn;
  }
  
  renderLayers() {
    // Limpiar canvas principal
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Renderizar todas las capas visibles en orden con blend modes
    this.layers.forEach((layer, index) => {
      if (layer.visible && layer.canvas) {
        this.ctx.globalAlpha = layer.opacity;
        this.ctx.globalCompositeOperation = layer.blendMode || 'source-over';
        this.ctx.drawImage(layer.canvas, 0, 0);
      }
    });
    
    // Restaurar configuración por defecto
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  // ==================== NUEVAS FUNCIONES DE CAPAS ====================
  
  toggleLayerLock(layerIndex) {
    if (this.layers[layerIndex]) {
      this.layers[layerIndex].locked = !this.layers[layerIndex].locked;
      this.updateLayersList();
      
      const lockStatus = this.layers[layerIndex].locked ? 'bloqueada' : 'desbloqueada';
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification(
          `🔒 ${this.layers[layerIndex].name} ${lockStatus}`,
          'info'
        );
      }
    }
  }
  
  setLayerBlendMode(layerIndex, blendMode) {
    if (this.layers[layerIndex]) {
      this.layers[layerIndex].blendMode = blendMode;
      this.renderLayers();
    }
  }
  
  duplicateLayer(layerIndex) {
    if (!this.layers[layerIndex]) return;
    
    const sourceLayer = this.layers[layerIndex];
    const newLayer = {
      id: this.layers.length,
      name: `${sourceLayer.name} (copia)`,
      canvas: document.createElement('canvas'),
      opacity: sourceLayer.opacity,
      visible: sourceLayer.visible,
      locked: false,
      blendMode: sourceLayer.blendMode
    };
    
    newLayer.canvas.width = this.canvas.width;
    newLayer.canvas.height = this.canvas.height;
    
    // Copiar contenido
    const newCtx = newLayer.canvas.getContext('2d');
    newCtx.drawImage(sourceLayer.canvas, 0, 0);
    
    // Insertar después de la capa original
    this.layers.splice(layerIndex + 1, 0, newLayer);
    this.currentLayer = layerIndex + 1;
    
    // Reindexar IDs
    this.layers.forEach((layer, idx) => {
      layer.id = idx;
    });
    
    this.updateLayersList();
    this.renderLayers();
    
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification(`📋 ${newLayer.name} creada`, 'success');
    }
  }
  
  mergeLayerDown(layerIndex) {
    if (layerIndex === 0 || !this.layers[layerIndex] || !this.layers[layerIndex - 1]) {
      if (window.guestbookApp?.ui?.showNotification) {
        window.guestbookApp.ui.showNotification('⚠️ No se puede fusionar', 'warning');
      }
      return;
    }
    
    const upperLayer = this.layers[layerIndex];
    const lowerLayer = this.layers[layerIndex - 1];
    
    // Fusionar en la capa inferior
    const lowerCtx = lowerLayer.canvas.getContext('2d');
    lowerCtx.globalAlpha = upperLayer.opacity;
    lowerCtx.globalCompositeOperation = upperLayer.blendMode || 'source-over';
    lowerCtx.drawImage(upperLayer.canvas, 0, 0);
    lowerCtx.globalAlpha = 1;
    lowerCtx.globalCompositeOperation = 'source-over';
    
    // Eliminar capa superior
    this.layers.splice(layerIndex, 1);
    this.currentLayer = Math.max(0, layerIndex - 1);
    
    // Reindexar
    this.layers.forEach((layer, idx) => {
      layer.id = idx;
    });
    
    this.updateLayersList();
    this.renderLayers();
    
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification('⬇️ Capas fusionadas', 'success');
    }
  }
  
  reorderLayers(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= this.layers.length || toIndex >= this.layers.length) {
      return;
    }
    
    // Mover capa
    const [movedLayer] = this.layers.splice(fromIndex, 1);
    this.layers.splice(toIndex, 0, movedLayer);
    
    // Reindexar
    this.layers.forEach((layer, idx) => {
      layer.id = idx;
    });
    
    // Actualizar capa actual
    if (this.currentLayer === fromIndex) {
      this.currentLayer = toIndex;
    } else if (fromIndex < this.currentLayer && toIndex >= this.currentLayer) {
      this.currentLayer--;
    } else if (fromIndex > this.currentLayer && toIndex <= this.currentLayer) {
      this.currentLayer++;
    }
    
    this.updateLayersList();
    this.renderLayers();
    
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification('🔃 Capas reordenadas', 'info');
    }
  }
  
  switchToLayer(layerIndex) {
    if (!this.layers[layerIndex] || this.layers[layerIndex].locked) return;
    
    // Guardar contenido de la capa actual antes de cambiar
    if (this.layerMode && this.layers[this.currentLayer]) {
      this.saveCurrentDrawingToLayer();
    }
    
    this.currentLayer = layerIndex;
    this.updateLayersList();
    this.renderLayers();
    
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification(
        `🎨 ${this.layers[layerIndex].name} seleccionada`,
        'info'
      );
    }
  }
  
  toggleLayerVisibility(layerIndex) {
    if (this.layers[layerIndex]) {
      // Siempre guardar contenido actual antes de cambiar visibilidad
      if (this.layerMode && this.layers[this.currentLayer]) {
        this.saveCurrentDrawingToLayer();
      }
      
      this.layers[layerIndex].visible = !this.layers[layerIndex].visible;
      this.updateLayersList();
      
      // Renderizar todas las capas
      this.renderLayers();
    }
  }
  
  setLayerOpacity(layerIndex, opacity) {
    if (this.layers[layerIndex]) {
      this.layers[layerIndex].opacity = Math.max(0, Math.min(1, opacity));
      // Renderizar todas las capas sin guardar contenido
      this.renderLayers();
    }
  }
  
  getLayers() {
    return this.layers.map(layer => ({
      id: layer.id,
      opacity: layer.opacity,
      visible: layer.visible,
      data: layer.canvas ? layer.canvas.toDataURL() : null
    }));
  }
  
  getAppliedFilters() {
    return this.appliedFilters;
  }
  
  // Nuevos métodos para manejo de capas
  ensureCurrentLayerExists() {
    if (!this.layers[this.currentLayer]) {
      this.initializeLayers();
    }
  }
  
  saveCurrentLayerContent() {
    if (!this.layers[this.currentLayer] || !this.layers[this.currentLayer].canvas) return;
    
    const layerCtx = this.layers[this.currentLayer].canvas.getContext('2d');
    
    // Crear canvas temporal para extraer solo la capa actual
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Copiar contenido actual del canvas principal
    tempCtx.drawImage(this.canvas, 0, 0);
    
    // Restar todas las otras capas visibles para obtener solo la capa actual
    this.layers.forEach((layer, index) => {
      if (index !== this.currentLayer && layer.visible && layer.canvas) {
        tempCtx.globalCompositeOperation = 'destination-out';
        tempCtx.globalAlpha = layer.opacity;
        tempCtx.drawImage(layer.canvas, 0, 0);
      }
    });
    
    // Limpiar la capa y guardar el contenido extraído
    layerCtx.clearRect(0, 0, this.layers[this.currentLayer].canvas.width, this.layers[this.currentLayer].canvas.height);
    layerCtx.globalAlpha = 1;
    layerCtx.globalCompositeOperation = 'source-over';
    layerCtx.drawImage(tempCanvas, 0, 0);
  }
  
  extractCurrentLayerFromCanvas(layerCtx) {
    // Si hay contenido previo en la capa, preservarlo
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Copiar contenido actual del canvas principal
    tempCtx.drawImage(this.canvas, 0, 0);
    
    // Restar las otras capas para obtener solo la capa actual
    this.layers.forEach((layer, index) => {
      if (index !== this.currentLayer && layer.visible && layer.canvas) {
        tempCtx.globalCompositeOperation = 'destination-out';
        tempCtx.globalAlpha = layer.opacity;
        tempCtx.drawImage(layer.canvas, 0, 0);
      }
    });
    
    // Guardar el resultado en la capa
    layerCtx.drawImage(tempCanvas, 0, 0);
  }
  
  prepareCurrentLayerForEditing() {
    // Limpiar canvas principal
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Renderizar todas las capas de fondo (no editables)
    this.layers.forEach((layer, index) => {
      if (layer.visible && layer.canvas && index !== this.currentLayer) {
        this.ctx.globalAlpha = layer.opacity;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.drawImage(layer.canvas, 0, 0);
      }
    });
    
    // Renderizar la capa actual encima (editable)
    if (this.layers[this.currentLayer] && this.layers[this.currentLayer].canvas) {
      this.ctx.globalAlpha = this.layers[this.currentLayer].opacity;
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.drawImage(this.layers[this.currentLayer].canvas, 0, 0);
    }
    
    // Restaurar configuración para edición
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  switchToLayer(layerIndex) {
    if (!this.layerMode || layerIndex < 0 || layerIndex >= this.layers.length || layerIndex === this.currentLayer) return;
    
    // Cambiar a la nueva capa
    this.currentLayer = layerIndex;
    
    // Renderizar todas las capas visibles
    this.renderLayers();
    
    this.updateLayersList();
  }
  
  saveCurrentLayerContentSafely() {
    if (!this.layers[this.currentLayer] || !this.layers[this.currentLayer].canvas) return;
    
    // Solo guardar si realmente hay contenido nuevo
    const currentData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const layerCtx = this.layers[this.currentLayer].canvas.getContext('2d');
    const layerData = layerCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Comparar si hay diferencias significativas
    let hasChanges = false;
    for (let i = 0; i < currentData.data.length; i += 4) {
      if (Math.abs(currentData.data[i] - layerData.data[i]) > 5) {
        hasChanges = true;
        break;
      }
    }
    
    if (hasChanges) {
      try {
        this.saveCurrentLayerContent();
      } catch (error) {
        console.warn('Error guardando capa:', error);
      }
    }
  }
  
  renderAllLayers() {
    // Guardar contenido de la capa actual de forma segura
    this.saveCurrentLayerContentSafely();
    
    // Renderizar todas las capas
    this.renderLayersOnly();
  }
  
  renderAllVisibleLayers() {
    if (!this.layersEnabled || this.layers.length <= 1) return;
    
    // Guardar contenido actual en la capa activa antes de renderizar
    if (this.layers[this.currentLayer]) {
      const currentLayerCanvas = this.layers[this.currentLayer].canvas;
      const layerCtx = currentLayerCanvas.getContext('2d');
      layerCtx.clearRect(0, 0, currentLayerCanvas.width, currentLayerCanvas.height);
      layerCtx.drawImage(this.canvas, 0, 0);
    }
    
    // Limpiar canvas principal
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Renderizar todas las capas visibles en orden
    this.layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        this.ctx.globalAlpha = layer.opacity;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.drawImage(layer.canvas, 0, 0);
      }
    });
    
    // Restaurar configuración
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  renderLayersOnly() {
    this.renderAllVisibleLayers();
  }
  
  showCurrentLayerForEditing() {
    // Mostrar todas las capas pero permitir edición solo en la actual
    this.renderAllLayers();
  }
  
  saveCurrentDrawingToLayer() {
    if (!this.layers[this.currentLayer]) return;
    
    const currentLayerCanvas = this.layers[this.currentLayer].canvas;
    const layerCtx = currentLayerCanvas.getContext('2d');
    
    // Crear canvas temporal con todas las capas anteriores
    const backgroundCanvas = document.createElement('canvas');
    backgroundCanvas.width = this.canvas.width;
    backgroundCanvas.height = this.canvas.height;
    const bgCtx = backgroundCanvas.getContext('2d');
    
    // Renderizar todas las capas anteriores a la actual
    for (let i = 0; i < this.currentLayer; i++) {
      if (this.layers[i] && this.layers[i].visible && this.layers[i].canvas) {
        bgCtx.globalAlpha = this.layers[i].opacity;
        bgCtx.globalCompositeOperation = 'source-over';
        bgCtx.drawImage(this.layers[i].canvas, 0, 0);
      }
    }
    
    // Añadir el contenido existente de la capa actual
    bgCtx.globalAlpha = 1;
    bgCtx.globalCompositeOperation = 'source-over';
    bgCtx.drawImage(currentLayerCanvas, 0, 0);
    
    // Crear canvas temporal para extraer solo el nuevo contenido
    const newContentCanvas = document.createElement('canvas');
    newContentCanvas.width = this.canvas.width;
    newContentCanvas.height = this.canvas.height;
    const newCtx = newContentCanvas.getContext('2d');
    
    // Copiar canvas actual
    newCtx.drawImage(this.canvas, 0, 0);
    
    // Restar el fondo (capas anteriores + contenido previo de capa actual)
    newCtx.globalCompositeOperation = 'destination-out';
    newCtx.drawImage(backgroundCanvas, 0, 0);
    
    // Añadir solo el nuevo contenido a la capa actual
    layerCtx.globalCompositeOperation = 'source-over';
    layerCtx.globalAlpha = 1;
    layerCtx.drawImage(newContentCanvas, 0, 0);
  }
  
  prepareCanvasForDrawing() {
    if (!this.layers[this.currentLayer]) return;
    
    // Guardar cualquier cambio pendiente en la capa actual antes de preparar
    this.saveDrawingToCurrentLayer();
    
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Renderizar todas las capas visibles
    this.layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        this.ctx.globalAlpha = layer.opacity;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.drawImage(layer.canvas, 0, 0);
      }
    });
    
    // Restaurar configuración
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  saveDrawingToCurrentLayer() {
    if (!this.layers[this.currentLayer]) return;
    
    // Si tenemos un canvas temporal con el último trazo, copiarlo a la capa
    if (this.tempDrawingCanvas) {
      const layerCtx = this.layers[this.currentLayer].canvas.getContext('2d');
      layerCtx.drawImage(this.tempDrawingCanvas, 0, 0);
      
      // Limpiar el canvas temporal
      this.tempDrawingCanvas = null;
    }
  }
  
  exportImage() {
    // Crear canvas temporal con fondo blanco
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Dibujar fondo blanco
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Dibujar el contenido del canvas encima
    tempCtx.drawImage(this.canvas, 0, 0);
    
    // Descargar con fondo blanco
    const link = document.createElement('a');
    link.download = `dibujo-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL();
    link.click();
  }

  // ==================== SISTEMA DE IMÁGENES/STICKERS ====================
  initImageSystem() {
    this.activeImage = null; // Imagen actualmente en transformación
    this.imageInput = null; // Input file para seleccionar imagen
  }
  
  selectImageTool() {
    if (!this.imageInput) {
      // Crear input file oculto
      this.imageInput = document.createElement('input');
      this.imageInput.type = 'file';
      this.imageInput.accept = 'image/*';
      this.imageInput.style.display = 'none';
      document.body.appendChild(this.imageInput);
      
      this.imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.loadImageToCanvas(file);
        }
        // Reset input para poder cargar la misma imagen de nuevo
        this.imageInput.value = '';
      });
    }
    
    // Abrir selector de archivo
    this.imageInput.click();
  }
  
  loadImageToCanvas(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Crear objeto de imagen transformable
        const maxSize = Math.min(this.canvas.width, this.canvas.height) * 0.4;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        
        this.activeImage = {
          img: img,
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          width: img.width * scale,
          height: img.height * scale,
          rotation: 0,
          isDragging: false,
          isResizing: false,
          dragOffsetX: 0,
          dragOffsetY: 0
        };
        
        // Dibujar la imagen con controles
        this.drawImageWithControls();
        
        // Mostrar controles de transformación
        this.showImageControls();
      };
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }
  
  drawImageWithControls() {
    if (!this.activeImage) return;
    
    // Restaurar canvas original (sin la imagen)
    if (this.canvasBeforeImage) {
      this.ctx.putImageData(this.canvasBeforeImage, 0, 0);
    }
    
    // Dibujar imagen con transformación
    this.ctx.save();
    this.ctx.translate(this.activeImage.x, this.activeImage.y);
    this.ctx.rotate(this.activeImage.rotation);
    this.ctx.drawImage(
      this.activeImage.img,
      -this.activeImage.width / 2,
      -this.activeImage.height / 2,
      this.activeImage.width,
      this.activeImage.height
    );
    this.ctx.restore();
    
    // Dibujar controles (borde y handles)
    this.drawImageControls();
  }
  
  drawImageControls() {
    if (!this.activeImage) return;
    
    const img = this.activeImage;
    
    this.ctx.save();
    this.ctx.translate(img.x, img.y);
    this.ctx.rotate(img.rotation);
    
    // Borde
    this.ctx.strokeStyle = '#ff6b35';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(
      -img.width / 2,
      -img.height / 2,
      img.width,
      img.height
    );
    this.ctx.setLineDash([]);
    
    // Handles de resize en las esquinas
    const handleSize = 10;
    const corners = [
      { x: -img.width / 2, y: -img.height / 2 }, // Top-left
      { x: img.width / 2, y: -img.height / 2 },  // Top-right
      { x: img.width / 2, y: img.height / 2 },   // Bottom-right
      { x: -img.width / 2, y: img.height / 2 }   // Bottom-left
    ];
    
    this.ctx.fillStyle = '#ff6b35';
    corners.forEach(corner => {
      this.ctx.fillRect(
        corner.x - handleSize / 2,
        corner.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
    
    this.ctx.restore();
  }
  
  showImageControls() {
    // Crear UI de controles flotantes
    let controlPanel = document.getElementById('imageControlPanel');
    
    if (!controlPanel) {
      controlPanel = document.createElement('div');
      controlPanel.id = 'imageControlPanel';
      controlPanel.style.cssText = `
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        background: var(--bg-light);
        border: 2px solid var(--primary);
        border-radius: 12px;
        padding: 15px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 200px;
      `;
      
      controlPanel.innerHTML = `
        <h6 style="color: var(--primary); margin: 0 0 10px 0; text-align: center;">
          <i data-lucide="image" style="width: 1rem; height: 1rem;"></i>
          Transformar Imagen
        </h6>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="color: var(--text); font-size: 0.9em;">
            Rotación: <span id="rotationValue">0</span>°
          </label>
          <input type="range" id="imageRotation" min="0" max="360" value="0" class="form-range">
          
          <label style="color: var(--text); font-size: 0.9em;">
            Escala: <span id="scaleValue">100</span>%
          </label>
          <input type="range" id="imageScale" min="10" max="200" value="100" class="form-range">
        </div>
        
        <button id="finishImageBtn" class="btn btn-success btn-sm" style="margin-top: 10px;">
          <i data-lucide="check" style="width: 0.875rem; height: 0.875rem;"></i>
          Finalizar
        </button>
        <button id="cancelImageBtn" class="btn btn-danger btn-sm">
          <i data-lucide="x" style="width: 0.875rem; height: 0.875rem;"></i>
          Cancelar
        </button>
      `;
      
      document.body.appendChild(controlPanel);
      
      // Event listeners
      document.getElementById('imageRotation').addEventListener('input', (e) => {
        if (this.activeImage) {
          this.activeImage.rotation = (e.target.value * Math.PI) / 180;
          document.getElementById('rotationValue').textContent = e.target.value;
          this.redrawWithActiveImage();
        }
      });
      
      document.getElementById('imageScale').addEventListener('input', (e) => {
        if (this.activeImage) {
          const scale = e.target.value / 100;
          const originalWidth = this.activeImage.img.width;
          const originalHeight = this.activeImage.img.height;
          const maxSize = Math.min(this.canvas.width, this.canvas.height) * 0.4;
          const baseScale = Math.min(maxSize / originalWidth, maxSize / originalHeight);
          
          this.activeImage.width = originalWidth * baseScale * scale;
          this.activeImage.height = originalHeight * baseScale * scale;
          document.getElementById('scaleValue').textContent = e.target.value;
          this.redrawWithActiveImage();
        }
      });
      
      document.getElementById('finishImageBtn').addEventListener('click', () => {
        this.finalizeImage();
      });
      
      document.getElementById('cancelImageBtn').addEventListener('click', () => {
        this.cancelImage();
      });
      
      // Inicializar iconos
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
    
    controlPanel.style.display = 'flex';
    
    // Habilitar arrastre de imagen en el canvas
    this.enableImageDragging();
  }
  
  enableImageDragging() {
    if (this.imageDraggingEnabled) return;
    this.imageDraggingEnabled = true;
    
    const handleMouseDown = (e) => {
      if (!this.activeImage) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      // Verificar si está sobre un handle de resize (esquinas)
      const img = this.activeImage;
      const handleSize = 10;
      const corners = [
        { x: img.x - img.width / 2, y: img.y - img.height / 2, corner: 'tl' }, // Top-left
        { x: img.x + img.width / 2, y: img.y - img.height / 2, corner: 'tr' }, // Top-right
        { x: img.x + img.width / 2, y: img.y + img.height / 2, corner: 'br' }, // Bottom-right
        { x: img.x - img.width / 2, y: img.y + img.height / 2, corner: 'bl' }  // Bottom-left
      ];
      
      for (const corner of corners) {
        const dx = x - corner.x;
        const dy = y - corner.y;
        if (Math.abs(dx) < handleSize && Math.abs(dy) < handleSize) {
          this.activeImage.isResizing = true;
          this.activeImage.resizeCorner = corner.corner;
          this.activeImage.startX = x;
          this.activeImage.startY = y;
          this.activeImage.startWidth = img.width;
          this.activeImage.startHeight = img.height;
          return;
        }
      }
      
      // Verificar si el click está dentro de la imagen (para arrastrar)
      const dx = x - this.activeImage.x;
      const dy = y - this.activeImage.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < Math.max(this.activeImage.width, this.activeImage.height) / 2) {
        this.activeImage.isDragging = true;
        this.activeImage.dragOffsetX = dx;
        this.activeImage.dragOffsetY = dy;
      }
    };
    
    const handleMouseMove = (e) => {
      if (!this.activeImage) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      // Manejar resize
      if (this.activeImage.isResizing) {
        const dx = x - this.activeImage.startX;
        const dy = y - this.activeImage.startY;
        const aspectRatio = this.activeImage.startWidth / this.activeImage.startHeight;
        
        // Calcular nuevo tamaño manteniendo proporción
        let newWidth = this.activeImage.startWidth;
        let newHeight = this.activeImage.startHeight;
        
        const corner = this.activeImage.resizeCorner;
        if (corner === 'br' || corner === 'tr') {
          newWidth = this.activeImage.startWidth + dx;
        } else if (corner === 'bl' || corner === 'tl') {
          newWidth = this.activeImage.startWidth - dx;
        }
        
        newHeight = newWidth / aspectRatio;
        
        // Limitar tamaño mínimo
        if (newWidth > 20 && newHeight > 20) {
          this.activeImage.width = newWidth;
          this.activeImage.height = newHeight;
          this.redrawWithActiveImage();
        }
        return;
      }
      
      // Manejar arrastre
      if (this.activeImage.isDragging) {
        this.activeImage.x = x - this.activeImage.dragOffsetX;
        this.activeImage.y = y - this.activeImage.dragOffsetY;
        this.redrawWithActiveImage();
      }
    };
    
    const handleMouseUp = () => {
      if (this.activeImage) {
        this.activeImage.isDragging = false;
        this.activeImage.isResizing = false;
      }
    };
    
    this.canvas.addEventListener('mousedown', handleMouseDown);
    this.canvas.addEventListener('mousemove', handleMouseMove);
    this.canvas.addEventListener('mouseup', handleMouseUp);
    
    // Guardar referencias para poder removerlas después
    this.imageHandlers = { handleMouseDown, handleMouseMove, handleMouseUp };
  }
  
  redrawWithActiveImage() {
    if (!this.activeImage) return;
    
    // Guardar el contenido del canvas sin la imagen activa
    if (!this.canvasBeforeImage) {
      this.canvasBeforeImage = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Restaurar canvas original
    this.ctx.putImageData(this.canvasBeforeImage, 0, 0);
    
    // Dibujar imagen con controles
    this.drawImageWithControls();
  }
  
  finalizeImage() {
    if (!this.activeImage) return;
    
    // Dibujar la imagen final sin controles
    this.ctx.save();
    this.ctx.translate(this.activeImage.x, this.activeImage.y);
    this.ctx.rotate(this.activeImage.rotation);
    this.ctx.drawImage(
      this.activeImage.img,
      -this.activeImage.width / 2,
      -this.activeImage.height / 2,
      this.activeImage.width,
      this.activeImage.height
    );
    this.ctx.restore();
    
    // Limpiar
    this.activeImage = null;
    this.canvasBeforeImage = null;
    this.hideImageControls();
    this.disableImageDragging();
    
    // Guardar estado
    this.saveState();
    
    // Notificar
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification('✅ Imagen agregada al canvas', 'success');
    }
    
    // Volver a la herramienta pincel
    window.selectTool('brush');
  }
  
  cancelImage() {
    if (!this.activeImage) return;
    
    // Restaurar canvas sin la imagen
    if (this.canvasBeforeImage) {
      this.ctx.putImageData(this.canvasBeforeImage, 0, 0);
    }
    
    // Limpiar
    this.activeImage = null;
    this.canvasBeforeImage = null;
    this.hideImageControls();
    this.disableImageDragging();
    
    // Notificar
    if (window.guestbookApp?.ui?.showNotification) {
      window.guestbookApp.ui.showNotification('❌ Imagen cancelada', 'warning');
    }
    
    // Volver a la herramienta pincel
    window.selectTool('brush');
  }
  
  hideImageControls() {
    const controlPanel = document.getElementById('imageControlPanel');
    if (controlPanel) {
      controlPanel.style.display = 'none';
    }
  }
  
  disableImageDragging() {
    if (!this.imageDraggingEnabled || !this.imageHandlers) return;
    
    this.canvas.removeEventListener('mousedown', this.imageHandlers.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.imageHandlers.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.imageHandlers.handleMouseUp);
    
    this.imageDraggingEnabled = false;
    this.imageHandlers = null;
  }
  
  // ==================== HERRAMIENTAS AVANZADAS PARA ARTISTAS ====================
  
  // Herramienta Smudge (Difuminar)
  drawSmudge(x, y) {
    const radius = this.getBrushSize();
    const imageData = this.ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    const data = imageData.data;
    
    // Algoritmo de difuminado simple
    for (let i = 0; i < data.length; i += 4) {
      const px = (i / 4) % (radius * 2);
      const py = Math.floor((i / 4) / (radius * 2));
      
      // Promedio con píxeles vecinos
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = px + dx;
          const ny = py + dy;
          if (nx >= 0 && nx < radius * 2 && ny >= 0 && ny < radius * 2) {
            const idx = (ny * radius * 2 + nx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }
      }
      
      data[i] = r / count;
      data[i + 1] = g / count;
      data[i + 2] = b / count;
    }
    
    this.ctx.putImageData(imageData, x - radius, y - radius);
  }
  
  // Herramienta Blur (Desenfocar)
  drawBlur(x, y) {
    const radius = this.getBrushSize();
    const imageData = this.ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    const data = imageData.data;
    const width = radius * 2;
    const height = radius * 2;
    
    // Box blur simple
    const tempData = new Uint8ClampedArray(data);
    
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        let r = 0, g = 0, b = 0, count = 0;
        
        // Blur kernel 3x3
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nx = px + kx;
            const ny = py + ky;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              r += tempData[idx];
              g += tempData[idx + 1];
              b += tempData[idx + 2];
              count++;
            }
          }
        }
        
        const idx = (py * width + px) * 4;
        data[idx] = r / count;
        data[idx + 1] = g / count;
        data[idx + 2] = b / count;
      }
    }
    
    this.ctx.putImageData(imageData, x - radius, y - radius);
  }
  
  // ==================== HERRAMIENTAS ADICIONALES PARA ARTISTAS ====================
  
  // Herramienta Dodge (Aclarar/Sobreexponer)
  drawDodge(x, y) {
    const radius = this.getBrushSize();
    const imageData = this.ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Aclarar cada canal de color
      data[i] = Math.min(255, data[i] * 1.15);     // R
      data[i + 1] = Math.min(255, data[i + 1] * 1.15); // G
      data[i + 2] = Math.min(255, data[i + 2] * 1.15); // B
    }
    
    this.ctx.putImageData(imageData, x - radius, y - radius);
  }
  
  // Herramienta Burn (Oscurecer/Subexponer)
  drawBurn(x, y) {
    const radius = this.getBrushSize();
    const imageData = this.ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Oscurecer cada canal de color
      data[i] = Math.max(0, data[i] * 0.85);     // R
      data[i + 1] = Math.max(0, data[i + 1] * 0.85); // G
      data[i + 2] = Math.max(0, data[i + 2] * 0.85); // B
    }
    
    this.ctx.putImageData(imageData, x - radius, y - radius);
  }
  
  // Herramienta Sharpen (Enfocar)
  drawSharpen(x, y) {
    const radius = this.getBrushSize();
    const imageData = this.ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    const data = imageData.data;
    const width = radius * 2;
    const height = radius * 2;
    
    // Kernel de enfoque
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    const tempData = new Uint8ClampedArray(data);
    
    for (let py = 1; py < height - 1; py++) {
      for (let px = 1; px < width - 1; px++) {
        let r = 0, g = 0, b = 0;
        let ki = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((py + ky) * width + (px + kx)) * 4;
            r += tempData[idx] * kernel[ki];
            g += tempData[idx + 1] * kernel[ki];
            b += tempData[idx + 2] * kernel[ki];
            ki++;
          }
        }
        
        const idx = (py * width + px) * 4;
        data[idx] = Math.max(0, Math.min(255, r));
        data[idx + 1] = Math.max(0, Math.min(255, g));
        data[idx + 2] = Math.max(0, Math.min(255, b));
      }
    }
    
    this.ctx.putImageData(imageData, x - radius, y - radius);
  }
  
  // Herramienta Sponge (Ajuste de saturación)
  drawSponge(x, y, increase = true) {
    const radius = this.getBrushSize();
    const imageData = this.ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convertir RGB a HSL
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      const l = (max + min) / 2;
      
      if (max === min) continue; // Es gris, sin saturación
      
      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      // Ajustar saturación
      const newS = increase ? Math.min(1, s * 1.2) : Math.max(0, s * 0.8);
      
      // Convertir de vuelta a RGB
      const hue = max === r / 255 ? ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6
                : max === g / 255 ? ((b / 255 - r / 255) / d + 2) / 6
                : ((r / 255 - g / 255) / d + 4) / 6;
      
      const c = (1 - Math.abs(2 * l - 1)) * newS;
      const x = c * (1 - Math.abs((hue * 6) % 2 - 1));
      const m = l - c / 2;
      
      let newR, newG, newB;
      if (hue < 1/6) { newR = c; newG = x; newB = 0; }
      else if (hue < 2/6) { newR = x; newG = c; newB = 0; }
      else if (hue < 3/6) { newR = 0; newG = c; newB = x; }
      else if (hue < 4/6) { newR = 0; newG = x; newB = c; }
      else if (hue < 5/6) { newR = x; newG = 0; newB = c; }
      else { newR = c; newG = 0; newB = x; }
      
      data[i] = (newR + m) * 255;
      data[i + 1] = (newG + m) * 255;
      data[i + 2] = (newB + m) * 255;
    }
    
    this.ctx.putImageData(imageData, x - radius, y - radius);
  }
}

