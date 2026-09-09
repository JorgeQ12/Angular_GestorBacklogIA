import type { OpcionSelector } from '../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';

export enum ModoUbicacionRequisito { Existente = 'existente', NuevaSeccion = 'nuevaSeccion', NuevaArea = 'nuevaArea' }
export interface RequisitoProyecto {
  readonly id: number; readonly codigo: string; readonly area: string; readonly seccion: string;
  readonly titulo: string; readonly descripcion: string; readonly transversal: boolean;
  readonly responsable: string; readonly nombreResponsable: string | null; readonly validador: string;
  readonly aplica: boolean; readonly tipo: string; readonly agrupador: string; readonly orden: number;
  readonly cumple: boolean;
}
export interface SeccionRequisitos { readonly nombre: string; readonly requisitos: readonly RequisitoProyecto[]; }
export interface AreaRequisitos { readonly nombre: string; readonly total: number; readonly secciones: readonly SeccionRequisitos[]; }
export interface CatalogoRequisitos {
  readonly areas: readonly { readonly id: number; readonly nombre: string; readonly secciones: readonly { readonly id: number; readonly nombre: string }[] }[];
  readonly tipos: readonly OpcionSelector[]; readonly responsables: readonly OpcionSelector[];
  readonly validadores: readonly OpcionSelector[]; readonly agrupadores: readonly OpcionSelector[];
  readonly nombresResponsables: Readonly<Record<string, string | null>>;
}
export interface ActualizacionRequisito { readonly cumple: boolean; readonly aplica: boolean; readonly nombreResponsable: string | null; readonly transversal: boolean; }
export interface CreacionRequisito {
  readonly area: string; readonly seccion: string; readonly tipoRequisito: string; readonly nombre: string;
  readonly descripcion: string; readonly transversal: boolean; readonly responsable: string;
  readonly nombreResponsable: string | null; readonly validador: string; readonly aplica: boolean;
  readonly cumple: boolean; readonly agrupador: string;
}