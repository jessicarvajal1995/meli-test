# Cómo ejecutar el proyecto

Este documento proporciona instrucciones paso a paso para ejecutar la API de productos de MercadoLibre.

## Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** o **pnpm** (recomendado)
- **Git** (para clonar el repositorio)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd meli-test
```

### 2. Instalar dependencias

```bash

npm install

```

### 3. Generar datos de prueba

El proyecto incluye un generador de datos que crea productos de ejemplo en formato JSON:

```bash
# Generar datos de prueba
npm run seed

```

Esto creará los archivos:
- `data/products.json` - Base de datos de productos
- `data/categories.json` - Categorías disponibles

## Ejecución

### Modo Desarrollo

Para ejecutar el servidor en modo desarrollo con recarga automática:

```bash
# Con npm
npm run dev

# Con pnpm
pnpm dev
```

El servidor se iniciará en: http://localhost:3000

### Modo Producción

Para ejecutar en modo producción:

```bash
# 1. Compilar TypeScript
npm run build

# 2. Iniciar servidor
npm start
```

## Verificación

### Health Check

Una vez que el servidor esté ejecutándose, puedes verificar su estado:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1.234
}
```

### Endpoints Disponibles

La API estará disponible en: http://localhost:3000/api/v1

- **GET** `/api/v1/products/:id` - Obtener detalle de un producto
- **GET** `/api/v1/products` - Buscar productos (con filtros opcionales)
- **GET** `/api/v1/products/:id/related` - Obtener productos relacionados

### Ejemplo de uso

```bash
# Obtener un producto específico
curl http://localhost:3000/api/v1/products/MLU475845508

# Buscar productos por categoría
curl "http://localhost:3000/api/v1/products?categoryId=CAT_ELECTRONICS_PHONES&limit=10"

# Obtener productos relacionados
curl "http://localhost:3000/api/v1/products/MLU475845508/related?limit=5"
```

## Testing

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar pruebas con cobertura

```bash
npm run test:coverage
```

### Ejecutar pruebas en modo watch

```bash
npm run test:watch
```

## Comandos útiles

### Linting y formateo

```bash
# Verificar estilo de código
npm run lint

# Formatear código automáticamente
npm run format:fix
```

### Limpieza de datos

```bash
# Limpiar datos de prueba generados
npm run seed:clean
```

## Configuración

### Variables de entorno

El servidor acepta las siguientes variables de entorno:

- `PORT` - Puerto del servidor (default: 3000)
- `HOST` - Host del servidor (default: 0.0.0.0)

Ejemplo:
```bash
PORT=8080 HOST=localhost npm start
```

### Estructura de datos

Los datos se almacenan en la carpeta `data/`:
- `products.json` - Base de datos principal de productos
- `categories.json` - Catálogo de categorías

### Error: Archivos de datos no encontrados

Si faltan los archivos de datos:

```bash
# Regenerar datos de prueba
npm run seed
```

### Error: Dependencias faltantes

Si hay problemas con las dependencias:

```bash
# Limpiar e instalar nuevamente
rm -rf node_modules package-lock.json
npm install
```

## Testing con Postman

### Importar Colección

La API incluye una colección completa de Postman con todos los endpoints:

1. **Importar archivos**:
   ```bash
   # En Postman: Import → File
   - postman_collection.json (endpoints)
   - postman_environment.json (variables)
   ```
2. **Seleccionar Environment**: "MercadoLibre API - Development"

### Usar la Colección

La colección incluye:
- **7 endpoints principales** con ejemplos
- **Tests automatizados** para validación
- **Variables de entorno** configuradas
- **Casos de error** documentados
- **Ejemplos de respuesta** reales

### Ejecutar Tests

```bash
# Runner Collection
Postman → Collections → MercadoLibre Product API → Run Collection
```