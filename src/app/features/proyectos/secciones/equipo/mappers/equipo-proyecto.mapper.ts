import type { OpcionCatalogo } from '../../../../../core/catalogos/models/opcion-catalogo.model';
import type { OpcionSelector } from '../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
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

/** Adapta el catálogo remoto al selector compartido por las asignaciones de Equipo. */
export function mapearOpcionesPerfilTecnico(
  opciones: readonly OpcionCatalogo[],
): readonly OpcionSelector[] {
  return opciones.map((opcion) => ({
    valor: opcion.id,
    etiqueta: opcion.nombre,
    descripcion: opcion.descripcion ?? undefined,
  }));
}

/** Recupera Equipo desde su contrato canónico en español. */
export function deserializarEquipoProyecto(json: string): EquipoProyecto | null {
  const datos = deserializarListaJson(json);
  if (datos === null) return null;

  const integrantes: IntegranteEquipoProyecto[] = [];
  for (const dato of datos) {
    if (!esObjetoJson(dato)) return null;

    const idUsuario = obtenerNumeroEnteroJson(dato, 'idUsuario');
    const idAzure = obtenerTextoJson(dato, 'idAzure');
    const nombre = obtenerTextoJson(dato, 'nombre');
    const correo = obtenerTextoJson(dato, 'correo');
    const perfilTecnicoId = obtenerNumeroEnteroJson(dato, 'perfilTecnicoId');
    const perfilTecnicoNombre = obtenerTextoJson(dato, 'perfilTecnicoNombre');
    const dedicacionCodigo = obtenerTextoJson(dato, 'dedicacionCodigo');
    const esAdministradorAzure = dato['esAdministradorAzure'];
    if (idAzure === null || nombre === null || typeof esAdministradorAzure !== 'boolean') {
      return null;
    }

    integrantes.push({
      idUsuario,
      idAzure,
      nombre,
      correo,
      esAdministradorAzure,
      perfilTecnicoId,
      perfilTecnicoNombre,
      dedicacionCodigo: dedicacionCodigo ?? '',
    });
  }

  return { integrantes };
}

/** Produce el contrato canónico en español para actualizar el borrador. */
export function serializarEquipoProyecto(datos: EquipoProyecto): string {
  return JSON.stringify(
    datos.integrantes.map((integrante) => ({
      idUsuario: integrante.idUsuario,
      idAzure: integrante.idAzure.trim(),
      nombre: integrante.nombre.trim(),
      correo: integrante.correo?.trim() || null,
      esAdministradorAzure: integrante.esAdministradorAzure,
      perfilTecnicoId: integrante.perfilTecnicoId,
      perfilTecnicoNombre: integrante.perfilTecnicoNombre?.trim() || null,
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
        idUsuario: integrante.idUsuario ?? guardado?.idUsuario ?? null,
        perfilTecnicoId: guardado?.perfilTecnicoId ?? integrante.perfilTecnicoId,
        perfilTecnicoNombre: guardado?.perfilTecnicoNombre ?? integrante.perfilTecnicoNombre,
        dedicacionCodigo: guardado?.dedicacionCodigo ?? '',
      };
    }),
  };
}

function esObjetoJson(valor: unknown): valor is ObjetoJson {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

function obtenerNumeroEnteroJson(objeto: ObjetoJson, propiedad: string): number | null {
  const valor = objeto[propiedad];
  return typeof valor === 'number' && Number.isSafeInteger(valor) && valor > 0 ? valor : null;
}
