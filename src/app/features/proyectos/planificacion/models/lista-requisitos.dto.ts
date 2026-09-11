/** Contrato remoto de un requisito asociado a un proyecto. */
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

/** Envuelve la colección devuelta por la consulta remota. */
export interface ListaRequisitosProyectoDto {
  requisitos: RequisitoProyectoDto[];
}

/** Contrato remoto para actualizar decisiones de cumplimiento. */
export interface ActualizarCumplimientoRequisitoDto {
  cumple: boolean;
  aplica: boolean;
  nombreResponsable: string | null;
  transversal: boolean;
}

/** Representa una sección disponible en el catálogo remoto. */
export interface SeccionCatalogoRequisitoDto {
  id: number;
  nombre: string;
  clasificacionRequisitoId: number;
}

/** Representa un área y sus secciones en el catálogo remoto. */
export interface AreaCatalogoRequisitoDto {
  id: number;
  nombre: string;
  secciones: SeccionCatalogoRequisitoDto[];
}

/** Representa un tipo de requisito administrado por identificador. */
export interface TipoCatalogoRequisitoDto {
  id: number;
  nombre: string;
}

/** Representa una opción textual del catálogo remoto. */
export interface OpcionTextoCatalogoRequisitoDto {
  valor: string;
  nombre: string;
}

/** Extiende la opción de responsable con su nombre sugerido. */
export interface ResponsableCatalogoRequisitoDto extends OpcionTextoCatalogoRequisitoDto {
  nombreSugerido: string | null;
}

/** Agrupa las colecciones necesarias para el formulario remoto. */
export interface CatalogoRequisitosProyectoDto {
  areas: AreaCatalogoRequisitoDto[];
  tiposRequisito: TipoCatalogoRequisitoDto[];
  responsables: ResponsableCatalogoRequisitoDto[];
  validadores: OpcionTextoCatalogoRequisitoDto[];
  agrupadores: OpcionTextoCatalogoRequisitoDto[];
}

/** Contrato remoto para crear un requisito. */
export interface CrearRequisitoProyectoDto {
  area: string;
  seccion: string;
  tipoRequisito: string;
  nombre: string;
  descripcion: string;
  transversal: boolean;
  responsable: string;
  nombreResponsable: string | null;
  validador: string;
  aplica: boolean;
  cumple: boolean;
  agrupador: string;
}

/** La creación devuelve el mismo contrato normalizado por la consulta. */
export type RequisitoProyectoCreadoDto = RequisitoProyectoDto;
