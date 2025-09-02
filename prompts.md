# Prompts y Herramientas de IA Utilizadas

Este documento detalla las herramientas de Inteligencia Artificial y los prompts utilizados durante el desarrollo de este proyecto.

## Herramientas Utilizadas

### 1. Claude 4 Sonnet - Asistente de Código Principal

**Versión**: Claude 4 Sonnet
**Uso**: Desarrollo principal del código, arquitectura y resolución de problemas en test.

### 2. Cursor IDE

**Herramienta**: Editor con IA integrada
**Uso**: Autocompletado inteligente, refactoring y sugerencias de código

## Prompts Principales Utilizados

### 1. Prompt de Inicialización del Proyecto

```
Necesito crear una API de backend para un challenge técnico inspirado en MercadoLibre. Los requerimientos son:

- API que proporcione datos para una página de detalles del producto
- Endpoint principal para obtener detalles del producto  
- Usar persistencia en archivos JSON (no bases de datos)
- Implementar buenas prácticas: manejo de errores, documentación, testing
- Usar TypeScript y arquitectura hexagonal

¿Puedes ayudarme a diseñar la estructura del proyecto y comenzar con la implementación?
```


### 2. Prompt para Arquitectura Hexagonal

```
Quiero implementar arquitectura hexagonal (ports and adapters) para esta API de productos. 

Necesito:
- Domain layer con entidades y value objects
- Application layer con use cases y services  
- Infrastructure layer con persistencia en JSON
- Adapters layer con controllers y DTOs

¿Puedes ayudarme a estructurar esto correctamente?
```


### 3. Prompt para Implementación de Persistencia

```
Necesito implementar un repositorio que persista datos en archivos JSON para productos. 

Requerimientos:
- Interface ProductRepository en domain
- Implementación JsonProductRepository en infrastructure
- Manejo de errores personalizado
- Operaciones: findById, search, findRelated
- Usar FileUtils para operaciones de archivos

¿Puedes implementar esto?
```


### 4. Prompt para Testing

```
Necesito implementar tests unitarios para:
- Entidades del dominio (Product, Price, ProductId)
- Use cases (GetProductById, SearchProducts)
- Repositories (JsonProductRepository)
- Controllers (ProductController)

Usar Vitest como framework de testing. ¿Puedes crear tests comprehensivos con mocks y casos edge?
```


### 5. Prompt para Validaciones y Schemas

```
Necesito implementar validaciones usando Zod para:
- Request schemas para Fastify
- Response schemas para documentación automática
- DTOs con validaciones de tipos
- Manejo de errores de validación

¿Puedes implementar esto?
```



