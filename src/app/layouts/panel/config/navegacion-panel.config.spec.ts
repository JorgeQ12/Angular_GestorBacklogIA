import { URL_CATALOGOS } from '../../../core/navegacion/rutas';
import { NAVEGACION_PANEL } from './navegacion-panel.config';
import { ClaveItemNavegacionPanel } from '../models/item-navegacion-panel.model';

describe('Catálogo de navegación del panel', () => {
  it('expone la administración de catálogos mediante su URL canónica', () => {
    expect(NAVEGACION_PANEL).toContainEqual(
      expect.objectContaining({
        id: ClaveItemNavegacionPanel.Catalogos,
        ruta: URL_CATALOGOS,
        icono: 'catalogos',
      }),
    );
  });
});
