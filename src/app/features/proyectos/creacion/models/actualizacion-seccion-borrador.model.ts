import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { AlcanceProyecto } from '../../secciones/alcance/models/alcance-proyecto.model';
import { ContextoProyecto } from '../../secciones/contexto/models/contexto-proyecto.model';
import { EquipoProyecto } from '../../secciones/equipo/models/equipo-proyecto.model';
import { NecesidadProyecto } from '../../secciones/necesidad/models/necesidad-proyecto.model';
import { ObjetivosProyecto } from '../../secciones/objetivos/models/objetivos-proyecto.model';
import { RolesProyecto } from '../../secciones/roles/models/roles-proyecto.model';
import { TipoSolucionProyecto } from '../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { FlujoProyecto } from '../../secciones/flujo/models/flujo-proyecto.model';

/** Relaciona cada sección disponible con el modelo que permite actualizarla. */
export interface DatosSeccionActualizableBorrador {
  [ClaveSeccionProyecto.Contexto]: ContextoProyecto;
  [ClaveSeccionProyecto.TipoSolucion]: TipoSolucionProyecto;
  [ClaveSeccionProyecto.Necesidad]: NecesidadProyecto;
  [ClaveSeccionProyecto.Objetivos]: ObjetivosProyecto;
  [ClaveSeccionProyecto.Alcance]: AlcanceProyecto;
  [ClaveSeccionProyecto.Roles]: RolesProyecto;
  [ClaveSeccionProyecto.Equipo]: EquipoProyecto;
  [ClaveSeccionProyecto.Flujo]: FlujoProyecto;
}

/** Limita las secciones que ya cuentan con persistencia dentro del recorrido. */
export type SeccionActualizableBorrador = keyof DatosSeccionActualizableBorrador;

/** Conserva la relación estricta entre una sección y sus datos. */
export type ActualizacionSeccionBorrador = {
  [TSeccion in SeccionActualizableBorrador]: {
    readonly seccion: TSeccion;
    readonly datos: DatosSeccionActualizableBorrador[TSeccion];
  };
}[SeccionActualizableBorrador];
