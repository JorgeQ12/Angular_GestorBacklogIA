import {
  deserializarObjetoJson,
  obtenerTextoJson,
} from '../../../../../shared/serializacion/json/lector-json';
import { NecesidadProyecto } from '../models/necesidad-proyecto.model';

/** Recupera Necesidad desde su contrato canónico en español. */
export function deserializarNecesidadProyecto(json: string): NecesidadProyecto | null {
  const datos = deserializarObjetoJson(json);
  const situacionActual = obtenerTextoJson(datos, 'situacionActual');
  const problemas = obtenerTextoJson(datos, 'problemas');
  const impacto = obtenerTextoJson(datos, 'impacto');

  if (situacionActual === null && problemas === null && impacto === null) return null;

  return {
    situacionActual: situacionActual ?? '',
    problemas: problemas ?? '',
    impacto: impacto ?? '',
  };
}

/** Produce el único formato admitido para nuevas actualizaciones de Necesidad. */
export function serializarNecesidadProyecto(necesidad: NecesidadProyecto): string {
  return JSON.stringify({
    situacionActual: necesidad.situacionActual.trim(),
    problemas: necesidad.problemas.trim(),
    impacto: necesidad.impacto.trim(),
  });
}
