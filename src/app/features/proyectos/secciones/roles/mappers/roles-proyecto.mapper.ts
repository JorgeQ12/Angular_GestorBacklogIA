import {
  ObjetoJson,
  deserializarListaJson,
  obtenerTextoJson,
} from '../../../../../shared/serializacion/json/lector-json';
import { RolProyecto, RolesProyecto } from '../models/roles-proyecto.model';

/** Recupera Roles desde su contrato canónico en español. */
export function deserializarRolesProyecto(json: string): RolesProyecto | null {
  const datos = deserializarListaJson(json);
  if (datos === null) return null;

  const roles: RolProyecto[] = [];
  for (const dato of datos) {
    if (!esObjetoJson(dato)) return null;

    const nombre = obtenerTextoJson(dato, 'nombre');
    const descripcion = obtenerTextoJson(dato, 'descripcion');
    if (nombre === null && descripcion === null) return null;

    roles.push({ nombre: nombre ?? '', descripcion: descripcion ?? '' });
  }

  return { roles };
}

/** Produce el contrato canónico en español para actualizar el borrador. */
export function serializarRolesProyecto(datos: RolesProyecto): string {
  return JSON.stringify(
    datos.roles.map((rol) => ({
      nombre: rol.nombre.trim(),
      descripcion: rol.descripcion.trim(),
    })),
  );
}

function esObjetoJson(valor: unknown): valor is ObjetoJson {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}
