import {
  deserializarNecesidadProyecto,
  serializarNecesidadProyecto,
} from './necesidad-proyecto.mapper';

describe('mapeadores de Necesidad de negocio', () => {
  it('recupera el formato canónico', () => {
    expect(
      deserializarNecesidadProyecto(
        '{"situacionActual":"Proceso manual","problemas":"Reprocesos","impacto":"Costos altos"}',
      ),
    ).toEqual({
      situacionActual: 'Proceso manual',
      problemas: 'Reprocesos',
      impacto: 'Costos altos',
    });
  });

  it('rechaza claves que no pertenecen al contrato canónico', () => {
    expect(
      deserializarNecesidadProyecto(
        '{"currentProcess":"Proceso actual","problems":"Sin trazabilidad","impact":"Retrasos"}',
      ),
    ).toBeNull();
  });

  it('recupera una definición parcial sin inventar contenido', () => {
    expect(deserializarNecesidadProyecto('{"problemas":"Sin trazabilidad"}')).toEqual({
      situacionActual: '',
      problemas: 'Sin trazabilidad',
      impacto: '',
    });
  });

  it('tolera JSON vacío o inválido', () => {
    expect(deserializarNecesidadProyecto('{}')).toBeNull();
    expect(deserializarNecesidadProyecto('json-invalido')).toBeNull();
  });

  it('serializa únicamente el contrato canónico y normalizado', () => {
    expect(
      serializarNecesidadProyecto({
        situacionActual: '  Proceso manual  ',
        problemas: '  Reprocesos  ',
        impacto: '  Costos altos  ',
      }),
    ).toBe(
      '{"situacionActual":"Proceso manual","problemas":"Reprocesos","impacto":"Costos altos"}',
    );
  });
});
