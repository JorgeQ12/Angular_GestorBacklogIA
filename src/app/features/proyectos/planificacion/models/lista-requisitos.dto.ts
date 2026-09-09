export interface RequisitoProyectoDto {
  idRequisito: number;
  codigo: string;
  area: string;
  seccion: string;
  nombre: string;
  descripcion: string;
  transversal: boolean;
  aplica: boolean;
  responsable: string;
  nombreResponsable: string | null;
  validador: string;
  tipoRequisito: string;
  agrupador: string;
  orden: number;
  cumple: boolean;
}

export interface ListaRequisitosProyectoDto { requisitos: RequisitoProyectoDto[]; }
export interface ActualizarCumplimientoRequisitoDto { cumple: boolean; aplica: boolean; nombreResponsable: string | null; transversal: boolean; }
export interface SeccionCatalogoRequisitoDto { id: number; nombre: string; clasificacionRequisitoId: number; }
export interface AreaCatalogoRequisitoDto { id: number; nombre: string; secciones: SeccionCatalogoRequisitoDto[]; }
export interface TipoCatalogoRequisitoDto { id: number; nombre: string; }
export interface OpcionTextoCatalogoRequisitoDto { valor: string; nombre: string; }
export interface ResponsableCatalogoRequisitoDto extends OpcionTextoCatalogoRequisitoDto { nombreSugerido: string | null; }
export interface CatalogoRequisitosProyectoDto {
  areas: AreaCatalogoRequisitoDto[];
  tiposRequisito: TipoCatalogoRequisitoDto[];
  responsables: ResponsableCatalogoRequisitoDto[];
  validadores: OpcionTextoCatalogoRequisitoDto[];
  agrupadores: OpcionTextoCatalogoRequisitoDto[];
}
export interface CrearRequisitoProyectoDto {
  area: string; seccion: string; tipoRequisito: string; nombre: string; descripcion: string;
  transversal: boolean; responsable: string; nombreResponsable: string | null; validador: string;
  aplica: boolean; cumple: boolean; agrupador: string;
}
export interface RequisitoProyectoCreadoDto extends RequisitoProyectoDto {}