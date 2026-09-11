import { PARAMETROS_RUTA, SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { RUTAS_PROYECTOS } from './proyectos.routes';

describe('RUTAS_PROYECTOS', () => {
  it('expone listado, creación, información y planificación como casos de uso hermanos', () => {
    expect(RUTAS_PROYECTOS.length).toBe(4);
    expect(RUTAS_PROYECTOS[0].path).toBe(
      `:${PARAMETROS_RUTA.proyectoId}/${SEGMENTOS_RUTA.informacion}`,
    );
    expect(RUTAS_PROYECTOS[1].path).toBe('');
    expect(RUTAS_PROYECTOS[1].pathMatch).toBe('full');
    expect(RUTAS_PROYECTOS[2].path).toBe(SEGMENTOS_RUTA.creacion);
    expect(RUTAS_PROYECTOS[3].path).toBe(
      `:${PARAMETROS_RUTA.proyectoId}/${SEGMENTOS_RUTA.planificacion}`,
    );
    expect(RUTAS_PROYECTOS[3].providers).toBeDefined();
    expect(RUTAS_PROYECTOS.every((ruta) => ruta.children === undefined)).toBe(true);
  });

  it('carga diferida del componente de información', async () => {
    const componente = await RUTAS_PROYECTOS[0].loadComponent!();
    expect(componente).toBeTruthy();
  });

  it('carga diferida del componente de consulta', async () => {
    const componente = await RUTAS_PROYECTOS[1].loadComponent!();
    expect(componente).toBeTruthy();
  });

  it('carga diferida del componente de creación', async () => {
    const componente = await RUTAS_PROYECTOS[2].loadComponent!();
    expect(componente).toBeTruthy();
  });

  it('carga diferida del componente de planificación', async () => {
    const componente = await RUTAS_PROYECTOS[3].loadComponent!();
    expect(componente).toBeTruthy();
  });

  it('provee los servicios de estado de cada caso de uso en su ruta', () => {
    expect(RUTAS_PROYECTOS[0].providers?.length).toBe(1);
    expect(RUTAS_PROYECTOS[1].providers?.length).toBe(1);
    expect(RUTAS_PROYECTOS[2].providers?.length).toBe(2);
    expect(RUTAS_PROYECTOS[3].providers?.length).toBe(9);
  });
});
