import { mapearConversacionAsistenteIA } from './asistente-ia.mapper';
import {
  EstadoPropuestaAsistenteIA,
  RolMensajeAsistenteIA,
} from '../models/asistente-ia.model';

describe('asistente-ia.mapper', () => {
  it('adapta una propuesta canónica a detalles legibles para el panel', () => {
    const conversacion = mapearConversacionAsistenteIA({
      proyectoId: 42,
      conversacionId: 7,
      mensajes: [
        {
          id: 9,
          rol: 'Asistente',
          texto: 'Preparé una propuesta.',
          orden: 1,
          fechaCreacion: '2026-09-04T12:00:00Z',
          seccionContexto: 'objetivos',
          revisionContexto: 4,
          propuesta: {
            seccion: 'objetivos',
            resumen: 'Objetivos medibles.',
            contenidoJson:
              '{"objetivoGeneral":"Reducir reprocesos","objetivosEspecificos":["Automatizar validaciones"]}',
            estado: 'Pendiente',
          },
        },
      ],
    });

    const mensaje = conversacion.mensajes[0];
    expect(mensaje?.rol).toBe(RolMensajeAsistenteIA.Asistente);
    expect(mensaje?.propuesta?.estado).toBe(EstadoPropuestaAsistenteIA.Pendiente);
    expect(mensaje?.propuesta?.detalles).toEqual([
      { etiqueta: 'Objetivo general', valores: ['Reducir reprocesos'] },
      { etiqueta: 'Objetivos específicos', valores: ['Automatizar validaciones'] },
    ]);
  });

  it('rechaza roles externos desconocidos en lugar de concederles una identidad válida', () => {
    expect(() =>
      mapearConversacionAsistenteIA({
        proyectoId: 42,
        conversacionId: 7,
        mensajes: [crearMensajeExterno('Sistema', 'Pendiente')],
      }),
    ).toThrowError('Rol desconocido');
  });

  it('rechaza estados externos desconocidos en lugar de habilitar una propuesta pendiente', () => {
    expect(() =>
      mapearConversacionAsistenteIA({
        proyectoId: 42,
        conversacionId: 7,
        mensajes: [crearMensajeExterno('Asistente', 'Archivada')],
      }),
    ).toThrowError('Estado desconocido');
  });
});

function crearMensajeExterno(rol: string, estado: string) {
  return {
    id: 9,
    rol,
    texto: 'Preparé una propuesta.',
    orden: 1,
    fechaCreacion: '2026-09-04T12:00:00Z',
    seccionContexto: 'objetivos',
    revisionContexto: 4,
    propuesta: {
      seccion: 'objetivos',
      resumen: 'Objetivos medibles.',
      contenidoJson: '{"objetivoGeneral":"Reducir","objetivosEspecificos":["Automatizar"]}',
      estado,
    },
  };
}
