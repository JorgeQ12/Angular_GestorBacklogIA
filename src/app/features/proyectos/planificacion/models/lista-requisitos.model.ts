import type { OpcionSelector } from '../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';

/** Define las ubicaciones admitidas al agregar un requisito. */
export enum ModoUbicacionRequisito {
  Existente = 'existente',
  NuevaSeccion = 'nuevaSeccion',
  NuevaArea = 'nuevaArea',
}

/** Representa un requisito normalizado para la interfaz. */
export interface RequisitoProyecto {
  readonly id: number;
  readonly codigo: string;
  readonly area: string;
  readonly seccion: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly transversal: boolean;
  readonly responsable: string;
  readonly nombreResponsable: string | null;
  readonly validador: string;
  readonly aplica: boolean;
  readonly tipo: string;
  readonly agrupador: string;
  readonly orden: number;
  readonly cumple: boolean;
}

/** Agrupa requisitos normalizados bajo una sección. */
export interface SeccionRequisitos {
  readonly nombre: string;
  readonly requisitos: readonly RequisitoProyecto[];
}

/** Resume las secciones y el total pertenecientes a un área. */
export interface AreaRequisitos {
  readonly nombre: string;
  readonly total: number;
  readonly secciones: readonly SeccionRequisitos[];
}

/** Reúne las opciones remotas necesarias para crear requisitos. */
export interface CatalogoRequisitos {
  readonly areas: readonly {
    readonly id: number;
    readonly nombre: string;
    readonly secciones: readonly { readonly id: number; readonly nombre: string }[];
  }[];
  readonly tipos: readonly OpcionSelector[];
  readonly responsables: readonly OpcionSelector[];
  readonly validadores: readonly OpcionSelector[];
  readonly agrupadores: readonly OpcionSelector[];
  readonly nombresResponsables: Readonly<Record<string, string | null>>;
}

/** Contiene los campos editables de un requisito existente. */
export interface ActualizacionRequisito {
  readonly cumple: boolean;
  readonly aplica: boolean;
  readonly nombreResponsable: string | null;
  readonly transversal: boolean;
}

/** Define los datos normalizados para crear un requisito. */
export interface CreacionRequisito {
  readonly area: string;
  readonly seccion: string;
  readonly tipoRequisito: string;
  readonly nombre: string;
  readonly descripcion: string;
  readonly transversal: boolean;
  readonly responsable: string;
  readonly nombreResponsable: string | null;
  readonly validador: string;
  readonly aplica: boolean;
  readonly cumple: boolean;
  readonly agrupador: string;
}

/** Representa el valor plano administrado por el formulario de creación. */
export interface ValoresFormularioCreacionRequisito {
  readonly areaId: number | null;
  readonly areaNombre: string;
  readonly seccionId: number | null;
  readonly seccionNombre: string;
  readonly tipoId: number | null;
  readonly titulo: string;
  readonly descripcion: string;
  readonly responsable: string;
  readonly nombreResponsable: string;
  readonly validador: string;
  readonly agrupador: string;
  readonly transversal: boolean;
  readonly aplica: boolean;
  readonly cumple: boolean;
}
