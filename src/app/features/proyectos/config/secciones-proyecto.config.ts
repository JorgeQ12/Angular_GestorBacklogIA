import type { NombreIconoAplicacion } from '../../../shared/components/icono/iconos-aplicacion';

/** Identifica de forma estable cada sección funcional del proyecto. */
export enum ClaveSeccionProyecto {
  Contexto = 'contexto',
  TipoSolucion = 'tipo-solucion',
  Necesidad = 'necesidad',
  Objetivos = 'objetivos',
  Alcance = 'alcance',
  Roles = 'roles',
  Equipo = 'equipo',
  Flujo = 'flujo',
}

/** Describe una sección funcional reutilizable del proyecto. */
export interface SeccionProyecto {
  readonly clave: ClaveSeccionProyecto;
  readonly titulo: string;
  readonly descripcion: string;
  readonly icono: NombreIconoAplicacion;
}

/** Centraliza las secciones compartidas por la creación y la consulta del proyecto. */
export const SECCIONES_PROYECTO = [
  {
    clave: ClaveSeccionProyecto.Contexto,
    titulo: 'Contexto del proyecto',
    descripcion: 'Identidad y datos base',
    icono: 'contextoProyecto',
  },
  {
    clave: ClaveSeccionProyecto.TipoSolucion,
    titulo: 'Tipo de solución',
    descripcion: 'Canal y plataforma',
    icono: 'tipoSolucion',
  },
  {
    clave: ClaveSeccionProyecto.Necesidad,
    titulo: 'Necesidad de negocio',
    descripcion: 'Problema e impacto',
    icono: 'necesidadNegocio',
  },
  {
    clave: ClaveSeccionProyecto.Objetivos,
    titulo: 'Objetivos',
    descripcion: 'Resultados esperados',
    icono: 'objetivos',
  },
  {
    clave: ClaveSeccionProyecto.Alcance,
    titulo: 'Alcance',
    descripcion: 'Incluido y excluido',
    icono: 'alcance',
  },
  {
    clave: ClaveSeccionProyecto.Roles,
    titulo: 'Roles',
    descripcion: 'Perfiles de usuario',
    icono: 'roles',
  },
  {
    clave: ClaveSeccionProyecto.Equipo,
    titulo: 'Equipo',
    descripcion: 'Personas y dedicación',
    icono: 'equipo',
  },
  {
    clave: ClaveSeccionProyecto.Flujo,
    titulo: 'Flujo de usuario',
    descripcion: 'Recorrido funcional',
    icono: 'flujo',
  },
] as const satisfies readonly SeccionProyecto[];
