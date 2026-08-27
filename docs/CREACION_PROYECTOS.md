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
  no se crean tarjetas independientes dentro de la tarjeta principal del paso.
- La confirmación no introduce otra franja de continuación. El footer indica de forma secundaria
  que los datos se guardarán como borrador y “Confirmar y continuar” cierra la vinculación antes de
  avanzar dentro del recorrido.
- Después de confirmar, la vinculación de Azure queda asociada al borrador y no se habilita para
  edición desde el recorrido de creación. Su información se presentará posteriormente como una
  referencia de solo lectura dentro de la consulta del proyecto.
- No se crean componentes separados de formulario y resumen mientras ambos estados pertenezcan
  exclusivamente a este mismo paso.

Los bloques auxiliares se conservan únicamente cuando aportan una decisión o información que el
usuario no pueda deducir del formulario. No se crean tarjetas, encabezados o explicaciones que
repitan el contenido principal.

## Organización del dominio

La creación y la consulta futura pertenecen al dominio `features/proyectos`. El catálogo que
identifica las secciones vive en `proyectos/config`; los modelos y componentes funcionales que
compartan creación e información viven en `proyectos/secciones`. Cada capacidad conserva sus
páginas, persistencia, navegación y estado de flujo.

```text
features/proyectos/
├── proyectos.routes.ts
├── config/
│   └── secciones-proyecto.config.ts
├── secciones/
│   └── contexto/
│       ├── components/
│       │   ├── formulario-contexto-proyecto/
│       │   └── detalle-contexto-proyecto/  # Al migrar Información
│       ├── config/
│       └── models/
├── creacion/
│   ├── components/
│   ├── config/
│   │   └── pasos-creacion-proyecto.config.ts
│   ├── guards/
│   ├── mappers/
│   ├── models/
│   ├── pages/
│   │   ├── pagina-creacion-proyecto/
│   │   └── pasos/
│   │       ├── pagina-vinculacion-azure/
│   │       ├── pagina-contexto-proyecto/
│   │       └── pagina-[seccion]-proyecto/
│   └── services/
└── informacion/
    ├── mappers/
    ├── pages/
    └── services/
```

La capacidad `informacion` se incorporará cuando se migre su experiencia real; no se crean
carpetas o componentes vacíos como anticipación.

`app.routes.ts` carga el segmento `proyectos` mediante `loadChildren`. La feature conserva en
`proyectos.routes.ts` sus rutas hijas, guards y providers; así el recorrido de creación no forma
parte del bundle inicial y cada página continúa usando `loadComponent`.

### Convención entre secciones y pasos

`secciones` y `pasos` no son nombres intercambiables:

- Una **sección** representa contenido reutilizable del dominio del proyecto. Conserva modelos,
  configuración, mappers, formularios y futuras vistas de detalle.
- Un **paso** representa una página del recorrido de creación. Coordina borrador, guardado,
  progreso y navegación mediante componentes de una sección.

Por esta razón no se crean páginas dentro de `proyectos/secciones` ni se alojan modelos de dominio
en `creacion/pages/pasos`. La separación permite reutilizar una sección posteriormente desde
Información sin trasladar reglas del recorrido de creación.

## Reutilización entre creación e información

Los pasos de creación y las secciones de información representan los mismos datos del proyecto,
pero no el mismo flujo. Se comparte el contenido del dominio; no se comparte una página completa
ni se crea un componente condicionado por modos generales como `creacion` e `informacion`.

```text
Formulario o detalle de una sección
                │
       modelo común del dominio
          ┌─────┴─────┐
          │           │
 página de creación   página de información
 borrador y avance    consulta o actualización
```

- `secciones/<seccion>/models` define el dato independiente de HTTP y de la ruta.
- `secciones/<seccion>/components` contiene el formulario reutilizable y, cuando haga falta, su
  representación de solo lectura.
- `secciones/<seccion>/config` contiene validaciones, opciones y mensajes propios de esa sección.
- `creacion/pages/pasos` integra el contenido con el borrador, la revisión optimista, el progreso
  y la navegación al siguiente paso.
- `informacion/pages/secciones` integra el mismo dominio con la consulta del proyecto y, si la
  regla funcional lo permite, con su operación de actualización.
- Los mappers de cada capacidad traducen sus DTO al modelo común sin exponer contratos del backend
  a los componentes.
- Los servicios de creación e información permanecen separados porque usan operaciones y reglas
  de persistencia diferentes.
- La tarjeta, el encabezado, el footer y los botones del recorrido pertenecen al shell de creación;
  no forman parte del formulario compartido.

El formulario recibe datos iniciales y catálogos mediante entradas y emite un valor válido y
normalizado. No conoce el identificador del proyecto, la revisión del borrador, HTTP, mensajes
globales ni rutas. La página que lo consume decide cómo guardar y qué ocurre después.

### Regla especial para Azure

Azure es el origen del proyecto y no una sección editable después de crear el borrador.

- Durante el primer paso, `VinculacionAzure` captura, valida y permite corregir los datos antes de
  confirmarlos.
- Al confirmar, la asociación queda cerrada para el recorrido de creación y se avanza a Contexto.
- En información del proyecto se reutiliza su modelo de presentación, pero se muestra mediante un
  componente de detalle sin controles de edición.
- No se reutiliza el formulario de vinculación dentro de información ni se ofrece una acción para
  cambiar la asociación.
- El componente de detalle de Azure se extraerá cuando exista el segundo consumidor; no se crean
  archivos o carpetas vacíos de forma anticipada.

Esta misma separación se evalúa para cada paso. Una sección editable puede compartir formulario y
detalle; una sección inmutable comparte únicamente el contrato y su representación de lectura.

## Implementación de Contexto

Contexto es la primera aplicación del patrón compartido. Su modelo y formulario viven en
`proyectos/secciones/contexto`; `PaginaContextoProyecto` únicamente los integra con el recorrido de
creación.

- El modelo contiene `nombre`, `responsable`, `fechaObjetivo`, `prioridadCatalogoId` y
  `descripcion`.
- El formulario es reactivo y estrictamente tipado, administra sus validaciones con
  `appErrorCampo` y emite valores sin espacios exteriores.
- Los límites de 200, 150 y 2000 caracteres reflejan el contrato vigente del backend.
- La prioridad se obtiene del catálogo remoto `Prioridad` y el formulario conserva su ID; no se
  queman IDs, códigos u opciones como Alta, Media o Baja.
- La página carga en conjunto el borrador y las prioridades, presenta un estado de error
  reintentable cuando alguno falla y deja el loader en la infraestructura global.
- El footer y “Guardar y continuar” pertenecen al contenedor de creación y se proyectan dentro del
  formulario; no quedan fijados en el componente reutilizable.
- La futura consulta utilizará `DetalleContextoProyecto`. Si habilita edición, podrá reutilizar
  `FormularioContextoProyecto`, pero guardará mediante la operación propia de Información.

`EstadoCreacionProyectoService` vive en el inyector de la ruta que contiene
`PaginaCreacionProyecto`. Así el guard, el shell y sus páginas hijas comparten la misma fotografía.
Carga el borrador una sola vez mientras el recorrido permanece activo, conserva su revisión y
entrega la fotografía actualizada al siguiente paso.

`CoordinadorPasoCreacionProyectoService` se proporciona en cada página de sección que utiliza el
ciclo común. Centraliza el parámetro del proyecto, la carga reintentable, el bloqueo de envíos
duplicados, el guardado, la notificación y la navegación exitosa. Su instancia se destruye al salir
de la página; el componente conserva únicamente la adaptación de su sección y el destino siguiente.
Contexto mantiene su coordinación particular porque también combina catálogos y comunica el nombre
al shell. No se introduce una clase base ni se trasladan estas responsabilidades a los formularios.

El mismo estado conserva el nombre vigente del proyecto. `FormularioContextoProyecto` comunica el
nombre mientras se escribe, la página de Contexto actualiza el estado y el shell lo presenta como
título del encabezado. El formulario no conoce el encabezado y los pasos siguientes conservan la
misma identidad; mientras no exista un nombre se utiliza “Nuevo proyecto” como respaldo.

`ActualizarBorrador` requiere una fotografía completa. El mapper reemplaza solamente Contexto y
preserva `tipoSolucionJson`, `necesidadJson`, `objetivosJson`, `alcanceJson`, `rolesJson`,
`equipoJson` y `diagramFlujoJson`. La revisión enviada siempre es la última confirmada por el
backend; un conflicto HTTP 409 se comunica sin sobrescribir el trabajo de otra actualización.
Editar una sección anterior conserva el mayor `pasoActual` alcanzado y no hace retroceder el
avance recuperable del borrador.

`NotificadorErroresBorradorProyectoService` concentra la clasificación del conflicto 409 y los
mensajes comunes de concurrencia. Cada página solo comunica el error y la clave de su sección; los
mensajes particulares se mantienen en `mensajes-guardado-borrador.config.ts`. Esta regla pertenece
a la creación de proyectos y no a un interceptor HTTP global, porque otros recursos pueden dar un
significado diferente al mismo código de estado.

El `pasoActual` del backend enumera las secciones funcionales y no incluye Azure. Por eso el
borrador nace con `pasoActual = 1` al abrir Contexto y se guarda con `pasoActual = 2` antes de abrir
Tipo de solución, aunque visualmente sean los pasos 2 y 3 del recorrido de nueve pasos.

## Implementación de Tipo de solución

Tipo de solución aplica el mismo límite entre sección reutilizable y coordinación de creación:

- `proyectos/secciones/tipo-solucion` contiene modelo, formulario, configuración y mapper.
- El modelo utiliza `tieneInterfaz` y `plataforma`; una solución sin interfaz conserva
  `plataforma: null`.
- El formulario exige seleccionar el canal y solicita plataforma únicamente cuando existe
  interfaz. Al cambiar a “Sin interfaz” elimina la plataforma anterior.
- Las alternativas se presentan mediante `SelectorTarjetas`, un `ControlValueAccessor` compartido
  con radios nativos, iconos centralizados y compatibilidad con `appErrorCampo`.
- `PaginaTipoSolucionProyecto` carga y guarda mediante `EstadoCreacionProyectoService`; no contiene
  reglas del formulario ni manipula JSON directamente.
- Guardar la sección lleva `pasoActual` al menos a 3 y abre el destino estable de Necesidad.

El formato persistido es `{"tieneInterfaz":true,"plataforma":"Web"}`. El mapper solo admite estas
claves canónicas en español. Un JSON vacío, inválido o con claves ajenas al contrato produce un
formulario sin selección y no rompe el recorrido.

La construcción de `ActualizarBorrador` acepta reemplazos parciales internos y genera siempre la
fotografía completa exigida por el backend. Así cada sección reemplaza únicamente su contenido sin
crear copias diferentes del comando ni perder datos de secciones posteriores.

`ClaveSeccionProyecto` es un enum de cadenas y constituye la identidad única de las secciones. Las
páginas envían una actualización discriminada con `seccion` y `datos`; el tipado relaciona cada
miembro del enum con su modelo y evita combinaciones inválidas. Un único método guarda la sección,
selecciona su mapper, ejecuta `ActualizarBorrador`, conserva la revisión y calcula el avance. No se
detecta una sección inspeccionando propiedades del objeto ni se repiten métodos HTTP por paso.

## Implementación de Necesidad de negocio

Necesidad conserva la sección narrativa reutilizable fuera del recorrido de creación:

- `proyectos/secciones/necesidad` contiene el modelo, el formulario, la configuración y el mapper.
- El modelo canónico usa `situacionActual`, `problemas` e `impacto`.
- Los tres campos se presentan apilados y a todo el ancho porque capturan explicaciones extensas;
  cada uno conserva el límite vigente de 900 caracteres.
- El formulario utiliza `appErrorCampo`, contadores y el footer proyectado por la página. No recibe
  funciones para consultar errores ni conoce la persistencia del borrador.
- `PaginaNecesidadProyecto` carga y guarda mediante `EstadoCreacionProyectoService`.
- Guardar la sección lleva `pasoActual` al menos a 4 y abre el destino estable de Objetivos.

El formato persistido es `{"situacionActual":"...","problemas":"...","impacto":"..."}`. La
futura vista de Información reutilizará este modelo y el mapper, pero tendrá una representación de
lectura propia; no duplicará el contrato ni forzará el formulario editable.

## Contratos JSON canónicos

Los JSON internos de las secciones usan exclusivamente nombres canónicos en español. Los mappers
no mantienen aliases en inglés ni intentan adivinar formatos anteriores. Esto evita contratos
ambiguos, ramas permanentes de compatibilidad y diferencias silenciosas entre frontend y backend.

Si existen registros históricos con otra estructura, se transforman mediante una migración de
datos versionada en el backend. No se trasladan reglas temporales de migración al código cotidiano
de cada sección.

La comprobación estructural repetida vive en `shared/serializacion/json/lector-json.ts`. Este lector
solo confirma si el contenido es un objeto o una colección JSON y permite recuperar texto
normalizado; no asigna tipos de dominio ni valida contratos funcionales. Cada sección conserva su
propio mapper para decidir las claves admitidas, los valores parciales y el formato que persiste.

## Implementación de Objetivos

Objetivos conserva la misma separación entre dominio reutilizable y coordinación del recorrido:

- `proyectos/secciones/objetivos` contiene modelo, formulario dinámico, configuración y mapper.
- El contrato usa `objetivoGeneral` y `objetivosEspecificos`; la colección contiene cadenas y no
  objetos con nombres alternativos.
- El objetivo general es obligatorio y admite hasta 400 caracteres.
- Se exige entre uno y ocho objetivos específicos. El formulario administra el `FormArray`, impide
  eliminar el último control y bloquea nuevas adiciones al alcanzar el máximo.
- La página de creación carga y guarda mediante `EstadoCreacionProyectoService`; no manipula la
  colección ni serializa JSON.
- Guardar la sección lleva `pasoActual` al menos a 5 y abre el destino estable de Alcance.

El formato persistido es
`{"objetivoGeneral":"...","objetivosEspecificos":["...","..."]}`. La futura vista de
Información reutilizará el modelo y el mapper, con una presentación de lectura propia.

## Implementación de Alcance

Alcance define de forma explícita los límites funcionales del proyecto:

- `proyectos/secciones/alcance` contiene modelo, formulario, configuración y mapper.
- El contrato canónico usa `incluido` y `excluido`; no admite las claves anteriores `included` y
  `excluded`.
- Ambos campos son obligatorios y admiten hasta 700 caracteres.
- El formulario presenta dos columnas equivalentes en escritorio y una sola columna en tamaños
  reducidos. Los estilos del componente solo resuelven esta composición particular.
- La página carga y guarda mediante `EstadoCreacionProyectoService`, reutiliza los errores comunes
  del borrador y no serializa JSON directamente.
- Guardar Alcance lleva `pasoActual` al menos a 6 y abre el destino estable de Roles.

El formato persistido es `{"incluido":"...","excluido":"..."}`. Información del proyecto
reutilizará el modelo y el mapper, pero presentará los límites mediante una vista de lectura propia.

## Implementación de Roles

Roles representa perfiles funcionales del proyecto, no permisos ni roles de seguridad del
aplicativo:

- `proyectos/secciones/roles` contiene el modelo, el formulario dinámico, la configuración y el
  mapper reutilizables.
- El contrato canónico usa una colección de objetos con `nombre` y `descripcion`; no admite las
  claves anteriores `name` y `description`.
- Se exige al menos un rol, ambos campos son obligatorios y los nombres deben ser únicos ignorando
  mayúsculas y espacios exteriores.
- El formulario administra el `FormArray`, conserva alineadas las acciones aunque aparezcan
  errores y no conoce el borrador ni la navegación.
- Los roles sugeridos del componente anterior no se conservan como literales. Si el producto los
  requiere, deben provenir de una configuración o catálogo explícito.
- La página carga y guarda mediante el coordinador común de los pasos de creación.
- Guardar Roles lleva `pasoActual` al menos a 7 y abre el destino estable de Equipo.

El formato persistido es
`[{"nombre":"Administrador","descripcion":"Configura la solución."}]`. Información del
proyecto reutilizará este modelo y el mapper, pero mostrará los perfiles mediante una vista de
lectura propia.

## Implementación de Equipo

Equipo configura la participación de las personas importadas desde el Team vinculado en Azure
DevOps. No duplica los roles funcionales definidos en el paso anterior:

- `proyectos/secciones/equipo` contiene el modelo, el formulario, la configuración y el mapper
  reutilizables.
- La identidad de cada integrante (`idAzure`, nombre, correo y condición de administrador) es de
  solo lectura y se origina en Azure.
- La configuración local asigna `perfilTecnicoCodigo` y `dedicacionCodigo`; ambos son obligatorios
  para guardar la sección.
- El formulario presenta búsqueda por nombre o correo y filtros de todos, pendientes y
  configurados. No pagina el Team; comunica el progreso vigente a la página coordinadora.
- Equipo no crea una segunda tarjeta ni un encabezado interno. El nombre del Team, el progreso y
  “Actualizar desde Azure” se integran en el único encabezado del paso mediante un contexto
  opcional proporcionado en la ruta de creación.
- La selección múltiple permite aplicar un perfil técnico, una dedicación o ambos valores a todas
  las personas seleccionadas. La selección es estado temporal de interfaz y no se persiste.
- “Actualizar desde Azure” consulta nuevamente la membresía, relaciona integrantes mediante
  `idAzure`, conserva sus asignaciones, incorpora personas nuevas sin configurar y retira las que
  ya no pertenecen al Team.
- `equipoJson` es la fuente de la configuración guardada. Si la consulta del borrador no incluye
  integrantes de Azure, la página presenta inmediatamente esa fotografía y sincroniza la membresía
  en segundo plano, conservando las asignaciones mediante `idAzure`.
- Cuando la consulta del borrador ya incluye la membresía de Azure, la página la combina con
  `equipoJson` sin ejecutar otra solicitud. Una sincronización explícita sí considera autoritativa
  la colección recibida, incluso cuando esté vacía, para retirar integrantes que dejaron el Team.
- La acción “Actualizar desde Azure” queda disponible para renovar explícitamente la membresía
  después de restaurar una configuración existente.
- La página obtiene del formulario una fotografía de la edición antes de sincronizar. Así coordina
  HTTP, errores y la combinación resultante sin perder cambios ni trasladar esas responsabilidades
  al formulario compartido.
- Guardar Equipo lleva `pasoActual` al menos a 8 y abre el destino estable de Flujo de usuario.

El formato persistido es una colección canónica en español:

```json
[
  {
    "idAzure": "usuario-1",
    "nombre": "María Gómez",
    "correo": "maria@empresa.co",
    "esAdministradorAzure": false,
    "perfilTecnicoCodigo": "qa",
    "dedicacionCodigo": "75"
  }
]
```

Los perfiles técnicos y dedicaciones viven temporalmente en
`equipo/config/equipo-proyecto.config.ts`. Los componentes consumen códigos estables y no repiten
literales. Cuando el backend exponga catálogos oficiales, la página los proporcionará al formulario
sin modificar el contrato persistido ni la composición de la sección.

En Información del proyecto, Equipo reutilizará el modelo y el mapper. La identidad proveniente de
Azure se mostrará mediante una vista de detalle; cualquier edición futura de asignaciones usará una
operación propia de Información y no la persistencia del recorrido de creación.

## Recorrido de creación

El recorrido de creación contiene nueve pasos:

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
`PASOS_CREACION_PROYECTO` agrega la vinculación de Azure al inicio sin duplicar el catálogo. Los
números pertenecen al orden de creación y no se almacenan en las secciones compartidas.

Los pasos posteriores a Azure tienen su propia ruta bajo
`/panel/proyectos/:proyectoId/creacion`. El borrador se crea antes de abrir Contexto para que el
avance pueda recuperarse desde cualquier sesión.

## Presentación del recorrido

`PaginaCreacionProyecto` funciona como shell de las rutas hijas y presenta una sola vez el
encabezado general, `RecorridoCreacionProyecto`, la tarjeta del paso y el `router-outlet` de su
contenido.

- La página proporciona el paso actual y las claves realmente completadas; el componente no
  deduce el avance por la posición.
- Los datos de cada ruta declaran únicamente `pasoActual`. Los pasos completados y navegables se
  derivan de `borrador.pasoActual` mediante `construirEstadoRecorridoCreacion`.
- `AVANCE_BORRADOR_POR_PASO` conserva explícita la relación entre los nueve pasos visuales y
  el avance del backend; Azure no consume un número de ese contrato.
- Volver a un paso anterior no reduce el avance ni obliga a guardar nuevamente los pasos
  intermedios. Todos los pasos ya alcanzados permanecen navegables, excepto Azure.
- `avancePasoCreacionProyectoGuard` redirige al último paso disponible cuando una URL intenta
  abrir una sección posterior al avance persistido. Si la carga falla, la página conserva la
  responsabilidad de presentar el estado reintentable.
- `reanudacionCreacionProyectoGuard` resuelve únicamente la ruta base
  `/panel/proyectos/:proyectoId/creacion` y la dirige al último paso alcanzado que ya tenga una
  página migrada. Las rutas hijas explícitas continúan bajo el guard de avance.
- El panel utiliza `crearUrlReanudacionProyecto` para abrir el mismo destino que la ruta base. La
  correspondencia entre `pasoActual` y URL no se replica en componentes ni guards.
- La posición visible agrega Azure al avance funcional del backend y el total siempre proviene de
  `PASOS_CREACION_PROYECTO.length`; no se escriben cantidades o porcentajes fijos en el panel.
- La tarjeta del paso obtiene icono, título y descripción desde `PASOS_CREACION_PROYECTO`, igual
  que el recorrido. Las páginas hijas no replican esa identidad.
- El encabezado y el footer del paso comparten una superficie tenue; el contenido conserva la
  superficie blanca de trabajo.
- El encabezado general describe el recorrido completo y no cambia para explicar un paso
  particular como la vinculación con Azure.
- La posición se presenta una sola vez junto a “Definición del proyecto” mediante “Paso 1 de 9”.
  La barra representa esa posición desde el primer paso; los indicadores de cada elemento
  comunican cuáles pasos están realmente completados.
- Cuando “Volver al inicio” es la única acción del encabezado general, utiliza la variante inversa
  blanca para conservar contraste sobre la superficie oscura.
- Los pasos completados y navegables son estados independientes. Azure puede estar completado sin
  permitir una modificación que invalide información posterior.
- `pasoSeleccionado` solicita la navegación, pero la página decide la ruta y cualquier
  persistencia o confirmación necesaria.
- El paso actual y los pendientes no generan navegación falsa.
- En escritorio el recorrido permanece vertical junto al formulario; en tamaños reducidos se
  convierte en una lista horizontal desplazable.
- Los iconos provienen del catálogo compartido y los estados actual, completado y pendiente se
  distinguen sin depender únicamente del color.
- La navegación utiliza “Azure DevOps” como etiqueta breve y “Vinculación de origen” como contexto;
  el paso conserva la explicación completa dentro de su contenido.
- El paso actual no repite “En curso”: `aria-current` y el tratamiento visual ya comunican su
  ubicación. La flecha aparece únicamente cuando el paso permite navegación.

La futura información del proyecto reutilizará `SECCIONES_PROYECTO` y sus modelos, pero tendrá una
navegación de consulta sin estados de progreso de creación. Si muestra la referencia de Azure, se
presentará como origen y trazabilidad del proyecto.
