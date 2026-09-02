---
name: migracion-angular-interia
description: Migra o refactoriza código Angular de InterIA siguiendo sus convenciones de arquitectura, componentes compartidos, formularios, estilos, integración HTTP y documentación. Úsala para trasladar features, layouts o elementos reutilizables al proyecto Angular_GestorBacklogIA; no para cambios exclusivos del backend.
---

# Migración Angular InterIA

Migra de forma incremental, conserva el comportamiento solicitado y aplica las decisiones vigentes
del proyecto sin extender el alcance autorizado.

## Cargar el contexto necesario

1. Lee siempre [las convenciones generales](../../../docs/CONVENCIONES_FRONTEND.md) completas.
2. Lee completos únicamente los documentos especializados relacionados con el cambio:
   - Formularios o validaciones: [formularios reactivos](../../../docs/FORMULARIOS_REACTIVOS.md).
   - CSS, tokens, primitivas o componentes visuales compartidos:
     [estilos del frontend](../../../docs/ESTILOS_FRONTEND.md).
   - DTO, endpoints, mappers, servicios HTTP o estados de consulta:
     [integración con el backend](../../../docs/INTEGRACION_BACKEND.md).
   - Login, sesión, guards, popup o Kong:
     [autenticación mediante Kong](../../../docs/AUTENTICACION_KONG.md).
   - Loader o concurrencia HTTP: [carga global](../../../docs/CARGA_GLOBAL.md).
   - Inicio, layout del panel, navegación o futura composición por permisos:
     [inicio único del panel](../../../docs/INICIO_PANEL.md).
   - Creación de proyectos, secciones reutilizables, borradores o recorrido por pasos:
     [creación de proyectos](../../../docs/CREACION_PROYECTOS.md).
   - Información de proyectos, pasos de consulta, modos de formulario o versionamiento:
     [información y versiones de proyectos](../../../docs/INFORMACION_PROYECTOS.md).
   - Portafolio, listado, filtros, paginación o acciones sobre proyectos:
     [listado de proyectos](../../../docs/LISTADO_PROYECTOS.md).
3. Inspecciona el código origen y el destino antes de proponer la estructura. Si el usuario excluye
   servicios, integración u otra parte, conserva el punto de extensión sin implementarla.
4. Si el cambio incluye decisiones de composición o presentación, aplica también la skill
   `diseno-interia` disponible en este proyecto.

## Asignar cada responsabilidad

Busca primero implementaciones existentes y clasifica cada pieza por su responsabilidad real:

- `core`: infraestructura transversal y única de la aplicación.
- `shared`: contratos, directivas y componentes reutilizables sin reglas de una feature.
- `layouts`: shells persistentes para grupos de rutas.
- `features`: dominio, páginas, composición, datos y estilos particulares.
- `styles`: tokens, base y primitivas visuales globales.

Migra compartidos dentro del mismo flujo cuando exista un contrato transversal actual. No promuevas
una pieza a `shared` por reutilización hipotética ni crees carpetas para un único archivo sin una
expectativa concreta de crecimiento.

## Auditar antes de diseñar

Aplica la sección “Auditoría previa a una migración o extensión” de las convenciones generales. En
proporción al cambio, revisa horizontalmente la capacidad destino y no solo el archivo solicitado.
Antes de implementar, identifica duplicidades, contratos ya disponibles, puntos de centralización
y responsabilidades que deben continuar específicas. Usa esos hallazgos para proponer o ajustar la
estructura; no esperes a que la repetición aparezca después de migrar varios pasos.

## Ejecutar la migración

1. Compara estructura, comportamiento, estados, accesibilidad, estilos, dependencias y contratos
   entre origen y destino, incorporando los hallazgos de la auditoría previa.
2. Identifica qué se conserva, qué ya existe en el destino y qué mejora es necesaria para integrarlo.
3. Implementa el cambio en la capa correspondiente. Mantén HTTP, router, sesión y permisos fuera de
   componentes presentacionales.
4. Reutiliza tokens, primitivas `ui-*`, componentes compartidos y utilidades transversales antes de
   crear alternativas locales.
5. Distingue una consulta fallida, una consulta exitosa sin datos y una operación pendiente. No
   dupliques el loader global ni conviertas errores en estados vacíos.
6. Añade o actualiza pruebas sobre contratos y comportamiento observable; evita pruebas que solo
   reproduzcan la implementación.
7. Busca implementaciones anteriores, imports y tipos obsoletos para no dejar código muerto.
8. Verifica el resultado en proporción al cambio y ejecuta la verificación mínima establecida en las
   convenciones antes de cerrar una migración completa.

No introduzcas roles, endpoints, servicios o abstracciones ficticias para completar partes todavía
no disponibles. Conserva `TODO` concretos únicamente para integraciones reales pendientes.

## Mantener la documentación

Después de implementar, evalúa si el cambio crea o modifica una convención transversal:

- Actualiza el documento especializado existente que sea dueño de la decisión.
- No crees un `.md` por componente, bug o decisión local de una feature.
- Crea un documento especializado solo cuando aparezca un tema transversal estable que no encaje en
  los documentos actuales.
- Si creas un documento especializado, agrégalo al índice de
  [convenciones generales](../../../docs/CONVENCIONES_FRONTEND.md).
- Documenta el criterio vigente y el resultado esperado, no el historial de la conversación ni una
  copia extensa del código.

Mantén las reglas en `docs`; este archivo coordina el proceso y no debe duplicarlas.

## Cerrar el trabajo

Resume qué se migró, qué se convirtió en compartido, qué documentación cambió y qué verificaciones
se ejecutaron. Señala integraciones pendientes sin presentarlas como defectos terminados.
