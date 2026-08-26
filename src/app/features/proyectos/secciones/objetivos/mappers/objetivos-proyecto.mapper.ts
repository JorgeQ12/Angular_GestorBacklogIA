import {
  deserializarObjetoJson,
  obtenerTextoJson,
} from '../../../../../shared/serializacion/json/lector-json';
import { ObjetivosProyecto } from '../models/objetivos-proyecto.model';

/** Recupera Objetivos desde su contrato canónico en español. */
export function deserializarObjetivosProyecto(json: string): ObjetivosProyecto | null {
  const datos = deserializarObjetoJson(json);
  const objetivoGeneral = obtenerTextoJson(datos, 'objetivoGeneral');
  const objetivosEspecificos = obtenerListaTextos(datos['objetivosEspecificos']);

  if (objetivoGeneral === null && objetivosEspecificos === null) return null;

  return {
    objetivoGeneral: objetivoGeneral ?? '',
    objetivosEspecificos: objetivosEspecificos ?? [],
  };
}

/** Produce el contrato canónico en español para actualizar el borrador. */
export function serializarObjetivosProyecto(objetivos: ObjetivosProyecto): string {
  return JSON.stringify({
    objetivoGeneral: objetivos.objetivoGeneral.trim(),
    objetivosEspecificos: objetivos.objetivosEspecificos.map((objetivo) => objetivo.trim()),
  });
}

function obtenerListaTextos(valor: unknown): readonly string[] | null {
  if (!Array.isArray(valor)) return null;
  return valor
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim());
}
