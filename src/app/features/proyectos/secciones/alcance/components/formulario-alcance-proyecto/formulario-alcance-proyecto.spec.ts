import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioAlcanceProyecto } from './formulario-alcance-proyecto';

describe('FormularioAlcanceProyecto', () => {
  let fixture: ComponentFixture<FormularioAlcanceProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAlcanceProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioAlcanceProyecto);
    fixture.detectChanges();
  });

  it('presenta mensajes propios al enviar los límites vacíos', () => {
    enviarFormulario();
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('#alcance-incluido-error')?.textContent).toBe(
      'Describe qué incluye el proyecto.',
    );
    expect(elemento.querySelector('#alcance-excluido-error')?.textContent).toBe(
      'Define qué queda fuera del alcance.',
    );
  });

  it('emite el alcance sin espacios exteriores', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#alcance-incluido', '  Seguimiento de envíos  ');
    escribir('#alcance-excluido', '  Pagos en línea  ');

    enviarFormulario();

    expect(guardar).toHaveBeenCalledWith({
      incluido: 'Seguimiento de envíos',
      excluido: 'Pagos en línea',
    });
  });

  it('no admite contenido compuesto únicamente por espacios', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#alcance-incluido', '   ');
    escribir('#alcance-excluido', 'Pagos en línea');

    enviarFormulario();
    fixture.detectChanges();

    expect(guardar).not.toHaveBeenCalled();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#alcance-incluido-error')?.textContent,
    ).toBe('Describe qué incluye el proyecto.');
  });

  it('presenta los datos recuperados del borrador', () => {
    fixture.componentRef.setInput('datosIniciales', {
      incluido: 'Seguimiento de envíos',
      excluido: 'Pagos en línea',
    });
    fixture.detectChanges();

    expect(obtenerTextarea('#alcance-incluido').value).toBe('Seguimiento de envíos');
    expect(obtenerTextarea('#alcance-excluido').value).toBe('Pagos en línea');
  });

  it('deshabilita los campos durante la persistencia', () => {
    fixture.componentRef.setInput('procesando', true);
    fixture.detectChanges();

    expect(obtenerTextarea('#alcance-incluido').disabled).toBe(true);
    expect(obtenerTextarea('#alcance-excluido').disabled).toBe(true);
  });

  function escribir(selector: string, valor: string): void {
    const control = obtenerTextarea(selector);
    control.value = valor;
    control.dispatchEvent(new Event('input'));
  }

  function obtenerTextarea(selector: string): HTMLTextAreaElement {
    return (fixture.nativeElement as HTMLElement).querySelector(selector) as HTMLTextAreaElement;
  }

  function enviarFormulario(): void {
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));
  }
});
