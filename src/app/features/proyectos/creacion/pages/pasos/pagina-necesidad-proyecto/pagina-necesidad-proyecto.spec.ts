import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { BorradorProyecto } from '../../../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PaginaNecesidadProyecto } from './pagina-necesidad-proyecto';

describe('PaginaNecesidadProyecto', () => {
  let fixture: ComponentFixture<PaginaNecesidadProyecto>;
  const estadoCreacion = {
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };
  const router = { navigateByUrl: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    estadoCreacion.cargar.mockReturnValue(of(BORRADOR));
    estadoCreacion.guardarSeccion.mockReturnValue(of({ ...BORRADOR, revision: 5, pasoActual: 4 }));

    await TestBed.configureTestingModule({
      imports: [PaginaNecesidadProyecto],
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
    fixture = TestBed.createComponent(PaginaNecesidadProyecto);
    fixture.detectChanges();
  });

  it('recupera el contrato canónico y presenta la necesidad', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(obtenerTextarea(elemento, '#necesidad-situacion-actual').value).toBe('Registro manual');
    expect(obtenerTextarea(elemento, '#necesidad-problemas').value).toBe('No existe trazabilidad');
    expect(obtenerTextarea(elemento, '#necesidad-impacto').value).toBe('Aumentan los tiempos');
  });

  it('guarda la necesidad y abre Objetivos', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    escribir(elemento, '#necesidad-situacion-actual', 'Proceso manual');
    escribir(elemento, '#necesidad-problemas', 'Reprocesos');
    escribir(elemento, '#necesidad-impacto', 'Costos altos');
    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.Necesidad,
      datos: {
        situacionActual: 'Proceso manual',
        problemas: 'Reprocesos',
        impacto: 'Costos altos',
      },
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/panel/proyectos/42/creacion/objetivos');
  });
});

function obtenerTextarea(elemento: HTMLElement, selector: string): HTMLTextAreaElement {
  return elemento.querySelector(selector) as HTMLTextAreaElement;
}

function escribir(elemento: HTMLElement, selector: string, valor: string): void {
  const control = obtenerTextarea(elemento, selector);
  control.value = valor;
  control.dispatchEvent(new Event('input'));
}

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 4,
  pasoActual: 3,
  equipoAzure: null,
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
    '{"situacionActual":"Registro manual","problemas":"No existe trazabilidad","impacto":"Aumentan los tiempos"}',
  objetivosJson: '{}',
  alcanceJson: '{}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};
