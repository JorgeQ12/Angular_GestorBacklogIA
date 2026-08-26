import { ContextoProyecto } from '../../secciones/contexto/models/contexto-proyecto.model';

/** Identifica el borrador que continuará en el recorrido de creación. */
export interface BorradorProyectoCreado {
  id: number;
  revision: number;
  pasoActual: number;
}

/** Conserva la fotografía editable requerida durante el recorrido de creación. */
export interface BorradorProyecto {
  readonly id: number;
  readonly revision: number;
  readonly pasoActual: number;
  readonly contexto: ContextoProyecto;
  readonly estadoCatalogoId: number | null;
  readonly tipoSolucionJson: string;
  readonly necesidadJson: string;
  readonly objetivosJson: string;
  readonly alcanceJson: string;
  readonly rolesJson: string;
  readonly equipoJson: string;
  readonly diagramFlujoJson: string;
  readonly fechaUltimoGuardado: string;
}

/** Agrupa reemplazos parciales antes de construir la fotografía completa requerida por el API. */
export interface CambiosBorradorProyecto {
  readonly contexto?: ContextoProyecto;
  readonly tipoSolucionJson?: string;
  readonly necesidadJson?: string;
  readonly objetivosJson?: string;
  readonly alcanceJson?: string;
}
