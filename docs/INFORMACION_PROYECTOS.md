# Información y versiones de proyectos

La consulta de un proyecto vive en `/panel/proyectos/:proyectoId/informacion`. Es un caso de uso
hermano de Creación dentro del dominio `features/proyectos`.

## Composición y navegación

`PaginaInformacionProyecto` es la única página enrutada. Conserva montados el encabezado y el
selector global de versión; un `@switch` reemplaza únicamente el paso activo. No existen páginas
ni rutas hijas por paso.

El encabezado presenta Responsable, Prioridad y Fecha objetivo desde la fotografía
`proyectoPresentado`. No duplica esos valores en estado local: al guardar Contexto o cambiar de
versión, los metadatos se rehidratan con la misma información que alimenta el formulario.

- `?paso=<clave>` identifica el paso consultado. Azure es la entrada predeterminada y se omite de
  la URL.
- `?version=<id>` identifica una versión histórica. La versión actual se omite de la URL.
- Cambiar de paso no vuelve a consultar el proyecto.
- Cambiar de versión recupera una sola fotografía histórica y la aplica a todas las secciones.
- La ruta deriva `proyectoId` desde `paramMap`; no captura parámetros mediante `snapshot`.

## Recorrido y pasos compartidos

Creación e Información utilizan `RecorridoProyecto`, `TarjetaPasoProyecto` y los nueve componentes
de `proyectos/components/pasos`. Las páginas no mantienen navegaciones, encabezados, footers ni
adaptadores visuales paralelos.

- `PASOS_PROYECTO` es el catálogo único de Azure y las ocho secciones funcionales.
- Información habilita navegación directa entre todos los pasos y no representa avance ni estados
  completados.
- Creación proporciona al mismo recorrido únicamente los pasos alcanzados por el borrador.
- Cada paso compartido compone su tarjeta y su formulario. La tarjeta es el único componente que
  presenta `AccionesPasoProyecto` y asocia el botón principal mediante `id`/`form`.
- La página conserva la ruta, el descarte de cambios y la persistencia; los pasos no conocen HTTP,
  versiones, borradores ni navegación.

## Selector de versión

El selector se presenta una sola vez debajo del encabezado de página. No forma parte del encabezado
de Azure, Contexto, Objetivos, Equipo ni de ningún otro paso, porque una versión representa una
fotografía integral del agregado Proyecto.

- La versión actual permite editar las ocho secciones funcionales.
- Las versiones históricas muestran todas las secciones en lectura.
- Azure es una referencia inmutable del proyecto y no cambia al seleccionar otra versión.
- Cambiar de paso o versión mientras existe una edición solicita confirmar el descarte.

## Reutilización de formularios

Los modelos, validaciones, serializadores y formularios de las secciones viven en
`proyectos/secciones`. Los pasos compartidos los presentan en el modo recibido por la página.

- Información utiliza `ModoFormularioProyecto.Lectura` al consultar.
- Al editar la versión actual utiliza `ModoFormularioProyecto.Edicion` y ejecuta
  `ActualizarProyecto`.
- Lectura no usa `form.disable()`: los campos nativos son `readonly`, los controles compuestos
  exponen `aria-readonly` y bloquean cambios sin atenuar el contenido.
- En lectura se retiran contadores, validación visual y acciones de agregar, eliminar, seleccionar
  o asignar.
- Cancelar vuelve a hidratar la fotografía confirmada antes de presentar lectura.
- No existen componentes `detalle-*`, pasos de Información ni adaptadores por sección paralelos.
- `ActualizacionSeccionProyecto` relaciona de forma discriminada la sección con su modelo.

## Azure

`PasoVinculacionAzureProyecto` pertenece al catálogo común de pasos, aunque Azure no sea una
sección versionada.

- En Creación presenta captura, validación y confirmación.
- En Información presenta la asociación confirmada mediante el mismo componente en lectura.
- No existe un `ResumenVinculacionAzure` separado.
- Información no permite cambiar proyecto, épica ni Team.
- La asociación permanece estable al consultar versiones históricas.

## Concurrencia y creación de versiones

`ObtenerProyecto` entrega `versionActualId`. `ActualizarProyecto` exige
`versionActualIdEsperada`; si otra sesión creó una versión antes del guardado, el backend responde
conflicto y no sobrescribe la versión nueva. El notificador transversal prioriza el mensaje
funcional retornado por el API.

Una actualización correcta crea una versión completa, actualiza la fotografía vigente, recarga el
historial y vuelve a lectura. No se ofrecen acciones de edición sobre versiones históricas.

## Estructura

```text
features/proyectos/
├── components/
│   ├── acciones-paso-proyecto/
│   ├── recorrido-proyecto/
│   ├── tarjeta-paso-proyecto/
│   └── pasos/
│       ├── paso-vinculacion-azure-proyecto/
│       └── paso-[seccion]-proyecto/
├── config/
│   ├── pasos-proyecto.config.ts
│   └── secciones-proyecto.config.ts
├── models/
├── mappers/
├── secciones/
├── creacion/
├── listado/
└── informacion/
    ├── components/selector-version-proyecto/
    ├── config/
    ├── mappers/
    ├── models/
    ├── pages/pagina-informacion-proyecto/
    └── services/
```
