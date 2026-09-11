# Administración de catálogos

Este documento define la administración de tipos y opciones que alimentan formularios y procesos.
Complementa las [convenciones generales](CONVENCIONES_FRONTEND.md), la
[integración con el backend](INTEGRACION_BACKEND.md), el estándar de
[formularios reactivos](FORMULARIOS_REACTIVOS.md) y el [sistema visual](ESTILOS_FRONTEND.md).

## Entrada y alcance

La ruta canónica es `/panel/configuracion/catalogos`. Se carga de forma diferida como hija del panel
protegido por sesión y aparece en su navegación principal. `/panel/catalogos` redirige a la ruta
canónica para conservar el acceso directo introducido durante la migración.

La página permite seleccionar y consultar catálogos, buscar sus opciones, crear y editar tipos y
opciones, y activar o inactivar cada entidad. El recorrido presenta directamente catálogos activos e
inactivos para permitir su administración sin un filtro adicional. No crea roles ni permisos locales
mientras el contrato de sesión no los exponga. El backend sigue autorizando cada operación y
validando qué catálogos pueden inactivarse.

## Responsabilidades

```text
environment
  → endpoints de administración
  → AdministracionCatalogosService
  → ResultadoApi y DTO
  → mapper y modelos de interfaz
  → PaginaCatalogos
  → EditorCatalogo
```

- `PaginaCatalogos` conserva la fotografía confirmada, coordina consultas, mensajes y mutaciones.
- `EditorCatalogo` es presentacional: mantiene el formulario tipado y emite nombre y descripción.
- `AdministracionCatalogosService` encapsula las ocho operaciones HTTP y exige datos funcionales.
- `core/catalogos` conserva la consulta transversal de opciones activas para otras features. La
  administración reutiliza su endpoint y DTO de valores; no crea otra fuente para ese contrato.
- La consulta transversal no mantiene caché, de modo que solicitudes posteriores recuperan los
  cambios confirmados sin acoplar Catálogos a servicios de Proyectos.

## Contratos y operaciones

Todas las operaciones viven bajo `${environment.apiBaseUrl}/Catalogo`.

| Operación                 | Método | Entrada                                       |
| ------------------------- | ------ | --------------------------------------------- |
| `ObtenerCatalogosTipo`    | GET    | `IncluirInactivos=true`                       |
| `ObtenerCatalogosValor`   | GET    | `IncluirInactivos=true`                       |
| `CrearCatalogoTipo`       | POST   | nombre, descripción y activo                  |
| `ActualizarCatalogoTipo`  | PUT    | ID, nombre, descripción y activo              |
| `InactivarCatalogoTipo`   | PATCH  | `Id` como query param y cuerpo nulo           |
| `CrearCatalogoValor`      | POST   | ID del tipo, nombre, descripción y activo     |
| `ActualizarCatalogoValor` | PUT    | ID, ID del tipo, nombre, descripción y activo |
| `InactivarCatalogoValor`  | PATCH  | `Id` como query param y cuerpo nulo           |

El DTO de valores refleja el contrato vigente, incluidos los códigos técnicos asignados por el
backend. La consulta transversal solicita opciones mediante `CatalogoTipoCodigo` y mantiene sus
códigos centralizados; nunca los deriva del nombre ni utiliza IDs de semillas. Nombre y descripción
son obligatorios y admiten 100 y 500 caracteres respectivamente. El estado activo no aparece en el
formulario: se conserva al editar y se modifica mediante su acción independiente.

## Estado y errores

La carga HTTP ordinaria utiliza el cargador global. Mientras una consulta o mutación está pendiente,
la página bloquea todos los caminos de activación y el editor deshabilita el `FormGroup`. La función
de envío también comprueba el bloqueo para cubrir clic, submit y teclado.

Una consulta fallida reemplaza toda la composición por `EstadoError` con reintento: no conserva el
encabezado ni se convierte en un estado vacío, ocupa la altura disponible del contenido del panel y
no abre simultáneamente un mensaje modal.
Un guardado fallido mantiene abierto el editor y conserva sus valores. La página solo reemplaza la
fotografía local después de una respuesta exitosa. Las suscripciones se cancelan al destruir la
página y una confirmación pendiente no ejecuta la operación después de abandonar la ruta.

Las inactivaciones solicitan confirmación. Los errores de guardado e inactivación se comunican con
`NotificadorErroresApiService`; la página no interpreta `HttpErrorResponse`. Las restricciones de
catálogos base, opciones activas y demás reglas de integridad permanecen en el backend, sin IDs de
semillas ni nombres reservados duplicados en Angular.

## Presentación y accesibilidad

La página reutiliza `EncabezadoPagina`, `Modal`, `EstadoVacio`, `EstadoError`, `app-icono`,
`ui-button` y `ui-card`. Debajo del encabezado presenta dos tarjetas
hermanas, siguiendo la composición del flujo de creación. Cada tarjeta utiliza `ui-card__header`,
`ui-card__heading` y `ui-card__icon` para mantener la misma jerarquía visual. El encabezado derecho
integra la identidad y las acciones de edición, cambio de estado y creación de opciones. Todas las
acciones combinan icono y texto; crear opción mantiene la jerarquía principal. El detalle no presenta
un pie de acciones. La tarjeta izquierda adopta la selección del recorrido de Creación mediante
superficie blanca, borde, sombra, barra lateral e icono oscuro. Su encabezado orienta la selección con
un texto auxiliar discreto y muestra el total disponible; cada elemento presenta su nombre y resume
cuántas opciones activas contiene, sin repetir la descripción. Su pie contiene la creación de catálogo
y la carga de información ocurre al entrar en la página.

El estado activo no utiliza el verde reservado para la validación del flujo de Creación.
`IndicadorEstado` lo presenta de forma discreta y reserva la etiqueta de advertencia para entidades
inactivas. Las acciones repetidas de las opciones se presentan como botones secundarios delimitados,
con iconos y nombres accesibles.
Los cuerpos quedan dedicados a sus respectivos listados y la interfaz no presenta conteos
redundantes.

El editor acompaña el título con una descripción específica para la creación o edición vigente y
utiliza un icono de agregar o editar según el contexto.

Las opciones se presentan mediante la primitiva `ui-table`, con las columnas Título, Descripción,
Estado y Acciones. El encabezado permanece visible durante el desplazamiento y cada fila conserva
las acciones de icono con sus nombres accesibles. La tabla utiliza distribución fija y truncamiento
para adaptarse sin imponer un ancho mínimo ni desplazamiento horizontal. Sus filas ocupan todo el
ancho del cuerpo, sin padding exterior. Ambas colecciones muestran hasta siete registros y habilitan
desplazamiento vertical interno a partir del octavo. El recorrido separa sus elementos con el mismo
ritmo espacial utilizado durante la Creación y replica la altura, padding, iconos, tipografía,
dirección y movimiento de sus elementos. La selección utiliza colores neutrales y omite la
confirmación verde propia de los pasos validados.

El CSS de la feature contiene únicamente esa distribución maestro-detalle, la separación entre
tarjetas y la adaptación a una columna desde 1024 px. Colores, tipografía, controles, foco y
superficies proceden del sistema visual.

Los botones declaran su tipo, la búsqueda tiene una etiqueta accesible, la selección comunica
`aria-current` y las acciones sobre opciones incluyen nombres específicos. El modal compartido
gestiona Escape, confinamiento y restauración del foco. La interfaz identifica expresamente las
entidades inactivas mediante texto, además del tratamiento visual.

## Verificación

Las pruebas cubren mapeo, las ocho operaciones HTTP, errores funcionales, límites del formulario,
envío válido e inválido, bloqueo remoto, búsqueda de opciones, presentación de ambos estados, error y
reintento, conservación de la edición ante fallos, cancelación al destruir la página, ruta diferida y
navegación canónica.

Una migración completa ejecuta:

```powershell
npm run build
npx ng build --configuration development
npm test -- --watch=false
git diff --check
```
