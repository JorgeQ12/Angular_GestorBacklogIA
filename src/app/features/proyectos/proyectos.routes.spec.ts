import { SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { RUTAS_PROYECTOS } from './proyectos.routes';

describe('RUTAS_PROYECTOS', () => {
  it('expone el listado y la creación como casos de uso hermanos', () => {
    expect(RUTAS_PROYECTOS).toHaveLength(2);
    expect(RUTAS_PROYECTOS[0].path).toBe('');
    expect(RUTAS_PROYECTOS[0].pathMatch).toBe('full');
    expect(RUTAS_PROYECTOS[1].path).toBe(SEGMENTOS_RUTA.creacion);
    expect(RUTAS_PROYECTOS.every((ruta) => ruta.children === undefined)).toBe(true);
  });
});
