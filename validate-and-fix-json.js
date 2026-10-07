const fs = require('fs');
const path = require('path');

function validateAndFixJSON(filePath) {
  console.log(`\n📄 Validando: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Intentar parsear
    try {
      const parsed = JSON.parse(content);
      console.log('✅ JSON válido');
      
      // Re-escribir con formato bonito
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8');
      console.log('✅ Reformateado correctamente');
      
      return { valid: true, data: parsed };
    } catch (parseError) {
      console.log('❌ JSON malformado:', parseError.message);
      
      // Intentar arreglar errores comunes
      let fixed = content
        // Comas finales
        .replace(/,(\s*[}\]])/g, '$1')
        // Comillas simples a dobles
        .replace(/'/g, '"')
        // Trailing commas en arrays
        .replace(/,(\s*\])/g, '$1')
        // Trailing commas en objects
        .replace(/,(\s*})/g, '$1');
      
      try {
        const parsed = JSON.parse(fixed);
        console.log('✅ JSON arreglado automáticamente');
        
        // Guardar versión arreglada
        fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8');
        console.log('✅ Guardado correctamente');
        
        return { valid: true, data: parsed, fixed: true };
      } catch (fixError) {
        console.log('❌ No se pudo arreglar automáticamente');
        console.log('Error:', fixError.message);
        return { valid: false, error: fixError.message };
      }
    }
  } catch (error) {
    console.log('❌ Error leyendo archivo:', error.message);
    return { valid: false, error: error.message };
  }
}

// Validar credits.json
const creditsPath = path.join(__dirname, 'Assets', 'json', 'credits.json');
const creditsResult = validateAndFixJSON(creditsPath);

// Validar updates.json
const updatesPath = path.join(__dirname, 'Assets', 'json', 'updates.json');
const updatesResult = validateAndFixJSON(updatesPath);

console.log('\n📊 Resumen:');
console.log('Credits:', creditsResult.valid ? '✅' : '❌');
console.log('Updates:', updatesResult.valid ? '✅' : '❌');

if (!creditsResult.valid || !updatesResult.valid) {
  process.exit(1);
}
