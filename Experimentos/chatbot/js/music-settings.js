// Extensión para integrar la configuración de música con el sistema de configuración existente

// Función para guardar configuraciones incluyendo música
function saveSettings() {
  const userName = document.getElementById('userName').value;
  const soundSelect = document.getElementById('soundSelect').value;
  const musicSelect = document.getElementById('musicSelect').value;
  const fontSizeSelect = document.getElementById('fontSizeSelect').value;

  // Guardar configuraciones existentes
  localStorage.setItem('userName', userName);
  localStorage.setItem('soundEnabled', soundSelect === 'on');
  localStorage.setItem('fontSize', fontSizeSelect);
  
  // Guardar configuración de música
  localStorage.setItem('musicEnabled', musicSelect === 'on');
  
  // Aplicar configuración de música
  if (window.musicPlayer) {
    if (musicSelect === 'off') {
      musicPlayer.audio.pause();
      musicPlayer.isPlaying = false;
      musicPlayer.updateControls();
      document.getElementById('musicPanel').style.display = 'none';
    } else {
      document.getElementById('musicPanel').style.display = 'block';
    }
  }

  // Aplicar tamaño de fuente
  document.body.className = document.body.className.replace(/font-\w+/g, '');
  document.body.classList.add('font-' + fontSizeSelect);

  alert('✅ Configuración guardada correctamente');
  closeSettings();
}

// Función para cargar configuraciones al abrir el modal
function openSettings() {
  // Cargar configuraciones existentes
  const userName = localStorage.getItem('userName') || '';
  const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
  const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
  const fontSize = localStorage.getItem('fontSize') || 'medium';

  // Aplicar valores a los controles
  document.getElementById('userName').value = userName;
  document.getElementById('soundSelect').value = soundEnabled ? 'on' : 'off';
  document.getElementById('musicSelect').value = musicEnabled ? 'on' : 'off';
  document.getElementById('fontSizeSelect').value = fontSize;

  // Mostrar modal
  document.getElementById('settingsModal').style.display = 'flex';
}

// Función para cerrar configuraciones
function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

// Cargar configuraciones al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
  // Aplicar configuración de música guardada
  const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
  
  // El panel siempre empieza oculto, el usuario debe hacer clic en el botón para mostrarlo
  setTimeout(() => {
    const musicPanel = document.getElementById('musicPanel');
    if (musicPanel) {
      // Asegurar que empiece oculto
      musicPanel.classList.add('hidden');
      musicPanel.classList.remove('show');
      
      // Si la música está deshabilitada, mantenerlo oculto permanentemente
      if (!musicEnabled) {
        musicPanel.style.display = 'none';
      }
    }
  }, 500);

  // Aplicar tamaño de fuente guardado
  const fontSize = localStorage.getItem('fontSize') || 'medium';
  document.body.classList.add('font-' + fontSize);
});

// Actualizar el mini sidebar para manejar el botón de música
document.addEventListener('DOMContentLoaded', function() {
  // Actualizar la función de navegación del mini sidebar
  const originalMiniSidebarLogic = () => {
    document.querySelectorAll('.mini-sidebar-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        if (btn.querySelector('.coming-soon')) {
          alert('🚀 Próximamente!');
          return;
        }
        
        // Índice 1 = Canales
        if (index === 1) {
          showChannels();
          return;
        }
        // Índice 2 = Chats
        if (index === 2) {
          showChats();
          return;
        }
        // Índice 3 = Archivados
        if (index === 3) {
          showArchived();
          return;
        }
        // Índice 4 = Música (nuevo)
        if (index === 4) {
          if (window.musicPlayer) {
            musicPlayer.togglePanel();
          }
          return;
        }
        // Índice 6 = Configuración (ajustado por el nuevo botón)
        if (index === 6) {
          openSettings();
          return;
        }
        
        document.querySelectorAll('.mini-sidebar-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  };

  // Ejecutar después de que se cargue todo
  setTimeout(originalMiniSidebarLogic, 500);
});