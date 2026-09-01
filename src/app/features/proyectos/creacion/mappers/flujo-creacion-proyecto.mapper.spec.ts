import { describe, expect, it } from 'vitest';
import {
  AccionPermisoModulo,
  FlujoProyecto,
  TipoBloqueFlujo,
} from '../../secciones/flujo/models/flujo-proyecto.model';
import { sincronizarRolesDelFlujo } from './flujo-creacion-proyecto.mapper';

describe('sincronizarRolesDelFlujo', () => {
  it('carga en un flujo vacío los roles definidos en la sección anterior', () => {
    const resultado = sincronizarRolesDelFlujo(
      FLUJO_VACIO,
      {
        roles: [
          { nombre: 'Administrador', descripcion: 'Configura la solución.' },
          { nombre: 'Consulta', descripcion: 'Consulta información.' },
        ],
      },
      FECHA,
    );

    expect(resultado.roles).toEqual([
      expect.objectContaining({ nombre: 'Administrador', fechaCreacion: FECHA }),
      expect.objectContaining({ nombre: 'Consulta', fechaCreacion: FECHA }),
    ]);
    expect(resultado.roles[0].id).toMatch(/^rol-proyecto-/);
    expect(resultado.roles[1].id).not.toBe(resultado.roles[0].id);
  });

  it('conserva la identidad existente y elimina asignaciones de roles retirados', () => {
    const resultado = sincronizarRolesDelFlujo(
      crearFlujoConAsignaciones(),
      {
        roles: [{ nombre: ' administrador ', descripcion: 'Configura la solución.' }],
      },
      FECHA,
    );

    expect(resultado.roles).toEqual([
      { id: 'rol-administrador', nombre: 'administrador', fechaCreacion: FECHA },
    ]);
    expect(resultado.nodos[0].idsRoles).toEqual(['rol-administrador']);
    expect(resultado.nodos[0]).toMatchObject({
      datos: {
        permisosRoles: [
          { idRol: 'rol-administrador', permisos: [AccionPermisoModulo.Ver] },
        ],
      },
    });
  });
});

const FECHA = '2026-08-28T10:00:00.000Z';

const FLUJO_VACIO: FlujoProyecto = {
  proyectoId: '42',
  roles: [],
  nodos: [],
  conexiones: [],
  fechaActualizacion: FECHA,
};

function crearFlujoConAsignaciones(): FlujoProyecto {
  return {
    proyectoId: '42',
    roles: [
      { id: 'rol-administrador', nombre: 'Administrador', fechaCreacion: FECHA },
      { id: 'rol-obsoleto', nombre: 'Obsoleto', fechaCreacion: FECHA },
    ],
    nodos: [
      {
        id: 'nodo-1',
        tipo: TipoBloqueFlujo.Modulo,
        titulo: 'Administración',
        descripcion: 'Configura el sistema.',
        criteriosAceptacion: ['Permite configurar.'],
        posicion: { x: 100, y: 100 },
        idsRoles: ['rol-administrador', 'rol-obsoleto'],
        fechaCreacion: FECHA,
        fechaActualizacion: FECHA,
        datos: {
          permisosRoles: [
            { idRol: 'rol-administrador', permisos: [AccionPermisoModulo.Ver] },
            { idRol: 'rol-obsoleto', permisos: [AccionPermisoModulo.Editar] },
          ],
          usuariosConcurrentes: '20',
          horariosMayorActividad: [],
        },
      },
    ],
    conexiones: [],
    fechaActualizacion: FECHA,
  };
}
