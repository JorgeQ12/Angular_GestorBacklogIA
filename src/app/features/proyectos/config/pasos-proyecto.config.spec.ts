import { SECCIONES_PROYECTO } from './secciones-proyecto.config';
import {
  ClavePasoEspecialProyecto,
  PASOS_PROYECTO,
  construirIdFormularioPasoProyecto,
  obtenerPasoProyecto,
} from './pasos-proyecto.config';

describe('PASOS_PROYECTO', () => {
  it('agrega Azure antes de las secciones sin duplicar su configuración', () => {
    expect(PASOS_PROYECTO[0]?.clave).toBe(ClavePasoEspecialProyecto.VinculacionAzure);
    expect(PASOS_PROYECTO.slice(1)).toEqual(SECCIONES_PROYECTO);
  });

  it('resuelve la presentación desde el catálogo único', () => {
    expect(obtenerPasoProyecto(ClavePasoEspecialProyecto.VinculacionAzure).titulo).toBe(
      'Azure DevOps',
    );
  });

  it('construye el identificador estable del formulario asociado', () => {
    expect(construirIdFormularioPasoProyecto(ClavePasoEspecialProyecto.VinculacionAzure)).toBe(
      'formulario-paso-vinculacion-azure',
    );
  });
});
