import { describe, expect, it } from 'vitest';
import { TipoBloqueFlujo, FlujoProyecto } from '../models/flujo-proyecto.model';
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
