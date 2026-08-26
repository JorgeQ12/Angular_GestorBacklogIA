import {
  deserializarObjetoJson,
  obtenerTextoJson,
} from '../../../../../shared/serializacion/json/lector-json';
import { AlcanceProyecto } from '../models/alcance-proyecto.model';

/** Recupera Alcance desde su contrato canónico en español. */
export function deserializarAlcanceProyecto(json: string): AlcanceProyecto | null {
  const datos = deserializarObjetoJson(json);
  const incluido = obtenerTextoJson(datos, 'incluido');
  const excluido = obtenerTextoJson(datos, 'excluido');

  if (incluido === null && excluido === null) return null;

  return {
    incluido: incluido ?? '',
    excluido: excluido ?? '',
  };
}

/** Produce el único formato admitido para nuevas actualizaciones de Alcance. */
export function serializarAlcanceProyecto(alcance: AlcanceProyecto): string {
  return JSON.stringify({
    incluido: alcance.incluido.trim(),
    excluido: alcance.excluido.trim(),
  });
}
