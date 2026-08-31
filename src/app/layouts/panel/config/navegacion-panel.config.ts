import { InjectionToken } from '@angular/core';
import { URL_INICIO_PANEL, URL_PROYECTOS } from '../../../core/navegacion/rutas';
import { ItemNavegacionPanel } from '../models/item-navegacion-panel.model';

/** Reúne las opciones disponibles en la navegación principal del panel. */
export const NAVEGACION_PANEL = [
  {
    id: 'inicio',
    etiqueta: 'Inicio',
    descripcion: 'Ir al inicio del panel',
    icono: 'inicio',
    ruta: URL_INICIO_PANEL,
    coincidenciaExacta: true,
  },
  {
    id: 'proyectos',
    etiqueta: 'Proyectos',
    descripcion: 'Consultar el portafolio de proyectos',
    icono: 'proyectos',
    ruta: URL_PROYECTOS,
    coincidenciaExacta: false,
  },
] as const satisfies readonly ItemNavegacionPanel[];

/** Permite reemplazar el catálogo de navegación desde un ámbito superior. */
export const CATALOGO_NAVEGACION_PANEL = new InjectionToken<readonly ItemNavegacionPanel[]>(
  'CATALOGO_NAVEGACION_PANEL',
  { providedIn: 'root', factory: () => NAVEGACION_PANEL },
);
