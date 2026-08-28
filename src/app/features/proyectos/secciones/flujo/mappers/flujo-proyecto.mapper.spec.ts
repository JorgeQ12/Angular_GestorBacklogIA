import { describe, expect, it } from 'vitest';
import { FlowBlockType, ProjectWorkflow } from '../models/flujo-proyecto.model';
import {
  crearFlujoProyectoVacio,
  deserializarFlujoProyecto,
  serializarFlujoProyecto,
} from './flujo-proyecto.mapper';

describe('flujo-proyecto.mapper', () => {
  it('crea un flujo vacío para un borrador sin diagrama', () => {
    expect(deserializarFlujoProyecto('{}', 42)).toMatchObject({
      projectId: '42',
      roles: [],
      nodes: [],
      connections: [],
    });
  });

  it('serializa y recupera el contrato completo del editor', () => {
    const flujo = crearFlujoValido();

    expect(deserializarFlujoProyecto(serializarFlujoProyecto(flujo), 42)).toEqual(flujo);
  });

  it('rechaza estructuras anteriores con blocks en lugar de nodes', () => {
    const json = JSON.stringify({
      projectId: '42',
      roles: [],
      blocks: [],
      connections: [],
      updatedAt: '2026-08-28T10:00:00.000Z',
    });

    expect(deserializarFlujoProyecto(json, 42)).toBeNull();
  });
});

function crearFlujoValido(): ProjectWorkflow {
  return {
    projectId: '42',
    roles: [{ id: 'rol-1', name: 'Administrador', createdAt: '2026-08-28T10:00:00.000Z' }],
    nodes: [
      {
        id: 'nodo-1',
        type: FlowBlockType.Action,
        title: 'Consultar proyecto',
        description: 'Abre la información del proyecto.',
        acceptanceCriteria: ['El proyecto está disponible.'],
        position: { x: 120, y: 80 },
        roleIds: ['rol-1'],
        createdAt: '2026-08-28T10:00:00.000Z',
        updatedAt: '2026-08-28T10:00:00.000Z',
        data: {},
      },
    ],
    connections: [],
    updatedAt: '2026-08-28T10:00:00.000Z',
  };
}
