import {
  ObjetoJson,
  deserializarListaJson,
  obtenerTextoJson,
} from '../../../../../shared/serializacion/json/lector-json';
import {
  EquipoProyecto,
  IntegranteEquipoProyecto,
  OrigenEquipoAzureProyecto,
} from '../models/equipo-proyecto.model';
import type { OpcionCatalogo } from '../../../../../core/catalogos/models/opcion-catalogo.model';
import type { OpcionSelector } from '../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';

/** Recupera Equipo desde su contrato canónico en español. */
export function deserializarEquipoProyecto(json: string): EquipoProyecto | null {
  const datos = deserializarListaJson(json);
  if (datos === null) return null;

  const integrantes: IntegranteEquipoProyecto[] = [];
  for (const dato of datos) {
    if (!esObjetoJson(dato)) return null;

    const idAzure = obtenerTextoJson(dato, 'idAzure');
    const nombre = obtenerTextoJson(dato, 'nombre');
    const correo = obtenerTextoJson(dato, 'correo');
    const perfilTecnicoId = dato['perfilTecnicoId'];
    const dedicacionCodigo = obtenerTextoJson(dato, 'dedicacionCodigo');
    const esAdministradorAzure = dato['esAdministradorAzure'];
    if (
      idAzure === null ||
      nombre === null ||
      typeof esAdministradorAzure !== 'boolean' ||
      (perfilTecnicoId !== null &&
        perfilTecnicoId !== undefined &&
        (!Number.isInteger(perfilTecnicoId) || Number(perfilTecnicoId) <= 0))
    ) {
      return null;
    }

    integrantes.push({
      idAzure,
      nombre,
      correo,
      esAdministradorAzure,
      perfilTecnicoId: typeof perfilTecnicoId === 'number' ? perfilTecnicoId : null,
      dedicacionCodigo: dedicacionCodigo ?? '',
    });
  }

  return { integrantes };
}

/** Produce el contrato canónico en español para actualizar el borrador. */
export function serializarEquipoProyecto(datos: EquipoProyecto): string {
  return JSON.stringify(
    datos.integrantes.map((integrante) => ({
      idAzure: integrante.idAzure.trim(),
      nombre: integrante.nombre.trim(),
      correo: integrante.correo?.trim() || null,
      esAdministradorAzure: integrante.esAdministradorAzure,
      perfilTecnicoId: integrante.perfilTecnicoId,
      dedicacionCodigo: integrante.dedicacionCodigo.trim(),
    })),
  );
}

/** Actualiza la identidad desde Azure y conserva las asignaciones realizadas localmente. */
export function combinarEquipoConAzure(
  origen: OrigenEquipoAzureProyecto,
  equipoGuardado: EquipoProyecto,
): EquipoProyecto {
  const guardados = new Map(
    equipoGuardado.integrantes.map((integrante) => [integrante.idAzure, integrante]),
  );

  return {
    integrantes: origen.integrantes.map((integrante) => {
      const guardado = guardados.get(integrante.idAzure);
      return {
        ...integrante,
        perfilTecnicoId: guardado?.perfilTecnicoId ?? integrante.perfilTecnicoId,
        dedicacionCodigo: guardado?.dedicacionCodigo ?? '',
      };
    }),
  };
}

/** Adapta el catálogo remoto al contrato neutral de los selectores de Equipo. */
export function mapearPerfilesTecnicosEquipo(
  opciones: readonly OpcionCatalogo[],
): OpcionSelector[] {
  return opciones.map((opcion) => ({
    valor: opcion.id,
    etiqueta: opcion.nombre,
    descripcion: opcion.descripcion,
  }));
}

function esObjetoJson(valor: unknown): valor is ObjetoJson {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}
