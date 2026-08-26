import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { serializarAlcanceProyecto } from '../../secciones/alcance/mappers/alcance-proyecto.mapper';
import { serializarNecesidadProyecto } from '../../secciones/necesidad/mappers/necesidad-proyecto.mapper';
import { serializarObjetivosProyecto } from '../../secciones/objetivos/mappers/objetivos-proyecto.mapper';
import { serializarTipoSolucionProyecto } from '../../secciones/tipo-solucion/mappers/tipo-solucion-proyecto.mapper';
import { ActualizacionSeccionBorrador } from '../models/actualizacion-seccion-borrador.model';
import { CambiosBorradorProyecto } from '../models/borrador-proyecto.model';

/** Convierte una actualización de dominio en el reemplazo requerido por el borrador. */
export function mapearCambioSeccionBorrador(
  actualizacion: ActualizacionSeccionBorrador,
): CambiosBorradorProyecto {
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
  }
}
