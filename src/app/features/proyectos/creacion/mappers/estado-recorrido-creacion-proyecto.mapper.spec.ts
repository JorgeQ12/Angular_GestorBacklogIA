import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { CLAVE_PASO_VINCULACION_AZURE } from '../config/pasos-creacion-proyecto.config';
import {
  construirEstadoRecorridoCreacion,
  obtenerUltimoPasoCreacion,
  obtenerPosicionVisualCreacion,
  puedeAbrirPasoCreacion,
} from './estado-recorrido-creacion-proyecto.mapper';

describe('estado del recorrido de creación', () => {
  it('mantiene el recorrido inicial sin pasos persistidos', () => {
    expect(construirEstadoRecorridoCreacion(CLAVE_PASO_VINCULACION_AZURE, null)).toEqual({
      pasoActual: CLAVE_PASO_VINCULACION_AZURE,
      pasosCompletados: [],
      pasosNavegables: [],
    });
  });

  it('conserva el máximo avance al regresar a un paso anterior', () => {
    expect(construirEstadoRecorridoCreacion(ClaveSeccionProyecto.Contexto, 4)).toEqual({
      pasoActual: ClaveSeccionProyecto.Contexto,
      pasosCompletados: [
        CLAVE_PASO_VINCULACION_AZURE,
        ClaveSeccionProyecto.Contexto,
        ClaveSeccionProyecto.TipoSolucion,
        ClaveSeccionProyecto.Necesidad,
      ],
      pasosNavegables: [
        ClaveSeccionProyecto.TipoSolucion,
        ClaveSeccionProyecto.Necesidad,
        ClaveSeccionProyecto.Objetivos,
      ],
    });
  });

  it('separa los pasos completados del siguiente paso alcanzado', () => {
    expect(construirEstadoRecorridoCreacion(ClaveSeccionProyecto.Objetivos, 4)).toEqual({
      pasoActual: ClaveSeccionProyecto.Objetivos,
      pasosCompletados: [
        CLAVE_PASO_VINCULACION_AZURE,
        ClaveSeccionProyecto.Contexto,
        ClaveSeccionProyecto.TipoSolucion,
        ClaveSeccionProyecto.Necesidad,
      ],
      pasosNavegables: [
        ClaveSeccionProyecto.Contexto,
        ClaveSeccionProyecto.TipoSolucion,
        ClaveSeccionProyecto.Necesidad,
      ],
    });
  });

  it('impide abrir pasos posteriores al avance persistido', () => {
    expect(puedeAbrirPasoCreacion(ClaveSeccionProyecto.Necesidad, 2)).toBe(false);
    expect(puedeAbrirPasoCreacion(ClaveSeccionProyecto.TipoSolucion, 2)).toBe(true);
  });

  it('incluye Azure al presentar la posición visual del avance', () => {
    expect(obtenerPosicionVisualCreacion(1)).toBe(2);
    expect(obtenerPosicionVisualCreacion(4)).toBe(5);
    expect(obtenerPosicionVisualCreacion(8)).toBe(9);
  });

  it('selecciona el último paso alcanzado sin depender de la URL', () => {
    expect(obtenerUltimoPasoCreacion(1)).toBe(ClaveSeccionProyecto.Contexto);
    expect(obtenerUltimoPasoCreacion(4)).toBe(ClaveSeccionProyecto.Objetivos);
    expect(obtenerUltimoPasoCreacion(99)).toBe(ClaveSeccionProyecto.Flujo);
  });
});
