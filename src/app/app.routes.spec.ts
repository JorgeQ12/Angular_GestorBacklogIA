import { routes } from './app.routes';
import { SEGMENTOS_RUTA } from './core/navegacion/rutas';

describe('Rutas principales', () => {
  it('declara la carga diferida de Catálogos en su ruta canónica', () => {
    const rutaPanel = routes.find((ruta) => ruta.path === SEGMENTOS_RUTA.panel);
    const rutaCatalogos = rutaPanel?.children?.find(
      (ruta) => ruta.path === `${SEGMENTOS_RUTA.configuracion}/${SEGMENTOS_RUTA.catalogos}`,
    );

    expect(typeof rutaCatalogos?.loadComponent).toBe('function');
  });

  it('conserva el acceso directo mediante redirección', () => {
    const rutaPanel = routes.find((ruta) => ruta.path === SEGMENTOS_RUTA.panel);
    const redireccion = rutaPanel?.children?.find((ruta) => ruta.path === SEGMENTOS_RUTA.catalogos);

    expect(redireccion).toEqual(
      jasmine.objectContaining({
        redirectTo: `${SEGMENTOS_RUTA.configuracion}/${SEGMENTOS_RUTA.catalogos}`,
        pathMatch: 'full',
      }),
    );
  });

  it('declara Usuarios de forma diferida y conserva su acceso directo', () => {
    const rutaPanel = routes.find((ruta) => ruta.path === SEGMENTOS_RUTA.panel);
    const rutaUsuarios = rutaPanel?.children?.find(
      (ruta) => ruta.path === `${SEGMENTOS_RUTA.configuracion}/${SEGMENTOS_RUTA.usuarios}`,
    );
    const redireccion = rutaPanel?.children?.find((ruta) => ruta.path === SEGMENTOS_RUTA.usuarios);

    expect(rutaUsuarios?.loadComponent).toBeTypeOf('function');
    expect(redireccion).toEqual(
      expect.objectContaining({
        redirectTo: `${SEGMENTOS_RUTA.configuracion}/${SEGMENTOS_RUTA.usuarios}`,
        pathMatch: 'full',
      }),
    );
  });
});
