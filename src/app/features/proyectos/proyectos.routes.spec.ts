import { SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { RUTAS_PROYECTOS } from './proyectos.routes';

describe('RUTAS_PROYECTOS', () => {
  it('expone el listado, la creación y la planificación como casos de uso hermanos', () => {
    expect(RUTAS_PROYECTOS).toHaveLength(3);
    expect(RUTAS_PROYECTOS[0].path).toBe('');
    expect(RUTAS_PROYECTOS[0].pathMatch).toBe('full');
    expect(RUTAS_PROYECTOS[1].path).toBe(SEGMENTOS_RUTA.creacion);
    expect(RUTAS_PROYECTOS[2].path).toBe(
      `:proyectoId/${SEGMENTOS_RUTA.planificacion}`,
    );
    expect(RUTAS_PROYECTOS.every((ruta) => ruta.children === undefined)).toBe(true);
  });
});
