import { FormGroup } from '@angular/forms';
import { ControlesFormularioPlano } from '../../../../../shared/forms/models';
import { NecesidadProyecto } from './necesidad-proyecto.model';

/** Mantiene los controles de Necesidad alineados con su valor de dominio. */
export type ControlesFormularioNecesidadProyecto = ControlesFormularioPlano<NecesidadProyecto>;

/** Identifica los campos disponibles en el formulario de Necesidad. */
export type CampoNecesidadProyecto = keyof ControlesFormularioNecesidadProyecto;

/** Mantiene el formulario de Necesidad estrictamente tipado. */
export type FormularioNecesidadProyectoTipado = FormGroup<ControlesFormularioNecesidadProyecto>;
