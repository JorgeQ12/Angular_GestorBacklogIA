import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MensajesService } from './mensajes.service';
import { NotificadorErroresApiService } from './notificador-errores-api.service';

describe('NotificadorErroresApiService', () => {
  const mensajes = { error: vi.fn() };
  let servicio: NotificadorErroresApiService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [NotificadorErroresApiService, { provide: MensajesService, useValue: mensajes }],
    });
    servicio = TestBed.inject(NotificadorErroresApiService);
  });

  it('prioriza el mensaje y los detalles comunicados por el backend', () => {
    servicio.comunicar(
      new HttpErrorResponse({
        status: 400,
        error: {
          exitoso: false,
          tipo: 4,
          datos: null,
          mensaje: 'No encontramos la épica indicada.',
          codigoError: 'epica_no_encontrada',
          errores: ['Comprueba el ID registrado en Azure.'],
        },
      }),
      CONTEXTO,
    );

    expect(mensajes.error).toHaveBeenCalledWith(
      'No fue posible consultar Azure',
      'No encontramos la épica indicada.',
      ['Comprueba el ID registrado en Azure.'],
    );
  });

  it('usa el mensaje local cuando el error no contiene información presentable', () => {
    servicio.comunicar(new Error('Detalle técnico'), CONTEXTO);

    expect(mensajes.error).toHaveBeenCalledWith(
      'No fue posible consultar Azure',
      'Revisa los datos e intenta nuevamente.',
      [],
    );
  });

  it('permite especializar un conflicto sin reemplazar un mensaje funcional', () => {
    servicio.comunicar(new HttpErrorResponse({ status: 409 }), {
      ...CONTEXTO,
      mensajesPorEstado: {
        409: {
          titulo: 'El borrador cambió',
          descripcion: 'Recarga la información antes de continuar.',
        },
      },
    });

    expect(mensajes.error).toHaveBeenCalledWith(
      'El borrador cambió',
      'Recarga la información antes de continuar.',
      [],
    );
  });
});

const CONTEXTO = {
  titulo: 'No fue posible consultar Azure',
  descripcion: 'Revisa los datos e intenta nuevamente.',
};
