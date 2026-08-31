import type { FormGroup } from '@angular/forms';
import type { ControlesFormularioPlano } from '../../../../shared/forms/models';
import type { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';

/** Describe los valores editables del formulario de filtros. */
export interface ValoresFormularioFiltrosListadoProyectos {
  readonly busqueda: string;
  readonly estado: EstadoCatalogoProyecto | null;
}

/** Deriva los controles desde los valores editables del formulario. */
export type ControlesFiltrosListadoProyectos =
  ControlesFormularioPlano<ValoresFormularioFiltrosListadoProyectos>;

/** Representa el grupo estrictamente tipado utilizado por el formulario. */
export type FormularioFiltrosListadoProyectosTipado = FormGroup<ControlesFiltrosListadoProyectos>;
