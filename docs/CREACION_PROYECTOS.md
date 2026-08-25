# Creación de proyectos

Este documento registra el recorrido funcional y las responsabilidades estables para crear y
especificar proyectos.

## Punto de partida

La creación comienza en `/panel/proyectos/nuevo`. La página captura la referencia de Azure,
consulta `ValidarVinculacionAzure`, presenta un resumen para confirmación y solo entonces solicita
`CrearBorrador`.

- `VinculacionAzure` captura los valores y presenta el resultado de la validación; no conoce HTTP,
  mensajes ni navegación.
- La página coordina las operaciones, evita envíos duplicados y muestra fallos mediante el sistema
  global de mensajes.
- El servicio conserva el sobre `ResultadoApi`, valida errores funcionales y entrega modelos de
  interfaz mediante mapeadores.
- El loader global representa las solicitudes HTTP; los componentes no duplican indicadores ni
  textos de carga.

## Experiencia de vinculación con Azure

La página utiliza el espacio proporcionado por `contenido-panel` y presenta una única tarjeta de
trabajo. No agrega márgenes exteriores, límites de ancho ni una tarjeta lateral para explicar la
información importada.

- La introducción del formulario comunica su propósito una sola vez.
- No se agregan encabezados internos como “Datos obligatorios” cuando los labels ya identifican
  claramente los campos.
- El enlace del proyecto o board y el ID de la épica principal son obligatorios.
- `idEquipo` es opcional: vacío solicita detección automática y un GUID indica un Team específico.
- La elección del Team no utiliza botones, radios, selectores de modo ni campos condicionales.
- La ayuda del Team se presenta junto al único campo y explica ambos comportamientos.
- La indicación sobre la revisión previa vive en el footer junto a “Comprobar datos”; no se
  presenta como una franja informativa independiente.
- La captura y la confirmación son estados internos de un único componente. Después de validar
  Azure, el resultado reemplaza el formulario y conserva los valores para permitir su edición.
- El proyecto, la épica y el equipo se presentan dentro de un único resumen con divisores internos;
  no se crean tarjetas independientes dentro de la tarjeta principal de la etapa.
- La confirmación no introduce otra franja de continuación. El footer indica de forma secundaria
  que los datos se guardarán como borrador y “Confirmar y continuar” cierra la vinculación antes de
  avanzar dentro del recorrido.
- Después de confirmar, la vinculación de Azure queda asociada al borrador y no se habilita para
  edición desde el recorrido de creación. Su información se presentará posteriormente como una
  referencia de solo lectura dentro de la consulta del proyecto.
- No se crean componentes separados de formulario y resumen mientras ambos estados pertenezcan
  exclusivamente a esta misma etapa.

Los bloques auxiliares se conservan únicamente cuando aportan una decisión o información que el
usuario no pueda deducir del formulario. No se crean tarjetas, encabezados o explicaciones que
repitan el contenido principal.

## Organización del dominio

La creación y la consulta futura pertenecen al dominio `features/proyectos`. Las secciones
funcionales compartidas viven en `proyectos/config`, mientras cada capacidad conserva páginas,
servicios y componentes propios.

```text
features/proyectos/
├── config/
│   └── secciones-proyecto.config.ts
└── creacion/
    ├── components/
    ├── config/
    ├── mappers/
    ├── models/
    ├── pages/
    └── services/
```

La capacidad `informacion` se incorporará cuando se migre su experiencia real; no se crean
carpetas o componentes vacíos como anticipación.

## Recorrido de creación

El recorrido de creación contiene nueve etapas:

1. Azure DevOps.
2. Contexto.
3. Tipo de solución.
4. Necesidad.
5. Objetivos.
6. Alcance.
7. Roles.
8. Equipo.
9. Flujo.

“Demanda esperada” no forma parte de la experiencia ni del contrato del backend. No debe reaparecer
como paso, formulario, ruta o propiedad de transporte.

`SECCIONES_PROYECTO` declara las ocho secciones funcionales reutilizables en creación e información.
`ETAPAS_CREACION_PROYECTO` agrega la vinculación de Azure al inicio sin duplicar el catálogo. Los
números pertenecen al orden de creación y no se almacenan en las secciones compartidas.

Las etapas posteriores a Azure tendrán su propia ruta bajo
`/panel/proyectos/:proyectoId/creacion`. El borrador se crea antes de abrir Contexto para que el
avance pueda recuperarse desde cualquier sesión.

## Presentación del recorrido

`PaginaCreacionProyecto` funciona como shell de las rutas hijas y presenta una sola vez el
encabezado general, `RecorridoCreacionProyecto`, la tarjeta de etapa y el `router-outlet` de su
contenido.

- La página proporciona la etapa actual y las claves realmente completadas; el componente no
  deduce el avance por la posición.
- La tarjeta de etapa obtiene icono, título y descripción desde `ETAPAS_CREACION_PROYECTO`, igual
  que el recorrido. Las páginas hijas no replican esa identidad.
- El encabezado y el footer de la etapa comparten una superficie tenue; el contenido conserva la
  superficie blanca de trabajo.
- El encabezado general describe el recorrido completo y no cambia para explicar una etapa
  particular como la vinculación con Azure.
- La posición se presenta una sola vez junto a “Definición del proyecto” mediante “Paso 1 de 9”.
  La barra representa esa posición desde la primera etapa; los indicadores de cada elemento
  comunican cuáles etapas están realmente completadas.
- Cuando “Volver al inicio” es la única acción del encabezado general, utiliza la variante inversa
  blanca para conservar contraste sobre la superficie oscura.
- Las etapas completadas y navegables son estados independientes. Azure puede estar completada sin
  permitir una modificación que invalide información posterior.
- `etapaSeleccionada` solicita la navegación, pero la página decide la ruta y cualquier
  persistencia o confirmación necesaria.
- La etapa actual y las pendientes no generan navegación falsa.
- En escritorio el recorrido permanece vertical junto al formulario; en tamaños reducidos se
  convierte en una lista horizontal desplazable.
- Los iconos provienen del catálogo compartido y los estados actual, completado y pendiente se
  distinguen sin depender únicamente del color.
- La navegación utiliza “Azure DevOps” como etiqueta breve y “Vinculación de origen” como contexto;
  la etapa conserva la explicación completa dentro de su contenido.
- La etapa actual no repite “En curso”: `aria-current` y el tratamiento visual ya comunican su
  ubicación. La flecha aparece únicamente cuando la etapa permite navegación.

La futura información del proyecto reutilizará `SECCIONES_PROYECTO` y sus modelos, pero tendrá una
navegación de consulta sin estados de progreso de creación. Si muestra la referencia de Azure, se
presentará como origen y trazabilidad del proyecto.
