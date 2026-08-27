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
    const perfilTecnicoCodigo = obtenerTextoJson(dato, 'perfilTecnicoCodigo');
    const dedicacionCodigo = obtenerTextoJson(dato, 'dedicacionCodigo');
    const esAdministradorAzure = dato['esAdministradorAzure'];
    if (idAzure === null || nombre === null || typeof esAdministradorAzure !== 'boolean') {
      return null;
    }

    integrantes.push({
      idAzure,
      nombre,
      correo,
      esAdministradorAzure,
      perfilTecnicoCodigo: perfilTecnicoCodigo ?? '',
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
      perfilTecnicoCodigo: integrante.perfilTecnicoCodigo.trim(),
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
        perfilTecnicoCodigo: guardado?.perfilTecnicoCodigo ?? '',
        dedicacionCodigo: guardado?.dedicacionCodigo ?? '',
      };
    }),
  };
}

function esObjetoJson(valor: unknown): valor is ObjetoJson {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}
