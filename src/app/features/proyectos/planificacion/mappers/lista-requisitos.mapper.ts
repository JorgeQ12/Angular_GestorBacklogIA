import type {
  CatalogoRequisitosProyectoDto,
  RequisitoProyectoDto,
} from '../models/lista-requisitos.dto';
import type {
  AreaRequisitos,
  CatalogoRequisitos,
  RequisitoProyecto,
} from '../models/lista-requisitos.model';

/** Separa el contrato del backend del modelo consumido por la vista. */
export function mapearRequisitoProyecto(dto: RequisitoProyectoDto): RequisitoProyecto {
  return {
    id: dto.idRequisito,
    codigo: dto.codigo,
    area: dto.area,
    seccion: dto.seccion,
    titulo: dto.nombre,
    descripcion: dto.descripcion,
    transversal: dto.transversal,
    responsable: dto.responsable,
    nombreResponsable: dto.nombreResponsable,
    validador: dto.validador,
    aplica: dto.aplica,
    tipo: dto.tipoRequisito,
    agrupador: dto.agrupador,
    orden: dto.orden,
    cumple: dto.cumple,
  };
}

/** Construye la jerarquía área/sección sin mutar la colección de entrada. */
export function agruparRequisitos(
  requisitos: readonly RequisitoProyecto[],
): readonly AreaRequisitos[] {
  const areas = new Map<string, Map<string, RequisitoProyecto[]>>();

  for (const requisito of requisitos) {
    const secciones = areas.get(requisito.area) ?? new Map<string, RequisitoProyecto[]>();
    secciones.set(requisito.seccion, [...(secciones.get(requisito.seccion) ?? []), requisito]);
    areas.set(requisito.area, secciones);
  }

  return [...areas].map(([nombre, secciones]) => ({
    nombre,
    total: [...secciones.values()].reduce((total, items) => total + items.length, 0),
    secciones: [...secciones].map(([nombreSeccion, items]) => ({
      nombre: nombreSeccion,
      requisitos: items,
    })),
  }));
}

/** Adapta catálogos heterogéneos al selector compartido. */
export function mapearCatalogoRequisitos(dto: CatalogoRequisitosProyectoDto): CatalogoRequisitos {
  const crearOpcion = (item: { valor: string; nombre: string }) => ({
    valor: item.valor,
    etiqueta: item.nombre,
  });

  return {
    areas: dto.areas.map((area) => ({
      id: area.id,
      nombre: area.nombre,
      secciones: area.secciones.map((seccion) => ({
        id: seccion.id,
        nombre: seccion.nombre,
      })),
    })),
    tipos: dto.tiposRequisito.map((item) => ({ valor: item.id, etiqueta: item.nombre })),
    responsables: dto.responsables.map(crearOpcion),
    validadores: dto.validadores.map(crearOpcion),
    agrupadores: dto.agrupadores.map(crearOpcion),
    nombresResponsables: Object.fromEntries(
      dto.responsables.map((item) => [item.valor, item.nombreSugerido]),
    ),
  };
}
