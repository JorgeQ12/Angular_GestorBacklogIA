import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { NotificadorErroresBorradorProyectoService } from './notificador-errores-borrador-proyecto.service';

describe('NotificadorErroresBorradorProyectoService', () => {
  const mensajes = { error: vi.fn() };
  let servicio: NotificadorErroresBorradorProyectoService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        NotificadorErroresBorradorProyectoService,
        { provide: MensajesService, useValue: mensajes },
      ],
    });
    servicio = TestBed.inject(NotificadorErroresBorradorProyectoService);
  });

  it('presenta el conflicto de revisión de forma uniforme', () => {
    servicio.comunicar(new HttpErrorResponse({ status: 409 }), 'necesidad');

    expect(mensajes.error).toHaveBeenCalledWith(
      'El borrador cambió',
      'Otra actualización modificó el proyecto. Recarga la información antes de continuar.',
    );
  });

  it('presenta el mensaje particular cuando no existe conflicto', () => {
    servicio.comunicar(new HttpErrorResponse({ status: 500 }), 'tipoSolucion');

    expect(mensajes.error).toHaveBeenCalledWith(
      'No fue posible guardar el tipo de solución',
      'Conservamos la selección para que puedas intentarlo nuevamente.',
    );
  });
});
