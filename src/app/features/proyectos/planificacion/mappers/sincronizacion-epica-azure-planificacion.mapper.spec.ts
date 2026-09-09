import { mapearResultadoSincronizacionEpicaAzurePlanificacion } from './sincronizacion-epica-azure-planificacion.mapper';

describe('mapearResultadoSincronizacionEpicaAzurePlanificacion', () => {
  it('adapta la revisión actual y conserva la identidad de la épica sincronizada', () => {
    expect(
      mapearResultadoSincronizacionEpicaAzurePlanificacion({
        epicaId: 15,
        azureWorkItemId: 1204,
        revisionesImportadas: 3,
        azureRevisionActual: 9,
        fechaSincronizacion: '2026-09-04T15:00:00Z',
        urlEpica: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
      }),
    ).toEqual({
      epicaId: 15,
      azureWorkItemId: 1204,
      revisionesImportadas: 3,
      revisionAzureActual: 9,
      fechaSincronizacion: '2026-09-04T15:00:00Z',
      urlEpica: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
    });
  });
});
