/** Reúne los indicadores agregados proporcionados para el usuario vigente. */
export interface IndicadoresInicioPanel {
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
}

/** Describe un proyecto resumido dentro de las tarjetas del inicio. */
export interface ProyectoInicioPanel {
  id: number | string;
  nombre: string;
  responsable: string;
  estado: string;
  fechaObjetivo: string | null;
  tieneBacklog: boolean;
  motivoAtencion: string | null;
}

/** Describe un proyecto cuya definición puede continuar posteriormente. */
export interface BorradorInicioPanel {
  id: number | string;
  nombre: string;
  responsable: string;
  pasoActual: number;
  fechaUltimoGuardado: string | null;
}

/** Representa el contenido completo del inicio para el usuario vigente. */
export interface ResumenInicioPanel {
  fechaCorte: string | null;
  indicadores: IndicadoresInicioPanel;
  proyectosAtencion: readonly ProyectoInicioPanel[];
  proyectosRecientes: readonly ProyectoInicioPanel[];
  borradoresRecientes: readonly BorradorInicioPanel[];
}

/** Proporciona un estado seguro mientras se integra el resumen real del backend. */
export const RESUMEN_INICIO_PANEL_VACIO: ResumenInicioPanel = {
  fechaCorte: null,
  indicadores: {
    totalProyectos: 0,
    enBorrador: 0,
    enProgreso: 0,
    finalizados: 0,
    cerrados: 0,
    conBacklog: 0,
    pendientesBacklog: 0,
    vencidos: 0,
    proximosAVencer: 0,
    requierenAtencion: 0,
  },
  proyectosAtencion: [],
  proyectosRecientes: [],
  borradoresRecientes: [],
};
