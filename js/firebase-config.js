// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpyA0REaiPXEFni_mtMBBLPaNjaTxgqv4",
  authDomain: "databasefenixlab.firebaseapp.com",
  databaseURL: "https://databasefenixlab-default-rtdb.firebaseio.com",
  projectId: "databasefenixlab",
  storageBucket: "databasefenixlab.firebasestorage.app",
  messagingSenderId: "1054308637258",
  appId: "1:1054308637258:web:b8e4ef8517939a288f64b3",
  measurementId: "G-MS5MBBP9Z4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Generar ID único para usuario
const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// Migrar puntos de localStorage a Firebase
const migratePointsToFirebase = async () => {
  const userId = getUserId();
  const localPoints = parseInt(localStorage.getItem('points') || '0');
  
  if (localPoints > 0) {
    try {
      showMigrationLoader();
      
      await db.collection('users').doc(userId).set({ 
        points: localPoints,
        name: localStorage.getItem('leaderboardName') || '',
        lastSync: Date.now()
      }, { merge: true });
      
      localStorage.removeItem('points');
      console.log('Puntos migrados a Firebase:', localPoints);
      
      hideMigrationLoader();
      showMigrationSuccess(localPoints);
      
    } catch (error) {
      console.error('Error migrando puntos:', error);
      hideMigrationLoader();
    }
  }
  
  // Sincronizar avatar desde Firebase si existe
  try {
    const doc = await db.collection('leaderboard').doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      if (data.avatar && data.avatar.trim() !== '') {
        localStorage.setItem('avatar', data.avatar);
        console.log('Avatar sincronizado desde Firebase');
      }
    }
  } catch (error) {
    console.warn('No se pudo sincronizar avatar:', error);
  }
};

// Mostrar pantalla de carga de migración
const showMigrationLoader = () => {
  const loader = document.createElement('div');
  loader.id = 'migration-loader';
  loader.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.9); z-index: 10000; display: flex;
    align-items: center; justify-content: center; flex-direction: column;
  `;
  loader.innerHTML = `
    <div style="text-align: center; color: white;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🔄</div>
      <h3 style="color: var(--primary); margin-bottom: 1rem;">Transfiriendo datos a Firebase</h3>
      <p style="color: var(--text-secondary); margin-bottom: 2rem;">Migrando tus puntos y progreso...</p>
      <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">
        <div style="width: 100%; height: 100%; background: var(--primary); animation: loading 2s infinite;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(loader);
};

// Ocultar pantalla de carga
const hideMigrationLoader = () => {
  const loader = document.getElementById('migration-loader');
  if (loader) loader.remove();
};

// Mostrar notificación de éxito
const showMigrationSuccess = (points) => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: var(--bg-dark); border: 2px solid var(--primary);
    padding: 2rem; border-radius: 12px; z-index: 10001; text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  `;
  notification.innerHTML = `
    <div style="font-size: 2rem; margin-bottom: 1rem;">✅</div>
    <h3 style="color: var(--primary); margin-bottom: 1rem;">¡Migración Completada!</h3>
    <p style="color: var(--text-secondary);">Se transfirieron ${points} puntos a Firebase</p>
    <button onclick="this.parentElement.remove()" style="
      background: var(--primary); color: white; border: none;
      padding: 0.5rem 1rem; border-radius: 6px; margin-top: 1rem; cursor: pointer;
    ">Continuar</button>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentElement) notification.remove();
  }, 5000);
};

// Obtener puntos desde Firebase
const getPoints = async () => {
  const userId = getUserId();
  try {
    const doc = await db.collection('users').doc(userId).get();
    return doc.exists ? (doc.data().points || 0) : 0;
  } catch (error) {
    console.error('Error obteniendo puntos:', error);
    return parseInt(localStorage.getItem('points') || '0');
  }
};

// Actualizar puntos en Firebase
const updatePoints = async (points) => {
  const userId = getUserId();
  try {
    const userData = {
      points,
      lastSync: Date.now()
    };
    
    const leaderboardName = localStorage.getItem('leaderboardName');
    const avatar = localStorage.getItem('avatar');
    
    if (leaderboardName) {
      userData.name = leaderboardName;
    }
    
    if (avatar && avatar.trim() !== '') {
      userData.avatar = avatar;
    }
    
    await db.collection('users').doc(userId).set(userData, { merge: true });
    
    if (leaderboardName) {
      const leaderboardData = {
        name: leaderboardName,
        points,
        userId,
        lastUpdate: Date.now()
      };
      
      if (avatar && avatar.trim() !== '') {
        leaderboardData.avatar = avatar;
      }
      
      await db.collection('leaderboard').doc(userId).set(leaderboardData, { merge: true });
    }
    const syncIndicator = document.getElementById('sync-indicator');
    if (syncIndicator) {
      syncIndicator.style.opacity = '1';
      setTimeout(() => syncIndicator.style.opacity = '0', 2000);
    }
  } catch (error) {
    console.error('Error actualizando puntos:', error);
    localStorage.setItem('points', points.toString());
  }
};

// Actualizar leaderboard en Firebase
const updateLeaderboard = async (name, points, avatar = '') => {
  const userId = getUserId();
  try {
    const leaderboardData = {
      name,
      points,
      userId,
      lastUpdate: Date.now()
    };
    
    if (avatar && avatar.trim() !== '') {
      leaderboardData.avatar = avatar;
    }
    
    await db.collection('leaderboard').doc(userId).set(leaderboardData);
    
    const userData = {
      name,
      points,
      lastSync: Date.now()
    };
    
    if (avatar && avatar.trim() !== '') {
      userData.avatar = avatar;
    }
    
    await db.collection('users').doc(userId).set(userData, { merge: true });
    
    console.log('Leaderboard actualizado:', name, points, avatar);
  } catch (error) {
    console.error('Error actualizando leaderboard:', error);
  }
};

// Obtener leaderboard desde Firebase
const getLeaderboard = async () => {
  try {
    const snapshot = await db.collection('leaderboard')
      .orderBy('points', 'desc')
      .limit(10)
      .get();
    
    const leaderboard = [];
    snapshot.forEach(doc => {
      leaderboard.push(doc.data());
    });
    
    return leaderboard;
  } catch (error) {
    console.error('Error obteniendo leaderboard:', error);
    return JSON.parse(localStorage.getItem('fenix-leaderboard') || '[]');
  }
};

// Escuchar cambios en tiempo real
const listenToPoints = (callback) => {
  const userId = getUserId();
  db.collection('users').doc(userId).onSnapshot((doc) => {
    const points = doc.exists ? (doc.data().points || 0) : 0;
    callback(points);
  });
};

// Inicializar migración automáticamente
migratePointsToFirebase();

// Subir avatar a Cloudinary
const uploadAvatar = async (file) => {
  const cloudName = 'dkci24erg';
  const uploadPreset = 'fenixlab_wiki';
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'avatars');
  
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error subiendo avatar:', error);
    throw error;
  }
};

window.firebasePoints = { getPoints, updatePoints, listenToPoints, updateLeaderboard, getLeaderboard, uploadAvatar };
window.getUserId = getUserId;