# 🚀 Desplegar Worker de Cloudflare

## 📋 Pre-requisitos

1. Tener Wrangler instalado:
```bash
npm install -g wrangler
```

2. Estar autenticado:
```bash
wrangler login
```

## 🛠️ Desplegar cambios

### Opción 1: Desplegar directamente
```bash
cd Experimentos/chatbot/worker/
npx wrangler deploy
```

### Opción 2: Publicar (alias de deploy)
```bash
cd Experimentos/chatbot/worker/
npx wrangler publish
```

## 🔧 Configurar secrets

El worker necesita estas variables de entorno configuradas en Cloudflare:

```bash
# API Key de Groq (para el chatbot con IA)
npx wrangler secret put GROQ_API_KEY

# API Key de HuggingFace (para generar imágenes)
npx wrangler secret put HUGGINGFACE_API_KEY

# Webhook de Discord (para recibir reportes)
npx wrangler secret put DISCORD_WEBHOOK
```

## 📊 Ver logs del worker

Para debug en tiempo real:
```bash
npx wrangler tail
```

## 🧪 Probar localmente

Antes de desplegar, prueba localmente:
```bash
npx wrangler dev
```

Esto levantará el worker en `http://localhost:8787`

## ⚠️ Cambios importantes aplicados

### Fix del error 403 Forbidden

Eliminamos la verificación restrictiva de origen que causaba:
```
POST https://fenix-chatbot.aleverafenix12345.workers.dev/ 403 (Forbidden)
```

**Antes:**
```javascript
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'https://thisisfenix.github.io'
];

if (origin && !allowedOrigins.includes(origin)) {
  return new Response('Forbidden', { status: 403, headers: corsHeaders });
}
```

**Ahora:**
```javascript
// CORS ya está configurado con Access-Control-Allow-Origin: *
// No necesitamos verificación adicional de origen
```

Esto permite que el chatbot funcione desde cualquier origen mientras mantiene CORS habilitado.

## ✅ Verificar deployment

Después de desplegar:

1. Visita tu chatbot: https://thisisfenix.github.io/FenixLaboratory/Experimentos/chatbot/chatbot.html
2. Abre DevTools (F12)
3. Envía un mensaje
4. Verifica que no haya errores 403

## 🔄 Workflow recomendado

```bash
# 1. Hacer cambios en el código
# 2. Probar localmente
npx wrangler dev

# 3. Si funciona, desplegar
npx wrangler deploy

# 4. Ver logs en tiempo real
npx wrangler tail

# 5. ¿Algún error? Revisar los logs y volver al paso 1
```

## 📦 Archivo wrangler.toml

Tu worker debería tener un archivo `wrangler.toml` así:

```toml
name = "fenix-chatbot"
main = "index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "CHAT_HISTORY"
id = "tu-kv-namespace-id"
```

## 🆘 Troubleshooting

**Error: No KV namespace configured**
```bash
# Crear KV namespace
npx wrangler kv:namespace create "CHAT_HISTORY"

# Copiar el ID al wrangler.toml
```

**Error: Unauthorized**
```bash
# Re-autenticarse
npx wrangler login
```

**Error: Secret not found**
```bash
# Añadir los secrets requeridos (ver sección "Configurar secrets")
```
