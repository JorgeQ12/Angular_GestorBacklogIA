import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgControl } from '@angular/forms';
import { SelectorCampo } from '../../../../../../shared/forms/controles/selector-campo/selector-campo';
import { SelectorFecha } from '../../../../../../shared/forms/controles/selector-fecha/selector-fecha';
import { ModoFormularioProyecto } from '../../../../models/modo-formulario-proyecto.model';
import { FormularioContextoProyecto } from './formulario-contexto-proyecto';

describe('FormularioContextoProyecto', () => {
  let fixture: ComponentFixture<FormularioContextoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioContextoProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioContextoProyecto);
    fixture.componentRef.setInput('prioridades', [
      { id: 13, nombre: 'Alta', descripcion: 'Prioridad alta' },
      { id: 14, nombre: 'Media', descripcion: 'Prioridad media' },
    ]);
    fixture.detectChanges();
  });

  it('presenta errores administrados por la directiva al enviar valores vacíos', () => {
    enviarFormulario(fixture);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('#contexto-nombre-error')?.textContent).toBe(
      'El nombre del proyecto es obligatorio.',
    );
    expect(elemento.querySelector('#contexto-prioridad-error')?.textContent).toBe(
      'La prioridad es obligatoria.',
    );
    const prioridad = elemento.querySelector('#contexto-prioridad-control');
    expect(prioridad?.getAttribute('aria-invalid')).toBe('true');
    expect(prioridad?.getAttribute('aria-describedby')).toContain('contexto-prioridad-error');
  });

  it('emite valores válidos sin espacios exteriores', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#contexto-nombre', '  InterIA  ');
    escribir('#contexto-responsable', '  María Gómez  ');
    establecerControl(SelectorFecha, '2026-09-30');
    establecerControl(SelectorCampo, 13);
    escribir('#contexto-descripcion', '  Gestión inteligente del backlog.  ');

    enviarFormulario(fixture);

    expect(guardar).toHaveBeenCalledWith({
      nombre: 'InterIA',
      responsable: 'María Gómez',
      fechaObjetivo: '2026-09-30',
      prioridadCatalogoId: 13,
      descripcion: 'Gestión inteligente del backlog.',
    });
  });

  it('rechaza texto compuesto únicamente por espacios', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#contexto-nombre', '   ');
    escribir('#contexto-responsable', 'María Gómez');
    establecerControl(SelectorFecha, '2026-09-30');
    establecerControl(SelectorCampo, 13);
    escribir('#contexto-descripcion', 'Gestión del backlog.');

    enviarFormulario(fixture);
    fixture.detectChanges();

    expect(guardar).not.toHaveBeenCalled();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#contexto-nombre-error')?.textContent,
    ).toBe('El nombre del proyecto es obligatorio.');
  });

  it('comunica el nombre escrito para identificar el proyecto', () => {
    const nombreCambiado = vi.fn();
    fixture.componentInstance.nombreCambiado.subscribe(nombreCambiado);

    escribir('#contexto-nombre', '  Portal de clientes  ');

    expect(nombreCambiado).toHaveBeenLastCalledWith('Portal de clientes');
  });

  it('restaura la fotografía confirmada y bloquea el envío al volver a lectura', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    fixture.componentRef.setInput('datosIniciales', {
      nombre: 'Proyecto confirmado',
      responsable: 'María Gómez',
      fechaObjetivo: '2026-09-30',
      prioridadCatalogoId: 13,
      descripcion: 'Descripción confirmada',
    });
    fixture.detectChanges();
    escribir('#contexto-nombre', 'Cambio sin guardar');

    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Lectura);
    fixture.detectChanges();
    enviarFormulario(fixture);

    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#contexto-nombre')
        ?.readOnly,
    ).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#contexto-nombre')
        ?.value,
    ).toBe('Proyecto confirmado');
    expect(guardar).not.toHaveBeenCalled();
  });

  function escribir(selector: string, valor: string): void {
    const control = (fixture.nativeElement as HTMLElement).querySelector(selector) as
      HTMLInputElement | HTMLTextAreaElement;
    control.value = valor;
    control.dispatchEvent(new Event('input'));
  }

  function establecerControl(
    tipo: typeof SelectorFecha | typeof SelectorCampo,
    valor: unknown,
  ): void {
    const control = fixture.debugElement.query(By.directive(tipo)).injector.get(NgControl).control;
    control?.setValue(valor);
  }
});

function enviarFormulario(fixture: ComponentFixture<FormularioContextoProyecto>): void {
  const formulario = (fixture.nativeElement as HTMLElement).querySelector(
    'form',
  ) as HTMLFormElement;
  formulario.dispatchEvent(new Event('submit'));
}
