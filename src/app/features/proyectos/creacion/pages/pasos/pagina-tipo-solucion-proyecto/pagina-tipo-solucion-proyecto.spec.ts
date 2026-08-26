import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { BorradorProyecto } from '../../../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PaginaTipoSolucionProyecto } from './pagina-tipo-solucion-proyecto';

describe('PaginaTipoSolucionProyecto', () => {
  let fixture: ComponentFixture<PaginaTipoSolucionProyecto>;
  const estadoCreacion = {
    cargar: vi.fn(),
    guardarTipoSolucion: vi.fn(),
  };
  const router = { navigateByUrl: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    estadoCreacion.cargar.mockReturnValue(of(BORRADOR));
    estadoCreacion.guardarTipoSolucion.mockReturnValue(
      of({ ...BORRADOR, revision: 4, pasoActual: 3 }),
    );

    await TestBed.configureTestingModule({
      imports: [PaginaTipoSolucionProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { snapshot: { paramMap: convertToParamMap({ proyectoId: '42' }) } },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaTipoSolucionProyecto);
    fixture.detectChanges();
  });

  it('recupera el contrato canónico y presenta su selección', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const interfaz = elemento.querySelector<HTMLInputElement>(
      '#tipo-solucion-interfaz input:checked',
    );
    const plataforma = elemento.querySelector<HTMLInputElement>(
      '#tipo-solucion-plataforma input:checked',
    );

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(interfaz?.value).toBe('true');
    expect(plataforma?.value).toBe('Web');
  });

  it('guarda la selección y abre Necesidad', () => {
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarTipoSolucion).toHaveBeenCalledWith({
      tieneInterfaz: true,
      plataforma: 'Web',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/panel/proyectos/42/creacion/necesidad');
  });
});

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 3,
  pasoActual: 2,
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
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};
