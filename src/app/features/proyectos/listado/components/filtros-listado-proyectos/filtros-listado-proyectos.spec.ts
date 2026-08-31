import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoCatalogoProyecto } from '../../../models/estado-catalogo-proyecto.model';
import { FormularioFiltrosListadoProyectos } from './filtros-listado-proyectos';

describe('FormularioFiltrosListadoProyectos', () => {
  let fixture: ComponentFixture<FormularioFiltrosListadoProyectos>;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [FormularioFiltrosListadoProyectos],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioFiltrosListadoProyectos);
  });

  afterEach(() => vi.useRealTimers());

  it('hidrata los controles desde los filtros representados por la URL', () => {
    fixture.componentRef.setInput('filtrosIniciales', {
      nombre: 'Portal',
      responsable: 'María',
      estado: EstadoCatalogoProyecto.Activo,
    });
    TestBed.flushEffects();
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(obtenerInput(elemento, '#filtro-proyecto-nombre').value).toBe('Portal');
    expect(obtenerInput(elemento, '#filtro-proyecto-responsable').value).toBe('María');
    expect(elemento.querySelector('#filtro-proyecto-estado-control')?.textContent).toContain(
      'Activo',
    );
  });

  it('espera antes de emitir la búsqueda normalizada', () => {
    const filtrosCambiados = vi.fn();
    fixture.componentInstance.filtrosCambiados.subscribe(filtrosCambiados);
    TestBed.flushEffects();
    fixture.detectChanges();
    const control = obtenerInput(fixture.nativeElement as HTMLElement, '#filtro-proyecto-nombre');

    control.value = '  Portal  ';
    control.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(299);
    expect(filtrosCambiados).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(filtrosCambiados).toHaveBeenCalledWith({
      nombre: 'Portal',
      responsable: '',
      estado: null,
    });
  });

  it('restablece todos los criterios desde una sola acción', () => {
    const filtrosCambiados = vi.fn();
    fixture.componentInstance.filtrosCambiados.subscribe(filtrosCambiados);
    fixture.componentRef.setInput('filtrosIniciales', {
      nombre: 'Portal',
      responsable: 'María',
      estado: EstadoCatalogoProyecto.Activo,
    });
    TestBed.flushEffects();
    fixture.detectChanges();
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (elemento) => elemento.textContent?.includes('Limpiar filtros'),
    );

    (boton as HTMLButtonElement).click();

    expect(filtrosCambiados).toHaveBeenCalledWith({
      nombre: '',
      responsable: '',
      estado: null,
    });
  });
});

function obtenerInput(elemento: HTMLElement, selector: string): HTMLInputElement {
  return elemento.querySelector(selector) as HTMLInputElement;
}
