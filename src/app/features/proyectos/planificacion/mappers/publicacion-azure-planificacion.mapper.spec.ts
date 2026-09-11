import {
  crearSolicitudPublicacionAzurePlanificacion,
  mapearResultadoPublicacionAzurePlanificacion,
} from './publicacion-azure-planificacion.mapper';
import { TipoElementoPlanificacionDto } from '../models/planificacion-proyecto.dto';

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
        workItems: [
          {
            tipoEntidad: TipoElementoPlanificacionDto.Historia,
            entidadId: 17,
            versionId: 31,
            titulo: 'Consultar estado del envío',
            tipoWorkItemAzure: 'User Story',
            azureWorkItemId: 1204,
            azureRevision: 1,
            url: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
            fechaInicio: '2026-09-04T14:00:00Z',
            fechaFinal: '2026-09-08T22:00:00Z',
          },
        ],
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

  it('rechaza un alias anterior recibido como tipo de entidad publicada', () => {
    expect(() =>
      mapearResultadoPublicacionAzurePlanificacion({
        organizacion: 'Inter Rapidísimo',
        proyectoAzure: 'Gestor IA',
        areaPath: 'Gestor IA\\Producto',
        fechaInicioPublicacion: '2026-09-04T14:00:00Z',
        tipoHistoriaUsuarioAzure: 'User Story',
        totalWorkItems: 1,
        totalEpicas: 0,
        totalCaracteristicas: 0,
        totalHistoriasUsuario: 1,
        totalTareas: 0,
        workItems: [
          {
            tipoEntidad: 'historia' as TipoElementoPlanificacionDto,
            entidadId: 17,
            versionId: 31,
            titulo: 'Consultar estado del envío',
            tipoWorkItemAzure: 'User Story',
            azureWorkItemId: 1204,
            azureRevision: 1,
            url: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
            fechaInicio: '2026-09-04T14:00:00Z',
            fechaFinal: '2026-09-08T22:00:00Z',
          },
        ],
      }),
    ).toThrow('Tipo de entidad publicada no compatible: historia.');
  });
});
