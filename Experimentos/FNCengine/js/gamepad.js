document.addEventListener('DOMContentLoaded', () => {
    try {
        const checkGameFunctions = () => {
            if (!window.gameFunctions) {
                setTimeout(checkGameFunctions, 100);
                return;
            }

            const { 
                showMainMenu,
                showAttackMenu,
                showSkillMenu,
                showItemMenu,
                backToMainMenu,
                playerAttack,
                useSkill,
                useItem,
                playerDefend,
                gameState,
                elements
            } = window.gameFunctions;

            function handleTouch(e) {
                try {
                    e.preventDefault();
                    const touch = e.changedTouches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    
                    if (element && (element.tagName === 'BUTTON' || element.closest('button'))) {
                        const button = element.tagName === 'BUTTON' ? element : element.closest('button');
                        if (!button.disabled && !gameState.uiBlocked && !gameState.precisionGameActive) {
                            button.classList.add('button-pressed');
                            setTimeout(() => button.classList.remove('button-pressed'), 200);
                            button.click();
                        }
                    }
                } catch (error) {
                    console.error("Error en handleTouch:", error);
                }
            }

            function handleAction(e) {
                try {
                    e.preventDefault();
                    const button = e.target.closest('button');
                    if (!button || button.disabled || gameState.uiBlocked || gameState.precisionGameActive) return;

                    button.classList.add('button-pressed');
                    setTimeout(() => button.classList.remove('button-pressed'), 200);

                    const action = button.dataset.action;
                    const type = button.dataset.type || button.dataset.skill || button.dataset.item;

                    // Efectos especiales para habilidades
                    if (action === 'useSkill' && (type === 'randomizer' || type === 'doubleGun')) {
                        button.style.boxShadow = '0 0 15px gold';
                        setTimeout(() => {
                            button.style.boxShadow = '';
                        }, 500);
                    }

                    if (action === 'useItem' && type === 'adrenalineShot') {
                        button.classList.add('pulse-effect');
                        setTimeout(() => {
                            button.classList.remove('pulse-effect');
                        }, 500);
                    }

                    switch (action) {
                        case 'showAttackMenu': showAttackMenu(); break;
                        case 'showSkillMenu': showSkillMenu(); break;
                        case 'showItemMenu': showItemMenu(); break;
                        case 'backToMainMenu': backToMainMenu(); break;
                        case 'attack': playerAttack(type); break;
                        case 'useSkill': useSkill(type); break;
                        case 'useItem': useItem(type); break;
                        case 'defend': playerDefend(); break;
                        default: console.warn("Acción no reconocida:", action);
                    }
                } catch (error) {
                    console.error("Error en handleAction:", error);
                }
            }

            function configureListeners() {
                // Usar event delegation para manejar todos los clicks
                document.body.addEventListener('click', handleAction);
                document.body.addEventListener('touchstart', handleTouch, { passive: false });
                
                // Limpiar cualquier listener previo
                const battleUI = document.getElementById('battle-ui');
                if (battleUI) {
                    battleUI.removeEventListener('click', handleAction);
                    battleUI.removeEventListener('touchstart', handleTouch);
                }

                document.querySelectorAll('.submenu').forEach(menu => {
                    menu.removeEventListener('click', handleAction);
                    menu.removeEventListener('touchstart', handleTouch);
                });

                const precisionGame = document.getElementById('precision-game');
                if (precisionGame) {
                    precisionGame.removeEventListener('click', handleAction);
                    precisionGame.removeEventListener('touchstart', handleTouch);
                }

                const dialogueBox = document.getElementById('dialogue-box');
                if (dialogueBox) {
                    dialogueBox.removeEventListener('click', handleAction);
                    dialogueBox.removeEventListener('touchstart', handleTouch);
                }
            }

            // Configuración inicial
            configureListeners();

            // Verificar si los elementos están listos
            const checkElements = () => {
                if (document.getElementById('battle-ui') && 
                    document.getElementById('attack-menu') && 
                    document.getElementById('skill-menu') && 
                    document.getElementById('item-menu')) {
                    configureListeners();
                } else {
                    setTimeout(checkElements, 100);
                }
            };

            checkElements();
        };

        checkGameFunctions();
    } catch (error) {
        console.error("Error en la inicialización de gamepad.js:", error);
    }
});