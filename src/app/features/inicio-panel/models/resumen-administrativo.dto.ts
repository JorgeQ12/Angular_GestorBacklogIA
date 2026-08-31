/** Representa un proyecto resumido dentro de la respuesta administrativa. */
export interface ProyectoAdministrativoDto {
  id: number;
  nombre: string;
  responsable: string;
  estado: string | null;
  prioridad: string | null;
  fechaObjetivo: string | null;
  tieneBacklog: boolean;
  fechaCreacion: string;
  motivoAtencion: string | null;
}

/** Representa un borrador resumido dentro de la respuesta administrativa. */
export interface ProyectoBorradorAdministrativoDto {
  id: number;
  nombre: string;
  responsable: string;
  pasoActual: number;
  revisionEdicion: number;
  fechaUltimoGuardado: string;
}

/** Refleja el contrato entregado por ObtenerResumenAdministrativo. */
export interface ResumenAdministrativoDto {
  fechaCorte: string;
  totalProyectos: number;
  enBorrador: number;
  enProgreso: number;
  finalizados: number;
  cerrados: number;
  conBacklog: number;
  pendientesBacklog: number;
  vencidos: number;
  proximosAVencer: number;
  requierenAtencion: number;
  atencion: readonly ProyectoAdministrativoDto[];
  recientes: readonly ProyectoAdministrativoDto[];
  borradoresRecientes: readonly ProyectoBorradorAdministrativoDto[];
}
