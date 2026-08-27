# CLAUDE.md — EcoDelivery API

Este archivo define cómo debes trabajar en este repositorio. Léelo completo antes de tocar código.

## Idioma

- Comunícate **siempre en español**: mensajes al usuario, explicaciones, commits, nombres de PRs, comentarios de PR, documentación (README, ADRs).
- Excepción: el código en sí (nombres de variables, funciones, clases, strings de log técnico) va en **inglés**, siguiendo la convención habitual del proyecto. No mezcles español en identificadores de código.

## Arquitectura

- **DDD por feature (vertical slicing)**: cada feature vive en su propia carpeta con sus capas internas, no hay carpetas globales por capa (nada de `/controllers`, `/services` a nivel raíz).
- Estructura por feature:
  ```
  src/features/<feature>/
    domain/          → entidades, value objects, interfaces de repositorio
    application/      → casos de uso / servicios de aplicación
    infrastructure/    → implementación de repositorios, ORM, adaptadores externos
    presentation/      → controllers, DTOs, mappers
  ```
- El dominio no depende de infraestructura ni de framework (nada de decoradores de Nest/Express dentro de `domain/`).
- Antes de crear una feature nueva, revisa cómo están armadas las existentes y sigue el mismo patrón — no inventes una estructura distinta a mitad de proyecto.

## Documentación de la API

- La API debe tener **Swagger/OpenAPI configurado desde el inicio**, no como algo añadido al final.
- Cada endpoint documentado: parámetros, body, respuestas posibles (200/201, 400, 404, etc.), y DTOs con sus schemas reflejados en Swagger.
- El contrato de la API (Swagger) debe reflejar la realidad del código en todo momento — si cambias un endpoint, actualiza su documentación en el mismo commit.

## Código

- **Cero comentarios en el código.** Si el código necesita explicarse con un comentario, el nombre de la variable/función está mal elegido o la función hace demasiado — refactoriza en vez de comentar.
- Nombres de variables, funciones y clases en inglés, descriptivos y sin abreviar innecesariamente.
- No dejes código muerto, `console.log` de debug, ni TODOs sueltos en el código final.
- Antes de generar código que dependa de estructuras existentes (imports, shape de clases, constructores), **lee el archivo real primero** — nunca asumas cómo está hecho algo que ya existe en el repo.

## Git y ramas

- **Nunca commitees directo a `main`/`develop`.**
- Todo trabajo va en una rama con el prefijo `feature/`, ejemplo: `feature/crear-pedido`, `feature/listar-pedidos-filtros`.
- Una rama por unidad de trabajo coherente (un endpoint, una entidad, un caso de uso relacionado) — no mezcles features distintas en la misma rama.
- **Nunca hagas commit ni push por tu cuenta.** Tu trabajo termina en dejar los cambios listos en el working tree: cuando termines una unidad de trabajo, avisa explícitamente que está lista para revisión y commit — el commit y el push los hace Hector siempre.
- Al avisar que algo está listo, resume brevemente qué cambió, para que el mensaje de commit lo pueda redactar Hector con contexto.
- Antes de abrir una rama nueva, confirma que la anterior quedó mergeada o explícitamente pausada — no dejes ramas a medias sin avisar.

## Validaciones y errores

- Toda entrada de la API se valida con DTOs (class-validator o equivalente) en la capa `presentation`.
- Códigos HTTP correctos siempre: `201` al crear, `200` en lecturas/actualizaciones exitosas, `400` en validación fallida, `404` cuando el recurso no existe, `409` en conflictos de estado (transiciones inválidas).
- Manejo de errores centralizado (exception filter/middleware), nunca try/catch repetido en cada controller para lo mismo.

## Persistencia

- Persistencia real desde el día uno (Postgres vía ORM Prisma) — nunca un arreglo en memoria ni mocks como "solución final".
- Migraciones versionadas, no cambios manuales al schema.

## Antes de implementar

- Para cualquier cambio no trivial (nueva feature, cambio de arquitectura, nueva dependencia), **explica en 2-3 líneas tu plan y espera confirmación** antes de escribir el código.
- Si algo del enunciado o requisito es ambiguo, pregunta en vez de asumir — sobre todo en reglas de negocio (transiciones de estado, validaciones de campos).
- Al terminar una feature, corre y valida que el proyecto siga arrancando y que Swagger refleje los cambios antes de dar por cerrada la tarea.
