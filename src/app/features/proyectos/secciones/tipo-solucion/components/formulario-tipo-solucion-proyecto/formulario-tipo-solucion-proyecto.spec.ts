import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModoFormularioProyecto } from '../../../../models/modo-formulario-proyecto.model';
import { PlataformaSolucion } from '../../models/tipo-solucion-proyecto.model';
import { FormularioTipoSolucionProyecto } from './formulario-tipo-solucion-proyecto';

describe('FormularioTipoSolucionProyecto', () => {
  let fixture: ComponentFixture<FormularioTipoSolucionProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioTipoSolucionProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioTipoSolucionProyecto);
    fixture.detectChanges();
  });

  it('presenta el error del grupo cuando se envía sin seleccionar', () => {
    enviarFormulario();
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#tipo-solucion-interfaz-error')
        ?.textContent,
    ).toBe('Debes indicar si la solución tendrá interfaz.');
  });

  it('solicita plataforma solamente para soluciones con interfaz', () => {
    seleccionarOpcion('tipo-solucion-interfaz', 0);
    enviarFormulario();
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#tipo-solucion-plataforma-error')
        ?.textContent,
    ).toBe('Debes seleccionar la plataforma principal.');
  });

  it('emite una solución con interfaz y plataforma', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    seleccionarOpcion('tipo-solucion-interfaz', 0);
    seleccionarOpcion('tipo-solucion-plataforma', 0);

    enviarFormulario();

    expect(guardar).toHaveBeenCalledWith({
      tieneInterfaz: true,
      plataforma: PlataformaSolucion.Web,
    });
  });

  it('limpia la plataforma al cambiar a una solución sin interfaz', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    seleccionarOpcion('tipo-solucion-interfaz', 0);
    seleccionarOpcion('tipo-solucion-plataforma', 2);
    seleccionarOpcion('tipo-solucion-interfaz', 1);

    enviarFormulario();

    expect(guardar).toHaveBeenCalledWith({ tieneInterfaz: false, plataforma: null });
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#tipo-solucion-plataforma'),
    ).toBeNull();
  });

  it('presenta la selección sin admitir cambios ni envío en modo lectura', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    fixture.componentRef.setInput('datosIniciales', {
      tieneInterfaz: true,
      plataforma: PlataformaSolucion.Web,
    });
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Lectura);
    fixture.detectChanges();

    seleccionarOpcion('tipo-solucion-interfaz', 1);
    enviarFormulario();

    const grupo = (fixture.nativeElement as HTMLElement).querySelector('[role="radiogroup"]');
    expect(grupo?.getAttribute('aria-readonly')).toBe('true');
    expect(guardar).not.toHaveBeenCalled();
  });

  function seleccionarOpcion(id: string, indice: number): void {
    const control = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
      `#${id} input[type="radio"]`,
    )[indice];
    control?.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function enviarFormulario(): void {
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));
  }
});
