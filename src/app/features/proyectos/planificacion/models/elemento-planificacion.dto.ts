import {
  MotivoInactivacionElementoDto,
  OrigenEpicaDto,
  TipoElementoPlanificacionDto,
  type CapacidadesElementoPlanificacionDto,
} from './planificacion-proyecto.dto';

interface DetalleElementoPlanificacionBaseDto {
  readonly id: number;
  readonly proyectoId: number;
  readonly activo: boolean;
  readonly numeroVersionActual: number;
  readonly titulo: string;
  readonly descripcion: string;
  readonly estimacionHoras: number;
  readonly fechaInicio: string;
  readonly fechaFinal: string;
  readonly fechaCreacion: string;
  readonly fechaInactivacion: string | null;
  readonly motivoInactivacion: MotivoInactivacionElementoDto | null;
  readonly soloLectura: boolean;
  readonly capacidades: CapacidadesElementoPlanificacionDto;
}

/** Refleja el detalle remoto de una épica. */
export interface DetalleEpicaDto extends DetalleElementoPlanificacionBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.Epica;
  readonly origen: OrigenEpicaDto;
  readonly esPrincipal: boolean;
  readonly alcance: string | null;
  readonly riesgos: string | null;
  readonly criteriosExito: string | null;
  readonly prioridadCatalogoId: number | null;
  readonly riesgoCatalogoId: number | null;
  readonly azureWorkItemId: number | null;
  readonly urlAzure: string | null;
}

/** Refleja el detalle remoto de una característica. */
export interface DetalleCaracteristicaDto extends DetalleElementoPlanificacionBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.Caracteristica;
  readonly alcance: string;
}

/** Refleja el detalle remoto de una historia de usuario. */
export interface DetalleHistoriaDto extends DetalleElementoPlanificacionBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.Historia;
  readonly caracteristicaId: number;
  readonly objetivo: string;
  readonly alcance: string;
  readonly criteriosAceptacion: string;
}

/** Refleja el detalle remoto de una tarea. */
export interface DetalleTareaDto extends DetalleElementoPlanificacionBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.Tarea;
  readonly historiaUsuarioId: number;
  readonly dependencias: string;
  readonly actividadCatalogoId: number;
  readonly complejidad: number;
}

/** Refleja el detalle remoto de una actividad asociada a requisitos. */
export interface DetalleActividadRequisitoDto extends DetalleElementoPlanificacionBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.ActividadRequisito;
  readonly listaRequisitosId: number;
  readonly actividadCatalogoId: number;
  readonly prioridad: number;
  readonly discusion: string | null;
  readonly responsable: string | null;
}

/** Refleja el detalle remoto de una tarea asociada a requisitos. */
export interface DetalleTareaRequisitoDto extends DetalleElementoPlanificacionBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.TareaRequisito;
  readonly actividadRequisitoId: number;
  readonly requisito: string | null;
  readonly responsable: string | null;
}

/** Refleja el detalle discriminado que devuelve ObtenerWorkItem. */
export type DetalleElementoPlanificacionDto =
  | DetalleEpicaDto
  | DetalleCaracteristicaDto
  | DetalleHistoriaDto
  | DetalleTareaDto
  | DetalleActividadRequisitoDto
  | DetalleTareaRequisitoDto;

interface SolicitudElementoBaseDto {
  readonly titulo: string;
  readonly descripcion: string;
  readonly estimacionHoras: number | null;
  readonly fechaInicio: string | null;
  readonly fechaFinal: string | null;
}

/** Define las solicitudes discriminadas admitidas al crear elementos. */
export type CrearElementoPlanificacionDto =
  | (SolicitudElementoBaseDto & {
      readonly tipo: TipoElementoPlanificacionDto.Epica;
      readonly proyectoId: number;
      readonly alcance: string | null;
      readonly riesgos: string | null;
      readonly criteriosExito: string | null;
      readonly prioridadCatalogoId: number | null;
      readonly riesgoCatalogoId: number | null;
    })
  | (SolicitudElementoBaseDto & {
      readonly tipo: TipoElementoPlanificacionDto.Caracteristica;
      readonly proyectoId: number;
      readonly epicaId: number;
      readonly alcance: string;
    })
  | (SolicitudElementoBaseDto & {
      readonly tipo: TipoElementoPlanificacionDto.Historia;
      readonly caracteristicaId: number;
      readonly objetivo: string;
      readonly alcance: string;
      readonly criteriosAceptacion: string;
    })
  | (SolicitudElementoBaseDto & {
      readonly tipo: TipoElementoPlanificacionDto.Tarea;
      readonly historiaUsuarioId: number;
      readonly dependencias: string;
      readonly actividadCatalogoId: number;
      readonly complejidad: number;
    })
  | (SolicitudElementoBaseDto & {
      readonly tipo: TipoElementoPlanificacionDto.ActividadRequisito;
      readonly listaRequisitosId: number;
      readonly actividadCatalogoId: number;
      readonly prioridad: number;
      readonly discusion: string | null;
      readonly responsable: string | null;
    })
  | (SolicitudElementoBaseDto & {
      readonly tipo: TipoElementoPlanificacionDto.TareaRequisito;
      readonly actividadRequisitoId: number;
      readonly requisito: string | null;
      readonly responsable: string | null;
    });

/** Deriva las solicitudes de actualización con identidad y control de concurrencia. */
export type ActualizarElementoPlanificacionDto = CrearElementoPlanificacionDto extends infer T
  ? T extends CrearElementoPlanificacionDto
    ? Omit<
        T,
        | 'proyectoId'
        | 'epicaId'
        | 'caracteristicaId'
        | 'historiaUsuarioId'
        | 'listaRequisitosId'
        | 'actividadRequisitoId'
      > & {
        readonly itemTrabajoId: number;
        readonly numeroVersionEsperada: number;
      }
    : never
  : never;

/** Refleja el resultado de la inactivación lógica ejecutada por el backend. */
export interface ResultadoEliminacionElementoPlanificacionDto {
  readonly itemTrabajoId: number;
  readonly totalInactivados: number;
}
