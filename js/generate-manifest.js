const fs = require('fs');

// Leer updates.json
const updates = JSON.parse(fs.readFileSync('./updates.json', 'utf8'));
const version = updates.version;

// Crear manifest.json con la versión actualizada
const manifest = {
  "name": `FenixLaboratory v${version}`,
  "short_name": "FenixLab",
  "description": "Portfolio interactivo con juegos multijugador, guestbook artístico, sistema de logros y secciones colapsables animadas",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#ff6b35",
  "orientation": "any",
  "scope": "./",
  "lang": "es",
  "categories": ["productivity", "developer", "portfolio", "games"],
  "prefer_related_applications": false,
  "edge_side_panel": {
    "preferred_width": 400
  },
  "launch_handler": {
    "client_mode": "navigate-existing"
  },
  "icons": [
    {
      "src": "favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "maskable"
    },
    {
      "src": "placeholder/GHbDEIgXMAACVEi.jpg",
      "sizes": "192x192",
      "type": "image/jpeg",
      "purpose": "any"
    },
    {
      "src": "placeholder/GzyBNcWWsAEcgbH.jpg",
      "sizes": "512x512",
      "type": "image/jpeg",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
      "name": "Ver Proyectos",
      "short_name": "Proyectos",
      "description": "Ver todos mis proyectos de GitHub",
      "url": "./index.html#proyectos",
      "icons": [{ "src": "favicon.svg", "sizes": "96x96" }]
    },
    {
      "name": "Logros",
      "short_name": "Logros",
      "description": "Ver mis logros y puntos",
      "url": "./index.html#logros",
      "icons": [{ "src": "favicon.svg", "sizes": "96x96" }]
    },
    {
      "name": "Plushie Hunt",
      "short_name": "Plushies",
      "description": "Buscar los 40 plushies escondidos",
      "url": "./index.html",
      "icons": [{ "src": "favicon.svg", "sizes": "96x96" }]
    }
  ]
};

// Escribir manifest.json
fs.writeFileSync('./manifest.json', JSON.stringify(manifest, null, 2));
console.log(`✅ manifest.json actualizado a v${version}`);
