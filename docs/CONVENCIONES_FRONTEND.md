# Convenciones del frontend

Este documento es la puerta de entrada a las decisiones generales del frontend. Las reglas
específicas se mantienen en documentos separados para evitar un archivo único difícil de mantener.

## Documentos especializados

- [Asistente IA conversacional](ASISTENTE_IA.md): alcance por proyecto, propuestas, persistencia y
  límites entre IA y Proyectos.
- [Autenticación mediante Kong y Microsoft](AUTENTICACION_KONG.md): popup, sesión, endpoints y
  responsabilidades.
- [Carga global](CARGA_GLOBAL.md): estado concurrente, interceptor HTTP y presentación única.
- [Creación de proyectos](CREACION_PROYECTOS.md): vinculación con Azure, borrador y recorrido de
  especificación.
- [Formularios reactivos](FORMULARIOS_REACTIVOS.md): tipado, validación, mensajes y accesibilidad.
- [Estilos del frontend](ESTILOS_FRONTEND.md): tokens, tipografía, primitivas y CSS encapsulado.
- [Inicio único del panel](INICIO_PANEL.md): composición del resumen y evolución mediante permisos.
- [Información y versiones de proyectos](INFORMACION_PROYECTOS.md): consulta integral, pasos,
  modos de formulario y versionamiento.
- [Integración con el backend](INTEGRACION_BACKEND.md): environments, DTO, mappers, servicios y
  errores.
- [Listado de proyectos](LISTADO_PROYECTOS.md): portafolio, filtros, paginación y acciones por
  proyecto.

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
- `app.routes.ts` declara únicamente capacidades de primer nivel. Cuando una feature contiene
  rutas hijas, guards o providers propios, conserva su archivo `<feature>.routes.ts` y se carga
  mediante `loadChildren` para no incorporar su orquestación al bundle inicial.
- Las páginas finales se cargan mediante `loadComponent` dentro del archivo de rutas de su dueño.
- Las rutas reutilizables se centralizan en `core/navegacion/rutas.ts`.
- Los estados globales de carga se centralizan en `core/carga-global` y se montan una sola vez.
- Los mensajes y confirmaciones globales se coordinan desde `core/mensajes` y se presentan mediante
  una única instancia montada en la raíz.
- `shared/components/modal` conserva únicamente el contenedor visual reutilizable; no administra
  estado global ni decisiones de una feature.

No se crean carpetas genéricas como `utils`, `helpers` o `models` para un único archivo sin una
necesidad real de crecimiento.

## Auditoría previa a una migración o extensión

Antes de agregar archivos, métodos o abstracciones, se revisa de forma proporcional la capacidad
completa alrededor del cambio. La auditoría no se limita al componente nombrado por la solicitud:
incluye sus páginas, modelos, configuración, mappers, estado, servicios, endpoints, rutas, pruebas
y documentación relacionada.

- Buscar primero comportamientos y contratos existentes, no solamente nombres de archivos.
- Comparar las implementaciones vecinas ya migradas y reconocer qué permanece igual y qué cambia
  por dominio.
- Si varias operaciones usan el mismo endpoint y el mismo flujo técnico, centralizar la operación
  invariable en su dueño más cercano y representar las variantes mediante contratos tipados.
- Mantener separados los mappers, validaciones y textos cuando expresan reglas propias de una
  sección; la centralización no debe borrar responsabilidades de dominio.
- No detectar interfaces inspeccionando la forma de un objeto en ejecución. Cuando una operación
  admite varios modelos, utilizar una unión discriminada, una clave estable y tipado exhaustivo.
- Centralizar identificadores repetidos mediante enums o catálogos cuando representan identidad de
  dominio; conservar literales únicamente en su fuente de definición o en contratos externos.
- No crear una abstracción por coincidencia visual o por una única repetición local. Debe existir
  un comportamiento común estable o una extensión inmediata que justifique el contrato.
- Al terminar, buscar métodos anteriores, imports, tipos, constantes, pruebas y ramas que hayan
  quedado obsoletos; la refactorización no deja compatibilidad interna ni código muerto sin una
  necesidad vigente.
- Al integrar operaciones HTTP, buscar callbacks que interpreten estados o abran mensajes
  directamente. Los errores se normalizan y notifican mediante la infraestructura de `core`; la
  feature conserva únicamente el contexto funcional y sus mensajes de respaldo.

La propuesta previa a una migración debe señalar las duplicidades encontradas, qué se compartirá y
qué permanecerá específico. Si la auditoría no encuentra una mejora justificada, se conserva la
implementación directa.

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
- El servicio filtra el catálogo mediante permisos reactivos y agrega navegación contextual cuando
  la URL identifica un agregado concreto.
- La barra lateral solo representa los elementos recibidos.
- Los subitems contextuales no inventan identidades: aparecen únicamente cuando la URL contiene el
  identificador requerido y reutilizan los constructores de rutas canónicas de `core/navegacion`.
- Los parámetros de consulta representan estado interno de una página y no cambian la opción activa
  del menú. La coincidencia de navegación compara el path e ignora `queryParams` y fragmentos.
- Los subitems se presentan con sangría y una guía visual conectada con su opción principal; no
  repiten encabezados ni deben parecer tarjetas independientes del primer nivel.
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
- Compartir ciclos estables de carga, error, guardado y bloqueo mediante un servicio proporcionado
  por la página. Los formularios no heredan una base ni reciben responsabilidades de navegación.
- Centralizar constantes compartidas en el nivel más cercano que permita reutilizarlas.
- Evitar clases base cuando composición, directivas o servicios expresen mejor la responsabilidad.

### Enums e identidades estables

Los conjuntos finitos que representan identidad de dominio, estado funcional o decisiones
comparadas por la aplicación se declaran como enums de cadenas en el dueño más cercano.

```ts
export enum PlataformaSolucion {
  Web = 'Web',
  Escritorio = 'Escritorio',
  Movil = 'Móvil',
}
```

- Configuraciones, comparaciones, mappers y pruebas utilizan el miembro del enum; no repiten su
  cadena serializada.
- Los mappers validan los valores externos antes de convertirlos al enum. El tipado no reemplaza
  la validación de datos recibidos del backend o recuperados desde JSON.
- Se prefieren enums de cadenas porque conservan contratos legibles y no dependen del orden de los
  miembros.
- Cada enum permanece en el dominio o capacidad que define sus valores; no se crea un catálogo
  global de enums sin cohesión.
- Los textos visibles, descripciones, placeholders y mensajes pertenecen a configuración o
  internacionalización, no a enums.
- Los protocolos técnicos escritos directamente en plantillas o definidos por estándares
  externos permanecen como uniones literales. Esto incluye tamaños visuales, roles ARIA, teclas y
  variantes CSS.
- Los valores administrados por catálogos remotos se representan mediante su ID o código recibido;
  no se duplican en enums del frontend.

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
