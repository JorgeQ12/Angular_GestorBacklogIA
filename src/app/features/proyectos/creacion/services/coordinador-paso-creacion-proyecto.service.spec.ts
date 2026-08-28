import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { ActualizacionSeccionBorrador } from '../models/actualizacion-seccion-borrador.model';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from './coordinador-paso-creacion-proyecto.service';
import { EstadoCreacionProyectoService } from './estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from './notificador-errores-borrador-proyecto.service';

describe('CoordinadorPasoCreacionProyectoService', () => {
  let servicio: CoordinadorPasoCreacionProyectoService;
  let carga$: Subject<BorradorProyecto>;
  let guardado$: Subject<BorradorProyecto>;
  let proyectoId: ReturnType<typeof signal<number | null>>;
  const estadoCreacion = {
    proyectoId: () => proyectoId(),
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };
  const notificadorErrores = { comunicar: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    proyectoId = signal<number | null>(42);
    carga$ = new Subject<BorradorProyecto>();
    guardado$ = new Subject<BorradorProyecto>();
    estadoCreacion.cargar.mockReturnValue(carga$);
    estadoCreacion.guardarSeccion.mockReturnValue(guardado$);

    TestBed.configureTestingModule({
      providers: [
        CoordinadorPasoCreacionProyectoService,
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        { provide: NotificadorErroresBorradorProyectoService, useValue: notificadorErrores },
      ],
    });
    servicio = TestBed.inject(CoordinadorPasoCreacionProyectoService);
    TestBed.flushEffects();
  });

  it('expone el borrador únicamente después de completar su carga', () => {
    servicio.cargar();

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(servicio.contenidoListo()).toBe(false);

    carga$.next(BORRADOR);

    expect(servicio.borrador()).toEqual(BORRADOR);
    expect(servicio.contenidoListo()).toBe(true);
    expect(servicio.errorCarga()).toBe(false);
  });

  it('presenta el estado reintentable cuando falla la carga', () => {
    estadoCreacion.cargar.mockReturnValue(throwError(() => new Error('Sin conexión')));

    servicio.cargar();

    expect(servicio.errorCarga()).toBe(true);
    expect(servicio.contenidoListo()).toBe(false);
  });

  it('descarta la fotografía anterior al cambiar el proyecto activo', () => {
    servicio.cargar();
    carga$.next(BORRADOR);
    const nuevaCarga$ = new Subject<BorradorProyecto>();
    estadoCreacion.cargar.mockReturnValue(nuevaCarga$);

    proyectoId.set(84);
    TestBed.flushEffects();

    expect(estadoCreacion.cargar).toHaveBeenLastCalledWith(84);
    expect(servicio.borrador()).toBeNull();
    expect(servicio.contenidoListo()).toBe(false);

    nuevaCarga$.next({ ...BORRADOR, id: 84 });
    expect(servicio.borrador()?.id).toBe(84);
  });

  it('guarda una sola vez y notifica al componente que puede continuar', () => {
    const alCompletar = vi.fn();
    servicio.guardar(ACTUALIZACION, alCompletar);
    servicio.guardar(ACTUALIZACION, alCompletar);

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledTimes(1);
    guardado$.next({ ...BORRADOR, revision: 4 });
    guardado$.complete();

    expect(alCompletar).toHaveBeenCalledOnce();
    expect(servicio.procesando()).toBe(false);
  });

  it('delega el error de guardado con la identidad de la sección', () => {
    const error = new Error('No fue posible guardar');
    estadoCreacion.guardarSeccion.mockReturnValue(throwError(() => error));

    servicio.guardar(ACTUALIZACION, vi.fn());

    expect(notificadorErrores.comunicar).toHaveBeenCalledWith(
      error,
      ClaveSeccionProyecto.Necesidad,
    );
    expect(servicio.procesando()).toBe(false);
  });
});

const ACTUALIZACION: ActualizacionSeccionBorrador = {
  seccion: ClaveSeccionProyecto.Necesidad,
  datos: { situacionActual: 'Registro manual', problemas: 'Reprocesos', impacto: 'Costos' },
};

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 3,
  pasoActual: 3,
  equipoAzure: null,
  contexto: {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión del backlog.',
    prioridadCatalogoId: 14,
    fechaObjetivo: '2026-09-30',
  },
  estadoCatalogoId: null,
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson: '{}',
  objetivosJson: '{}',
  alcanceJson: '{}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};
