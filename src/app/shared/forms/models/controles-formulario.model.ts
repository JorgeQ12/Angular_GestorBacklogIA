import { FormControl } from '@angular/forms';

/** Deriva controles simples a partir de cada propiedad del valor del formulario. */
export type ControlesFormularioPlano<TValores extends object> = {
  -readonly [TCampo in keyof TValores]-?: FormControl<TValores[TCampo]>;
};
