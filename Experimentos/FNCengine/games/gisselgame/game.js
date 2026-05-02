// Sistema de guardado en localStorage
function guardarProgreso(nivel) {
    localStorage.setItem('gisselGameNivel', nivel);
    localStorage.setItem('gisselGameTime', Date.now());
}

function cargarProgreso() {
    const nivel = localStorage.getItem('gisselGameNivel');
    const tiempo = localStorage.getItem('gisselGameTime');

    if (nivel && tiempo && (Date.now() - parseInt(tiempo)) < 86400000) {
        return parseInt(nivel);
    }
    return 1;
}

// Sistema de diálogos INICIALES estilo Undertale
const dialogosIniciales = [
    {
        personaje: "🎮",
        nombre: "SISTEMA",
        texto: "* Un nuevo jugador se acerca..."
    },
    {
        personaje: "😈",
        nombre: "DEMONIO DEL ROBLOX",
        texto: "* ¡Hola Jugador! Soy el demonio guardián de los VIPs de Roblox."
    },
    {
        personaje: "😈",
        nombre: "DEMONIO DEL ROBLOX",
        texto: "* He escuchado que alguien muy especial merece un regalo de 799 Robux..."
    },
    {
        personaje: "🤔",
        nombre: "DEMONIO DEL ROBLOX",
        texto: "* Pero espera... ¿realmente eres digno de tal honor?"
    },
    {
        personaje: "😏",
        nombre: "DEMONIO DEL ROBLOX",
        texto: "* Solo hay una forma de averiguarlo... ¡DEBES PASAR MIS PRUEBAS!"
    },
    {
        personaje: "🎯",
        nombre: "DEMONIO DEL ROBLOX",
        texto: "* Si logras completar todos los desafíos, el VIP será tuyo."
    },
    {
        personaje: "😈",
        nombre: "DEMONIO DEL ROBLOX",
        texto: "* Pero te advierto... ¡No será nada fácil! Jajajaja..."
    },
    {
        personaje: "🎮",
        nombre: "DEMONIO DEL ROBLOX",
        texto: "* ¿Estás listo para el desafío más épico de tu vida, Jugador?"
    },
    {
        personaje: "🔥",
        nombre: "DEMONIO DEL ROBLOX",
        texto: "* ¡Que comiencen los juegos del hambre... digo, del VIP!"
    }
];

let dialogoActual = 0;
let textoCompleto = false;
let textoActual = "";
let indiceTexto = 0;

function mostrarDialogo() {
    if (dialogoActual >= dialogosIniciales.length) {
        document.getElementById('dialogoContainer').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';

        const nivelGuardado = cargarProgreso();
        if (nivelGuardado > 1) {
            if (confirm(`¿Quieres continuar desde el nivel ${nivelGuardado}?`)) {
                document.getElementById(`nivel${nivelGuardado}`).style.display = 'block';

                // Inicializar niveles específicos si se cargan desde guardado
                if (nivelGuardado === 7) {
                    iniciarCargaFalsa();
                } else if (nivelGuardado === 21) {
                    iniciarPuzzle();
                } else if (nivelGuardado === 22) {
                    iniciarInvisible();
                } else if (nivelGuardado === 23) {
                    iniciarColores();
                } else if (nivelGuardado === 24) {
                    iniciarMath24();
                } else if (nivelGuardado === 25) {
                    iniciarPatrones();
                } else if (nivelGuardado === 26) {
                    iniciarReflejos();
                } else if (nivelGuardado === 27) {
                    iniciarSopa();
                } else if (nivelGuardado === 28) {
                    iniciarEquilibrio();
                } else if (nivelGuardado === 29) {
                    iniciarMorse();
                } else if (nivelGuardado === 30) {
                    iniciarMultitarea();
                } else if (nivelGuardado === 31) {
                    iniciarRuleta();
                } else if (nivelGuardado === 32) {
                    iniciarLuzRojaVerde();
                } else if (nivelGuardado === 33) {
                    iniciarLaberintoMouse();
                } else if (nivelGuardado === 5) {
                    iniciarCaptcha();
                } else if (nivelGuardado === 8) {
                    iniciarLaberinto();
                } else if (nivelGuardado === 2) {
                    setTimeout(() => {
                        document.getElementById('respuesta').value = '';
                        document.getElementById('respuesta').focus();
                    }, 100);
                } else if (nivelGuardado === 9) {
                    document.getElementById('textoInput').value = '';
                } else if (nivelGuardado === 29) {
                    document.getElementById('morseAnswer').value = '';
                } else if (nivelGuardado === 30) {
                    document.getElementById('countInput').value = '';
                } else if (nivelGuardado === 10) {
                    iniciarMemoria();
                } else if (nivelGuardado === 11) {
                    iniciarAdivinanzas();
                } else if (nivelGuardado === 12) {
                    iniciarReaccion();
                } else if (nivelGuardado === 14) {
                    iniciarMole();
                } else if (nivelGuardado === 15) {
                    document.getElementById('pianoSecuencia').textContent = '';
                } else if (nivelGuardado === 16) {
                    iniciarSliders();
                } else if (nivelGuardado === 17) {
                    iniciarDibujo();
                } else if (nivelGuardado === 18) {
                    document.getElementById('seq1').value = '';
                    document.getElementById('seq2').value = '';
                    document.getElementById('seq3').value = '';
                } else if (nivelGuardado === 19) {
                    document.getElementById('answer1').value = '';
                    document.getElementById('answer2').value = '';
                    document.getElementById('answer3').value = '';
                } else if (nivelGuardado === 20) {
                    iniciarPersecucion();
                } else if (nivelGuardado === 34) {
                    iniciarFlappy();
                }

                return;
            }
        }

        document.getElementById('nivel1').style.display = 'block';
        return;
    }

    const dialogo = dialogosIniciales[dialogoActual];
    document.getElementById('personajeEmoji').textContent = dialogo.personaje;
    document.getElementById('nombrePersonaje').textContent = dialogo.nombre;

    textoActual = "";
    indiceTexto = 0;
    textoCompleto = false;
    escribirTexto(dialogo.texto);
}

function escribirTexto(texto) {
    if (indiceTexto < texto.length) {
        textoActual += texto.charAt(indiceTexto);
        document.getElementById('textoDialogo').textContent = textoActual;
        indiceTexto++;
        setTimeout(() => escribirTexto(texto), 50);
    } else {
        textoCompleto = true;
    }
}

function siguienteDialogo() {
    if (!textoCompleto) {
        textoCompleto = true;
        document.getElementById('textoDialogo').textContent = dialogosIniciales[dialogoActual].texto;
    } else {
        dialogoActual++;
        mostrarDialogo();
    }
}

// Soporte para Android y móviles
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
        if (document.getElementById('dialogoFinalContainer').style.display !== 'none') {
            siguienteDialogoFinal();
        } else if (document.getElementById('dialogoContainer').style.display !== 'none') {
            siguienteDialogo();
        }
    }
});

// Soporte táctil para Android
document.addEventListener('touchstart', function (e) {
    if (document.getElementById('dialogoContainer').style.display !== 'none') {
        siguienteDialogo();
    } else if (document.getElementById('dialogoFinalContainer').style.display !== 'none') {
        siguienteDialogoFinal();
    }
});

document.getElementById('dialogoContainer').addEventListener('click', function () {
    siguienteDialogo();
});

// Event listener separado para diálogos finales
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
        if (document.getElementById('dialogoFinalContainer').style.display !== 'none') {
            siguienteDialogoFinal();
        }
    });
});

// Detectar si es Android y añadir controles
function setupMobileSupport() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isAndroid || isMobile) {
        // Prevenir zoom en doble tap
        document.addEventListener('touchstart', function (e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (e) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Añadir clase CSS para móviles
        document.body.classList.add('mobile-device');
    }
}

// Función para abrir Gissel Challenge con advertencia Android
function abrirGisselChallenge() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
        const confirmar = confirm(
            '⚠️ ADVERTENCIA ANDROID ⚠️\n\n' +
            'Esta versión del juego no está completamente optimizada para Android.\n\n' +
            'Podrías experimentar:\n' +
            '• Problemas de rendimiento\n' +
            '• Controles menos precisos\n' +
            '• Posibles errores visuales\n\n' +
            '¿Estás seguro de que quieres continuar?'
        );
        
        if (confirmar) {
            window.open('https://gissel-vip-challenge.pages.dev', '_blank');
        }
    } else {
        // PC - abrir normalmente
        window.open('https://gissel-vip-challenge.pages.dev', '_blank');
    }
}

window.addEventListener('load', function () {
    checksumNivel = generarChecksum(1);
    setupMobileSupport();

    const nivelGuardado = cargarProgreso();

    if (nivelGuardado > 1) {
        document.getElementById('dialogoContainer').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';

        if (confirm(`¿Quieres continuar desde el nivel ${nivelGuardado}?`)) {
            document.getElementById(`nivel${nivelGuardado}`).style.display = 'block';

            // Inicializar niveles específicos si se cargan desde guardado
            if (nivelGuardado === 7) {
                iniciarCargaFalsa();
            } else if (nivelGuardado === 21) {
                iniciarPuzzle();
            } else if (nivelGuardado === 22) {
                iniciarInvisible();
            } else if (nivelGuardado === 23) {
                iniciarColores();
            } else if (nivelGuardado === 24) {
                iniciarMath24();
            } else if (nivelGuardado === 25) {
                iniciarPatrones();
            } else if (nivelGuardado === 26) {
                iniciarReflejos();
            } else if (nivelGuardado === 27) {
                iniciarSopa();
            } else if (nivelGuardado === 28) {
                iniciarEquilibrio();
            } else if (nivelGuardado === 29) {
                iniciarMorse();
            } else if (nivelGuardado === 30) {
                iniciarMultitarea();
            } else if (nivelGuardado === 31) {
                iniciarRuleta();
            } else if (nivelGuardado === 32) {
                iniciarLuzRojaVerde();
            } else if (nivelGuardado === 33) {
                iniciarLaberintoMouse();
            } else if (nivelGuardado === 5) {
                iniciarCaptcha();
            } else if (nivelGuardado === 8) {
                iniciarLaberinto();
            } else if (nivelGuardado === 2) {
                setTimeout(() => {
                    document.getElementById('respuesta').value = '';
                    document.getElementById('respuesta').focus();
                }, 100);
            } else if (nivelGuardado === 9) {
                document.getElementById('textoInput').value = '';
            } else if (nivelGuardado === 29) {
                document.getElementById('morseAnswer').value = '';
            } else if (nivelGuardado === 30) {
                document.getElementById('countInput').value = '';
            } else if (nivelGuardado === 10) {
                iniciarMemoria();
            } else if (nivelGuardado === 11) {
                iniciarAdivinanzas();
            } else if (nivelGuardado === 12) {
                iniciarReaccion();
            } else if (nivelGuardado === 14) {
                iniciarMole();
            } else if (nivelGuardado === 15) {
                document.getElementById('pianoSecuencia').textContent = '';
            } else if (nivelGuardado === 16) {
                iniciarSliders();
            } else if (nivelGuardado === 17) {
                iniciarDibujo();
            } else if (nivelGuardado === 18) {
                document.getElementById('seq1').value = '';
                document.getElementById('seq2').value = '';
                document.getElementById('seq3').value = '';
            } else if (nivelGuardado === 19) {
                document.getElementById('answer1').value = '';
                document.getElementById('answer2').value = '';
                document.getElementById('answer3').value = '';
            } else if (nivelGuardado === 20) {
                iniciarPersecucion();
            } else if (nivelGuardado === 34) {
                iniciarFlappy();
            }
        } else {
            // Si dice que no, resetear y empezar desde nivel 1
            localStorage.removeItem('gisselGameNivel');
            localStorage.removeItem('gisselGameTime');
            document.getElementById('nivel1').style.display = 'block';
        }
    } else {
        // Primera vez, mostrar diálogos
        mostrarDialogo();
    }
});

// Nivel 1: Botón que huye
function moverBoton() {
    var boton = document.getElementById('botonEsquivo');
    var container = document.getElementById('nivel1');

    // Mantener el botón dentro del contenedor
    var maxX = container.offsetWidth - 150;
    var maxY = container.offsetHeight - 50;

    var x = Math.random() * maxX;
    var y = Math.random() * maxY + 100; // +100 para que no se vaya muy arriba

    boton.style.position = 'fixed';
    boton.style.left = x + 'px';
    boton.style.top = y + 'px';
    boton.style.zIndex = '99999';
}

document.addEventListener('DOMContentLoaded', function () {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    // Botón esquivo local del nivel 1
    if (document.getElementById('botonEsquivoLocal')) {
        document.getElementById('botonEsquivoLocal').addEventListener('click', function () {
            if (typeof playClickSound === 'function') playClickSound();
            guardarProgreso(2);
            document.getElementById('nivel1').style.display = 'none';
            document.getElementById('nivel2').style.display = 'block';
        });
    }

    document.getElementById('botonFantasma').addEventListener('mouseover', function () {
        var boton = document.getElementById('botonFantasma');
        var container = document.getElementById('nivel3');

        // Mantener el botón dentro del contenedor
        var maxX = container.offsetWidth - 150;
        var maxY = container.offsetHeight - 50;

        var x = Math.random() * maxX;
        var y = Math.random() * maxY + 100;

        boton.style.position = 'absolute';
        boton.style.left = x + 'px';
        boton.style.top = y + 'px';
        boton.style.zIndex = '10';
    });

    for (let i = 1; i <= 4; i++) {
        const slider = document.getElementById(`slider${i}`);
        const value = document.getElementById(`value${i}`);
        if (slider && value) {
            slider.addEventListener('input', function () {
                value.textContent = this.value;
            });
        }
    }
});

// Nivel 2: Pregunta personal
var intentos = 0;
function verificarRespuesta() {
    var respuestaUsuario = document.getElementById('respuesta').value.toLowerCase();
    var respuestaCorrecta = "jugador";
    intentos++;

    if (respuestaUsuario === respuestaCorrecta) {
        document.getElementById('respuesta').value = '';
        guardarProgreso(3);
        document.getElementById('nivel2').style.display = 'none';
        document.getElementById('nivel3').style.display = 'block';
    } else {
        document.getElementById('error').style.display = 'block';
        document.getElementById('respuesta').value = ''; // Limpiar campo al fallar
        if (intentos >= 3) {
            document.getElementById('error').innerHTML = '❌ Pista: Empieza con "A" y termina con "12"... ¿o no? 😏';
        }
        if (intentos >= 5) {
            document.getElementById('error').innerHTML = '❌ Última pista: Es exactamente como lo escribiste pero en minúsculas... 🤔';
        }
    }
}

function pasarNivel4() {
    guardarProgreso(4);
    document.getElementById('nivel3').style.display = 'none';
    document.getElementById('nivel4').style.display = 'block';
}

function respuestaIncorrecta() {
    if (typeof playErrorSound === 'function') playErrorSound();
    document.getElementById('errorMath').style.display = 'block';
    document.body.classList.add('shake');
    setTimeout(function () {
        document.body.classList.remove('shake');
    }, 3000);
}

function verificarMath() {
    if (typeof playSuccessSound === 'function') playSuccessSound();
    guardarProgreso(5);
    document.getElementById('nivel4').style.display = 'none';
    document.getElementById('nivel5').style.display = 'block';
}

function iniciarRedireccion() {
    var count = 5;
    var countdownElement = document.getElementById('cuentaRegresiva');
    var countdownInterval = setInterval(function () {
        count--;
        countdownElement.textContent = count;

        if (count <= 0) {
            clearInterval(countdownInterval);
            window.location.href = "https://www.roblox.com/share?code=39e11e31ab103d4086843a3d306480e4&type=Server";
        }
    }, 1000);
}

// Emojis trolls volando por la pantalla
var emojis = ['💩', '🤡', '😈', '🎮', '💀', '👾', '🦄', '🍌'];
var emojiInterval;
var maxEmojis = 3;
var currentEmojis = 0;

function iniciarEmojis() {
    emojiInterval = setInterval(function () {
        if (document.getElementById('gameContainer').style.display === 'block' && currentEmojis < maxEmojis) {
            var emoji = document.createElement('div');
            emoji.className = 'troll';
            emoji.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = Math.random() * (window.innerWidth - 100) + 'px';
            emoji.style.top = Math.random() * (window.innerHeight - 100) + 'px';
            emoji.style.willChange = 'transform, opacity';
            document.body.appendChild(emoji);
            currentEmojis++;

            setTimeout(function () {
                if (emoji.parentNode) {
                    emoji.remove();
                    currentEmojis--;
                }
            }, 4000);
        }
    }, 1500);
}

setTimeout(function () {
    if (!navigator.userAgent.includes('OPR') || window.innerWidth > 1200) {
        iniciarEmojis();
    }
}, 2000);

// Función para mover el botón local del nivel 1
function moverBotonLocal() {
    var boton = document.getElementById('botonEsquivoLocal');
    if (!boton) return;

    var container = document.getElementById('areaBoton');
    var botonWidth = 120;
    var botonHeight = 40;

    var maxX = container.offsetWidth - botonWidth;
    var maxY = container.offsetHeight - botonHeight;

    var x = Math.max(0, Math.random() * maxX);
    var y = Math.max(0, Math.random() * maxY);

    boton.style.left = x + 'px';
    boton.style.top = y + 'px';
    boton.style.transform = 'none';
}

// NIVEL 15: Piano
let pianoSecuencia = [];
const pianoMelodia = ['C', 'D', 'E', 'F', 'G', 'F', 'E', 'D', 'C'];

function pianoClick(nota) {
    pianoSecuencia.push(nota);
    document.getElementById('pianoSecuencia').textContent = pianoSecuencia.join('-');

    if (pianoSecuencia.length > pianoMelodia.length ||
        pianoSecuencia[pianoSecuencia.length - 1] !== pianoMelodia[pianoSecuencia.length - 1]) {
        document.getElementById('errorPiano').style.display = 'block';
        pianoSecuencia = [];
        document.getElementById('pianoSecuencia').textContent = '';
        setTimeout(() => {
            document.getElementById('errorPiano').style.display = 'none';
        }, 2000);
        return;
    }

    if (pianoSecuencia.length === pianoMelodia.length) {
        limpiarPiano();
        guardarProgreso(16);
        document.getElementById('nivel15').style.display = 'none';
        document.getElementById('nivel16').style.display = 'block';
        iniciarSliders();
    }
}

function reiniciarPiano() {
    pianoSecuencia = [];
    document.getElementById('pianoSecuencia').textContent = '';
}

function limpiarPiano() {
    pianoSecuencia = [];
    document.getElementById('pianoSecuencia').textContent = '';
}

// NIVEL 16: Sliders
let slidersInterval;

function iniciarSliders() {
    // Dar 3 segundos de gracia antes de que se vuelvan locos
    setTimeout(() => {
        slidersInterval = setInterval(() => {
            for (let i = 1; i <= 4; i++) {
                const slider = document.getElementById(`slider${i}`);
                const value = document.getElementById(`value${i}`);
                const newVal = Math.max(0, Math.min(100, parseInt(slider.value) + (Math.random() - 0.5) * 10));
                slider.value = newVal;
                value.textContent = newVal;
            }
        }, 100);
    }, 3000);
}

function verificarSliders() {
    let allCorrect = true;
    for (let i = 1; i <= 4; i++) {
        const value = parseInt(document.getElementById(`slider${i}`).value);
        if (Math.abs(value - 50) > 2) {
            allCorrect = false;
            break;
        }
    }

    if (allCorrect) {
        clearInterval(slidersInterval);
        guardarProgreso(17);
        document.getElementById('nivel16').style.display = 'none';
        document.getElementById('nivel17').style.display = 'block';
        iniciarDibujo();
    } else {
        document.getElementById('errorSliders').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorSliders').style.display = 'none';
        }, 2000);
    }
}

// NIVEL 8: Laberinto que cambia
let laberintoActual = [];
let posicionJugador = { x: 0, y: 0 };
let tiempoLaberinto = 10;
let intervalLaberinto;

function iniciarLaberinto() {
    generarLaberinto();
    tiempoLaberinto = 10;
    intervalLaberinto = setInterval(() => {
        tiempoLaberinto--;
        document.getElementById('tiempoLaberinto').textContent = tiempoLaberinto;

        if (tiempoLaberinto <= 0) {
            document.getElementById('errorLaberinto').style.display = 'block';
            setTimeout(() => {
                document.getElementById('errorLaberinto').style.display = 'none';
                generarLaberinto();
                tiempoLaberinto = 10;
            }, 2000);
        }
    }, 1000);
}

function generarLaberinto() {
    const laberinto = document.getElementById('laberinto');
    laberinto.innerHTML = '';
    laberintoActual = [];

    for (let y = 0; y < 10; y++) {
        laberintoActual[y] = [];
        for (let x = 0; x < 10; x++) {
            const celda = document.createElement('div');
            celda.className = 'celda';

            if (x === 0 && y === 0) {
                celda.className += ' jugador';
                celda.textContent = '🟢';
                posicionJugador = { x: 0, y: 0 };
                laberintoActual[y][x] = 'jugador';
            } else if (x === 9 && y === 9) {
                celda.className += ' meta';
                celda.textContent = '🎯';
                laberintoActual[y][x] = 'meta';
            } else if (Math.random() < 0.3) {
                celda.className += ' pared';
                laberintoActual[y][x] = 'pared';
            } else {
                celda.className += ' camino';
                laberintoActual[y][x] = 'camino';
            }

            celda.onclick = () => moverJugador(x, y);
            laberinto.appendChild(celda);
        }
    }
}

function moverJugador(x, y) {
    if (Math.abs(x - posicionJugador.x) + Math.abs(y - posicionJugador.y) !== 1) return;
    if (laberintoActual[y][x] === 'pared') return;

    const celdas = document.querySelectorAll('.celda');
    celdas[posicionJugador.y * 10 + posicionJugador.x].textContent = '';
    celdas[posicionJugador.y * 10 + posicionJugador.x].className = 'celda camino';

    posicionJugador = { x, y };
    celdas[y * 10 + x].textContent = '🟢';
    celdas[y * 10 + x].className = 'celda jugador';

    if (x === 9 && y === 9) {
        clearInterval(intervalLaberinto);
        guardarProgreso(9);
        document.getElementById('nivel8').style.display = 'none';
        document.getElementById('nivel9').style.display = 'block';
        deshabilitarCopiar();
    }
}

// NIVEL 9: Escritura sin copiar
function deshabilitarCopiar() {
    const textarea = document.getElementById('textoInput');

    textarea.addEventListener('keydown', function (e) {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
            e.preventDefault();
            alert('¡No se permite copiar/pegar! 😈');
        }
    });
}

function verificarEscritura() {
    const original = document.getElementById('textoOriginal').textContent.trim();
    const escrito = document.getElementById('textoInput').value;

    if (original === escrito) {
        document.getElementById('textoInput').value = '';
        guardarProgreso(10);
        document.getElementById('nivel9').style.display = 'none';
        document.getElementById('nivel10').style.display = 'block';
    } else {
        document.getElementById('errorEscritura').style.display = 'block';
        document.getElementById('textoInput').value = '';
        setTimeout(() => {
            document.getElementById('errorEscritura').style.display = 'none';
        }, 3000);
    }
}

// NIVEL 10: Memoria con tiempo
let memoriaCartas = [];
let memoriaVolteadas = [];
let memoriaParesEncontrados = 0;
let memoriaTimer;
let memoriaSegundos = 30;

function iniciarMemoria() {
    // Limpiar timer anterior si existe
    if (memoriaTimer) {
        clearInterval(memoriaTimer);
    }

    memoriaSegundos = 30;
    memoriaParesEncontrados = 0;
    memoriaVolteadas = [];

    const emojis = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍑', '🍒', '🥝'];
    memoriaCartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

    const grid = document.getElementById('memoriaGrid');
    grid.innerHTML = '';

    // Resetear timer display
    document.getElementById('memoriaTimer').textContent = memoriaSegundos;

    memoriaCartas.forEach((emoji, index) => {
        const carta = document.createElement('button');
        carta.className = 'memoria-card';
        carta.textContent = '';
        carta.onclick = () => voltearCarta(index, carta);
        grid.appendChild(carta);
    });

    memoriaTimer = setInterval(() => {
        memoriaSegundos--;
        document.getElementById('memoriaTimer').textContent = memoriaSegundos;

        if (memoriaSegundos <= 0) {
            clearInterval(memoriaTimer);
            document.getElementById('errorMemoria').style.display = 'block';
            setTimeout(() => {
                document.getElementById('errorMemoria').style.display = 'none';
                iniciarMemoria(); // Reiniciar automáticamente
            }, 3000);
        }
    }, 1000);
}

function voltearCarta(index, elemento) {
    if (memoriaVolteadas.length >= 2 || elemento.classList.contains('flipped')) return;

    elemento.textContent = memoriaCartas[index];
    elemento.classList.add('flipped');
    memoriaVolteadas.push({ index, elemento });

    if (memoriaVolteadas.length === 2) {
        setTimeout(() => {
            if (memoriaCartas[memoriaVolteadas[0].index] === memoriaCartas[memoriaVolteadas[1].index]) {
                memoriaVolteadas.forEach(carta => carta.elemento.classList.add('matched'));
                memoriaParesEncontrados++;

                if (memoriaParesEncontrados === 8) {
                    clearInterval(memoriaTimer);
                    guardarProgreso(11);
                    document.getElementById('nivel10').style.display = 'none';
                    document.getElementById('nivel11').style.display = 'block';
                    iniciarAdivinanzas();
                }
            } else {
                memoriaVolteadas.forEach(carta => {
                    carta.elemento.textContent = '';
                    carta.elemento.classList.remove('flipped');
                });
            }
            memoriaVolteadas = [];
        }, 1000);
    }
}

// NIVEL 11: Adivinanzas imposibles
const adivinanzas = [
    { pregunta: "Soy el hijo de tu padre, pero no soy tu hermano. ¿Quién soy?", respuesta: "yo" },
    { pregunta: "Un hombre vive en el piso 20. Cada día baja en ascensor hasta la planta baja, pero al subir solo llega al piso 10 y sube el resto andando, excepto los días de lluvia. ¿Por qué?", respuesta: "enano" },
    { pregunta: "Dos padres y dos hijos van a pescar. Cada uno pesca un pez, pero solo llevan 3 peces a casa. ¿Cómo es posible?", respuesta: "abuelo" },
    { pregunta: "Una mujer tiene 5 hijas. Cada hija tiene un hermano. ¿Cuántos hijos tiene en total?", respuesta: "seis" },
    { pregunta: "Si me nombras, desaparezco. ¿Qué soy?", respuesta: "silencio" },
    { pregunta: "Un prisionero está en una celda con dos puertas. Una lleva a la libertad, otra a la muerte. Hay dos guardias: uno siempre miente, otro siempre dice la verdad. Solo puedes hacer UNA pregunta a UN guardia. ¿Qué preguntas?", respuesta: "puerta" },
    { pregunta: "Tengo 4 patas por la mañana, 2 al mediodía y 3 por la noche. ¿Qué soy?", respuesta: "humano" }
];

let adivinanzaActual = 0;

function iniciarAdivinanzas() {
    adivinanzaActual = 0;
    mostrarAdivinanza();
}

function mostrarAdivinanza() {
    document.getElementById('adivinanza').textContent = adivinanzas[adivinanzaActual].pregunta;
    document.getElementById('numeroAdivinanza').textContent = adivinanzaActual + 1;
    document.getElementById('respuestaAdivinanza').value = '';
}

function verificarAdivinanza() {
    const respuesta = document.getElementById('respuestaAdivinanza').value.toLowerCase().trim();

    if (respuesta === adivinanzas[adivinanzaActual].respuesta) {
        adivinanzaActual++;
        if (adivinanzaActual >= adivinanzas.length) {
            document.getElementById('respuestaAdivinanza').value = '';
            guardarProgreso(12);
            document.getElementById('nivel11').style.display = 'none';
            document.getElementById('nivel12').style.display = 'block';
            iniciarReaccion();
        } else {
            mostrarAdivinanza();
        }
    } else {
        document.getElementById('errorAdivinanza').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorAdivinanza').style.display = 'none';
        }, 2000);
    }
}

// NIVEL 12: Tiempo de reacción
let reactionStartTime;
let reactionWaiting = false;

function iniciarReaccion() {
    const boton = document.getElementById('reactionButton');
    boton.textContent = '¡ESPERA!';
    boton.className = 'reaction-button reaction-red';

    setTimeout(() => {
        boton.textContent = '¡AHORA!';
        boton.className = 'reaction-button reaction-green';
        reactionStartTime = Date.now();
        reactionWaiting = true;
    }, Math.random() * 5000 + 2000);
}

function reactionClick() {
    if (!reactionWaiting) {
        alert('¡Muy temprano! Espera a que se ponga verde 😈');
        iniciarReaccion();
        return;
    }

    const reactionTime = Date.now() - reactionStartTime;
    document.getElementById('reactionTime').textContent = `Tiempo: ${reactionTime}ms`;

    if (reactionTime < 300) {
        guardarProgreso(13);
        document.getElementById('nivel12').style.display = 'none';
        mostrarBSOD();
    } else {
        document.getElementById('errorReaction').style.display = 'block';
        reactionWaiting = false;
        setTimeout(() => {
            document.getElementById('errorReaction').style.display = 'none';
            iniciarReaccion(); // Reiniciar automáticamente
        }, 2000);
    }
}

// BSOD Falso
function mostrarBSOD() {
    document.getElementById('bsodFalso').style.display = 'flex';

    let progreso = 0;
    const interval = setInterval(() => {
        progreso += Math.random() * 10;
        document.getElementById('bsodProgress').textContent = Math.floor(progreso) + '% completado';

        if (progreso >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('bsodFalso').style.display = 'none';
                document.getElementById('nivel13').style.display = 'block';
            }, 2000);
        }
    }, 500);
}

// NIVEL 13: Calculadora
let calcValue = '0';
function calcInput(input) {
    if (input === 'C') {
        calcValue = '0';
    } else if (input === '=') {
        try {
            calcValue = eval(calcValue.replace('×', '*').replace('÷', '/'));
        } catch {
            calcValue = 'ERROR';
        }
    } else if (input === 'del') {
        calcValue = calcValue.slice(0, -1) || '0';
    } else {
        calcValue = calcValue === '0' ? input : calcValue + input;
    }
    document.getElementById('calcDisplay').value = calcValue;
}

function verificarCalculadora() {
    const result = parseFloat(document.getElementById('calcResult').value);
    if (Math.abs(result - 249559.29) < 0.1) {
        guardarProgreso(14);
        document.getElementById('nivel13').style.display = 'none';
        document.getElementById('nivel14').style.display = 'block';
    } else {
        document.getElementById('errorCalc').style.display = 'block';
        calcValue = '0';
        document.getElementById('calcDisplay').value = '0';
        setTimeout(() => {
            document.getElementById('errorCalc').style.display = 'none';
        }, 3000);
    }
}

// NIVEL 14: Whack-a-Mole
let moleScore = 0;
let moleTimer;
let moleSeconds = 30;

function iniciarMole() {
    // Limpiar timer anterior si existe
    if (moleTimer) {
        clearInterval(moleTimer);
    }

    moleScore = 0;
    moleSeconds = 30;
    document.getElementById('moleScore').textContent = '0';
    document.getElementById('moleTimer').textContent = moleSeconds;

    const grid = document.getElementById('moleGrid');
    grid.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'mole-hole';
        hole.onclick = () => golpearTopo(i, hole);
        grid.appendChild(hole);
    }

    moleTimer = setInterval(() => {
        moleSeconds--;
        document.getElementById('moleTimer').textContent = moleSeconds;

        if (moleSeconds <= 0) {
            clearInterval(moleTimer);
            document.getElementById('errorMole').style.display = 'block';
            setTimeout(() => {
                document.getElementById('errorMole').style.display = 'none';
                iniciarMole(); // Reiniciar automáticamente
            }, 3000);
        }
    }, 1000);

    const topoInterval = setInterval(() => {
        if (moleSeconds > 0) {
            mostrarTopo();
        } else {
            clearInterval(topoInterval);
        }
    }, 800);
}

function mostrarTopo() {
    const holes = document.querySelectorAll('.mole-hole');
    const randomHole = holes[Math.floor(Math.random() * holes.length)];

    if (randomHole.querySelector('.mole')) return;

    const mole = document.createElement('div');
    mole.className = 'mole';
    mole.textContent = '🐹';
    randomHole.appendChild(mole);

    setTimeout(() => {
        if (mole.parentNode) mole.remove();
    }, 1500);
}

function golpearTopo(index, hole) {
    const mole = hole.querySelector('.mole');
    if (!mole) return;

    moleScore++;
    document.getElementById('moleScore').textContent = moleScore;

    if (moleScore >= 20) {
        clearInterval(moleTimer);
        guardarProgreso(15);
        document.getElementById('nivel14').style.display = 'none';
        document.getElementById('nivel15').style.display = 'block';
    }

    mole.remove();
}

// NIVEL 17: Dibujo
let drawing = false;
let canvas, ctx;

function iniciarDibujo() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
}

function startDrawing(e) {
    drawing = true;
    draw(e);
}

function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function limpiarCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function verificarDibujo() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixelCount = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > 0) pixelCount++;
    }

    if (pixelCount > 500 && pixelCount < 2000) {
        guardarProgreso(18);
        document.getElementById('nivel17').style.display = 'none';
        document.getElementById('nivel18').style.display = 'block';
    } else {
        document.getElementById('errorDibujo').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorDibujo').style.display = 'none';
        }, 3000);
    }
}

// NIVEL 18: Secuencia
function verificarSecuencia() {
    const seq1 = parseInt(document.getElementById('seq1').value);
    const seq2 = parseInt(document.getElementById('seq2').value);
    const seq3 = parseInt(document.getElementById('seq3').value);

    if (seq1 === 42 && seq2 === 56 && seq3 === 72) {
        document.getElementById('seq1').value = '';
        document.getElementById('seq2').value = '';
        document.getElementById('seq3').value = '';
        guardarProgreso(19);
        document.getElementById('nivel18').style.display = 'none';
        document.getElementById('nivel19').style.display = 'block';
    } else {
        document.getElementById('errorSecuencia').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorSecuencia').style.display = 'none';
        }, 3000);
    }
}

// NIVEL 19: Palabras
function verificarPalabras() {
    const word1 = document.getElementById('answer1').value.toLowerCase();
    const word2 = document.getElementById('answer2').value.toLowerCase();
    const word3 = document.getElementById('answer3').value.toLowerCase();

    if (word1 === 'roblox' && word2 === 'juego' && word3 === 'vips') {
        document.getElementById('answer1').value = '';
        document.getElementById('answer2').value = '';
        document.getElementById('answer3').value = '';
        guardarProgreso(20);
        document.getElementById('nivel19').style.display = 'none';
        document.getElementById('nivel20').style.display = 'block';
        iniciarPersecucion();
    } else {
        document.getElementById('errorPalabras').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorPalabras').style.display = 'none';
        }, 3000);
    }
}

// NIVEL 20: Mango Obby Survival
let playerPos = { x: 50, y: 350 };
let cakePos = { x: 100, y: 300 };
let chaserPos = { x: 400, y: 50 };
let gameRunning = false;
let playerHP = 100;
let lastDamageTime = 0;

function iniciarPersecucion() {
    playerPos = { x: 50, y: 350 };
    cakePos = { x: 100, y: 300 };
    chaserPos = { x: 400, y: 50 };
    gameRunning = true;
    playerHP = 100;
    lastDamageTime = 0;

    // Detener música principal y reproducir música del nivel 20
    const mainMusic = document.getElementById('mainMusic');
    const nivel20Music = document.getElementById('nivel20Music');

    if (mainMusic) {
        mainMusic.pause();
    }

    if (nivel20Music) {
        nivel20Music.volume = 0.3;
        nivel20Music.play().catch(e => console.log('Audio nivel 20 no disponible'));
    }

    updatePositions();
    updateHP();

    document.addEventListener('keydown', handleMovement);

    const chaserInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(chaserInterval);
            return;
        }

        // Mover perseguidor hacia el jugador
        if (chaserPos.x < playerPos.x) chaserPos.x += 2;
        if (chaserPos.x > playerPos.x) chaserPos.x -= 2;
        if (chaserPos.y < playerPos.y) chaserPos.y += 2;
        if (chaserPos.y > playerPos.y) chaserPos.y -= 2;

        updatePositions();

        // Verificar colisión con perseguidor y daño
        if (Math.abs(chaserPos.x - playerPos.x) < 30 && Math.abs(chaserPos.y - playerPos.y) < 30) {
            const currentTime = Date.now();
            if (currentTime - lastDamageTime > 500) { // Daño cada 0.5 segundos
                const damage = Math.floor(Math.random() * 16) + 5; // 5-20 de daño
                playerHP -= damage;
                lastDamageTime = currentTime;
                updateHP();

                if (playerHP <= 0) {
                    gameRunning = false;

                    // Detener música temporalmente
                    const music = document.getElementById('nivel20Music');
                    if (music) {
                        music.pause();
                    }

                    document.getElementById('errorChase').style.display = 'block';
                    setTimeout(() => {
                        document.getElementById('errorChase').style.display = 'none';
                        iniciarPersecucion();
                    }, 2000);
                }
            }
        }

        // Verificar si llegó a la esquina con el pastel
        if (playerPos.x > 420 && playerPos.y < 50 &&
            Math.abs(playerPos.x - cakePos.x) < 50 && Math.abs(playerPos.y - cakePos.y) < 50) {
            gameRunning = false;
            document.removeEventListener('keydown', handleMovement);

            // Detener música del nivel 20 y reanudar principal
            const nivel20Music = document.getElementById('nivel20Music');
            const mainMusic = document.getElementById('mainMusic');

            if (nivel20Music) {
                nivel20Music.pause();
                nivel20Music.currentTime = 0;
            }

            if (mainMusic) {
                mainMusic.play().catch(e => console.log('Audio principal no disponible'));
            }

            if (typeof playSuccessSound === 'function') playSuccessSound();

            guardarProgreso(21);
            document.getElementById('nivel20').style.display = 'none';
            document.getElementById('nivel21').style.display = 'block';
            iniciarPuzzle();
        }
    }, 100);
}

function updateHP() {
    const hpPercentage = Math.max(0, (playerHP / 100) * 100);
    document.getElementById('hpFill').style.width = hpPercentage + '%';
    document.getElementById('hpText').textContent = `HP: ${Math.max(0, playerHP)}/100`;

    // Cambiar color según HP (como el mango obby)
    const hpFill = document.getElementById('hpFill');
    if (playerHP > 67) {
        hpFill.style.background = 'linear-gradient(90deg, #00ff00, #7fff00)';
    } else if (playerHP > 33) {
        hpFill.style.background = 'linear-gradient(90deg, #ffff00, #ff7f00)';
    } else {
        hpFill.style.background = 'linear-gradient(90deg, #ff0000, #ff4444)';
    }
}

function handleMovement(e) {
    if (!gameRunning) return;

    const speed = 15;

    switch (e.key) {
        case 'ArrowUp':
            if (playerPos.y > 0) playerPos.y -= speed;
            break;
        case 'ArrowDown':
            if (playerPos.y < 360) playerPos.y += speed;
            break;
        case 'ArrowLeft':
            if (playerPos.x > 0) playerPos.x -= speed;
            break;
        case 'ArrowRight':
            if (playerPos.x < 460) playerPos.x += speed;
            break;
    }

    // Mover pastel cerca del jugador
    if (Math.abs(playerPos.x - cakePos.x) < 60 && Math.abs(playerPos.y - cakePos.y) < 60) {
        cakePos.x = playerPos.x + 30;
        cakePos.y = playerPos.y;
    }

    updatePositions();
}

function updatePositions() {
    const player = document.getElementById('player');
    const cake = document.getElementById('cake');
    const chaser = document.getElementById('chaser');

    if (player) player.style.transform = `translate(${playerPos.x}px, ${playerPos.y}px)`;
    if (cake) cake.style.transform = `translate(${cakePos.x}px, ${cakePos.y}px)`;
    if (chaser) chaser.style.transform = `translate(${chaserPos.x}px, ${chaserPos.y}px)`;
}



// NIVEL 34: Flappy Bird Arreglado
let flappyBird = { y: 150, velocity: 0 };
let flappyPipes = [];
let flappyScore = 0;
let flappyGameRunning = false;
let flappyAnimationId;
let flappyPipeInterval;
let flappyStarted = false;

function iniciarFlappy() {
    // Limpiar todo anterior
    if (flappyAnimationId) cancelAnimationFrame(flappyAnimationId);
    if (flappyPipeInterval) clearInterval(flappyPipeInterval);
    document.removeEventListener('keydown', flappyJump);

    flappyBird = { y: 150, velocity: 0 };
    flappyPipes = [];
    flappyScore = 0;
    flappyGameRunning = false;
    flappyStarted = false;

    document.getElementById('flappyScore').textContent = '0';
    document.getElementById('errorFlappy').style.display = 'none';

    const game = document.getElementById('flappyGame');
    const bird = document.getElementById('flappyBird');
    bird.style.top = '150px';

    // Limpiar tuberías anteriores
    const oldPipes = game.querySelectorAll('.flappy-pipe');
    oldPipes.forEach(pipe => pipe.remove());

    // Eventos de control (Android compatible)
    document.addEventListener('keydown', flappyJump);
    document.addEventListener('touchstart', flappyJump);
    game.addEventListener('click', flappyJump);
    game.addEventListener('touchstart', flappyJump);

    // Countdown de 3 segundos
    let countdown = 3;
    const countdownElement = document.createElement('div');
    countdownElement.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:4em;color:#ff0000;z-index:100;';
    countdownElement.textContent = countdown;
    game.appendChild(countdownElement);

    const countdownTimer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownElement.textContent = countdown;
        } else {
            countdownElement.textContent = '¡VUELA!';
            setTimeout(() => {
                countdownElement.remove();
                flappyGameRunning = true;
                flappyStarted = true;

                // Crear tuberías cada 2 segundos
                flappyPipeInterval = setInterval(() => {
                    if (flappyGameRunning) crearTuberia();
                }, 2000);

                flappyGameLoop();
            }, 500);
            clearInterval(countdownTimer);
        }
    }, 1000);
}

function flappyJump(e) {
    if (!flappyStarted) return;
    if (!flappyGameRunning) return;

    // Soporte para teclado y táctil
    if (e.type === 'keydown' && e.code !== 'Space' && e.key !== ' ') return;
    if (e.type === 'touchstart') e.preventDefault();

    flappyBird.velocity = -6;
}

function crearTuberia() {
    if (!flappyGameRunning) return;

    const game = document.getElementById('flappyGame');
    const gapSize = 120; // Espacio más grande
    const gapPosition = Math.random() * (180 - gapSize) + 60;

    // Tubería superior
    const pipeTop = document.createElement('div');
    pipeTop.className = 'flappy-pipe';
    pipeTop.style.cssText = `position:absolute;right:0px;top:0px;height:${gapPosition}px;width:50px;background:#228B22;border:2px solid #006400;`;
    game.appendChild(pipeTop);

    // Tubería inferior
    const pipeBottom = document.createElement('div');
    pipeBottom.className = 'flappy-pipe';
    pipeBottom.style.cssText = `position:absolute;right:0px;bottom:0px;height:${300 - gapPosition - gapSize}px;width:50px;background:#228B22;border:2px solid #006400;`;
    game.appendChild(pipeBottom);

    flappyPipes.push({ top: pipeTop, bottom: pipeBottom, passed: false, x: 400 });
}

function flappyGameLoop() {
    if (!flappyGameRunning) return;

    // Física del pájaro mejorada
    flappyBird.velocity += 0.5; // Gravedad más suave
    flappyBird.y += flappyBird.velocity;

    const bird = document.getElementById('flappyBird');
    bird.style.top = flappyBird.y + 'px';

    // Verificar límites
    if (flappyBird.y < 0 || flappyBird.y > 270) {
        flappyGameOver();
        return;
    }

    // Mover tuberías
    flappyPipes.forEach((pipe, index) => {
        pipe.x -= 2;
        pipe.top.style.right = (400 - pipe.x) + 'px';
        pipe.bottom.style.right = (400 - pipe.x) + 'px';

        // Verificar colisión
        if (pipe.x <= 80 && pipe.x >= 30) {
            const topHeight = parseInt(pipe.top.style.height);
            const bottomHeight = parseInt(pipe.bottom.style.height);

            if (flappyBird.y < topHeight || flappyBird.y > (300 - bottomHeight - 30)) {
                flappyGameOver();
                return;
            }

            // Contar punto
            if (!pipe.passed) {
                pipe.passed = true;
                flappyScore++;
                document.getElementById('flappyScore').textContent = flappyScore;

                if (flappyScore >= 5) {
                    flappyGameRunning = false;
                    clearInterval(flappyPipeInterval);
                    document.removeEventListener('keydown', flappyJump);
                    guardarProgreso(35);
                    document.getElementById('nivel34').style.display = 'none';
                    document.getElementById('nivel35').style.display = 'block';
                    return;
                }
            }
        }

        // Eliminar tuberías que salieron de pantalla
        if (pipe.x < -50) {
            pipe.top.remove();
            pipe.bottom.remove();
            flappyPipes.splice(index, 1);
        }
    });

    flappyAnimationId = requestAnimationFrame(flappyGameLoop);
}

function flappyGameOver() {
    flappyGameRunning = false;
    clearInterval(flappyPipeInterval);
    document.removeEventListener('keydown', flappyJump);

    if (flappyAnimationId) {
        cancelAnimationFrame(flappyAnimationId);
    }

    document.getElementById('errorFlappy').style.display = 'block';
    setTimeout(() => {
        document.getElementById('errorFlappy').style.display = 'none';
        iniciarFlappy();
    }, 2000);
}

// NIVEL 35: Jefe Final Supremo
function verificarJefeFinal() {
    const answer = parseInt(document.getElementById('finalAnswer').value);

    if (answer === 42) {
        document.getElementById('finalAnswer').value = '';
        guardarProgreso(36);
        document.getElementById('nivel35').style.display = 'none';
        document.getElementById('nivel36').style.display = 'block';
    } else {
        document.getElementById('errorFinal').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorFinal').style.display = 'none';
        }, 3000);
    }
}

// NIVEL 36: Código Binario
function verificarBinario() {
    const respuesta = document.getElementById('binarioAnswer').value;
    if (respuesta === '01001010 01010101 01000111 01000001 01000100 01001111 01010010') {
        guardarProgreso(37);
        document.getElementById('nivel36').style.display = 'none';
        document.getElementById('nivel37').style.display = 'block';
        iniciarTetris();
    } else {
        document.getElementById('errorBinario').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorBinario').style.display = 'none';
        }, 3000);
    }
}

// NIVEL 37: Tetris Imposible
let tetrisGrid = [];
let tetrisPieza = null;
let tetrisTimer;
let tetrisLineas = 0;

function iniciarTetris() {
    tetrisGrid = Array(20).fill().map(() => Array(10).fill(0));
    tetrisLineas = 0;
    document.getElementById('tetrisLineas').textContent = '0';

    const canvas = document.getElementById('tetrisCanvas');
    const ctx = canvas.getContext('2d');

    tetrisTimer = setInterval(() => {
        if (tetrisLineas >= 3) {
            clearInterval(tetrisTimer);
            guardarProgreso(38);
            document.getElementById('nivel37').style.display = 'none';
            document.getElementById('nivel38').style.display = 'block';
            iniciarEscape();
            return;
        }

        // Simular línea completada cada 5 segundos
        tetrisLineas++;
        document.getElementById('tetrisLineas').textContent = tetrisLineas;

        // Dibujar tetris falso
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 300, 400);
        ctx.fillStyle = '#ff0000';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(Math.random() * 280, Math.random() * 380, 20, 20);
        }
    }, 5000);
}

// NIVEL 38: Escape Room
let escapeItems = [];
let escapeTimer = 120;

function iniciarEscape() {
    escapeItems = [];
    escapeTimer = 120;
    document.getElementById('escapeTimer').textContent = escapeTimer;

    const room = document.getElementById('escapeRoom');
    room.innerHTML = '';

    // Crear items ocultos
    const items = ['🗝️', '🔍', '📜'];
    items.forEach((item, i) => {
        const div = document.createElement('div');
        div.textContent = item;
        div.style.cssText = `position:absolute;left:${50 + i * 100}px;top:${100 + i * 50}px;font-size:30px;cursor:pointer;`;
        div.onclick = () => recogerItem(item, div);
        room.appendChild(div);
    });

    const timer = setInterval(() => {
        escapeTimer--;
        document.getElementById('escapeTimer').textContent = escapeTimer;

        if (escapeTimer <= 0) {
            clearInterval(timer);
            document.getElementById('errorEscape').style.display = 'block';
            setTimeout(() => {
                document.getElementById('errorEscape').style.display = 'none';
                iniciarEscape();
            }, 2000);
        }
    }, 1000);
}

function recogerItem(item, element) {
    escapeItems.push(item);
    element.remove();
    document.getElementById('escapeItems').textContent = escapeItems.join(' ');

    if (escapeItems.length >= 3) {
        guardarProgreso(39);
        document.getElementById('nivel38').style.display = 'none';
        document.getElementById('nivel39').style.display = 'block';
        iniciarBoss();
    }
}

// NIVEL 39: Boss Final Épico
let bossHP = 100;
let playerBossHP = 100;
let bossTimer;

function iniciarBoss() {
    bossHP = 100;
    playerBossHP = 100;
    document.getElementById('bossHP').textContent = bossHP;
    document.getElementById('playerHPBoss').textContent = playerBossHP;

    bossTimer = setInterval(() => {
        // Boss ataca
        playerBossHP -= Math.floor(Math.random() * 15) + 5;
        document.getElementById('playerHPBoss').textContent = Math.max(0, playerBossHP);

        if (playerBossHP <= 0) {
            clearInterval(bossTimer);
            document.getElementById('errorBoss').style.display = 'block';
            setTimeout(() => {
                document.getElementById('errorBoss').style.display = 'none';
                iniciarBoss();
            }, 2000);
        }
    }, 3000);
}

function atacarBoss() {
    if (bossHP <= 0) return;

    bossHP -= Math.floor(Math.random() * 20) + 10;
    document.getElementById('bossHP').textContent = Math.max(0, bossHP);

    if (bossHP <= 0) {
        clearInterval(bossTimer);
        guardarProgreso(40);
        document.getElementById('nivel39').style.display = 'none';
        document.getElementById('nivel40').style.display = 'block';
    }
}

// NIVEL 40: DESAFÍO FINAL ÉPICO
let finalSequence = [];
const finalCorrectOrder = ['red', 'blue', 'green', 'yellow'];

function finalClick(color) {
    finalSequence.push(color);
    document.getElementById('finalSequence').textContent = finalSequence.join(' → ');

    // Verificar si la secuencia es correcta hasta ahora
    for (let i = 0; i < finalSequence.length; i++) {
        if (finalSequence[i] !== finalCorrectOrder[i]) {
            document.getElementById('errorFinal40').style.display = 'block';
            setTimeout(() => {
                document.getElementById('errorFinal40').style.display = 'none';
                reiniciarFinal();
            }, 2000);
            return;
        }
    }

    // Si completó la secuencia correctamente
    if (finalSequence.length === finalCorrectOrder.length) {
        localStorage.removeItem('gameProgress');
        document.getElementById('nivel40').style.display = 'none';
        mostrarMensajesFinal();
    }
}

function reiniciarFinal() {
    finalSequence = [];
    document.getElementById('finalSequence').textContent = '';
}


// NIVEL 5: Captcha Troll
let captchaSeleccionados = [];
let captchaIntentos = 0;
const captchaEmojis = ['🚦', '🚗', '🏠', '🚦', '🌳', '🚦', '🐱', '🚙', '🚦'];
const captchaAlterno = ['🍎', '🐶', '🎸', '🍕', '📚', '🌈', '💙', '🎄', '🎆'];

function toggleCaptcha(index) {
    const elemento = document.querySelectorAll('.captcha-img')[index];
    if (captchaSeleccionados.includes(index)) {
        captchaSeleccionados = captchaSeleccionados.filter(i => i !== index);
        elemento.classList.remove('selected');
    } else {
        captchaSeleccionados.push(index);
        elemento.classList.add('selected');
    }
}

function verificarCaptcha() {
    const correctos = [0, 3, 5, 8]; // Posiciones de los semáforos
    captchaIntentos++;

    if (captchaSeleccionados.length === correctos.length &&
        captchaSeleccionados.every(i => correctos.includes(i))) {
        guardarProgreso(6);
        document.getElementById('nivel5').style.display = 'none';
        document.getElementById('nivel6').style.display = 'block';
    } else {
        document.getElementById('errorCaptcha').style.display = 'block';
        // Cambiar las imágenes después de fallar
        setTimeout(() => {
            const grid = document.querySelectorAll('.captcha-img');
            grid.forEach((img, i) => {
                img.textContent = captchaAlterno[i];
                img.classList.remove('selected');
            });
            captchaSeleccionados = [];

            // Después de 3 segundos, volver a los originales
            setTimeout(() => {
                grid.forEach((img, i) => {
                    img.textContent = captchaEmojis[i];
                });
                document.getElementById('errorCaptcha').style.display = 'none';
            }, 3000);
        }, 1000);
    }
}

// NIVEL 6: Simon Dice
let simonSecuencia = [];
let simonUsuario = [];
let simonNivel = 0;
let simonJugando = false;

function iniciarSimon() {
    simonSecuencia = [];
    simonUsuario = [];
    simonNivel = 0;
    simonJugando = true;
    document.getElementById('errorSimon').style.display = 'none';

    // Limpiar cualquier clase active previa
    const botones = document.querySelectorAll('.simon-button');
    botones.forEach(boton => boton.classList.remove('active'));

    siguienteSimon();
}

function siguienteSimon() {
    simonUsuario = [];
    simonSecuencia.push(Math.floor(Math.random() * 4));
    simonNivel++;
    document.getElementById('simonSecuencia').textContent = simonNivel;

    // Limpiar botones antes de mostrar secuencia
    const botones = document.querySelectorAll('.simon-button');
    botones.forEach(boton => boton.classList.remove('active', 'error'));

    // Mostrar secuencia con efectos épicos
    let i = 0;
    const mostrarInterval = setInterval(() => {
        if (i < simonSecuencia.length) {
            if (botones[simonSecuencia[i]]) {
                botones[simonSecuencia[i]].classList.add('active');
                playSimonSound(simonSecuencia[i]);

                setTimeout(() => {
                    if (botones[simonSecuencia[i]]) {
                        botones[simonSecuencia[i]].classList.remove('active');
                    }
                }, 400);
            }
            i++;
        } else {
            clearInterval(mostrarInterval);
        }
    }, 600);
}

function simonClick(color) {
    if (!simonJugando) return;

    const botones = document.querySelectorAll('.simon-button');
    const botonClickeado = botones[color];

    // Efecto visual y sonoro al hacer clic
    botonClickeado.classList.add('active');
    playSimonSound(color);

    setTimeout(() => {
        botonClickeado.classList.remove('active');
    }, 200);

    simonUsuario.push(color);

    for (let i = 0; i < simonUsuario.length; i++) {
        if (simonUsuario[i] !== simonSecuencia[i]) {
            // Efecto de error épico
            playErrorSound();
            botones.forEach(boton => boton.classList.add('error'));
            crearExplosion('💥');

            document.getElementById('errorSimon').style.display = 'block';
            simonJugando = false;

            setTimeout(() => {
                botones.forEach(boton => boton.classList.remove('error', 'active'));
                document.getElementById('errorSimon').style.display = 'none';
            }, 2000);
            return;
        }
    }

    if (simonUsuario.length === simonSecuencia.length) {
        if (simonNivel >= 5) {
            // Efecto de victoria épico
            playSuccessSound();
            crearExplosion('🎉');
            simonJugando = false;

            setTimeout(() => {
                guardarProgreso(7);
                document.getElementById('nivel6').style.display = 'none';
                document.getElementById('nivel7').style.display = 'block';
                iniciarCargaFalsa();
            }, 1000);
        } else {
            // Sonido de nivel completado
            playTone(659.25, 0.3);
            setTimeout(siguienteSimon, 1000);
        }
    }
}

function playSimonSound(color) {
    const frequencies = [261.63, 329.63, 392.00, 523.25]; // Do, Mi, Sol, Do alto
    playTone(frequencies[color], 0.3, 'square');
}

function crearExplosion(emoji) {
    const container = document.querySelector('.simon-container');
    const explosion = document.createElement('div');
    explosion.className = 'simon-explosion';
    explosion.textContent = emoji;
    explosion.style.left = '50%';
    explosion.style.top = '50%';
    explosion.style.transform = 'translate(-50%, -50%)';

    container.appendChild(explosion);

    setTimeout(() => {
        if (explosion.parentNode) explosion.remove();
    }, 1000);
}

// NIVEL 7: Carga Falsa + Virus Troll
function iniciarCargaFalsa() {
    let progreso = 0;
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const codigoStatus = document.getElementById('codigoStatus');

    const mensajes = [
        "Verificando credenciales...",
        "Conectando al servidor VIP...",
        "Descargando archivos...",
        "Instalando privilegios...",
        "Configurando acceso...",
        "Finalizando proceso..."
    ];

    const interval = setInterval(() => {
        progreso += Math.random() * 15;

        if (progreso >= 99 && progreso < 100) {
            // Reiniciar al 99%
            progreso = 85;
            codigoStatus.textContent = "Error: Reintentando...";
        } else if (progreso >= 100) {
            progreso = 100;
            clearInterval(interval);

            // Mostrar virus popup después de completar
            setTimeout(() => {
                document.getElementById('virusPopup').style.display = 'block';
            }, 1000);
        }

        progressBar.style.width = progreso + '%';
        progressText.textContent = 'Cargando: ' + Math.floor(progreso) + '%';

        if (progreso < 100) {
            const mensajeIndex = Math.floor((progreso / 100) * mensajes.length);
            codigoStatus.textContent = mensajes[mensajeIndex] || mensajes[0];
        } else {
            codigoStatus.textContent = "Proceso completado.";
        }
    }, 800);
}

function eliminarVirus() {
    document.getElementById('virusPopup').style.display = 'none';
    setTimeout(() => {
        alert('¡BROMA! No había ningún virus 😈');
        guardarProgreso(8);
        document.getElementById('nivel7').style.display = 'none';
        document.getElementById('nivel8').style.display = 'block';
        iniciarLaberinto();
    }, 500);
}

function cerrarVirus() {
    alert('¡NO PUEDES ESCAPAR! 😈');
    alert('¡El virus se está extendiendo! 🦠');
    alert('Solo bromeo... haz clic en "Eliminar Virus" 😂');
}

// NIVEL 21: Rompecabezas Deslizante
let puzzleState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
let puzzleTarget = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function iniciarPuzzle() {
    // Mezclar puzzle
    for (let i = 0; i < 100; i++) {
        const moves = getValidMoves();
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        movePiece(randomMove, false);
    }
    renderPuzzle();
}

function renderPuzzle() {
    const grid = document.getElementById('puzzleGrid');
    grid.innerHTML = '';
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,80px);gap:5px;margin:20px auto;width:fit-content;';

    puzzleState.forEach((num, index) => {
        const piece = document.createElement('div');
        piece.style.cssText = 'width:80px;height:80px;background:#007bff;color:white;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;border-radius:5px;';
        piece.textContent = num === 0 ? '' : num;
        if (num === 0) piece.style.background = '#333';
        piece.onclick = () => movePiece(index);
        grid.appendChild(piece);
    });
}

function getValidMoves() {
    const emptyIndex = puzzleState.indexOf(0);
    const moves = [];
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    if (row > 0) moves.push(emptyIndex - 3);
    if (row < 2) moves.push(emptyIndex + 3);
    if (col > 0) moves.push(emptyIndex - 1);
    if (col < 2) moves.push(emptyIndex + 1);

    return moves;
}

function movePiece(index, checkWin = true) {
    const emptyIndex = puzzleState.indexOf(0);
    const validMoves = getValidMoves();

    if (validMoves.includes(index)) {
        [puzzleState[emptyIndex], puzzleState[index]] = [puzzleState[index], puzzleState[emptyIndex]];
        if (checkWin) {
            renderPuzzle();
            if (JSON.stringify(puzzleState) === JSON.stringify(puzzleTarget)) {
                guardarProgreso(22);
                document.getElementById('nivel21').style.display = 'none';
                document.getElementById('nivel22').style.display = 'block';
            }
        }
    }
}

// NIVEL 22: Laberinto Invisible
let invisibleMaze = [];
let playerInvisible = { x: 0, y: 0 };

function iniciarInvisible() {
    // Crear laberinto simple
    invisibleMaze = [
        [0, 1, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 0, 1, 2]
    ];
    playerInvisible = { x: 0, y: 0 };
    renderInvisible();

    document.addEventListener('keydown', handleInvisibleMove);
}

function renderInvisible() {
    const maze = document.getElementById('invisibleMaze');
    maze.innerHTML = '';
    maze.style.cssText = 'display:grid;grid-template-columns:repeat(5,60px);gap:2px;margin:20px auto;width:fit-content;';

    invisibleMaze.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement('div');
            div.style.cssText = 'width:60px;height:60px;border:1px solid #333;display:flex;align-items:center;justify-content:center;font-size:24px;';

            if (x === playerInvisible.x && y === playerInvisible.y) {
                div.textContent = '🟢';
                div.style.background = '#4a4a4a';
            } else if (cell === 2) {
                div.textContent = '🎯';
                div.style.background = '#ff4444';
            } else {
                div.style.background = '#2a2a2a';
            }

            maze.appendChild(div);
        });
    });
}

function handleInvisibleMove(e) {
    let newX = playerInvisible.x;
    let newY = playerInvisible.y;

    switch (e.key.toLowerCase()) {
        case 'w': newY--; break;
        case 's': newY++; break;
        case 'a': newX--; break;
        case 'd': newX++; break;
        default: return;
    }

    if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5) return;

    if (invisibleMaze[newY][newX] === 1) {
        // Revelar pared
        const cells = document.querySelectorAll('#invisibleMaze > div');
        cells[newY * 5 + newX].style.background = '#666';
        cells[newY * 5 + newX].textContent = '🧱';

        document.getElementById('errorInvisible').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorInvisible').style.display = 'none';
        }, 1000);
        return;
    }

    playerInvisible.x = newX;
    playerInvisible.y = newY;

    if (invisibleMaze[newY][newX] === 2) {
        document.removeEventListener('keydown', handleInvisibleMove);
        guardarProgreso(23);
        document.getElementById('nivel22').style.display = 'none';
        document.getElementById('nivel23').style.display = 'block';
        return;
    }

    renderInvisible();
}

// NIVEL 23: Secuencia de Colores
let colorSequence = [];
let userColorSequence = [];
const colors = ['🔴', '🔵', '🟢', '🟡', '🟠', '🟣'];

function iniciarColores() {
    colorSequence = [];
    userColorSequence = [];

    for (let i = 0; i < 10; i++) {
        colorSequence.push(Math.floor(Math.random() * colors.length));
    }

    const display = document.getElementById('colorSequence');
    display.innerHTML = colorSequence.map(i => colors[i]).join(' ');
    display.style.cssText = 'font-size:3em;margin:20px;padding:20px;background:#333;border-radius:10px;';

    setTimeout(() => {
        display.innerHTML = '❓ ❓ ❓ ❓ ❓ ❓ ❓ ❓ ❓ ❓';
        mostrarBotonesColores();
    }, 3000);
}

function mostrarBotonesColores() {
    const buttons = document.getElementById('colorButtons');
    buttons.innerHTML = '';
    buttons.style.cssText = 'display:flex;gap:10px;justify-content:center;margin:20px;';

    colors.forEach((color, index) => {
        const btn = document.createElement('button');
        btn.textContent = color;
        btn.style.cssText = 'font-size:2em;padding:10px;border:none;border-radius:50%;cursor:pointer;';
        btn.onclick = () => clickColor(index);
        buttons.appendChild(btn);
    });
}

function clickColor(colorIndex) {
    userColorSequence.push(colorIndex);

    if (userColorSequence.length === colorSequence.length) {
        if (JSON.stringify(userColorSequence) === JSON.stringify(colorSequence)) {
            guardarProgreso(24);
            document.getElementById('nivel23').style.display = 'none';
            document.getElementById('nivel24').style.display = 'block';
            iniciarMath24();
        } else {
            document.getElementById('errorColores').style.display = 'block';
            setTimeout(() => {
                document.getElementById('errorColores').style.display = 'none';
                iniciarColores(); // Reiniciar automáticamente
            }, 2000);
        }
    }
}

// NIVEL 24: Matemáticas Mentales
let mathProblems = [];
let currentMathProblem = 0;
let mathTimer;
let mathSeconds = 30;

function iniciarMath24() {
    mathProblems = [
        { problem: '√144 + 7² - 3!', answer: 55 }, // 12 + 49 - 6 = 55
        { problem: '2³ × 5 + 17 - 9', answer: 48 }, // 8 × 5 + 17 - 9 = 48
        { problem: '(15 + 9) ÷ 3 × 7 - 11', answer: 45 }, // 24 ÷ 3 × 7 - 11 = 45
        { problem: '5! ÷ 10 + 8² - 52', answer: 24 }, // 120 ÷ 10 + 64 - 52 = 24
        { problem: '∛27 + 4² × 2 - 13', answer: 22 }, // 3 + 16 × 2 - 13 = 22
        { problem: '99 ÷ 9 + 6² - 2⁴', answer: 31 }, // 11 + 36 - 16 = 31
        { problem: '7 × 8 - 3² + √25', answer: 52 }, // 56 - 9 + 5 = 52
        { problem: '(4 + 6)² ÷ 5 - 7', answer: 13 } // 100 ÷ 5 - 7 = 13
    ];

    // Mezclar problemas para mayor dificultad
    mathProblems = mathProblems.sort(() => Math.random() - 0.5).slice(0, 5);

    currentMathProblem = 0;
    mathSeconds = 30;

    document.getElementById('mathTimer').textContent = mathSeconds;
    document.getElementById('mathCount').textContent = '0';

    mathTimer = setInterval(() => {
        mathSeconds--;
        document.getElementById('mathTimer').textContent = mathSeconds;

        if (mathSeconds <= 0) {
            clearInterval(mathTimer);
            document.getElementById('errorMath24').style.display = 'block';
            setTimeout(() => {
                document.getElementById('errorMath24').style.display = 'none';
                iniciarMath24();
            }, 2000);
        }
    }, 1000);

    mostrarProblema();
}

function mostrarProblema() {
    if (currentMathProblem < mathProblems.length) {
        document.getElementById('mathProblem').textContent = mathProblems[currentMathProblem].problem + ' = ?';
        document.getElementById('mathAnswer').value = '';
        document.getElementById('mathCount').textContent = currentMathProblem;
    }
}

function verificarMath24() {
    const answer = parseInt(document.getElementById('mathAnswer').value);

    if (answer === mathProblems[currentMathProblem].answer) {
        currentMathProblem++;

        if (currentMathProblem >= mathProblems.length) {
            clearInterval(mathTimer);
            guardarProgreso(25);
            document.getElementById('nivel24').style.display = 'none';
            document.getElementById('nivel25').style.display = 'block';
            iniciarPatrones();
        } else {
            mostrarProblema();
        }
    } else {
        document.getElementById('errorMath24').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorMath24').style.display = 'none';
        }, 1000);
    }
}

// NIVEL 25: Patrones
function iniciarPatrones() {
    const patterns = [
        { sequence: ['🔴', '🔵', '🔴', '🔵', '🔴'], answer: '🔵' },
        { sequence: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐'], answer: '⭐⭐⭐⭐⭐' }
    ];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    document.getElementById('patternDisplay').innerHTML = pattern.sequence.join(' ') + ' ?';
    document.getElementById('patternDisplay').style.cssText = 'font-size:2em;margin:20px;padding:20px;background:#333;border-radius:10px;';

    const options = document.getElementById('patternOptions');
    options.innerHTML = '';
    options.style.cssText = 'display:flex;gap:10px;justify-content:center;margin:20px;';

    const allOptions = [pattern.answer, '❌', '⚡'];
    allOptions.sort(() => Math.random() - 0.5);

    allOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.style.cssText = 'font-size:2em;padding:15px;border:none;border-radius:10px;cursor:pointer;background:#007bff;color:white;';
        btn.onclick = () => verificarPattern(option, pattern.answer);
        options.appendChild(btn);
    });
}

function verificarPattern(selected, correct) {
    if (selected === correct) {
        guardarProgreso(26);
        document.getElementById('nivel25').style.display = 'none';
        document.getElementById('nivel26').style.display = 'block';
        iniciarReflejos();
    } else {
        document.getElementById('errorPattern').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorPattern').style.display = 'none';
            iniciarPatrones(); // Reiniciar automáticamente
        }, 2000);
    }
}

// NIVEL 26: Reflejos Extremos
let reflexScore = 0;
let reflexTimer;
let reflexSeconds = 20;

function iniciarReflejos() {
    reflexScore = 0;
    reflexSeconds = 20;

    document.getElementById('reflexScore').textContent = '0';
    document.getElementById('reflexTimer').textContent = reflexSeconds;

    const game = document.getElementById('reflexGame');
    game.innerHTML = '';
    game.style.cssText = 'position:relative;width:400px;height:300px;background:#222;border:2px solid #444;margin:20px auto;';

    reflexTimer = setInterval(() => {
        reflexSeconds--;
        document.getElementById('reflexTimer').textContent = reflexSeconds;

        if (reflexSeconds <= 0) {
            clearInterval(reflexTimer);

            if (reflexScore >= 15) {
                guardarProgreso(27);
                document.getElementById('nivel26').style.display = 'none';
                document.getElementById('nivel27').style.display = 'block';
                iniciarSopa();
            } else {
                document.getElementById('errorReflex').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('errorReflex').style.display = 'none';
                    iniciarReflejos(); // Reiniciar automáticamente
                }, 2000);
            }
        }
    }, 1000);

    setInterval(() => {
        if (reflexSeconds > 0) crearObjetivo();
    }, 800);
}

function crearObjetivo() {
    const game = document.getElementById('reflexGame');
    const target = document.createElement('div');

    const objetivos = ['🎯', '🔴', '⭐', '💥', '🔥'];
    const objetivo = objetivos[Math.floor(Math.random() * objetivos.length)];

    target.textContent = objetivo;
    target.style.cssText = 'position:absolute;font-size:30px;cursor:pointer;animation:targetPulse 0.5s infinite;';
    target.style.left = Math.random() * 350 + 'px';
    target.style.top = Math.random() * 250 + 'px';

    target.onclick = () => {
        reflexScore++;
        document.getElementById('reflexScore').textContent = reflexScore;

        // Efecto de explosión épico
        crearExplosionReflex(target.style.left, target.style.top);
        playTone(800 + Math.random() * 400, 0.1, 'square');

        target.remove();
    };

    game.appendChild(target);

    setTimeout(() => {
        if (target.parentNode) {
            // Explosión al desaparecer
            crearExplosionReflex(target.style.left, target.style.top, '💨');
            target.remove();
        }
    }, 1500);
}

function crearExplosionReflex(x, y, emoji = '💥') {
    const game = document.getElementById('reflexGame');
    const explosion = document.createElement('div');

    explosion.textContent = emoji;
    explosion.style.cssText = 'position:absolute;font-size:40px;pointer-events:none;animation:reflexExplosion 0.8s ease-out forwards;';
    explosion.style.left = x;
    explosion.style.top = y;

    game.appendChild(explosion);

    setTimeout(() => {
        if (explosion.parentNode) explosion.remove();
    }, 800);
}

// NIVEL 27: Sopa de Letras (Simplificado)
function iniciarSopa() {
    const wordSearch = document.getElementById('wordSearch');
    wordSearch.innerHTML = '';
    wordSearch.style.cssText = 'display:grid;grid-template-columns:repeat(10,30px);gap:2px;margin:20px auto;width:fit-content;';

    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.textContent = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        cell.style.cssText = 'width:30px;height:30px;background:#333;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;';
        wordSearch.appendChild(cell);
    }

    const wordList = document.getElementById('wordList');
    wordList.innerHTML = '<li>ROBLOX</li><li>JUEGO</li><li>VIP</li><li>JUGADOR</li><li>MANGO</li>';

    let clickCount = 0;
    wordSearch.addEventListener('click', () => {
        clickCount++;
        if (clickCount >= 25) {
            guardarProgreso(28);
            document.getElementById('nivel27').style.display = 'none';
            document.getElementById('nivel28').style.display = 'block';
            iniciarEquilibrio();
        }
    });
}

// NIVEL 28: Equilibrio
let balanceTimer;
let balanceSeconds = 10;

function iniciarEquilibrio() {
    balanceSeconds = 10;
    document.getElementById('balanceTimer').textContent = balanceSeconds;

    const game = document.getElementById('balanceGame');
    game.style.cssText = 'position:relative;width:400px;height:200px;margin:20px auto;';

    const platform = document.getElementById('balancePlatform');
    platform.style.cssText = 'position:absolute;bottom:0;left:50%;width:200px;height:20px;background:#666;transform:translateX(-50%);';

    const ball = document.getElementById('balanceBall');
    ball.style.cssText = 'position:absolute;bottom:20px;left:50%;font-size:30px;transform:translateX(-50%);';

    document.addEventListener('mousemove', (e) => {
        const gameRect = game.getBoundingClientRect();
        const relativeX = e.clientX - gameRect.left;
        const platformX = Math.max(0, Math.min(200, relativeX - 100));

        platform.style.left = platformX + 'px';
        ball.style.left = (platformX + 100) + 'px';
    });

    balanceTimer = setInterval(() => {
        balanceSeconds--;
        document.getElementById('balanceTimer').textContent = balanceSeconds;

        if (balanceSeconds <= 0) {
            clearInterval(balanceTimer);
            guardarProgreso(29);
            document.getElementById('nivel28').style.display = 'none';
            document.getElementById('nivel29').style.display = 'block';
            iniciarMorse();
        }
    }, 1000);
}

// NIVEL 29: Código Morse
function iniciarMorse() {
    const phrases = [
        'JUGADOR VIP ROBLOX',
        'JUEGO IMPOSIBLE FINAL',
        'MANGO OBBY SURVIVAL',
        'DESAFIO COMPLETADO',
        'NIVEL CUARENTA FINAL'
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const morseMap = {
        'A': '·-', 'B': '-···', 'C': '-·-·', 'D': '-··', 'E': '·', 'F': '··-·',
        'G': '--·', 'H': '····', 'I': '··', 'J': '·---', 'K': '-·-', 'L': '·-··',
        'M': '--', 'N': '-·', 'O': '---', 'P': '·--·', 'Q': '--·-', 'R': '·-·',
        'S': '···', 'T': '-', 'U': '··-', 'V': '···-', 'W': '·--', 'X': '-··-',
        'Y': '-·--', 'Z': '--··', ' ': '/'  // Espacio como /
    };

    const morse = phrase.split('').map(letter => morseMap[letter] || '?').join(' ');

    // Mostrar la frase que debe escribir
    const fraseDisplay = document.getElementById('fraseDisplay') || document.createElement('p');
    fraseDisplay.id = 'fraseDisplay';
    fraseDisplay.style.cssText = 'font-size:1.3em;margin:20px;padding:15px;background:#333;color:#fff;border-radius:10px;text-align:center;';
    fraseDisplay.textContent = `Escribe esta frase: "${phrase}"`;

    const morseDisplayElement = document.getElementById('morseDisplay');
    if (!document.getElementById('fraseDisplay')) {
        morseDisplayElement.parentNode.insertBefore(fraseDisplay, morseDisplayElement);
    }

    document.getElementById('morseDisplay').textContent = morse;
    document.getElementById('morseDisplay').style.cssText = 'font-size:1.5em;margin:20px;padding:20px;background:#000;color:#0f0;border-radius:10px;font-family:monospace;line-height:1.6;';

    document.getElementById('morseAnswer').value = '';
    document.getElementById('morseAnswer').setAttribute('data-answer', phrase);
}

function verificarMorse() {
    const answer = document.getElementById('morseAnswer').value.toUpperCase();
    const correct = document.getElementById('morseAnswer').getAttribute('data-answer');

    if (answer === correct) {
        document.getElementById('morseAnswer').value = '';
        guardarProgreso(30);
        document.getElementById('nivel29').style.display = 'none';
        document.getElementById('nivel30').style.display = 'block';
        iniciarMultitarea();
    } else {
        document.getElementById('errorMorse').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorMorse').style.display = 'none';
            iniciarMorse(); // Reiniciar automáticamente
        }, 2000);
    }
}

// NIVEL 30: Multitarea
let spacePressed = false;
let mouseCircles = 0;
let countValue = 0;

function iniciarMultitarea() {
    spacePressed = false;
    mouseCircles = 0;
    countValue = 0;

    document.getElementById('spaceStatus').textContent = '❌';
    document.getElementById('mouseStatus').textContent = '❌';
    document.getElementById('countStatus').textContent = '0';
    document.getElementById('countInput').value = '';

    document.addEventListener('keydown', handleMultitaskKey);
    document.addEventListener('keyup', handleMultitaskKeyUp);
    document.addEventListener('mousemove', handleMultitaskMouse);

    document.getElementById('countInput').addEventListener('input', (e) => {
        countValue = parseInt(e.target.value) || 0;
        document.getElementById('countStatus').textContent = countValue;

        if (spacePressed && mouseCircles >= 3 && countValue >= 20) {
            document.removeEventListener('keydown', handleMultitaskKey);
            document.removeEventListener('keyup', handleMultitaskKeyUp);
            document.removeEventListener('mousemove', handleMultitaskMouse);

            guardarProgreso(31);
            document.getElementById('nivel30').style.display = 'none';
            document.getElementById('nivel31').style.display = 'block';
            iniciarRuleta();
        }
    });
}

function handleMultitaskKey(e) {
    if (e.code === 'Space') {
        spacePressed = true;
        document.getElementById('spaceStatus').textContent = '✅';
    }
}

function handleMultitaskKeyUp(e) {
    if (e.code === 'Space') {
        spacePressed = false;
        document.getElementById('spaceStatus').textContent = '❌';
    }
}

let lastMouseX = 0;
let lastMouseY = 0;
function handleMultitaskMouse(e) {
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;

    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
        mouseCircles++;
        if (mouseCircles >= 3) {
            document.getElementById('mouseStatus').textContent = '✅';
        }
    }

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
}

// NIVEL 31: Ruleta Final
let ruletaGirando = false;

function iniciarRuleta() {
    const ruleta = document.getElementById('ruleta');
    const boton = document.getElementById('girarRuleta');

    boton.onclick = () => {
        if (ruletaGirando) return;

        ruletaGirando = true;
        const giros = Math.random() * 3600 + 1800; // 5-15 vueltas

        ruleta.style.transition = 'transform 3s ease-out';
        ruleta.style.transform = `rotate(${giros}deg)`;

        setTimeout(() => {
            ruletaGirando = false;
            const resultado = Math.floor((giros % 360) / 60); // 6 secciones

            if (resultado === 0) { // Sección ganadora
                guardarProgreso(32);
                document.getElementById('nivel31').style.display = 'none';
                document.getElementById('nivel32').style.display = 'block';
                iniciarMeteoros();
            } else {
                document.getElementById('ruletaError').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('ruletaError').style.display = 'none';
                    ruleta.style.transition = 'none';
                    ruleta.style.transform = 'rotate(0deg)';
                }, 2000);
            }
        }, 3000);
    };
}

// NIVEL 32: Esquiva los Meteoros Infernales 😈
let meteorosJuego = false;
let meteorosTimer;
let meteorosSegundos = 30;
let meteorosEsquivados = 0;
let playerMeteoros = { x: 200, y: 350 };
let meteoros = [];

function iniciarMeteoros() {
    // Limpiar elementos anteriores
    const existingGame = document.getElementById('meteorosGame');
    if (existingGame) existingGame.remove();

    const container = document.getElementById('nivel32');

    // Crear área de juego
    const gameArea = document.createElement('div');
    gameArea.id = 'meteorosGame';
    gameArea.style.cssText = 'position:relative;width:400px;height:300px;background:linear-gradient(180deg,#000428,#004e92);border:3px solid #ff4444;margin:20px auto;overflow:hidden;';

    // Jugador
    const player = document.createElement('div');
    player.id = 'playerMeteoros';
    player.style.cssText = 'position:absolute;width:30px;height:30px;background:#00ff00;border-radius:50%;font-size:20px;display:flex;align-items:center;justify-content:center;';
    player.textContent = '🚀';
    player.style.left = playerMeteoros.x + 'px';
    player.style.top = playerMeteoros.y + 'px';

    // Contador y timer
    const stats = document.createElement('div');
    stats.style.cssText = 'text-align:center;margin:10px;';
    stats.innerHTML = `
        <p style="color:#00ff00;font-size:1.3em;">Meteoros esquivados: <span id="meteorosCount">0</span>/25</p>
        <p style="color:#ffff00;font-size:1.2em;">Tiempo: <span id="meteorosTimer">60</span>s</p>
        <p id="meteorosWarning" style="color:#ff0000;font-size:1.1em;display:none;">⚠️ ¡EL SUELO SE DESTRUIRÁ! ¡Ve a la plataforma! ⚠️</p>
        <p style="color:#ff6666;font-size:1em;">Usa WASD o flechas para moverte</p>
    `;

    const h1 = container.querySelector('h1');
    h1.insertAdjacentElement('afterend', stats);
    stats.insertAdjacentElement('afterend', gameArea);
    gameArea.appendChild(player);

    // Resetear variables
    meteorosJuego = true;
    meteorosSegundos = 60;
    meteorosEsquivados = 0;
    meteoros = [];
    playerMeteoros = { x: 200, y: 350 };

    // Crear suelo inicial
    const suelo = document.createElement('div');
    suelo.id = 'sueloMeteoros';
    suelo.style.cssText = 'position:absolute;bottom:0;width:100%;height:30px;background:#8B4513;';
    gameArea.appendChild(suelo);

    // Controles
    document.addEventListener('keydown', moverPlayerMeteoros);

    // Timer principal
    meteorosTimer = setInterval(() => {
        meteorosSegundos--;
        document.getElementById('meteorosTimer').textContent = meteorosSegundos;

        // Crear plataforma en segundo 40
        if (meteorosSegundos === 40) {
            crearPlataforma();
            document.getElementById('meteorosWarning').style.display = 'block';
        }

        // Destruir suelo en segundo 35
        if (meteorosSegundos === 35) {
            destruirSuelo();
        }

        // Mover plataforma en segundo 25
        if (meteorosSegundos === 25) {
            iniciarMovimientoPlataforma();
        }

        if (meteorosSegundos <= 0) {
            if (meteorosEsquivados >= 25) {
                meteorosVictoria();
            } else {
                meteorosDerrota();
            }
        }
    }, 1000);

    // Crear meteoros
    setInterval(() => {
        if (meteorosJuego) crearMeteoro();
    }, 800);

    // Mover meteoros
    setInterval(() => {
        if (meteorosJuego) moverMeteoros();
    }, 50);
}

function moverPlayerMeteoros(e) {
    if (!meteorosJuego) return;

    const speed = 15;
    const suelo = document.getElementById('sueloMeteoros');
    const plataforma = document.getElementById('plataformaMeteoros');

    switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            if (playerMeteoros.y > 0) playerMeteoros.y -= speed;
            break;
        case 's':
        case 'arrowdown':
            let maxY = 270;
            // Si hay suelo, limitar a suelo
            if (suelo) maxY = 240;
            // Si está en plataforma, limitar a plataforma
            if (plataforma) {
                const platX = parseInt(plataforma.style.left) || 150;
                if (playerMeteoros.x >= platX && playerMeteoros.x <= platX + 100) {
                    maxY = 190; // Altura de plataforma
                }
            }
            if (playerMeteoros.y < maxY) playerMeteoros.y += speed;
            break;
        case 'a':
        case 'arrowleft':
            if (playerMeteoros.x > 0) playerMeteoros.x -= speed;
            break;
        case 'd':
        case 'arrowright':
            if (playerMeteoros.x < 370) playerMeteoros.x += speed;
            break;
    }

    // Verificar si cayó al vacío
    if (!suelo && (!plataforma || playerMeteoros.y > 250)) {
        const platX = parseInt(plataforma?.style.left) || -100;
        if (playerMeteoros.x < platX || playerMeteoros.x > platX + 100) {
            meteorosDerrota();
            return;
        }
    }

    const player = document.getElementById('playerMeteoros');
    if (player) {
        player.style.left = playerMeteoros.x + 'px';
        player.style.top = playerMeteoros.y + 'px';
    }
}

function crearPlataforma() {
    const gameArea = document.getElementById('meteorosGame');
    const plataforma = document.createElement('div');
    plataforma.id = 'plataformaMeteoros';
    plataforma.style.cssText = 'position:absolute;bottom:80px;left:150px;width:100px;height:20px;background:#FFD700;border:2px solid #FFA500;';
    gameArea.appendChild(plataforma);

    alert('🚨 ¡PLATAFORMA CREADA! ¡Ve hacia ella antes de que se destruya el suelo! 🚨');
}

function destruirSuelo() {
    const suelo = document.getElementById('sueloMeteoros');
    if (suelo) {
        suelo.remove();
        alert('💥 ¡EL SUELO SE HA DESTRUIDO! ¡Solo la plataforma te salvará! 💥');
    }
}

let plataformaMovimiento;
function iniciarMovimientoPlataforma() {
    const plataforma = document.getElementById('plataformaMeteoros');
    if (!plataforma) return;

    let direccion = 1;
    let posX = 150;

    alert('⚡ ¡LA PLATAFORMA AHORA SE MUEVE! ¡Mantente encima! ⚡');

    plataformaMovimiento = setInterval(() => {
        posX += direccion * 3;

        if (posX <= 0 || posX >= 300) {
            direccion *= -1;
        }

        plataforma.style.left = posX + 'px';

        // Mover jugador con plataforma si está encima
        if (playerMeteoros.x >= posX && playerMeteoros.x <= posX + 100 && playerMeteoros.y >= 190 && playerMeteoros.y <= 220) {
            playerMeteoros.x = Math.max(0, Math.min(370, playerMeteoros.x + direccion * 3));
            const player = document.getElementById('playerMeteoros');
            if (player) {
                player.style.left = playerMeteoros.x + 'px';
            }
        }
    }, 100);
}

function crearMeteoro() {
    const gameArea = document.getElementById('meteorosGame');
    if (!gameArea) return;

    const meteoro = document.createElement('div');
    meteoro.className = 'meteoro';
    meteoro.style.cssText = 'position:absolute;width:25px;height:25px;font-size:20px;';
    meteoro.textContent = ['☄️', '💥', '🔥', '⚡'][Math.floor(Math.random() * 4)];
    meteoro.style.left = Math.random() * 375 + 'px';
    meteoro.style.top = '-25px';

    gameArea.appendChild(meteoro);
    meteoros.push({ element: meteoro, x: parseInt(meteoro.style.left), y: -25 });
}

function moverMeteoros() {
    meteoros.forEach((meteoro, index) => {
        meteoro.y += 5;
        meteoro.element.style.top = meteoro.y + 'px';

        if (Math.abs(meteoro.x - playerMeteoros.x) < 25 && Math.abs(meteoro.y - playerMeteoros.y) < 25) {
            meteorosDerrota();
            return;
        }

        if (meteoro.y > 300) {
            meteoro.element.remove();
            meteoros.splice(index, 1);
            meteorosEsquivados++;
            document.getElementById('meteorosCount').textContent = meteorosEsquivados;
        }
    });
}

function meteorosVictoria() {
    meteorosJuego = false;
    clearInterval(meteorosTimer);
    if (plataformaMovimiento) clearInterval(plataformaMovimiento);
    document.removeEventListener('keydown', moverPlayerMeteoros);

    alert('🎉 ¡INCREÍBLE! ¡Sobreviviste al apocalipsis con plataforma móvil! 🎉');
    guardarProgreso(33);
    document.getElementById('nivel32').style.display = 'none';
    document.getElementById('nivel33').style.display = 'block';
    iniciarLaberintoMouse();
}

function meteorosDerrota() {
    meteorosJuego = false;
    clearInterval(meteorosTimer);
    if (plataformaMovimiento) clearInterval(plataformaMovimiento);
    document.removeEventListener('keydown', moverPlayerMeteoros);

    alert('💥 ¡APLASTADO O CAÍSTE AL VACÍO! ¡El apocalipsis no perdona! 😈');
    setTimeout(() => {
        iniciarMeteoros();
    }, 1000);
}

function iniciarLuzRojaVerdeOLD() {
    // Limpiar elementos anteriores
    const existingLuz = document.getElementById('luzSemaforo');
    const existingZona = document.getElementById('zonaSegura');
    const existingContador = document.getElementById('contadorLuz');
    const existingTimer = document.getElementById('timerCambio');
    if (existingLuz) existingLuz.remove();
    if (existingZona) existingZona.remove();
    if (existingContador) existingContador.remove();
    if (existingTimer) existingTimer.remove();

    // Limpiar timer anterior
    if (luzTimer) {
        clearInterval(luzTimer);
    }

    const container = document.getElementById('nivel32');

    const luzDiv = document.createElement('div');
    luzDiv.id = 'luzSemaforo';
    luzDiv.style.cssText = 'width:100px;height:100px;border-radius:50%;margin:20px auto;background:red;border:5px solid #333;';

    const zonaSegura = document.createElement('div');
    zonaSegura.id = 'zonaSegura';
    zonaSegura.style.cssText = 'width:150px;height:150px;border:3px dashed #00ff00;margin:20px auto;display:flex;align-items:center;justify-content:center;';
    zonaSegura.textContent = 'ZONA SEGURA';

    const contador = document.createElement('p');
    contador.id = 'contadorLuz';
    contador.style.cssText = 'font-size:1.5em;margin:10px;color:#00ff00;';
    contador.textContent = `Éxitos: ${exitosLuz}/3`;

    const timerDisplay = document.createElement('p');
    timerDisplay.id = 'timerCambio';
    timerDisplay.style.cssText = 'font-size:1.2em;margin:10px;color:#ffff00;';
    timerDisplay.textContent = 'Cambio en: 3s';

    const h1 = container.querySelector('h1');
    h1.insertAdjacentElement('afterend', luzDiv);
    luzDiv.insertAdjacentElement('afterend', zonaSegura);
    zonaSegura.insertAdjacentElement('afterend', contador);
    contador.insertAdjacentElement('afterend', timerDisplay);

    // Resetear variables
    luzActual = 'roja';
    mouseEnZona = false;
    exitosLuz = 0;
    tiempoEnVerde = 0;
    tiempoParaCambio = 0;

    zonaSegura.addEventListener('mouseenter', () => {
        mouseEnZona = true;
        if (luzActual === 'roja') {
            alert('¡PERDISTE! La luz estaba roja 😈');
            reiniciarLuzRojaVerde();
        }
    });

    zonaSegura.addEventListener('mouseleave', () => {
        mouseEnZona = false;
    });

    cambiarLuz();
}

function reiniciarLuzRojaVerde() {
    // Limpiar timer
    if (luzTimer) {
        clearInterval(luzTimer);
    }

    // Resetear variables
    luzActual = 'roja';
    mouseEnZona = false;
    exitosLuz = 0;
    tiempoEnVerde = 0;
    tiempoParaCambio = 0;

    // Reiniciar después de un breve delay
    setTimeout(() => {
        iniciarLuzRojaVerde();
    }, 1000);
}

function cambiarLuz() {
    const luz = document.getElementById('luzSemaforo');
    tiempoEnVerde = 0;
    tiempoParaCambio = Math.random() * 3 + 2; // 2-5 segundos aleatorio

    actualizarTimerDisplay();

    luzTimer = setInterval(() => {
        tiempoParaCambio--;
        actualizarTimerDisplay();

        if (tiempoParaCambio <= 0) {
            if (luzActual === 'roja') {
                luzActual = 'verde';
                luz.style.background = 'green';
                tiempoEnVerde = 0;
                tiempoParaCambio = 4; // 4 segundos en verde
            } else {
                // Verificar si logró éxito (estuvo 3+ segundos en verde)
                if (tiempoEnVerde >= 3 && mouseEnZona) {
                    exitosLuz++;
                    document.getElementById('contadorLuz').textContent = `Éxitos: ${exitosLuz}/3`;

                    if (exitosLuz >= 3) {
                        clearInterval(luzTimer);
                        guardarProgreso(33);
                        document.getElementById('nivel32').style.display = 'none';
                        document.getElementById('nivel33').style.display = 'block';
                        iniciarLaberintoMouse();
                        return;
                    }
                }

                luzActual = 'roja';
                luz.style.background = 'red';
                tiempoParaCambio = Math.random() * 3 + 2; // Nuevo tiempo aleatorio

                if (mouseEnZona) {
                    alert('¡PERDISTE! No saliste a tiempo 😈');
                    clearInterval(luzTimer);
                    reiniciarLuzRojaVerde();
                    return;
                }
            }
        }

        if (luzActual === 'verde') {
            tiempoEnVerde++;
        }
    }, 1000);
}

function actualizarTimerDisplay() {
    const timerElement = document.getElementById('timerCambio');
    if (timerElement) {
        if (luzActual === 'roja') {
            timerElement.textContent = `Verde en: ${tiempoParaCambio}s`;
            timerElement.style.color = '#ffff00';
        } else {
            timerElement.textContent = `Roja en: ${tiempoParaCambio}s (Verde: ${tiempoEnVerde}s)`;
            timerElement.style.color = '#00ff00';
        }
    }
}

// NIVEL 33: Laberinto con Mouse
let laberintoMouse = [];
let playerMousePos = { x: 0, y: 0 };

function iniciarLaberintoMouse() {
    laberintoMouse = [
        [0, 1, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 1],
        [0, 1, 1, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 0, 2]
    ];

    playerMousePos = { x: 0, y: 0 };
    renderLaberintoMouse();
}

function renderLaberintoMouse() {
    const container = document.getElementById('nivel33');

    let laberintoDiv = document.getElementById('laberintoMouse');
    if (!laberintoDiv) {
        laberintoDiv = document.createElement('div');
        laberintoDiv.id = 'laberintoMouse';
        const h1 = container.querySelector('h1');
        h1.insertAdjacentElement('afterend', laberintoDiv);
    }

    laberintoDiv.innerHTML = '';
    laberintoDiv.style.cssText = 'display:grid;grid-template-columns:repeat(8,40px);gap:2px;margin:20px auto;width:fit-content;';

    laberintoMouse.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement('div');
            div.style.cssText = 'width:40px;height:40px;border:1px solid #333;display:flex;align-items:center;justify-content:center;font-size:20px;';

            if (x === playerMousePos.x && y === playerMousePos.y) {
                div.textContent = '🟢';
                div.style.background = '#4a4a4a';
            } else if (cell === 1) {
                div.style.background = '#000';
                div.textContent = '🧱';
            } else if (cell === 2) {
                div.textContent = '🎯';
                div.style.background = '#ff4444';
            } else {
                div.style.background = '#2a2a2a';
            }

            div.addEventListener('mouseenter', () => moverEnLaberinto(x, y));
            laberintoDiv.appendChild(div);
        });
    });
}

function moverEnLaberinto(x, y) {
    const deltaX = Math.abs(x - playerMousePos.x);
    const deltaY = Math.abs(y - playerMousePos.y);

    if ((deltaX === 1 && deltaY === 0) || (deltaX === 0 && deltaY === 1)) {
        if (laberintoMouse[y][x] === 1) {
            alert('¡Chocaste con una pared! Reiniciando... 😈');
            playerMousePos = { x: 0, y: 0 };
            renderLaberintoMouse();
            return;
        }

        playerMousePos = { x, y };

        if (laberintoMouse[y][x] === 2) {
            guardarProgreso(34);
            document.getElementById('nivel33').style.display = 'none';
            document.getElementById('nivel34').style.display = 'block';
            iniciarFlappy();
            return;
        }

        renderLaberintoMouse();
    }
}

// Mensajes FINALES estilo Undertale
const mensajesFinales = [
    {
        personaje: "🎉",
        nombre: "SISTEMA",
        texto: "* ¡INCREÍBLE! ¡Has completado todos los niveles!"
    },
    {
        personaje: "🏆",
        nombre: "SISTEMA",
        texto: "* 40 niveles de pura locura... y los has superado todos."
    },
    {
        personaje: "⭐",
        nombre: "SISTEMA",
        texto: "* Eres oficialmente un MAESTRO DE JUEGOS IMPOSIBLES."
    },
    {
        personaje: "🎮",
        nombre: "SISTEMA",
        texto: "* Este desafío épico ha llegado a su fin."
    },
    {
        personaje: "👏",
        nombre: "SISTEMA",
        texto: "* ¡Felicidades por tu perseverancia y habilidad!"
    },
    {
        personaje: "🌟",
        nombre: "SISTEMA",
        texto: "* Gracias por jugar este desafío imposible."
    }
];

let mensajeFinalActual = -1;
let textoFinalCompleto = false;
let textoFinalActual = "";
let indiceFinalTexto = 0;

function mostrarMensajesFinal() {
    document.getElementById('mensajesFinalContainer').style.display = 'flex';
    mensajeFinalActual = 0;
    procesarMensajeFinal();
}

function procesarMensajeFinal() {
    if (mensajeFinalActual >= mensajesFinales.length) {
        mensajeFinalActual = -1;
        document.getElementById('mensajesFinalContainer').style.display = 'none';
        document.getElementById('final').style.display = 'block';
        mostrarFinal();
        return;
    }

    const mensaje = mensajesFinales[mensajeFinalActual];
    document.getElementById('personajeFinalEmoji').textContent = mensaje.personaje;
    document.getElementById('nombreFinalPersonaje').textContent = mensaje.nombre;

    textoFinalActual = "";
    indiceFinalTexto = 0;
    textoFinalCompleto = false;
    animarTextoFinal(mensaje.texto);
}

function animarTextoFinal(texto) {
    if (indiceFinalTexto < texto.length) {
        textoFinalActual += texto.charAt(indiceFinalTexto);
        document.getElementById('textoFinalDialogo').textContent = textoFinalActual;
        indiceFinalTexto++;
        setTimeout(() => animarTextoFinal(texto), 50);
    } else {
        textoFinalCompleto = true;
    }
}

function siguienteMensajeFinal() {
    if (!textoFinalCompleto) {
        textoFinalCompleto = true;
        document.getElementById('textoFinalDialogo').textContent = mensajesFinales[mensajeFinalActual].texto;
    } else {
        mensajeFinalActual++;
        procesarMensajeFinal();
    }
}

// Event listeners para mensajes finales
document.addEventListener('keydown', (e) => {
    if (document.getElementById('mensajesFinalContainer').style.display === 'flex') {
        if (e.key === 'Enter' || e.key === ' ') {
            siguienteMensajeFinal();
        }
    }
});

document.addEventListener('click', (e) => {
    if (document.getElementById('mensajesFinalContainer').style.display === 'flex') {
        siguienteMensajeFinal();
    }
});

// Función final simple
function mostrarFinal() {
    // Solo mostrar el mensaje final sin redirección
    console.log('¡Juego completado!');
}



// Sistema anti-trampas
let nivelActualValido = 1;
let timestampNivel = Date.now();
let checksumNivel = '';
let intentosTrampas = 0;

function generarChecksum(nivel) {
    const data = `${nivel}_${timestampNivel}_player_vip_799`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function validarProgreso(nivel) {
    if (nivel > nivelActualValido + 1) {
        alert('🚨 No puedes saltar niveles 🚨');
        return false;
    }
    return true;
}

// Guardar progreso con validación
function guardarProgreso(nivel) {
    if (!validarProgreso(nivel)) return;

    nivelActualValido = nivel;
    timestampNivel = Date.now();
    checksumNivel = generarChecksum(nivel);

    localStorage.setItem('gameProgress', nivel.toString());
    localStorage.setItem('gameTime', timestampNivel.toString());
    localStorage.setItem('gameChecksum', checksumNivel);
}

function cargarProgreso() {
    const nivel = parseInt(localStorage.getItem('gameProgress')) || 1;
    const tiempo = parseInt(localStorage.getItem('gameTime')) || Date.now();
    const checksum = localStorage.getItem('gameChecksum') || '';

    nivelActualValido = nivel;
    timestampNivel = tiempo;
    checksumNivel = checksum;

    return nivel;
}

// SISTEMA ANTI-DEVTOOLS
var devToolsBlocked = false;
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;
let tabChangeTime = 0;
let tabSuspicious = false;

// Detectar cambio de pestaña (posible inspector en otra pestaña)
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        tabChangeTime = Date.now();
    } else {
        const timeAway = Date.now() - tabChangeTime;
        if (timeAway > 2000 && timeAway < 30000) { // Entre 2-30 segundos
            tabSuspicious = true;
            intentosTrampas++;
            alert('🚨 CAMBIO DE PESTAÑA SOSPECHOSO 🚨\n¿Abriste el inspector en otra pestaña?');
        }
    }
});

// Detectar inspector móvil y PC
setInterval(function () {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    // Detectar cambios bruscos (inspector móvil) - Deshabilitado para Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (!isAndroid && !isMobile) {
        if (Math.abs(currentWidth - lastWidth) > 100 || Math.abs(currentHeight - lastHeight) > 100) {
            intentosTrampas++;
            alert('🚨 INSPECTOR MÓVIL DETECTADO 🚨');
            if (intentosTrampas >= 5) {
                alert('😈 Demasiados intentos. Cierra el inspector.');
            }
        }
    }

    // Detector clásico PC - Deshabilitado para móviles
    if (!isAndroid && !isMobile) {
        if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
            document.body.innerHTML = '<div style="background:#000;color:#fff;text-align:center;padding:50px;font-size:24px;">❌ INSPECTOR DETECTADO ❌<br><br>😈 Cierra las herramientas de desarrollador 😈<br><br>Recarga la página</div>';
        }
    }

    lastWidth = currentWidth;
    lastHeight = currentHeight;
}, 500);

// Detectar cuando vuelven después de usar inspector
window.addEventListener('focus', function () {
    if (tabSuspicious) {
        alert('😈 Te veo... ¿Usaste el inspector? 😈');
        tabSuspicious = false;
    }
});

document.addEventListener('keydown', function (e) {
    if (!devToolsBlocked && (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.shiftKey && e.key === 'K')
    )) {
        e.preventDefault();
        devToolsBlocked = true;
        intentosTrampas++;
        alert('🚨 NO SE PERMITE INSPECCIONAR 🚨');
        setTimeout(() => { devToolsBlocked = false; }, 1000);
    }
});

// CLIC DERECHO BLOQUEADO
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    alert('🚨 CLIC DERECHO BLOQUEADO 🚨');
});

// SELECCIÓN BLOQUEADA
document.addEventListener('selectstart', function (e) {
    e.preventDefault();
});

document.addEventListener('dragstart', function (e) {
    e.preventDefault();
});

window.addEventListener('beforeprint', function (e) {
    e.preventDefault();
    alert('¡No se permite imprimir! 😈');
});

// PROTEGER CONSOLA
const originalLog = console.log;
console.log = function () {
    originalLog('%c🚨 CONSOLA BLOQUEADA 🚨', 'color: red; font-size: 30px; font-weight: bold;');
};

setInterval(() => {
    console.clear();
    originalLog('%c😈 ANTI-DEVTOOLS ACTIVO 😈', 'color: red; font-size: 30px; font-weight: bold;');

    // Mensaje adicional si hay actividad sospechosa
    if (intentosTrampas > 0) {
        originalLog('%c🚨 ACTIVIDAD SOSPECHOSA DETECTADA 🚨', 'color: orange; font-size: 20px;');
        originalLog(`Intentos de trampa: ${intentosTrampas}`, 'color: yellow; font-size: 16px;');
    }
}, 500);

// Funciones de audio
function playTone(frequency, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Audio no disponible');
    }
}

function playSuccessSound() {
    playTone(523.25, 0.2);
    setTimeout(() => playTone(659.25, 0.2), 100);
    setTimeout(() => playTone(783.99, 0.3), 200);
}

function playErrorSound() {
    playTone(200, 0.5, 'sawtooth');
}

function playClickSound() {
    playTone(800, 0.1, 'square');
}



// PROTECCIÓN ANTI-CONSOLA
let consoleBloqueada = false;
const originalGuardarProgreso = guardarProgreso;

// Bloquear funciones de consola
console.log = () => { consoleBloqueada = true; };
console.warn = () => { consoleBloqueada = true; };
console.error = () => { consoleBloqueada = true; };
console.info = () => { consoleBloqueada = true; };
console.dir = () => { consoleBloqueada = true; };

// Bloquear eval
window.eval = () => { alert('🚨 EVAL BLOQUEADO 🚨'); location.reload(); };

// Proteger guardarProgreso
guardarProgreso = function (nivel) {
    const stack = new Error().stack;
    if (stack.includes('console') || stack.includes('eval') || consoleBloqueada) {
        alert('🚨 TRAMPA DETECTADA: Uso de consola bloqueado 🚨');
        localStorage.clear();
        location.reload();
        return;
    }
    return originalGuardarProgreso(nivel);
};

// Detectar uso de consola
setInterval(() => {
    if (consoleBloqueada) {
        alert('🚨 USO DE CONSOLA DETECTADO - REINICIANDO JUEGO 🚨');
        localStorage.clear();
        location.reload();
    }
    consoleBloqueada = false;
}, 1000);