// Inicializar elementos del DOM
const elements = {
    player: document.getElementById('player'),
    ally: document.getElementById('ally'),
    enemy: document.getElementById('enemy'),
    enemyMinion1: document.getElementById('enemy-minion1'),
    enemyMinion2: document.getElementById('enemy-minion2'),
    playerHealthFill: document.getElementById('player-health-fill'),
    playerHealthText: document.getElementById('player-health-text'),
    playerTpFill: document.getElementById('player-tp-fill'),
    playerTpText: document.getElementById('player-tp-text'),
    allyHealthFill: document.getElementById('ally-health-fill'),
    allyHealthText: document.getElementById('ally-health-text'),
    enemyHealthFill: document.getElementById('enemy-health-fill'),
    enemyHealthText: document.getElementById('enemy-health-text'),
    dialogueBox: document.getElementById('dialogue-box'),
    battleUI: document.getElementById('battle-ui'),
    actionBox: document.getElementById('action-box'),
    attackMenu: document.getElementById('attack-menu'),
    skillMenu: document.getElementById('skill-menu'),
    itemMenu: document.getElementById('item-menu'),
    precisionGame: document.getElementById('precision-game'),
    precisionBar: document.getElementById('precision-bar'),
    precisionTarget: document.getElementById('precision-target'),
    precisionIndicator: document.getElementById('precision-indicator'),
    precisionInstructions: document.getElementById('precision-instructions'),
    tpDisplay: document.getElementById('tp-value'),
    endScreen: document.getElementById('end-screen'),
    bgMusic: document.getElementById('bg-music'),
    angryMusic: document.getElementById('angry-music'),
    attackSound: document.getElementById('attack-sound'),
    defendSound: document.getElementById('defend-sound'),
    healSound: document.getElementById('heal-sound'),
    coinSound: document.getElementById('coin-sound'),
    summonSound: document.getElementById('summon-sound'),
    errorSound: document.getElementById('error-sound'),
    gunSound: document.getElementById('gun-sound'),
    fireSound: document.getElementById('fire-sound'),
    minionSound: document.getElementById('minion-sound'),
    itemSound: document.getElementById('item-sound'),
    poisonSound: document.getElementById('poison-sound'),
    invincibleSound: document.getElementById('invincible-sound'),
    finalSound: document.getElementById('final-sound'),
    iceSound: document.getElementById('ice-sound'),
    greenSound: document.getElementById('green-sound'),
    musicToggle: document.getElementById('music-toggle'),
    debugInfo: document.getElementById('debug-info'),
    loadingScreen: document.getElementById('loading-screen'),
    loadingProgress: document.getElementById('loading-progress'),
    gameContainer: document.getElementById('game-container')
};

// Verificar que todos los elementos necesarios existan
Object.keys(elements).forEach(key => {
    if (!elements[key]) {
        console.error(`Elemento no encontrado: ${key}`);
    }
});

// Sistema de seguridad para uiBlocked
const UI_BLOCKED_TIMEOUT = 10000; // 10 segundos máximo de bloqueo
let uiBlockedTimer = null;

function startUiBlockedTimer() {
    if (uiBlockedTimer) clearTimeout(uiBlockedTimer);
    uiBlockedTimer = setTimeout(() => {
        if (gameCore.gameState.uiBlocked) {
            console.warn("UI bloqueada por demasiado tiempo. Reiniciando estado...");
            forceUnlockUI();
        }
    }, UI_BLOCKED_TIMEOUT);
}

function resetUiBlockedTimer() {
    if (uiBlockedTimer) clearTimeout(uiBlockedTimer);
}

function forceUnlockUI() {
    console.warn("Forzando desbloqueo de UI...");
    gameCore.gameState.uiBlocked = false;
    gameCore.gameState.precisionGameActive = false;
    resetUiBlockedTimer();

    try {
        if (elements.dialogueBox) elements.dialogueBox.style.display = 'none';
        if (gameCore.gameState.currentTurn === 'player' && !gameCore.gameState.player.skipTurn) {
            enableUI();
            showMainMenu();
        }
    } catch (e) {
        console.error("Error en forceUnlockUI:", e);
    }
}

// FUNCIONES DE INTERFAZ
function showEffectEmoji(emoji, target = 'player', duration = 1000) {
    try {
        const effect = document.createElement('div');
        effect.className = 'battle-effect emoji-effect';
        effect.textContent = emoji;
        effect.style.animationDuration = `${duration}ms`;

        if (target === 'player') {
            effect.style.right = '25%';
            effect.style.bottom = '40%';
        } else {
            effect.style.left = '25%';
            effect.style.bottom = '40%';
        }

        const container = document.getElementById('game-container');
        if (container) {
            container.appendChild(effect);
            setTimeout(() => {
                if (effect.parentNode) {
                    effect.remove();
                }
            }, duration);
        }
    } catch (error) {
        console.error("Error en showEffectEmoji:", error);
    }
}

function showDialogue(text, duration = 3000) {
    try {
        if (gameCore.gameState.uiBlocked && !gameCore.gameState.precisionGameActive) return;

        gameCore.gameState.uiBlocked = true;
        startUiBlockedTimer();
        if (elements.dialogueBox) {
            elements.dialogueBox.textContent = text;
            elements.dialogueBox.style.display = 'block';
        }

        if (duration > 0) {
            setTimeout(() => {
                if (elements.dialogueBox && elements.dialogueBox.textContent === text) {
                    hideDialogue();
                }
            }, duration);
        }
    } catch (error) {
        console.error("Error en showDialogue:", error);
        forceUnlockUI();
    }
}

function hideDialogue() {
    try {
        if (elements.dialogueBox) {
            elements.dialogueBox.style.display = 'none';
        }
        gameCore.gameState.uiBlocked = false;
        resetUiBlockedTimer();

        if (gameCore.gameState.currentTurn === 'player' && !gameCore.gameState.player.skipTurn && !gameCore.gameState.precisionGameActive) {
            enableUI();
        }
    } catch (error) {
        console.error("Error en hideDialogue:", error);
        forceUnlockUI();
    }
}

function updateHealthBars() {
    try {
        if (elements.playerHealthFill) {
            elements.playerHealthFill.style.width = `${(gameCore.gameState.player.hp / gameCore.gameState.player.maxHp) * 100}%`;
        }
        if (elements.playerTpFill) {
            elements.playerTpFill.style.width = `${Math.floor(gameCore.gameState.player.tp / gameCore.gameState.player.maxTp * 100)}%`;
        }
        if (elements.enemyHealthFill) {
            elements.enemyHealthFill.style.width = `${(gameCore.gameState.enemy.hp / gameCore.gameState.enemy.maxHp) * 100}%`;
        }

        if (elements.playerHealthText) {
            elements.playerHealthText.textContent = `${gameCore.gameState.player.hp}/${gameCore.gameState.player.maxHp}`;
        }
        if (elements.playerTpText) {
            elements.playerTpText.textContent = `${Math.floor(gameCore.gameState.player.tp)}/${gameCore.gameState.player.maxTp}`;
        }
        if (elements.enemyHealthText) {
            elements.enemyHealthText.textContent = `${gameCore.gameState.enemy.hp}/${gameCore.gameState.enemy.maxHp}`;
        }
        if (elements.tpDisplay) {
            elements.tpDisplay.textContent = Math.floor(gameCore.gameState.player.tp);
        }

        if (gameCore.gameState.ally.active) {
            if (elements.allyHealthFill) {
                elements.allyHealthFill.style.width = `${(gameCore.gameState.ally.hp / gameCore.gameState.ally.maxHp) * 100}%`;
            }
            if (elements.allyHealthText) {
                elements.allyHealthText.textContent = `${gameCore.gameState.ally.hp}/${gameCore.gameState.ally.maxHp}`;
            }
        }

        gameCore.gameState.enemyMinions.forEach(minion => {
            if (minion.active) {
                const healthFill = document.getElementById(`enemy-minion${minion.id}-health-fill`);
                if (healthFill) {
                    healthFill.style.width = `${(minion.hp / minion.maxHp) * 100}%`;
                }
            }
        });

        if (elements.playerHealthFill) {
            if (gameCore.gameState.player.hp / gameCore.gameState.player.maxHp < 0.3) {
                elements.playerHealthFill.style.background = gameCore.gameState.greenMode ? '#4CAF50' : '#ff3864';
            } else {
                elements.playerHealthFill.style.background = gameCore.gameState.greenMode ?
                    'linear-gradient(to right, #4CAF50, #8BC34A)' :
                    'linear-gradient(to right, #ff3864, #ff6b8b)';
            }
        }

        if (elements.enemyHealthFill) {
            if (gameCore.gameState.enemy.hp / gameCore.gameState.enemy.maxHp < 0.3) {
                elements.enemyHealthFill.style.background = '#ff3864';
            } else {
                elements.enemyHealthFill.style.background = 'linear-gradient(to right, #ff3864, #ff6b8b)';
            }
        }
    } catch (error) {
        console.error("Error en updateHealthBars:", error);
    }
}

function showAttackEffect(source, value, target = 'enemy') {
    try {
        const effect = document.createElement('div');
        effect.className = 'battle-effect';
        effect.textContent = `-${value}`;

        if (source === 'player') {
            effect.style.right = '25%';
            effect.style.bottom = '40%';
            effect.style.color = gameCore.gameState.greenMode ? '#4CAF50' : '#7b68ee';
            if (elements.player) {
                elements.player.classList.add('shake');
                setTimeout(() => {
                    if (elements.player) {
                        elements.player.classList.remove('shake');
                    }
                }, 500);
            }
        } else if (target === 'ally') {
            effect.style.left = '35%';
            effect.style.bottom = '40%';
            effect.style.color = '#ff6b8b';
            if (elements.ally) {
                elements.ally.classList.add('shake');
                setTimeout(() => {
                    if (elements.ally) {
                        elements.ally.classList.remove('shake');
                    }
                }, 500);
            }
        } else if (target.startsWith('enemy-minion')) {
            effect.style.right = (target === 'enemy-minion1' ? '25%' : '35%');
            effect.style.bottom = '25%';
            effect.style.color = '#ff6b8b';
            const minionElement = document.getElementById(target);
            if (minionElement) {
                minionElement.classList.add('shake');
                setTimeout(() => {
                    minionElement.classList.remove('shake');
                }, 500);
            }
        } else {
            effect.style.left = '25%';
            effect.style.bottom = '40%';
            effect.style.color = '#ff6b8b';
            if (elements.enemy) {
                elements.enemy.classList.add('shake');
                setTimeout(() => {
                    if (elements.enemy) {
                        elements.enemy.classList.remove('shake');
                    }
                }, 500);
            }
        }

        const container = document.getElementById('game-container');
        if (container) {
            container.appendChild(effect);
            setTimeout(() => {
                if (effect.parentNode) {
                    effect.remove();
                }
            }, 1000);
        }
    } catch (error) {
        console.error("Error en showAttackEffect:", error);
    }
}

function showHealEffect() {
    try {
        const effect = document.createElement('div');
        effect.className = 'heal-effect';
        effect.textContent = '❤️';
        effect.style.right = '20%';
        effect.style.bottom = '30%';
        
        const container = document.getElementById('game-container');
        if (container) {
            container.appendChild(effect);
            setTimeout(() => {
                if (effect.parentNode) {
                    effect.remove();
                }
            }, 1000);
        }
    } catch (error) {
        console.error("Error en showHealEffect:", error);
    }
}

// MANEJO DE TURNOS
function startPlayerTurn() {
    try {
        if (gameCore.gameState.player.hp <= 0 || gameCore.gameState.enemy.hp <= 0) return;

        gameCore.gameState.player.actionTaken = false;
        gameCore.gameState.player.defending = false;
        gameCore.gameState.player.defenseBoost = 0;
        gameCore.gameState.uiBlocked = false;
        gameCore.gameState.precisionGameActive = false;
        resetUiBlockedTimer();

        if (gameCore.gameState.player.skipTurn) {
            gameCore.gameState.player.skipTurn = false;
            showDialogue("¡Estás aturdido! Pierdes este turno.");
            setTimeout(endPlayerTurn, 1500);
            return;
        }

        updateTemporaryEffects();
        updateHealthBars();

        if (!gameCore.gameState.uiBlocked && !gameCore.gameState.precisionGameActive) {
            enableUI();
        }

        showMainMenu();
    } catch (error) {
        console.error("Error en startPlayerTurn:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function endPlayerTurn() {
    try {
        gameCore.gameState.currentTurn = 'enemy';
        gameCore.gameState.uiBlocked = false;
        gameCore.gameState.precisionGameActive = false;
        resetUiBlockedTimer();
        disableUI();
        hideDialogue();
        setTimeout(startEnemyTurn, 1000);
    } catch (error) {
        console.error("Error en endPlayerTurn:", error);
        forceUnlockUI();
        setTimeout(startEnemyTurn, 1000);
    }
}

// ACCIONES DEL JUGADOR
function playerAttack(type) {
    try {
        if (!gameCore.ATTACK_TYPES[type]) {
            console.error("Tipo de ataque no válido:", type);
            return;
        }

        if (gameCore.gameState.player.actionTaken) {
            if (elements.errorSound) {
                elements.errorSound.currentTime = 0;
                elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            showDialogue("¡Ya realizaste una acción este turno!");
            setTimeout(() => hideDialogue(), 2000);
            return;
        }

        const attack = gameCore.ATTACK_TYPES[type];

        if (attack.tp > 0 && gameCore.gameState.player.tp < attack.tp) {
            if (elements.errorSound) {
                elements.errorSound.currentTime = 0;
                elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            showDialogue(`No tienes suficiente TP para usar ${type === 'gun' ? 'la pistola' : 'la doble espada'}.`);
            setTimeout(() => {
                hideDialogue();
                startPlayerTurn();
            }, 2000);
            return;
        }

        if (!gameCore.gameState.player.hasWeapon && (type === 'sword' || type === 'doubleSword')) {
            if (elements.errorSound) {
                elements.errorSound.currentTime = 0;
                elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            showDialogue("¡No tienes espada! Usa 'Mejorar Armas' primero.");
            setTimeout(() => {
                hideDialogue();
                startPlayerTurn();
            }, 2000);
            return;
        }

        gameCore.gameState.player.actionTaken = true;
        disableUI();
        startPrecisionGame(type);
    } catch (error) {
        console.error("Error en playerAttack:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function startPrecisionGame(attackType) {
    try {
        gameCore.gameState.precisionGameActive = true;
        showDialogue("¡Juego de precisión! Toca cuando el indicador esté en la zona verde.");

        setTimeout(() => {
            hideDialogue();
            if (elements.precisionGame) {
                elements.precisionGame.style.display = 'flex';
            }

            let position = 0;
            let direction = 1;
            let speed = 2 + Math.random() * 0.3;
            let lastTime = performance.now();
            let animationId;

            const animate = (currentTime) => {
                if (!gameCore.gameState.precisionGameActive) {
                    cancelAnimationFrame(animationId);
                    return;
                }

                const deltaTime = currentTime - lastTime;
                lastTime = currentTime;

                position += direction * speed * (deltaTime / 16);

                if (position >= 100) {
                    position = 100;
                    direction = -1;
                    speed = 2 + Math.random() * 0.3;
                } else if (position <= 0) {
                    position = 0;
                    direction = 1;
                    speed = 2 + Math.random() * 0.3;
                }

                if (elements.precisionIndicator) {
                    elements.precisionIndicator.style.left = `${position}%`;
                }
                animationId = requestAnimationFrame(animate);
            };

            animationId = requestAnimationFrame(animate);

            const handlePrecisionClick = (e) => {
                try {
                    e.preventDefault();
                    if (!gameCore.gameState.precisionGameActive) return;
                    
                    cancelAnimationFrame(animationId);

                    const indicatorPos = elements.precisionIndicator ? parseFloat(elements.precisionIndicator.style.left) : 0;
                    const targetStart = 35;
                    const targetEnd = 65;

                    let precisionLevel = 0;
                    if (indicatorPos >= targetStart && indicatorPos <= targetEnd) {
                        precisionLevel = 2;
                    } else if (indicatorPos >= targetStart - 15 && indicatorPos <= targetEnd + 15) {
                        precisionLevel = 1;
                    }

                    if (elements.precisionGame) {
                        elements.precisionGame.style.display = 'none';
                        elements.precisionGame.removeEventListener('click', handlePrecisionClick);
                        elements.precisionGame.removeEventListener('touchstart', handlePrecisionClick);
                    }
                    gameCore.gameState.precisionGameActive = false;
                    gameCore.executePlayerAttack(attackType, precisionLevel);
                } catch (error) {
                    console.error("Error en handlePrecisionClick:", error);
                    forceUnlockUI();
                }
            };

            if (elements.precisionGame) {
                elements.precisionGame.addEventListener('click', handlePrecisionClick);
                elements.precisionGame.addEventListener('touchstart', handlePrecisionClick);
            }

            setTimeout(() => {
                if (gameCore.gameState.precisionGameActive) {
                    cancelAnimationFrame(animationId);
                    if (elements.precisionGame) {
                        elements.precisionGame.style.display = 'none';
                        elements.precisionGame.removeEventListener('click', handlePrecisionClick);
                        elements.precisionGame.removeEventListener('touchstart', handlePrecisionClick);
                    }
                    gameCore.gameState.precisionGameActive = false;
                    showDialogue("¡Demasiado lento! Pierdes tu turno.");
                    setTimeout(endPlayerTurn, 2000);
                }
            }, 5000);
        }, 1000);
    } catch (error) {
        console.error("Error en startPrecisionGame:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function playerDefend() {
    try {
        if (gameCore.gameState.player.actionTaken) {
            if (elements.errorSound) {
                elements.errorSound.currentTime = 0;
                elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            showDialogue("¡Ya realizaste una acción este turno!");
            setTimeout(() => hideDialogue(), 2000);
            return;
        }

        gameCore.gameState.player.actionTaken = true;
        disableUI();
        if (elements.defendSound) {
            elements.defendSound.currentTime = 0;
            elements.defendSound.play().catch(e => console.log("Error al reproducir sonido:", e));
        }

        gameCore.gameState.player.defending = true;
        gameCore.gameState.player.defenseBoost = 0.7;

        gameCore.gameState.player.tp += 15;
        if (gameCore.gameState.player.tp > gameCore.gameState.player.maxTp) {
            gameCore.gameState.player.tp = gameCore.gameState.player.maxTp;
        }

        showDialogue("¡Te preparas para defender! (+15 TP, -70% daño)");
        updateHealthBars();

        setTimeout(() => {
            forceUnlockUI();
            endPlayerTurn();
        }, 1500);
    } catch (error) {
        console.error("Error en playerDefend:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

// HABILIDADES
function useSkill(skill) {
    try {
        if (!gameCore.SKILLS[skill]) {
            console.error("Habilidad no válida:", skill);
            return;
        }

        if (gameCore.gameState.player.actionTaken) {
            if (elements.errorSound) {
                elements.errorSound.currentTime = 0;
                elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            showDialogue("¡Ya realizaste una acción este turno!");
            setTimeout(() => hideDialogue(), 2000);
            return;
        }

        const skillInfo = gameCore.SKILLS[skill];

        if (skillInfo.tp !== 'MAX' && gameCore.gameState.player.tp < skillInfo.tp) {
            if (elements.errorSound) {
                elements.errorSound.currentTime = 0;
                elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            showDialogue(`No tienes suficiente TP para usar ${skillInfo.name}. Necesitas ${skillInfo.tp} TP.`);
            setTimeout(() => {
                hideDialogue();
                startPlayerTurn();
            }, 2000);
            return;
        }

        if (skillInfo.tp === 'MAX' && gameCore.gameState.player.tp < gameCore.gameState.player.maxTp) {
            if (elements.errorSound) {
                elements.errorSound.currentTime = 0;
                elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            showDialogue("No tienes el TP al máximo.");
            setTimeout(() => {
                hideDialogue();
                startPlayerTurn();
            }, 2000);
            return;
        }

        gameCore.gameState.player.actionTaken = true;
        disableUI();

        switch (skill) {
            case 'boring':
                gameCore.gameState.player.tp -= skillInfo.tp;
                gameCore.gameState.enemy.asleep = 2;

                showDialogue("¡Nivel bodrio! Pollolito se duerme por 2 turnos.");
                updateHealthBars();

                setTimeout(() => {
                    forceUnlockUI();
                    endPlayerTurn();
                }, 2000);
                break;

            case 'heal':
                if (Math.random() < 0.2) {
                    if (elements.errorSound) {
                        elements.errorSound.currentTime = 0;
                        elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                    }
                    showDialogue("Pollolito: " + gameCore.getRandomLine(gameCore.POLLO_LINES.onHealBlock));
                    showDialogue("¡Pollolito niega tu curación!");
                } else {
                    if (elements.healSound) {
                        elements.healSound.currentTime = 0;
                        elements.healSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                    }
                    gameCore.gameState.player.tp -= skillInfo.tp;
                    const healAmount = 50 - Math.floor(50 * (gameCore.gameState.player.fatigue * 0.03));
                    gameCore.gameState.player.hp += healAmount;
                    if (gameCore.gameState.player.hp > gameCore.gameState.player.maxHp) {
                        gameCore.gameState.player.hp = gameCore.gameState.player.maxHp;
                    }
                    showDialogue("¡Curación épica! +" + healAmount + " HP.");

                    showHealEffect();
                    updateHealthBars();
                }
                setTimeout(() => {
                    forceUnlockUI();
                    endPlayerTurn();
                }, 2000);
                break;

            case 'upgrade':
                gameCore.gameState.player.tp = 0;
                const roll = Math.random();

                if (roll < 0.4) {
                    if (elements.healSound) {
                        elements.healSound.currentTime = 0;
                        elements.healSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                    }
                    gameCore.gameState.player.attackBonus += 5;
                    showDialogue("¡Mejora épica! +5 de daño permanente.");
                } else if (roll < 0.7) {
                    if (elements.errorSound) {
                        elements.errorSound.currentTime = 0;
                        elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                    }
                    gameCore.gameState.player.hasWeapon = false;
                    gameCore.gameState.player.attackBonus = Math.max(-5, gameCore.gameState.player.attackBonus - 5);
                    showDialogue("¡Oh no! Pierdes tu arma. -5 de daño.");
                } else {
                    if (elements.errorSound) {
                        elements.errorSound.currentTime = 0;
                        elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                    }
                    showDialogue("Nada ocurre... qué bodrio.");
                }
                setTimeout(() => {
                    forceUnlockUI();
                    endPlayerTurn();
                }, 2000);
                break;

            case 'coin':
                gameCore.gameState.player.tp -= skillInfo.tp;
                updateHealthBars();

                if (elements.coinSound) {
                    elements.coinSound.currentTime = 0;
                    elements.coinSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                }

                const result = Math.random();

                if (result < 0.5) {
                    gameCore.gameState.player.damageBoost = 2;
                    showDialogue("¡Moneda de la suerte! +50% de daño por 2 turnos.");
                } else {
                    const damage = 5;
                    gameCore.gameState.player.hp -= damage;
                    if (gameCore.gameState.player.hp < 0) gameCore.gameState.player.hp = 0;
                    showDialogue("¡Mala suerte! La moneda te quita 5 HP.");
                    showAttackEffect('player', damage);
                }

                updateHealthBars();

                if (gameCore.gameState.player.hp <= 0) {
                    setTimeout(() => {
                        forceUnlockUI();
                        showGameOver(false);
                    }, 2000);
                    return;
                }

                setTimeout(() => {
                    forceUnlockUI();
                    endPlayerTurn();
                }, 2000);
                break;

            case 'summon':
                if (gameCore.gameState.ally.active) {
                    if (elements.errorSound) {
                        elements.errorSound.currentTime = 0;
                        elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                    }
                    showDialogue("¡Ya tienes un aliado en batalla!");
                    setTimeout(() => {
                        hideDialogue();
                        startPlayerTurn();
                    }, 2000);
                    return;
                }

                if (elements.summonSound) {
                    elements.summonSound.currentTime = 0;
                    elements.summonSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                }
                gameCore.gameState.player.tp -= skillInfo.tp;
                gameCore.gameState.ally.active = true;
                gameCore.gameState.ally.hp = 100;
                gameCore.gameState.ally.turns = 6;

                if (elements.ally) elements.ally.style.display = 'block';
                const allyStatus = document.getElementById('ally-status');
                if (allyStatus) allyStatus.style.display = 'block';
                if (elements.allyHealthText) elements.allyHealthText.textContent = "100/100";
                updateHealthBars();

                showDialogue("¡Invocas un aliado épico! Te ayudará por 6 turnos.");
                setTimeout(() => {
                    showDialogue("Pollolito: " + gameCore.getRandomLine(gameCore.POLLO_LINES.onAlly));
                    setTimeout(() => {
                        forceUnlockUI();
                        endPlayerTurn();
                    }, 2000);
                }, 2000);
                break;

            case 'fireboots':
                if (elements.fireSound) {
                    elements.fireSound.currentTime = 0;
                    elements.fireSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                }
                gameCore.gameState.player.tp -= skillInfo.tp;
                gameCore.gameState.enemy.burning = 2;

                showDialogue("¡Botas de fuego! Pollolito arderá por 2 turnos.");
                updateHealthBars();
                setTimeout(() => {
                    forceUnlockUI();
                    endPlayerTurn();
                }, 2000);
                break;

            case 'greenmode':
                if (elements.greenSound) {
                    elements.greenSound.currentTime = 0;
                    elements.greenSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                }
                gameCore.gameState.player.tp -= skillInfo.tp;
                gameCore.gameState.greenMode = !gameCore.gameState.greenMode;

                if (gameCore.gameState.greenMode) {
                    if (elements.battleUI) elements.battleUI.classList.add('green-mode');
                    if (elements.attackMenu) elements.attackMenu.classList.add('green-mode');
                    if (elements.skillMenu) elements.skillMenu.classList.add('green-mode');
                    if (elements.itemMenu) elements.itemMenu.classList.add('green-mode');
                    document.querySelectorAll('.status-container').forEach(el => el.classList.add('green-mode'));
                    showDialogue("¡Modo Verde activado! Interfaz mejorada.");
                } else {
                    if (elements.battleUI) elements.battleUI.classList.remove('green-mode');
                    if (elements.attackMenu) elements.attackMenu.classList.remove('green-mode');
                    if (elements.skillMenu) elements.skillMenu.classList.remove('green-mode');
                    if (elements.itemMenu) elements.itemMenu.classList.remove('green-mode');
                    document.querySelectorAll('.status-container').forEach(el => el.classList.remove('green-mode'));
                    showDialogue("¡Modo Verde desactivado!");
                }
                setTimeout(() => {
                    forceUnlockUI();
                    endPlayerTurn();
                }, 2000);
                break;

            case 'randomizer':
                gameCore.gameState.player.tp -= skillInfo.tp;
                const randomEffect = Math.floor(Math.random() * 5);

                switch (randomEffect) {
                    case 0:
                        gameCore.gameState.player.damageBoost = 3;
                        showEffectEmoji(gameCore.EFFECT_EMOJIS.positive[0], 'player');
                        showDialogue("¡Randomizador: +50% daño por 3 turnos!");
                        break;
                    case 1:
                        const healAmount = Math.floor(gameCore.gameState.player.maxHp * 0.5);
                        gameCore.gameState.player.hp += healAmount;
                        if (gameCore.gameState.player.hp > gameCore.gameState.player.maxHp) gameCore.gameState.player.hp = gameCore.gameState.player.maxHp;
                        showEffectEmoji(gameCore.EFFECT_EMOJIS.positive[1], 'player');
                        showDialogue(`¡Randomizador: +${healAmount} HP!`);
                        break;
                    case 2:
                        gameCore.gameState.player.poisoned = 3;
                        showEffectEmoji(gameCore.EFFECT_EMOJIS.negative[0], 'player');
                        showDialogue("¡Randomizador: ¡Envenenado por 3 turnos!");
                        break;
                    case 3:
                        gameCore.gameState.player.fatigue += 20;
                        showEffectEmoji(gameCore.EFFECT_EMOJIS.negative[1], 'player');
                        showDialogue("¡Randomizador: +20% de fatiga!");
                        break;
                    case 4:
                        gameCore.gameState.player.damageBoost = 2;
                        gameCore.gameState.player.skipTurn = true;
                        showEffectEmoji(gameCore.EFFECT_EMOJIS.random, 'player');
                        showDialogue("¡Randomizador: +30% daño pero pierdes el próximo turno!");
                        break;
                }

                gameCore.gameState.player.randomizerActive = true;
                updateHealthBars();
                setTimeout(() => endPlayerTurn(), 2000);
                break;

            case 'doubleGun':
                if (gameCore.gameState.player.tp < skillInfo.tp) {
                    if (elements.errorSound) {
                        elements.errorSound.currentTime = 0;
                        elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                    }
                    showDialogue("No tienes suficiente TP para Doble Pistola (40 TP)");
                    setTimeout(() => { hideDialogue(); startPlayerTurn(); }, 2000);
                    return;
                }

                gameCore.gameState.player.tp -= skillInfo.tp;
                const gunRoll = Math.random();

                if (gunRoll < 0.5) {
                    const damage = Math.floor(Math.random() * 61) + 40;
                    gameCore.gameState.enemy.hp -= damage;
                    if (gameCore.gameState.enemy.hp < 0) gameCore.gameState.enemy.hp = 0;

                    showEffectEmoji('🔫💥', 'enemy');
                    showAttackEffect('player', damage);
                    showDialogue(`¡Doble Pistola exitosa! ${damage} de daño.`);
                }
                else if (gunRoll < 0.7) {
                    showEffectEmoji('🔫❌', 'player');
                    showDialogue("¡Las pistolas se traban! Pierdes tu turno.");
                    gameCore.gameState.player.skipTurn = true;
                }
                else {
                    const selfDamage = Math.floor(Math.random() * 31) + 20;
                    gameCore.gameState.player.hp -= selfDamage;
                    if (gameCore.gameState.player.hp < 0) gameCore.gameState.player.hp = 0;

                    showEffectEmoji('💥🔥', 'player');
                    showAttackEffect('player', selfDamage);
                    showDialogue("¡CATÁSTROFE! Una pistola explota y te dañas.");
                }

                updateHealthBars();
                setTimeout(() => {
                    showDialogue("Pollolito: " + gameCore.getRandomLine(gameCore.POLLO_LINES.onGreenMode));
                    setTimeout(() => {
                        forceUnlockUI();
                        endPlayerTurn();
                    }, 2000);
                }, 2000);
                break;
        }
    } catch (error) {
        console.error("Error en useSkill:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

// OBJETOS
function useItem(item) {
    try {
        if (!gameCore.ITEMS[item]) {
            console.error("Objeto no válido:", item);
            return;
        }

        if (gameCore.gameState.player.actionTaken) {
            if (elements.errorSound) {
                elements.errorSound.currentTime = 0;
                elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            showDialogue("¡Ya realizaste una acción este turno!");
            setTimeout(() => hideDialogue(), 2000);
            return;
        }

        if (gameCore.gameState.items[item].uses <= 0) {
            if (elements.errorSound) {
                elements.errorSound.currentTime = 0;
                elements.errorSound.play().catch(e => console.log("Error al reproducir sonido:", e));
            }
            showDialogue("¡No te quedan usos de este objeto!");
            setTimeout(() => {
                hideDialogue();
                startPlayerTurn();
            }, 2000);
            return;
        }

        gameCore.gameState.player.actionTaken = true;
        disableUI();
        if (elements.itemSound) {
            elements.itemSound.currentTime = 0;
            elements.itemSound.play().catch(e => console.log("Error al reproducir sonido:", e));
        }

        switch (item) {
            case 'dogResidue':
                const results = [
                    { text: "¡Residuo mágico! Curación completa.", heal: gameCore.gameState.player.maxHp },
                    { text: "¡Buena suerte! Curación del 50%.", heal: Math.floor(gameCore.gameState.player.maxHp * 0.5) },
                    { text: "Curación decente. 2/4 de vida.", heal: Math.floor(gameCore.gameState.player.maxHp * 0.5) },
                    { text: "Solo un poco... +1 HP.", heal: 1 }
                ];

                const result = results[Math.floor(Math.random() * results.length)];
                gameCore.gameState.player.hp += result.heal;
                if (gameCore.gameState.player.hp > gameCore.gameState.player.maxHp) gameCore.gameState.player.hp = gameCore.gameState.player.maxHp;

                showDialogue(result.text);
                showHealEffect();
                break;

            case 'allyPotion':
                if (!gameCore.gameState.ally.active) {
                    showDialogue("No tienes aliado para curar.");
                    setTimeout(() => {
                        hideDialogue();
                        startPlayerTurn();
                    }, 2000);
                    return;
                }

                const healAmount = 30;
                gameCore.gameState.ally.hp += healAmount;
                if (gameCore.gameState.ally.hp > gameCore.gameState.ally.maxHp) gameCore.gameState.ally.hp = gameCore.gameState.ally.maxHp;

                showDialogue(`¡Poción aliada! +${healAmount} HP a tu aliado.`);
                break;

            case 'healthPotion':
                const healthAmount = 50;
                gameCore.gameState.player.hp += healthAmount;
                if (gameCore.gameState.player.hp > gameCore.gameState.player.maxHp) gameCore.gameState.player.hp = gameCore.gameState.player.maxHp;

                showDialogue(`¡Poción de salud! +${healthAmount} HP.`);
                showHealEffect();
                break;

            case 'tpPotion':
                const tpAmount = 30;
                gameCore.gameState.player.tp += tpAmount;
                if (gameCore.gameState.player.tp > gameCore.gameState.player.maxTp) gameCore.gameState.player.tp = gameCore.gameState.player.maxTp;

                showDialogue(`¡Poción de TP! +${tpAmount} TP.`);
                break;

            case 'shieldPotion':
                gameCore.gameState.player.shield = 50;
                gameCore.gameState.player.shieldTurns = 3;

                showDialogue(`¡Poción de escudo! 50% de reducción por 3 turnos.`);
                if (elements.defendSound) {
                    elements.defendSound.currentTime = 0;
                    elements.defendSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                }
                break;

            case 'firePotion':
                gameCore.gameState.enemy.burning = 3;

                showDialogue("¡Poción de fuego! Pollolito arderá por 3 turnos.");
                if (elements.fireSound) {
                    elements.fireSound.currentTime = 0;
                    elements.fireSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                }
                break;

            case 'icePotion':
                gameCore.gameState.enemy.frozen = 1;

                showDialogue("¡Poción de hielo! Pollolito se congela por 1 turno.");
                if (elements.iceSound) {
                    elements.iceSound.currentTime = 0;
                    elements.iceSound.play().catch(e => console.log("Error al reproducir sonido:", e));
                }
                break;

            case 'adrenalineShot':
                gameCore.gameState.items.adrenalineShot.uses--;
                const adrenalineEffect = Math.floor(Math.random() * 3);

                switch (adrenalineEffect) {
                    case 0:
                        gameCore.gameState.player.damageBoost = 2;
                        showEffectEmoji('💪', 'player');
                        showDialogue("¡Adrenalina: +30% daño por 2 turnos!");
                        break;
                    case 1:
                        gameCore.gameState.player.tp = Math.min(gameCore.gameState.player.tp + 50, gameCore.gameState.player.maxTp);
                        showEffectEmoji('⚡', 'player');
                        showDialogue("¡Adrenalina: +50 TP instantáneo!");
                        break;
                    case 2:
                        gameCore.gameState.player.invincible = 1;
                        showEffectEmoji('🛡️', 'player');
                        showDialogue("¡Adrenalina: Invencibilidad por 1 turno!");
                        break;
                }
        }

        gameCore.gameState.items[item].uses--;
        updateHealthBars();

        setTimeout(() => {
            updateHealthBars();
            setTimeout(() => {
                forceUnlockUI();
                endPlayerTurn();
            }, 1500);
        }, 1000);
    } catch (error) {
        console.error("Error en useItem:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

// ATAQUES DEL ENEMIGO
function startEnemyTurn() {
    try {
        if (gameCore.gameState.player.hp <= 0 || gameCore.gameState.enemy.hp <= 0) return;

        // Verificar si Pollolito está dormido
        if (gameCore.gameState.enemy.asleep > 0) {
            gameCore.gameState.enemy.asleep--;
            showDialogue(`Pollolito está dormido. Turnos restantes: ${gameCore.gameState.enemy.asleep + 1}`);

            setTimeout(() => {
                if (gameCore.gameState.enemy.asleep > 0) {
                    startPlayerTurn();
                } else {
                    showDialogue("¡Pollolito se despierta!");
                    setTimeout(() => {
                        selectEnemyAction();
                    }, 1500);
                }
            }, 2000);
            return;
        }

        if (gameCore.gameState.enemy.invincible > 0) {
            gameCore.gameState.enemy.invincible--;
            if (gameCore.gameState.enemy.invincible === 0) {
                showDialogue("¡La invencibilidad de Pollolito ha terminado!");
            }
        }

        selectEnemyAction();
    } catch (error) {
        console.error("Error en startEnemyTurn:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function selectEnemyAction() {
    try {
        let actions = ['basic', 'allstar', 'kick', 'deny', 'powerAttack'];
        let weights = [0.3, 0.15, 0.15, 0.1, 0.15];

        if (gameCore.gameState.enemy.healCooldown === 0) {
            actions.push('heal');
            weights.push(0.05);
        }

        if (gameCore.gameState.enemy.summonCooldown === 0) {
            actions.push('summonMinions');
            weights.push(0.05);
        }

        if (gameCore.gameState.enemy.invincibleCooldown === 0) {
            actions.push('invincible');
            weights.push(0.05);
        }

        if (!gameCore.gameState.enemy.finalAttackUsed && gameCore.gameState.enemy.hp / gameCore.gameState.enemy.maxHp <= 0.15) {
            actions.push('finalAttack');
            weights.push(0.1);
        }

        if (gameCore.gameState.enemy.defenseDown) weights[0] += 0.2;
        if (gameCore.gameState.player.tp > 50) weights[3] += 0.1;
        if (gameCore.gameState.enemy.angryMode) weights[0] += 0.1;
        if (gameCore.gameState.ally.active) weights[0] += 0.2;

        if (gameCore.gameState.enemy.hp / gameCore.gameState.enemy.maxHp < 0.3 && actions.includes('heal')) {
            const healIndex = actions.indexOf('heal');
            weights[healIndex] += 0.15;
        }

        const roll = Math.random();
        let action;
        let cumulativeWeight = 0;

        for (let i = 0; i < actions.length; i++) {
            cumulativeWeight += weights[i];
            if (roll < cumulativeWeight) {
                action = actions[i];
                break;
            }
        }

        switch (action) {
            case 'basic': enemyBasicAttack(); break;
            case 'allstar': enemyAllStar(); break;
            case 'kick': enemyKick(); break;
            case 'deny': enemyDeny(); break;
            case 'powerAttack': enemyPowerAttack(); break;
            case 'heal': enemyHeal(); break;
            case 'summonMinions': enemySummonMinions(); break;
            case 'invincible': enemyInvincible(); break;
            case 'finalAttack': enemyFinalAttack(); break;
            default: enemyBasicAttack(); break;
        }
    } catch (error) {
        console.error("Error en selectEnemyAction:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function enemyBasicAttack() {
    try {
        let damage = Math.floor(Math.random() * 16) + 15;

        if (gameCore.gameState.enemy.angryMode) {
            damage = Math.floor(damage * 1.5);
        }

        let target = gameCore.gameState.ally.active ? 'ally' : 'player';

        let finalDamage = Math.floor(damage * (1 - (gameCore.gameState.player.shield / 100)));
        if (target === 'player' && gameCore.gameState.player.defending) {
            finalDamage = Math.floor(finalDamage * (1 - gameCore.gameState.player.defenseBoost));
        }

        if (target === 'player' && gameCore.gameState.player.invincible > 0) {
            showDialogue("¡Eres invencible! El ataque no tiene efecto.");
            setTimeout(() => {
                forceUnlockUI();
                startPlayerTurn();
            }, 2000);
            return;
        }

        if (target === 'player') {
            finalDamage = Math.floor(finalDamage * (1 + (gameCore.gameState.player.fatigue * 0.03)));
        }

        if (target === 'ally') {
            gameCore.gameState.ally.hp -= finalDamage;
            if (gameCore.gameState.ally.hp < 0) gameCore.gameState.ally.hp = 0;
            showAttackEffect('enemy', finalDamage, 'ally');
            showDialogue(`¡Pollolito ataca a tu aliado! ${finalDamage} de daño.`);
        } else {
            gameCore.gameState.player.hp -= finalDamage;
            if (gameCore.gameState.player.hp < 0) gameCore.gameState.player.hp = 0;
            showAttackEffect('enemy', finalDamage);
            showDialogue(`¡Picotazo de Pollolito! ${finalDamage} de daño.`);
        }

        updateHealthBars();

        if (gameCore.gameState.player.hp <= 0) {
            setTimeout(() => {
                forceUnlockUI();
                showGameOver(false);
            }, 2000);
            return;
        }

        if (gameCore.gameState.ally.active && gameCore.gameState.ally.hp <= 0) {
            gameCore.gameState.ally.active = false;
            if (elements.ally) elements.ally.style.display = 'none';
            const allyStatus = document.getElementById('ally-status');
            if (allyStatus) allyStatus.style.display = 'none';
            setTimeout(() => {
                showDialogue("¡Tu aliado ha sido derrotado!");
                setTimeout(() => {
                    forceUnlockUI();
                    startPlayerTurn();
                }, 2000);
            }, 2000);
            return;
        }

        setTimeout(() => {
            forceUnlockUI();
            startPlayerTurn();
        }, 2000);
    } catch (error) {
        console.error("Error en enemyBasicAttack:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function enemyAllStar() {
    try {
        let damage = 25;

        if (gameCore.gameState.enemy.angryMode) {
            damage = Math.floor(damage * 1.7);
        }

        showDialogue("¡Pollolito lanza objetos de All Star!");

        setTimeout(() => {
            let target = gameCore.gameState.ally.active ? 'ally' : 'player';

            let finalDamage = Math.floor(damage * (1 - (gameCore.gameState.player.shield / 100)));
            if (target === 'player' && gameCore.gameState.player.defending) {
                finalDamage = Math.floor(finalDamage * (1 - gameCore.gameState.player.defenseBoost));
            }

            if (target === 'player' && gameCore.gameState.player.invincible > 0) {
                showDialogue("¡Eres invencible! El ataque no tiene efecto.");
                setTimeout(() => {
                    forceUnlockUI();
                    startPlayerTurn();
                }, 2002);
                return;
            }

            if (target === 'ally') {
                gameCore.gameState.ally.hp -= finalDamage;
                if (gameCore.gameState.ally.hp < 0) gameCore.gameState.ally.hp = 0;
                showAttackEffect('enemy', finalDamage, 'ally');
                showDialogue(`¡Objetos de All Star golpean a tu aliado! ${finalDamage} de daño.`);
            } else {
                gameCore.gameState.player.hp -= finalDamage;
                if (gameCore.gameState.player.hp < 0) gameCore.gameState.player.hp = 0;
                showAttackEffect('enemy', finalDamage);
                showDialogue(`¡Objetos de All Star te golpean! ${finalDamage} de daño.`);
            }

            updateHealthBars();

            if (gameCore.gameState.player.hp <= 0) {
                setTimeout(() => {
                    forceUnlockUI();
                    showGameOver(false);
                }, 2000);
                return;
            }

            if (gameCore.gameState.ally.active && gameCore.gameState.ally.hp <= 0) {
                gameCore.gameState.ally.active = false;
                if (elements.ally) elements.ally.style.display = 'none';
                const allyStatus = document.getElementById('ally-status');
                if (allyStatus) allyStatus.style.display = 'none';
                setTimeout(() => {
                    showDialogue("¡Tu aliado ha sido derrotado!");
                    setTimeout(() => {
                        forceUnlockUI();
                        startPlayerTurn();
                    }, 2000);
                }, 2000);
                return;
            }

            setTimeout(() => {
                forceUnlockUI();
                startPlayerTurn();
            }, 2000);
        }, 1200);
    } catch (error) {
        console.error("Error en enemyAllStar:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function enemyKick() {
    try {
        if (Math.random() < 0.5) {
            let damage = 60;

            if (gameCore.gameState.enemy.angryMode) {
                damage = Math.floor(damage * 1.6);
            }

            let target = gameCore.gameState.ally.active ? 'ally' : 'player';

            let finalDamage = Math.floor(damage * (1 - (gameCore.gameState.player.shield / 100)));
            if (target === 'player' && gameCore.gameState.player.defending) {
                finalDamage = Math.floor(finalDamage * (1 - gameCore.gameState.player.defenseBoost));
            }

            if (target === 'player' && gameCore.gameState.player.invincible > 0) {
                showDialogue("¡Eres invencible! El ataque no tiene efecto.");
                setTimeout(() => {
                    forceUnlockUI();
                    startPlayerTurn();
                }, 2000);
                return;
            }

            if (target === 'ally') {
                gameCore.gameState.ally.hp -= finalDamage;
                if (gameCore.gameState.ally.hp < 0) gameCore.gameState.ally.hp = 0;
                showAttackEffect('enemy', finalDamage, 'ally');
                showDialogue("¡Patear azulitos a tu aliado! " + finalDamage + " de daño.");
            } else {
                gameCore.gameState.player.hp -= finalDamage;
                if (gameCore.gameState.player.hp < 0) gameCore.gameState.player.hp = 0;
                showAttackEffect('enemy', finalDamage);
                showDialogue("¡Patear azulitos! " + finalDamage + " de daño.");
            }

            updateHealthBars();

            if (gameCore.gameState.player.hp <= 0) {
                setTimeout(() => {
                    forceUnlockUI();
                    showGameOver(false);
                }, 2000);
                return;
            }

            if (gameCore.gameState.ally.active && gameCore.gameState.ally.hp <= 0) {
                gameCore.gameState.ally.active = false;
                if (elements.ally) elements.ally.style.display = 'none';
                const allyStatus = document.getElementById('ally-status');
                if (allyStatus) allyStatus.style.display = 'none';
                setTimeout(() => {
                    showDialogue("¡Tu aliado ha sido derrotado!");
                    setTimeout(() => {
                        forceUnlockUI();
                        startPlayerTurn();
                    }, 2000);
                }, 2000);
                return;
            }
        } else {
            gameCore.gameState.enemy.defenseDown = true;
            showDialogue("¡Pollolito falla el patear azulitos! Su defensa baja.");
            if (elements.enemy) {
                elements.enemy.classList.add('shake');
                setTimeout(() => {
                    elements.enemy.classList.remove('shake');
                }, 500);
            }
        }

        setTimeout(() => {
            forceUnlockUI();
            startPlayerTurn();
        }, 2000);
    } catch (error) {
        console.error("Error en enemyKick:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function enemyDeny() {
    try {
        showDialogue("Pollolito se prepara para negar tu próximo épico...");
        setTimeout(() => {
            hideDialogue();
            forceUnlockUI();
            startPlayerTurn();
        }, 2000);
    } catch (error) {
        console.error("Error en enemyDeny:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function enemyPowerAttack() {
    try {
        let damage = Math.floor(Math.random() * 21) + 30;

        if (gameCore.gameState.enemy.angryMode) {
            damage = Math.floor(damage * 1.8);
        }

        showDialogue("¡Pollolito prepara un ataque potente!");

        setTimeout(() => {
            if (gameCore.gameState.player.defending) {
                damage = Math.floor(damage * 0.3);
                gameCore.gameState.enemy.defenseDown = true;
                showDialogue("¡Defendiste bien! Pollolito pierde defensa.");
            }

            let finalDamage = Math.floor(damage * (1 - (gameCore.gameState.player.shield / 100)));

            if (gameCore.gameState.player.invincible > 0) {
                showDialogue("¡Eres invencible! El ataque no tiene efecto.");
                setTimeout(() => {
                    forceUnlockUI();
                    startPlayerTurn();
                }, 2000);
                return;
            }

            gameCore.gameState.player.hp -= finalDamage;
            if (gameCore.gameState.player.hp < 0) gameCore.gameState.player.hp = 0;

            showAttackEffect('enemy', finalDamage);
            showDialogue(`¡Ataque potente de Pollolito! ${finalDamage} de daño.`);
            updateHealthBars();

            if (gameCore.gameState.player.hp <= 0) {
                setTimeout(() => {
                    forceUnlockUI();
                    showGameOver(false);
                }, 2000);
                return;
            }

            setTimeout(() => {
                forceUnlockUI();
                startPlayerTurn();
            }, 2000);
        }, 1500);
    } catch (error) {
        console.error("Error en enemyPowerAttack:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function enemyHeal() {
    try {
        if (gameCore.gameState.enemy.healCooldown > 0) {
            enemyBasicAttack();
            return;
        }

        const healAmount = Math.floor(gameCore.gameState.enemy.maxHp * (0.15 + Math.random() * 0.1));
        gameCore.gameState.enemy.hp += healAmount;
        if (gameCore.gameState.enemy.hp > gameCore.gameState.enemy.maxHp) gameCore.gameState.enemy.hp = gameCore.gameState.enemy.maxHp;

        gameCore.gameState.enemy.healCooldown = 4;

        showDialogue("¡Pollolito usa curación épica! +" + healAmount + " HP.");
        showDialogue("Pollolito: " + gameCore.getRandomLine(gameCore.POLLO_LINES.onHeal));

        if (elements.healSound) {
            elements.healSound.currentTime = 0;
            elements.healSound.play().catch(e => console.log("Error al reproducir sonido:", e));
        }
        updateHealthBars();

        setTimeout(() => {
            forceUnlockUI();
            startPlayerTurn();
        }, 2000);
    } catch (error) {
        console.error("Error en enemyHeal:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function enemySummonMinions() {
    try {
        if (gameCore.gameState.enemy.summonCooldown > 0) {
            enemyBasicAttack();
            return;
        }

        gameCore.gameState.enemy.summonCooldown = 5;

        let summoned = 0;
        gameCore.gameState.enemyMinions.forEach(minion => {
            if (!minion.active && summoned < 2) {
                minion.active = true;
                minion.hp = 8;
                minion.turns = 3;
                summoned++;

                const minionElement = document.getElementById(`enemy-minion${minion.id}`);
                const healthElement = document.getElementById(`enemy-minion${minion.id}-health`);
                const healthFillElement = document.getElementById(`enemy-minion${minion.id}-health-fill`);
                
                if (minionElement) minionElement.style.display = 'block';
                if (healthElement) healthElement.style.display = 'block';
                if (healthFillElement) healthFillElement.style.width = '100%';
            }
        });

        showDialogue("¡Pollolito invoca minions kamikaze!");
        showDialogue("Pollolito: " + gameCore.getRandomLine(gameCore.POLLO_LINES.onSummonMinions));
        if (elements.minionSound) {
            elements.minionSound.currentTime = 0;
            elements.minionSound.play().catch(e => console.log("Error al reproducir sonido:", e));
        }

        setTimeout(() => {
            let totalDamage = 0;
            gameCore.gameState.enemyMinions.forEach(minion => {
                if (minion.active) {
                    const damage = 3;
                    gameCore.gameState.player.hp -= damage;
                    totalDamage += damage;
                    showAttackEffect('enemy', damage);
                }
            });

            if (totalDamage > 0) {
                showDialogue(`¡Los minions de Pollolito atacan! ${totalDamage} de daño total.`);
                updateHealthBars();

                if (gameCore.gameState.player.hp <= 0) {
                    setTimeout(() => {
                        forceUnlockUI();
                        showGameOver(false);
                    }, 2000);
                    return;
                }
            }

            setTimeout(() => {
                forceUnlockUI();
                startPlayerTurn();
            }, 2000);
        }, 2000);
    } catch (error) {
        console.error("Error en enemySummonMinions:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function enemyInvincible() {
    try {
        if (gameCore.gameState.enemy.invincibleCooldown > 0) {
            enemyBasicAttack();
            return;
        }

        gameCore.gameState.enemy.invincible = 1;
        gameCore.gameState.enemy.invincibleCooldown = 6;

        showDialogue("¡Pollolito se vuelve invencible por 1 turno!");
        showDialogue("Pollolito: " + gameCore.getRandomLine(gameCore.POLLO_LINES.onInvincible));
        if (elements.invincibleSound) {
            elements.invincibleSound.currentTime = 0;
            elements.invincibleSound.play().catch(e => console.log("Error al reproducir sonido:", e));
        }

        setTimeout(() => {
            forceUnlockUI();
            startPlayerTurn();
        }, 2000);
    } catch (error) {
        console.error("Error en enemyInvincible:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

function enemyFinalAttack() {
    try {
        gameCore.gameState.enemy.finalAttackUsed = true;

        showDialogue("¡Pollolito prepara su ATAQUE DEFINITIVO!");
        showDialogue("Pollolito: " + gameCore.getRandomLine(gameCore.POLLO_LINES.onFinalAttack));

        if (elements.finalSound) {
            elements.finalSound.currentTime = 0;
            elements.finalSound.play().catch(e => console.log("Error al reproducir sonido:", e));
        }

        setTimeout(() => {
            let damage = 100;

            if (gameCore.gameState.player.defending) {
                damage = Math.floor(damage * 0.3);
            }

            damage = Math.floor(damage * (1 - (gameCore.gameState.player.shield / 100)));

            if (gameCore.gameState.player.invincible > 0) {
                showDialogue("¡Eres invencible! El ataque no tiene efecto.");
                setTimeout(() => {
                    forceUnlockUI();
                    startPlayerTurn();
                }, 2000);
                return;
            }

            gameCore.gameState.player.hp -= damage;
            if (gameCore.gameState.player.hp < 0) gameCore.gameState.player.hp = 0;

            showAttackEffect('enemy', damage);
            showDialogue(`¡ATAQUE DEFINITIVO DE POLLOLITO! ${damage} de daño.`);
            updateHealthBars();

            if (gameCore.gameState.player.hp <= 0) {
                setTimeout(() => {
                    forceUnlockUI();
                    showGameOver(false);
                }, 2000);
                return;
            }

            setTimeout(() => {
                forceUnlockUI();
                startPlayerTurn();
            }, 2000);
        }, 2000);
    } catch (error) {
        console.error("Error en enemyFinalAttack:", error);
        forceUnlockUI();
        setTimeout(startPlayerTurn, 1000);
    }
}

// FIN DEL JUEGO
function showGameOver(playerWon) {
    try {
        disableUI();
        if (elements.endScreen) {
            elements.endScreen.style.display = 'flex';

            if (playerWon) {
                elements.endScreen.innerHTML = `
                    <h1>¡VICTORIA ÉPICA!</h1>
                    <p>Has derrotado a Pollolito. ¡Eres un verdadero programador épico!</p>
                    <button onclick="location.reload()">Jugar de nuevo</button>
                `;
            } else {
                elements.endScreen.innerHTML = `
                    <h1>¡DERROTA BODRIA!</h1>
                    <p>Pollolito te ha derrotado. ¡Necesitas más práctica en programación!</p>
                    <button onclick="location.reload()">Reintentar</button>
                `;
            }
        }
    } catch (error) {
        console.error("Error en showGameOver:", error);
        location.reload();
    }
}

// FUNCIONES DE UI
function enableUI() {
    try {
        resetUiBlockedTimer();
        document.querySelectorAll('.action-button, .submenu-button').forEach(button => {
            button.disabled = false;
        });
    } catch (error) {
        console.error("Error en enableUI:", error);
        forceUnlockUI();
    }
}

function disableUI() {
    try {
        document.querySelectorAll('.action-button, .submenu-button').forEach(button => {
            button.disabled = true;
        });
    } catch (error) {
        console.error("Error en disableUI:", error);
    }
}

function showMainMenu() {
    try {
        if (elements.attackMenu) elements.attackMenu.style.display = 'none';
        if (elements.skillMenu) elements.skillMenu.style.display = 'none';
        if (elements.itemMenu) elements.itemMenu.style.display = 'none';
        if (elements.battleUI) elements.battleUI.style.display = 'block';
    } catch (error) {
        console.error("Error en showMainMenu:", error);
    }
}

function showAttackMenu() {
    try {
        if (elements.attackMenu) elements.attackMenu.style.display = 'flex';
        if (elements.skillMenu) elements.skillMenu.style.display = 'none';
        if (elements.itemMenu) elements.itemMenu.style.display = 'none';
        if (elements.battleUI) elements.battleUI.style.display = 'none';
    } catch (error) {
        console.error("Error en showAttackMenu:", error);
    }
}

function showSkillMenu() {
    try {
        if (elements.attackMenu) elements.attackMenu.style.display = 'none';
        if (elements.skillMenu) elements.skillMenu.style.display = 'flex';
        if (elements.itemMenu) elements.itemMenu.style.display = 'none';
        if (elements.battleUI) elements.battleUI.style.display = 'none';
    } catch (error) {
        console.error("Error en showSkillMenu:", error);
    }
}

function showItemMenu() {
    try {
        if (elements.attackMenu) elements.attackMenu.style.display = 'none';
        if (elements.skillMenu) elements.skillMenu.style.display = 'none';
        if (elements.itemMenu) elements.itemMenu.style.display = 'flex';
        if (elements.battleUI) elements.battleUI.style.display = 'none';
    } catch (error) {
        console.error("Error en showItemMenu:", error);
    }
}

function backToMainMenu() {
    try {
        showMainMenu();
    } catch (error) {
        console.error("Error en backToMainMenu:", error);
    }
}

// FUNCIÓN DE MÚSICA
function toggleMusic(enable) {
    try {
        gameCore.gameState.musicEnabled = enable !== undefined ? enable : !gameCore.gameState.musicEnabled;
        if (elements.musicToggle) {
            elements.musicToggle.textContent = `Música: ${gameCore.gameState.musicEnabled ? 'ON' : 'OFF'}`;
        }

        if (gameCore.gameState.musicEnabled) {
            if (gameCore.gameState.enemy.angryMode) {
                if (elements.bgMusic) elements.bgMusic.pause();
                if (elements.angryMusic) {
                    elements.angryMusic.currentTime = 0;
                    elements.angryMusic.play().catch(e => console.log("Auto-play prevented:", e));
                }
            } else {
                if (elements.angryMusic) elements.angryMusic.pause();
                if (elements.bgMusic) {
                    elements.bgMusic.play().catch(e => console.log("Auto-play prevented:", e));
                }
            }
        } else {
            if (elements.bgMusic) elements.bgMusic.pause();
            if (elements.angryMusic) elements.angryMusic.pause();
        }
    } catch (error) {
        console.error("Error en toggleMusic:", error);
    }
}

// DEBUG Y MONITOREO
function updateDebugInfo() {
    try {
        const now = performance.now();
        gameCore.gameState.debug.frameCount++;

        if (now >= gameCore.gameState.debug.lastFpsUpdate + 1000) {
            gameCore.gameState.debug.fps = Math.round((gameCore.gameState.debug.frameCount * 1000) / (now - gameCore.gameState.debug.lastFpsUpdate));
            gameCore.gameState.debug.frameCount = 0;
            gameCore.gameState.debug.lastFpsUpdate = now;

            if (elements.debugInfo) {
                elements.debugInfo.textContent = `Build 0.2 | FPS: ${gameCore.gameState.debug.fps}`;
            }
        }

        requestAnimationFrame(updateDebugInfo);
    } catch (error) {
        console.error("Error en updateDebugInfo:", error);
    }
}

// INICIALIZACIÓN DEL JUEGO
function initGame() {
    try {
        // Simular carga de recursos
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += 5;
            if (elements.loadingProgress) {
                elements.loadingProgress.style.width = `${progress}%`;
            }
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                if (elements.loadingScreen) {
                    elements.loadingScreen.style.display = 'none';
                }
                if (elements.gameContainer) {
                    elements.gameContainer.style.display = 'block';
                }
                startGame();
            }
        }, 100);
    } catch (error) {
        console.error("Error en initGame:", error);
    }
}

function startGame() {
    if (elements.musicToggle) {
        elements.musicToggle.addEventListener('click', () => toggleMusic());
    }

    toggleMusic(true);
    updateHealthBars();

    gameCore.gameState.debug.lastFrameTime = performance.now();
    gameCore.gameState.debug.lastFpsUpdate = gameCore.gameState.debug.lastFrameTime;
    updateDebugInfo();

    showDialogue("¡Pollolito aparece! ¡Prepárate para una batalla ÉPICA!");
    setTimeout(() => {
        showDialogue("Pollolito: " + gameCore.getRandomLine(gameCore.POLLO_LINES.taunts));
        setTimeout(() => {
            hideDialogue();
            startPlayerTurn();
        }, 3000);
    }, 2000);
}

// DETECCIÓN DE DISPOSITIVO
window.addEventListener('DOMContentLoaded', () => {
    try {
        gameCore.gameState.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (gameCore.gameState.isMobile) {
            const checkOrientation = () => {
                const warning = document.getElementById('mobile-warning');
                if (warning) {
                    if (window.innerHeight > window.innerWidth) {
                        warning.style.display = 'flex';
                    } else {
                        warning.style.display = 'none';
                        initGame();
                    }
                }
            };

            checkOrientation();
            window.addEventListener('resize', checkOrientation);
        } else {
            initGame();
        }
    } catch (error) {
        console.error("Error en DOMContentLoaded:", error);
        forceUnlockUI();
        setTimeout(initGame, 1000);
    }
});

// Exportar funciones para gamepad.js
window.gameFunctions = {
    showMainMenu,
    showAttackMenu,
    showSkillMenu,
    showItemMenu,
    backToMainMenu,
    playerAttack,
    useSkill,
    useItem,
    playerDefend,
    gameState: gameCore.gameState,
    elements
};