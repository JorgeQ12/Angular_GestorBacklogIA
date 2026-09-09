import {
  MotivoBloqueoPublicacionAzure,
  type DisponibilidadPublicacionAzure,
} from '../models/planificacion-proyecto.model';

/** Textos de interacción conservados del flujo de publicación original. */
export const TEXTOS_PUBLICACION_AZURE_PLANIFICACION = {
  titulo: 'Publicar en Azure DevOps',
  descripcionConfirmacion:
    'Se enviarán los work items vigentes de la planificación actual a Azure DevOps.',
  textoConfirmar: 'Publicar',
  disponible: 'Planificación completa · lista para enviar',
  incompleta: 'Completa la planificación para publicar',
  procesando: 'Publicando la planificación…',
} as const;

/** Explica de forma breve por qué la publicación no se encuentra disponible. */
export function obtenerMensajeDisponibilidadPublicacionAzure(
  disponibilidad: DisponibilidadPublicacionAzure,
): string {
  if (disponibilidad.puedePublicar) return TEXTOS_PUBLICACION_AZURE_PLANIFICACION.disponible;

  const mensajes = disponibilidad.bloqueos.map((bloqueo) => {
    switch (bloqueo.motivo) {
      case MotivoBloqueoPublicacionAzure.VersionHistorica:
        return 'Selecciona la versión actual';
      case MotivoBloqueoPublicacionAzure.SinCaracteristicas:
        return 'Crea al menos una característica';
      case MotivoBloqueoPublicacionAzure.CaracteristicasSinHistorias:
        return `${bloqueo.cantidad} característica${bloqueo.cantidad === 1 ? '' : 's'} sin historias`;
      case MotivoBloqueoPublicacionAzure.HistoriasSinTareas:
        return `${bloqueo.cantidad} historia${bloqueo.cantidad === 1 ? '' : 's'} sin tareas`;
    }
  });

  return mensajes.join(' · ') || TEXTOS_PUBLICACION_AZURE_PLANIFICACION.incompleta;
}
