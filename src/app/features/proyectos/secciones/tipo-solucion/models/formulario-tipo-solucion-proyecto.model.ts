import { FormGroup } from '@angular/forms';
import { ControlesFormularioPlano } from '../../../../../shared/forms/models';
import { PlataformaSolucion } from './tipo-solucion-proyecto.model';

/** Describe los valores editables antes de completar la definición del tipo de solución. */
export interface ValoresFormularioTipoSolucionProyecto {
  tieneInterfaz: boolean | null;
  plataforma: PlataformaSolucion | null;
}

/** Deriva los controles desde los valores editables del formulario. */
export type ControlesFormularioTipoSolucionProyecto =
  ControlesFormularioPlano<ValoresFormularioTipoSolucionProyecto>;

/** Identifica los controles disponibles en la definición del tipo de solución. */
export type CampoTipoSolucionProyecto = keyof ControlesFormularioTipoSolucionProyecto;

/** Mantiene el formulario de Tipo de solución estrictamente tipado. */
export type FormularioTipoSolucionProyectoTipado =
  FormGroup<ControlesFormularioTipoSolucionProyecto>;
