/**
 * Script de migración para añadir slugs a entradas existentes
 * Ejecutar manualmente desde la consola del navegador cuando sea necesario
 */

async function migrateExistingEntries() {
  if (!confirm('⚠️ Esto añadirá slugs a todas las entradas existentes que no los tengan.\n¿Continuar?')) {
    return;
  }
  
  console.log('🚀 Iniciando migración de slugs...');
  
  const collections = ['characters', 'pending_characters', 'rejected_characters'];
  let totalMigrated = 0;
  let totalSkipped = 0;
  let errors = 0;
  
  for (const collectionName of collections) {
    console.log(`\n📁 Procesando colección: ${collectionName}`);
    
    try {
      const snapshot = await wikiDb.collection(collectionName).get();
      console.log(`  Encontradas ${snapshot.docs.length} entradas`);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Si ya tiene slug, saltar
        if (data.slug) {
          console.log(`  ⏭️ ${data.nombre || doc.id} ya tiene slug: ${data.slug}`);
          totalSkipped++;
          continue;
        }
        
        // Si no tiene nombre, saltar
        if (!data.nombre) {
          console.log(`  ⚠️ ${doc.id} no tiene nombre, saltando...`);
          totalSkipped++;
          continue;
        }
        
        try {
          // Generar slug base
          const baseSlug = generateSlug(data.nombre);
          
          // Asegurar que sea único
          const uniqueSlug = await ensureUniqueSlug(baseSlug, collectionName);
          
          // Actualizar documento
          await wikiDb.collection(collectionName).doc(doc.id).update({
            slug: uniqueSlug
          });
          
          console.log(`  ✅ ${data.nombre} → ${uniqueSlug}`);
          totalMigrated++;
          
        } catch (error) {
          console.error(`  ❌ Error con ${data.nombre}:`, error);
          errors++;
        }
      }
      
    } catch (error) {
      console.error(`❌ Error procesando ${collectionName}:`, error);
      errors++;
    }
  }
  
  console.log('\n📊 Resumen de migración:');
  console.log(`  ✅ Migradas: ${totalMigrated}`);
  console.log(`  ⏭️ Saltadas: ${totalSkipped}`);
  console.log(`  ❌ Errores: ${errors}`);
  console.log('\n✨ Migración completada!');
}

// Exponer función globalmente para poder ejecutarla desde la consola
window.migrateExistingEntries = migrateExistingEntries;

console.log('💡 Script de migración cargado. Ejecuta migrateExistingEntries() desde la consola para iniciar.');
