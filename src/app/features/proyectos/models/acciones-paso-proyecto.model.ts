import type { NombreIconoAplicacion } from '../../../shared/components/icono/iconos-aplicacion';

/** Configura las acciones sin acoplar un paso al caso de uso consumidor. */
export interface AccionesPasoProyecto {
  readonly textoPrincipal: string;
  readonly iconoPrincipal: NombreIconoAplicacion;
  readonly nota?: string;
  readonly textoSecundario?: string;
  readonly iconoSecundario?: NombreIconoAplicacion;
}

/** Acciones utilizadas para persistir una sección y avanzar en el borrador. */
export const ACCIONES_CREACION_PASO_PROYECTO: AccionesPasoProyecto = {
  textoPrincipal: 'Guardar y continuar',
  iconoPrincipal: 'continuar',
  nota: 'Los cambios se guardarán en el borrador.',
};

/** Acciones utilizadas para confirmar una modificación versionada. */
export const ACCIONES_INFORMACION_PASO_PROYECTO: AccionesPasoProyecto = {
  textoPrincipal: 'Guardar versión',
  iconoPrincipal: 'confirmar',
  textoSecundario: 'Cancelar',
  iconoSecundario: 'cerrar',
};
