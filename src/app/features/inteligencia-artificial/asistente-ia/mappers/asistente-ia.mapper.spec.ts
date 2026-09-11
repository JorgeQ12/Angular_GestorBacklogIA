import {
  mapearConversacionAsistenteIA,
  mapearResolucionPropuestaIA,
  mapearRespuestaEnvioAsistenteIA,
} from './asistente-ia.mapper';
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
    ).toThrowError(/Rol desconocido/);
  });

  it('rechaza estados externos desconocidos en lugar de habilitar una propuesta pendiente', () => {
    expect(() =>
      mapearConversacionAsistenteIA({
        proyectoId: 42,
        conversacionId: 7,
        mensajes: [crearMensajeExterno('Asistente', 'Archivada')],
      }),
    ).toThrowError(/Estado desconocido/);
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

describe('asistente-ia.mapper - cobertura ampliada', () => {
  function crearMensajeDto(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: 1,
      rol: 'usuario',
      texto: 'Hola',
      orden: 0,
      fechaCreacion: '2026-09-04T12:00:00Z',
      seccionContexto: null,
      revisionContexto: null,
      propuesta: null,
      ...overrides,
    };
  }

  describe('normalizarRol', () => {
    it('reconoce el rol usuario ignorando mayúsculas', () => {
      const conversacion = mapearConversacionAsistenteIA({
        proyectoId: 1,
        conversacionId: 2,
        mensajes: [crearMensajeDto({ rol: 'USUARIO' })],
      });

      expect(conversacion.mensajes[0]?.rol).toBe(RolMensajeAsistenteIA.Usuario);
    });

    it('reconoce el rol asistente ignorando mayúsculas', () => {
      const conversacion = mapearConversacionAsistenteIA({
        proyectoId: 1,
        conversacionId: 2,
        mensajes: [crearMensajeDto({ rol: 'Asistente' })],
      });

      expect(conversacion.mensajes[0]?.rol).toBe(RolMensajeAsistenteIA.Asistente);
    });
  });

  describe('mapearConversacionAsistenteIA', () => {
    it('conserva la identidad de la conversación y un mensaje sin propuesta', () => {
      const conversacion = mapearConversacionAsistenteIA({
        proyectoId: 42,
        conversacionId: 7,
        mensajes: [
          crearMensajeDto({
            id: 5,
            texto: 'Sin propuesta',
            orden: 3,
            seccionContexto: 'necesidad',
            revisionContexto: 9,
          }),
        ],
      });

      expect(conversacion.proyectoId).toBe(42);
      expect(conversacion.conversacionId).toBe(7);
      expect(conversacion.mensajes[0]).toEqual(
        jasmine.objectContaining({
          id: 5,
          texto: 'Sin propuesta',
          orden: 3,
          seccionContexto: 'necesidad',
          revisionContexto: 9,
          propuesta: null,
        }),
      );
    });

    it('acepta una conversación sin identificador y sin mensajes', () => {
      const conversacion = mapearConversacionAsistenteIA({
        proyectoId: 42,
        conversacionId: null,
        mensajes: [],
      });

      expect(conversacion.conversacionId).toBeNull();
      expect(conversacion.mensajes).toEqual([]);
    });
  });

  describe('mapearRespuestaEnvioAsistenteIA', () => {
    it('adapta los dos turnos confirmados de la interacción', () => {
      const respuesta = mapearRespuestaEnvioAsistenteIA({
        conversacionId: 11,
        mensajeUsuario: crearMensajeDto({ id: 1, rol: 'usuario', texto: 'Pregunta' }),
        mensajeAsistente: crearMensajeDto({ id: 2, rol: 'asistente', texto: 'Respuesta' }),
      });

      expect(respuesta.conversacionId).toBe(11);
      expect(respuesta.mensajeUsuario.rol).toBe(RolMensajeAsistenteIA.Usuario);
      expect(respuesta.mensajeAsistente.rol).toBe(RolMensajeAsistenteIA.Asistente);
    });
  });

  describe('mapearResolucionPropuestaIA', () => {
    it('normaliza el estado aplicada devuelto al resolver', () => {
      const resultado = mapearResolucionPropuestaIA({
        proyectoId: 42,
        mensajeId: 9,
        estado: 'Aplicada',
        revision: 5,
      });

      expect(resultado).toEqual({
        proyectoId: 42,
        mensajeId: 9,
        estado: EstadoPropuestaAsistenteIA.Aplicada,
        revision: 5,
      });
    });

    it('normaliza el estado rechazada devuelto al resolver', () => {
      const resultado = mapearResolucionPropuestaIA({
        proyectoId: 42,
        mensajeId: 9,
        estado: 'RECHAZADA',
        revision: 6,
      });

      expect(resultado.estado).toBe(EstadoPropuestaAsistenteIA.Rechazada);
    });

    it('rechaza un estado externo desconocido al resolver una propuesta', () => {
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

  describe('crearDetallesPropuesta', () => {
    function detallesDe(seccion: string, contenidoJson: string) {
      const conversacion = mapearConversacionAsistenteIA({
        proyectoId: 1,
        conversacionId: 2,
        mensajes: [
          crearMensajeDto({
            rol: 'asistente',
            propuesta: { seccion, resumen: 'r', contenidoJson, estado: 'pendiente' },
          }),
        ],
      });
      return conversacion.mensajes[0]?.propuesta?.detalles;
    }

    it('extrae los campos de la sección necesidad ignorando los vacíos', () => {
      const detalles = detallesDe(
        'necesidad',
        JSON.stringify({
          situacionActual: 'Proceso manual',
          problemas: ['Errores', ''],
          impacto: '',
        }),
      );

      expect(detalles).toEqual([
        { etiqueta: 'Proceso actual', valores: ['Proceso manual'] },
        { etiqueta: 'Problemas', valores: ['Errores'] },
      ]);
    });

    it('extrae los campos de la sección alcance', () => {
      const detalles = detallesDe(
        'ALCANCE',
        JSON.stringify({ incluido: ['Módulo A'], excluido: 'Reportes' }),
      );

      expect(detalles).toEqual([
        { etiqueta: 'Incluido', valores: ['Módulo A'] },
        { etiqueta: 'Excluido', valores: ['Reportes'] },
      ]);
    });

    it('construye detalles de roles usando nombre y descripción', () => {
      const detalles = detallesDe(
        'roles',
        JSON.stringify([
          { nombre: 'Analista', descripcion: 'Define requisitos' },
          { nombre: '', descripcion: '' },
          { descripcion: 'Solo descripción' },
        ]),
      );

      expect(detalles).toEqual([
        { etiqueta: 'Analista', valores: ['Define requisitos'] },
        { etiqueta: 'Rol 3', valores: ['Solo descripción'] },
      ]);
    });

    it('devuelve una lista vacía cuando roles no es un arreglo', () => {
      expect(detallesDe('roles', JSON.stringify({ nombre: 'x' }))).toEqual([]);
    });

    it('devuelve una lista vacía para un rol que no es objeto', () => {
      expect(detallesDe('roles', JSON.stringify(['texto suelto']))).toEqual([]);
    });

    it('devuelve una lista vacía para una sección no reconocida', () => {
      expect(detallesDe('otra', JSON.stringify({ campo: 'valor' }))).toEqual([]);
    });

    it('devuelve una lista vacía cuando el contenido de objetivos no es un objeto', () => {
      expect(detallesDe('objetivos', JSON.stringify(['no', 'objeto']))).toEqual([]);
    });

    it('devuelve una lista vacía cuando el JSON es inválido', () => {
      expect(detallesDe('necesidad', 'no-es-json')).toEqual([]);
    });

    it('descarta valores de arreglo que no son cadenas o están vacíos', () => {
      const detalles = detallesDe(
        'objetivos',
        JSON.stringify({
          objetivoGeneral: '  ',
          objetivosEspecificos: ['Válido', 3, '  ', null],
        }),
      );

      expect(detalles).toEqual([
        { etiqueta: 'Objetivos específicos', valores: ['Válido'] },
      ]);
    });
  });
});
