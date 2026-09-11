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

  it('redirige la raíz al inicio de sesión', () => {
    const raiz = routes.find((ruta) => ruta.path === '');
    expect(raiz?.pathMatch).toBe('full');
    expect(raiz?.redirectTo).toBeDefined();
  });

  it('redirige cualquier ruta desconocida al inicio de sesión', () => {
    const comodin = routes.find((ruta) => ruta.path === '**');
    expect(comodin?.redirectTo).toBeDefined();
  });

  it('protege el panel con el guard de sesión', () => {
    const rutaPanel = routes.find((ruta) => ruta.path === SEGMENTOS_RUTA.panel);
    expect(rutaPanel?.canActivate?.length).toBe(1);
  });

  it('carga diferida de la página de inicio de sesión', async () => {
    const login = routes.find((ruta) => ruta.loadComponent && ruta.path !== SEGMENTOS_RUTA.panel);
    const componente = await login!.loadComponent!();
    expect(componente).toBeTruthy();
  });

  it('carga diferida del layout del panel', async () => {
    const rutaPanel = routes.find((ruta) => ruta.path === SEGMENTOS_RUTA.panel);
    const componente = await rutaPanel!.loadComponent!();
    expect(componente).toBeTruthy();
  });

  it('carga diferida de la página de catálogos y del inicio del panel', async () => {
    const rutaPanel = routes.find((ruta) => ruta.path === SEGMENTOS_RUTA.panel);
    const catalogos = rutaPanel?.children?.find(
      (ruta) => ruta.path === `${SEGMENTOS_RUTA.configuracion}/${SEGMENTOS_RUTA.catalogos}`,
    );
    const inicio = rutaPanel?.children?.find((ruta) => ruta.path === SEGMENTOS_RUTA.inicio);

    expect(await catalogos!.loadComponent!()).toBeTruthy();
    expect(await inicio!.loadComponent!()).toBeTruthy();
  });

  it('carga diferida de las rutas hijas de proyectos', async () => {
    const rutaPanel = routes.find((ruta) => ruta.path === SEGMENTOS_RUTA.panel);
    const proyectos = rutaPanel?.children?.find((ruta) => ruta.path === SEGMENTOS_RUTA.proyectos);
    const rutas = await proyectos!.loadChildren!();
    expect(rutas).toBeTruthy();
  });
});
