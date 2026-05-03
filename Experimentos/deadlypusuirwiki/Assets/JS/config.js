/**
 * config.js — Panel de configuración de la Deadly Pursuit Wiki
 * Maneja: tema, gato arrastrable, física, localStorage
 */

const WikiConfig = (() => {

    const CFG_KEY = 'dpwiki-config';

    const defaults = {
        theme:      'dark',
        catVisible: false,
        catSize:    56,
        gravity:    false,
        bunny:      false
    };

    // ── localStorage ─────────────────────────────────────────────
    const load = () => {
        try { return { ...defaults, ...JSON.parse(localStorage.getItem(CFG_KEY)) }; }
        catch { return { ...defaults }; }
    };

    const save = (patch) => {
        localStorage.setItem(CFG_KEY, JSON.stringify({ ...load(), ...patch }));
    };

    // ── Helpers UI ───────────────────────────────────────────────
    const applyTheme = (theme) => {
        document.body.classList.toggle('theme-light', theme === 'light');
        document.querySelectorAll('.config-theme-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.theme === theme);
        });
    };

    const applyToggle = (id, value) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.dataset.on  = value.toString();
        btn.textContent = value ? 'ON' : 'OFF';
    };

    const applyCatSize = (cat, size) => {
        cat.style.width  = size + 'px';
        cat.style.height = size + 'px';
        const slider = document.getElementById('cat-size');
        if (slider) slider.value = size;
    };

    // ── Sidebar móvil ────────────────────────────────────────────
    const initMobileSidebar = () => {
        const toggle  = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.fixed-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!toggle || !sidebar) return;

        const open  = () => { sidebar.classList.add('open');    overlay?.classList.add('active'); };
        const close = () => { sidebar.classList.remove('open'); overlay?.classList.remove('active'); };

        toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
        overlay?.addEventListener('click', close);

        sidebar.querySelectorAll('[data-character], [data-page]').forEach(el => {
            el.addEventListener('click', () => { if (window.innerWidth <= 768) close(); });
        });
    };

    // ── Gato arrastrable + física ────────────────────────────────
    const initCat = (cfg) => {
        const cat = document.getElementById('ankush-cat');
        if (!cat) return;

        let ox = 0, oy = 0, dragging = false;
        let x = window.innerWidth - 80, y = window.innerHeight - 80;
        let vx = 0, vy = 0;
        let gravityOn = cfg.gravity;
        let bunnyOn   = cfg.bunny;
        let rabbitOn  = cfg.rabbit || false;
        let lastTime  = null;

        const GRAVITY     = 0.5;
        const BOUNCE      = 0.55;   // gravedad normal: pierde energía
        const BOUNCE_RABBIT = 1.0;  // modo conejo: rebote perfecto
        const FRICTION    = 0.98;
        const BUNNY_SPEED = 4;

        // Aplica estado inicial
        cat.style.display = cfg.catVisible ? '' : 'none';
        applyCatSize(cat, cfg.catSize);
        applyToggle('toggle-cat',     cfg.catVisible);
        applyToggle('toggle-gravity', cfg.gravity);
        applyToggle('toggle-bunny',   cfg.bunny);

        if (bunnyOn && Math.abs(vx) < 1 && Math.abs(vy) < 1) {
            const a = Math.random() * Math.PI * 2;
            vx = Math.cos(a) * BUNNY_SPEED;
            vy = Math.sin(a) * BUNNY_SPEED;
        }

        const setPos = () => {
            cat.style.left   = x + 'px';
            cat.style.top    = y + 'px';
            cat.style.right  = 'auto';
            cat.style.bottom = 'auto';
        };
        setPos();

        // Loop de física con deltaTime normalizado a 60fps
        const physicsLoop = (ts) => {
            const dt = lastTime ? Math.min((ts - lastTime) / (1000 / 60), 3) : 1;
            lastTime = ts;

            if (!dragging) {
                const maxX = window.innerWidth  - cat.offsetWidth;
                const maxY = window.innerHeight - cat.offsetHeight;

                if (bunnyOn) {
                    // Modo DVD: rebota sin gravedad
                    x += vx * dt; y += vy * dt;
                    if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
                    if (x <= 0)    { x = 0;    vx =  Math.abs(vx); }
                    if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }
                    if (y <= 0)    { y = 0;    vy =  Math.abs(vy); }
                    setPos();
                } else if (rabbitOn) {
                    // Modo Conejo: gravedad con rebote perfecto, nunca pierde energía
                    vy += GRAVITY * dt;
                    x  += vx * dt; y += vy * dt;
                    if (y >= maxY) { y = maxY; vy = -Math.abs(vy) * BOUNCE_RABBIT; }
                    if (y < 0)     { y = 0;    vy =  Math.abs(vy) * BOUNCE_RABBIT; }
                    if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
                    if (x < 0)     { x = 0;    vx =  Math.abs(vx); }
                    setPos();
                } else if (gravityOn) {
                    vy += GRAVITY * dt;
                    vx *= Math.pow(FRICTION, dt);
                    x  += vx * dt; y += vy * dt;
                    if (y >= maxY) { y = maxY; vy = -Math.abs(vy) * BOUNCE; vx *= FRICTION; if (Math.abs(vy) < 1) vy = 0; }
                    if (y < 0)     { y = 0;    vy =  Math.abs(vy) * BOUNCE; }
                    if (x >= maxX) { x = maxX; vx = -Math.abs(vx) * BOUNCE; }
                    if (x < 0)     { x = 0;    vx =  Math.abs(vx) * BOUNCE; }
                    setPos();
                } else {
                    lastTime = null;
                }
            } else {
                lastTime = null;
            }

            requestAnimationFrame(physicsLoop);
        };
        requestAnimationFrame(physicsLoop);

        // Drag
        const startDrag = (cx, cy) => {
            const r = cat.getBoundingClientRect();
            ox = cx - r.left; oy = cy - r.top;
            dragging = true; vx = 0; vy = 0;
            cat.style.transition = 'none';
        };
        const moveDrag = (cx, cy) => {
            if (!dragging) return;
            const nx = cx - ox, ny = cy - oy;
            vx = nx - x; vy = ny - y;
            x = nx; y = ny;
            setPos();
        };
        const endDrag = () => { dragging = false; cat.style.transition = ''; };

        cat.addEventListener('mousedown', e => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
        document.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
        document.addEventListener('mouseup', endDrag);
        cat.addEventListener('touchstart', e => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        document.addEventListener('touchmove', e => moveDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        document.addEventListener('touchend', endDrag);

        // Toggles
        document.getElementById('toggle-cat')?.addEventListener('click', function() {
            const next = this.dataset.on !== 'true';
            applyToggle('toggle-cat', next);
            cat.style.display = next ? '' : 'none';
            save({ catVisible: next });
        });

        document.getElementById('toggle-gravity')?.addEventListener('click', function() {
            gravityOn = this.dataset.on !== 'true';
            applyToggle('toggle-gravity', gravityOn);
            if (!gravityOn) { vx = 0; vy = 0; }
            save({ gravity: gravityOn });
        });

        document.getElementById('toggle-bunny')?.addEventListener('click', function() {
            bunnyOn = this.dataset.on !== 'true';
            applyToggle('toggle-bunny', bunnyOn);
            if (bunnyOn) {
                gravityOn = false; rabbitOn = false;
                applyToggle('toggle-gravity', false);
                applyToggle('toggle-rabbit', false);
                save({ gravity: false, rabbit: false });
                if (Math.abs(vx) < 1 && Math.abs(vy) < 1) {
                    const a = Math.random() * Math.PI * 2;
                    vx = Math.cos(a) * BUNNY_SPEED;
                    vy = Math.sin(a) * BUNNY_SPEED;
                }
            } else { vx = 0; vy = 0; }
            save({ bunny: bunnyOn });
        });

        document.getElementById('toggle-rabbit')?.addEventListener('click', function() {
            rabbitOn = this.dataset.on !== 'true';
            applyToggle('toggle-rabbit', rabbitOn);
            if (rabbitOn) {
                bunnyOn = false; gravityOn = false;
                applyToggle('toggle-bunny', false);
                applyToggle('toggle-gravity', false);
                save({ bunny: false, gravity: false });
                // Velocidad horizontal inicial si estaba quieto
                if (Math.abs(vx) < 1) vx = (Math.random() > 0.5 ? 1 : -1) * 3;
            } else { vx = 0; vy = 0; }
            save({ rabbit: rabbitOn });
        });

        document.getElementById('cat-size')?.addEventListener('input', function() {
            applyCatSize(cat, parseInt(this.value));
            save({ catSize: parseInt(this.value) });
        });
    };

    // ── Panel de configuración ───────────────────────────────────
    const initPanel = () => {
        const configBtn   = document.getElementById('config-btn');
        const configPanel = document.getElementById('config-panel');
        const configClose = document.getElementById('config-close');
        const configBack  = document.getElementById('config-backdrop');

        const open  = () => { configPanel?.classList.add('active');    configBack?.classList.add('active'); };
        const close = () => { configPanel?.classList.remove('active'); configBack?.classList.remove('active'); };

        configBtn?.addEventListener('click', open);
        configClose?.addEventListener('click', close);
        configBack?.addEventListener('click', close);

        // Tema
        document.querySelectorAll('.config-theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                applyTheme(btn.dataset.theme);
                save({ theme: btn.dataset.theme });
            });
        });

        // Font uploader — solo una fuente a la vez, persiste en IndexedDB
        const fontInput   = document.getElementById('config-font-input');
        const fontPreview = document.getElementById('config-font-preview');
        const resetFont   = document.getElementById('config-reset-font');
        const fontLabel   = document.querySelector('.config-font-label');

        const MAX_FONT_SIZE = 5 * 1024 * 1024; // 5 MB
        const IDB_NAME      = 'dpwiki-fonts';
        const IDB_STORE     = 'fonts';
        const IDB_KEY       = 'custom';

        // ── IndexedDB helpers ────────────────────────────────────
        const openDB = () => new Promise((res, rej) => {
            const req = indexedDB.open(IDB_NAME, 1);
            req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
            req.onsuccess = e => res(e.target.result);
            req.onerror   = e => rej(e.target.error);
        });

        const idbSaveFont = async (blob, name) => {
            const db = await openDB();
            return new Promise((res, rej) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put({ blob, name }, IDB_KEY);
                tx.oncomplete = res;
                tx.onerror    = e => rej(e.target.error);
            });
        };

        const idbLoadFont = async () => {
            const db = await openDB();
            return new Promise((res, rej) => {
                const req = db.transaction(IDB_STORE).objectStore(IDB_STORE).get(IDB_KEY);
                req.onsuccess = e => res(e.target.result || null);
                req.onerror   = e => rej(e.target.error);
            });
        };

        const idbDeleteFont = async () => {
            const db = await openDB();
            return new Promise((res, rej) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).delete(IDB_KEY);
                tx.oncomplete = res;
                tx.onerror    = e => rej(e.target.error);
            });
        };

        // ── Aplica una fuente desde un Blob ──────────────────────
        const applyFontBlob = (blob, name) => {
            const url   = URL.createObjectURL(blob);
            const style = document.createElement('style');
            style.id    = 'custom-font-style';
            style.textContent = `
                @font-face { font-family: 'UserCustomFont'; src: url('${url}'); }
                body, .markdown-content p, .markdown-content li,
                .markdown-content td, .lore-dialog-text,
                .nav-section a, .character-card h4 {
                    font-family: 'UserCustomFont', 'Inter', sans-serif !important;
                }
            `;
            document.getElementById('custom-font-style')?.remove();
            document.head.appendChild(style);
            if (fontPreview) fontPreview.textContent = `✓ ${name}`;
        };

        const hasFontLoaded = () => !!document.getElementById('custom-font-style');

        const updateFontUI = () => {
            const loaded = hasFontLoaded();
            if (fontLabel) fontLabel.style.opacity       = loaded ? '0.4' : '1';
            if (fontLabel) fontLabel.style.pointerEvents = loaded ? 'none' : '';
            if (fontInput) fontInput.disabled            = loaded;
        };

        // ── Restaurar fuente guardada al cargar ──────────────────
        idbLoadFont().then(entry => {
            if (entry) {
                applyFontBlob(entry.blob, entry.name);
                updateFontUI();
            }
        }).catch(() => {});

        // Estado inicial
        updateFontUI();

        fontInput?.addEventListener('change', () => {
            if (hasFontLoaded()) { fontInput.value = ''; return; }
            const file = fontInput.files[0];
            if (!file) return;

            if (file.size > MAX_FONT_SIZE) {
                if (fontPreview) fontPreview.textContent = `⚠ Archivo muy grande (máx 5 MB)`;
                fontInput.value = '';
                return;
            }

            applyFontBlob(file, file.name);
            idbSaveFont(file, file.name).catch(() => {});
            updateFontUI();
        });

        resetFont?.addEventListener('click', () => {
            document.getElementById('custom-font-style')?.remove();
            if (fontPreview) fontPreview.textContent = '';
            if (fontInput)   fontInput.value = '';
            idbDeleteFont().catch(() => {});
            updateFontUI();
        });
    };

    // ── Init ─────────────────────────────────────────────────────
    const init = () => {
        const cfg = load();
        applyTheme(cfg.theme);
        initMobileSidebar();
        initCat(cfg);
        initPanel();
    };

    return { init, load, save };

})();

document.addEventListener('DOMContentLoaded', () => WikiConfig.init());
