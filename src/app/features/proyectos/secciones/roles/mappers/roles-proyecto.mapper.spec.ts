import { deserializarRolesProyecto, serializarRolesProyecto } from './roles-proyecto.mapper';

describe('mapeadores de Roles', () => {
  it('recupera el arreglo canónico en español', () => {
    expect(
      deserializarRolesProyecto(
        '[{"nombre":"Administrador","descripcion":"Configura la solución."}]',
      ),
    ).toEqual({
      roles: [{ nombre: 'Administrador', descripcion: 'Configura la solución.' }],
    });
  });

  it('recupera una colección vacía sin inventar roles', () => {
    expect(deserializarRolesProyecto('[]')).toEqual({ roles: [] });
  });

  it('rechaza el contrato anterior en inglés', () => {
    expect(
      deserializarRolesProyecto('[{"name":"Administrator","description":"Administers"}]'),
    ).toBeNull();
  });

  it.each(['{}', 'json-invalido', '[null]', '["Administrador"]'])(
    'tolera un contrato no utilizable: %s',
    (json) => expect(deserializarRolesProyecto(json)).toBeNull(),
  );

  it('serializa únicamente el arreglo canónico y normalizado', () => {
    expect(
      serializarRolesProyecto({
        roles: [{ nombre: '  Administrador  ', descripcion: '  Configura la solución.  ' }],
      }),
    ).toBe('[{"nombre":"Administrador","descripcion":"Configura la solución."}]');
  });
});
