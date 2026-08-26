import { FormGroup } from '@angular/forms';
import { ControlesFormularioPlano } from '../../../../../shared/forms/models';
import { ContextoProyecto } from './contexto-proyecto.model';

/** Mantiene los controles de Contexto alineados con su valor de dominio. */
export type ControlesFormularioContextoProyecto = ControlesFormularioPlano<ContextoProyecto>;

/** Identifica los campos disponibles en el formulario de Contexto. */
export type CampoContextoProyecto = keyof ControlesFormularioContextoProyecto;

/** Mantiene el formulario de Contexto estrictamente tipado. */
export type FormularioContextoProyectoTipado = FormGroup<ControlesFormularioContextoProyecto>;
