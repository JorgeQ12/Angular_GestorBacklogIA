# Convenciones del frontend

Este documento es la puerta de entrada a las decisiones generales del frontend. Las reglas
específicas se mantienen en documentos separados para evitar un archivo único difícil de mantener.

## Documentos especializados

- [Autenticación mediante Kong y Microsoft](AUTENTICACION_KONG.md): popup, sesión, endpoints y
  responsabilidades.
- [Carga global](CARGA_GLOBAL.md): estado concurrente, interceptor HTTP y presentación única.
- [Formularios reactivos](FORMULARIOS_REACTIVOS.md): tipado, validación, mensajes y accesibilidad.
- [Estilos del frontend](ESTILOS_FRONTEND.md): tokens, tipografía, primitivas y CSS encapsulado.
- [Inicio único del panel](INICIO_PANEL.md): composición del resumen y evolución mediante permisos.
- [Integración con el backend](INTEGRACION_BACKEND.md): environments, DTO, mappers, servicios y
  errores.

## Organización principal

```text
src/app/
├── core/       # Configuración e infraestructura transversal
├── features/   # Capacidades funcionales organizadas por dominio
├── layouts/    # Shells compartidos por grupos de rutas
├── shared/     # Elementos reutilizables sin reglas de una feature
└── styles/     # Sistema visual global
```

- `core` contiene capacidades únicas de la aplicación, como navegación o autenticación global.
- `features` contiene páginas, componentes, modelos y configuración de cada capacidad funcional.
- `layouts` compone navegación persistente y el contenido de sus rutas hijas.
- `shared` contiene directivas, componentes y contratos reutilizables entre features.
- Una página compone el flujo; los componentes presentacionales emiten acciones sin conocer HTTP,
  sesión o navegación.
- Las páginas se cargan de forma diferida desde `app.routes.ts`.
- Las rutas reutilizables se centralizan en `core/navegacion/rutas.ts`.
- Los estados globales de carga se centralizan en `core/carga-global` y se montan una sola vez.

No se crean carpetas genéricas como `utils`, `helpers` o `models` para un único archivo sin una
necesidad real de crecimiento.

## Layouts y navegación

```text
layouts/panel/
├── components/
├── config/
├── models/
├── services/
└── panel-layout.*
```

- El catálogo declara opciones; no consulta la sesión.
- El servicio filtra el catálogo mediante permisos reactivos.
- La barra lateral solo representa los elementos recibidos.
- El layout administra el shell y contiene el `router-outlet`.
- Ocultar enlaces no reemplaza los guards de autorización de las rutas.
- No se crean roles ficticios durante una migración incremental.

## Angular y TypeScript

- Usar componentes y directivas standalone.
- Usar `ChangeDetectionStrategy.OnPush` en los componentes.
- Preferir señales para estado local y entradas o salidas modernas de Angular.
- Mantener contratos y formularios estrictamente tipados.
- Mantener HTTP, sesión y navegación fuera de los componentes presentacionales.
- Proteger las rutas mediante guards que devuelvan su resultado al router, sin navegar internamente.
- Centralizar constantes compartidas en el nivel más cercano que permita reutilizarlas.
- Evitar clases base cuando composición, directivas o servicios expresen mejor la responsabilidad.

## Fechas y configuración regional

- El locale de la aplicación se define una sola vez mediante `LOCALE_ID`.
- Las plantillas representan fechas con los pipes compartidos `fecha` y `tiempoRelativo`.
- Los formatos visuales se registran con nombres semánticos en `shared/fechas/config`.
- Los componentes no crean instancias de `Intl.DateTimeFormat` ni implementan métodos de formato.
- Las fechas sin hora en formato `YYYY-MM-DD` se interpretan como fechas calendario locales para
  evitar desplazamientos por zona horaria.

## Documentación del código

- Las clases, directivas y servicios exportados describen su responsabilidad.
- Los contratos públicos (`input`, `output`, modelos y constantes) describen su finalidad.
- Los métodos indican para qué existen dentro del flujo.
- Los comentarios son breves y no narran la implementación interna.
- Los callbacks, asignaciones y propiedades privadas evidentes no requieren comentarios.
- Los pendientes reales usan `TODO` e indican el punto de integración faltante.

Ejemplo:

```ts
/** Presenta el acceso y conecta la acción con el flujo de autenticación. */
export class PaginaInicioSesion {}

/** Coordina la ventana externa y continúa cuando regresa al aplicativo. */
protected iniciarSesionConMicrosoft(): void {}
```

## Documentación del CSS

- Documentar la finalidad de hojas globales, primitivas compartidas y bloques no evidentes.
- Documentar decisiones responsive, workarounds o relaciones de accesibilidad difíciles de inferir.
- No comentar cada selector ni narrar propiedades como `display`, `padding` o `color`.
- Los nombres BEM y los modificadores `ui-*` deben comunicar por sí mismos la estructura visual.
- Los tokens incluyen comentarios cuando representan una decisión del sistema de diseño.

## Verificación mínima

Antes de cerrar una migración o refactorización:

```powershell
npm run build
npm test -- --watch=false
git diff --check
```

Las verificaciones adicionales de formularios y estilos se describen en sus documentos
especializados.
