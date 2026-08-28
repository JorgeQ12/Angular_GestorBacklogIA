import type { NombreIconoAplicacion } from '../../../../../shared/components/icono/iconos-aplicacion';
import { FlowBlockType } from '../models/flujo-proyecto.model';

/** Relaciona los tipos funcionales del lienzo con la iconografía compartida. */
export const ICONOS_TIPO_BLOQUE_FLUJO = {
  [FlowBlockType.Module]: 'proyectos',
  [FlowBlockType.Screen]: 'aplicacionWeb',
  [FlowBlockType.Action]: 'continuar',
  [FlowBlockType.Decision]: 'flujo',
  [FlowBlockType.Form]: 'contextoProyecto',
} as const satisfies Record<FlowBlockType, NombreIconoAplicacion>;
