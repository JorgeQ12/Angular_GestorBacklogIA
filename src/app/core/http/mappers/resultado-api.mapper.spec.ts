import { ResultadoApi } from '../models/resultado-api.model';
import { exigirDatosResultadoApi } from './resultado-api.mapper';

describe('mapeador de ResultadoApi', () => {
  it.each([0, false, ''])('conserva un dato válido aunque sea falsy: %s', (datos) => {
    expect(exigirDatosResultadoApi(crearResultado(datos), 'el recurso')).toBe(datos);
  });

  it('prioriza los errores funcionales proporcionados por el API', () => {
    const resultado = crearResultado<string>(null, false, ['Primer error', 'Segundo error']);

    expect(() => exigirDatosResultadoApi(resultado, 'el recurso')).toThrow(
      'Primer error Segundo error',
    );
  });

  it('utiliza el mensaje funcional cuando no existen errores detallados', () => {
    const resultado = crearResultado<string>(null, false, null, 'Solicitud inválida');

    expect(() => exigirDatosResultadoApi(resultado, 'el recurso')).toThrow('Solicitud inválida');
  });

  it('describe el recurso cuando el API no proporciona un detalle', () => {
    expect(() => exigirDatosResultadoApi(crearResultado(null), 'el resumen')).toThrow(
      'El backend no proporcionó el resumen.',
    );
  });
});

function crearResultado<T>(
  datos: T | null,
  exitoso = true,
  errores: readonly string[] | null = null,
  mensaje: string | null = null,
): ResultadoApi<T> {
  return {
    exitoso,
    tipo: exitoso ? 1 : 4,
    datos,
    mensaje,
    codigoError: null,
    errores,
  };
}
