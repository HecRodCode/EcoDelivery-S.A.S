# Features

Cada feature vive en su propia carpeta siguiendo DDD por vertical slicing:

```
src/features/<feature>/
  domain/           entidades, value objects, interfaces de repositorio
  application/      casos de uso / servicios de aplicación
  infrastructure/   implementación de repositorios, ORM, adaptadores externos
  presentation/      controllers, DTOs, mappers
```

El dominio no depende de infraestructura ni de decoradores de Nest/Express.
Antes de crear una feature nueva, revisa cómo están armadas las existentes.
