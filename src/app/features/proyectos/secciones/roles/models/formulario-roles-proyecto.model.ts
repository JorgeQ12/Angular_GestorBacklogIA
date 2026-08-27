import { FormArray, FormGroup } from '@angular/forms';
import { ControlesFormularioPlano } from '../../../../../shared/forms/models';
import { RolProyecto } from './roles-proyecto.model';

/** Deriva los controles requeridos por cada rol del proyecto. */
export type ControlesRolProyecto = ControlesFormularioPlano<RolProyecto>;

/** Representa la colección dinámica administrada por el formulario de Roles. */
export interface ControlesFormularioRolesProyecto {
  roles: FormArray<FormGroup<ControlesRolProyecto>>;
}

/** Mantiene el formulario de Roles estrictamente tipado. */
export type FormularioRolesProyectoTipado = FormGroup<ControlesFormularioRolesProyecto>;
