import { HttpErrorResponse } from '@angular/common/http';
import { normalizarErrorApi } from './error-api.mapper';

describe('normalizador de errores del API', () => {
  it('extrae el mensaje, código y detalles del sobre retornado por el backend', () => {
    const error = normalizarErrorApi(
      new HttpErrorResponse({
        status: 400,
        error: {
          exitoso: false,
          tipo: 4,
          datos: null,
          mensaje: 'La épica indicada no existe.',
          codigoError: 'epica_no_encontrada',
          errores: ['Verifica el identificador de la épica.'],
        },
      }),
    );

    expect(error).toEqual(
      expect.objectContaining({
        estadoHttp: 400,
        codigo: 'epica_no_encontrada',
        mensajeUsuario: 'La épica indicada no existe.',
        detalles: ['Verifica el identificador de la épica.'],
        origen: 'http',
      }),
    );
  });

  it('adapta errores de validación con formato Problem Details', () => {
    const error = normalizarErrorApi(
      new HttpErrorResponse({
        status: 400,
        error: {
          title: 'La solicitud contiene errores.',
          errors: {
            idEpica: ['El identificador es obligatorio.'],
            urlBoard: ['El enlace no es válido.'],
          },
        },
      }),
    );

    expect(error.mensajeUsuario).toBe('La solicitud contiene errores.');
    expect(error.detalles).toEqual(['El identificador es obligatorio.', 'El enlace no es válido.']);
  });

  it('no expone una respuesta HTML como mensaje para el usuario', () => {
    const error = normalizarErrorApi(
      new HttpErrorResponse({ status: 502, error: '<html>Error del proxy</html>' }),
    );

    expect(error.mensajeUsuario).toBeNull();
  });
});
