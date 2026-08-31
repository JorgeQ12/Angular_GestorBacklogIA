# Listado de proyectos

Este documento registra la consulta del portafolio y sus límites respecto a Creación e Información
del proyecto.

## Punto de entrada

El listado vive en `/panel/proyectos`. Es el destino de la navegación principal y de los accesos
desde Inicio. La creación permanece en `/panel/proyectos/creacion`; abrir el listado no monta el
recorrido ni presenta la vinculación de Azure dentro de un modal.

Los filtros y la página se conservan como query params para admitir recarga, enlaces y navegación
del navegador:

```text
/panel/proyectos?estado=Activo&nombre=portal&responsable=maria&pagina=2
```

La página deriva la consulta desde `queryParamMap`. No captura los parámetros mediante `snapshot`:
si Angular reutiliza el componente, el estado y la solicitud deben corresponder a la URL vigente.
Cambiar un filtro reinicia la página a uno; cambiar solo la página conserva los filtros.

## Organización

```text
features/proyectos/
├── models/                         # Contratos compartidos por casos de uso de Proyectos
├── listado/
│   ├── components/
│   │   ├── filtros-listado-proyectos/
│   │   └── tabla-proyectos/
│   ├── config/
│   ├── mappers/
│   ├── models/
│   ├── pages/
│   │   └── pagina-listado-proyectos/
│   └── services/
├── creacion/
└── secciones/
```

- `PaginaListadoProyectos` compone filtros, resultados y navegación.
- `FormularioFiltrosListadoProyectos` administra un formulario reactivo tipado, aplica una espera
  breve a la búsqueda y emite una fotografía completa de los criterios.
- `filtros-listado-proyectos.mapper` centraliza la normalización y comparación de filtros para que
  la página, el formulario y la hidratación desde URL compartan una sola regla.
- `TablaProyectos` representa filas, acciones y paginación; no conoce HTTP ni Router.
- `ListadoProyectosService` ejecuta `ObtenerProyectos`, valida `ResultadoApi` y adapta el DTO.
- `EstadoListadoProyectosService` conserva únicamente el estado de la ruta, cancela consultas
  anteriores y diferencia error, vacío y datos disponibles.

El estado se proporciona en la ruta base del listado y no como un facade global. Así no se filtran
criterios o resultados entre Inicio, Creación y visitas posteriores al portafolio.

## Contratos y estado

El sobre paginado del backend vive en `core/http/models/paginado.dto.ts`, junto a `ResultadoApi`,
porque representa infraestructura de transporte y no una regla de Proyectos. El DTO del registro,
la consulta y el modelo presentado permanecen dentro de `proyectos/listado`.

Los estados aceptados por el filtro se identifican mediante `EstadoCatalogoProyecto`. El enum vive
en el dominio `proyectos/models` y se exporta desde `proyectos/public-api.ts` porque Inicio también
lo utiliza. El texto mostrado por una fila continúa siendo el valor entregado por el catálogo
remoto; no se fuerza a un enum cerrado para representar datos externos.

El filtro de estado traduce su identidad al valor numérico exigido por `ObtenerProyectos` solamente
en el límite HTTP. Los componentes y query params usan el nombre legible del enum.

## Presentación

La página utiliza `EncabezadoPagina` para la identidad y presenta “Nuevo proyecto” como acción
principal. El botón navega directamente a Creación. El encabezado no repite la cantidad de
resultados porque el listado ya comunica su contenido y paginación.

Filtros, resultados, estado vacío y paginación pertenecen a una sola `ui-card`:

- La búsqueda utiliza un único `CampoBusqueda`, ocupa el espacio disponible y se aplica desde tres
  caracteres. Borrar o acortar el texto retira automáticamente el criterio.
- Estado reutiliza `SelectorCampo` e incluye “Todos los estados” para retirar el criterio sin una
  acción adicional.
- Las fechas se representan mediante `FechaPipe`.
- Los iconos se obtienen exclusivamente mediante `app-icono`.
- La tabla conserva semántica nativa, encabezados con alcance de columna y nombres accesibles en
  acciones de fila.
- En pantallas reducidas los filtros se apilan y la región tabular permite desplazamiento
  horizontal sin cambiar el orden de lectura.

No se migra una tabla genérica mientras exista un solo consumidor. Su estructura, paginación y
celdas permanecen específicas del listado; una extracción futura requerirá otro uso real con el
mismo contrato estable.

El loader global representa la solicitud. Una consulta fallida presenta `EstadoError` reintentable
y no se convierte en una colección vacía. Una respuesta exitosa sin registros presenta
`EstadoVacio` y permite corregir los criterios o iniciar un proyecto.

El contrato remoto vigente todavía recibe `nombre` y `responsable` como filtros independientes y
los combina mediante `AND`. Por eso el control unificado se adapta temporalmente a `nombre`; no se
envía el mismo texto a ambos parámetros porque produciría resultados incorrectos. Cuando el backend
exponga una búsqueda transversal, el cambio quedará contenido en el adaptador HTTP y no requerirá
volver a dividir la interfaz.

## Acciones por proyecto

- Un borrador presenta “Continuar”, muestra su avance mediante el contrato público de Creación y
  abre `crearUrlCreacionProyecto(id)`.
- Un proyecto confirmado podrá presentar “Abrir” cuando exista la ruta real de Información.
- El listado no incluye edición en modal. Actualizar datos generales y crear una versión pertenece
  al caso de uso Información, que debe recuperar la fotografía completa y aplicar sus propias
  reglas de concurrencia.
- No se crean rutas, botones habilitados ni componentes vacíos para Información antes de migrarla.

## Integración con Inicio y navegación

“Ver proyectos” abre la ruta base. Seleccionar un estado en Inicio agrega únicamente el query param
`estado`; el listado valida el valor y descarta cualquier parámetro que no pertenezca al enum. La
barra lateral utiliza la misma URL canónica y no conserva otra definición de la ruta.

Inicio consume `EstadoCatalogoProyecto` desde el `public-api` de Proyectos. No importa mappers,
configuraciones ni servicios internos del listado.

## Pruebas

La capacidad verifica:

1. Mapeo del paginado, valores nulos y avance de borradores.
2. URL, parámetros, estados y errores funcionales del servicio HTTP.
3. Cancelación, reintento y descarte de respuestas antiguas en el estado de ruta.
4. Hidratación, espera de búsqueda, retiro automático y emisión tipada de filtros.
5. Semántica, acciones y paginación observable de la tabla.
6. Reacción de la página a query params y navegación hacia Creación.
7. Integración desde Inicio y configuración de rutas.

La verificación de la migración ejecuta build, suite completa, formato y `git diff --check`.
