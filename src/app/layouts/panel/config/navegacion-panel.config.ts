import { InjectionToken } from '@angular/core';
import {
  URL_INICIO_PANEL,
  URL_CATALOGOS,
  URL_PROYECTOS,
  URL_USUARIOS,
  crearUrlInformacionProyecto,
} from '../../../core/navegacion/rutas';
import {
  ClaveItemNavegacionPanel,
  ItemNavegacionPanel,
} from '../models/item-navegacion-panel.model';

/** Reúne las opciones disponibles en la navegación principal del panel. */
export const NAVEGACION_PANEL = [
  {
    id: ClaveItemNavegacionPanel.Inicio,
    etiqueta: 'Inicio',
    descripcion: 'Ir al inicio del panel',
    icono: 'inicio',
    ruta: URL_INICIO_PANEL,
    coincidenciaExacta: true,
  },
  {
    id: ClaveItemNavegacionPanel.Proyectos,
    etiqueta: 'Proyectos',
    descripcion: 'Consultar el portafolio de proyectos',
    icono: 'proyectos',
    ruta: URL_PROYECTOS,
    coincidenciaExacta: false,
  },
  {
    id: ClaveItemNavegacionPanel.Catalogos,
    etiqueta: 'Catálogos',
    descripcion: 'Administrar catálogos y opciones',
    icono: 'catalogos',
    ruta: URL_CATALOGOS,
    coincidenciaExacta: true,
  },
  {
    id: ClaveItemNavegacionPanel.Usuarios,
    etiqueta: 'Usuarios',
    descripcion: 'Administrar usuarios y perfiles técnicos',
    icono: 'usuario',
    ruta: URL_USUARIOS,
    coincidenciaExacta: true,
  },
] as const satisfies readonly ItemNavegacionPanel[];

/** Construye las opciones disponibles para el proyecto identificado por la URL actual. */
export function construirSubitemsProyecto(proyectoId: number): readonly ItemNavegacionPanel[] {
  return [
    {
      id: ClaveItemNavegacionPanel.InformacionProyecto,
      etiqueta: 'Información',
      descripcion: 'Consultar la definición integral y las versiones del proyecto',
      icono: 'informacion',
      ruta: crearUrlInformacionProyecto(proyectoId),
      coincidenciaExacta: true,
    },
  ];
}

/** Permite reemplazar el catálogo de navegación desde un ámbito superior. */
export const CATALOGO_NAVEGACION_PANEL = new InjectionToken<readonly ItemNavegacionPanel[]>(
  'CATALOGO_NAVEGACION_PANEL',
  { providedIn: 'root', factory: () => NAVEGACION_PANEL },
);
