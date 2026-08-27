import { obtenerProgresoCreacionProyecto } from './progreso-creacion-proyecto.mapper';

describe('obtenerProgresoCreacionProyecto', () => {
  it('expone el avance sin filtrar la configuración interna del recorrido', () => {
    expect(obtenerProgresoCreacionProyecto(4)).toEqual({
      posicion: 5,
      total: 9,
      porcentaje: 55.55555555555556,
    });
  });
});
