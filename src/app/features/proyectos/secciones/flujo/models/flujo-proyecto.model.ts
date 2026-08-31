/** Identifica los tipos de bloque admitidos por el editor y por el contrato persistido. */
export enum TipoBloqueFlujo {
  Modulo = 'modulo',
  Pagina = 'pagina',
  Accion = 'accion',
  Decision = 'decision',
  Componente = 'componente',
}

/** Identifica las vistas disponibles para filtrar el lienzo. */
export enum FiltroVistaFlujoProyecto {
  Todos = 'todos',
  Compartidos = 'compartidos',
  Rol = 'rol',
}

/** Conserva el desplazamiento y la escala aplicados al lienzo. */
export interface VistaLienzoFlujo {
  desplazamientoX: number;
  desplazamientoY: number;
  escala: number;
}

/** Representa un rol funcional disponible para asignar a los bloques. */
export interface RolFlujoProyecto {
  id: string;
  nombre: string;
  fechaCreacion: string;
}

/** Ubica un bloque dentro de las coordenadas del lienzo. */
export interface PosicionBloqueFlujo {
  x: number;
  y: number;
}

/** Identifica una salida permitida para un bloque de decisión. */
export type EtiquetaRamaDecision = 'Sí' | 'No';

/** Identifica una operación que un rol puede realizar dentro de un módulo. */
export type AccionPermisoModulo = 'Ver' | 'Crear' | 'Editar' | 'Eliminar';

/** Relaciona un rol con las operaciones permitidas dentro de un módulo. */
export interface PermisoRolModulo {
  idRol: string;
  permisos: AccionPermisoModulo[];
}

/** Describe una franja semanal de mayor actividad para un módulo. */
export interface FranjaMayorActividadModulo {
  dias: string[];
  horaInicio: string;
  horaFin: string;
}

/** Contiene la configuración especializada de un nodo de módulo. */
export interface DatosNodoModulo {
  permisosRoles: PermisoRolModulo[];
  usuariosConcurrentes: string;
  horariosMayorActividad: FranjaMayorActividadModulo[];
}

/** Contiene la configuración especializada de un nodo de página. */
export type DatosNodoPagina = Record<string, never>;

/** Contiene la configuración especializada de un nodo de acción. */
export type DatosNodoAccion = Record<string, never>;

/** Contiene la configuración especializada de un nodo de decisión. */
export type DatosNodoDecision = Record<string, never>;

/** Contiene la información capturada por un nodo de componente. */
export interface DatosNodoComponente {
  datosCapturados: string;
  camposObligatorios: string;
  resultadoCompletado: string;
}

/** Agrupa las configuraciones admitidas por los nodos del flujo. */
export type DatosNodoFlujo =
  | DatosNodoModulo
  | DatosNodoPagina
  | DatosNodoAccion
  | DatosNodoDecision
  | DatosNodoComponente;

/** Define las propiedades compartidas por todos los nodos persistidos. */
export interface BaseNodoFlujo {
  id: string;
  tipo: TipoBloqueFlujo;
  titulo: string;
  descripcion: string;
  criteriosAceptacion: string[];
  posicion: PosicionBloqueFlujo;
  idsRoles: string[];
  fechaCreacion: string;
  fechaActualizacion: string;
}

/** Define las propiedades editables compartidas antes de confirmar un nodo. */
export interface BaseBorradorNodoFlujo {
  tipo: TipoBloqueFlujo;
  titulo: string;
  descripcion: string;
  criteriosAceptacion: string[];
  nombresRoles: string[];
}

/** Representa un nodo de módulo dentro del flujo. */
export interface NodoModuloFlujo extends BaseNodoFlujo {
  tipo: TipoBloqueFlujo.Modulo;
  datos: DatosNodoModulo;
}

/** Representa un nodo de página dentro del flujo. */
export interface NodoPaginaFlujo extends BaseNodoFlujo {
  tipo: TipoBloqueFlujo.Pagina;
  datos: DatosNodoPagina;
}

/** Representa un nodo de acción dentro del flujo. */
export interface NodoAccionFlujo extends BaseNodoFlujo {
  tipo: TipoBloqueFlujo.Accion;
  datos: DatosNodoAccion;
}

/** Representa un nodo de decisión dentro del flujo. */
export interface NodoDecisionFlujo extends BaseNodoFlujo {
  tipo: TipoBloqueFlujo.Decision;
  datos: DatosNodoDecision;
}

/** Representa un nodo de componente dentro del flujo. */
export interface NodoComponenteFlujo extends BaseNodoFlujo {
  tipo: TipoBloqueFlujo.Componente;
  datos: DatosNodoComponente;
}

/** Representa cualquier nodo persistido dentro del flujo del proyecto. */
export type NodoFlujoProyecto =
  | NodoModuloFlujo
  | NodoPaginaFlujo
  | NodoAccionFlujo
  | NodoDecisionFlujo
  | NodoComponenteFlujo;

/** Representa cualquier nodo editable antes de incorporarlo al flujo. */
export type BorradorNodoFlujo =
  | (BaseBorradorNodoFlujo & { tipo: TipoBloqueFlujo.Modulo; datos: DatosNodoModulo })
  | (BaseBorradorNodoFlujo & { tipo: TipoBloqueFlujo.Pagina; datos: DatosNodoPagina })
  | (BaseBorradorNodoFlujo & { tipo: TipoBloqueFlujo.Accion; datos: DatosNodoAccion })
  | (BaseBorradorNodoFlujo & { tipo: TipoBloqueFlujo.Decision; datos: DatosNodoDecision })
  | (BaseBorradorNodoFlujo & {
      tipo: TipoBloqueFlujo.Componente;
      datos: DatosNodoComponente;
    });

/** Identifica el borde de un nodo utilizado como destino de una conexión. */
export type LadoConexionFlujo = 'izquierda' | 'derecha' | 'arriba' | 'abajo';

/** Relaciona dos nodos del flujo mediante una conexión dirigida. */
export interface ConexionFlujoProyecto {
  id: string;
  idBloqueOrigen: string;
  idBloqueDestino: string;
  etiqueta?: string;
  ladoDestino?: LadoConexionFlujo;
  fechaCreacion: string;
}

/** Representa el documento completo editado y persistido por la sección Flujo. */
export interface FlujoProyecto {
  proyectoId: string;
  roles: RolFlujoProyecto[];
  nodos: NodoFlujoProyecto[];
  conexiones: ConexionFlujoProyecto[];
  fechaActualizacion: string;
}

/** Conserva el filtro aplicado a los bloques del lienzo. */
export interface EstadoFiltroFlujo {
  modo: FiltroVistaFlujoProyecto;
  idRol: string | null;
}

/** Define las dimensiones disponibles para ubicar nodos en el lienzo. */
export interface TamanoLienzoFlujo {
  ancho: number;
  alto: number;
}

/** Crea la configuración inicial correspondiente a un tipo de nodo. */
export function crearDatosNodoPredeterminados(tipo: TipoBloqueFlujo): DatosNodoFlujo {
  switch (tipo) {
    case TipoBloqueFlujo.Modulo:
      return {
        permisosRoles: [],
        usuariosConcurrentes: '',
        horariosMayorActividad: [{ dias: [], horaInicio: '00:00', horaFin: '00:00' }],
      };
    case TipoBloqueFlujo.Pagina:
    case TipoBloqueFlujo.Accion:
    case TipoBloqueFlujo.Decision:
      return {};
    case TipoBloqueFlujo.Componente:
      return {
        datosCapturados: '',
        camposObligatorios: '',
        resultadoCompletado: '',
      };
  }
}

/** Comprueba si un texto representa una salida válida de una decisión. */
export function esEtiquetaRamaDecision(
  valor: string | null | undefined,
): valor is EtiquetaRamaDecision {
  return valor === 'Sí' || valor === 'No';
}

/** Comprueba si un texto representa una operación válida de módulo. */
export function esAccionPermisoModulo(
  valor: string | null | undefined,
): valor is AccionPermisoModulo {
  return valor === 'Ver' || valor === 'Crear' || valor === 'Editar' || valor === 'Eliminar';
}
