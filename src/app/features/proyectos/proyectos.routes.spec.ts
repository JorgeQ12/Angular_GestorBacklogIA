import { PARAMETROS_RUTA, SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { RUTAS_PROYECTOS } from './proyectos.routes';

describe('RUTAS_PROYECTOS', () => {
  it('expone listado, creación e información como casos de uso hermanos', () => {
    expect(RUTAS_PROYECTOS).toHaveLength(3);
    expect(RUTAS_PROYECTOS[0].path).toBe(
      `:${PARAMETROS_RUTA.proyectoId}/${SEGMENTOS_RUTA.informacion}`,
    );
    expect(RUTAS_PROYECTOS[1].path).toBe('');
    expect(RUTAS_PROYECTOS[1].pathMatch).toBe('full');
    expect(RUTAS_PROYECTOS[2].path).toBe(SEGMENTOS_RUTA.creacion);
    expect(RUTAS_PROYECTOS.every((ruta) => ruta.children === undefined)).toBe(true);
  });
});
