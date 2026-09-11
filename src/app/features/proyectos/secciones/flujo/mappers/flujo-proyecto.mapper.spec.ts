import {
  AccionPermisoModulo,
  DiaSemanaFlujo,
  FlujoProyecto,
  LadoConexionFlujo,
  TipoBloqueFlujo,
} from '../models/flujo-proyecto.model';
import {
  crearFlujoProyectoVacio,
  deserializarFlujoProyecto,
  serializarFlujoProyecto,
} from './flujo-proyecto.mapper';

describe('flujo-proyecto.mapper', () => {
  it('crea un flujo vacío para un borrador sin diagrama', () => {
    expect(deserializarFlujoProyecto('{}', 42)).toEqual(
      jasmine.objectContaining({
        proyectoId: '42',
        roles: [],
        nodos: [],
        conexiones: [],
      }),
    );
  });

  it('serializa y recupera el contrato completo del editor', () => {
    const flujo = crearFlujoValido();

    expect(deserializarFlujoProyecto(serializarFlujoProyecto(flujo), 42)).toEqual(flujo);
  });

  it('rechaza estructuras no canónicas con bloques en lugar de nodos', () => {
    const json = JSON.stringify({
      proyectoId: '42',
      roles: [],
      bloques: [],
      conexiones: [],
      fechaActualizacion: '2026-08-28T10:00:00.000Z',
    });

    expect(deserializarFlujoProyecto(json, 42)).toBeNull();
  });

  it('rechaza valores externos que no pertenecen a los enums del contrato', () => {
    const flujo = crearFlujoValido();
    const modulo = {
      ...flujo.nodos[0],
      tipo: TipoBloqueFlujo.Modulo,
      datos: {
        permisosRoles: [
          { idRol: 'rol-1', permisos: [AccionPermisoModulo.Ver] },
        ],
        usuariosConcurrentes: '10',
        horariosMayorActividad: [
          { dias: ['Festivo'], horaInicio: '08:00', horaFin: '17:00' },
        ],
      },
    };

    expect(
      deserializarFlujoProyecto(
        JSON.stringify({ ...flujo, nodos: [modulo] }),
        42,
      ),
    ).toBeNull();
    expect(
      deserializarFlujoProyecto(
        JSON.stringify({
          ...flujo,
          conexiones: [{ ...flujo.conexiones[0], ladoDestino: 'centro' }],
        }),
        42,
      ),
    ).toBeNull();
  });

  it('admite los valores enumerados en franjas y conexiones', () => {
    const flujo = crearFlujoValido();
    flujo.nodos = [
      {
        ...flujo.nodos[0],
        tipo: TipoBloqueFlujo.Modulo,
        datos: {
          permisosRoles: [
            { idRol: 'rol-1', permisos: [AccionPermisoModulo.Editar] },
          ],
          usuariosConcurrentes: '10',
          horariosMayorActividad: [
            {
              dias: [DiaSemanaFlujo.Lunes, DiaSemanaFlujo.Miercoles],
              horaInicio: '08:00',
              horaFin: '17:00',
            },
          ],
        },
      },
    ];
    flujo.conexiones[0].ladoDestino = LadoConexionFlujo.Izquierda;

    expect(deserializarFlujoProyecto(serializarFlujoProyecto(flujo), 42)).toEqual(flujo);
  });
});

function crearFlujoValido(): FlujoProyecto {
  return {
    proyectoId: '42',
    roles: [{ id: 'rol-1', nombre: 'Administrador', fechaCreacion: '2026-08-28T10:00:00.000Z' }],
    nodos: [
      {
        id: 'nodo-1',
        tipo: TipoBloqueFlujo.Accion,
        titulo: 'Consultar proyecto',
        descripcion: 'Abre la información del proyecto.',
        criteriosAceptacion: ['El proyecto está disponible.'],
        posicion: { x: 120, y: 80 },
        idsRoles: ['rol-1'],
        fechaCreacion: '2026-08-28T10:00:00.000Z',
        fechaActualizacion: '2026-08-28T10:00:00.000Z',
        datos: {},
      },
    ],
    conexiones: [
      {
        id: 'conexion-1',
        idBloqueOrigen: 'nodo-1',
        idBloqueDestino: 'nodo-2',
        etiqueta: undefined,
        ladoDestino: undefined,
        fechaCreacion: '2026-08-28T10:00:00.000Z',
      },
    ],
    fechaActualizacion: '2026-08-28T10:00:00.000Z',
  };
}

describe('flujo-proyecto.mapper - cobertura ampliada', () => {
  describe('crearFlujoProyectoVacio', () => {
    it('convierte un identificador numérico en cadena', () => {
      const flujo = crearFlujoProyectoVacio(7);

      expect(flujo).toEqual(
        jasmine.objectContaining({ proyectoId: '7', roles: [], nodos: [], conexiones: [] }),
      );
      expect(typeof flujo.fechaActualizacion).toBe('string');
    });

    it('acepta un identificador ya expresado como cadena', () => {
      expect(crearFlujoProyectoVacio('abc').proyectoId).toBe('abc');
    });
  });

  describe('deserializarFlujoProyecto', () => {
    it('crea un flujo vacío cuando el JSON está en blanco', () => {
      expect(deserializarFlujoProyecto('   ', 3)).toEqual(
        jasmine.objectContaining({ proyectoId: '3', roles: [], nodos: [], conexiones: [] }),
      );
    });

    it('rechaza un flujo sin proyectoId de tipo cadena', () => {
      const json = JSON.stringify({
        proyectoId: 42,
        roles: [],
        nodos: [],
        conexiones: [],
        fechaActualizacion: '2026-08-28T10:00:00.000Z',
      });

      expect(deserializarFlujoProyecto(json, 42)).toBeNull();
    });

    it('rechaza un flujo sin fechaActualizacion de tipo cadena', () => {
      const json = JSON.stringify({
        proyectoId: '42',
        roles: [],
        nodos: [],
        conexiones: [],
        fechaActualizacion: 1234,
      });

      expect(deserializarFlujoProyecto(json, 42)).toBeNull();
    });

    it('rechaza un flujo cuyos roles no son un arreglo', () => {
      const json = JSON.stringify({
        proyectoId: '42',
        roles: {},
        nodos: [],
        conexiones: [],
        fechaActualizacion: '2026-08-28T10:00:00.000Z',
      });

      expect(deserializarFlujoProyecto(json, 42)).toBeNull();
    });

    it('rechaza un rol con campos de tipo inválido', () => {
      const json = JSON.stringify({
        proyectoId: '42',
        roles: [{ id: 'rol-1', nombre: 5, fechaCreacion: '2026-08-28T10:00:00.000Z' }],
        nodos: [],
        conexiones: [],
        fechaActualizacion: '2026-08-28T10:00:00.000Z',
      });

      expect(deserializarFlujoProyecto(json, 42)).toBeNull();
    });

    it('rechaza un rol que no es un objeto', () => {
      const json = JSON.stringify({
        proyectoId: '42',
        roles: ['texto'],
        nodos: [],
        conexiones: [],
        fechaActualizacion: '2026-08-28T10:00:00.000Z',
      });

      expect(deserializarFlujoProyecto(json, 42)).toBeNull();
    });

    it('rechaza un nodo cuyo tipo no pertenece al enum', () => {
      const flujo = crearFlujoValido();
      const nodoInvalido = { ...flujo.nodos[0], tipo: 'inexistente' };

      expect(
        deserializarFlujoProyecto(JSON.stringify({ ...flujo, nodos: [nodoInvalido] }), 42),
      ).toBeNull();
    });

    it('rechaza un nodo con propiedades comunes inválidas', () => {
      const flujo = crearFlujoValido();
      const nodoInvalido = { ...flujo.nodos[0], posicion: { x: 'a', y: 1 } };

      expect(
        deserializarFlujoProyecto(JSON.stringify({ ...flujo, nodos: [nodoInvalido] }), 42),
      ).toBeNull();
    });

    it('rechaza un nodo cuyos criterios de aceptación no son cadenas', () => {
      const flujo = crearFlujoValido();
      const nodoInvalido = { ...flujo.nodos[0], criteriosAceptacion: [1, 2] };

      expect(
        deserializarFlujoProyecto(JSON.stringify({ ...flujo, nodos: [nodoInvalido] }), 42),
      ).toBeNull();
    });

    it('preserva los nodos de página y decisión con datos vacíos', () => {
      const flujo = crearFlujoValido();
      flujo.nodos = [
        { ...flujo.nodos[0], id: 'n-pagina', tipo: TipoBloqueFlujo.Pagina, datos: {} },
        { ...flujo.nodos[0], id: 'n-decision', tipo: TipoBloqueFlujo.Decision, datos: {} },
      ];

      const resultado = deserializarFlujoProyecto(serializarFlujoProyecto(flujo), 42);

      expect(resultado?.nodos.map((nodo) => nodo.tipo)).toEqual([
        TipoBloqueFlujo.Pagina,
        TipoBloqueFlujo.Decision,
      ]);
    });

    it('preserva un nodo de componente completo', () => {
      const flujo = crearFlujoValido();
      flujo.nodos = [
        {
          ...flujo.nodos[0],
          tipo: TipoBloqueFlujo.Componente,
          datos: {
            datosCapturados: 'nombre, correo',
            camposObligatorios: 'nombre',
            resultadoCompletado: 'registro creado',
          },
        },
      ];

      expect(deserializarFlujoProyecto(serializarFlujoProyecto(flujo), 42)).toEqual(flujo);
    });

    it('rechaza un nodo de componente con datos incompletos', () => {
      const flujo = crearFlujoValido();
      const nodoInvalido = {
        ...flujo.nodos[0],
        tipo: TipoBloqueFlujo.Componente,
        datos: { datosCapturados: 'x', camposObligatorios: 'y' },
      };

      expect(
        deserializarFlujoProyecto(JSON.stringify({ ...flujo, nodos: [nodoInvalido] }), 42),
      ).toBeNull();
    });

    it('rechaza un nodo de módulo con datos inválidos', () => {
      const flujo = crearFlujoValido();
      const nodoInvalido = {
        ...flujo.nodos[0],
        tipo: TipoBloqueFlujo.Modulo,
        datos: { permisosRoles: [], usuariosConcurrentes: 10, horariosMayorActividad: [] },
      };

      expect(
        deserializarFlujoProyecto(JSON.stringify({ ...flujo, nodos: [nodoInvalido] }), 42),
      ).toBeNull();
    });

    it('rechaza un módulo cuyos permisos de rol no son cadenas válidas', () => {
      const flujo = crearFlujoValido();
      const nodoInvalido = {
        ...flujo.nodos[0],
        tipo: TipoBloqueFlujo.Modulo,
        datos: {
          permisosRoles: [{ idRol: 'rol-1', permisos: ['Volar'] }],
          usuariosConcurrentes: '5',
          horariosMayorActividad: [],
        },
      };

      expect(
        deserializarFlujoProyecto(JSON.stringify({ ...flujo, nodos: [nodoInvalido] }), 42),
      ).toBeNull();
    });

    it('rechaza un módulo cuyos horarios tienen tipos inválidos', () => {
      const flujo = crearFlujoValido();
      const nodoInvalido = {
        ...flujo.nodos[0],
        tipo: TipoBloqueFlujo.Modulo,
        datos: {
          permisosRoles: [],
          usuariosConcurrentes: '5',
          horariosMayorActividad: [
            { dias: [DiaSemanaFlujo.Lunes], horaInicio: 8, horaFin: '17:00' },
          ],
        },
      };

      expect(
        deserializarFlujoProyecto(JSON.stringify({ ...flujo, nodos: [nodoInvalido] }), 42),
      ).toBeNull();
    });

    it('rechaza una conexión que no es un objeto', () => {
      const flujo = crearFlujoValido();

      expect(
        deserializarFlujoProyecto(JSON.stringify({ ...flujo, conexiones: ['x'] }), 42),
      ).toBeNull();
    });

    it('rechaza una conexión con etiqueta de tipo inválido', () => {
      const flujo = crearFlujoValido();
      const conexionInvalida = { ...flujo.conexiones[0], etiqueta: 5 };

      expect(
        deserializarFlujoProyecto(
          JSON.stringify({ ...flujo, conexiones: [conexionInvalida] }),
          42,
        ),
      ).toBeNull();
    });

    it('preserva una conexión con etiqueta y lado destino definidos', () => {
      const flujo = crearFlujoValido();
      flujo.conexiones[0].etiqueta = 'Sí';
      flujo.conexiones[0].ladoDestino = LadoConexionFlujo.Derecha;

      expect(deserializarFlujoProyecto(serializarFlujoProyecto(flujo), 42)).toEqual(flujo);
    });
  });

  describe('serializarFlujoProyecto', () => {
    it('recorta el proyectoId antes de serializar', () => {
      const flujo = crearFlujoValido();
      flujo.proyectoId = '  42  ';

      const serializado = JSON.parse(serializarFlujoProyecto(flujo)) as { proyectoId: string };

      expect(serializado.proyectoId).toBe('42');
    });
  });
});
