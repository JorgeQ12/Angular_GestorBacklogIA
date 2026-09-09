import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { GanttPlanificacion } from '../../models/gantt-planificacion.model';
import { TipoElementoPlanificacion } from '../../models/planificacion-proyecto.model';
import { GanttPlanificacionComponent } from './gantt-planificacion';

describe('GanttPlanificacionComponent', () => {
  let fixture: ComponentFixture<GanttPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GanttPlanificacionComponent] }).compileComponents();
    fixture = TestBed.createComponent(GanttPlanificacionComponent);
    fixture.componentRef.setInput('datos', GANTT);
    fixture.detectChanges();
  });

  it('presenta el resumen, las filas y las barras del cronograma', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.textContent).toContain('Diagrama de Gantt');
    expect(elemento.textContent).toContain('2 tareas');
    expect(elemento.textContent).toContain('13 h de esfuerzo');
    expect(elemento.querySelectorAll('.gantt-planificacion__elemento')).toHaveLength(3);
    expect(elemento.querySelectorAll('.gantt-planificacion__barra')).toHaveLength(3);
    expect(elemento.querySelector('.gantt-planificacion__marca-agua img')?.getAttribute('src'))
      .toBe('/brand/logo.svg');
    expect(elemento.querySelectorAll('.gantt-planificacion__cuadricula-calendario')).toHaveLength(1);
    expect(elemento.querySelectorAll('.gantt-planificacion__barra .es-adaptable').length).toBeGreaterThan(0);
    expect(elemento.querySelectorAll('.gantt-planificacion__conector-impacto')).toHaveLength(2);
  });

  it('posiciona el tooltip y resalta la relación al pasar por un título', () => {
    vi.useFakeTimers();
    const elemento = fixture.nativeElement as HTMLElement;
    const titulo = elemento.querySelector<HTMLElement>('.gantt-planificacion__texto-elemento');
    const tooltip = titulo?.nextElementSibling as HTMLElement | null;

    expect(tooltip?.classList.contains('es-visible')).toBe(false);
    titulo?.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(120);
    fixture.detectChanges();

    expect(tooltip?.style.left).not.toBe('');
    expect(tooltip?.classList.contains('es-visible')).toBe(true);
    expect(elemento.querySelectorAll('.gantt-planificacion__conector.es-resaltado').length)
      .toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it('cancela un tooltip transitorio al abandonar el título', () => {
    vi.useFakeTimers();
    const titulo = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLElement>('.gantt-planificacion__texto-elemento');
    const tooltip = titulo?.nextElementSibling as HTMLElement | null;

    titulo?.dispatchEvent(new Event('pointerenter'));
    titulo?.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(120);
    fixture.detectChanges();

    expect(tooltip?.classList.contains('es-visible')).toBe(false);
    vi.useRealTimers();
  });

  it('filtra por título e incluye los padres de la coincidencia', () => {
    const control = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'app-campo-busqueda input',
    );
    if (control) {
      control.value = 'Validar entrega';
      control.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.gantt-planificacion__elemento')).toHaveLength(2);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Épica de entregas');
  });

  it('contrae y expande los descendientes desde la fila padre', () => {
    const contraer = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-label^="Contraer"]',
    );
    contraer?.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.gantt-planificacion__elemento')).toHaveLength(1);
    expect((fixture.nativeElement as HTMLElement).querySelector('button[aria-label^="Expandir"]')).not.toBeNull();
  });

  it('comunica el regreso a la vista del árbol', () => {
    const volver = vi.fn();
    fixture.componentInstance.volver.subscribe(volver);
    const vista = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')]
      .find((elemento) => elemento.textContent?.trim().startsWith('Vista'));
    vista?.click();
    fixture.detectChanges();
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')]
      .find((elemento) => elemento.textContent?.includes('Vista del árbol'));

    (boton as HTMLButtonElement | undefined)?.click();

    expect(volver).toHaveBeenCalledOnce();
  });
});

const GANTT: GanttPlanificacion = {
  proyectoId: 42,
  nombreProyecto: 'Proyecto',
  versionId: 9,
  numeroVersion: 4,
  esHistorica: false,
  elementos: [
    {
      clave: 'epica:1', id: 1, clavePadre: null, tituloPadre: null, tipo: TipoElementoPlanificacion.Epica,
      nivel: 0, orden: 0, titulo: 'Épica de entregas', activo: true, tieneHijos: true,
      fechaInicio: '2026-09-01', fechaFinal: '2026-09-12', estimacionHoras: 13, dependencias: null,
    },
    {
      clave: 'tarea:2', id: 2, clavePadre: 'epica:1', tituloPadre: 'Épica de entregas',
      tipo: TipoElementoPlanificacion.Tarea, nivel: 1, orden: 1, titulo: 'Validar entrega', activo: true,
      tieneHijos: false, fechaInicio: '2026-09-02', fechaFinal: '2026-09-05', estimacionHoras: 5,
      dependencias: null,
    },
    {
      clave: 'tarea:3', id: 3, clavePadre: 'epica:1', tituloPadre: 'Épica de entregas',
      tipo: TipoElementoPlanificacion.Tarea, nivel: 1, orden: 2, titulo: 'Publicar entrega', activo: true,
      tieneHijos: false, fechaInicio: '2026-09-06', fechaFinal: '2026-09-12', estimacionHoras: 8,
      dependencias: 'Validar entrega',
    },
  ],
};
