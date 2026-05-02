// js/engine.js
function iniciarJuego() {
  const canvas = document.getElementById('fnc-canvas');
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f39c12';
  ctx.font = '32px Arial';
  ctx.fillText('¡Motor del juego iniciado!', 100, 100);

  // Aquí puedes meter tu bucle del juego, sprites, etc.
  // requestAnimationFrame(gameLoop);
}
