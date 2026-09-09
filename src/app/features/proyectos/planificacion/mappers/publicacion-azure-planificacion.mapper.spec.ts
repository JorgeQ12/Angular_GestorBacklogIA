import {
  crearSolicitudPublicacionAzurePlanificacion,
  mapearResultadoPublicacionAzurePlanificacion,
} from './publicacion-azure-planificacion.mapper';

describe('publicacionAzurePlanificacionMapper', () => {
  it('construye la solicitud mínima sin enviar valores opcionales artificiales', () => {
    expect(crearSolicitudPublicacionAzurePlanificacion(42)).toEqual({ proyectoId: 42 });
  });

  it('adapta el destino y los totales de la publicación', () => {
    expect(
      mapearResultadoPublicacionAzurePlanificacion({
        organizacion: 'Inter Rapidísimo',
        proyectoAzure: 'Gestor IA',
        areaPath: 'Gestor IA\\Producto',
        fechaInicioPublicacion: '2026-09-04T14:00:00Z',
        tipoHistoriaUsuarioAzure: 'User Story',
        totalWorkItems: 11,
        totalEpicas: 1,
        totalCaracteristicas: 2,
        totalHistoriasUsuario: 3,
        totalTareas: 5,
        workItems: [],
      }),
    ).toEqual({
      organizacion: 'Inter Rapidísimo',
      proyecto: 'Gestor IA',
      area: 'Gestor IA\\Producto',
      fechaInicio: '2026-09-04T14:00:00Z',
      totalElementos: 11,
      totalEpicas: 1,
      totalCaracteristicas: 2,
      totalHistorias: 3,
      totalTareas: 5,
    });
  });
});
