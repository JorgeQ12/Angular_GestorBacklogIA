import { NombreIconoAplicacion } from '../../../shared/components/icono/iconos-aplicacion';

/** Identifica un permiso requerido por una opción de navegación. */
export type ClavePermisoNavegacion = string;

/** Describe una opción renderizable dentro de la navegación del panel. */
export interface ItemNavegacionPanel {
  id: string;
  etiqueta: string;
  descripcion: string;
  icono: NombreIconoAplicacion;
  ruta: string;
  coincidenciaExacta?: boolean;
  permisos?: readonly ClavePermisoNavegacion[];
}
