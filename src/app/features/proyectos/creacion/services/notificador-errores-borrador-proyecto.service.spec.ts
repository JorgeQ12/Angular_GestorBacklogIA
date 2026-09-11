import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { NotificadorErroresBorradorProyectoService } from './notificador-errores-borrador-proyecto.service';

describe('NotificadorErroresBorradorProyectoService', () => {
  const notificadorErrores = { comunicar: jasmine.createSpy('comunicar') };
  let servicio: NotificadorErroresBorradorProyectoService;

  beforeEach(() => {
    notificadorErrores.comunicar.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        NotificadorErroresBorradorProyectoService,
        { provide: NotificadorErroresApiService, useValue: notificadorErrores },
      ],
    });
    servicio = TestBed.inject(NotificadorErroresBorradorProyectoService);
  });

  it('presenta el conflicto de revisión de forma uniforme', () => {
    servicio.comunicar(new HttpErrorResponse({ status: 409 }), ClaveSeccionProyecto.Necesidad);

    expect(notificadorErrores.comunicar).toHaveBeenCalledWith(
      jasmine.any(HttpErrorResponse),
      jasmine.objectContaining({
        mensajesPorEstado: {
          409: {
            titulo: 'El borrador cambió',
            descripcion:
              'Otra actualización modificó el proyecto. Recarga la información antes de continuar.',
          },
        },
      }),
    );
  });

  it('presenta el mensaje particular cuando no existe conflicto', () => {
    servicio.comunicar(new HttpErrorResponse({ status: 500 }), ClaveSeccionProyecto.TipoSolucion);

    expect(notificadorErrores.comunicar).toHaveBeenCalledWith(
      jasmine.any(HttpErrorResponse),
      jasmine.objectContaining({
        titulo: 'No fue posible guardar el tipo de solución',
        descripcion: 'Conservamos la selección para que puedas intentarlo nuevamente.',
      }),
    );
  });
});
