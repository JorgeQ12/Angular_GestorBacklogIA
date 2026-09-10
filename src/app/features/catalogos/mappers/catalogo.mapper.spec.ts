import { mapearCatalogo, mapearValorCatalogo } from './catalogo.mapper';
describe('Mapeo de catálogos', () => {
  it('conserva las identidades, el nombre y el estado inactivo', () => {
    expect(
      mapearCatalogo({
        id: 51,
        codigo: 'gestion_areas',
        nombre: 'Áreas',
        descripcion: '',
        activo: false,
      }),
    ).toEqual({
      id: 51,
      codigo: 'gestion_areas',
      nombre: 'Áreas',
      descripcion: '',
      activo: false,
    });
  });
  it('conserva la relación remota de la opción', () => {
    const dto = {
      id: 83,
      codigo: 'areas_logistica',
      nombre: 'Logística',
      descripcion: 'Operación',
      activo: true,
      catalogoTipoId: 51,
      catalogoTipoCodigo: 'gestion_areas',
      catalogoTipoNombre: 'Áreas',
    };
    expect(mapearValorCatalogo(dto)).toEqual(dto);
  });
});
