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
│   ├── mensajes-formulario.directive.ts
│   └── mensajes-formulario.directive.spec.ts
├── models/
│   └── mensajes-error.model.ts
└── index.ts
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
- Tener un `<label>` cuyo `for` coincida con el `id`.
- Estar asociado mediante `formControlName`, `[formControl]` o `ngModel`.

## Tipado del formulario

El valor emitido es la fuente para derivar los controles:

```ts
export interface DatosFormulario {
  nombre: string;
  descripcion: string;
}

export type ControlesFormulario = {
  [TCampo in keyof DatosFormulario]: FormControl<DatosFormulario[TCampo]>;
};

export type FormularioTipado = FormGroup<ControlesFormulario>;
export type CampoFormulario = keyof ControlesFormulario;
```

Esto evita declarar por separado el tipo del valor y el tipo de cada control.

## Configuración de mensajes

Angular genera claves técnicas como `required`, `email` o `minlength`. Los validadores no deben
contener textos de interfaz.

Los mensajes genéricos viven en:

```text
shared/forms/errores-validacion/config/mensajes-error.config.ts
```

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

## DOM y accesibilidad

Cuando existe un error, `ErrorCampoDirective` genera:

```html
<span id="campo-nombre-error" class="ui-field-error" role="alert">
  El nombre es obligatorio.
</span>
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

Cada componente de formulario debe probar, como mínimo:

- Creación del formulario.
- Envío inválido sin emisión.
- Mensajes específicos esperados.
- Envío válido con el objeto tipado correcto.
- Estados interactivos propios del formulario.
- Deshabilitación durante operaciones remotas.

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
