# Guía de Limpieza de Datos Duplicados en Firestore

## Problema
Anteriormente, cada visita creaba un nuevo usuario con ID basado en `Date.now() + random`, causando múltiples usuarios duplicados en Firestore.

## Solución Implementada

### 1. ID Estable por Browser Fingerprint
Ahora se genera un ID único basado en características del navegador:
- User Agent
- Idioma
- Resolución de pantalla
- Zona horaria
- Capacidades del navegador

Esto asegura que el mismo navegador siempre obtenga el mismo ID.

### 2. Migración Automática
El sistema detecta IDs antiguos y migra automáticamente los datos al nuevo ID estable.

### 3. Herramientas de Limpieza
Se incluyó `cleanup-duplicates.js` con funciones para:
- `cleanupFirestore()` - Eliminar usuarios duplicados
- `migrateToStableId()` - Migrar usuario actual a ID estable
- `generateStableUserId()` - Ver el ID estable del navegador actual

## Cómo Limpiar los Duplicados

### Opción 1: Limpieza Automática (Recomendada)
1. Abre la consola del navegador (F12)
2. Ejecuta: `await cleanupFirestore()`
3. Confirma la eliminación cuando se solicite
4. El sistema mantendrá el usuario con la última sincronización

### Opción 2: Limpieza Manual desde Firestore Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `databasefenixlab`
3. Ve a Firestore Database
4. Collection: `users`
5. Ordena por `lastSync` descendente
6. Elimina manualmente los documentos con `lastSync` antiguo

## Estructura Actual en Firestore

### Collection: `users`
- **Documento ID**: `user_[hash_estable]`
- **Campos**:
  - `points`: number
  - `name`: string
  - `avatar`: string (URL)
  - `achievements`: object
  - `unlockedThemes`: array
  - `lastSync`: timestamp
  - `lastAchievementSync`: timestamp
  - `lastThemeSync`: timestamp

### Collection: `leaderboard`
- **Documento ID**: `user_[hash_estable]`
- **Campos**:
  - `name`: string
  - `points`: number
  - `userId`: string
  - `avatar`: string (URL)
  - `lastUpdate`: timestamp

### Collection: `cupid-leaderboard`
- Evento San Valentín
- Campos: `name`, `score`, `date`

### Collection: `completions`
- Evento de Plushies
- Campos: `name`, `timestamp`, `date`

## Prevención de Duplicados Futuros

1. **ID Estable**: Usa fingerprint del navegador
2. **Migración Automática**: Detecta y migra IDs antiguos
3. **Merge en lugar de Override**: Los datos se combinan en caso de conflicto
4. **Flag de Migración**: `userId-migrated` en localStorage previene re-migraciones

## Monitoreo

Para ver cuántos usuarios únicos tienes:
```javascript
const usersSnapshot = await db.collection('users').get();
console.log('Total usuarios:', usersSnapshot.size);
```

Para ver duplicados potenciales:
```javascript
const users = [];
const usersSnapshot = await db.collection('users').get();
usersSnapshot.forEach(doc => {
  const data = doc.data();
  users.push({
    id: doc.id,
    points: data.points,
    name: data.name,
    lastSync: new Date(data.lastSync).toLocaleString()
  });
});
console.table(users.sort((a, b) => b.points - a.points));
```

## Notas Importantes

⚠️ **ADVERTENCIA**: La limpieza elimina datos permanentemente.

✅ **Backup**: Firebase mantiene backups automáticos por 7 días.

🔄 **Migración**: Los usuarios existentes migrarán automáticamente en su próxima visita.

📊 **Estadísticas**: Después de la limpieza, deberías tener ~10-20 usuarios únicos reales en lugar de cientos de duplicados.
