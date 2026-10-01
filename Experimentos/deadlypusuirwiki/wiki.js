class DeadlyPursuerWiki {
    constructor() {
        // Mapa de emojis a iconos Lucide
        this.emojiToLucide = {
            '🎮': 'gamepad-2',
            '🎯': 'target',
            '⚡': 'zap',
            '🔥': 'flame',
            '💀': 'skull',
            '🏃': 'person-standing',
            '🔪': 'axe',
            '✨': 'sparkles',
            '💊': 'pill',
            '❤️': 'heart',
            '🌀': 'circle-dot',
            '👁️': 'eye',
            '⚔️': 'sword',
            '💡': 'lightbulb',
            '🤝': 'handshake',
            '🎧': 'headphones',
            '🗺️': 'map',
            '⏱️': 'timer',
            '👀': 'eye',
            '🚧': 'construction',
            '⚠️': 'alert-triangle',
            '🛡️': 'shield',
            '🔍': 'search',
            '🌫️': 'cloud',
            '🩸': 'droplet',
            '🗑️': 'trash-2',
            '🧲': 'magnet',
            '⚙️': 'settings',
            '📋': 'clipboard-list',
            '🔗': 'link',
            '🖼️': 'image',
            '🎨': 'palette',
            '📝': 'file-text',
            '🆕': 'package-plus',
            '🗂️': 'folder-open',
            '🧹': 'eraser',
            '🐛': 'bug',
            '🏆': 'trophy',
            '📖': 'book-open',
            '📱': 'smartphone',
            '👊': 'hand',
            '🌊': 'waves'
        };
        
        this.characters = {
            '2019x': { name: '2019X', role: 'killer', icon: '../public/assets/icons/2019XNormalIcon.png', tags: ['rework'] },
            'bfmp4': { name: 'Bfmp4', role: 'npc', icon: '../public/assets/icons/Bfmp4Icon.png', tags: ['dev'] },
            'ia666': { name: 'iA666', role: 'killer', icon: 'Assets/images/IA666.png' },
            'missx': { name: 'MissX', role: 'killer', icon: 'Assets/images/MissX.png' },
            'peace': { name: 'Peace', role: 'killer', icon: '../public/assets/icons/PeaceNormalIcon.png', tags: ['wip'] },
            'varkul': { name: 'Varkul', role: 'killer', icon: 'Assets/images/PlaceHolder.png', tags: ['dev'] },
            'abelitogamer': { name: 'AbelitoGamer', role: 'boss', icon: 'Assets/images/AbelitoInactiveIcon.png', tags: ['rework'] },
            'gissel': { name: 'Gissel', role: 'survivor', icon: '../public/assets/icons/GisselInactiveIcon.png', tags: ['rework'] },
            'ia777': { name: 'iA777', role: 'survivor', icon: '../public/assets/icons/IA777NormalIcon.png', icons: { danger: '../public/assets/icons/IA777DangerIcon.png', dead: '../public/assets/icons/IA777DeadIcon.png' } },
            'iris': { name: 'Iris', role: 'survivor', icon: '../public/assets/icons/IrisNormalIcon.png', icons: { danger: '../public/assets/icons/IrisDangerIcon.png', dead: '../public/assets/icons/IrisDeadIcon.png' } },
            'allison': { name: 'Allison', role: 'survivor', icon: '../public/assets/icons/AllisonNormalIcon.png' },
            'luna': { name: 'Luna', role: 'survivor', icon: '../public/assets/icons/LunaNormalIcon.png', icons: { danger: '../public/assets/icons/LunaDangerIcon.png', dead: '../public/assets/icons/LunaDeadIcon.png' }, tags: ['rework'] },
            'valem': { name: 'Valem', role: 'survivor', icon: '../public/assets/icons/ValemNormalIcon.png' },
            'anna': { name: 'Anna Moonred', role: 'survivor', icon: '../public/assets/icons/AnnaNormalIcon.png', tags: ['wip'] },
            'ankush': { name: 'Ankush Moonred', role: 'survivor', icon: 'Assets/images/AnkusHNormalIcon.png', icons: { danger: '../public/assets/icons/AnkushDangerIcon.png', dead: '../public/assets/icons/AnkushDeadIcon.png' }, tags: ['rework'] },
            'umbra': { name: 'Umbra', role: 'survivor', icon: 'Assets/images/PlaceHolder.png', tags: ['dev'] },
            'pom': { name: 'Pom', role: 'survivor', icon: 'Assets/images/PlaceHolder.png', tags: ['dev'] },
            'tips': { name: 'Tips y Trucos', role: 'guide', hideFromGrid: true, tags: ['rework'] }
        };
        
        // Personajes descartados (no aparecen en navegación principal)
        this.discardedCharacters = {
            'molly': { name: 'Molly', role: 'discarded', reason: 'Razones personales', icon: '../public/assets/icons/MollyNormalIcon.png', tags: ['discarded'] },
            'angel': { name: 'Angel', role: 'discarded', reason: 'Falta de información del creador', icon: '../public/assets/icons/AngelNormalIcon.png', tags: ['discarded'] }
        };
        
        this.init();
    }
    
    // Método para convertir emojis a iconos Lucide
    convertEmojisToLucide(html) {
        let result = html;
        for (const [emoji, icon] of Object.entries(this.emojiToLucide)) {
            const regex = new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, `<i data-lucide="${icon}" style="width:1.25em;height:1.25em;display:inline-block;vertical-align:middle;"></i>`);
        }
        return result;
    }

    async init() {
        this.generateNavigation();
        this.generateCharacterGrid();
        this.generateStats();
        this.setupEventListeners();
        this.handleRouting();
    }

    generateNavigation() {
        const killersNav = document.getElementById('killers-nav');
        const bossesNav = document.getElementById('bosses-nav');
        const survivorsNav = document.getElementById('survivors-nav');
        const npcsNav = document.getElementById('npcs-nav');
        const discardedNav = document.getElementById('discarded-nav');
        
        Object.entries(this.characters).forEach(([id, char]) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.setAttribute('data-character', id);
            a.textContent = char.name;
            li.appendChild(a);
            
            if (char.role === 'killer') {
                killersNav.appendChild(li);
            } else if (char.role === 'boss') {
                bossesNav.appendChild(li);
            } else if (char.role === 'npc') {
                npcsNav.appendChild(li);
            } else {
                survivorsNav.appendChild(li);
            }
        });
        
        // Generar navegación de descartados
        Object.entries(this.discardedCharacters).forEach(([id, char]) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.setAttribute('data-character', id);
            a.textContent = char.name;
            a.style.opacity = '0.6';
            a.title = `Descartado: ${char.reason}`;
            li.appendChild(a);
            discardedNav.appendChild(li);
        });
    }

    generateCharacterGrid() {
        const grid = document.getElementById('character-grid');
        
        Object.entries(this.characters).forEach(([id, char]) => {
            // Saltar personajes que no deben aparecer en la grilla
            if (char.hideFromGrid) return;
            
            const card = document.createElement('div');
            card.className = 'character-card';
            card.setAttribute('data-character', id);
            
            let roleLabel = 'Survivor';
            if (char.role === 'killer') roleLabel = 'Killer';
            if (char.role === 'boss') roleLabel = 'Boss';
            if (char.role === 'npc') roleLabel = 'NPC';
            
            // Generar tags si existen
            let tagsHtml = '';
            if (char.tags && char.tags.length > 0) {
                tagsHtml = '<div class="character-tags">';
                char.tags.forEach(tag => {
                    if (tag === 'rework') {
                        tagsHtml += '<span class="tag-rework" title="Habilidades serán reworkeadas"><i data-lucide="wrench"></i> Rework</span>';
                    } else if (tag === 'wip') {
                        tagsHtml += '<span class="tag-wip" title="En desarrollo"><i data-lucide="construction"></i> WIP</span>';
                    } else if (tag === 'dev') {
                        tagsHtml += '<span class="tag-dev" title="En desarrollo"><i data-lucide="code"></i> Dev</span>';
                    } else if (tag === 'discarded') {
                        tagsHtml += '<span class="tag-discarded" title="Personaje descartado"><i data-lucide="archive"></i> Descartado</span>';
                    }
                });
                tagsHtml += '</div>';
            }
            
            card.innerHTML = `
                <img src="${char.icon}" alt="${char.name}" onerror="this.src='Assets/images/PlaceHolder.png'">
                <h4>${char.name}</h4>
                <span class="role ${char.role}">${roleLabel}</span>
                ${tagsHtml}
            `;
            
            grid.appendChild(card);
        });
        
        // Initialize Lucide icons for tags
        lucide.createIcons();
    }

    generateStats() {
        const stats = document.getElementById('intro-stats');
        // Filtrar personajes que no deben aparecer en stats
        const visibleChars = Object.values(this.characters).filter(c => !c.hideFromGrid);
        const total = visibleChars.length;
        const killers = visibleChars.filter(c => c.role === 'killer').length;
        const bosses = visibleChars.filter(c => c.role === 'boss').length;
        const survivors = visibleChars.filter(c => c.role === 'survivor').length;
        const npcs = visibleChars.filter(c => c.role === 'npc').length;
        
        stats.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${total}</span>
                <span class="stat-label">Personajes</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${killers}</span>
                <span class="stat-label">Killers</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${bosses}</span>
                <span class="stat-label">Bosses</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${survivors}</span>
                <span class="stat-label">Survivors</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${npcs}</span>
                <span class="stat-label">NPCs</span>
            </div>
        `;
    }

    async loadMarkdownFile(filename) {
        try {
            const response = await fetch(`characters/${filename}.md`);
            if (!response.ok) throw new Error(`No se pudo cargar ${filename}.md`);
            return await response.text();
        } catch (error) {
            console.error('Error cargando markdown:', error);
            return `# Error\n\nNo se pudo cargar la información de ${filename}`;
        }
    }

    setupEventListeners() {
        document.querySelectorAll('[data-character]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const character = e.currentTarget.dataset.character;
                this.showCharacter(character);
                
                // Update active state in sidebar
                const sidebarLink = document.querySelector(`.nav-section a[data-character="${character}"]`);
                if (sidebarLink) {
                    this.updateActiveNav(sidebarLink);
                }
            });
        });

        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.showPage(page);
                this.updateActiveNav(e.target);
            });
        });

        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const character = e.currentTarget.dataset.character;
                this.showCharacter(character);
                
                // Update active state in sidebar
                const sidebarLink = document.querySelector(`.nav-section a[data-character="${character}"]`);
                if (sidebarLink) {
                    this.updateActiveNav(sidebarLink);
                }
            });
        });
    }



    getCharacterInfo(characterId) {
        const characterData = {
            'molly': {
                fullName: 'Molly Anderson Smith',
                aliases: ['Molida', 'HolyMoly'],
                gender: 'Mujer',
                pronouns: 'She/Her',
                orientation: 'Heterosexual',
                relationships: ['Clay (Mascota)', 'Roberta (Rival)', 'Chris (Empleado)', 'Katniss (Empleado)', 'Meiden (Rival)'],
                affiliation: 'Corner Brew',
                occupation: 'Gerente',
                age: '25',
                birthday: '04/04/2000',
                status: 'Viva',
                species: 'Humana',
                height: '1.85m',
                eyes: 'Verde oliva',
                hair: 'Castaño/Café',
                voice: 'Karla Falcon (Posiblemente)'
            },
            'ia777': {
                fullName: 'iA777',
                aliases: ['Bob', 'Noli del tianguis', 'Sprunki', 'Triple x', 'ena'],
                gender: 'Hombre',
                pronouns: 'He/Him',
                orientation: 'Heterosexual',
                relationships: ['??? (Creador)', 'Iris (Compañera/Amiga)', 'Maxwell (Enemigo)'],
                affiliation: 'Protector del pueblo',
                occupation: 'Protector del pueblo',
                age: '25 (referencia) / 15 (real)',
                birthday: '29/04/2010',
                status: '"Muerto"',
                species: 'Robot',
                height: '1.80m',
                eyes: 'Negro (izq.) / Morado (der.)',
                hair: 'N/A',
                voice: 'Damian Albor (El loco Damián)'
            },
            'gissel': {
                fullName: 'Gissel Fischer',
                aliases: ['Perra sucia', 'Gisselita', 'Gisado', 'Yisel.'],
                gender: 'Mujer',
                pronouns: 'She/Her',
                orientation: 'Heterosexual',
                affiliation: 'N/A',
                occupation: 'Diseñadora gráfica',
                age: '26',
                birthday: '29/09/1999',
                status: 'Viva',
                species: 'Humana',
                height: '1.69m',
                eyes: 'Negros',
                hair: 'Marrón y blanco',
                voice: 'Luci Christian (Azumanga Daioh Anime: Yukari Tanizaki)'
            },
            'allison': {
                fullName: 'Allison Moon',
                aliases: ['Corazón', 'Ali'],
                gender: 'Mujer',
                pronouns: 'She/Her',
                orientation: 'Heterosexual',
                relationships: ['Novio (asesinado por 2019x)', 'Vortex (conexión misteriosa)'],
                affiliation: 'Bosque Umbral',
                occupation: 'Exploradora urbana / Fotógrafa aficionada',
                age: '19',
                birthday: '15/11/2006',
                status: 'Viva',
                species: 'Humana',
                height: '1.82m',
                eyes: 'Negro',
                hair: 'Café oscuro',
                voice: 'N/A'
            },
            'iris': {
                fullName: 'Iris Afton Miller',
                aliases: ['N/A'],
                gender: 'Mujer',
                pronouns: 'She/Her',
                orientation: 'N/A',
                relationships: ['N/A'],
                affiliation: 'N/A',
                occupation: 'N/A',
                age: '27',
                birthday: '07/07/1997',
                status: 'Viva',
                species: 'Animal antropomórfico (Gata)',
                height: '1.77m',
                eyes: 'Azul oscuro',
                hair: 'Crema con manchas grises oscuro',
                voice: 'N/A'
            },
            '2019x': {
                fullName: 'ERROR',
                aliases: ['ERROR'],
                gender: 'ERROR',
                pronouns: 'ERROR',
                orientation: 'ERROR',
                relationships: ['ERROR'],
                affiliation: 'ERROR',
                occupation: 'ERROR',
                age: 'ERROR',
                birthday: 'ERROR',
                status: 'ERROR',
                species: 'ERROR',
                height: 'ERROR',
                eyes: 'ERROR',
                hair: 'ERROR',
                voice: 'ERROR'
            },
            'luna': {
                fullName: 'Luna Vélez',
                aliases: ['N/A'],
                gender: 'Mujer',
                pronouns: 'She/Her',
                orientation: 'Bisexual',
                relationships: ['Nogales (Amigo)'],
                affiliation: 'Funky Maker Server',
                occupation: 'Guerrera',
                age: '16',
                birthday: '25/07/2009',
                status: 'Viva',
                species: 'Humana',
                height: '1.60m',
                eyes: 'Negros',
                hair: 'Rosa (Natural: Castaño)',
                voice: 'N/A'
            },
            'ia666': {
                fullName: 'iA666',
                aliases: ['Protocolo Letal', 'El Asesino del Laboratorio'],
                gender: 'N/A',
                pronouns: 'N/A',
                orientation: 'N/A',
                relationships: ['Científicos del laboratorio (Víctimas)'],
                affiliation: 'Laboratorio Corrupto',
                occupation: 'Unidad de Eliminación',
                age: 'N/A',
                birthday: 'N/A',
                status: 'Activo',
                species: 'Robot',
                height: 'N/A',
                eyes: 'N/A',
                hair: 'N/A',
                voice: 'N/A'
            },
            'missx': {
                fullName: 'MissX',
                aliases: ['La Entidad Glitcheada', 'X'],
                gender: 'Mujer',
                pronouns: 'She/Her',
                orientation: 'N/A',
                relationships: ['Desconocido'],
                affiliation: 'Entidad del Glitch',
                occupation: 'Killer',
                age: 'Desconocido',
                birthday: 'Desconocido',
                status: 'Activa',
                species: 'Entidad Digital',
                height: 'Variable',
                eyes: 'Rojos brillantes',
                hair: 'N/A',
                voice: 'Distorsionada/Glitcheada'
            },
            'peace': {
                fullName: 'Peace',
                aliases: ['TBD'],
                gender: 'TBD',
                pronouns: 'TBD',
                orientation: 'TBD',
                relationships: ['TBD'],
                affiliation: 'TBD',
                occupation: 'TBD',
                age: 'TBD',
                birthday: 'TBD',
                status: 'TBD',
                species: 'TBD',
                height: 'TBD',
                eyes: 'TBD',
                hair: 'TBD',
                voice: 'TBD'
            },
            'valem': {
                fullName: 'Valem',
                aliases: ['TBD'],
                gender: 'TBD',
                pronouns: 'TBD',
                orientation: 'TBD',
                relationships: ['TBD'],
                affiliation: 'TBD',
                occupation: 'TBD',
                age: 'TBD',
                birthday: 'TBD',
                status: 'TBD',
                species: 'TBD',
                height: 'TBD',
                eyes: 'TBD',
                hair: 'TBD',
                voice: 'TBD'
            },
            'anna': {
                fullName: 'Anna Moonred',
                aliases: ['TBD'],
                gender: 'TBD',
                pronouns: 'TBD',
                orientation: 'TBD',
                relationships: ['TBD'],
                affiliation: 'TBD',
                occupation: 'TBD',
                age: 'TBD',
                birthday: 'TBD',
                status: 'TBD',
                species: 'TBD',
                height: 'TBD',
                eyes: 'TBD',
                hair: 'TBD',
                voice: 'TBD'
            },
            'abelitogamer': {
                fullName: 'Abelito',
                aliases: ['AbelitoGamer'],
                gender: 'Hombre',
                pronouns: 'He/Him (preferidos, pero acepta cualquiera)',
                orientation: 'Pansexual',
                relationships: ['Merry (Amiga)', 'Owen (Amigo)', 'Noel (Amigo & Ex-pareja)', 'Evie (Ex-pareja)'],
                affiliation: 'TrueStudios',
                occupation: 'Programador',
                age: '22',
                birthday: '31/01/2003',
                status: 'Vivo',
                species: 'Humano',
                height: '1.60m',
                eyes: 'Cafés',
                hair: 'Verde Vibrante (Natural: Negro)',
                voice: 'La de su creador lol'
            },
            'ankush': {
                fullName: 'Ankush Moonred',
                aliases: ['Fenix', 'El vagabundo', 'Felix', 'Fenki'],
                gender: 'Hombre',
                pronouns: 'He/Him',
                orientation: 'Heterosexual',
                relationships: ['Gissel (Pareja)', 'Anna Moonred (Hermana Mayor)', 'Lexa (Hermana Menor)'],
                affiliation: 'Funky Maker Server / FunkStudio Island',
                occupation: 'Investigador Tecnológico',
                age: '21',
                birthday: '06/07/2004',
                status: 'Vivo',
                species: 'Humano',
                height: '1.78m',
                eyes: 'Negros',
                hair: 'Azul Marino, mechones rubio-claros',
                voice: 'La de su creador lol'
            },
            'bfmp4': {
                fullName: 'Bfmp4',
                aliases: ['El Dealer', 'Vendedor de la Tienda'],
                gender: 'TBD',
                pronouns: 'TBD',
                orientation: 'N/A',
                relationships: ['Todos los jugadores (Clientes)'],
                affiliation: 'La Tienda',
                occupation: 'Dealer / Vendedor',
                age: 'Desconocido',
                birthday: 'Desconocido',
                status: 'Activo',
                species: 'TBD',
                height: 'TBD',
                eyes: 'TBD',
                hair: 'TBD',
                voice: 'TBD'
            }
        };
        return characterData[characterId] || {};
    }

    async showCharacter(characterId) {
        // Buscar en personajes activos y descartados
        const character = this.characters[characterId] || this.discardedCharacters[characterId];
        if (!character) return;

        const content = document.getElementById('character-content');
        content.innerHTML = this._randomLoading();

        const markdown = await this.loadMarkdownFile(characterId);
        
        const charInfo = this.getCharacterInfo(characterId);
        
        const infoBoxContent = charInfo.fullName ? `
            <img src="${character.icon}" alt="${character.name}" class="character-portrait">
            <h3>${charInfo.fullName}</h3>
            <span class="role ${character.role}">${character.role.toUpperCase()}</span>
            
            <div class="character-details">
                ${charInfo.aliases ? `<div class="detail-section">
                    <h4>Aliases</h4>
                    <p>${charInfo.aliases.join('<br>')}</p>
                </div>` : ''}
                
                <div class="detail-section">
                    <h4>Género</h4>
                    <p>${charInfo.gender}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Pronombres</h4>
                    <p>${charInfo.pronouns}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Orientación</h4>
                    <p>${charInfo.orientation}</p>
                </div>
                

                
                <div class="detail-section">
                    <h4>Afiliación</h4>
                    <p>${charInfo.affiliation}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Ocupación</h4>
                    <p>${charInfo.occupation}</p>
                </div>
                
                <div class="bio-section">
                    <h4>Información biográfica</h4>
                    <div class="bio-grid">
                        <div><strong>Edad:</strong> ${charInfo.age}</div>
                        <div><strong>Cumpleaños:</strong> ${charInfo.birthday}</div>
                        <div><strong>Estado:</strong> ${charInfo.status}</div>
                        <div><strong>Especie:</strong> ${charInfo.species}</div>
                    </div>
                </div>
                
                <div class="physical-section">
                    <h4>Descripción física</h4>
                    <div class="bio-grid">
                        <div><strong>Altura:</strong> ${charInfo.height}</div>
                        <div><strong>Ojos:</strong> ${charInfo.eyes}</div>
                        <div><strong>Cabello:</strong> ${charInfo.hair}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Voz</h4>
                    <p>${charInfo.voice}</p>
                </div>
            </div>
        ` : `
            <img src="${character.icon}" alt="${character.name}" class="character-portrait">
            <h3>${character.name}</h3>
            <span class="role ${character.role}">${character.role.toUpperCase()}</span>
        `;
        
        const infoBoxHtml = charInfo.fullName ? `
            <div class="character-infobox">
                <img src="${character.icon}" alt="${character.name}" class="character-portrait" onerror="this.src='Assets/images/PlaceHolder.png'">
                <h3>${charInfo.fullName}</h3>
                <span class="role ${character.role}">${character.role.toUpperCase()}</span>

                ${character.icons ? `
                <div class="char-icon-gallery">
                    <div class="char-icon-item active" title="Normal">
                        <img src="${character.icon}" alt="Normal">
                        <span>Normal</span>
                    </div>
                    ${character.icons.danger ? `<div class="char-icon-item" title="Danger">
                        <img src="${character.icons.danger}" alt="Danger">
                        <span>Danger</span>
                    </div>` : ''}
                    ${character.icons.dead ? `<div class="char-icon-item" title="Dead">
                        <img src="${character.icons.dead}" alt="Dead">
                        <span>Dead</span>
                    </div>` : ''}
                </div>` : ''}

                <button class="char-share-btn" onclick="wiki.shareCharacter('${characterId}')" title="Copiar enlace">
                    <i data-lucide="link" style="width:1em;height:1em;margin-right:0.25em;"></i> Compartir
                </button>
                
                <div class="character-details">
                    ${charInfo.aliases ? `<div class="detail-section">
                        <h4>Aliases</h4>
                        <p>${charInfo.aliases.join('<br>')}</p>
                    </div>` : ''}
                    
                    <div class="detail-section">
                        <h4>Género</h4>
                        <p>${charInfo.gender}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Pronombres</h4>
                        <p>${charInfo.pronouns}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Orientación</h4>
                        <p>${charInfo.orientation}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Afiliación</h4>
                        <p>${charInfo.affiliation}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Ocupación</h4>
                        <p>${charInfo.occupation}</p>
                    </div>
                    
                    <div class="bio-section">
                        <h4>Información biográfica</h4>
                        <div class="bio-grid">
                            <div><strong>Edad:</strong> ${charInfo.age}</div>
                            <div><strong>Cumpleaños:</strong> ${charInfo.birthday}</div>
                            <div><strong>Estado:</strong> ${charInfo.status}</div>
                            <div><strong>Especie:</strong> ${charInfo.species}</div>
                        </div>
                    </div>
                    
                    <div class="physical-section">
                        <h4>Descripción física</h4>
                        <div class="bio-grid">
                            <div><strong>Altura:</strong> ${charInfo.height}</div>
                            <div><strong>Ojos:</strong> ${charInfo.eyes}</div>
                            <div><strong>Cabello:</strong> ${charInfo.hair}</div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Voz</h4>
                        <p>${charInfo.voice}</p>
                    </div>
                </div>
            </div>
        ` : '';
        
        // Generar aviso basado en tags
        let tagNoticeHtml = '';
        if (character.tags && character.tags.length > 0) {
            character.tags.forEach(tag => {
                if (tag === 'rework') {
                    tagNoticeHtml += `
                        <div class="tag-notice rework-notice">
                            <div class="notice-icon"><i data-lucide="wrench"></i></div>
                            <div class="notice-content">
                                <h4>⚠️ Rework Próximo</h4>
                                <p>Las habilidades de <strong>${character.name}</strong> serán reworkeadas en una futura actualización. La información actual puede cambiar significativamente.</p>
                            </div>
                        </div>
                    `;
                } else if (tag === 'wip') {
                    tagNoticeHtml += `
                        <div class="tag-notice wip-notice">
                            <div class="notice-icon"><i data-lucide="construction"></i></div>
                            <div class="notice-content">
                                <h4>🚧 En Desarrollo</h4>
                                <p><strong>${character.name}</strong> está en desarrollo activo. La información puede estar incompleta o cambiar frecuentemente.</p>
                            </div>
                        </div>
                    `;
                } else if (tag === 'dev') {
                    tagNoticeHtml += `
                        <div class="tag-notice dev-notice">
                            <div class="notice-icon"><i data-lucide="code"></i></div>
                            <div class="notice-content">
                                <h4>💻 En Desarrollo</h4>
                                <p><strong>${character.name}</strong> está siendo desarrollado actualmente. La información mostrada es preliminar y puede cambiar.</p>
                            </div>
                        </div>
                    `;
                } else if (tag === 'discarded') {
                    tagNoticeHtml += `
                        <div class="tag-notice discarded-notice">
                            <div class="notice-icon"><i data-lucide="archive"></i></div>
                            <div class="notice-content">
                                <h4>📦 Personaje Descartado</h4>
                                <p><strong>${character.name}</strong> fue descartado del desarrollo activo. Razón: <em>${character.reason || 'No especificada'}</em>. La información aquí es histórica.</p>
                            </div>
                        </div>
                    `;
                }
            });
        }
        
        const html = `
            <div class="character-profile active">
                <div class="character-main ${infoBoxHtml ? '' : 'no-infobox'}">
                    <div class="markdown-content">
                        ${infoBoxHtml}
                        ${tagNoticeHtml}
                        ${this.convertEmojisToLucide(marked.parse(markdown))}
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        
        // Initialize Lucide icons
        lucide.createIcons();
        
        this._initLoreEffects(content);
        this._injectCharNav(characterId, content);

        // Galería de iconos interactiva
        content.querySelectorAll('.char-icon-item').forEach(item => {
            item.addEventListener('click', () => {
                const src = item.querySelector('img').src;
                content.querySelector('.character-portrait').src = src;
                content.querySelectorAll('.char-icon-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Actualizar sidebar para marcar el personaje actual como activo
        const sidebarLink = document.querySelector(`.nav-section a[data-character="${characterId}"]`);
        if (sidebarLink) {
            this.updateActiveNav(sidebarLink);
        }

        window.history.pushState({character: characterId}, '', `#${characterId}`);
    }

    async showPage(pageId) {
        const content = document.getElementById('character-content');
        
        if (pageId === 'home') {
            this.showHome();
            return;
        }
        
        // Special handling for gameplay page
        if (pageId === 'gameplay') {
            this.showGameplayPage();
            window.history.pushState({page: pageId}, '', `#${pageId}`);
            return;
        }
        
        content.innerHTML = this._randomLoading();
        
        const markdown = await this.loadMarkdownFile(pageId);
        
        // Procesar markdown y convertir emojis a iconos Lucide
        const processedMarkdown = this.convertEmojisToLucide(marked.parse(markdown));
        content.innerHTML = `<div class="markdown-content">${processedMarkdown}</div>`;
        
        // Initialize Lucide icons
        lucide.createIcons();
        
        window.history.pushState({page: pageId}, '', `#${pageId}`);
    }

    showGameplayPage() {
        const content = document.getElementById('character-content');
        
        content.innerHTML = `
            <div class="gameplay-page">
                <div class="gameplay-header">
                    <h1><i data-lucide="gamepad-2"></i> Mecánicas del Juego</h1>
                    <p class="gameplay-subtitle">Guía completa sobre cómo jugar Deadly Pursuit</p>
                </div>

                <div class="gameplay-content">
                    <!-- Aviso Importante -->
                    <section class="gameplay-section">
                        <div class="section-header">
                            <span class="section-icon"><i data-lucide="alert-triangle"></i></span>
                            <h2>Aviso Importante</h2>
                        </div>
                        <div class="section-content">
                            <div class="alert-box warning">
                                <p><strong><i data-lucide="construction"></i> El juego está en desarrollo activo</strong></p>
                                <p>Las mecánicas descritas aquí pueden cambiar, eliminarse o añadirse en futuras actualizaciones. Esta wiki se actualizará constantemente para reflejar los cambios del juego.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Objetivo del Juego -->
                    <section class="gameplay-section">
                        <div class="section-header">
                            <span class="section-icon"><i data-lucide="target"></i></span>
                            <h2>Objetivo del Juego</h2>
                        </div>
                        <div class="section-content">
                            <p>Deadly Pursuit es un juego de supervivencia asimétrico donde los jugadores asumen el rol de <strong>Survivors</strong> o <strong>Killers</strong>.</p>
                            
                            <div class="role-cards">
                                <div class="role-card survivor-card">
                                    <div class="role-card-header">
                                        <span class="role-icon"><i data-lucide="users"></i></span>
                                        <h3>Survivors</h3>
                                    </div>
                                    <ul>
                                        <li>Sobrevivir el mayor tiempo posible</li>
                                        <li>Encontrar y escapar a través de los anillos de escape</li>
                                        <li>Trabajar en equipo usando habilidades complementarias</li>
                                        <li>Evitar ser eliminado por el Killer</li>
                                    </ul>
                                </div>
                                
                                <div class="role-card killer-card">
                                    <div class="role-card-header">
                                        <span class="role-icon"><i data-lucide="skull"></i></span>
                                        <h3>Killers</h3>
                                    </div>
                                    <ul>
                                        <li>Eliminar a todos los Survivors</li>
                                        <li>Impedir que los Survivors escapen por los anillos</li>
                                        <li>Usar habilidades especiales para cazar eficientemente</li>
                                        <li>Controlar zonas clave del mapa</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Mecánicas de Survivors -->
                    <section class="gameplay-section">
                        <div class="section-header">
                            <span class="section-icon"><i data-lucide="person-standing"></i></span>
                            <h2>Mecánicas de Survivors</h2>
                        </div>
                        <div class="section-content">
                            <div class="mechanic-list">
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="circle-dot"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Anillos de Escape</h4>
                                        <p>Los anillos de escape aparecen en el mapa. Encuentra uno y atraviésalo para escapar y ganar. Es la única forma de victoria para los Survivors.</p>
                                    </div>
                                </div>
                                
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="heart"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Sistema de Salud</h4>
                                        <p>Los Survivors tienen puntos de vida. Cada golpe del Killer reduce tu salud. Si llegas a 0 HP, serás eliminado.</p>
                                    </div>
                                </div>
                                
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="pill"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Curación</h4>
                                        <p><strong><i data-lucide="construction"></i> En Desarrollo:</strong> El sistema de curación aún no está implementado. Actualmente no hay forma de recuperar salud perdida.</p>
                                    </div>
                                </div>
                                
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="sparkles"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Habilidades Únicas</h4>
                                        <p>Cada Survivor tiene habilidades especiales (Q, E, R, etc.) con cooldowns específicos. Úsalas estratégicamente para sobrevivir.</p>
                                    </div>
                                </div>
                                
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="move"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Movimiento</h4>
                                        <p>Usa el entorno a tu favor: corre, esquiva obstáculos y rompe la línea de visión del Killer. No existe mecánica de ocultación en la oscuridad.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Mecánicas de Killers -->
                    <section class="gameplay-section">
                        <div class="section-header">
                            <span class="section-icon"><i data-lucide="axe"></i></span>
                            <h2>Mecánicas de Killers</h2>
                        </div>
                        <div class="section-content">
                            <div class="mechanic-list">
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="eye"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Detección de Survivors</h4>
                                        <p>Usa pistas visuales y sonidos para rastrear a los Survivors. Cada Killer tiene diferentes métodos de detección.</p>
                                    </div>
                                </div>
                                
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="sword"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Sistema de Ataque</h4>
                                        <p>Golpea a los Survivors para reducir su salud. El daño varía según el Killer y sus habilidades activas.</p>
                                    </div>
                                </div>
                                
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="sparkles"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Habilidades Especiales</h4>
                                        <p>Cada Killer tiene un set único de habilidades (Q, E, R, F, X, etc.) que definen su estilo de caza. Aprende sus cooldowns y efectos.</p>
                                    </div>
                                </div>
                                
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="map-pin"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Control del Mapa</h4>
                                        <p>Patrulla zonas clave, predice movimientos de Survivors y controla el acceso a los anillos de escape.</p>
                                    </div>
                                </div>
                                
                                <div class="mechanic-item">
                                    <div class="mechanic-icon"><i data-lucide="zap"></i></div>
                                    <div class="mechanic-info">
                                        <h4>Habilidades Ultimate</h4>
                                        <p>Algunos Killers tienen habilidades ultimate potentes con mecánicas de carga. Úsalas en momentos decisivos.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Tips Rápidos -->
                    <section class="gameplay-section tips-section">
                        <div class="section-header">
                            <span class="section-icon"><i data-lucide="lightbulb"></i></span>
                            <h2>Tips Esenciales</h2>
                        </div>
                        <div class="section-content">
                            <div class="tips-grid">
                                <div class="tip-card">
                                    <span class="tip-emoji"><i data-lucide="handshake"></i></span>
                                    <p><strong>Trabaja en equipo</strong> - La cooperación es clave. Combina habilidades y rescata compañeros.</p>
                                </div>
                                <div class="tip-card">
                                    <span class="tip-emoji"><i data-lucide="headphones"></i></span>
                                    <p><strong>Usa auriculares</strong> - El audio es crucial. Escucha pasos, habilidades y heartbeats.</p>
                                </div>
                                <div class="tip-card">
                                    <span class="tip-emoji"><i data-lucide="circle-dot"></i></span>
                                    <p><strong>Localiza los anillos</strong> - Identifica dónde aparecen los anillos de escape temprano.</p>
                                </div>
                                <div class="tip-card">
                                    <span class="tip-emoji"><i data-lucide="timer"></i></span>
                                    <p><strong>Gestiona cooldowns</strong> - No gastes todas tus habilidades de golpe. Planifica su uso.</p>
                                </div>
                                <div class="tip-card">
                                    <span class="tip-emoji"><i data-lucide="map"></i></span>
                                    <p><strong>Conoce el mapa</strong> - Aprende las rutas de escape, obstáculos y zonas seguras.</p>
                                </div>
                                <div class="tip-card">
                                    <span class="tip-emoji"><i data-lucide="eye"></i></span>
                                    <p><strong>Mantén visión</strong> - Nunca pierdas de vista al Killer si eres Survivor.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
        
        // Initialize Lucide icons
        lucide.createIcons();
    }

    showHome() {
        const content = document.getElementById('character-content');
        const total = Object.keys(this.characters).length;
        const killers = Object.values(this.characters).filter(c => c.role === 'killer').length;
        const bosses = Object.values(this.characters).filter(c => c.role === 'boss').length;
        const survivors = Object.values(this.characters).filter(c => c.role === 'survivor').length;
        const npcs = Object.values(this.characters).filter(c => c.role === 'npc').length;
        
        content.innerHTML = `
            <div class="welcome-screen">
                <div class="wiki-intro">
                    <h2>🎮 Deadly Pursuit Wiki</h2>
                    <p class="intro-subtitle">La guía definitiva para dominar el juego</p>
                    
                    <div class="intro-stats">
                        <div class="stat-item">
                            <span class="stat-number">${total}</span>
                            <span class="stat-label">Personajes</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${killers}</span>
                            <span class="stat-label">Killers</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${bosses}</span>
                            <span class="stat-label">Bosses</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${survivors}</span>
                            <span class="stat-label">Survivors</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${npcs}</span>
                            <span class="stat-label">NPCs</span>
                        </div>
                    </div>
                    
                    <div class="intro-description">
                        <p>Explora las habilidades únicas de cada personaje, aprende estrategias avanzadas y domina las mecánicas del juego. Esta wiki contiene toda la información que necesitas para convertirte en un maestro de Deadly Pursuit.</p>
                    </div>

                    <div class="intro-play-btn-wrap">
                        <a class="intro-play-btn" href="https://www.roblox.com/games/86490677615660/Deadly-pursuit" target="_blank" rel="noopener noreferrer">
                            🎮 Jugar en Roblox
                        </a>
                    </div>
                </div>
                
                <h3 class="characters-title">🎭 Selecciona un Personaje</h3>
                <div class="character-grid">
                    ${Object.entries(this.characters).map(([id, char]) => {
                        let roleLabel = 'Survivor';
                        if (char.role === 'killer') roleLabel = 'Killer';
                        if (char.role === 'boss') roleLabel = 'Boss';
                        if (char.role === 'npc') roleLabel = 'NPC';
                        
                        return `
                            <div class="character-card" data-character="${id}">
                                <img src="${char.icon}" alt="${char.name}" onerror="this.src='Assets/images/PlaceHolder.png'">
                                <h4>${char.name}</h4>
                                <span class="role ${char.role}">${roleLabel}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Re-attach event listeners for character cards
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const character = e.currentTarget.dataset.character;
                this.showCharacter(character);
                
                // Update active state in sidebar
                const sidebarLink = document.querySelector(`.nav-section a[data-character="${character}"]`);
                if (sidebarLink) {
                    this.updateActiveNav(sidebarLink);
                }
            });
        });
        
        // Clear active state from all nav links
        document.querySelectorAll('.nav-section a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Set home link as active
        const homeLink = document.querySelector('[data-page="home"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
        
        window.history.pushState({page: 'home'}, '', '#');
    }

    updateActiveNav(activeElement) {
        document.querySelectorAll('.nav-section a').forEach(link => {
            link.classList.remove('active');
        });
        activeElement.classList.add('active');
    }

    shareCharacter(characterId) {
        // Copia el link directo a la wiki con el hash del personaje
        const url = window.location.origin + window.location.pathname + '#' + characterId;
        navigator.clipboard.writeText(url).then(() => {
            // Toast de confirmación
            const toast = document.createElement('div');
            toast.className = 'share-toast';
            toast.textContent = '🔗 Enlace copiado';
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
        });
    }

    _randomLoading() {
        const frases = [
            { text: '"Welcome back..."', color: '#ff4444', font: 'JetBrains Mono' },
            { text: 'Un momento...', color: '#b3b3b3' },
            { text: 'Casi listo', color: '#fbbf24' },
            { text: '¿Sabías que Molly tiene una galleta?', color: '#fbbf24' },
            { text: 'El Bosque Umbral espera', color: '#4ade80' },
            { text: 'iA777 está cargando...', color: '#c084fc' },
            { text: 'Luna tomó su Energy Juice', color: '#60a5fa' },
            { text: 'Bfmp4 está abriendo la tienda', color: '#fbbf24' },
            { text: 'Iris está buscando a iA777', color: '#c084fc' },
            { text: 'AbelitoGamer entró al mapa', color: '#ff4444' },
            { text: '...', color: '#444444', font: 'JetBrains Mono' },
            { text: 'Espera un poco', color: '#b3b3b3' },
            { text: 'iA666 no puede ser stuneado', color: '#ff4444' },
            { text: 'Angel está curando al equipo', color: '#4ade80' },
            { text: 'Gissel desplegó sus alas', color: '#fbbf24' },
            { text: null, img: 'Assets/images/AnkushCat.png', caption: 'Ankush Gato dice hola 🐱', color: '#b3b3b3' },
        ];
        const f = frases[Math.floor(Math.random() * frases.length)];
        if (f.img) {
            return `<div class="loading loading-cat">
                <img src="${f.img}" alt="Ankush Gato" style="width:64px;height:64px;object-fit:contain;image-rendering:pixelated;margin-bottom:0.5rem;">
                <span style="color:${f.color};font-size:0.85rem;">${f.caption}</span>
            </div>`;
        }
        const style = `color:${f.color};${f.font ? `font-family:'${f.font}',monospace;` : ''}`;
        return `<div class="loading"><span style="${style}">${f.text}</span></div>`;
    }

    _injectCharNav(currentId, container) {
        const ids = Object.keys(this.characters);
        const idx = ids.indexOf(currentId);
        const prevId = idx > 0 ? ids[idx - 1] : null;
        const nextId = idx < ids.length - 1 ? ids[idx + 1] : null;

        const btnHtml = (id, dir) => {
            if (!id) return `<div></div>`;
            const char = this.characters[id];
            const arrow = dir === 'next' ? '▶' : '◀';
            const key   = dir === 'next' ? '→' : '←';
            const label = dir === 'next'
                ? `<span class="char-nav-name">${char.name}</span> ${arrow}`
                : `${arrow} <span class="char-nav-name">${char.name}</span>`;
            return `
                <button class="char-nav-btn" onclick="wiki.showCharacter('${id}')">
                    ${label}
                    <span class="char-nav-kbd"><kbd>${key}</kbd></span>
                </button>`;
        };

        const nav = document.createElement('div');
        nav.className = 'char-nav';
        nav.innerHTML = btnHtml(prevId, 'prev') + btnHtml(nextId, 'next');
        container.querySelector('.character-profile')?.appendChild(nav)
            || container.appendChild(nav);

        // Teclas de flecha (solo registra una vez)
        if (!this._navKeyHandler) {
            this._navKeyHandler = (e) => {
                if (e.target.tagName === 'INPUT') return;
                if (e.key === 'ArrowRight' && this._currentCharId) {
                    const i = Object.keys(this.characters).indexOf(this._currentCharId);
                    const next = Object.keys(this.characters)[i + 1];
                    if (next) this.showCharacter(next);
                } else if (e.key === 'ArrowLeft' && this._currentCharId) {
                    const i = Object.keys(this.characters).indexOf(this._currentCharId);
                    const prev = Object.keys(this.characters)[i - 1];
                    if (prev) this.showCharacter(prev);
                }
            };
            document.addEventListener('keydown', this._navKeyHandler);
        }
        this._currentCharId = currentId;
    }

    _initLoreEffects(container) {

        // ── Helper: aplica shake letra por letra ─────────────────
        const applyShake = (el) => {
            if (el.dataset.shakeApplied) return;
            el.dataset.shakeApplied = '1';
            const text = el.textContent;
            el.innerHTML = '';
            [...text].forEach((char, i) => {
                const s = document.createElement('span');
                s.textContent = char === ' ' ? '\u00A0' : char;
                s.style.cssText = `display:inline-block;animation:lore-shake-anim 0.08s infinite;animation-delay:${(i*13)%80}ms;`;
                el.appendChild(s);
            });
        };

        // ── Shake standalone (fuera de dialog) ───────────────────
        container.querySelectorAll('.lore-shake').forEach(applyShake);

        // ── Typewriter standalone ─────────────────────────────────
        container.querySelectorAll('.lore-typewriter').forEach(el => {
            const text = el.textContent;
            el.textContent = '';
            let i = 0;
            const speed = parseInt(el.dataset.speed) || 50;
            const type = () => {
                if (i < text.length) { el.textContent += text[i++]; setTimeout(type, speed); }
                else { setTimeout(() => el.style.borderRight = 'none', 1000); }
            };
            new IntersectionObserver((entries, obs) => {
                if (entries[0].isIntersecting) { obs.disconnect(); setTimeout(type, 300); }
            }).observe(el);
        });

        // ── Lore Dialog ───────────────────────────────────────────
        container.querySelectorAll('.lore-dialog').forEach(dialog => {

            // Recoge páginas desde .lore-page ocultos O desde <template>
            let pages = [];
            const tmpl = dialog.querySelector('template.lore-pages');
            if (tmpl) {
                pages = [...tmpl.content.querySelectorAll('p')].map(p => p.innerHTML.trim());
            } else {
                pages = [...dialog.querySelectorAll('.lore-page')].map(p => p.innerHTML.trim());
            }
            if (!pages.length) { console.warn('[LoreDialog] Sin páginas:', dialog); return; }

            // Key para localStorage basada en el id del dialog o del personaje
            const charId = dialog.id || dialog.closest('[id]')?.id || 'unknown';
            const loreKey = `lore-seen-${charId}`;
            const seenBefore = localStorage.getItem(loreKey) === '1';

            // Elementos del dialog
            const textEl    = dialog.querySelector('.lore-dialog-text');
            const counterEl = dialog.querySelector('.lore-dialog-counter');
            const nextBtn   = dialog.querySelector('.lore-dialog-next');
            const footer    = dialog.querySelector('.lore-dialog-footer');

            if (!textEl || !nextBtn) { console.warn('[LoreDialog] Faltan elementos:', dialog); return; }

            let current = 0;
            let typing  = false;
            let tickTimer = null;

            // ── Muestra todo de golpe ─────────────────────────────
            const showAll = () => {
                localStorage.setItem(loreKey, '1');
                if (tickTimer) clearTimeout(tickTimer);
                // Construye vista completa con separadores
                const full = document.createElement('div');
                full.className = 'lore-dialog-text lore-dialog-full';
                pages.forEach((html, i) => {
                    const p = document.createElement('p');
                    p.innerHTML = html;
                    full.appendChild(p);
                    if (i < pages.length - 1) full.appendChild(document.createElement('br'));
                });
                dialog.innerHTML = '';
                dialog.appendChild(full);
                dialog.querySelectorAll('.lore-shake').forEach(applyShake);
            };

            // ── Botón skip (solo si ya vio antes) ─────────────────
            if (seenBefore && footer) {
                const skipBtn = document.createElement('button');
                skipBtn.className = 'lore-dialog-skip';
                skipBtn.textContent = 'saltar';
                skipBtn.addEventListener('click', showAll);
                footer.prepend(skipBtn);
            }

            // ── Typewriter DOM-aware ──────────────────────────────
            const typewriterRender = (html, onDone) => {
                typing = true;
                textEl.innerHTML = '';

                const src = document.createElement('div');
                src.innerHTML = html;

                const isSlowPage = !!src.querySelector('.lore-shake');
                const speed = isSlowPage ? 100 : 20;

                // Clona estructura vacía
                const cloneStructure = (node) => {
                    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode('');
                    const clone = node.cloneNode(false);
                    node.childNodes.forEach(c => clone.appendChild(cloneStructure(c)));
                    return clone;
                };

                // Recoge text nodes en orden
                const collectTextNodes = (node, arr = []) => {
                    if (node.nodeType === Node.TEXT_NODE) arr.push(node);
                    else node.childNodes.forEach(c => collectTextNodes(c, arr));
                    return arr;
                };

                const liveRoot  = cloneStructure(src);
                const srcNodes  = collectTextNodes(src);
                const liveNodes = collectTextNodes(liveRoot);

                textEl.appendChild(liveRoot);

                const cursor = document.createElement('span');
                cursor.className = 'lore-cursor';
                textEl.appendChild(cursor);

                let ni = 0, ci = 0;
                const tick = () => {
                    if (!typing) return; // cancelado
                    if (ni >= srcNodes.length) {
                        typing = false;
                        cursor.remove();
                        textEl.querySelectorAll('.lore-shake').forEach(applyShake);
                        onDone();
                        return;
                    }
                    const srcNode  = srcNodes[ni];
                    const liveNode = liveNodes[ni];
                    if (ci < srcNode.textContent.length) {
                        liveNode.textContent += srcNode.textContent[ci++];
                    } else { ni++; ci = 0; }
                    tickTimer = setTimeout(tick, speed);
                };
                tick();
            };

            // ── Renderiza una página ──────────────────────────────
            const renderPage = (idx, instant = false) => {
                const html = pages[idx];
                const isLast = idx === pages.length - 1;

                counterEl.textContent = `${idx + 1} / ${pages.length}`;
                nextBtn.innerHTML = isLast
                    ? `Fin <span class="lore-kbd">Z</span>`
                    : `Siguiente ▶ <span class="lore-kbd">Z</span>`;
                nextBtn.style.opacity = '0';

                const onDone = () => { nextBtn.style.opacity = '1'; };

                if (instant) {
                    if (tickTimer) clearTimeout(tickTimer);
                    typing = false;
                    textEl.innerHTML = html;
                    textEl.querySelectorAll('.lore-shake').forEach(applyShake);
                    onDone();
                } else {
                    typewriterRender(html, onDone);
                }
            };

            // ── Avanzar ───────────────────────────────────────────
            const advance = () => {
                if (typing) { renderPage(current, true); return; }
                if (current < pages.length - 1) { current++; renderPage(current); }
                else { showAll(); }
            };

            nextBtn.addEventListener('click', advance);

            // Tecla Z / Enter
            const keyHandler = (e) => {
                if (e.key !== 'z' && e.key !== 'Z' && e.key !== 'Enter') return;
                const r = dialog.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) advance();
            };
            document.addEventListener('keydown', keyHandler);

            // Limpia listener al cambiar de personaje
            new MutationObserver((_, obs) => {
                if (!document.contains(dialog)) {
                    document.removeEventListener('keydown', keyHandler);
                    if (tickTimer) clearTimeout(tickTimer);
                    obs.disconnect();
                }
            }).observe(document.body, { childList: true, subtree: false });

            renderPage(0);
        });
    }

    handleRouting() {
        const hash = window.location.hash.slice(1);
        if (hash && this.characters[hash]) {
            this.showCharacter(hash);
            const navLink = document.querySelector(`[data-character="${hash}"]`);
            if (navLink) this.updateActiveNav(navLink);
        } else if (hash === 'gameplay') {
            this.showGameplayPage();
            const navLink = document.querySelector(`[data-page="gameplay"]`);
            if (navLink) this.updateActiveNav(navLink);
        } else if (hash && ['tips'].includes(hash)) {
            this.showPage(hash);
            const navLink = document.querySelector(`[data-page="${hash}"]`);
            if (navLink) this.updateActiveNav(navLink);
        } else if (hash) {
            // Hash desconocido — mostrar página 404
            this.show404(hash);
        } else {
            // Sin hash — marcar Introducción como activo
            const homeLink = document.querySelector('[data-page="home"]');
            if (homeLink) this.updateActiveNav(homeLink);
        }

        window.addEventListener('popstate', (e) => {
            if (e.state?.character) {
                this.showCharacter(e.state.character);
            } else if (e.state?.page) {
                if (e.state.page === 'gameplay') {
                    this.showGameplayPage();
                } else if (e.state.page === '404') {
                    this.show404(e.state.badHash);
                } else {
                    this.showPage(e.state.page);
                }
            }
        });
    }

    show404(badHash = '') {
        const content = document.getElementById('character-content');
        const escaped = badHash.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const mensajes = [
            'no existe we, alguien te mandó basura',
            'ese link está más roto que mis ganas de documentar',
            'ni idea de dónde sacaste eso',
            'te perdiste o te perdieron',
            'eso no existe, punto',
            'revisa el link porque algo está mal ahí',
            'bro eso nunca existió',
            'te mandaron mal el link o lo escribiste tú mal, cualquiera de las dos',
            'no está, no estuvo, no estará',
            'alguien compartió esto sin probarlo primero lol',
            'ese personaje vive en tu cabeza nomás',
            'ni yo sé cómo llegaste aquí',
            'eso no sale ni en el lore alternativo',
            'te fuiste por las ramas y ya no hay wiki',
            'error tuyo o de quien te mandó esto, no nuestro',
        ];
        const pick = arr => arr[Math.floor(Math.random() * arr.length)];

        content.innerHTML = `
            <div class="wiki-404">
                <div class="wiki-404-code">
                    <span class="neon-digit" data-char="4">4</span>
                    <span class="neon-digit" data-char="0">0</span>
                    <span class="neon-digit" data-char="4">4</span>
                </div>
                <h2 class="wiki-404-title">Página no encontrada</h2>
                <p class="wiki-404-msg">
                    El enlace <code>#${escaped}</code> no existe en esta wiki, o te lo inventaste o está mal ${Math.random() < 0.001 ? 'escroto' : 'escrito'}.<br>
                    <span style="color:var(--text-muted);font-size:0.85em;">${pick(mensajes)}</span>
                </p>
                <img src="Assets/images/AnkushCat.png" alt="Ankush Gato" class="wiki-404-cat">
                <button class="wiki-404-btn" onclick="wiki.showHome(); window.history.replaceState({page:'home'}, '', '#');">
                    ← Volver al inicio
                </button>
            </div>
        `;

        // Parpadeo aleatorio: rara vez, en un dígito al azar
        const digits = content.querySelectorAll('.neon-digit');
        const flicker = () => {
            // Espera entre 4 y 12 segundos antes del próximo parpadeo
            const delay = 4000 + Math.random() * 8000;
            setTimeout(() => {
                // Elige un dígito al azar
                const target = digits[Math.floor(Math.random() * digits.length)];
                target.classList.add('neon-flicker');
                // El parpadeo dura ~400ms, luego se quita la clase
                setTimeout(() => {
                    target.classList.remove('neon-flicker');
                    flicker(); // programa el siguiente
                }, 400);
            }, delay);
        };
        flicker();

        window.history.replaceState({ page: '404', badHash }, '', `#${badHash}`);
    }

    async showChangelog() {
        const backdrop = document.getElementById('changelog-backdrop');
        const drawer = document.getElementById('changelog-drawer');
        const body = document.getElementById('changelog-body');

        backdrop.classList.add('active');
        drawer.classList.add('active');
        body.innerHTML = this._randomLoading();

        // Forzar scroll nativo directo
        body.style.cssText = `
            overflow-y: scroll !important;
            height: calc(100vh - 64px) !important;
            display: block !important;
            padding: 1.25rem;
            box-sizing: border-box;
        `;

        try {
            const res = await fetch('Assets/data/updates.json?v=' + Date.now());
            const data = await res.json();

            // Función para procesar [icon:nombre] a iconos Lucide
            const processIcons = (text) => {
                return text.replace(/\[icon:([^\]]+)\]/g, (match, iconName) => {
                    return `<i data-lucide="${iconName}" style="width:1em;height:1em;display:inline-block;vertical-align:middle;margin:0 0.2em;"></i>`;
                });
            };

            const renderEntry = (update) => {
                const date = new Date(update.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
                return `
                    <div class="changelog-entry" style="margin-bottom:1rem;">
                        <div class="changelog-entry-header">
                            <span class="changelog-version">v${update.version}</span>
                            <span class="changelog-title">${processIcons(update.title)}</span>
                            <span class="changelog-type-badge ${update.type}">${update.type}</span>
                            <span class="changelog-date">${date}</span>
                        </div>
                        <div class="changelog-changes">
                            ${update.changes.map(c => `
                                <div style="margin-bottom:0.6rem;">
                                    <div class="changelog-category">${processIcons(c.category)}</div>
                                    <ul class="changelog-items">
                                        ${c.items.map(i => `<li>${processIcons(i)}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                        ${update.notes ? `<div class="changelog-notes">📝 ${processIcons(update.notes)}</div>` : ''}
                    </div>
                `;
            };

            const [latest, ...older] = data.updates;
            let html = renderEntry(latest);

            if (older.length > 0) {
                html += `
                    <button class="changelog-older-btn" id="older-btn" onclick="wiki.toggleOlderChangelog()">
                        <span>🕘 Ver versiones anteriores (${older.length})</span>
                        <span class="btn-arrow">▼</span>
                    </button>
                    <div class="changelog-older-entries" id="older-entries">
                        ${older.map(renderEntry).join('')}
                    </div>
                `;
            }

            if (data.roadmap?.length) {
                html += `
                    <div class="changelog-roadmap" style="margin-top:1rem;">
                        <div class="changelog-roadmap-title">🗺️ Roadmap</div>
                        ${data.roadmap.map(r => `
                            <div class="roadmap-item">
                                <span class="roadmap-version">v${r.version}</span>
                                <span class="roadmap-status ${r.status}">${r.status}</span>
                                <ul class="roadmap-features">
                                    ${r.features.map(f => `<li>${processIcons(f)}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                    <div style="height:1rem;"></div>
                `;
            }

            body.innerHTML = html;
            
            // Inicializar iconos Lucide después de renderizar
            lucide.createIcons();

        } catch (e) {
            body.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">No se pudo cargar el historial de cambios.</p>';
        }
    }

    toggleOlderChangelog() {
        const btn = document.getElementById('older-btn');
        const entries = document.getElementById('older-entries');
        const isOpen = entries.classList.toggle('open');
        btn.classList.toggle('open', isOpen);
        btn.querySelector('span:first-child').textContent = isOpen
            ? '🕘 Ocultar versiones anteriores'
            : `🕘 Ver versiones anteriores`;
    }

    closeChangelog() {
        document.getElementById('changelog-backdrop').classList.remove('active');
        document.getElementById('changelog-drawer').classList.remove('active');
        const body = document.getElementById('changelog-body');
        if (body) {
            body.style.cssText = '';
            body.innerHTML = '<div class="loading">Cargando...</div>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    wiki = new DeadlyPursuerWiki();
});

let wiki;