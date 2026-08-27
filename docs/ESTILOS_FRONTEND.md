# Estándar de estilos del frontend

Este documento define cómo organizar y reutilizar los estilos para mantener una interfaz
consistente durante la migración de componentes. Complementa las
[convenciones generales](CONVENCIONES_FRONTEND.md) del frontend.

## Objetivos

- Aplicar una única identidad visual en toda la aplicación.
- Evitar colores, tipografías, espaciados y estados duplicados.
- Mantener las features aisladas sin repetir primitivas compartidas.
- Hacer explícitas las variantes visuales mediante modificadores.
- Evitar sobrescrituras globales frágiles y reglas de especificidad creciente.

## Capas del sistema visual

Los estilos se dividen en cuatro capas:

```text
src/
├── styles.css                       # Manifiesto y orden global de la cascada
└── app/styles/
    ├── tokens.css                   # Valores y decisiones del sistema visual
    ├── base.css                     # Fuentes, reset y documento
    └── primitives/
        ├── forms.css                # Campos, controles y errores
        ├── buttons.css              # Botones y sus variantes
        ├── cards.css                # Superficies y regiones de tarjetas
        └── page-headers.css         # Identidad y acciones de páginas
```

Los componentes conservan únicamente estilos específicos de su composición:

```text
features/autenticacion/components/acceso-microsoft/
└── acceso-microsoft.css
```

El orden global se declara una sola vez en `src/styles.css`:

```css
@import './app/styles/tokens.css';
@import './app/styles/base.css';
@import './app/styles/primitives/forms.css';
@import './app/styles/primitives/buttons.css';
@import './app/styles/primitives/cards.css';
@import './app/styles/primitives/page-headers.css';
```

`angular.json` carga solamente `src/styles.css` para evitar que un archivo sea incluido dos veces.

## Tokens

`tokens.css` contiene propiedades personalizadas dentro de `:root`. No debe contener estilos de
features ni selectores de componentes.

Tipos de tokens permitidos:

- Tipografía.
- Paleta base y colores semánticos.
- Superficies y texto.
- Bordes y radios.
- Espaciado.
- Sombras.
- Movimiento.
- Z-index.
- Dimensiones de controles.
- Tokens semánticos de primitivas compartidas.

Los componentes deben consumir tokens semánticos antes que escalas crudas:

```css
/* Preferido */
color: var(--text-primary);
border-color: var(--field-border);

/* Evitar dentro de componentes */
color: var(--neutral-900);
border-color: #d9dde3;
```

Un valor debe convertirse en token cuando representa una decisión visual reutilizable o cuando
varios componentes necesitan cambiar conjuntamente. Una medida exclusiva de un layout local no
requiere un token nuevo.

El acento de identidad utiliza la escala neutral gris y negra mediante `--color-brand`. No se
introducen colores decorativos mediante valores locales. Los colores de información, éxito,
advertencia y error se reservan para estados que necesiten comunicar esas condiciones.

## Tipografía oficial

La tipografía oficial es Prospero y se registra una sola vez en `base.css`.

Archivos disponibles:

| Peso | Normal                  | Itálica                       |
| ---- | ----------------------- | ----------------------------- |
| 400  | `Prospero-Regular.ttf`  | `Prospero-RegularItalic.ttf`  |
| 600  | `Prospero-SemiBold.ttf` | `Prospero-SemiBoldItalic.ttf` |
| 700  | `Prospero-Bold.ttf`     | `Prospero-BoldItalic.ttf`     |

Reglas obligatorias:

- No declarar otro `font-family` dentro de una feature o componente.
- Inputs, botones, selects y textareas heredan la tipografía del documento.
- Usar `--font-size-*`, `--font-weight-*` y `--line-height-*`.
- Usar únicamente pesos reales 400, 600 y 700.
- No solicitar pesos 500, 750 u 800 porque los archivos migrados no los incluyen.
- Mantener `font-synthesis: none` para impedir que el navegador fabrique variantes diferentes.

## Base global

`base.css` puede contener únicamente reglas que aplican a todo el documento:

- Declaraciones `@font-face`.
- `box-sizing`.
- Configuración de `html`, `body` y `app-root`.
- Reset mínimo de márgenes.
- Herencia tipográfica de controles.
- Comportamiento base de elementos deshabilitados.

No debe contener clases de negocio, páginas o features.

## Primitivas compartidas

Las primitivas usan el prefijo `ui-` y representan contratos visuales reutilizables:

```html
<div class="ui-field">
  <label class="ui-label ui-label--compact">Usuario</label>
  <div class="ui-control-wrap">
    <input class="ui-control ui-control--xl" />
  </div>
</div>
```

Convenciones:

- Base: `.ui-control`.
- Variante: `.ui-control--xl`.
- Elemento: `.ui-button__icon`.
- Variante del elemento: `.ui-button__icon--trailing`.
- Estado administrado por código: `.has-error`.

Las variantes deben combinarse en el HTML. No se debe cambiar una primitiva mediante selectores
profundos como `.mi-feature .ui-control` si el cambio representa una variante reutilizable.

### Formularios

`primitives/forms.css` es responsable de:

- `.ui-visually-hidden` para conservar etiquetas accesibles sin alterar el layout.
- `.ui-field` y `.ui-label`.
- `.ui-control-wrap` y `.ui-control`.
- Tamaños y espaciado para iconos o acciones.
- Hover, foco y estado deshabilitado.
- Estado `.has-error`.
- `.ui-field-error`.
- Adaptación a `prefers-reduced-motion`.

El foco de `.ui-control` es único para toda la aplicación, tanto si el control está directamente
dentro de `.ui-field` como si utiliza `.ui-control-wrap`. La primitiva elimina el contorno nativo
del navegador y mantiene la accesibilidad mediante `--field-border-focus` y `--shadow-focus`.
Las features no agregan bordes negros, outlines ni sombras locales para representar el foco.

### Botones

`primitives/buttons.css` es responsable de:

- `.ui-button`.
- Variantes de intención como `.ui-button--primary`.
- Variantes de tamaño y ancho.
- Hover, active, foco y disabled.
- Label e iconos internos.
- Movimiento reducido.

Los modificadores se combinan por responsabilidad:

```html
<button class="ui-button ui-button--primary ui-button--md">
  <app-icono class="ui-button__icon" nombre="agregar" />
  Crear
</button>
<button class="ui-button ui-button--secondary ui-button--on-inverse ui-button--md">
  <app-icono class="ui-button__icon" nombre="resumen" />
  Consultar
</button>
<button class="ui-button ui-button--text ui-button--md">
  Ver todos
  <app-icono class="ui-button__icon ui-button__icon--trailing" nombre="continuar" />
</button>
```

- `primary`, `secondary` y `text` expresan la jerarquía de la acción.
- `md` y `xl` expresan el tamaño; el tamaño base corresponde a `lg`.
- `on-inverse` adapta la acción a una superficie oscura sin crear clases de una feature.
- Las acciones `text` conservan su color durante hover y comunican la interacción únicamente con
  movimiento; el foco visible permanece independiente para navegación con teclado.

### Iconografía

`ICONOS_APLICACION` es el único catálogo de iconos permitido. Las plantillas los representan
mediante `app-icono` y utilizan nombres semánticos como `editar`, `volver` o `eliminar`.

- Solo `shared/components/icono/iconos-aplicacion.ts` importa definiciones desde
  `@lucide/angular`.
- Si una acción requiere una semántica nueva, se registra una vez en el catálogo; las features no
  importan ni almacenan SVG independientes.
- Las marcas externas también se registran como datos compatibles con el renderizador compartido;
  las features las consumen por su nombre semántico y no insertan SVG directamente.
- Los botones de operación incluyen normalmente un icono reconocible. Se exceptúan acciones de
  texto donde el contexto ya comunica suficientemente su finalidad.
- El icono inicial identifica acciones como editar, cancelar, guardar o eliminar. El icono final
  indica dirección o continuidad.
- Los iconos de botones usan `ui-button__icon`; los direccionales agregan
  `ui-button__icon--trailing`.
- Un botón compuesto únicamente por un icono conserva un `aria-label` que nombre la acción.

### Tarjetas

`primitives/cards.css` proporciona la superficie y las regiones estructurales compartidas:

```html
<article class="ui-card ui-card--accented ui-card--info">
  <header class="ui-card__header">
    <div class="ui-card__heading">
      <span class="ui-card__icon" aria-hidden="true"></span>
      <div>
        <span class="ui-card__eyebrow">Proyectos</span>
        <h2 class="ui-card__title">Distribución de proyectos</h2>
      </div>
    </div>
  </header>
  <div class="ui-card__body ui-card__body--padded"></div>
</article>
```

- `ui-card` define superficie, borde, radio y elevación.
- `ui-card--accented` habilita la franja y el encabezado tonal.
- `info`, `success`, `warning` y `brand` seleccionan una intención semántica.
- `header`, `heading`, `icon`, `body`, `footer` y `count` estructuran contenido reutilizable.
- Las cuadrículas, KPI, listados y gráficos permanecen en el CSS de su feature.

### Estados vacíos

`EstadoVacio` centraliza la presentación cuando una sección no contiene información:

```html
<app-estado-vacio
  icono="proyectos"
  titulo="Aún no hay proyectos"
  descripcion="Los proyectos disponibles aparecerán aquí."
>
  <button estadoVacioAcciones class="ui-button ui-button--primary ui-button--md">
    <app-icono class="ui-button__icon" nombre="agregar" />
    Crear proyecto
  </button>
</app-estado-vacio>
```

- La feature proporciona el icono y los textos correspondientes a su dominio.
- La acción es opcional y se proyecta mediante `estadoVacioAcciones`.
- El componente hereda la intención visual de una tarjeta, pero también funciona fuera de ella.
- Una variante local puede ajustar `--ui-empty-state-min-height` sin duplicar su estructura.
- No se replica manualmente el bloque de icono, título y descripción en cada componente.

### Estados de error

`EstadoError` reemplaza el contenido de una página cuando una falla impide presentar información
confiable:

```html
@if (errorCarga()) {
<app-estado-error [reintentable]="true" (reintentar)="cargar()" />
} @else {
<!-- Encabezado y contenido de la página. -->
}
```

- El mensaje predeterminado es transversal y no expone detalles técnicos.
- El reintento es opcional, se habilita mediante `reintentable` y conserva icono y estilo comunes.
- El encabezado, los indicadores y las secciones dependientes de la consulta permanecen en el
  bloque exitoso.
- Una variante local puede ajustar `--ui-error-state-min-height` sin duplicar estilos.
- Un estado vacío representa una consulta exitosa sin datos; un estado de error representa una
  consulta fallida.

### Encabezados de página

`EncabezadoPagina` utiliza `primitives/page-headers.css` para evitar que cada feature replique la
estructura y la presentación del encabezado principal:

```html
<app-encabezado-pagina
  titulo="Proyectos"
  etiqueta="Proyectos"
  descripcion="Consulta y gestiona las iniciativas."
  contexto="Lunes, 24 de agosto"
  icono="proyectos"
>
  <span encabezadoPaginaMetadatos class="ui-page-header__meta-item">
    <strong>12</strong> activos
  </span>
  <button
    encabezadoPaginaAcciones
    class="ui-button ui-button--primary ui-button--on-inverse ui-button--md"
  >
    <app-icono class="ui-button__icon" nombre="agregar" />
    Crear proyecto
  </button>
</app-encabezado-pagina>
```

- El componente ofrece identidad, contenido, metadatos, contexto y acciones opcionales.
- La feature proporciona textos, iconos, datos y eventos; no redefine la superficie compartida.
- `encabezadoPaginaMetadatos` y `encabezadoPaginaAcciones` identifican el contenido proyectado.
- Los botones conservan sus primitivas y se adaptan mediante `ui-button--on-inverse`.
- Encabezados internos de tarjetas, modales o secciones no usan `ui-page-header`.

### Modales

`Modal` proporciona el contenedor compartido para formularios, confirmaciones y contenido de
dominio sin conocer las reglas de cada feature:

```html
<app-modal
  titulo="Confirmar vinculación"
  descripcion="Revisa la información antes de continuar."
  icono="proyectos"
  [idFormulario]="formId"
  textoConfirmar="Continuar"
  (cerrar)="cancelar()"
>
  <form [id]="formId"></form>
</app-modal>
```

- La feature controla si el componente existe y atiende sus salidas; el modal no mantiene estado
  de negocio ni consume servicios.
- `descartable` controla únicamente Escape, backdrop y el botón superior. La acción de cancelar
  permanece disponible cuando `mostrarCancelar` está habilitado.
- `idFormulario` permite que el botón del pie envíe un formulario proyectado sin duplicar las
  acciones dentro del contenido.
- El componente administra `role`, relaciones ARIA, foco inicial, confinamiento del foco,
  restauración del foco y bloqueo del desplazamiento del documento.
- Los tamaños usan `sm`, `md`, `lg` y `xl`; las features no deben replicar overlay, superficie,
  encabezado o pie para obtener otro ancho.
- Los mensajes globales y los formularios de dominio se componen sobre este contenedor; no
  duplican su estructura ni sus estilos.

`ModalMensaje` se monta una sola vez en la raíz y consume el estado de `MensajesService`. Las
features solicitan información o decisiones desde TypeScript sin implementar otro modal:

```ts
await this.mensajes.error(
  'No fue posible validar Azure',
  'Verifica la información e intenta nuevamente.',
);

const confirmado = await this.mensajes.confirmar(
  'Crear proyecto',
  'Se creará un borrador con la información validada.',
);
```

- `informar`, `exito`, `advertir` y `error` comunican un resultado con una acción de reconocimiento.
- `confirmar` y `confirmarDestructiva` devuelven la decisión mediante `Promise<boolean>` y no se
  descartan mediante Escape o backdrop.
- Una acción destructiva utiliza `ui-button--danger`; el color de peligro no se usa para errores
  informativos ni como acento general de la aplicación.
- Abrir un mensaje nuevo resuelve como cancelada cualquier decisión anterior pendiente para evitar
  promesas sin completar.

## Estilos de componentes y features

El CSS encapsulado de un componente conserva solamente:

- Layout exclusivo del componente.
- Relaciones entre elementos propios.
- Comportamiento responsive propio.
- Animaciones que no forman parte de una primitiva compartida.

Ejemplo correcto para autenticación:

```css
:host {
  display: block;
  width: 100%;
}

.acceso-microsoft {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--space-3);
}

.acceso-microsoft__estado {
  color: var(--text-muted);
  text-align: center;
}
```

Los nombres específicos siguen una forma BEM sencilla:

```text
componente
componente__elemento
componente--variante
```

## Documentación del CSS

Los comentarios en CSS se reservan para explicar la finalidad de una hoja compartida, separar
bloques importantes o registrar una decisión que no puede inferirse del selector.

Se documentan:

- Tokens y secciones del sistema visual.
- Primitivas compartidas y sus grupos de estados.
- Decisiones responsive o workarounds no evidentes.
- Dependencias de accesibilidad o estructura del DOM.

No se documentan propiedades evidentes ni cada selector de un componente. Un nombre como
`.inicio-sesion__tarjeta` ya comunica su responsabilidad y no necesita un comentario adicional.

## Cuándo promover una regla

Una regla debe pasar del componente a una primitiva cuando:

- Representa un contrato visual del sistema.
- Se necesita en dos o más componentes.
- Debe evolucionar de manera coordinada.
- Incluye estados comunes de interacción o accesibilidad.

Debe permanecer en la feature cuando:

- Solo organiza el layout local.
- Depende de la estructura particular del componente.
- No tiene significado fuera de esa experiencia.

## Prácticas que deben evitarse

- Colores hexadecimales dentro de componentes.
- `font-family` local.
- Pesos tipográficos inexistentes.
- Copiar bloques completos de inputs o botones.
- Selectores globales con nombres de una feature.
- `::ng-deep` para cambiar primitivas.
- `!important` para resolver conflictos de cascada.
- Aumentar especificidad repetidamente.
- Importar `tokens.css` desde cada componente.
- Declarar nuevamente reglas de `ui-control`, `ui-button` o `ui-field-error` en una feature.

Si una primitiva necesita otra apariencia, se crea un modificador compartido o se incorpora un
token semántico; no se copia la regla.

## Checklist para migrar estilos

1. Identificar colores, espacios, radios, fuentes y sombras repetidas.
2. Reemplazar valores reutilizables por tokens existentes.
3. Separar reset, primitivas y layout específico.
4. Reutilizar clases `ui-*` antes de crear otras.
5. Crear modificadores explícitos para variantes reales.
6. Mantener en la feature únicamente selectores de su propio bloque.
7. Verificar hover, focus-visible, active, disabled y error.
8. Verificar `prefers-reduced-motion` cuando exista movimiento.
9. Comprobar escritorio y una anchura móvil razonable.
10. Ejecutar pruebas y build de producción.

## Verificación automática recomendada

Antes de finalizar una migración:

```powershell
rg "font-family|#[0-9a-fA-F]{3,8}|!important|::ng-deep" src/app/features -g "*.css"
npm run build
npm test -- --watch=false
```

Los resultados deben revisarse; algunas coincidencias pueden ser deliberadas, pero necesitan una
justificación concreta.
