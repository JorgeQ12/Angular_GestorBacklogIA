import {
  mapearConversacionAsistenteIA,
  mapearResolucionPropuestaIA,
  mapearRespuestaEnvioAsistenteIA,
} from './asistente-ia.mapper';
import { EstadoPropuestaAsistenteIA, RolMensajeAsistenteIA } from '../models/asistente-ia.model';

describe('asistente-ia.mapper', () => {
  it('adapta la presentación de una propuesta preparada por el backend', () => {
    const conversacion = mapearConversacionAsistenteIA({
      proyectoId: 42,
      conversacionId: 7,
      mensajes: [
        crearMensajeDto({
          rol: 'Asistente',
          propuesta: {
            seccion: 'objetivos',
            etiquetaSeccion: 'Objetivos',
            campoObjetivo: 'objetivosEspecificos',
            etiquetaObjetivo: 'Objetivos específicos',
            resumen: 'Objetivos medibles.',
            detalles: [
              { etiqueta: 'Objetivos específicos', valores: ['Automatizar validaciones'] },
            ],
            estado: 'Pendiente',
          },
        }),
      ],
    });

    expect(conversacion.mensajes[0]?.propuesta).toEqual({
      seccion: 'objetivos',
      etiquetaSeccion: 'Objetivos',
      campoObjetivo: 'objetivosEspecificos',
      etiquetaObjetivo: 'Objetivos específicos',
      resumen: 'Objetivos medibles.',
      detalles: [{ etiqueta: 'Objetivos específicos', valores: ['Automatizar validaciones'] }],
      estado: EstadoPropuestaAsistenteIA.Pendiente,
    });
  });

  it('conserva una conversación sin identificador ni mensajes', () => {
    const conversacion = mapearConversacionAsistenteIA({
      proyectoId: 42,
      conversacionId: null,
      mensajes: [],
    });

    expect(conversacion).toEqual({ proyectoId: 42, conversacionId: null, mensajes: [] });
  });

  it('adapta los dos turnos confirmados de una interacción', () => {
    const respuesta = mapearRespuestaEnvioAsistenteIA({
      conversacionId: 11,
      mensajeUsuario: crearMensajeDto({ id: 1, rol: 'usuario', texto: 'Pregunta' }),
      mensajeAsistente: crearMensajeDto({ id: 2, rol: 'asistente', texto: 'Respuesta' }),
    });

    expect(respuesta.conversacionId).toBe(11);
    expect(respuesta.mensajeUsuario.rol).toBe(RolMensajeAsistenteIA.Usuario);
    expect(respuesta.mensajeAsistente.rol).toBe(RolMensajeAsistenteIA.Asistente);
  });

  it('rechaza roles externos desconocidos', () => {
    expect(() =>
      mapearConversacionAsistenteIA({
        proyectoId: 42,
        conversacionId: 7,
        mensajes: [crearMensajeDto({ rol: 'Sistema' })],
      }),
    ).toThrowError(/Rol desconocido/);
  });

  it('rechaza estados externos desconocidos', () => {
    expect(() =>
      mapearConversacionAsistenteIA({
        proyectoId: 42,
        conversacionId: 7,
        mensajes: [
          crearMensajeDto({
            propuesta: {
              seccion: 'alcance',
              etiquetaSeccion: 'Alcance',
              campoObjetivo: null,
              etiquetaObjetivo: null,
              resumen: 'Actualiza el alcance.',
              detalles: [],
              estado: 'Archivada',
            },
          }),
        ],
      }),
    ).toThrowError(/Estado desconocido/);
  });

  it('rechaza detalles vacíos en el contrato externo', () => {
    expect(() =>
      mapearConversacionAsistenteIA({
        proyectoId: 42,
        conversacionId: 7,
        mensajes: [
          crearMensajeDto({
            propuesta: {
              seccion: 'alcance',
              etiquetaSeccion: 'Alcance',
              campoObjetivo: null,
              etiquetaObjetivo: null,
              resumen: 'Actualiza el alcance.',
              detalles: [{ etiqueta: 'Incluido', valores: [' '] }],
              estado: 'Pendiente',
            },
          }),
        ],
      }),
    ).toThrowError(/valor de detalle/);
  });

  it('normaliza el estado al resolver una propuesta', () => {
    const resultado = mapearResolucionPropuestaIA({
      proyectoId: 42,
      mensajeId: 9,
      estado: 'APLICADA',
      revision: 5,
    });

    expect(resultado.estado).toBe(EstadoPropuestaAsistenteIA.Aplicada);
  });

  it('rechaza un estado desconocido al resolver una propuesta', () => {
    expect(() =>
      mapearResolucionPropuestaIA({
        proyectoId: 42,
        mensajeId: 9,
        estado: 'archivada',
        revision: 6,
      }),
    ).toThrowError(/Estado desconocido/);
  });
});

function crearMensajeDto(overrides: Record<string, unknown> = {}) {
  return {
    id: 9,
    rol: 'usuario',
    texto: 'Hola',
    orden: 1,
    fechaCreacion: '2026-09-04T12:00:00Z',
    seccionContexto: 'objetivos',
    revisionContexto: 4,
    propuesta: null,
    ...overrides,
  };
}
