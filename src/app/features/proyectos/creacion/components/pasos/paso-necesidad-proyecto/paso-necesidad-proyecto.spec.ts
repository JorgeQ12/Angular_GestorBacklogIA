import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { crearBorradorProyectoPrueba } from '../../../testing/crear-borrador-proyecto-prueba';
import { PasoNecesidadProyecto } from './paso-necesidad-proyecto';

describe('PasoNecesidadProyecto', () => {
  let fixture: ComponentFixture<PasoNecesidadProyecto>;
  let proyectoId: ReturnType<typeof signal<number | null>>;
  const borrador = crearBorradorProyectoPrueba({
    necesidadJson:
      '{"situacionActual":"Registro manual","problemas":"No existe trazabilidad","impacto":"Aumentan los tiempos"}',
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
      imports: [PasoNecesidadProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PasoNecesidadProyecto);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('hidrata el formulario con la necesidad del borrador', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(obtenerControl(elemento, '#necesidad-situacion-actual').value).toBe('Registro manual');
    expect(obtenerControl(elemento, '#necesidad-problemas').value).toBe('No existe trazabilidad');
    expect(obtenerControl(elemento, '#necesidad-impacto').value).toBe('Aumentan los tiempos');
  });

  it('guarda Necesidad y comunica que el recorrido puede continuar', () => {
    const completado = vi.fn();
    fixture.componentInstance.completado.subscribe(completado);
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
    expect(completado).toHaveBeenCalledOnce();
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
