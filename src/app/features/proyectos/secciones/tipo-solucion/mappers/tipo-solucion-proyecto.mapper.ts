import { deserializarObjetoJson } from '../../../../../shared/serializacion/json/lector-json';
import { PlataformaSolucion, TipoSolucionProyecto } from '../models/tipo-solucion-proyecto.model';

const PLATAFORMAS: Readonly<Record<string, PlataformaSolucion>> = {
  web: PlataformaSolucion.Web,
  escritorio: PlataformaSolucion.Escritorio,
  movil: PlataformaSolucion.Movil,
};

/** Recupera Tipo de solución desde su contrato canónico en español. */
export function deserializarTipoSolucionProyecto(json: string): TipoSolucionProyecto | null {
  const datos = deserializarObjetoJson(json);
  const tieneInterfaz = datos['tieneInterfaz'];
  if (typeof tieneInterfaz !== 'boolean') return null;

  return {
    tieneInterfaz,
    plataforma: tieneInterfaz ? obtenerPlataforma(datos['plataforma']) : null,
  };
}

/** Produce el único formato admitido para nuevas actualizaciones del borrador. */
export function serializarTipoSolucionProyecto(tipoSolucion: TipoSolucionProyecto): string {
  return JSON.stringify({
    tieneInterfaz: tipoSolucion.tieneInterfaz,
    plataforma: tipoSolucion.tieneInterfaz ? tipoSolucion.plataforma : null,
  });
}

function obtenerPlataforma(valor: unknown): PlataformaSolucion | null {
  if (typeof valor !== 'string') return null;

  const normalizado = valor
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return PLATAFORMAS[normalizado] ?? null;
}
