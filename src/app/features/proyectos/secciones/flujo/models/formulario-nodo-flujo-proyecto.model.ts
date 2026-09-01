import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PermisoRolModulo } from './flujo-proyecto.model';

/** Identifica los controles del editor de nodos para asociar mensajes de validación. */
export type CampoFormularioNodoFlujo = keyof ControlesFormularioNodoFlujo;

/** Define los controles de una franja semanal de mayor actividad. */
export interface ControlesFranjaActividadModulo {
  dias: FormControl<string[]>;
  horaInicio: FormControl<string>;
  horaFin: FormControl<string>;
}

/** Representa una franja semanal mediante un formulario estrictamente tipado. */
export type FormularioFranjaActividadModulo = FormGroup<ControlesFranjaActividadModulo>;

/** Reúne los controles comunes y especializados que puede presentar el modal. */
export interface ControlesFormularioNodoFlujo {
  titulo: FormControl<string>;
  descripcion: FormControl<string>;
  criteriosAceptacion: FormArray<FormControl<string>>;
  nombresRoles: FormControl<string>;
  permisosRoles: FormControl<PermisoRolModulo[]>;
  usuariosConcurrentes: FormControl<string>;
  horariosMayorActividad: FormArray<FormularioFranjaActividadModulo>;
  datosCapturados: FormControl<string>;
  camposObligatorios: FormControl<string>;
  resultadoCompletado: FormControl<string>;
}

/** Representa el formulario completo utilizado para crear o editar cualquier nodo. */
export type FormularioNodoFlujoProyecto = FormGroup<ControlesFormularioNodoFlujo>;
