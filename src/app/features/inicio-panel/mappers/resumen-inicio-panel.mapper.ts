import {
  ProyectoAdministrativoDto,
  ProyectoBorradorAdministrativoDto,
  ResumenAdministrativoDto,
} from '../models/resumen-administrativo.dto';
import {
  BorradorInicioPanel,
  ProyectoInicioPanel,
  ResumenInicioPanel,
} from '../models/resumen-inicio-panel.model';

/** Adapta el contrato administrativo al modelo utilizado por la interfaz. */
export function mapearResumenInicioPanel(dto: ResumenAdministrativoDto): ResumenInicioPanel {
  return {
    fechaCorte: dto.fechaCorte,
    indicadores: {
      totalProyectos: dto.totalProyectos,
      enBorrador: dto.enBorrador,
      enProgreso: dto.enProgreso,
      finalizados: dto.finalizados,
      cerrados: dto.cerrados,
      conBacklog: dto.conBacklog,
      pendientesBacklog: dto.pendientesBacklog,
      vencidos: dto.vencidos,
      proximosAVencer: dto.proximosAVencer,
      requierenAtencion: dto.requierenAtencion,
    },
    proyectosAtencion: dto.atencion.map(mapearProyecto),
    proyectosRecientes: dto.recientes.map(mapearProyecto),
    borradoresRecientes: dto.borradoresRecientes.map(mapearBorrador),
  };
}

function mapearProyecto(dto: ProyectoAdministrativoDto): ProyectoInicioPanel {
  return {
    id: dto.id,
    nombre: dto.nombre,
    responsable: dto.responsable,
    estado: dto.estado ?? 'Sin estado',
    fechaObjetivo: dto.fechaObjetivo,
    tieneBacklog: dto.tieneBacklog,
    motivoAtencion: dto.motivoAtencion,
  };
}

function mapearBorrador(dto: ProyectoBorradorAdministrativoDto): BorradorInicioPanel {
  return {
    id: dto.id,
    nombre: dto.nombre,
    responsable: dto.responsable,
    pasoActual: dto.pasoActual,
    fechaUltimoGuardado: dto.fechaUltimoGuardado,
  };
}
