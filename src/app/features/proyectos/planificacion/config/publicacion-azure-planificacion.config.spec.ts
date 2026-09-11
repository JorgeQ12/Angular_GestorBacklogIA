import {
  MotivoBloqueoPublicacionAzure,
  type DisponibilidadPublicacionAzure,
} from '../models/planificacion-proyecto.model';
import {
  TEXTOS_PUBLICACION_AZURE_PLANIFICACION,
  obtenerMensajeDisponibilidadPublicacionAzure,
} from './publicacion-azure-planificacion.config';

describe('obtenerMensajeDisponibilidadPublicacionAzure', () => {
  it('devuelve el texto disponible cuando la publicación es viable', () => {
    const disponibilidad: DisponibilidadPublicacionAzure = { puedePublicar: true, bloqueos: [] };

    expect(obtenerMensajeDisponibilidadPublicacionAzure(disponibilidad)).toBe(
      TEXTOS_PUBLICACION_AZURE_PLANIFICACION.disponible,
    );
  });

  it('explica la versión histórica seleccionada', () => {
    expect(
      obtenerMensajeDisponibilidadPublicacionAzure({
        puedePublicar: false,
        bloqueos: [{ motivo: MotivoBloqueoPublicacionAzure.VersionHistorica, cantidad: 0 }],
      }),
    ).toBe('Selecciona la versión actual');
  });

  it('explica la ausencia de características', () => {
    expect(
      obtenerMensajeDisponibilidadPublicacionAzure({
        puedePublicar: false,
        bloqueos: [{ motivo: MotivoBloqueoPublicacionAzure.SinCaracteristicas, cantidad: 0 }],
      }),
    ).toBe('Crea al menos una característica');
  });

  it('usa el singular para una única característica sin historias', () => {
    expect(
      obtenerMensajeDisponibilidadPublicacionAzure({
        puedePublicar: false,
        bloqueos: [
          { motivo: MotivoBloqueoPublicacionAzure.CaracteristicasSinHistorias, cantidad: 1 },
        ],
      }),
    ).toBe('1 característica sin historias');
  });

  it('usa el plural para varias características sin historias', () => {
    expect(
      obtenerMensajeDisponibilidadPublicacionAzure({
        puedePublicar: false,
        bloqueos: [
          { motivo: MotivoBloqueoPublicacionAzure.CaracteristicasSinHistorias, cantidad: 3 },
        ],
      }),
    ).toBe('3 características sin historias');
  });

  it('usa el singular para una única historia sin tareas', () => {
    expect(
      obtenerMensajeDisponibilidadPublicacionAzure({
        puedePublicar: false,
        bloqueos: [{ motivo: MotivoBloqueoPublicacionAzure.HistoriasSinTareas, cantidad: 1 }],
      }),
    ).toBe('1 historia sin tareas');
  });

  it('usa el plural para varias historias sin tareas', () => {
    expect(
      obtenerMensajeDisponibilidadPublicacionAzure({
        puedePublicar: false,
        bloqueos: [{ motivo: MotivoBloqueoPublicacionAzure.HistoriasSinTareas, cantidad: 2 }],
      }),
    ).toBe('2 historias sin tareas');
  });

  it('une varios bloqueos con un separador', () => {
    expect(
      obtenerMensajeDisponibilidadPublicacionAzure({
        puedePublicar: false,
        bloqueos: [
          { motivo: MotivoBloqueoPublicacionAzure.SinCaracteristicas, cantidad: 0 },
          { motivo: MotivoBloqueoPublicacionAzure.HistoriasSinTareas, cantidad: 4 },
        ],
      }),
    ).toBe('Crea al menos una característica · 4 historias sin tareas');
  });

  it('recurre al texto incompleta cuando no hay bloqueos con mensaje', () => {
    expect(
      obtenerMensajeDisponibilidadPublicacionAzure({ puedePublicar: false, bloqueos: [] }),
    ).toBe(TEXTOS_PUBLICACION_AZURE_PLANIFICACION.incompleta);
  });
});
