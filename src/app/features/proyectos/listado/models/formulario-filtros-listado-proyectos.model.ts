import type { ControlesFormularioPlano } from '../../../../shared/forms/models';
import type { FiltrosListadoProyectos } from './consulta-listado-proyectos.model';

/** Deriva los controles desde los criterios editables del listado. */
export type ControlesFiltrosListadoProyectos = ControlesFormularioPlano<FiltrosListadoProyectos>;
