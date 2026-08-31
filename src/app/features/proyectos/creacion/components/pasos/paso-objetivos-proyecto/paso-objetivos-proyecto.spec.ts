import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { crearBorradorProyectoPrueba } from '../../../testing/crear-borrador-proyecto-prueba';
import { PasoObjetivosProyecto } from './paso-objetivos-proyecto';

describe('PasoObjetivosProyecto', () => {
  let fixture: ComponentFixture<PasoObjetivosProyecto>;
  let proyectoId: ReturnType<typeof signal<number | null>>;
  const borrador = crearBorradorProyectoPrueba({
    objetivosJson:
      '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar tareas","Medir resultados"]}',
  });
  const estadoCreacion = {
    proyectoId: () => proyectoId(),
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    proyectoId = signal<number | null>(42);
    estadoCreacion.cargar.mockReturnValue(of(borrador));
    estadoCreacion.guardarSeccion.mockReturnValue(of({ ...borrador, revision: 4 }));

    await TestBed.configureTestingModule({
      imports: [PasoObjetivosProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PasoObjetivosProyecto);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('hidrata el formulario con los objetivos del borrador', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(obtenerControl(elemento, '#objetivos-general').value).toBe('Reducir tiempos');
    expect(obtenerControl(elemento, '#objetivos-especifico-0').value).toBe('Automatizar tareas');
    expect(obtenerControl(elemento, '#objetivos-especifico-1').value).toBe('Medir resultados');
  });

  it('guarda Objetivos y comunica que el recorrido puede continuar', () => {
    const completado = vi.fn();
    fixture.componentInstance.completado.subscribe(completado);
    const elemento = fixture.nativeElement as HTMLElement;
    escribir(elemento, '#objetivos-general', 'Mejorar la operación');
    escribir(elemento, '#objetivos-especifico-0', 'Reducir reprocesos');

    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.Objetivos,
      datos: {
        objetivoGeneral: 'Mejorar la operación',
        objetivosEspecificos: ['Reducir reprocesos', 'Medir resultados'],
      },
    });
    expect(completado).toHaveBeenCalledOnce();
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
