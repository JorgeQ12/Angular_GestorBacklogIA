import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MensajesService } from '../../../../../../core/mensajes/services/mensajes.service';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { BorradorProyecto } from '../../../models/borrador-proyecto.model';
import { CreacionProyectoService } from '../../../services/creacion-proyecto.service';
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
  const mensajes = { error: vi.fn() };

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
        { provide: MensajesService, useValue: mensajes },
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

  it('combina la identidad de Azure con las asignaciones guardadas', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(elemento.textContent).toContain('Producto digital');
    expect(elemento.textContent).toContain('Jorge Quintero');
    expect(elemento.textContent).toContain('1 configurados · 0 pendientes');
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
    const boton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((elemento) => elemento.textContent?.includes('Actualizar desde Azure'));
    boton?.click();
    fixture.detectChanges();

    expect(creacionProyecto.sincronizarEquipoAzure).toHaveBeenCalledWith(42);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('1 configurados');
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
