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

// ============================================
// SISTEMA DE MIGRACIÓN INTELIGENTE
// ============================================

// Versión actual del sistema de migración
const MIGRATION_VERSION = 1;

// Verificar qué migraciones faltan
const checkMigrationStatus = () => {
  const migrationStatus = JSON.parse(localStorage.getItem('migration-status') || '{}');
  
  return {
    version: migrationStatus.version || 0,
    points: migrationStatus.points || false,
    themes: migrationStatus.themes || false,
    achievements: migrationStatus.achievements || false,
    // Aquí puedes agregar más en el futuro:
    // badges: migrationStatus.badges || false,
    // challenges: migrationStatus.challenges || false,
  };
};

// Marcar migración como completada
const markMigrationComplete = (type) => {
  const migrationStatus = JSON.parse(localStorage.getItem('migration-status') || '{}');
  migrationStatus[type] = true;
  migrationStatus.version = MIGRATION_VERSION;
  migrationStatus.lastUpdate = Date.now();
  localStorage.setItem('migration-status', JSON.stringify(migrationStatus));
  console.log(`✅ Migración de ${type} marcada como completada`);
};

// Migrar puntos de localStorage a Firebase
const migratePointsToFirebase = async () => {
  const status = checkMigrationStatus();
  
  // Si ya se migró, saltar
  if (status.points) {
    console.log('⏭️ Puntos ya fueron migrados anteriormente');
    return false;
  }
  
  const userId = getUserId();
  const localPoints = parseInt(localStorage.getItem('points') || '0');
  
  if (localPoints > 0) {
    try {
      showMigrationLoader('Transfiriendo puntos a Firebase', '💰');
      
      await db.collection('users').doc(userId).set({ 
        points: localPoints,
        name: localStorage.getItem('leaderboardName') || '',
        lastSync: Date.now()
      }, { merge: true });
      
      // Marcar como migrado ANTES de eliminar
      markMigrationComplete('points');
      localStorage.removeItem('points');
      
      console.log('✅ Puntos migrados a Firebase:', localPoints);
      
      hideMigrationLoader();
      showMigrationSuccess('Puntos', localPoints);
      
      return true;
    } catch (error) {
      console.error('❌ Error migrando puntos:', error);
      hideMigrationLoader();
      return false;
    }
  } else {
    // Marcar como migrado aunque no haya puntos
    markMigrationComplete('points');
    console.log('⏭️ No hay puntos para migrar');
    return false;
  }
};

// Mostrar pantalla de carga de migración
const showMigrationLoader = (message = 'Transfiriendo datos a Firebase', icon = '🔄') => {
  const loader = document.createElement('div');
  loader.id = 'migration-loader';
  loader.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.9); z-index: 10000; display: flex;
    align-items: center; justify-content: center; flex-direction: column;
  `;
  loader.innerHTML = `
    <div style="text-align: center; color: white;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
      <h3 style="color: var(--primary); margin-bottom: 1rem;">${message}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 2rem;">Migrando tus datos a la nube...</p>
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
const showMigrationSuccess = (type, value) => {
  const messages = {
    'Puntos': `Se transfirieron ${value} puntos a Firebase`,
    'Temas': `Se transfirieron ${value} temas a Firebase`,
    'Datos': `Migración completada exitosamente`
  };
  
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
    <p style="color: var(--text-secondary)">${messages[type] || messages['Datos']}</p>
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
    const firebasePoints = doc.exists ? (doc.data().points || 0) : 0;
    console.log(`☁️ Puntos en Firebase: ${firebasePoints}`);
    return firebasePoints;
  } catch (error) {
    console.error('Error obteniendo puntos:', error);
    return 0;
  }
};

// Sincronizar puntos de forma segura (solo si Firebase tiene más)
const syncPointsSafe = async () => {
  const userId = getUserId();
  try {
    const doc = await db.collection('users').doc(userId).get();
    const firebasePoints = doc.exists ? (doc.data().points || 0) : 0;
    
    // Obtener puntos locales
    const localData = localStorage.getItem('fenix-gamedata');
    let localPoints = 0;
    if (localData) {
      const gameData = JSON.parse(localData);
      localPoints = gameData.points || 0;
    }
    
    console.log(`🔄 Sincronización segura: Local=${localPoints}, Firebase=${firebasePoints}`);
    
    // Solo usar Firebase si tiene más puntos
    if (firebasePoints > localPoints) {
      console.log(`✅ Usando puntos de Firebase (mayores)`);
      return firebasePoints;
    } else {
      console.log(`✅ Usando puntos locales (mayores o iguales)`);
      // Actualizar Firebase con los puntos locales
      if (localPoints > firebasePoints) {
        await updatePoints(localPoints);
      }
      return localPoints;
    }
  } catch (error) {
    console.error('Error sincronizando puntos:', error);
    return 0;
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

window.firebasePoints = { getPoints, updatePoints, listenToPoints, updateLeaderboard, getLeaderboard, uploadAvatar, syncPointsSafe };
window.getUserId = getUserId;

// ============================================
// SISTEMA DE TEMAS EN FIREBASE
// ============================================

// Sincronizar temas desbloqueados a Firebase
const syncUnlockedThemes = async (unlockedThemesArray) => {
  const userId = getUserId();
  try {
    await db.collection('users').doc(userId).set({
      unlockedThemes: unlockedThemesArray,
      lastThemeSync: Date.now()
    }, { merge: true });
    
    console.log('✅ Temas sincronizados a Firebase:', unlockedThemesArray);
  } catch (error) {
    console.error('❌ Error sincronizando temas:', error);
  }
};

// Sincronizar logros a Firebase
const syncAchievements = async (achievementsData) => {
  const userId = getUserId();
  try {
    await db.collection('users').doc(userId).set({
      achievements: achievementsData,
      lastAchievementSync: Date.now()
    }, { merge: true });
    
    console.log('✅ Logros sincronizados a Firebase');
  } catch (error) {
    console.error('❌ Error sincronizando logros:', error);
  }
};

// Obtener logros desde Firebase
const getAchievements = async () => {
  const userId = getUserId();
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists && doc.data().achievements) {
      console.log('✅ Logros obtenidos desde Firebase');
      return doc.data().achievements;
    }
    return {};
  } catch (error) {
    console.error('❌ Error obteniendo logros:', error);
    return {};
  }
};

// Obtener temas desbloqueados desde Firebase
const getUnlockedThemes = async () => {
  const userId = getUserId();
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists && doc.data().unlockedThemes) {
      console.log('✅ Temas obtenidos desde Firebase:', doc.data().unlockedThemes);
      return doc.data().unlockedThemes;
    }
    return [];
  } catch (error) {
    console.error('❌ Error obteniendo temas:', error);
    return [];
  }
};

// Migrar temas de localStorage a Firebase
const migrateThemesToFirebase = async () => {
  const status = checkMigrationStatus();
  
  // Si ya se migró, saltar
  if (status.themes) {
    console.log('⏭️ Temas ya fueron migrados anteriormente');
    return false;
  }
  
  const userId = getUserId();
  const localData = localStorage.getItem('fenix-gamedata');
  
  if (localData) {
    try {
      const gameData = JSON.parse(localData);
      const unlockedThemes = gameData.unlockedThemes || [];
      
      if (unlockedThemes.length > 0) {
        showMigrationLoader('Transfiriendo temas a Firebase', '🎨');
        
        console.log('🔄 Migrando temas a Firebase:', unlockedThemes);
        
        await db.collection('users').doc(userId).set({
          unlockedThemes: unlockedThemes,
          lastThemeSync: Date.now()
        }, { merge: true });
        
        // Marcar como migrado
        markMigrationComplete('themes');
        
        console.log('✅ Migración de temas completada');
        
        hideMigrationLoader();
        showMigrationSuccess('Temas', unlockedThemes.length);
        
        return true;
      } else {
        markMigrationComplete('themes');
        console.log('⏭️ No hay temas para migrar');
        return false;
      }
    } catch (error) {
      console.error('❌ Error migrando temas:', error);
      hideMigrationLoader();
      return false;
    }
  } else {
    markMigrationComplete('themes');
    console.log('⏭️ No hay datos de juego para migrar');
    return false;
  }
};

// Migrar logros de localStorage a Firebase
const migrateAchievementsToFirebase = async () => {
  const status = checkMigrationStatus();
  
  // Si ya se migró, saltar
  if (status.achievements) {
    console.log('⏭️ Logros ya fueron migrados anteriormente');
    return false;
  }
  
  const userId = getUserId();
  const localData = localStorage.getItem('fenix-gamedata');
  
  if (localData) {
    try {
      const gameData = JSON.parse(localData);
      const achievements = gameData.achievements || {};
      
      const achievementCount = Object.keys(achievements).length;
      
      if (achievementCount > 0) {
        showMigrationLoader('Transfiriendo logros a Firebase', '🏆');
        
        console.log('🔄 Migrando logros a Firebase:', achievementCount, 'logros');
        
        await db.collection('users').doc(userId).set({
          achievements: achievements,
          lastAchievementSync: Date.now()
        }, { merge: true });
        
        // Marcar como migrado
        markMigrationComplete('achievements');
        
        console.log('✅ Migración de logros completada');
        
        hideMigrationLoader();
        showMigrationSuccess('Logros', achievementCount);
        
        return true;
      } else {
        markMigrationComplete('achievements');
        console.log('⏭️ No hay logros para migrar');
        return false;
      }
    } catch (error) {
      console.error('❌ Error migrando logros:', error);
      hideMigrationLoader();
      return false;
    }
  } else {
    markMigrationComplete('achievements');
    console.log('⏭️ No hay datos de juego para migrar');
    return false;
  }
};

// Escuchar cambios en temas en tiempo real
const listenToThemes = (callback) => {
  const userId = getUserId();
  return db.collection('users').doc(userId).onSnapshot((doc) => {
    if (doc.exists && doc.data().unlockedThemes) {
      callback(doc.data().unlockedThemes);
    }
  });
};

// Cargar temas al iniciar (merge con localStorage)
const loadThemesFromFirebase = async () => {
  if (!window.achievementSystem) {
    console.warn('⚠️ achievementSystem no disponible todavía');
    return;
  }
  
  const firebaseThemes = await getUnlockedThemes();
  
  // Obtener temas actuales de localStorage (fuente de verdad)
  const localThemes = Array.from(window.achievementSystem.gameData.unlockedThemes);
  
  console.log('🔄 Sincronizando temas:');
  console.log('  💾 localStorage:', localThemes.length, 'temas');
  console.log('  ☁️ Firebase:', firebaseThemes.length, 'temas');
  
  // Merge: combinar ambos (nunca perder temas)
  const mergedThemes = new Set([...localThemes, ...firebaseThemes]);
  
  // Solo actualizar si hay cambios
  if (mergedThemes.size !== localThemes.length) {
    console.log(`✅ Mergeando temas: ${localThemes.length} → ${mergedThemes.size}`);
    
    window.achievementSystem.gameData.unlockedThemes = mergedThemes;
    
    // Guardar en localStorage
    const toSave = window.achievementSystem.prepareDataForSave();
    localStorage.setItem(window.achievementSystem.storageKey, JSON.stringify(toSave));
    
    // Actualizar Firebase con el merge
    await syncUnlockedThemes(Array.from(mergedThemes));
  } else {
    console.log('✅ Temas ya sincronizados:', mergedThemes.size, 'temas');
  }
  
  console.log('💰 Puntos NO modificados:', window.achievementSystem.gameData.points);
  
  // Actualizar UI
  if (window.updatePremiumThemes) {
    window.updatePremiumThemes();
  }
};

// Cargar logros desde Firebase (merge con localStorage)
const loadAchievementsFromFirebase = async () => {
  if (!window.achievementSystem) {
    console.warn('⚠️ achievementSystem no disponible todavía');
    return;
  }
  
  const firebaseAchievements = await getAchievements();
  
  // Obtener logros actuales de localStorage (fuente de verdad)
  const localAchievements = window.achievementSystem.gameData.achievements || {};
  
  const localCount = Object.keys(localAchievements).length;
  const firebaseCount = Object.keys(firebaseAchievements).length;
  
  console.log('🔄 Sincronizando logros:');
  console.log('  💾 localStorage:', localCount, 'logros');
  console.log('  ☁️ Firebase:', firebaseCount, 'logros');
  
  // Mergear: localStorage tiene prioridad, Firebase complementa
  const mergedAchievements = {
    ...firebaseAchievements,  // Firebase primero
    ...localAchievements      // localStorage sobrescribe (prioridad)
  };
  
  const mergedCount = Object.keys(mergedAchievements).length;
  
  // Solo actualizar si hay cambios
  if (mergedCount !== localCount) {
    console.log(`✅ Mergeando logros: ${localCount} → ${mergedCount}`);
    
    window.achievementSystem.gameData.achievements = mergedAchievements;
    
    // Guardar en localStorage
    const toSave = window.achievementSystem.prepareDataForSave();
    localStorage.setItem(window.achievementSystem.storageKey, JSON.stringify(toSave));
    
    // Actualizar Firebase con el merge
    await syncAchievements(mergedAchievements);
  } else {
    console.log('✅ Logros ya sincronizados:', mergedCount, 'logros');
  }
  
  console.log('💰 Puntos NO modificados:', window.achievementSystem.gameData.points);
};

// Migrar automáticamente al cargar
// Inicializar migración automáticamente
const initMigrations = async () => {
  console.log('🚀 Iniciando sistema de migración...');
  
  const status = checkMigrationStatus();
  console.log('📊 Estado de migración:', status);
  
  let showedLoader = false;
  
  // Migrar puntos si es necesario
  if (!status.points) {
    const migrated = await migratePointsToFirebase();
    if (migrated) showedLoader = true;
  }
  
  // Pequeña pausa entre migraciones si se mostró loader
  if (showedLoader) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Migrar temas si es necesario
  if (!status.themes) {
    const migrated = await migrateThemesToFirebase();
    if (migrated) {
      showedLoader = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Migrar logros si es necesario
  if (!status.achievements) {
    const migrated = await migrateAchievementsToFirebase();
    if (migrated) showedLoader = true;
  }
  
  // Sincronizar avatar desde Firebase si existe
  try {
    const userId = getUserId();
    const doc = await db.collection('leaderboard').doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      if (data.avatar && data.avatar.trim() !== '') {
        localStorage.setItem('avatar', data.avatar);
        console.log('✅ Avatar sincronizado desde Firebase');
      }
    }
  } catch (error) {
    console.warn('⚠️ No se pudo sincronizar avatar:', error);
  }
  
  console.log('✅ Sistema de migración completado');
};

// Ejecutar migraciones
initMigrations();

// Cargar datos después de las migraciones
setTimeout(() => {
  loadThemesFromFirebase();
  loadAchievementsFromFirebase();
}, 1500);

window.firebaseThemes = { 
  syncUnlockedThemes, 
  getUnlockedThemes, 
  listenToThemes,
  loadThemesFromFirebase,
  migrateThemesToFirebase,
  checkMigrationStatus  // Exportar para debug
};

window.firebaseAchievements = {
  syncAchievements,
  getAchievements,
  loadAchievementsFromFirebase,
  migrateAchievementsToFirebase
};