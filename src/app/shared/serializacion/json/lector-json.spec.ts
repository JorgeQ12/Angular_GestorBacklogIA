import { deserializarListaJson, deserializarObjetoJson, obtenerTextoJson } from './lector-json';

describe('lector JSON', () => {
  it('recupera un objeto sin asignarle un contrato de dominio', () => {
    expect(deserializarObjetoJson('{"nombre":"InterIA","activo":true}')).toEqual({
      nombre: 'InterIA',
      activo: true,
    });
  });

  it.each(['', 'json-invalido', 'null', '[]', '"texto"'])(
    'tolera un valor no utilizable: %s',
    (json) => {
      expect(deserializarObjetoJson(json)).toEqual({});
    },
  );

  it('recupera y normaliza únicamente propiedades textuales', () => {
    const objeto = deserializarObjetoJson('{"nombre":"  InterIA  ","cantidad":3}');

    expect(obtenerTextoJson(objeto, 'nombre')).toBe('InterIA');
    expect(obtenerTextoJson(objeto, 'cantidad')).toBeNull();
    expect(obtenerTextoJson(objeto, 'inexistente')).toBeNull();
  });

  it('recupera únicamente colecciones JSON', () => {
    expect(deserializarListaJson('[{"nombre":"Administrador"}]')).toEqual([
      { nombre: 'Administrador' },
    ]);
    expect(deserializarListaJson('{}')).toBeNull();
    expect(deserializarListaJson('json-invalido')).toBeNull();
  });
});
