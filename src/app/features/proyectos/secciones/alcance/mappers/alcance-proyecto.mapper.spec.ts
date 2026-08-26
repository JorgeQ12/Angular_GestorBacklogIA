import { deserializarAlcanceProyecto, serializarAlcanceProyecto } from './alcance-proyecto.mapper';

describe('mapeadores de Alcance', () => {
  it('recupera el formato canónico', () => {
    expect(
      deserializarAlcanceProyecto(
        '{"incluido":"Seguimiento de envíos","excluido":"Pagos en línea"}',
      ),
    ).toEqual({
      incluido: 'Seguimiento de envíos',
      excluido: 'Pagos en línea',
    });
  });

  it('rechaza las claves en inglés del contrato anterior', () => {
    expect(
      deserializarAlcanceProyecto(
        '{"included":"Seguimiento de envíos","excluded":"Pagos en línea"}',
      ),
    ).toBeNull();
  });

  it('recupera una definición parcial sin inventar contenido', () => {
    expect(deserializarAlcanceProyecto('{"incluido":"Seguimiento de envíos"}')).toEqual({
      incluido: 'Seguimiento de envíos',
      excluido: '',
    });
  });

  it('tolera JSON vacío o inválido', () => {
    expect(deserializarAlcanceProyecto('{}')).toBeNull();
    expect(deserializarAlcanceProyecto('json-invalido')).toBeNull();
  });

  it('serializa únicamente el contrato canónico y normalizado', () => {
    expect(
      serializarAlcanceProyecto({
        incluido: '  Seguimiento de envíos  ',
        excluido: '  Pagos en línea  ',
      }),
    ).toBe('{"incluido":"Seguimiento de envíos","excluido":"Pagos en línea"}');
  });
});
