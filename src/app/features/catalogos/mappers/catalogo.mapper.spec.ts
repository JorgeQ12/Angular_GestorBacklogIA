import { mapearCatalogo, mapearValorCatalogo } from './catalogo.mapper';
describe('Mapeo de catálogos', () => {
  it('conserva identidad, nombre y estado inactivo sin generar códigos', () => {
    expect(mapearCatalogo({ id: 51, nombre: 'Áreas', descripcion: '', activo: false })).toEqual({
      id: 51,
      nombre: 'Áreas',
      descripcion: '',
      activo: false,
    });
  });
  it('conserva la relación remota de la opción', () => {
    const dto = {
      id: 83,
      nombre: 'Logística',
      descripcion: 'Operación',
      activo: true,
      catalogoTipoId: 51,
      catalogoTipoNombre: 'Áreas',
    };
    expect(mapearValorCatalogo(dto)).toEqual(dto);
  });
});
