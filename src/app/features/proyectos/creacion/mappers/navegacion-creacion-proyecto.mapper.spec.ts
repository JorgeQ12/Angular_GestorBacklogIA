import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import {
  crearUrlPasoCreacionProyecto,
  crearUrlReanudacionProyecto,
} from './navegacion-creacion-proyecto.mapper';

describe('navegación de creación de proyectos', () => {
  it.each([
    [1, '/panel/proyectos/42/creacion/contexto'],
    [2, '/panel/proyectos/42/creacion/tipo-solucion'],
    [3, '/panel/proyectos/42/creacion/necesidad'],
    [4, '/panel/proyectos/42/creacion/objetivos'],
    [5, '/panel/proyectos/42/creacion/alcance'],
    [6, '/panel/proyectos/42/creacion/roles'],
    [7, '/panel/proyectos/42/creacion/equipo'],
    [8, '/panel/proyectos/42/creacion/flujo'],
  ])('reanuda el avance %s en su ruta correspondiente', (pasoActual, urlEsperada) => {
    expect(crearUrlReanudacionProyecto(42, pasoActual)).toBe(urlEsperada);
  });

  it('conserva el último destino migrado para avances posteriores', () => {
    expect(crearUrlReanudacionProyecto(42, 9)).toBe('/panel/proyectos/42/creacion/flujo');
  });

  it('construye la ruta estable del siguiente paso', () => {
    expect(crearUrlPasoCreacionProyecto(42, ClaveSeccionProyecto.Equipo)).toBe(
      '/panel/proyectos/42/creacion/equipo',
    );
  });
});
