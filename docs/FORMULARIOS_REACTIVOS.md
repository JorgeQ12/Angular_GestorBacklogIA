# Estándar de formularios reactivos

Este documento registra las decisiones de arquitectura, presentación, validación y pruebas para
los formularios del frontend. Debe consultarse junto con las
[convenciones generales](CONVENCIONES_FRONTEND.md) antes de crear o migrar un formulario.

El acceso corporativo mediante Microsoft es una acción y no un formulario reactivo. Su flujo se
documenta en [Autenticación mediante Kong y Microsoft](AUTENTICACION_KONG.md).

## Objetivos

- Mantener formularios estrictamente tipados.
- Reutilizar el feedback visual mediante composición.
- Evitar herencia y estado duplicado para mostrar validaciones.
- Mantener separados los validadores, los textos y el acceso al DOM.
- Proporcionar feedback accesible y consistente.

## Decisiones principales

1. Los formularios de la aplicación usan Angular Reactive Forms.
2. El componente es responsable del formulario, el envío y el comportamiento de negocio.
3. Las directivas compartidas son responsables de presentar errores.
4. No se usa `BaseFormComponent` para validación visual.
5. No se llaman métodos como `getFieldError('nombre')` o `isFieldInvalid('nombre')` desde el
   template.
6. `appErrorCampo` se declara explícitamente en cada control que debe mostrar feedback.
7. Los mensajes genéricos viven en `shared`; los mensajes específicos viven en su feature.

## Organización de archivos

La infraestructura compartida se organiza como una capacidad autocontenida:

```text
src/app/shared/forms/errores-validacion/
├── config/
│   └── mensajes-error.config.ts
├── directives/
│   ├── error-campo.directive.ts
│   ├── error-campo.directive.spec.ts
│   ├── enfocar-primer-control-invalido.directive.ts
│   ├── enfocar-primer-control-invalido.directive.spec.ts
│   ├── mensajes-formulario.directive.ts
│   └── mensajes-formulario.directive.spec.ts
├── models/
│   └── mensajes-error.model.ts
└── index.ts
```

Las composiciones estables de formularios se ubican junto a esta infraestructura:

```text
src/app/shared/forms/components/
└── fila-formulario/
    ├── fila-formulario.ts
    ├── fila-formulario.html
    ├── fila-formulario.css
    └── fila-formulario.spec.ts
```

Cada formulario mantiene sus contratos y textos particulares dentro de su feature:

```text
formulario-[entidad]/
├── config/
│   └── mensajes-[entidad].config.ts
├── models/
│   └── formulario-[entidad].model.ts
├── formulario-[entidad].ts
├── formulario-[entidad].html
├── formulario-[entidad].css
└── formulario-[entidad].spec.ts
```

No se deben crear carpetas genéricas como `utils`, `helpers` o `tokens` para alojar un único
archivo sin una necesidad real de crecimiento.

Las páginas se organizan en una carpeta propia y actúan como contenedores de composición:

```text
features/[capacidad]/
├── components/
│   └── formulario-[entidad]/
└── pages/
    └── pagina-[capacidad]/
        ├── pagina-[capacidad].ts
        ├── pagina-[capacidad].html
        ├── pagina-[capacidad].css
        └── pagina-[capacidad].spec.ts
```

La página recibe el evento tipado del formulario y lo conecta con el caso de uso de la feature.
El formulario no debe inyectar API, sesión, router, loader ni otros servicios de aplicación. En
una migración incremental se conserva un método explícito como punto de integración; no se crean
servicios ficticios ni llamadas HTTP dentro de la página para completar temporalmente el flujo.

## Responsabilidades

### Componente del formulario

El componente:

- Construye el `FormGroup` tipado.
- Declara validadores síncronos y asíncronos.
- Gestiona estado propio de la experiencia, por ejemplo, mostrar la contraseña.
- Marca los controles como tocados cuando un envío es inválido.
- Emite el valor tipado cuando el formulario es válido.
- Deshabilita el formulario durante operaciones remotas cuando corresponda.

El componente no:

- Construye elementos HTML de error.
- Mantiene un `submittedSignal` adicional.
- Traduce manualmente `ValidationErrors` en cada formulario.
- Hereda de una clase base únicamente para acceder a `touched`, `dirty` o `invalid`.

### Colecciones dinámicas

Cuando una sección permite agregar o retirar elementos, el componente del formulario administra
un `FormArray` tipado. La página consumidora recibe únicamente el modelo final y no modifica
controles, índices ni validadores.

- El mínimo y el máximo se declaran en la configuración de la sección.
- Agregar y eliminar usan la API de `FormArray`; no se mantiene una colección paralela.
- Cada control dinámico conserva `id`, etiqueta y mensaje accesible propios.
- Los mensajes repetidos pueden proporcionarse directamente mediante `appMensajesError`.
- La hidratación reemplaza los controles existentes y deja el formulario limpio y sin tocar.
- Los límites se prueban, incluida la imposibilidad de eliminar el último elemento requerido.
- `FilaFormulario` comparte la numeración, distribución y eliminación accesible cuando la misma
  composición aparece en varias secciones. El formulario propietario conserva el `FormArray`, los
  campos proyectados, sus validadores y la modificación de la colección.
- Una coincidencia visual aislada no justifica trasladar reglas de dominio a la fila compartida.

### `MensajesFormularioDirective`

La directiva aplicada al `<form>` proporciona el mapa de mensajes específicos a los controles
descendientes:

```html
<form [formGroup]="formulario" [appMensajesFormulario]="mensajesFormulario"></form>
```

### `ErrorCampoDirective`

La directiva aplicada al control:

- Inyecta su propio `NgControl`.
- Observa los eventos del control y del formulario.
- Resuelve el mensaje correspondiente.
- Crea y elimina el elemento de error.
- Administra las clases y relaciones ARIA.

Se utiliza de forma explícita:

```html
<input id="campo-nombre" formControlName="nombre" appErrorCampo required />
```

Cada control con `appErrorCampo` debe:

- Tener un `id` único.
- Estar dentro de un ancestro `.ui-field`.
- Tener un nombre accesible. Se prefiere un `<label>` cuyo `for` coincida con el `id`; un control
  dinámico compacto puede usar `aria-label` cuando una etiqueta visible resulte redundante.
- Estar asociado mediante `formControlName`, `[formControl]` o `ngModel`.

## Tipado del formulario

Cuando cada propiedad del valor corresponde a un `FormControl`, se usa el contrato compartido
`ControlesFormularioPlano<T>` como fuente única del tipado:

```ts
export interface DatosFormulario {
  nombre: string;
  descripcion: string;
}

export type ControlesFormulario = ControlesFormularioPlano<DatosFormulario>;

export type FormularioTipado = FormGroup<ControlesFormulario>;
export type CampoFormulario = keyof ControlesFormulario;
```

Esto evita repetir las propiedades en el valor, los controles y la unión de nombres de campo. El
tipo compartido vive en `shared/forms/models` y solo aplica a estructuras planas.

Si el valor editable difiere del modelo de dominio, se declara primero una interfaz específica de
valores del formulario y los controles se derivan desde ella. Si la estructura contiene
`FormArray`, grupos anidados u otros controles compuestos, sus controles se tipan explícitamente;
el nombre de campo se sigue derivando con `keyof` y no mediante uniones manuales de cadenas.

## Configuración de mensajes

Angular genera claves técnicas como `required`, `email` o `minlength`. Los validadores no deben
contener textos de interfaz.

Los mensajes genéricos viven en:

```text
shared/forms/errores-validacion/config/mensajes-error.config.ts
```

Los campos de texto libre obligatorios usan `validarTextoRequerido`, ubicado en
`shared/forms/validadores`. Esta regla rechaza cadenas vacías o compuestas únicamente por espacios
y devuelve la clave estándar `required`, por lo que reutiliza los mismos mensajes y directivas.
`Validators.required` se conserva para fechas, números, selects y controles cuyo valor no sea
texto libre. Las contraseñas no se recortan ni adoptan automáticamente esta validación.

Ejemplos:

```ts
export const MENSAJES_ERROR_PREDETERMINADOS = {
  required: 'Este campo es obligatorio.',
  email: 'Debe ingresar un correo válido.',
  pattern: 'El formato ingresado no es válido.',
} satisfies MensajesError;
```

Los mensajes específicos se declaran en la configuración de la feature:

```ts
export const MENSAJES_FORMULARIO = {
  nombre: {
    required: 'El nombre es obligatorio.',
  },
  descripcion: {
    required: 'La descripción es obligatoria.',
  },
} satisfies MensajesFormulario<CampoFormulario>;
```

### Orden de resolución

La directiva resuelve un mensaje en este orden:

1. Configuración particular colocada directamente en el control mediante `appMensajesError`.
2. Configuración del formulario proporcionada mediante `appMensajesFormulario`.
3. Catálogo global inyectado mediante `MENSAJES_ERROR_FORMULARIO`.
4. Mensaje genérico para una clave desconocida.

La configuración directa del control se reserva para excepciones. El comportamiento normal usa
la configuración única del formulario.

## Política de visualización

La política vigente muestra el error cuando el control es inválido y se cumple al menos una de
estas condiciones:

```ts
const debeMostrar = control.invalid && (control.touched || control.dirty || formulario.submitted);
```

Comportamiento resultante:

- Enfocar el control sin modificarlo: no muestra el error.
- Modificarlo y dejarlo inválido: muestra el error por `dirty`.
- Abandonarlo inválido: muestra el error por `touched`.
- Enviar el formulario: muestra todos los errores por `submitted`.
- Corregir el valor: elimina el error automáticamente.

Si el producto decide adoptar una experiencia menos inmediata, la política debe modificarse una
sola vez en `ErrorCampoDirective`, por ejemplo:

```ts
const debeMostrar = control.invalid && (control.touched || formulario.submitted);
```

No se deben crear variaciones locales de esta regla dentro de cada componente.

## Envío del formulario

El componente no necesita una señal adicional para saber si hubo un envío. Angular ya proporciona
`FormGroupDirective.submitted`.

La implementación esperada es:

```ts
protected enviar(): void {
  if (this.formulario.invalid) {
    this.formulario.markAllAsTouched();
    return;
  }

  this.enviarDatos.emit(
    this.formulario.getRawValue(),
  );
}
```

`markAllAsTouched()` mantiene correctamente el estado del modelo y permite que cada directiva
reaccione sin llamadas manuales desde el template.

Cuando el envío también debe llevar el foco al primer error, el `<form>` utiliza
`appEnfocarPrimerControlInvalido`. La directiva espera la presentación de los errores y busca el
primer `[aria-invalid="true"]`; no consulta clases privadas de inputs, selectores o calendarios.
Los eventos de controles nativos se reciben como `Event` y se estrechan en TypeScript. No se usa
`$any` en el template para leer `event.target`.

## Estado de envío remoto

Cuando exista una entrada como `enviando`, los controles se deshabilitan mediante la API del
formulario, no con atributos individuales en cada input:

```ts
effect(() => {
  const debeEstarDeshabilitado = this.enviando();

  if (debeEstarDeshabilitado && this.formulario.enabled) {
    this.formulario.disable();
  } else if (!debeEstarDeshabilitado && this.formulario.disabled) {
    this.formulario.enable();
  }
});
```

Los botones que no pertenecen al `FormGroup` deben usar `[disabled]="enviando()"` cuando
corresponda.

## Controles compuestos compartidos

Los selectores visuales que sustituyen controles nativos viven en `shared/forms/controles` y se
integran con Reactive Forms mediante `ControlValueAccessor`:

```text
controles/
├── campo-busqueda/
│   ├── campo-busqueda.ts
│   ├── campo-busqueda.html
│   ├── campo-busqueda.css
│   └── campo-busqueda.spec.ts
├── selector-campo/
│   ├── models/opcion-selector.model.ts
│   ├── selector-campo.ts
│   ├── selector-campo.html
│   ├── selector-campo.css
│   └── selector-campo.spec.ts
├── selector-fecha/
    ├── models/dia-calendario.model.ts
    ├── selector-fecha.ts
    ├── selector-fecha.html
    ├── selector-fecha.css
│   └── selector-fecha.spec.ts
└── selector-tarjetas/
    ├── models/opcion-selector-tarjeta.model.ts
    ├── selector-tarjetas.ts
    ├── selector-tarjetas.html
    ├── selector-tarjetas.css
    └── selector-tarjetas.spec.ts
```

- `SelectorCampo` recibe opciones neutrales con `valor`, `etiqueta`, descripción opcional y estado
  deshabilitado. La feature adapta sus catálogos a este contrato; el control no conoce DTO ni
  modelos de dominio.
- `CampoBusqueda` centraliza estructura, icono, foco, accesibilidad y estados visuales. La feature
  proporciona su etiqueta, placeholder y `FormControl`, y conserva únicamente las reglas de ancho
  o distribución propias de su layout.
- `SelectorFecha` conserva fechas sin hora como `YYYY-MM-DD`. El formato visible pertenece a
  `FormateadorFechaService`, por lo que no se crean instancias de `Intl` en componentes.
- El calendario de `SelectorFecha` es un popover no modal: puede usar `role="dialog"`, pero no
  declara `aria-modal` ni retiene el foco. `Tab` lo cierra y mantiene el recorrido natural.
- `SelectorTarjetas` representa alternativas excluyentes con radios nativos cuando las opciones
  necesitan icono y descripción; no sustituye a `SelectorCampo` para listas compactas.
- Todos propagan valor, estado tocado y estado deshabilitado mediante la interfaz de Angular.
- Los paneles flotantes utilizan el overlay conectado de CDK para evitar cálculos manuales de
  posición, listeners globales y recortes dentro de tarjetas o modales.
- Sus iconos provienen de `ICONOS_APLICACION` y sus estilos consumen tokens semánticos.
- Deben permitir operación por teclado, foco visible y asociación explícita con su etiqueta.

`ErrorCampoDirective` también admite estos controles compuestos. El token
`CONTROL_CAMPO_PERSONALIZADO` permite aplicar `aria-invalid`, `aria-describedby` y el estado visual
al botón interno que realmente recibe foco, sin acoplar la directiva a una implementación concreta.

No se copian selectores o calendarios dentro de una feature ni se modelan sus valores mediante
eventos paralelos a `formControlName`.

La distribución repetida de campos utiliza primitivas globales en lugar de CSS de feature:

```html
<div class="ui-form-grid ui-form-grid--2">
  <div class="ui-field">...</div>
  <div class="ui-field">...</div>
</div>
```

`ui-form-grid--2` crea dos columnas del mismo ancho y las convierte en una sola columna en tamaños
reducidos. Los tokens proporcionan el espaciado; la primitiva administra el comportamiento del
layout. Una feature solo debe crear una distribución propia cuando su composición sea realmente
particular del dominio.

Los pies repetidos de formularios dentro de tarjetas utilizan `ui-form-footer` y
`ui-form-footer__note`. La página proyecta las acciones y conserva los textos del flujo, mientras la
primitiva administra distribución, superficie y adaptación móvil.

## DOM y accesibilidad

Cuando existe un error, `ErrorCampoDirective` genera:

```html
<span id="campo-nombre-error" class="ui-field-error" role="alert"> El nombre es obligatorio. </span>
```

Además:

- Agrega `has-error` al contenedor `.ui-field`.
- Establece `aria-invalid="true"` en el control.
- Agrega el identificador a `aria-describedby`.
- Conserva otros identificadores existentes en `aria-describedby`.
- Elimina únicamente los atributos y nodos administrados por la directiva.
- Usa `textContent` para evitar interpretar el mensaje como HTML.

## Pruebas obligatorias

Las directivas compartidas deben probar:

- Ausencia de error antes de la interacción.
- Aparición del error al tocar o modificar el control.
- Aparición de errores después de enviar.
- Resolución del mensaje mediante `formControlName`.
- Prioridad de mensajes específicos y predeterminados.
- Eliminación del mensaje al corregir el control.
- Conservación de otros valores de `aria-describedby`.
- Ausencia de elementos de error duplicados.

Los controles compuestos deben probar además la propagación del valor ISO o de catálogo, el estado
deshabilitado y la selección mediante teclado.

Cada componente de formulario debe probar, como mínimo:

- Creación del formulario.
- Envío inválido sin emisión.
- Mensajes específicos esperados.
- Envío válido con el objeto tipado correcto.
- Estados interactivos propios del formulario.
- Deshabilitación durante operaciones remotas.
- Límites de adición y eliminación cuando utiliza un `FormArray`.

## Prácticas que deben evitarse

No repetir bloques como:

```html
@if (errorContrasena) {
<span class="ui-field-error" role="alert"> {{ errorContrasena }} </span>
}
```

No consultar errores desde el template:

```html
[appErrorCampo]="getFieldError('nombre')"
```

No duplicar estados existentes de Angular:

```ts
submittedSignal = signal(false);
```

No mezclar textos de presentación dentro de los validadores y no crear una clase base para
envolver propiedades que ya expone `AbstractControl`.

## Checklist para migrar un formulario

1. Definir el valor y los controles en `models`.
2. Crear el `FormGroup` con `nonNullable` cuando corresponda.
3. Mover los mensajes específicos al archivo de `config` de la feature.
4. Importar `ReactiveFormsModule`, `ErrorCampoDirective` y `MensajesFormularioDirective`.
5. Agregar `[appMensajesFormulario]` una sola vez en el `<form>`.
6. Agregar `appErrorCampo` a cada control que requiera feedback.
7. Verificar `id`, `label[for]` y `.ui-field`.
8. Eliminar `BaseFormComponent`, `getFieldError`, `isFieldInvalid` y `submittedSignal`.
9. Usar `markAllAsTouched()` cuando el envío sea inválido.
10. Probar el formulario y ejecutar el build de producción.

## Criterios para evolucionar la solución

Un servicio de resolución de mensajes solo se justifica cuando aparezca alguna de estas
necesidades:

- Internacionalización dinámica.
- Mensajes dependientes del backend.
- Priorización configurable de múltiples errores.
- Telemetría de validaciones.
- Formateo dependiente del contexto o del usuario.

Mientras los mensajes sean deterministas y locales, los mapas tipados y el token de inyección son
suficientes.
