# Autenticación mediante Kong y Microsoft

Este documento registra el flujo de acceso corporativo vigente y la separación de
responsabilidades entre la aplicación Angular, Kong y Microsoft.

## Flujo establecido

```text
Página de inicio de sesión
  → abre una ventana con Kong /login
  → Kong coordina Keycloak y Microsoft
  → la ventana externa regresa al origen de Angular
  → la ventana principal navega a /panel
  → sesionGuard consulta Kong /me con el loader global activo
  → activa PanelLayout o redirige al inicio de sesión
```

La vuelta de la ventana externa al origen de Angular indica únicamente que terminó la navegación
de autenticación. No confirma por sí sola que exista una sesión válida. La confirmación pertenece
a `/me` y ocurre antes de activar la ruta del panel.

## Endpoints

Los endpoints se construyen desde la URL de Kong definida en `src/environments/environment.ts`:

```text
/automatizacion/api/v1/login
/automatizacion/api/v1/me
/automatizacion/api/v1/logout
```

- `/login` inicia la navegación externa.
- `/me` confirma la sesión mediante el header `X-User-Name`; el body no forma parte del contrato.
- `/logout` finaliza la sesión mediante una navegación controlada por Kong.

La aplicación no administra contraseñas, códigos OAuth ni tokens de Microsoft. La cookie se envía
con `withCredentials` y no debe copiarse a `localStorage` o `sessionStorage`.

## Responsabilidades

```text
src/app/core/autenticacion/
├── config/         # Endpoints y constantes del flujo
├── guards/         # Acceso a rutas que requieren una sesión confirmada
├── interceptors/   # Credenciales limitadas al origen de Kong
├── models/         # Contratos de sesión
└── services/       # Ventana externa, /me y logout
```

- `AccesoMicrosoft` presenta el botón y emite la acción; no inyecta HTTP, sesión ni navegación.
- `PaginaInicioSesion` conecta la acción con `AutenticacionService` y navega al panel cuando el
  observable confirma el retorno del popup.
- `AutenticacionService` abre la ventana, detecta el retorno al mismo origen y consulta los
  endpoints de Kong.
- `sesionGuard` consulta `/me`, permite activar el panel o devuelve la redirección al inicio.
- `PanelLayout` compone únicamente el shell de las rutas previamente autorizadas.
- `credencialesKongInterceptor` agrega `withCredentials` únicamente a URLs del origen configurado
  para Kong.
- `cargaGlobalInterceptor` presenta el loader mientras `/me` y las demás solicitudes HTTP están
  pendientes.

## Comportamiento del popup

El popup debe abrirse directamente como consecuencia del clic para evitar el bloqueo automático
del navegador. Mientras navega por dominios externos, Angular no intenta leer su contenido. Solo
comprueba cuándo vuelve al mismo origen.

Cuando la ventana se cierra antes de que Angular pueda observar el retorno, el servicio consulta
`/me` una vez. Esto diferencia un cierre automático posterior a la autenticación de una cancelación
manual: solo una sesión confirmada emite la continuación. Si el navegador impide crear el popup, se
utiliza una redirección completa como respaldo.

No se consulta `/me` periódicamente mientras el popup está abierto. Tampoco se introduce una ruta
ficticia como `/home` para completar el flujo.

## Entrada al panel

La ruta `/panel` utiliza `sesionGuard` antes de activar el layout. Durante la consulta, el loader
global representa el estado accesible de la operación:

- Sesión ya confirmada: permite el acceso sin repetir `/me`.
- Respuesta con `X-User-Name`: activa la navegación y el contenido del panel, incluso si el status
  HTTP es `404`.
- Respuesta sin `X-User-Name`: devuelve un `UrlTree` hacia el inicio de sesión.

El guard devuelve el resultado al router y no ejecuta una navegación imperativa. Los endpoints de
negocio siguen siendo responsables de aplicar su propia autorización.

## Configuración por entorno

Para desarrollo, Kong permite el origen `http://localhost:4200`. Antes de desplegar otro entorno
se deben coordinar conjuntamente:

- URL pública del frontend a la que Kong regresa después del acceso.
- Origen permitido por CORS.
- URL de Kong correspondiente al entorno.
- Política de cookies y exposición de los headers requeridos.

La aplicación y Kong deben utilizar exactamente el mismo origen de retorno; cambiar de puerto,
protocolo o nombre de host requiere actualizar la configuración externa.

## Verificación mínima

Las pruebas deben comprobar:

- El popup no finaliza mientras permanece en `about:blank` u otro origen.
- El retorno al origen emite una única confirmación y produce la navegación al panel.
- Cerrar el popup consulta `/me`: emite si Kong confirma sesión y finaliza sin emitir si fue una
  cancelación.
- El interceptor no modifica solicitudes a terceros.
- El guard reutiliza una sesión ya confirmada sin repetir `/me`.
- El loader permanece visible durante la consulta inicial de `/me`.
- Un `404` con `X-User-Name` emite la sesión mediante `next`.
- Una respuesta sin `X-User-Name` produce un `UrlTree` hacia el inicio de sesión.

Antes de finalizar cambios del flujo:

```powershell
npm run build
npm test -- --watch=false
git diff --check
```
