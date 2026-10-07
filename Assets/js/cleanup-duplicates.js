// Script de limpieza de datos duplicados en Firestore
// ADVERTENCIA: Ejecutar solo una vez y con cuidado

async function cleanupDuplicateUsers() {
  console.log('🧹 Iniciando limpieza de usuarios duplicados...');
  
  try {
    // Obtener todos los usuarios
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Total usuarios encontrados: ${usersSnapshot.size}`);
    
    // Agrupar por puntos y temas similares para detectar duplicados
    const usersByFingerprint = new Map();
    const duplicates = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      const fingerprint = `${data.points || 0}_${(data.unlockedThemes || []).length}`;
      
      if (usersByFingerprint.has(fingerprint)) {
        // Posible duplicado
        const existing = usersByFingerprint.get(fingerprint);
        
        // Mantener el más reciente
        if (data.lastSync > existing.data.lastSync) {
          duplicates.push(existing.id);
          usersByFingerprint.set(fingerprint, { id: doc.id, data });
        } else {
          duplicates.push(doc.id);
        }
      } else {
        usersByFingerprint.set(fingerprint, { id: doc.id, data });
      }
    });
    
    console.log(`🔍 Duplicados detectados: ${duplicates.length}`);
    
    // Preguntar confirmación
    if (duplicates.length > 0) {
      const confirmed = confirm(
        `⚠️ Se encontraron ${duplicates.length} usuarios duplicados.\n\n` +
        `¿Deseas eliminarlos? Esta acción NO se puede deshacer.\n\n` +
        `NOTA: Se mantendrá el usuario con la última sincronización.`
      );
      
      if (!confirmed) {
        console.log('❌ Limpieza cancelada por el usuario');
        return { cancelled: true };
      }
      
      // Eliminar duplicados
      const batch = db.batch();
      let count = 0;
      
      for (const userId of duplicates) {
        const docRef = db.collection('users').doc(userId);
        batch.delete(docRef);
        count++;
        
        // Firebase limita batches a 500 operaciones
        if (count % 500 === 0) {
          await batch.commit();
          console.log(`✅ Eliminados ${count}/${duplicates.length} duplicados...`);
        }
      }
      
      // Commit final
      if (count % 500 !== 0) {
        await batch.commit();
      }
      
      console.log(`✅ Limpieza completada: ${duplicates.length} usuarios eliminados`);
      return { 
        success: true, 
        deleted: duplicates.length,
        remaining: usersSnapshot.size - duplicates.length 
      };
    }
    
    console.log('✅ No se encontraron duplicados');
    return { success: true, deleted: 0, remaining: usersSnapshot.size };
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return { success: false, error: error.message };
  }
}

// Función para generar un ID más estable basado en browser fingerprint
function generateStableUserId() {
  const nav = window.navigator;
  const screen = window.screen;
  
  // Crear fingerprint del navegador
  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage
  ].join('|');
  
  // Hash simple del fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return 'user_' + Math.abs(hash).toString(36);
}

// Migrar usuario actual a ID estable
async function migrateToStableId() {
  const oldUserId = localStorage.getItem('userId');
  const newUserId = generateStableUserId();
  
  if (oldUserId === newUserId) {
    console.log('✅ Usuario ya tiene ID estable');
    return { migrated: false, userId: newUserId };
  }
  
  console.log(`🔄 Migrando de ${oldUserId} a ${newUserId}`);
  
  try {
    // Obtener datos del usuario viejo
    const oldDoc = await db.collection('users').doc(oldUserId).get();
    
    if (oldDoc.exists) {
      const oldData = oldDoc.data();
      
      // Verificar si el nuevo ID ya existe
      const newDoc = await db.collection('users').doc(newUserId).get();
      
      if (newDoc.exists) {
        // Mergear datos (mantener el mayor valor)
        const newData = newDoc.data();
        const mergedData = {
          points: Math.max(oldData.points || 0, newData.points || 0),
          name: oldData.name || newData.name || '',
          avatar: oldData.avatar || newData.avatar || '',
          achievements: { ...newData.achievements, ...oldData.achievements },
          unlockedThemes: [...new Set([
            ...(newData.unlockedThemes || []),
            ...(oldData.unlockedThemes || [])
          ])],
          lastSync: Date.now()
        };
        
        await db.collection('users').doc(newUserId).set(mergedData, { merge: true });
        console.log('✅ Datos mergeados en nuevo ID');
      } else {
        // Copiar datos directamente
        await db.collection('users').doc(newUserId).set(oldData);
        console.log('✅ Datos copiados a nuevo ID');
      }
      
      // Eliminar usuario viejo
      await db.collection('users').doc(oldUserId).delete();
      console.log('✅ Usuario viejo eliminado');
      
      // Actualizar leaderboard si existe
      if (oldData.name) {
        const leaderboardRef = db.collection('leaderboard').doc(oldUserId);
        const leaderboardDoc = await leaderboardRef.get();
        
        if (leaderboardDoc.exists) {
          const leaderboardData = leaderboardDoc.data();
          leaderboardData.userId = newUserId;
          await db.collection('leaderboard').doc(newUserId).set(leaderboardData);
          await leaderboardRef.delete();
          console.log('✅ Leaderboard actualizado');
        }
      }
    }
    
    // Actualizar localStorage
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('userId-migrated', 'true');
    
    return { migrated: true, oldUserId, newUserId };
    
  } catch (error) {
    console.error('❌ Error migrando usuario:', error);
    return { migrated: false, error: error.message };
  }
}

// Ejecutar limpieza automática en la consola
window.cleanupFirestore = cleanupDuplicateUsers;
window.migrateToStableId = migrateToStableId;
window.generateStableUserId = generateStableUserId;

console.log(`
🧹 HERRAMIENTAS DE LIMPIEZA CARGADAS

Ejecuta en la consola:
- cleanupFirestore()      → Limpiar usuarios duplicados
- migrateToStableId()     → Migrar tu usuario a ID estable
- generateStableUserId()  → Ver tu nuevo ID estable

⚠️ ADVERTENCIA: Estas acciones son irreversibles
`);
