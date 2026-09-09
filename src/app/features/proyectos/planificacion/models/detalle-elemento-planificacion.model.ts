import type { OpcionCatalogo } from '../../../../core/catalogos/models/opcion-catalogo.model';
import type { ControlesFormularioPlano } from '../../../../shared/forms/models/controles-formulario.model';
import { TipoElementoPlanificacion } from './planificacion-proyecto.model';

/** Modos explícitos del formulario reutilizado para consultar y modificar elementos. */
export enum ModoEditorElementoPlanificacion {
  Consulta = 'consulta',
  Creacion = 'creacion',
  Edicion = 'edicion',
}

/** Identifica por qué un elemento dejó de estar vigente. */
export enum MotivoInactivacionElementoPlanificacion {
  Eliminacion = 'eliminacion',
  GeneracionIa = 'generarConIA',
  Legado = 'legado',
}

/** Tipos que representan ítems persistibles; la lista de requisitos es un contenedor. */
export type TipoItemPlanificacion = Exclude<
  TipoElementoPlanificacion,
  TipoElementoPlanificacion.ListaRequisitos
>;

export interface CapacidadesDetalleElementoPlanificacion {
  readonly puedeEditar: boolean;
  readonly puedeVerHistorial: boolean;
  readonly puedeSincronizar: boolean;
  readonly soloLectura: boolean;
}

interface DetalleElementoBase {
  readonly tipo: TipoItemPlanificacion;
  readonly id: number;
  readonly proyectoId: number;
  readonly urlAzure: string | null;
  readonly activo: boolean;
  readonly numeroVersion: number;
  readonly titulo: string;
  readonly descripcion: string;
  readonly estimacionHoras: number;
  readonly fechaInicio: string;
  readonly fechaFinal: string;
  readonly fechaCreacion: string;
  readonly fechaInactivacion: string | null;
  readonly motivoInactivacion: MotivoInactivacionElementoPlanificacion | null;
  readonly capacidades: CapacidadesDetalleElementoPlanificacion;
}

export interface DetalleElementoPlanificacion extends DetalleElementoBase {
  readonly alcance: string;
  readonly riesgos: string;
  readonly criteriosExito: string;
  readonly prioridadCatalogoId: number | null;
  readonly riesgoCatalogoId: number | null;
  readonly objetivo: string;
  readonly criteriosAceptacion: string;
  readonly dependencias: string;
  readonly actividadCatalogoId: number | null;
  readonly complejidad: number;
  readonly prioridad: number;
  readonly discusion: string;
  readonly responsable: string;
  readonly requisito: string;
}

/** Valor plano administrado por el formulario único de elementos. */
export interface ValoresFormularioElementoPlanificacion {
  readonly titulo: string;
  readonly descripcion: string;
  readonly alcance: string;
  readonly riesgos: string;
  readonly criteriosExito: string;
  readonly prioridadCatalogoId: number | null;
  readonly riesgoCatalogoId: number | null;
  readonly objetivo: string;
  readonly criteriosAceptacion: string;
  readonly dependencias: string;
  readonly actividadCatalogoId: number | null;
  readonly complejidad: number;
  readonly prioridad: number;
  readonly discusion: string;
  readonly responsable: string;
  readonly requisito: string;
  readonly estimacionHoras: number | null;
  readonly fechaInicio: string;
  readonly fechaFinal: string;
}

export type FormularioElementoPlanificacion = ControlesFormularioPlano<ValoresFormularioElementoPlanificacion>;
export type CampoFormularioElementoPlanificacion = keyof FormularioElementoPlanificacion;

/** Agrupa únicamente los catálogos que puede necesitar el tipo presentado. */
export interface CatalogosFormularioElementoPlanificacion {
  readonly prioridades: readonly OpcionCatalogo[];
  readonly riesgos: readonly OpcionCatalogo[];
  readonly actividadesTarea: readonly OpcionCatalogo[];
  readonly actividadesRequisito: readonly OpcionCatalogo[];
}

/** Identifica el flujo abierto y su relación con el árbol. */
export interface ContextoEditorElementoPlanificacion {
  readonly modo: ModoEditorElementoPlanificacion;
  readonly tipo: TipoItemPlanificacion;
  readonly proyectoId: number;
  readonly versionPlanificacionId: number | null;
  readonly padreId: number | null;
  readonly elementoId: number | null;
}

/** Describe el hijo que debe crearse desde una identidad padre del árbol. */
export interface CreacionElementoDesdeArbol {
  readonly tipo: TipoItemPlanificacion;
  readonly padreId: number;
}

/** Resume los elementos inactivados por una eliminación lógica. */
export interface ResultadoEliminacionElementoPlanificacion {
  readonly elementoId: number;
  readonly totalInactivados: number;
}
