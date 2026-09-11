import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoCatalogoProyecto } from '../../../models/estado-catalogo-proyecto.model';
import { FormularioFiltrosProyectos } from './filtros-proyectos';

// El debounce de la búsqueda usa el asyncScheduler de RxJS. En un proyecto zoneless no existe
// fakeAsync/tick ni jasmine.clock() intercepta ese scheduler, así que se espera tiempo real
// (por encima del debounce de 300 ms) para que la emisión se propague.
const ESPERA_DEBOUNCE_MS = 350;

function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

describe('FormularioFiltrosProyectos', () => {
  let fixture: ComponentFixture<FormularioFiltrosProyectos>;
  let overlay: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioFiltrosProyectos],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioFiltrosProyectos);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });

  it('hidrata la búsqueda única y el estado desde la URL', () => {
    fixture.componentRef.setInput('filtrosIniciales', {
      nombre: 'Portal',
      responsable: '',
      estado: EstadoCatalogoProyecto.EnProgreso,
    });
    TestBed.flushEffects();
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(obtenerBuscador(elemento).value).toBe('Portal');
    expect(obtenerBuscador(elemento).minLength).toBe(3);
    expect(elemento.querySelector('#filtro-proyecto-estado-control')?.textContent).toContain(
      'En Progreso',
    );
    expect(elemento.querySelectorAll('input[type="search"]').length).toBe(1);
  });

  it('espera tres caracteres antes de emitir la búsqueda normalizada', async () => {
    const filtrosCambiados = jasmine.createSpy('filtrosCambiados');
    fixture.componentInstance.filtrosCambiados.subscribe(filtrosCambiados);
    TestBed.flushEffects();
    fixture.detectChanges();
    const control = obtenerBuscador(fixture.nativeElement as HTMLElement);

    escribir(control, 'Po');
    await esperar(ESPERA_DEBOUNCE_MS);
    expect(filtrosCambiados).not.toHaveBeenCalled();

    escribir(control, '  Portal  ');
    await esperar(ESPERA_DEBOUNCE_MS);
    expect(filtrosCambiados).toHaveBeenCalledWith({
      nombre: 'Portal',
      responsable: '',
      estado: null,
    });
  });

  it('retira automáticamente la búsqueda cuando el texto vuelve a ser corto', async () => {
    const filtrosCambiados = jasmine.createSpy('filtrosCambiados');
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
    await esperar(ESPERA_DEBOUNCE_MS);

    expect(filtrosCambiados.calls.mostRecent().args).toEqual([{
      nombre: '',
      responsable: '',
      estado: null,
    }]);
  });

  it('no presenta una acción separada para limpiar filtros', () => {
    TestBed.flushEffects();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Limpiar filtros');
  });

  it('retira el estado desde la opción neutral del selector', async () => {
    const filtrosCambiados = jasmine.createSpy('filtrosCambiados');
    fixture.componentInstance.filtrosCambiados.subscribe(filtrosCambiados);
    fixture.componentRef.setInput('filtrosIniciales', {
      nombre: '',
      responsable: '',
      estado: EstadoCatalogoProyecto.EnProgreso,
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
    await esperar(ESPERA_DEBOUNCE_MS);

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
