# Carga global

Este documento define cómo representar operaciones HTTP que bloquean temporalmente la interfaz.

## Organización

```text
src/app/core/carga-global/
├── components/cargador-global/   # Overlay único de la aplicación
├── interceptors/                  # Integración automática con HttpClient
└── services/                      # Estado concurrente de las operaciones
```

La carga global pertenece a `core` porque es una capacidad transversal, se monta una sola vez y
participa en la infraestructura HTTP. No se replica dentro de páginas, layouts o features.

## Funcionamiento

`CargaGlobalService` mantiene un contador de operaciones pendientes. El cargador permanece visible
hasta que todas hayan finalizado, aunque existan varias solicitudes concurrentes.

`cargaGlobalInterceptor` registra cada solicitud de `HttpClient` y garantiza su finalización con
`finalize`, tanto en respuestas correctas como en errores. Los componentes que ejecutan solicitudes
HTTP ordinarias no deben activar ni ocultar manualmente el cargador.

El componente se monta una sola vez en `app.html`, antes del `router-outlet`:

```html
<app-cargador-global />
<router-outlet />
```

## Presentación

El overlay contiene únicamente el camión, su humo y un estado breve. El camión entra, se detiene en
el centro y continúa su recorrido. Sus estilos consumen los tokens del sistema visual y contemplan
`prefers-reduced-motion`.

La presentación utiliza `public/brand/camion_carga.webp`, optimizado para el tamaño real del
componente. No debe utilizarse el SVG original con el PNG de alta resolución incrustado.

El texto fijo pertenece al HTML del componente. Los resultados de un flujo no deben representarse
mediante mensajes construidos en páginas o servicios TypeScript; cuando se requiera comunicar un
error al usuario se utilizará el mecanismo global de notificaciones.

## Autenticación

El loader no se muestra mientras el usuario interactúa con el popup de Microsoft. Después del
retorno, la aplicación solicita navegar al panel y `sesionGuard` valida la sesión mediante `/me`;
esa solicitud de `HttpClient` activa automáticamente el loader.

Mientras `/me` continúa pendiente, `PanelLayout` todavía no ha sido activado. Una respuesta válida
permite presentar el contenido y un rechazo redirige al inicio de sesión.

## Verificación mínima

- El contador conserva el loader ante solicitudes concurrentes.
- Una respuesta correcta y un error liberan la operación correspondiente.
- El componente no presenta el overlay cuando no existen operaciones pendientes.
- La animación se desactiva cuando el usuario prefiere movimiento reducido.
