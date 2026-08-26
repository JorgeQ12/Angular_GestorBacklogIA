import { FormArray, FormControl, FormGroup } from '@angular/forms';

/** Representa la estructura particular de controles utilizada por Objetivos. */
export interface ControlesFormularioObjetivosProyecto {
  objetivoGeneral: FormControl<string>;
  objetivosEspecificos: FormArray<FormControl<string>>;
}

/** Mantiene el formulario dinámico de Objetivos estrictamente tipado. */
export type FormularioObjetivosProyectoTipado = FormGroup<ControlesFormularioObjetivosProyecto>;

/** Identifica los campos disponibles en el formulario de Objetivos. */
export type CampoObjetivosProyecto = keyof ControlesFormularioObjetivosProyecto;
