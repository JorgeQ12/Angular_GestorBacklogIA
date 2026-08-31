import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoCatalogoProyecto } from '../../../models/estado-catalogo-proyecto.model';
import { FormularioFiltrosListadoProyectos } from './filtros-listado-proyectos';

describe('FormularioFiltrosListadoProyectos', () => {
  let fixture: ComponentFixture<FormularioFiltrosListadoProyectos>;
  let overlay: HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [FormularioFiltrosListadoProyectos],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioFiltrosListadoProyectos);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });

  afterEach(() => vi.useRealTimers());

  it('hidrata la búsqueda única y el estado desde la URL', () => {
    fixture.componentRef.setInput('filtrosIniciales', {
      nombre: 'Portal',
      responsable: '',
      estado: EstadoCatalogoProyecto.Activo,
    });
    TestBed.flushEffects();
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(obtenerBuscador(elemento).value).toBe('Portal');
    expect(obtenerBuscador(elemento).minLength).toBe(3);
    expect(elemento.querySelector('#filtro-proyecto-estado-control')?.textContent).toContain(
      'Activo',
    );
    expect(elemento.querySelectorAll('input[type="search"]')).toHaveLength(1);
  });

  it('espera tres caracteres antes de emitir la búsqueda normalizada', () => {
    const filtrosCambiados = vi.fn();
    fixture.componentInstance.filtrosCambiados.subscribe(filtrosCambiados);
    TestBed.flushEffects();
    fixture.detectChanges();
    const control = obtenerBuscador(fixture.nativeElement as HTMLElement);

    escribir(control, 'Po');
    vi.advanceTimersByTime(300);
    expect(filtrosCambiados).not.toHaveBeenCalled();

    escribir(control, '  Portal  ');
    vi.advanceTimersByTime(300);
    expect(filtrosCambiados).toHaveBeenCalledWith({
      nombre: 'Portal',
      responsable: '',
      estado: null,
    });
  });

  it('retira automáticamente la búsqueda cuando el texto vuelve a ser corto', () => {
    const filtrosCambiados = vi.fn();
    fixture.componentInstance.filtrosCambiados.subscribe(filtrosCambiados);
    fixture.componentRef.setInput('filtrosIniciales', {
      nombre: 'Portal',
      responsable: '',
      estado: null,
    });
    TestBed.flushEffects();
    fixture.detectChanges();
    const control = obtenerBuscador(fixture.nativeElement as HTMLElement);

    escribir(control, 'Po');
    vi.advanceTimersByTime(300);

    expect(filtrosCambiados).toHaveBeenLastCalledWith({
      nombre: '',
      responsable: '',
      estado: null,
    });
  });

  it('no presenta una acción separada para limpiar filtros', () => {
    TestBed.flushEffects();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Limpiar filtros');
  });

  it('retira el estado desde la opción neutral del selector', () => {
    const filtrosCambiados = vi.fn();
    fixture.componentInstance.filtrosCambiados.subscribe(filtrosCambiados);
    fixture.componentRef.setInput('filtrosIniciales', {
      nombre: '',
      responsable: '',
      estado: EstadoCatalogoProyecto.Activo,
    });
    TestBed.flushEffects();
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('#filtro-proyecto-estado-control')
      ?.click();
    fixture.detectChanges();
    const opcionTodos = [...overlay.querySelectorAll<HTMLButtonElement>('[role="option"]')].find(
      (opcion) => opcion.textContent?.includes('Todos los estados'),
    );
    opcionTodos?.click();
    vi.advanceTimersByTime(300);

    expect(filtrosCambiados).toHaveBeenCalledWith({
      nombre: '',
      responsable: '',
      estado: null,
    });
  });
});

function obtenerBuscador(elemento: HTMLElement): HTMLInputElement {
  return elemento.querySelector('#filtro-proyecto-busqueda') as HTMLInputElement;
}

function escribir(control: HTMLInputElement, valor: string): void {
  control.value = valor;
  control.dispatchEvent(new Event('input'));
}
