import { SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { RUTAS_PROYECTOS } from './proyectos.routes';

describe('RUTAS_PROYECTOS', () => {
  it('expone una sola ruta de creación sin rutas hijas por paso', () => {
    expect(RUTAS_PROYECTOS).toHaveLength(1);
    expect(RUTAS_PROYECTOS[0].path).toBe(SEGMENTOS_RUTA.creacion);
    expect(RUTAS_PROYECTOS[0].children).toBeUndefined();
  });
});
