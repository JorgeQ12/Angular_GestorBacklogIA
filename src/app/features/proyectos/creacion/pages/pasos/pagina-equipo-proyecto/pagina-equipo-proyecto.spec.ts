import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../../../core/mensajes/services/notificador-errores-api.service';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { BorradorProyecto } from '../../../models/borrador-proyecto.model';
import { CreacionProyectoService } from '../../../services/creacion-proyecto.service';
import { ContenidoEncabezadoPasoCreacionService } from '../../../services/contenido-encabezado-paso-creacion.service';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PaginaEquipoProyecto } from './pagina-equipo-proyecto';

describe('PaginaEquipoProyecto', () => {
  let fixture: ComponentFixture<PaginaEquipoProyecto>;
  const estadoCreacion = {
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };
  const creacionProyecto = { sincronizarEquipoAzure: vi.fn() };
  const router = { navigateByUrl: vi.fn() };
  const notificadorErroresApi = { comunicar: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    estadoCreacion.cargar.mockReturnValue(of(BORRADOR));
    estadoCreacion.guardarSeccion.mockReturnValue(of({ ...BORRADOR, revision: 9, pasoActual: 8 }));
    creacionProyecto.sincronizarEquipoAzure.mockReturnValue(of(BORRADOR.equipoAzure));

    await TestBed.configureTestingModule({
      imports: [PaginaEquipoProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        { provide: CreacionProyectoService, useValue: creacionProyecto },
        ContenidoEncabezadoPasoCreacionService,
        { provide: NotificadorErroresApiService, useValue: notificadorErroresApi },
        { provide: NotificadorErroresBorradorProyectoService, useValue: { comunicar: vi.fn() } },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { snapshot: { paramMap: convertToParamMap({ proyectoId: '42' }) } },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaEquipoProyecto);
    fixture.detectChanges();
  });

  it('restaura las asignaciones guardadas sin sincronizar nuevamente', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const encabezado = TestBed.inject(ContenidoEncabezadoPasoCreacionService).contenido();

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(creacionProyecto.sincronizarEquipoAzure).not.toHaveBeenCalled();
    expect(encabezado?.detallePrincipal()).toBe('Producto digital');
    expect(encabezado?.detalleSecundario()).toBe('1 configurados · 0 pendientes');
    expect(elemento.textContent).toContain('Jorge Quintero');
  });

  it('sincroniza Azure al ingresar cuando Equipo aún no tiene configuración', () => {
    estadoCreacion.cargar.mockReturnValueOnce(of({ ...BORRADOR, equipoJson: '[]' }));
    const fixtureSinEquipo = TestBed.createComponent(PaginaEquipoProyecto);
    fixtureSinEquipo.detectChanges();

    expect(creacionProyecto.sincronizarEquipoAzure).toHaveBeenCalledOnce();
    expect(creacionProyecto.sincronizarEquipoAzure).toHaveBeenCalledWith(42);
    expect((fixtureSinEquipo.nativeElement as HTMLElement).textContent).toContain('Jorge Quintero');
  });

  it('guarda Equipo y abre Flujo de usuario', () => {
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
    expect(router.navigateByUrl).toHaveBeenCalledWith('/panel/proyectos/42/creacion/flujo');
  });

  it('actualiza Azure conservando las asignaciones vigentes', () => {
    creacionProyecto.sincronizarEquipoAzure.mockClear();
    const encabezado = TestBed.inject(ContenidoEncabezadoPasoCreacionService).contenido();
    encabezado?.accion?.ejecutar();
    fixture.detectChanges();

    expect(creacionProyecto.sincronizarEquipoAzure).toHaveBeenCalledOnce();
    expect(creacionProyecto.sincronizarEquipoAzure).toHaveBeenCalledWith(42);
    expect(encabezado?.detalleSecundario()).toBe('1 configurados · 0 pendientes');
  });
});

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 8,
  pasoActual: 7,
  equipoAzure: {
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
  },
  contexto: {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión inteligente del backlog.',
    prioridadCatalogoId: 14,
    fechaObjetivo: '2026-09-30',
  },
  estadoCatalogoId: null,
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson: '{}',
  objetivosJson: '{}',
  alcanceJson: '{}',
  rolesJson: '[]',
  equipoJson:
    '[{"idAzure":"usuario-1","nombre":"Nombre anterior","correo":null,"esAdministradorAzure":false,"perfilTecnicoCodigo":"devops","dedicacionCodigo":"100"}]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};
