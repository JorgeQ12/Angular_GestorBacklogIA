import type { NombreIconoAplicacion } from '../../../shared/components/icono/iconos-aplicacion';

/** Describe una sección funcional reutilizable del proyecto. */
export interface SeccionProyecto {
  readonly clave: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly icono: NombreIconoAplicacion;
}

/** Centraliza las secciones compartidas por la creación y la consulta del proyecto. */
export const SECCIONES_PROYECTO = [
  {
    clave: 'contexto',
    titulo: 'Contexto del proyecto',
    descripcion: 'Identidad y datos base',
    icono: 'contextoProyecto',
  },
  {
    clave: 'tipo-solucion',
    titulo: 'Tipo de solución',
    descripcion: 'Canal y plataforma',
    icono: 'tipoSolucion',
  },
  {
    clave: 'necesidad',
    titulo: 'Necesidad de negocio',
    descripcion: 'Problema e impacto',
    icono: 'necesidadNegocio',
  },
  {
    clave: 'objetivos',
    titulo: 'Objetivos',
    descripcion: 'Resultados esperados',
    icono: 'objetivos',
  },
  {
    clave: 'alcance',
    titulo: 'Alcance',
    descripcion: 'Incluido y excluido',
    icono: 'alcance',
  },
  {
    clave: 'roles',
    titulo: 'Roles',
    descripcion: 'Perfiles de usuario',
    icono: 'roles',
  },
  {
    clave: 'equipo',
    titulo: 'Equipo',
    descripcion: 'Personas y dedicación',
    icono: 'equipo',
  },
  {
    clave: 'flujo',
    titulo: 'Flujo de usuario',
    descripcion: 'Recorrido funcional',
    icono: 'flujo',
  },
] as const satisfies readonly SeccionProyecto[];

/** Limita las claves admitidas por las secciones funcionales del proyecto. */
export type ClaveSeccionProyecto = (typeof SECCIONES_PROYECTO)[number]['clave'];
