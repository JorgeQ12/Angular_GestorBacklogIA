import {
  deserializarObjetivosProyecto,
  serializarObjetivosProyecto,
} from './objetivos-proyecto.mapper';

describe('mapeadores de Objetivos', () => {
  it('recupera el contrato canónico en español', () => {
    expect(
      deserializarObjetivosProyecto(
        '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar tareas","Medir resultados"]}',
      ),
    ).toEqual({
      objetivoGeneral: 'Reducir tiempos',
      objetivosEspecificos: ['Automatizar tareas', 'Medir resultados'],
    });
  });

  it('rechaza claves que no pertenecen al contrato canónico', () => {
    expect(
      deserializarObjetivosProyecto(
        '{"general":"Reducir tiempos","specific":[{"objective":"Automatizar"}]}',
      ),
    ).toBeNull();
  });

  it('recupera una definición canónica parcial sin inventar contenido', () => {
    expect(deserializarObjetivosProyecto('{"objetivoGeneral":"Reducir tiempos"}')).toEqual({
      objetivoGeneral: 'Reducir tiempos',
      objetivosEspecificos: [],
    });
  });

  it('tolera JSON vacío o inválido', () => {
    expect(deserializarObjetivosProyecto('{}')).toBeNull();
    expect(deserializarObjetivosProyecto('json-invalido')).toBeNull();
  });

  it('serializa únicamente el contrato canónico y normalizado', () => {
    expect(
      serializarObjetivosProyecto({
        objetivoGeneral: '  Reducir tiempos  ',
        objetivosEspecificos: ['  Automatizar tareas  ', '  Medir resultados  '],
      }),
    ).toBe(
      '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar tareas","Medir resultados"]}',
    );
  });
});
