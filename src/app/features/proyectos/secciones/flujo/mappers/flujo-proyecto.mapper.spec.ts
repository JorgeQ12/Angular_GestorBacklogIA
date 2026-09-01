import { describe, expect, it } from 'vitest';
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
    expect(deserializarFlujoProyecto('{}', 42)).toMatchObject({
      proyectoId: '42',
      roles: [],
      nodos: [],
      conexiones: [],
    });
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
        fechaCreacion: '2026-08-28T10:00:00.000Z',
      },
    ],
    fechaActualizacion: '2026-08-28T10:00:00.000Z',
  };
}
