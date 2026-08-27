import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { NotificadorErroresBorradorProyectoService } from './notificador-errores-borrador-proyecto.service';

describe('NotificadorErroresBorradorProyectoService', () => {
  const notificadorErrores = { comunicar: vi.fn() };
  let servicio: NotificadorErroresBorradorProyectoService;

  beforeEach(() => {
    vi.clearAllMocks();
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
      expect.any(HttpErrorResponse),
      expect.objectContaining({
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
      expect.any(HttpErrorResponse),
      expect.objectContaining({
        titulo: 'No fue posible guardar el tipo de solución',
        descripcion: 'Conservamos la selección para que puedas intentarlo nuevamente.',
      }),
    );
  });
});
