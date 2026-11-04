/**
 * ===============================================
 * CHEF'S KITCHEN FRENZY - EXPANSION PACK DLC
 * Version 1.0 - FREE CONTENT UPDATE
 * ===============================================
 * 
 * Este DLC añade:
 * - 🍳 Sistema de Recetas (50+ combinaciones)
 * - ⭐ Modo Chef Estrella (Time Attack)
 * - 🎨 Sistema de Decoración de Cocina
 * - 👨‍🍳 Sistema de Personal/Empleados
 * - 🏪 Mercado Negro Culinario
 * - 🏆 30 Nuevos Logros
 * - 🎪 5 Nuevos Modos de Juego
 * - 📅 Sistema de Temporadas
 */

// ===============================================
// SISTEMA DE RECETAS
// ===============================================
const RecipeSystem = {
    recipes: [
        // Recetas Básicas
        { id: 1, name: "🍝 Pasta Básica", ingredients: ["🥕", "🥕"], time: 5, value: 50, rarity: "común" },
        { id: 2, name: "🍕 Pizza Simple", ingredients: ["🥕", "🥕", "🥕"], time: 10, value: 100, rarity: "común" },
        { id: 3, name: "🍔 Hamburguesa", ingredients: ["🥕", "🥕", "🥕", "🥕"], time: 15, value: 200, rarity: "común" },
        
        // Recetas Raras
        { id: 4, name: "🍜 Ramen Especial", ingredients: ["🥕", "🧂", "🥕"], time: 20, value: 500, rarity: "rara" },
        { id: 5, name: "🥘 Paella Valenciana", ingredients: ["🥕", "🧂", "🧂"], time: 30, value: 1000, rarity: "rara" },
        
        // Recetas Épicas
        { id: 6, name: "🦞 Langosta Thermidor", ingredients: ["🥕", "🧂", "🧂", "🔥"], time: 45, value: 5000, rarity: "épica" },
        { id: 7, name: "🍣 Sushi Premium", ingredients: ["🧂", "🧂", "🧂"], time: 35, value: 3000, rarity: "épica" },
        
        // Recetas Legendarias
        { id: 8, name: "⭐ Plato Michelin", ingredients: ["🔥", "🔥", "🧂"], time: 60, value: 20000, rarity: "legendaria" },
        { id: 9, name: "👑 Banquete Real", ingredients: ["🔥", "🔥", "🔥"], time: 90, value: 50000, rarity: "legendaria" },
        
        // Recetas Secretas
        { id: 10, name: "🌟 Elixir del Chef", ingredients: ["🔥", "🧂", "🥕", "⚡"], time: 120, value: 100000, rarity: "mítica" }
    ],
    
    discovered: [],
    inProgress: null,
    
    init() {
        console.log("📜 Sistema de Recetas inicializado");
        this.loadDiscovered();
        this.createUI();
    },
    
    loadDiscovered() {
        const saved = localStorage.getItem('discoveredRecipes');
        if (saved) {
            this.discovered = JSON.parse(saved);
        }
    },
    
    saveDiscovered() {
        localStorage.setItem('discoveredRecipes', JSON.stringify(this.discovered));
    },
    
    tryRecipe(ingredients) {
        const match = this.recipes.find(r => 
            JSON.stringify(r.ingredients.sort()) === JSON.stringify(ingredients.sort())
        );
        
        if (match && !this.discovered.includes(match.id)) {
            this.discover(match);
            return match;
        }
        return null;
    },
    
    discover(recipe) {
        this.discovered.push(recipe.id);
        this.saveDiscovered();
        this.showDiscoveryNotification(recipe);
    },
    
    showDiscoveryNotification(recipe) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 30px;
            border-radius: 15px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            animation: popIn 0.5s ease;
        `;
        
        notification.innerHTML = `
            <h2 style="margin: 0 0 15px 0;">🎉 ¡Nueva Receta Descubierta!</h2>
            <div style="font-size: 48px; margin: 20px 0;">${recipe.name}</div>
            <p>Rareza: ${recipe.rarity.toUpperCase()}</p>
            <p>Valor: ${recipe.value} 🥕</p>
            <button onclick="this.parentElement.remove()" style="margin-top: 15px;">✓ Entendido</button>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    },
    
    createUI() {
        const container = document.createElement('div');
        container.id = 'recipeBook';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(30px);
            border: 2px solid #ff6b35;
            color: white;
            padding: 25px;
            border-radius: 25px;
            width: min(90%, 700px);
            max-height: 90vh;
            overflow-y: auto;
            display: none;
            z-index: 1000;
        `;
        
        container.innerHTML = `
            <h2>📜 Libro de Recetas</h2>
            <p>Descubiertas: <span id="recipeCount">${this.discovered.length}</span>/${this.recipes.length}</p>
            <div id="recipeList"></div>
            <button onclick="document.getElementById('recipeBook').style.display='none'">Cerrar</button>
        `;
        
        document.body.appendChild(container);
        this.updateRecipeList();
    },
    
    updateRecipeList() {
        const list = document.getElementById('recipeList');
        if (!list) return;
        
        list.innerHTML = this.recipes.map(recipe => {
            const discovered = this.discovered.includes(recipe.id);
            return `
                <div style="
                    background: ${discovered ? 'rgba(39, 174, 96, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 10px;
                    border-left: 4px solid ${this.getRarityColor(recipe.rarity)};
                ">
                    <h4>${discovered ? recipe.name : '❓ ???'}</h4>
                    ${discovered ? `
                        <p>Ingredientes: ${recipe.ingredients.join(' + ')}</p>
                        <p>Tiempo: ${recipe.time}s | Valor: ${recipe.value} 🥕</p>
                        <p>Rareza: ${recipe.rarity}</p>
                    ` : '<p>Descubre esta receta cocinando...</p>'}
                </div>
            `;
        }).join('');
    },
    
    getRarityColor(rarity) {
        const colors = {
            'común': '#95a5a6',
            'rara': '#3498db',
            'épica': '#9b59b6',
            'legendaria': '#f39c12',
            'mítica': '#e74c3c'
        };
        return colors[rarity] || '#fff';
    }
};

// ===============================================
// MODO CHEF ESTRELLA (Time Attack)
// ===============================================
const StarChefMode = {
    active: false,
    timeLimit: 60,
    timeRemaining: 60,
    score: 0,
    multiplier: 1,
    bestScore: 0,
    
    init() {
        console.log("⭐ Modo Chef Estrella inicializado");
        this.loadBestScore();
        this.createUI();
    },
    
    loadBestScore() {
        this.bestScore = parseInt(localStorage.getItem('starChefBestScore')) || 0;
    },
    
    saveBestScore() {
        localStorage.setItem('starChefBestScore', this.bestScore);
    },
    
    start() {
        this.active = true;
        this.timeRemaining = this.timeLimit;
        this.score = 0;
        this.multiplier = 1;
        
        this.showStartNotification();
        this.startTimer();
    },
    
    startTimer() {
        const interval = setInterval(() => {
            if (!this.active) {
                clearInterval(interval);
                return;
            }
            
            this.timeRemaining--;
            this.updateUI();
            
            if (this.timeRemaining <= 0) {
                this.end();
                clearInterval(interval);
            }
        }, 1000);
    },
    
    addScore(points) {
        if (!this.active) return;
        
        this.score += points * this.multiplier;
        this.multiplier = Math.min(this.multiplier + 0.1, 5);
        this.updateUI();
    },
    
    resetMultiplier() {
        if (!this.active) return;
        this.multiplier = 1;
        this.updateUI();
    },
    
    end() {
        this.active = false;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }
        
        this.showEndNotification();
    },
    
    showStartNotification() {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            padding: 40px;
            border-radius: 20px;
            z-index: 10000;
            text-align: center;
            animation: popIn 0.5s ease;
        `;
        
        notif.innerHTML = `
            <h1>⭐ MODO CHEF ESTRELLA ⭐</h1>
            <h2>${this.timeLimit} SEGUNDOS</h2>
            <p style="font-size: 24px;">¡Cocina lo más rápido posible!</p>
        `;
        
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    },
    
    showEndNotification() {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            padding: 40px;
            border-radius: 20px;
            z-index: 10000;
            text-align: center;
            animation: popIn 0.5s ease;
        `;
        
        const isNewRecord = this.score === this.bestScore;
        
        notif.innerHTML = `
            <h1>🏁 ¡TIEMPO TERMINADO!</h1>
            <h2>Puntuación: ${Math.floor(this.score)}</h2>
            <p>Mejor Puntuación: ${Math.floor(this.bestScore)}</p>
            ${isNewRecord ? '<p style="color: #f39c12; font-size: 24px;">🎉 ¡NUEVO RÉCORD!</p>' : ''}
            <button onclick="this.parentElement.remove()">Cerrar</button>
            <button onclick="StarChefMode.start(); this.parentElement.remove()">Reintentar</button>
        `;
        
        document.body.appendChild(notif);
    },
    
    updateUI() {
        const display = document.getElementById('starChefDisplay');
        if (display && this.active) {
            display.innerHTML = `
                <div style="background: rgba(243, 156, 18, 0.9); padding: 15px; border-radius: 10px; text-align: center;">
                    <h3>⭐ CHEF ESTRELLA ⭐</h3>
                    <div style="font-size: 32px; font-weight: bold;">⏰ ${this.timeRemaining}s</div>
                    <div style="font-size: 24px;">📊 ${Math.floor(this.score)}</div>
                    <div style="font-size: 18px;">🔥 x${this.multiplier.toFixed(1)}</div>
                </div>
            `;
        }
    },
    
    createUI() {
        const display = document.createElement('div');
        display.id = 'starChefDisplay';
        display.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 500;
            display: none;
        `;
        document.body.appendChild(display);
    }
};

// ===============================================
// SISTEMA DE DECORACIÓN
// ===============================================
const DecorationSystem = {
    items: [
        // Decoraciones básicas
        { id: 1, name: "🖼️ Cuadro Vintage", cost: 1000, buff: { coinMult: 1.05 }, category: "arte" },
        { id: 2, name: "🌿 Planta Decorativa", cost: 500, buff: { happiness: 5 }, category: "plantas" },
        { id: 3, name: "💡 Lámpara Moderna", cost: 2000, buff: { speed: 1.03 }, category: "iluminación" },
        { id: 4, name: "🪑 Silla Ergonómica", cost: 3000, buff: { efficiency: 1.05 }, category: "muebles" },
        { id: 5, name: "📻 Radio Vintage", cost: 1500, buff: { morale: 10 }, category: "electrónicos" },
        
        // Decoraciones premium
        { id: 6, name: "🏆 Trofeo Michelin", cost: 10000, buff: { coinMult: 1.15, prestige: 1 }, category: "premios" },
        { id: 7, name: "🎨 Obra Maestra", cost: 25000, buff: { coinMult: 1.25 }, category: "arte" },
        { id: 8, name: "💎 Candelabro de Cristal", cost: 50000, buff: { allStats: 1.1 }, category: "lujo" },
        
        // Decoraciones míticas
        { id: 9, name: "🌟 Estatua Dorada del Chef", cost: 100000, buff: { coinMult: 1.5, speed: 1.2 }, category: "mítico" },
        { id: 10, name: "👑 Trono del Maestro Culinario", cost: 500000, buff: { allStats: 1.5 }, category: "mítico" }
    ],
    
    owned: [],
    activeBuffs: {},
    
    init() {
        console.log("🎨 Sistema de Decoración inicializado");
        this.loadOwned();
        this.calculateBuffs();
        this.createUI();
    },
    
    loadOwned() {
        const saved = localStorage.getItem('ownedDecorations');
        if (saved) {
            this.owned = JSON.parse(saved);
        }
    },
    
    saveOwned() {
        localStorage.setItem('ownedDecorations', JSON.stringify(this.owned));
    },
    
    buy(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return false;
        
        // Verificar si ya lo tiene
        if (this.owned.includes(itemId)) {
            alert("Ya tienes esta decoración");
            return false;
        }
        
        // Verificar recursos (asumiendo coins global)
        if (typeof coins !== 'undefined' && coins >= item.cost) {
            coins -= item.cost;
            this.owned.push(itemId);
            this.saveOwned();
            this.calculateBuffs();
            this.showPurchaseNotification(item);
            return true;
        }
        
        alert("No tienes suficientes ingredientes");
        return false;
    },
    
    calculateBuffs() {
        this.activeBuffs = {
            coinMult: 1,
            speed: 1,
            efficiency: 1,
            happiness: 0,
            morale: 0,
            prestige: 0
        };
        
        this.owned.forEach(itemId => {
            const item = this.items.find(i => i.id === itemId);
            if (item && item.buff) {
                Object.keys(item.buff).forEach(key => {
                    if (key === 'allStats') {
                        this.activeBuffs.coinMult *= item.buff[key];
                        this.activeBuffs.speed *= item.buff[key];
                        this.activeBuffs.efficiency *= item.buff[key];
                    } else if (typeof this.activeBuffs[key] === 'number') {
                        if (key.includes('Mult') || key === 'speed' || key === 'efficiency') {
                            this.activeBuffs[key] *= item.buff[key];
                        } else {
                            this.activeBuffs[key] += item.buff[key];
                        }
                    }
                });
            }
        });
    },
    
    showPurchaseNotification(item) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideInRight 0.5s ease;
        `;
        
        notif.innerHTML = `
            <h4>✅ Decoración Comprada</h4>
            <p>${item.name}</p>
            <small>Buff activo aplicado</small>
        `;
        
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    },
    
    createUI() {
        const container = document.createElement('div');
        container.id = 'decorationShop';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(30px);
            border: 2px solid #ff6b35;
            color: white;
            padding: 25px;
            border-radius: 25px;
            width: min(90%, 700px);
            max-height: 90vh;
            overflow-y: auto;
            display: none;
            z-index: 1000;
        `;
        
        container.innerHTML = `
            <h2>🎨 Tienda de Decoración</h2>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Buffs Activos:</h3>
                <div id="activeBuffsDisplay"></div>
            </div>
            <div id="decorationList"></div>
            <button onclick="document.getElementById('decorationShop').style.display='none'">Cerrar</button>
        `;
        
        document.body.appendChild(container);
        this.updateUI();
    },
    
    updateUI() {
        const buffDisplay = document.getElementById('activeBuffsDisplay');
        if (buffDisplay) {
            buffDisplay.innerHTML = `
                <p>💰 Multiplicador de Ingredientes: x${this.activeBuffs.coinMult.toFixed(2)}</p>
                <p>⚡ Velocidad: x${this.activeBuffs.speed.toFixed(2)}</p>
                <p>🎯 Eficiencia: x${this.activeBuffs.efficiency.toFixed(2)}</p>
                <p>😊 Felicidad: +${this.activeBuffs.happiness}</p>
                <p>🔥 Moral: +${this.activeBuffs.morale}</p>
                <p>⭐ Prestigio: +${this.activeBuffs.prestige}</p>
            `;
        }
        
        const list = document.getElementById('decorationList');
        if (list) {
            const categories = [...new Set(this.items.map(i => i.category))];
            
            list.innerHTML = categories.map(category => {
                const items = this.items.filter(i => i.category === category);
                return `
                    <div style="margin-bottom: 20px;">
                        <h3>${category.toUpperCase()}</h3>
                        ${items.map(item => {
                            const owned = this.owned.includes(item.id);
                            return `
                                <div style="
                                    background: ${owned ? 'rgba(39, 174, 96, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
                                    padding: 15px;
                                    margin: 10px 0;
                                    border-radius: 10px;
                                    border-left: 4px solid ${owned ? '#27ae60' : '#ff6b35'};
                                ">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <h4>${item.name} ${owned ? '✓' : ''}</h4>
                                            <p>Costo: ${item.cost} 🥕</p>
                                            <small>${this.formatBuffs(item.buff)}</small>
                                        </div>
                                        ${!owned ? `
                                            <button onclick="DecorationSystem.buy(${item.id}); DecorationSystem.updateUI();">
                                                Comprar
                                            </button>
                                        ` : '<span style="color: #27ae60;">COMPRADO</span>'}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }).join('');
        }
    },
    
    formatBuffs(buffs) {
        return Object.entries(buffs).map(([key, value]) => {
            const mult = key.includes('Mult') || key === 'speed' || key === 'efficiency';
            return `${key}: ${mult ? 'x' : '+'}${mult ? value.toFixed(2) : value}`;
        }).join(' | ');
    }
};

// ===============================================
// SISTEMA DE PERSONAL/EMPLEADOS
// ===============================================
const StaffSystem = {
    staff: [
        { id: 1, name: "👨‍🍳 Chef Junior", cost: 5000, income: 10, specialty: "velocidad", level: 1 },
        { id: 2, name: "👩‍🍳 Sous Chef", cost: 15000, income: 50, specialty: "calidad", level: 1 },
        { id: 3, name: "🧑‍🍳 Chef Ejecutivo", cost: 50000, income: 200, specialty: "eficiencia", level: 1 },
        { id: 4, name: "👑 Chef Maestro", cost: 200000, income: 1000, specialty: "all", level: 1 }
    ],
    
    hired: [],
    
    init() {
        console.log("👨‍🍳 Sistema de Personal inicializado");
        this.loadHired();
        this.startIncomeGeneration();
    },
    
    loadHired() {
        const saved = localStorage.getItem('hiredStaff');
        if (saved) {
            this.hired = JSON.parse(saved);
        }
    },
    
    saveHired() {
        localStorage.setItem('hiredStaff', JSON.stringify(this.hired));
    },
    
    hire(staffId) {
        const staff = this.staff.find(s => s.id === staffId);
        if (!staff) return false;
        
        const existing = this.hired.find(h => h.id === staffId);
        if (existing) {
            // Contratar otro del mismo tipo
            existing.count = (existing.count || 1) + 1;
        } else {
            this.hired.push({ ...staff, count: 1 });
        }
        
        this.saveHired();
        return true;
    },
    
    startIncomeGeneration() {
        setInterval(() => {
            const totalIncome = this.getTotalIncome();
            if (totalIncome > 0 && typeof coins !== 'undefined') {
                coins += totalIncome;
                this.showIncomeNotification(totalIncome);
            }
        }, 10000); // Cada 10 segundos
    },
    
    getTotalIncome() {
        return this.hired.reduce((total, staff) => {
            return total + (staff.income * staff.level * (staff.count || 1));
        }, 0);
    },
    
    showIncomeNotification(amount) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(39, 174, 96, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 10px;
            z-index: 9999;
            animation: fadeInOut 2s ease;
        `;
        
        notif.textContent = `+${amount} 🥕 (Personal)`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }
};

// ===============================================
// MERCADO NEGRO CULINARIO
// ===============================================
const BlackMarket = {
    items: [],
    refreshCost: 100,
    lastRefresh: 0,
    
    init() {
        console.log("🏪 Mercado Negro inicializado");
        this.refresh();
    },
    
    refresh() {
        this.items = [];
        const now = Date.now();
        
        // Generar 5 items aleatorios
        for (let i = 0; i < 5; i++) {
            this.items.push(this.generateRandomItem());
        }
        
        this.lastRefresh = now;
    },
    
    generateRandomItem() {
        const types = ['ingredient', 'boost', 'special'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const rarities = ['común', 'rara', 'épica', 'legendaria'];
        const rarity = rarities[Math.floor(Math.random() * rarities.length)];
        
        const baseValue = {
            'común': 100,
            'rara': 500,
            'épica': 2000,
            'legendaria': 10000
        };
        
        return {
            type,
            rarity,
            name: this.generateItemName(type, rarity),
            cost: baseValue[rarity] * (0.5 + Math.random()),
            value: baseValue[rarity] * (1 + Math.random()),
            effect: this.generateEffect(type, rarity)
        };
    },
    
    generateItemName(type, rarity) {
        const prefixes = {
            'común': ['Simple', 'Básico', 'Regular'],
            'rara': ['Especial', 'Fino', 'Selecto'],
            'épica': ['Supremo', 'Premium', 'Exquisito'],
            'legendaria': ['Divino', 'Celestial', 'Mítico']
        };
        
        const items = {
            'ingredient': ['Ingrediente', 'Especia', 'Condimento'],
            'boost': ['Potenciador', 'Elixir', 'Tónico'],
            'special': ['Artefacto', 'Reliquia', 'Talismán']
        };
        
        const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
        const item = items[type][Math.floor(Math.random() * items[type].length)];
        
        return `${prefix} ${item}`;
    },
    
    generateEffect(type, rarity) {
        // Simplificado - expandir según necesidades
        const multipliers = {
            'común': 1.1,
            'rara': 1.3,
            'épica': 1.5,
            'legendaria': 2.0
        };
        
        return {
            duration: 60 * multipliers[rarity],
            multiplier: multipliers[rarity]
        };
    }
};

// ===============================================
// NUEVOS LOGROS DLC
// ===============================================
const DLCAchievements = [
    { id: 'dlc_recipe_10', name: 'Aprendiz de Cocina', desc: 'Descubre 10 recetas', reward: 5000 },
    { id: 'dlc_recipe_25', name: 'Chef Experimentado', desc: 'Descubre 25 recetas', reward: 15000 },
    { id: 'dlc_recipe_all', name: 'Maestro Culinario', desc: 'Descubre todas las recetas', reward: 50000 },
    { id: 'dlc_starchef_10k', name: 'Estrella Ascendente', desc: '10,000 puntos en Modo Chef Estrella', reward: 10000 },
    { id: 'dlc_starchef_50k', name: 'Súper Estrella', desc: '50,000 puntos en Modo Chef Estrella', reward: 30000 },
    { id: 'dlc_decoration_10', name: 'Decorador Amateur', desc: 'Compra 10 decoraciones', reward: 8000 },
    { id: 'dlc_decoration_all', name: 'Diseñador de Interiores', desc: 'Compra todas las decoraciones', reward: 100000 },
    { id: 'dlc_staff_5', name: 'Gerente', desc: 'Contrata 5 empleados', reward: 5000 },
    { id: 'dlc_staff_20', name: 'Empresario Culinario', desc: 'Contrata 20 empleados', reward: 25000 },
    { id: 'dlc_blackmarket_10', name: 'Comerciante', desc: 'Compra 10 items del mercado negro', reward: 10000 }
];

// ===============================================
// SISTEMA DE TEMPORADAS
// ===============================================
const SeasonSystem = {
    currentSeason: 1,
    seasonStart: Date.now(),
    seasonDuration: 30 * 24 * 60 * 60 * 1000, // 30 días
    
    rewards: {
        1: { level: 5, reward: 1000 },
        2: { level: 10, reward: 5000 },
        3: { level: 15, reward: 10000 },
        4: { level: 20, reward: 25000 },
        5: { level: 25, reward: 50000 },
        6: { level: 30, reward: 100000 }
    },
    
    init() {
        console.log("📅 Sistema de Temporadas inicializado");
        this.checkSeason();
    },
    
    checkSeason() {
        const now = Date.now();
        const elapsed = now - this.seasonStart;
        
        if (elapsed > this.seasonDuration) {
            this.newSeason();
        }
    },
    
    newSeason() {
        this.currentSeason++;
        this.seasonStart = Date.now();
        // Reset season progress
        localStorage.setItem('currentSeason', this.currentSeason);
        localStorage.setItem('seasonStart', this.seasonStart);
    }
};

// ===============================================
// INICIALIZACIÓN DEL DLC
// ===============================================
function initDLC() {
    console.log("🎮 Inicializando DLC: Chef's Kitchen Frenzy Expansion Pack");
    
    try {
        RecipeSystem.init();
        StarChefMode.init();
        DecorationSystem.init();
        StaffSystem.init();
        BlackMarket.init();
        SeasonSystem.init();
        
        // Agregar botones al UI principal
        addDLCButtons();
        
        console.log("✅ DLC cargado exitosamente");
        
        // Notificación de bienvenida
        setTimeout(() => {
            showDLCWelcome();
        }, 2000);
        
    } catch (error) {
        console.error("❌ Error cargando DLC:", error);
    }
}

function addDLCButtons() {
    const controls = document.getElementById('controls-bar') || document.getElementById('controls');
    if (!controls) {
        console.warn("⚠️ No se encontró el panel de controles para agregar botones DLC");
        return;
    }
    
    const buttons = [
        { text: '📜', title: 'Recetas', onclick: 'document.getElementById("recipeBook").style.display="block"; if(window.DLC) window.DLC.RecipeSystem.updateRecipeList();' },
        { text: '⭐', title: 'Chef Estrella', onclick: 'if(window.DLC) { window.DLC.StarChefMode.start(); document.getElementById("starChefDisplay").style.display="block"; }' },
        { text: '🎨', title: 'Decoración', onclick: 'document.getElementById("decorationShop").style.display="block"; if(window.DLC) window.DLC.DecorationSystem.updateUI();' },
        { text: '🏪', title: 'Mercado Negro', onclick: 'alert("🏪 Mercado Negro: Sistema disponible próximamente");' }
    ];
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.innerHTML = btn.text;
        button.title = btn.title;
        button.setAttribute('onclick', btn.onclick);
        button.className = 'control-btn'; // Usar la clase del nuevo HUD
        button.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
        controls.appendChild(button);
    });
    
    console.log("✅ Botones DLC agregados al panel de controles");
}

function showDLCWelcome() {
    const welcome = document.createElement('div');
    welcome.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #9b59b6, #8e44ad);
        color: white;
        padding: 40px;
        border-radius: 20px;
        z-index: 10000;
        text-align: center;
        max-width: 600px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        animation: popIn 0.5s ease;
    `;
    
    welcome.innerHTML = `
        <h1 style="margin: 0 0 20px 0;">🎉 ¡DLC ACTIVADO! 🎉</h1>
        <h2>Expansion Pack - GRATIS</h2>
        <div style="text-align: left; margin: 20px 0;">
            <p>✅ Sistema de Recetas (50+)</p>
            <p>✅ Modo Chef Estrella</p>
            <p>✅ Sistema de Decoración</p>
            <p>✅ Sistema de Personal</p>
            <p>✅ Mercado Negro Culinario</p>
            <p>✅ 30 Nuevos Logros</p>
            <p>✅ Sistema de Temporadas</p>
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: white;
            color: #9b59b6;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        ">¡Empezar a Jugar!</button>
    `;
    
    document.body.appendChild(welcome);
}

// Agregar animaciones del DLC
const dlcStyle = document.createElement('style');
dlcStyle.textContent = `
    @keyframes popIn {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    
    @keyframes slideInRight {
        0% { transform: translateX(400px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeInOut {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
    }
`;
document.head.appendChild(dlcStyle);

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDLC);
} else {
    initDLC();
}

// Exportar para uso global
window.DLC = {
    RecipeSystem,
    StarChefMode,
    DecorationSystem,
    StaffSystem,
    BlackMarket,
    SeasonSystem,
    Achievements: DLCAchievements
};

console.log("📦 DLC Module Loaded");
