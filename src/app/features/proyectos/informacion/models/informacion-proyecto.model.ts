import type { ContenidoPersistibleProyecto } from '../../models/actualizacion-seccion-proyecto.model';
import type { AlcanceProyecto } from '../../secciones/alcance/models/alcance-proyecto.model';
import type { EquipoProyecto } from '../../secciones/equipo/models/equipo-proyecto.model';
import type { FlujoProyecto } from '../../secciones/flujo/models/flujo-proyecto.model';
import type { NecesidadProyecto } from '../../secciones/necesidad/models/necesidad-proyecto.model';
import type { ObjetivosProyecto } from '../../secciones/objetivos/models/objetivos-proyecto.model';
import type { RolesProyecto } from '../../secciones/roles/models/roles-proyecto.model';
import type { TipoSolucionProyecto } from '../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import type { VinculacionAzureProyectoResumen } from '../../models/vinculacion-azure-proyecto.model';

/** Describe una versión disponible para la consulta integral del proyecto. */
export interface VersionProyectoResumen {
  readonly id: number;
  readonly numero: number;
  readonly fechaCreacion: string;
  readonly esActual: boolean;
}

/** Fotografía integral de una versión del proyecto. */
export interface InformacionProyecto extends ContenidoPersistibleProyecto {
  readonly id: number;
  readonly versionId: number;
  readonly numeroVersion: number;
  readonly fechaVersion: string | null;
  readonly esVersionActual: boolean;
  readonly estadoCatalogoId: number;
  readonly estado: string;
  readonly prioridad: string;
  readonly azure: VinculacionAzureProyectoResumen | null;
  readonly tipoSolucion: TipoSolucionProyecto;
  readonly necesidad: NecesidadProyecto;
  readonly objetivos: ObjetivosProyecto;
  readonly alcance: AlcanceProyecto;
  readonly roles: RolesProyecto;
  readonly equipo: EquipoProyecto;
  readonly flujo: FlujoProyecto;
}
