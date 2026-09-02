import { NombreIconoAplicacion } from '../../../shared/components/icono/iconos-aplicacion';

/** Identifica un permiso requerido por una opción de navegación. */
export type ClavePermisoNavegacion = string;

/** Identifica de forma estable las entradas conocidas del panel. */
export enum ClaveItemNavegacionPanel {
  Inicio = 'inicio',
  Proyectos = 'proyectos',
  InformacionProyecto = 'informacion-proyecto',
}

/** Describe una opción renderizable dentro de la navegación del panel. */
export interface ItemNavegacionPanel {
  readonly id: string;
  readonly etiqueta: string;
  readonly descripcion: string;
  readonly icono: NombreIconoAplicacion;
  readonly ruta: string;
  readonly coincidenciaExacta?: boolean;
  readonly permisos?: readonly ClavePermisoNavegacion[];
  readonly subitems?: readonly ItemNavegacionPanel[];
}
