import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { crearBorradorProyectoPrueba } from '../../../testing/crear-borrador-proyecto-prueba';
import { PasoAlcanceProyecto } from './paso-alcance-proyecto';

describe('PasoAlcanceProyecto', () => {
  let fixture: ComponentFixture<PasoAlcanceProyecto>;
  let proyectoId: ReturnType<typeof signal<number | null>>;
  const borrador = crearBorradorProyectoPrueba({
    alcanceJson: '{"incluido":"Seguimiento de envíos","excluido":"Pagos en línea"}',
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
      imports: [PasoAlcanceProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PasoAlcanceProyecto);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('hidrata el formulario con el alcance del borrador', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(obtenerControl(elemento, '#alcance-incluido').value).toBe('Seguimiento de envíos');
    expect(obtenerControl(elemento, '#alcance-excluido').value).toBe('Pagos en línea');
  });

  it('guarda Alcance y comunica que el recorrido puede continuar', () => {
    const completado = vi.fn();
    fixture.componentInstance.completado.subscribe(completado);
    const elemento = fixture.nativeElement as HTMLElement;
    escribir(elemento, '#alcance-incluido', 'Consulta de estados');
    escribir(elemento, '#alcance-excluido', 'Facturación electrónica');

    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.Alcance,
      datos: {
        incluido: 'Consulta de estados',
        excluido: 'Facturación electrónica',
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
