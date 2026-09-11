import { mapearOpcionesCatalogo } from './catalogo.mapper';

describe('mapearOpcionesCatalogo', () => {
  it('adapta únicamente valores activos sin exponer el contrato HTTP', () => {
    expect(
      mapearOpcionesCatalogo([
        {
          id: 32,
          codigo: 'ingeniero_senior_cloud',
          catalogoTipoId: 6,
          catalogoTipoCodigo: 'identidad_perfil_tecnico',
          catalogoTipoNombre: 'Perfil técnico',
          nombre: 'Ingeniero senior cloud',
          descripcion: 'Perfil disponible',
          activo: true,
        },
        {
          id: 33,
          codigo: 'ingeniero_senior',
          catalogoTipoId: 6,
          catalogoTipoCodigo: 'identidad_perfil_tecnico',
          catalogoTipoNombre: 'Perfil técnico',
          nombre: 'Ingeniero senior',
          descripcion: 'Perfil retirado',
          activo: false,
        },
      ]),
    ).toEqual([
      { id: 32, nombre: 'Ingeniero senior cloud', descripcion: 'Perfil disponible' },
    ]);
  });
});
