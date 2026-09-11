import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import type {
  HistorialElementoPlanificacion,
  VersionElementoPlanificacion,
} from '../models/historial-elemento-planificacion.model';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';
import { ElementoPlanificacionService } from './elemento-planificacion.service';
import { EstadoHistorialElementoPlanificacionService } from './estado-historial-elemento-planificacion.service';

describe('EstadoHistorialElementoPlanificacionService', () => {
  const api = {
    obtenerHistorial: vi.fn(),
    obtenerVersion: vi.fn(),
  };
  const notificador = { comunicar: vi.fn() };
  let estado: EstadoHistorialElementoPlanificacionService;

  beforeEach(() => {
    vi.clearAllMocks();
    api.obtenerHistorial.mockReturnValue(of(PRIMERA_PAGINA));
    api.obtenerVersion.mockReturnValue(of(VERSION_TAREA));
    TestBed.configureTestingModule({
      providers: [
        EstadoHistorialElementoPlanificacionService,
        { provide: ElementoPlanificacionService, useValue: api },
        { provide: NotificadorErroresApiService, useValue: notificador },
      ],
    });
    estado = TestBed.inject(EstadoHistorialElementoPlanificacionService);
  });

  it('carga el historial y selecciona automáticamente la versión anterior más reciente', () => {
    estado.abrir(TipoElementoPlanificacion.Tarea, 783);

    expect(api.obtenerHistorial).toHaveBeenCalledWith(
      TipoElementoPlanificacion.Tarea,
      783,
      null,
    );
    expect(api.obtenerVersion).toHaveBeenCalledWith(
      TipoElementoPlanificacion.Tarea,
      783,
      91,
    );
    expect(estado.versionSeleccionada()).toEqual(VERSION_TAREA);
    expect(estado.hayMas()).toBe(true);
  });

  it('acumula la página siguiente usando el cursor recibido', () => {
    api.obtenerHistorial
      .mockReturnValueOnce(of(PRIMERA_PAGINA))
      .mockReturnValueOnce(
        of({
          registros: [{ versionId: 80, numeroVersion: 2, fechaCreacion: '2026-08-20T10:00:00' }],
          siguienteCursor: null,
          hayMas: false,
        } satisfies HistorialElementoPlanificacion),
      );
    estado.abrir(TipoElementoPlanificacion.Tarea, 783);

    estado.cargarMas();

    expect(api.obtenerHistorial).toHaveBeenLastCalledWith(
      TipoElementoPlanificacion.Tarea,
      783,
      3,
    );
    expect(estado.registros().map((version) => version.numeroVersion)).toEqual([3, 2]);
    expect(estado.hayMas()).toBe(false);
  });

  it('distingue el error del historial de una colección vacía válida', () => {
    api.obtenerHistorial.mockReturnValue(throwError(() => new Error('sin conexión')));

    estado.abrir(TipoElementoPlanificacion.Tarea, 783);

    expect(estado.errorHistorial()).toBe(true);
    expect(estado.registros()).toEqual([]);
    expect(notificador.comunicar).toHaveBeenCalledOnce();
  });
});

const PRIMERA_PAGINA: HistorialElementoPlanificacion = {
  registros: [{ versionId: 91, numeroVersion: 3, fechaCreacion: '2026-09-02T10:00:00' }],
  siguienteCursor: 3,
  hayMas: true,
};

const VERSION_TAREA: VersionElementoPlanificacion = {
  tipo: TipoElementoPlanificacion.Tarea,
  versionId: 91,
  elementoId: 783,
  numeroVersion: 3,
  titulo: 'Implementar servicio',
  descripcion: 'Versión anterior del servicio.',
  estimacionHoras: 8,
  fechaInicio: '2026-09-01T00:00:00',
  fechaFinal: '2026-09-05T00:00:00',
  fechaCreacion: '2026-09-02T10:00:00',
  dependencias: 'API disponible',
  actividadCatalogoId: 19,
  complejidad: 3,
};
