# Meli Product API

Prueba técnica de API REST que lista órdenes de productos, implementada con arquitectura hexagonal.

## Características

- **Arquitectura Hexagonal**: Separación clara entre dominio, aplicación, infraestructura y adaptadores
- **Base de datos JSON**: Persistencia simple usando archivos JSON (`data/products.json`, `data/categories.json`)
- **API REST**: Endpoints para gestión de productos y categorías
- **TypeScript**: Desarrollo con tipos estáticos
- **Testing**: Suite de pruebas con Vitest

## Instalación

```bash
npm install
```

## Inicialización de datos

Para poblar la base de datos con datos de prueba:

```bash
npm run seed
```

Para limpiar los datos:

```bash
npm run seed:clean
```

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm run build
npm start
```

## Scripts disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con recarga automática
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en modo producción
- `npm run seed` - Genera datos dummy en archivos JSON
- `npm run seed:clean` - Limpia los datos de prueba
- `npm test` - Ejecuta las pruebas
- `npm run test:coverage` - Ejecuta pruebas con reporte de cobertura
- `npm run lint` - Ejecuta linter
- `npm run format:fix` - Formatea el código
