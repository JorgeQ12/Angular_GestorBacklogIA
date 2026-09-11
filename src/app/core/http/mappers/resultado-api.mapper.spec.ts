import { ResultadoApi } from '../models/resultado-api.model';
import { exigirDatosResultadoApi, exigirExitoResultadoApi } from './resultado-api.mapper';

describe('mapeador de ResultadoApi', () => {
  [0, false, ''].forEach((datos) => {
    it(`conserva un dato válido aunque sea falsy: ${datos}`, () => {
      expect(exigirDatosResultadoApi(crearResultado(datos), 'el recurso')).toBe(datos);
    });
  });

  it('prioriza los errores funcionales proporcionados por el API', () => {
    const resultado = crearResultado<string>(null, false, ['Primer error', 'Segundo error']);

    expect(() => exigirDatosResultadoApi(resultado, 'el recurso')).toThrowError(
      /Primer error Segundo error/,
    );
  });

  it('utiliza el mensaje funcional cuando no existen errores detallados', () => {
    const resultado = crearResultado<string>(null, false, null, 'Solicitud inválida');

    expect(() => exigirDatosResultadoApi(resultado, 'el recurso')).toThrowError(/Solicitud inválida/);
  });

  it('describe el recurso cuando el API no proporciona un detalle', () => {
    expect(() => exigirDatosResultadoApi(crearResultado(null), 'el resumen')).toThrowError(
      /El backend no proporcionó el resumen\./,
    );
  });

  it('acepta una operación exitosa aunque no devuelva datos', () => {
    expect(() => exigirExitoResultadoApi(crearResultado(null), 'la actualización')).not.toThrow();
  });

  it('rechaza una operación sin datos cuando el API informa un error funcional', () => {
    const resultado = crearResultado(null, false, ['No fue posible actualizar']);

    expect(() => exigirExitoResultadoApi(resultado, 'la actualización')).toThrowError(
      /No fue posible actualizar/,
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
