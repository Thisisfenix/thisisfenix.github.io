# Sistema de Slugs - Archive of Creation

## ¿Qué es un slug?

Un **slug** es un identificador legible y amigable para URLs generado a partir del nombre del personaje.

**Ejemplos:**
- "Luna Valkyrie" → `luna-valkyrie`
- "IA-777" → `ia-777`
- "Gissel Fischer" → `gissel-fischer`

## Ventajas del sistema de slugs

### 1. **URLs legibles**
```
❌ Antes: /wiki?id=xK2mP9nQrT4sL6wZ
✅ Ahora: /wiki?character=luna-valkyrie
```

### 2. **SEO amigable**
Los motores de búsqueda prefieren URLs descriptivas.

### 3. **Fácil de compartir y recordar**
Es más fácil decir "busca luna-valkyrie" que recordar un ID aleatorio.

### 4. **Independiente de Firebase**
No dependes de los IDs auto-generados de Firebase.

## Cómo funciona

### Generación automática
Cuando envías una entrada nueva, el sistema:
1. Toma el nombre del personaje
2. Lo convierte a minúsculas
3. Elimina acentos (á → a, é → e)
4. Reemplaza espacios y caracteres especiales con guiones
5. Verifica que sea único
6. Si ya existe, añade un número (ej: `luna-valkyrie-2`)

### Compatibilidad con entradas antiguas
El sistema soporta **ambos** identificadores:
- **IDs antiguos**: Entradas creadas antes del sistema de slugs siguen funcionando
- **Slugs nuevos**: Entradas nuevas usan slugs automáticamente

### Función de migración
Para añadir slugs a entradas antiguas:

1. Abre la consola del navegador (F12)
2. Asegúrate de que `migrate-slugs.js` esté cargado
3. Ejecuta:
   ```javascript
   migrateExistingEntries()
   ```
4. Confirma la operación
5. Espera a que termine

## Implementación técnica

### Funciones principales (wiki.js)

#### `generateSlug(nombre)`
Convierte un nombre en un slug válido.

```javascript
generateSlug("Luna Valkyrie")  // "luna-valkyrie"
generateSlug("IA-777")         // "ia-777"
generateSlug("Señor Ñoño")     // "senor-nono"
```

#### `ensureUniqueSlug(baseSlug, collection)`
Asegura que el slug sea único en la colección.

```javascript
// Si "luna-valkyrie" ya existe
await ensureUniqueSlug("luna-valkyrie", "characters")
// Retorna: "luna-valkyrie-2"
```

#### `findCharacterBySlug(slug)`
Busca un personaje por slug en todas las colecciones.

```javascript
const result = await findCharacterBySlug("luna-valkyrie");
// Retorna: { doc: DocumentSnapshot, collection: "characters" }
```

### Estructura en Firebase

Cada documento ahora incluye:

```json
{
  "nombre": "Luna Valkyrie",
  "slug": "luna-valkyrie",
  "apodo": "La Reina de la Luna",
  ...
}
```

## Cargar el script de migración

En `wiki.html`, añade antes del cierre de `</body>`:

```html
<script src="../../Assets/js/migrate-slugs.js"></script>
```

## Preguntas frecuentes

### ¿Qué pasa si cambio el nombre de un personaje?
El slug NO se actualiza automáticamente. Esto previene que los enlaces se rompan. Si quieres cambiar el slug, deberás hacerlo manualmente en Firebase.

### ¿Puedo personalizar los slugs?
Sí, puedes editar el campo `slug` directamente en Firebase. Solo asegúrate de que sea único.

### ¿Los slugs son case-sensitive?
No, todos los slugs se convierten a minúsculas automáticamente.

### ¿Qué caracteres están permitidos?
Solo letras sin acentos, números y guiones. Todo lo demás se convierte en guiones.

## Ejemplos de conversión

| Nombre Original | Slug Generado |
|----------------|---------------|
| Luna Valkyrie | `luna-valkyrie` |
| IA-777 | `ia-777` |
| Gissel Fischer | `gissel-fischer` |
| Señor Ñoño | `senor-nono` |
| El Último Guardián | `el-ultimo-guardian` |
| 2019-X | `2019-x` |
| ¡Molly! | `molly` |

## Próximos pasos

- [ ] Ejecutar migración para entradas existentes
- [ ] Actualizar URLs en la navegación
- [ ] Añadir campo de slug personalizado en el formulario (opcional)
- [ ] Crear sistema de redirección si se cambia un slug
