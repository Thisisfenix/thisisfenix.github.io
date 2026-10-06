const fs = require('fs');

const filePath = './Assets/json/updates.json';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('Archivo leído correctamente');
    console.log('Longitud:', content.length, 'caracteres');
    
    // Intentar parsear
    const parsed = JSON.parse(content);
    console.log('✅ JSON válido!');
    console.log('Claves principales:', Object.keys(parsed));
    
} catch (error) {
    console.error('❌ Error encontrado:');
    console.error('Mensaje:', error.message);
    
    // Intentar encontrar la posición del error
    if (error.message.includes('position')) {
        const match = error.message.match(/position (\d+)/);
        if (match) {
            const pos = parseInt(match[1]);
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.substring(0, pos).split('\n');
            console.error(`Línea aproximada: ${lines.length}`);
            console.error('Contexto:', content.substring(Math.max(0, pos - 50), pos + 50));
        }
    }
}
