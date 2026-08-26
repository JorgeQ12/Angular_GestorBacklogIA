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
  ])('reanuda el avance %s en su ruta correspondiente', (pasoActual, urlEsperada) => {
    expect(crearUrlReanudacionProyecto(42, pasoActual)).toBe(urlEsperada);
  });

  it('conserva el último destino migrado para avances posteriores', () => {
    expect(crearUrlReanudacionProyecto(42, 8)).toBe('/panel/proyectos/42/creacion/roles');
  });

  it('no inventa rutas para pasos todavía no migrados', () => {
    expect(crearUrlPasoCreacionProyecto(42, ClaveSeccionProyecto.Equipo)).toBeNull();
  });
});
