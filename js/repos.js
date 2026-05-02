// repos.js - Sistema de gestión de repositorios de GitHub
// Extraído de index.html para mejor organización

const user = 'thisisfenix';
let allRepos = [];
let filteredRepos = [];
let currentPage = 1;
const reposPerPage = 6; // Aumentado de 4 a 6 para mejor visualización

// Cache para repos
const CACHE_KEY = 'fenix-repos-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Cache para detección de páginas
const PAGES_CACHE_KEY = 'fenix-pages-detection';
const PAGES_CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// Función para verificar si un repo tiene archivos web (HTML, CSS, JS)
async function hasWebFiles(repoName) {
  try {
    // Si es el repo actual (thisisfenix.github.io o FenixLaboratory), obviamente tiene página web
    const currentRepoNames = ['thisisfenix.github.io', 'FenixLaboratory'];
    if (currentRepoNames.some(name => repoName.toLowerCase() === name.toLowerCase())) {
      return true; // Estamos literalmente en esta página web lol
    }

    // Verificar cache primero
    const cached = localStorage.getItem(PAGES_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < PAGES_CACHE_DURATION && data[repoName] !== undefined) {
        return data[repoName];
      }
    }

    // Buscar archivos HTML, CSS o JS en el repo
    const response = await fetch(`https://api.github.com/repos/${user}/${repoName}/contents`);
    if (!response.ok) return false;

    const files = await response.json();
    
    // Verificar si hay archivos web
    const hasWebContent = files.some(file => {
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.html') || 
             fileName.endsWith('.css') || 
             fileName.endsWith('.js') ||
             fileName === 'index.html';
    });

    // Guardar en cache
    const cacheData = cached ? JSON.parse(cached).data : {};
    cacheData[repoName] = hasWebContent;
    localStorage.setItem(PAGES_CACHE_KEY, JSON.stringify({
      data: cacheData,
      timestamp: Date.now()
    }));

    return hasWebContent;
  } catch (error) {
    console.warn(`No se pudo verificar archivos web para ${repoName}:`, error);
    return false; // Por defecto no mostrar demo si hay error
  }
}

function loadImage(imgElement, localSrc, remoteSrc, placeholderSrc) {
  imgElement.src = localSrc;
  imgElement.onerror = () => {
    imgElement.onerror = () => imgElement.src = placeholderSrc;
    imgElement.src = remoteSrc;
  };
}

async function displayRepos(repos, page = 1) {
  const container = document.getElementById('repos-container');
  container.innerHTML = '';

  const startIndex = (page - 1) * reposPerPage;
  const endIndex = startIndex + reposPerPage;
  const paginatedRepos = repos.slice(startIndex, endIndex);

  // Crear todas las cards primero
  const cardPromises = paginatedRepos.map(async (repo) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-language', repo.language ? repo.language.toLowerCase() : 'other');

    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.alt = `Vista previa de ${repo.name}`;

    const localImagePath = `img/localPreviews/${repo.name}.png`;
    const remoteImagePath = `https://raw.githubusercontent.com/${user}/${repo.name}/main/preview.png`;
    const placeholderImage = 'placeholder/GHbDEIgXMAACVEi.jpg';

    loadImage(img, localImagePath, remoteImagePath, placeholderImage);

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = repo.name.replace(/-/g, ' ');

    const timeline = document.createElement('div');
    timeline.className = 'card-timeline';
    const commitDate = new Date(repo.updated_at);
    const daysSince = Math.floor((new Date() - commitDate) / (1000 * 60 * 60 * 24));
    timeline.innerHTML = `
      <div class="commit-dot"></div>
      <span>Actualizado hace ${daysSince} días</span>
    `;

    const desc = document.createElement('p');
    desc.className = 'card-text';
    desc.textContent = repo.description || 'Sin descripción';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    const btnCode = document.createElement('a');
    btnCode.className = 'btn btn-outline-neon';
    btnCode.href = repo.html_url;
    btnCode.target = '_blank';
    btnCode.innerHTML = '<i class="bi bi-code me-1"></i> Código';
    btnCode.onclick = (e) => {
      e.stopPropagation();
      if (typeof trackCodeView === 'function') trackCodeView(repo.name);
    };

    btnGroup.appendChild(btnCode);

    // Verificar si tiene archivos web de forma asíncrona
    const hasWeb = await hasWebFiles(repo.name);
    
    // Verificar si es el repo actual
    const currentRepoNames = ['thisisfenix.github.io', 'FenixLaboratory'];
    const isCurrentRepo = currentRepoNames.some(name => repo.name.toLowerCase() === name.toLowerCase());
    
    if (hasWeb) {
      if (isCurrentRepo) {
        // Si es el repo actual, mostrar indicador especial
        const currentPage = document.createElement('span');
        currentPage.className = 'btn btn-outline-neon';
        currentPage.style.cssText = 'background: rgba(var(--primary-rgb, 255,107,53), 0.15); cursor: default; border-color: var(--primary);';
        currentPage.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Estás aquí';
        btnGroup.appendChild(currentPage);
      } else {
        const btnDemo = document.createElement('a');
        btnDemo.className = 'btn btn-outline-neon';
        btnDemo.href = `https://${user}.github.io/${repo.name}`;
        btnDemo.target = '_blank';
        btnDemo.innerHTML = '<i class="bi bi-box-arrow-up-right me-1"></i> Demo';
        btnDemo.onclick = (e) => {
          e.stopPropagation();
          if (typeof trackDemo === 'function') trackDemo(repo.name);
        };
        btnGroup.appendChild(btnDemo);
      }
    } else {
      // Agregar indicador de que no tiene demo
      const noDemo = document.createElement('span');
      noDemo.className = 'btn btn-outline-neon';
      noDemo.style.cssText = 'opacity: 0.5; cursor: not-allowed; pointer-events: none;';
      noDemo.innerHTML = '<i class="bi bi-x-circle me-1"></i> Sin Demo';
      btnGroup.appendChild(noDemo);
    }

    body.appendChild(title);
    body.appendChild(timeline);
    body.appendChild(desc);
    body.appendChild(btnGroup);

    card.appendChild(img);
    card.appendChild(body);
    
    return card;
  });

  // Esperar a que todas las cards se creen
  const cards = await Promise.all(cardPromises);
  cards.forEach(card => container.appendChild(card));

  // Añadir card de "Próximamente" al final
  const comingSoonCard = document.createElement('div');
  comingSoonCard.className = 'card';
  comingSoonCard.style.cssText = 'border: 2px dashed var(--primary); opacity: 0.7;';
  
  const comingSoonImg = document.createElement('div');
  comingSoonImg.className = 'card-img-top';
  comingSoonImg.style.cssText = `
    background-image: url('placeholder/GzyBNcWWsAEcgbH.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  `;
  
  const comingSoonBody = document.createElement('div');
  comingSoonBody.className = 'card-body';
  comingSoonBody.innerHTML = `
    <h5 class="card-title" style="text-align: center;">Próximamente</h5>
    <p class="card-text" style="text-align: center;">Algo relacionado con awshuck está en camino... 👀<br><small style="opacity: 0.7;">Más detalles en updates.json</small></p>
    <div class="d-flex justify-content-center align-items-center mb-3">
      <small style="color: var(--text-secondary);">
        <i class="fas fa-clock me-1"></i>En desarrollo
      </small>
    </div>
    <div class="btn-group">
      <button class="btn btn-outline-neon" disabled>
        <i class="fas fa-hourglass-half me-1"></i>Esperando
      </button>
    </div>
  `;
  
  comingSoonCard.appendChild(comingSoonImg);
  comingSoonCard.appendChild(comingSoonBody);
  container.appendChild(comingSoonCard);

  updatePagination(repos.length, page);
}

function updatePagination(totalRepos, currentPage) {
  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(totalRepos / reposPerPage);

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let paginationHTML = '';

  // Botón anterior
  if (currentPage > 1) {
    paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage - 1})" aria-label="Página anterior">
      <i class="bi bi-chevron-left"></i> Anterior
    </button>`;
  }

  // Mostrar páginas con límite inteligente
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Ajustar si estamos cerca del final
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Primera página si no está visible
  if (startPage > 1) {
    paginationHTML += `<button class="page-btn" onclick="changePage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="page-ellipsis">...</span>`;
    }
  }

  // Páginas visibles
  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    paginationHTML += `<button class="page-btn ${activeClass}" onclick="changePage(${i})" aria-label="Página ${i}" ${i === currentPage ? 'aria-current="page"' : ''}>${i}</button>`;
  }

  // Última página si no está visible
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="page-ellipsis">...</span>`;
    }
    paginationHTML += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
  }

  // Botón siguiente
  if (currentPage < totalPages) {
    paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage + 1})" aria-label="Página siguiente">
      Siguiente <i class="bi bi-chevron-right"></i>
    </button>`;
  }

  pagination.innerHTML = paginationHTML;
}

function changePage(page) {
  currentPage = page;
  displayRepos(filteredRepos, page);
}

function filterRepos(language) {
  if (language === 'all') {
    filteredRepos = allRepos;
  } else {
    filteredRepos = allRepos.filter(repo =>
      repo.language && repo.language.toLowerCase() === language
    );
  }
  currentPage = 1;
  displayRepos(filteredRepos, 1);
}

function searchRepos(query) {
  if (!query) {
    filteredRepos = allRepos;
  } else {
    filteredRepos = allRepos.filter(repo =>
      repo.name.toLowerCase().includes(query.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(query.toLowerCase()))
    );
  }
  currentPage = 1;
  displayRepos(filteredRepos, 1);
}

function sortRepos(sortBy) {
  filteredRepos.sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return b.stargazers_count - a.stargazers_count;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'updated':
      default:
        return new Date(b.updated_at) - new Date(a.updated_at);
    }
  });
  currentPage = 1;
  displayRepos(filteredRepos, 1);
}

async function fetchRepos() {
  try {
    // Verificar cache primero
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        allRepos = data;
        filteredRepos = data;
        displayRepos(data);
        // Actualizar contador del hero
        const heroRepos = document.getElementById('hero-repos');
        if (heroRepos) heroRepos.textContent = data.length + '+';
        return;
      }
    }
    
    const response = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=100`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const repos = await response.json();
    
    // Guardar en cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: repos,
      timestamp: Date.now()
    }));
    
    allRepos = repos;
    filteredRepos = repos;
    displayRepos(repos);

    // Actualizar contador del hero
    const heroRepos = document.getElementById('hero-repos');
    if (heroRepos) heroRepos.textContent = repos.length + '+';

  } catch (error) {
    console.error('Error al cargar repositorios:', error);
    const container = document.getElementById('repos-container');
    container.innerHTML = '<p class="text-center">Error al cargar los proyectos. Intente más tarde.</p>';
  }
}
