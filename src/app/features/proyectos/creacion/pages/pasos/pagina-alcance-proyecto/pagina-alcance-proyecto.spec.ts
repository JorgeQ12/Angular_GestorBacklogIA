import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { BorradorProyecto } from '../../../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PaginaAlcanceProyecto } from './pagina-alcance-proyecto';

describe('PaginaAlcanceProyecto', () => {
  let fixture: ComponentFixture<PaginaAlcanceProyecto>;
  const estadoCreacion = {
    cargar: vi.fn(),
    guardarAlcance: vi.fn(),
  };
  const router = { navigateByUrl: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    estadoCreacion.cargar.mockReturnValue(of(BORRADOR));
    estadoCreacion.guardarAlcance.mockReturnValue(of({ ...BORRADOR, revision: 7, pasoActual: 6 }));

    await TestBed.configureTestingModule({
      imports: [PaginaAlcanceProyecto],
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
    fixture = TestBed.createComponent(PaginaAlcanceProyecto);
    fixture.detectChanges();
  });

  it('recupera el contrato canónico y presenta el alcance', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(obtenerControl(elemento, '#alcance-incluido').value).toBe('Seguimiento de envíos');
    expect(obtenerControl(elemento, '#alcance-excluido').value).toBe('Pagos en línea');
  });

  it('guarda el alcance y abre Roles', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    escribir(elemento, '#alcance-incluido', 'Consulta de estados');
    escribir(elemento, '#alcance-excluido', 'Facturación electrónica');
    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarAlcance).toHaveBeenCalledWith({
      incluido: 'Consulta de estados',
      excluido: 'Facturación electrónica',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/panel/proyectos/42/creacion/roles');
  });
});

function obtenerControl(elemento: HTMLElement, selector: string): HTMLTextAreaElement {
  return elemento.querySelector(selector) as HTMLTextAreaElement;
}

function escribir(elemento: HTMLElement, selector: string, valor: string): void {
  const control = obtenerControl(elemento, selector);
  control.value = valor;
  control.dispatchEvent(new Event('input'));
}

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 6,
  pasoActual: 5,
  contexto: {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión inteligente del backlog.',
    prioridadCatalogoId: 14,
    fechaObjetivo: '2026-09-30',
  },
  estadoCatalogoId: null,
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson:
    '{"situacionActual":"Registro manual","problemas":"Reprocesos","impacto":"Tiempos altos"}',
  objetivosJson:
    '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar tareas"]}',
  alcanceJson: '{"incluido":"Seguimiento de envíos","excluido":"Pagos en línea"}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};
