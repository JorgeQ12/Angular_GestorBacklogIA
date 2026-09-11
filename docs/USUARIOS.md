# Administración de usuarios

Este documento registra el alcance del frontend para administrar la información local mínima de
las personas. Debe consultarse junto con las
[convenciones generales](CONVENCIONES_FRONTEND.md), la
[integración con el backend](INTEGRACION_BACKEND.md), los
[formularios reactivos](FORMULARIOS_REACTIVOS.md) y el
[sistema visual](ESTILOS_FRONTEND.md).

## Alcance

La ruta canónica es `/panel/configuracion/usuarios` y también se conserva el acceso directo
`/panel/usuarios` mediante redirección. La opción `Usuarios` forma parte del catálogo principal del
panel sin permisos ficticios; Entra ID, Kong y Keycloak serán responsables de autorización cuando
esa integración exista.

La aplicación administra únicamente:

- identidad estable de Azure;
- nombre y correo;
- perfil técnico reutilizable entre proyectos;
- límite mensual de tokens;
- estado activo o inactivo.

No administra roles de autorización. El cargo o dedicación asignados dentro de un proyecto siguen
siendo información del paso Equipo y no sustituyen las decisiones de Identidad.

## Contratos HTTP

Los endpoints se centralizan en `features/usuarios/config/endpoints-usuarios.config.ts`.

| Operación | Método | Endpoint | Decisión |
| --- | --- | --- | --- |
| Listar | `GET` | `/Usuario/ObtenerUsuarios` | Envía `IncluirInactivos=true`. |
| Crear | `POST` | `/Usuario/CrearUsuario` | Envía identidad Azure y crea activo por defecto. |
| Actualizar | `PUT` | `/Usuario/ActualizarUsuario` | No envía ni modifica la identidad Azure. |
| Inactivar | `PATCH` | `/Usuario/InactivarUsuario` | Envía `Id` como parámetro y cuerpo nulo. |

La reactivación usa `ActualizarUsuario` con `Activo=true`, ya que el backend no expone un endpoint
separado. Si un registro no tiene perfil técnico vigente, la página abre su editor antes de
permitir la activación.

El DTO conserva la nulabilidad y la auditoría entregadas por el API. El mapper crea un modelo de
interfaz y el servicio exige un `ResultadoApi` exitoso antes de devolver datos a la página.

## Perfiles técnicos

Los perfiles se solicitan a `CatalogosService` con el código estable
`identidad_perfil_tecnico`. El formulario trabaja con el ID y presenta nombre y descripción; nunca
quema IDs provenientes de las semillas.

Solo se ofrecen opciones activas. Si el perfil de un usuario dejó de estar disponible, el editor
no lo conserva como selección válida y exige escoger un perfil activo antes de guardar.

## Formulario

`EditorUsuario` es presentacional, usa Reactive Forms tipados y emite únicamente `DatosUsuario`.
La página decide si crea o actualiza.

- La identidad Azure y el nombre son obligatorios y admiten 200 caracteres.
- El correo es opcional, valida su formato y admite 320 caracteres.
- El perfil técnico es obligatorio.
- El límite mensual es opcional y admite únicamente enteros mayores o iguales a cero.
- Un límite vacío usa la política general; `0` representa bloqueo de consumo.
- Los textos se recortan antes de validar y enviar.
- La identidad Azure queda en solo lectura al editar y el servicio no la incluye en el `PUT`.
- Durante una mutación se deshabilita el formulario completo y no se permite cancelar ni repetir
  el envío.

## Estados de la página

La carga inicial reúne usuarios y perfiles mediante `forkJoin` para construir una fotografía
coherente.

- El interceptor global presenta el indicador de carga; la página no duplica un spinner.
- Un fallo inicial reemplaza encabezado y contenido con `EstadoError` de página completa y acción
  de reintento. No abre un modal de error.
- Una colección vacía usa `EstadoVacio` y mantiene disponible la creación.
- La búsqueda local contempla nombre, correo, identidad Azure, código y nombre del perfil; ignora
  mayúsculas y tildes.
- Los fallos de crear, editar, activar o inactivar usan `NotificadorErroresApiService`, porque son
  errores de una acción y la página ya contiene información útil.
- La inactivación pide confirmación y conserva el historial; la activación no necesita
  confirmación destructiva.
- Cada respuesta exitosa reemplaza el registro local por ID, mantiene el orden alfabético y evita
  recargar toda la colección.

## Presentación y accesibilidad

La página reutiliza `EncabezadoPagina`, `CampoBusqueda`, `TablaUsuarios`, `IndicadorEstado`,
`EstadoVacio`, `EstadoError`, `Modal`, `SelectorCampo` e `IconoComponent`. La tabla tiene
encabezados semánticos, acciones con nombre accesible y desplazamiento horizontal/vertical cuando
el espacio es insuficiente.

En tamaños reducidos, el encabezado y las herramientas se apilan; la tabla conserva sus columnas
mediante desplazamiento en lugar de ocultar datos administrativos.

## Pruebas de regresión

La cobertura de la capacidad verifica:

- ruta canónica, redirección y opción de navegación;
- mapeo completo del DTO;
- método, URL, parámetros y cuerpo de cada operación HTTP;
- ausencia de `idAzure` en la actualización;
- validaciones, normalización, hidratación y bloqueo del editor;
- carga coordinada, error de página completa, reintento y estados vacíos;
- búsqueda insensible a tildes;
- prevención de doble envío y conservación del editor ante error;
- confirmación de inactivación, reactivación y perfil faltante.
