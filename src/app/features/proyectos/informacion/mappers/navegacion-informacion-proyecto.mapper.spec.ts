import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { ClavePasoEspecialProyecto } from '../../config/pasos-proyecto.config';
import {
  obtenerPasoInformacionProyecto,
  obtenerVersionIdInformacionProyecto,
} from './navegacion-informacion-proyecto.mapper';

describe('navegación de Información del proyecto', () => {
  it('admite únicamente claves de sección registradas', () => {
    expect(obtenerPasoInformacionProyecto(ClaveSeccionProyecto.Equipo)).toBe(
      ClaveSeccionProyecto.Equipo,
    );
    expect(obtenerPasoInformacionProyecto('desconocida')).toBe(
      ClavePasoEspecialProyecto.VinculacionAzure,
    );
  });

  it('admite únicamente identificadores positivos de versión', () => {
    expect(obtenerVersionIdInformacionProyecto('23')).toBe(23);
    expect(obtenerVersionIdInformacionProyecto('0')).toBeNull();
    expect(obtenerVersionIdInformacionProyecto('texto')).toBeNull();
  });
});
