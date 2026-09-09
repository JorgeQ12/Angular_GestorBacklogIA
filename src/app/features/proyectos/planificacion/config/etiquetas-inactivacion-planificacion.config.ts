import { MotivoInactivacionElementoPlanificacion } from '../models/detalle-elemento-planificacion.model';

/** Traduce los motivos contractuales de inactivación a textos comprensibles. */
export const ETIQUETAS_MOTIVO_INACTIVACION_PLANIFICACION: Readonly<
  Record<MotivoInactivacionElementoPlanificacion, string>
> = {
  [MotivoInactivacionElementoPlanificacion.Eliminacion]: 'Eliminación manual',
  [MotivoInactivacionElementoPlanificacion.GeneracionIa]: 'Reemplazo mediante IA',
  [MotivoInactivacionElementoPlanificacion.Legado]: 'Información migrada',
};
