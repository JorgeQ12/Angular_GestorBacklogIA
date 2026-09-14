# Administración de usuarios

La capacidad administra la información local mínima de las personas que participa en la asignación
de perfiles técnicos y en el control futuro de consumo del asistente. No administra autenticación,
roles ni permisos; esas responsabilidades pertenecen a Entra ID, Kong y Keycloak.

## Navegación y composición

La URL canónica es `/panel/configuracion/usuarios` y se presenta como una opción independiente en la
navegación del panel. La ruta carga `PaginaUsuarios` de forma diferida.

Una carga correcta presenta:

- encabezado de Configuración con la acción Crear usuario;
- tarjeta con total, búsqueda por nombre, correo, identidad Azure o perfil;
- tabla responsiva con identidad, perfil técnico, límite mensual, estado y fecha de actualización;
- estado vacío diferenciado para una colección sin registros y para una búsqueda sin resultados.

Si falla la consulta de usuarios o perfiles, el error reemplaza toda la composición y permite
reintentar. No conserva el encabezado ni abre simultáneamente un modal de error. Si no existen
perfiles técnicos activos, el listado permanece disponible y la creación se bloquea con una
explicación visible.

## Contrato del backend

La capacidad consume el grupo `/api/Usuario`:

| Operación | Método | Contrato |
| --- | --- | --- |
| `ObtenerUsuarios` | GET | Envía `IncluirInactivos=true`. |
| `CrearUsuario` | POST | Envía identidad Azure, datos personales, perfil, límite y estado activo. |
| `ActualizarUsuario` | PUT | Envía ID local, datos editables, perfil, límite y estado; no envía `IdAzure`. |
| `InactivarUsuario` | PATCH | Envía `Id` como query param y cuerpo nulo. |

`IdAzure` identifica el cruce con Azure DevOps, es obligatorio al crear y no se modifica durante la
edición. Nombre y correo admiten hasta 200 y 320 caracteres. El perfil técnico es obligatorio y
procede del catálogo activo `identidad_perfil_tecnico`.

`limiteTokensMensual` acepta un entero mayor o igual que cero. `null` significa que no existe un
límite individual configurado; cero es un valor explícito y no se transforma en ausencia de límite.
La interfaz configura el límite, pero no calcula ni presenta consumo porque el backend actual no
expone todavía esa medición.

## Estado y mutaciones

La página conserva una fotografía confirmada por el backend. Crear, editar, activar o inactivar
reemplaza un registro local solamente después de una respuesta exitosa. Un fallo mantiene abierto
el editor y conserva los valores ingresados.

El formulario completo se deshabilita durante el guardado y cada función vuelve a comprobar el
bloqueo para impedir envíos duplicados por clic, teclado o llamadas programáticas. Inactivar exige
confirmación y realiza una baja lógica; activar reutiliza `ActualizarUsuario` con la fotografía
vigente. Las solicitudes se cancelan cuando se destruye la página y una confirmación pendiente no
ejecuta cambios después de abandonar la ruta.

## Límites de responsabilidad

- No se crean roles, permisos, credenciales ni claves de autenticación.
- El frontend no actualiza automáticamente el perfil global al guardar el paso Equipo.
- Equipo puede crear una persona inexistente mediante su caso de uso de proyecto, pero la
  administración posterior ocurre exclusivamente en esta capacidad.
- La interfaz no elimina usuarios ni referencias históricas.

## Verificación

Las pruebas cubren mapeo, los cuatro endpoints consumidos, identidad inmutable, nulabilidad, formulario válido
e inválido, límites enteros, bloqueo remoto, búsqueda, estados vacíos, error y reintento,
conservación ante fallos, confirmación de inactivación y cancelación al destruir la página.

Una verificación completa ejecuta:

```powershell
npm run verify
npm audit
git diff --check
```
