import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { BorradorProyecto } from '../../../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PaginaObjetivosProyecto } from './pagina-objetivos-proyecto';

describe('PaginaObjetivosProyecto', () => {
  let fixture: ComponentFixture<PaginaObjetivosProyecto>;
  const estadoCreacion = {
    seleccionarProyecto: vi.fn(),
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };
  const router = { navigateByUrl: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    estadoCreacion.cargar.mockReturnValue(of(BORRADOR));
    estadoCreacion.guardarSeccion.mockReturnValue(of({ ...BORRADOR, revision: 6, pasoActual: 5 }));

    await TestBed.configureTestingModule({
      imports: [PaginaObjetivosProyecto],
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
            parent: { paramMap: of(convertToParamMap({ proyectoId: '42' })) },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaObjetivosProyecto);
    fixture.detectChanges();
  });

  it('recupera el contrato canónico y presenta los objetivos', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(obtenerControl(elemento, '#objetivos-general').value).toBe('Reducir tiempos');
    expect(obtenerControl(elemento, '#objetivos-especifico-0').value).toBe('Automatizar tareas');
    expect(obtenerControl(elemento, '#objetivos-especifico-1').value).toBe('Medir resultados');
  });

  it('guarda los objetivos y abre Alcance', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    escribir(elemento, '#objetivos-general', 'Mejorar la operación');
    escribir(elemento, '#objetivos-especifico-0', 'Reducir reprocesos');
    escribir(elemento, '#objetivos-especifico-1', 'Medir resultados');
    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.Objetivos,
      datos: {
        objetivoGeneral: 'Mejorar la operación',
        objetivosEspecificos: ['Reducir reprocesos', 'Medir resultados'],
      },
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/panel/proyectos/42/creacion/alcance');
  });
});

function obtenerControl(
  elemento: HTMLElement,
  selector: string,
): HTMLInputElement | HTMLTextAreaElement {
  return elemento.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
}

function escribir(elemento: HTMLElement, selector: string, valor: string): void {
  const control = obtenerControl(elemento, selector);
  control.value = valor;
  control.dispatchEvent(new Event('input'));
}

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 5,
  pasoActual: 4,
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
    '{"situacionActual":"Registro manual","problemas":"Reprocesos","impacto":"Tiempos altos"}',
  objetivosJson:
    '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar tareas","Medir resultados"]}',
  alcanceJson: '{}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};
