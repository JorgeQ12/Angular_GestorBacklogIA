import { ResumenAdministrativoDto } from '../models/resumen-administrativo.dto';
import { mapearResumenInicioPanel } from './resumen-inicio-panel.mapper';

const DTO: ResumenAdministrativoDto = {
  fechaCorte: '2026-08-24',
  totalProyectos: 1,
  nuevos: 0,
  activos: 1,
  finalizados: 0,
  cerrados: 0,
  conBacklog: 1,
  pendientesBacklog: 0,
  vencidos: 1,
  proximosAVencer: 0,
  requierenAtencion: 1,
  totalBorradores: 2,
  atencion: [
    {
      id: 1,
      nombre: 'Proyecto crítico',
      responsable: 'Aleja',
      estado: 'Activo',
      prioridad: 'Alta',
      fechaObjetivo: '2026-08-21',
      tieneBacklog: true,
      fechaCreacion: '2026-08-20T17:41:20.833',
      motivoAtencion: 'Fecha objetivo vencida',
    },
  ],
  recientes: [],
  borradoresRecientes: [
    {
      id: 2,
      nombre: 'Proyecto en definición',
      responsable: 'Jorge',
      pasoActual: 3,
      revisionEdicion: 1,
      fechaUltimoGuardado: '2026-08-24T10:00:00',
    },
  ],
};

describe('mapearResumenInicioPanel', () => {
  it('adapta los totales y colecciones al modelo de la interfaz', () => {
    const resumen = mapearResumenInicioPanel(DTO);

    expect(resumen.fechaCorte).toBe('2026-08-24');
    expect(resumen.totalBorradores).toBe(2);
    expect(resumen.indicadores.totalProyectos).toBe(1);
    expect(resumen.indicadores.requierenAtencion).toBe(1);
    expect(resumen.proyectosAtencion[0]?.motivoAtencion).toBe('Fecha objetivo vencida');
    expect(resumen.borradoresRecientes[0]?.pasoActual).toBe(3);
  });
});
