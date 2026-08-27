import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ControlesFormularioPlano } from '../../../../../shared/forms/models';
import { IntegranteEquipoProyecto } from './equipo-proyecto.model';

/** Deriva los controles requeridos por cada integrante del equipo. */
export type ControlesIntegranteEquipoProyecto = ControlesFormularioPlano<IntegranteEquipoProyecto>;

/** Representa la colección importada que administra el formulario de Equipo. */
export interface ControlesFormularioEquipoProyecto {
  integrantes: FormArray<FormGroup<ControlesIntegranteEquipoProyecto>>;
}

/** Mantiene el formulario de Equipo estrictamente tipado. */
export type FormularioEquipoProyectoTipado = FormGroup<ControlesFormularioEquipoProyecto>;

/** Representa los valores opcionales aplicables a varios integrantes. */
export interface ControlesAsignacionMasivaEquipoProyecto {
  perfilTecnicoCodigo: FormControl<string>;
  dedicacionCodigo: FormControl<string>;
}

/** Limita los filtros disponibles para revisar el estado del equipo. */
export enum FiltroEquipoProyecto {
  Todos = 'todos',
  Pendientes = 'pendientes',
  Configurados = 'configurados',
}
