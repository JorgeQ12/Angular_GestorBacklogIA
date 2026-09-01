import { ClaveSeccionProyecto } from '../config/secciones-proyecto.config';
import { AlcanceProyecto } from '../secciones/alcance/models/alcance-proyecto.model';
import { ContextoProyecto } from '../secciones/contexto/models/contexto-proyecto.model';
import { EquipoProyecto } from '../secciones/equipo/models/equipo-proyecto.model';
import { FlujoProyecto } from '../secciones/flujo/models/flujo-proyecto.model';
import { NecesidadProyecto } from '../secciones/necesidad/models/necesidad-proyecto.model';
import { ObjetivosProyecto } from '../secciones/objetivos/models/objetivos-proyecto.model';
import { RolesProyecto } from '../secciones/roles/models/roles-proyecto.model';
import { TipoSolucionProyecto } from '../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';

/** Relaciona cada sección de proyecto con el modelo que permite actualizarla. */
export interface DatosSeccionActualizableProyecto {
  [ClaveSeccionProyecto.Contexto]: ContextoProyecto;
  [ClaveSeccionProyecto.TipoSolucion]: TipoSolucionProyecto;
  [ClaveSeccionProyecto.Necesidad]: NecesidadProyecto;
  [ClaveSeccionProyecto.Objetivos]: ObjetivosProyecto;
  [ClaveSeccionProyecto.Alcance]: AlcanceProyecto;
  [ClaveSeccionProyecto.Roles]: RolesProyecto;
  [ClaveSeccionProyecto.Equipo]: EquipoProyecto;
  [ClaveSeccionProyecto.Flujo]: FlujoProyecto;
}

/** Limita las claves admitidas por la actualización común del proyecto. */
export type SeccionActualizableProyecto = keyof DatosSeccionActualizableProyecto;

/** Conserva la relación estricta entre la clave de sección y sus datos. */
export type ActualizacionSeccionProyecto = {
  [TSeccion in SeccionActualizableProyecto]: {
    readonly seccion: TSeccion;
    readonly datos: DatosSeccionActualizableProyecto[TSeccion];
  };
}[SeccionActualizableProyecto];

/** Representa el contenido persistible que comparten borradores y versiones publicadas. */
export interface ContenidoPersistibleProyecto {
  readonly contexto: ContextoProyecto;
  readonly tipoSolucionJson: string;
  readonly necesidadJson: string;
  readonly objetivosJson: string;
  readonly alcanceJson: string;
  readonly rolesJson: string;
  readonly equipoJson: string;
  readonly diagramFlujoJson: string;
}
