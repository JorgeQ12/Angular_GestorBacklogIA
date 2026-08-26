import {
  construirEstadoRecorridoCreacion,
  obtenerPosicionVisualCreacion,
  puedeAbrirPasoCreacion,
} from './estado-recorrido-creacion-proyecto.mapper';

describe('estado del recorrido de creación', () => {
  it('mantiene el recorrido inicial sin pasos persistidos', () => {
    expect(construirEstadoRecorridoCreacion('vinculacion-azure', null)).toEqual({
      pasoActual: 'vinculacion-azure',
      pasosCompletados: [],
      pasosNavegables: [],
    });
  });

  it('conserva el máximo avance al regresar a un paso anterior', () => {
    expect(construirEstadoRecorridoCreacion('contexto', 4)).toEqual({
      pasoActual: 'contexto',
      pasosCompletados: ['vinculacion-azure', 'contexto', 'tipo-solucion', 'necesidad'],
      pasosNavegables: ['tipo-solucion', 'necesidad', 'objetivos'],
    });
  });

  it('separa los pasos completados del siguiente paso alcanzado', () => {
    expect(construirEstadoRecorridoCreacion('objetivos', 4)).toEqual({
      pasoActual: 'objetivos',
      pasosCompletados: ['vinculacion-azure', 'contexto', 'tipo-solucion', 'necesidad'],
      pasosNavegables: ['contexto', 'tipo-solucion', 'necesidad'],
    });
  });

  it('impide abrir pasos posteriores al avance persistido', () => {
    expect(puedeAbrirPasoCreacion('necesidad', 2)).toBe(false);
    expect(puedeAbrirPasoCreacion('tipo-solucion', 2)).toBe(true);
  });

  it('incluye Azure al presentar la posición visual del avance', () => {
    expect(obtenerPosicionVisualCreacion(1)).toBe(2);
    expect(obtenerPosicionVisualCreacion(4)).toBe(5);
    expect(obtenerPosicionVisualCreacion(8)).toBe(9);
  });
});
