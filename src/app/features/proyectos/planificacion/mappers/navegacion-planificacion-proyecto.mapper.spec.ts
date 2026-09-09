import { obtenerVersionIdPlanificacionProyecto } from './navegacion-planificacion-proyecto.mapper';

describe('obtenerVersionIdPlanificacionProyecto', () => {
  it('acepta únicamente identificadores enteros positivos', () => {
    expect(obtenerVersionIdPlanificacionProyecto('81')).toBe(81);
    expect(obtenerVersionIdPlanificacionProyecto(null)).toBeNull();
    expect(obtenerVersionIdPlanificacionProyecto('')).toBeNull();
    expect(obtenerVersionIdPlanificacionProyecto('0')).toBeNull();
    expect(obtenerVersionIdPlanificacionProyecto('1.5')).toBeNull();
    expect(obtenerVersionIdPlanificacionProyecto('invalida')).toBeNull();
  });
});
