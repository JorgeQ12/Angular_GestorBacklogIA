import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import {
  ClavePasoEspecialProyecto,
  type ClavePasoProyecto,
} from '../../config/pasos-proyecto.config';

/** Relaciona cada paso visual con el avance persistido por el backend. */
export const AVANCE_BORRADOR_POR_PASO = {
  [ClavePasoEspecialProyecto.VinculacionAzure]: null,
  [ClaveSeccionProyecto.Contexto]: 1,
  [ClaveSeccionProyecto.TipoSolucion]: 2,
  [ClaveSeccionProyecto.Necesidad]: 3,
  [ClaveSeccionProyecto.Objetivos]: 4,
  [ClaveSeccionProyecto.Alcance]: 5,
  [ClaveSeccionProyecto.Roles]: 6,
  [ClaveSeccionProyecto.Equipo]: 7,
  [ClaveSeccionProyecto.Flujo]: 8,
} as const satisfies Record<ClavePasoProyecto, number | null>;
