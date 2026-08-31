import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../../../core/mensajes/services/notificador-errores-api.service';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { type OrigenEquipoAzureProyecto } from '../../../../secciones/equipo/models/equipo-proyecto.model';
import { ContenidoEncabezadoPasoCreacionService } from '../../../services/contenido-encabezado-paso-creacion.service';
import { CreacionProyectoService } from '../../../services/creacion-proyecto.service';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PasoEquipoProyecto } from './paso-equipo-proyecto';

describe('PasoEquipoProyecto', () => {
  let fixture: ComponentFixture<PasoEquipoProyecto>;
  let proyectoId: ReturnType<typeof signal<number | null>>;
  const equipoGuardado = {
    equipoAzure: {
      idEquipo: 'team-1',
      nombreEquipo: 'Producto digital',
      fechaSincronizacion: null,
      integrantes: [],
    },
    equipoJson:
      '[{"idAzure":"usuario-1","nombre":"Nombre anterior","correo":null,"esAdministradorAzure":false,"perfilTecnicoCodigo":"devops","dedicacionCodigo":"100"}]',
  };
  const estadoCreacion = {
    proyectoId: () => proyectoId(),
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };
  const creacionProyecto = { sincronizarEquipoAzure: vi.fn() };
  const notificadorErroresApi = { comunicar: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    proyectoId = signal<number | null>(42);
    estadoCreacion.cargar.mockReturnValue(of(equipoGuardado));
    estadoCreacion.guardarSeccion.mockReturnValue(of(equipoGuardado));
    creacionProyecto.sincronizarEquipoAzure.mockReturnValue(of(EQUIPO_AZURE_SINCRONIZADO));

    await TestBed.configureTestingModule({
      imports: [PasoEquipoProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        { provide: CreacionProyectoService, useValue: creacionProyecto },
        ContenidoEncabezadoPasoCreacionService,
        { provide: NotificadorErroresApiService, useValue: notificadorErroresApi },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PasoEquipoProyecto);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('sincroniza la membresía ausente y conserva las asignaciones guardadas', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const encabezado = TestBed.inject(ContenidoEncabezadoPasoCreacionService).contenido();

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(creacionProyecto.sincronizarEquipoAzure).toHaveBeenCalledWith(42);
    expect(encabezado?.detallePrincipal()).toBe('Producto digital');
    expect(encabezado?.detalleSecundario()).toBe('1 configurados · 0 pendientes');
    expect(elemento.textContent).toContain('Jorge Quintero');
  });

  it('mantiene visible el equipo guardado mientras Azure responde', () => {
    creacionProyecto.sincronizarEquipoAzure.mockClear();
    creacionProyecto.sincronizarEquipoAzure.mockReturnValueOnce(NEVER);
    const fixtureSinRespuesta = TestBed.createComponent(PasoEquipoProyecto);
    TestBed.flushEffects();
    fixtureSinRespuesta.detectChanges();

    expect(creacionProyecto.sincronizarEquipoAzure).toHaveBeenCalledOnce();
    expect((fixtureSinRespuesta.nativeElement as HTMLElement).textContent).toContain(
      'Nombre anterior',
    );
  });

  it('evita sincronizar automáticamente cuando el borrador ya trae la membresía', () => {
    creacionProyecto.sincronizarEquipoAzure.mockClear();
    estadoCreacion.cargar.mockReturnValueOnce(
      of({ ...equipoGuardado, equipoAzure: EQUIPO_AZURE_SINCRONIZADO }),
    );
    const fixtureConMembresia = TestBed.createComponent(PasoEquipoProyecto);
    TestBed.flushEffects();
    fixtureConMembresia.detectChanges();

    expect(creacionProyecto.sincronizarEquipoAzure).not.toHaveBeenCalled();
    expect((fixtureConMembresia.nativeElement as HTMLElement).textContent).toContain(
      'Jorge Quintero',
    );
  });

  it('guarda Equipo y comunica que el recorrido puede continuar', () => {
    const completado = vi.fn();
    fixture.componentInstance.completado.subscribe(completado);

    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.Equipo,
      datos: {
        integrantes: [
          expect.objectContaining({
            idAzure: 'usuario-1',
            perfilTecnicoCodigo: 'devops',
            dedicacionCodigo: '100',
          }),
        ],
      },
    });
    expect(completado).toHaveBeenCalledOnce();
  });

  it('permite actualizar Azure desde la acción pública del encabezado', () => {
    creacionProyecto.sincronizarEquipoAzure.mockClear();
    const encabezado = TestBed.inject(ContenidoEncabezadoPasoCreacionService).contenido();

    encabezado?.accion?.ejecutar();
    fixture.detectChanges();

    expect(creacionProyecto.sincronizarEquipoAzure).toHaveBeenCalledWith(42);
    expect(encabezado?.detalleSecundario()).toBe('1 configurados · 0 pendientes');
  });
});

const EQUIPO_AZURE_SINCRONIZADO: OrigenEquipoAzureProyecto = {
  idEquipo: 'team-1',
  nombreEquipo: 'Producto digital',
  fechaSincronizacion: null,
  integrantes: [
    {
      idAzure: 'usuario-1',
      nombre: 'Jorge Quintero',
      correo: 'jorge@interia.co',
      esAdministradorAzure: true,
    },
  ],
};
