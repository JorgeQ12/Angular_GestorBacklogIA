import { FormGroup } from '@angular/forms';
import { ControlesFormularioPlano } from '../../../../../shared/forms/models';
import { AlcanceProyecto } from './alcance-proyecto.model';

/** Mantiene los controles de Alcance alineados con su valor de dominio. */
export type ControlesFormularioAlcanceProyecto = ControlesFormularioPlano<AlcanceProyecto>;

/** Identifica los campos disponibles en el formulario de Alcance. */
export type CampoAlcanceProyecto = keyof ControlesFormularioAlcanceProyecto;

/** Mantiene el formulario de Alcance estrictamente tipado. */
export type FormularioAlcanceProyectoTipado = FormGroup<ControlesFormularioAlcanceProyecto>;
