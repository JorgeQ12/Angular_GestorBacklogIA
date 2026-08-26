import {
  deserializarTipoSolucionProyecto,
  serializarTipoSolucionProyecto,
} from './tipo-solucion-proyecto.mapper';

describe('mapeadores de Tipo de solución', () => {
  it('recupera el formato canónico', () => {
    expect(deserializarTipoSolucionProyecto('{"tieneInterfaz":true,"plataforma":"Web"}')).toEqual({
      tieneInterfaz: true,
      plataforma: 'Web',
    });
  });

  it('rechaza claves que no pertenecen al contrato canónico', () => {
    expect(deserializarTipoSolucionProyecto('{"hasInterface":true,"platform":"Web"}')).toBeNull();
  });

  it('descarta plataforma cuando la solución no tiene interfaz', () => {
    expect(deserializarTipoSolucionProyecto('{"tieneInterfaz":false,"plataforma":"Web"}')).toEqual({
      tieneInterfaz: false,
      plataforma: null,
    });
  });

  it('tolera JSON vacío o inválido', () => {
    expect(deserializarTipoSolucionProyecto('{}')).toBeNull();
    expect(deserializarTipoSolucionProyecto('json-invalido')).toBeNull();
  });

  it('serializa únicamente el contrato canónico', () => {
    expect(serializarTipoSolucionProyecto({ tieneInterfaz: true, plataforma: 'Móvil' })).toBe(
      '{"tieneInterfaz":true,"plataforma":"Móvil"}',
    );
  });
});
