import { ClaveSeccionProyecto } from '../config/secciones-proyecto.config';
import {
  ActualizacionSeccionProyecto,
  ContenidoPersistibleProyecto,
} from '../models/actualizacion-seccion-proyecto.model';
import { serializarAlcanceProyecto } from '../secciones/alcance/mappers/alcance-proyecto.mapper';
import { serializarEquipoProyecto } from '../secciones/equipo/mappers/equipo-proyecto.mapper';
import { serializarFlujoProyecto } from '../secciones/flujo/mappers/flujo-proyecto.mapper';
import { serializarNecesidadProyecto } from '../secciones/necesidad/mappers/necesidad-proyecto.mapper';
import { serializarObjetivosProyecto } from '../secciones/objetivos/mappers/objetivos-proyecto.mapper';
import { serializarRolesProyecto } from '../secciones/roles/mappers/roles-proyecto.mapper';
import { serializarTipoSolucionProyecto } from '../secciones/tipo-solucion/mappers/tipo-solucion-proyecto.mapper';

/** Aplica una sección sobre un contenido completo sin perder las demás secciones. */
export function aplicarActualizacionSeccionProyecto(
  contenido: ContenidoPersistibleProyecto,
  actualizacion: ActualizacionSeccionProyecto,
): ContenidoPersistibleProyecto {
  return { ...contenido, ...mapearCambioSeccionProyecto(actualizacion) };
}

/** Traduce una sección al único reemplazo parcial que le corresponde. */
export function mapearCambioSeccionProyecto(
  actualizacion: ActualizacionSeccionProyecto,
): Partial<ContenidoPersistibleProyecto> {
  switch (actualizacion.seccion) {
    case ClaveSeccionProyecto.Contexto:
      return { contexto: actualizacion.datos };
    case ClaveSeccionProyecto.TipoSolucion:
      return { tipoSolucionJson: serializarTipoSolucionProyecto(actualizacion.datos) };
    case ClaveSeccionProyecto.Necesidad:
      return { necesidadJson: serializarNecesidadProyecto(actualizacion.datos) };
    case ClaveSeccionProyecto.Objetivos:
      return { objetivosJson: serializarObjetivosProyecto(actualizacion.datos) };
    case ClaveSeccionProyecto.Alcance:
      return { alcanceJson: serializarAlcanceProyecto(actualizacion.datos) };
    case ClaveSeccionProyecto.Roles:
      return { rolesJson: serializarRolesProyecto(actualizacion.datos) };
    case ClaveSeccionProyecto.Equipo:
      return { equipoJson: serializarEquipoProyecto(actualizacion.datos) };
    case ClaveSeccionProyecto.Flujo:
      return { diagramFlujoJson: serializarFlujoProyecto(actualizacion.datos) };
  }
}
