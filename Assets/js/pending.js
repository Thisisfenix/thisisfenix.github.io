let pendingDb;

if (typeof firebase !== 'undefined') {
  pendingDb = firebase.firestore();
}

let allPending = [];

document.addEventListener('DOMContentLoaded', () => {
  loadPendingEntries();
});

async function loadPendingEntries() {
  const grid = document.getElementById('pending-grid');
  grid.innerHTML = '<div class="loading">Cargando entradas pendientes</div>';
  
  try {
    const snapshot = await pendingDb.collection('pending_characters')
      .where('status', '==', 'pending')
      .get();
    
    allPending = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    allPending.sort((a, b) => {
      const timeA = a.timestamp?.toMillis() || 0;
      const timeB = b.timestamp?.toMillis() || 0;
      return timeB - timeA;
    });
    
    if (allPending.length === 0) {
      grid.innerHTML = '<p class="text-center">No hay entradas pendientes</p>';
      return;
    }
    
    grid.innerHTML = allPending.map(char => `
      <div class="character-card" onclick="showPreview('${char.id}')" style="cursor:pointer;">
        <img src="${char.iconos?.[0] || 'https://via.placeholder.com/100'}" 
             alt="${char.nombre}" 
             class="character-icon">
        <h3>${char.nombre}</h3>
        <p class="text-center text-muted">${char.tipo_entrada === 'mundo' ? '🌍 Mundo/Lore' : '👤 Personaje'}</p>
        <p class="text-center text-muted" style="font-size:0.8rem;">Por: ${char.discord}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<p class="text-center">Error al cargar</p>';
  }
}

function showPreview(id) {
  const char = allPending.find(c => c.id === id);
  if (!char) return;
  
  const grid = document.getElementById('pending-grid');
  grid.innerHTML = `
    <button class="btn btn-outline-light mb-3" onclick="loadPendingEntries()">
      <i class="bi bi-arrow-left"></i> Volver
    </button>
    
    <div style="background: var(--bg-dark); border: 2px solid var(--primary); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1 style="color: var(--primary); margin: 0; font-size: 3rem; font-weight: bold;">${char.nombre}</h1>
        <span class="badge bg-warning text-dark" style="font-size: 1rem; padding: 0.5rem 1rem;">PENDIENTE</span>
      </div>
      
      <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
        <button class="tab-btn active" onclick="switchTab(event, 'info')" style="background: none; border: none; color: var(--primary); font-size: 1.2rem; font-weight: bold; cursor: pointer; padding: 0.5rem 1rem; border-bottom: 3px solid var(--primary);">Informacion principal</button>
        <button class="tab-btn" onclick="switchTab(event, 'galeria')" style="background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; font-weight: bold; cursor: pointer; padding: 0.5rem 1rem;">Galeria</button>
        <button class="tab-btn" onclick="switchTab(event, 'opiniones')" style="background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; font-weight: bold; cursor: pointer; padding: 0.5rem 1rem;">Opiniones</button>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 400px; gap: 2rem;">
        <!-- Contenido izquierdo -->
        <div>
          <!-- Alertas de información -->
          ${char.estado_personaje === 'wip' || char.estado_personaje === 'no-definido' ? `
            <div style="background: linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,152,0,0.1)); border-left: 4px solid #ffc107; padding: 1.5rem; margin-bottom: 2rem; border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <i class="bi bi-exclamation-triangle" style="color: #ffc107; font-size: 1.5rem;"></i>
                <strong style="color: #ffc107;">Aviso:</strong>
              </div>
              <p style="color: var(--text-color); margin: 0;">Esta entrada está en desarrollo. La información puede cambiar o expandirse en el futuro.</p>
            </div>
          ` : ''}
          
          <div style="background: linear-gradient(135deg, rgba(var(--primary-rgb, 138,43,226),0.1), rgba(var(--primary-rgb, 138,43,226),0.05)); border-left: 4px solid var(--primary); padding: 1.5rem; margin-bottom: 2rem; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <i class="bi bi-person-badge" style="color: var(--primary); font-size: 1.5rem;"></i>
              <strong style="color: var(--primary);">Creador:</strong>
            </div>
            <p style="color: var(--text-color); margin: 0;">${char.discord}</p>
          </div>
          
          ${char.tipo_aporte === 'actualizacion' ? `
            <div style="background: linear-gradient(135deg, rgba(33,150,243,0.1), rgba(3,169,244,0.1)); border-left: 4px solid #2196f3; padding: 1.5rem; margin-bottom: 2rem; border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <i class="bi bi-arrow-repeat" style="color: #2196f3; font-size: 1.5rem;"></i>
                <strong style="color: #2196f3;">Actualización</strong>
              </div>
              <p style="color: var(--text-color); margin: 0;">Esta es una actualización de una entrada existente</p>
            </div>
          ` : ''}
          
          <!-- Tab: Información principal -->
          <div class="tab-content" id="tab-info">
            ${char.descripcion_general ? `
              <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary); border-left: 4px solid var(--primary); padding-left: 1rem; margin-bottom: 1rem;">Descripción general</h3>
                <p style="color: var(--text-color); line-height: 1.8;">${char.descripcion_general}</p>
              </div>
            ` : ''}
            
            ${char.apariencia ? `
              <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary); border-left: 4px solid var(--primary); padding-left: 1rem; margin-bottom: 1rem;">Apariencia</h3>
                <p style="color: var(--text-color); line-height: 1.8;">${char.apariencia}</p>
              </div>
            ` : ''}
            
            ${char.personalidad ? `
              <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary); border-left: 4px solid var(--primary); padding-left: 1rem; margin-bottom: 1rem;">Personalidad</h3>
                <p style="color: var(--text-color); line-height: 1.8;">${char.personalidad}</p>
              </div>
            ` : ''}
            
            ${char.le_gusta || char.no_le_gusta ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                ${char.le_gusta ? `
                  <div>
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">👍 Le Gusta</h4>
                    <ul style="color: var(--text-color);">${char.le_gusta.split(',').map(item => `<li>${item.trim()}</li>`).join('')}</ul>
                  </div>
                ` : ''}
                ${char.no_le_gusta ? `
                  <div>
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">👎 No Le Gusta</h4>
                    <ul style="color: var(--text-color);">${char.no_le_gusta.split(',').map(item => `<li>${item.trim()}</li>`).join('')}</ul>
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            ${char.trivia ? `
              <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary); border-left: 4px solid var(--primary); padding-left: 1rem; margin-bottom: 1rem;">Trivia</h3>
                <ul style="color: var(--text-color);">${char.trivia.split(',').map(item => `<li>${item.trim()}</li>`).join('')}</ul>
              </div>
            ` : ''}
          </div>
          
          <!-- Tab: Galería -->
          <div class="tab-content" id="tab-galeria" style="display: none;">
            ${char.galeria?.length ? `
              <h3 style="color: var(--primary); margin-bottom: 1rem;">🖼️ Galería</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                ${char.galeria.map(img => `<img src="${img}" style="width: 100%; border-radius: 8px; cursor: pointer;" onclick="window.open('${img}', '_blank')">`).join('')}
              </div>
            ` : '<p style="color: var(--text-secondary);">No hay imágenes en la galería</p>'}
            
            ${char.fanarts?.length ? `
              <h3 style="color: var(--primary); margin-bottom: 1rem;">🎨 Fanarts</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                ${char.fanarts.map(img => `<img src="${img}" style="width: 100%; border-radius: 8px; cursor: pointer;" onclick="window.open('${img}', '_blank')">`).join('')}
              </div>
            ` : ''}
          </div>
          
          <!-- Tab: Opiniones -->
          <div class="tab-content" id="tab-opiniones" style="display: none;">
            ${char.opiniones_parsed?.length ? `
              ${char.opiniones_parsed.map(op => `
                <div style="background: var(--bg-light); border-left: 4px solid var(--primary); padding: 1.5rem; margin-bottom: 1rem; border-radius: 8px;">
                  <h5 style="color: var(--primary); margin-bottom: 0.5rem;">${op.nombre}</h5>
                  <p style="color: var(--text-color); font-style: italic; margin-bottom: 1rem;">${op.corta}</p>
                  ${op.extendida.map(texto => `<p style="color: var(--text-secondary);">${texto}</p>`).join('')}
                </div>
              `).join('')}
            ` : '<p style="color: var(--text-secondary);">No hay opiniones</p>'}
          </div>
        </div>
        
        <!-- Card derecha con render y acordeones -->
        <div>
          <div style="background: var(--bg-light); border: 2px solid var(--primary); border-radius: 12px; padding: 1.5rem;">
            <h2 style="color: var(--primary); margin-bottom: 1rem; text-align: center;">${char.nombre}</h2>
            <img src="${char.renders?.[0] || char.iconos?.[0]}" style="max-width: 100%; border-radius: 8px; margin-bottom: 1.5rem; display: block;">
            
            <!-- Acordeones -->
            ${char.aliases ? createAccordion('Aliases', char.aliases) : ''}
            ${char.genero ? createAccordion('Género', char.genero) : ''}
            ${char.pronombres ? createAccordion('Pronombres', char.pronombres) : ''}
            ${char.orientacion ? createAccordion('Orientacion', char.orientacion) : ''}
            ${char.relaciones ? createAccordion('Relaciones', char.relaciones) : ''}
            ${char.afiliaciones ? createAccordion('Afiliación', char.afiliaciones) : ''}
            ${char.ocupacion ? createAccordion('Ocupación', char.ocupacion) : ''}
            ${char.edad || char.fecha_nacimiento ? createAccordion('Información biográfica', `${char.edad ? `Edad: ${char.edad}<br>` : ''}${char.fecha_nacimiento ? `Nacimiento: ${char.fecha_nacimiento}` : ''}`) : ''}
            ${char.especie || char.altura || char.ojos || char.cabello ? createAccordion('Descripción física', `${char.especie ? `Especie: ${char.especie}<br>` : ''}${char.altura ? `Altura: ${char.altura}m<br>` : ''}${char.ojos ? `Ojos: ${char.ojos}<br>` : ''}${char.cabello ? `Cabello: ${char.cabello}` : ''}`) : ''}
            ${char.apariciones ? createAccordion('Apariciones', char.apariciones) : ''}
            ${char.voz ? createAccordion('Voz', char.voz) : ''}
            ${char.iconos?.length ? createAccordion('Iconos', char.iconos.map(url => `<img src="${url}" style="width: 50px; height: 50px; margin: 5px; border-radius: 4px;">`).join('')) : ''}
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 2px solid var(--primary);">
        <button class="btn btn-success btn-lg" onclick="approveEntry('${char.id}')" style="flex: 1;">
          <i class="bi bi-check-circle"></i> Aprobar Entrada
        </button>
        <button class="btn btn-danger btn-lg" onclick="rejectEntry('${char.id}')" style="flex: 1;">
          <i class="bi bi-x-circle"></i> Rechazar Entrada
        </button>
      </div>
      
      <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-light); border-radius: 8px; color: var(--text-secondary); font-size: 0.9rem;">
        <strong>Enviado por:</strong> ${char.discord} | <strong>Tipo:</strong> ${char.tipo_entrada === 'mundo' ? 'Mundo/Lore' : 'Personaje'}
      </div>
    </div>
  `;
  
  window.scrollTo(0, 0);
}

function createAccordion(title, content) {
  const id = 'acc-' + title.replace(/\s+/g, '-').toLowerCase();
  return `
    <div style="margin-bottom: 0.5rem; overflow: hidden; border-radius: 8px; background: linear-gradient(90deg, rgba(var(--primary-rgb, 138,43,226),0.05), transparent);">
      <button onclick="toggleAccordion('${id}')" style="width: 100%; background: rgba(var(--primary-rgb, 138,43,226),0.1); border: none; color: var(--primary); font-size: 1rem; font-weight: bold; padding: 1rem 1.5rem; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; border-left: 3px solid transparent;" onmouseover="this.style.borderLeft='3px solid var(--primary)'; this.style.background='rgba(var(--primary-rgb, 138,43,226),0.15)'" onmouseout="this.style.borderLeft='3px solid transparent'; this.style.background='rgba(var(--primary-rgb, 138,43,226),0.1)'">
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="bi bi-circle-fill" style="font-size: 0.4rem;"></i>
          ${title}
        </span>
        <i class="bi bi-chevron-down" id="${id}-icon" style="transition: transform 0.3s ease;"></i>
      </button>
      <div id="${id}" style="display: none; padding: 1rem 1.5rem; color: var(--text-color); line-height: 1.8; background: rgba(0,0,0,0.2); border-left: 3px solid var(--primary);">
        ${content}
      </div>
    </div>
  `;
}

function toggleAccordion(id) {
  const content = document.getElementById(id);
  const icon = document.getElementById(id + '-icon');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  } else {
    content.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  }
}

function switchTab(event, tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.style.color = 'var(--text-secondary)';
    btn.style.borderBottom = 'none';
    btn.classList.remove('active');
  });
  
  document.getElementById('tab-' + tabName).style.display = 'block';
  event.target.style.color = 'var(--primary)';
  event.target.style.borderBottom = '3px solid var(--primary)';
  event.target.classList.add('active');
}

async function approveEntry(id) {
  if (!confirm('¿Aprobar esta entrada?')) return;
  
  try {
    const doc = await pendingDb.collection('pending_characters').doc(id).get();
    const data = doc.data();
    
    await pendingDb.collection('characters').add({
      ...data,
      status: 'approved',
      approvedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    await pendingDb.collection('pending_characters').doc(id).delete();
    
    alert('✅ Entrada aprobada');
    loadPendingEntries();
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

async function rejectEntry(id) {
  const reason = prompt('❌ ¿Por qué rechazas esta entrada?\n(El usuario verá este mensaje)');
  if (!reason) return;
  
  try {
    const doc = await pendingDb.collection('pending_characters').doc(id).get();
    if (!doc.exists) {
      alert('❌ Entrada no encontrada');
      return;
    }
    
    const data = doc.data();
    
    await pendingDb.collection('rejected_characters').doc(id).set({
      ...data,
      status: 'rejected',
      rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
      rejectionReason: reason
    });
    
    await pendingDb.collection('pending_characters').doc(id).delete();
    
    console.log('✅ Rechazado:', id, 'Razón:', reason);
    alert('❌ Entrada rechazada y movida a rechazados');
    loadPendingEntries();
  } catch (error) {
    console.error('Error completo:', error);
    alert('❌ Error: ' + error.message);
  }
}
