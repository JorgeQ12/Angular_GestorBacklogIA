import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioNecesidadProyecto } from './formulario-necesidad-proyecto';

describe('FormularioNecesidadProyecto', () => {
  let fixture: ComponentFixture<FormularioNecesidadProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioNecesidadProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioNecesidadProyecto);
    fixture.detectChanges();
  });

  it('presenta mensajes propios al enviar campos vacíos', () => {
    enviarFormulario();
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('#necesidad-situacion-actual-error')?.textContent).toBe(
      'Describe cómo se trabaja actualmente.',
    );
    expect(elemento.querySelector('#necesidad-problemas-error')?.textContent).toBe(
      'Describe los problemas principales.',
    );
    expect(elemento.querySelector('#necesidad-impacto-error')?.textContent).toBe(
      'Describe el impacto de no resolver el problema.',
    );
  });

  it('emite la necesidad sin espacios exteriores', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#necesidad-situacion-actual', '  Registro manual  ');
    escribir('#necesidad-problemas', '  No existe trazabilidad  ');
    escribir('#necesidad-impacto', '  Aumentan los tiempos  ');

    enviarFormulario();

    expect(guardar).toHaveBeenCalledWith({
      situacionActual: 'Registro manual',
      problemas: 'No existe trazabilidad',
      impacto: 'Aumentan los tiempos',
    });
  });

  it('no admite respuestas compuestas únicamente por espacios', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#necesidad-situacion-actual', '   ');
    escribir('#necesidad-problemas', 'Reprocesos');
    escribir('#necesidad-impacto', 'Costos');

    enviarFormulario();
    fixture.detectChanges();

    expect(guardar).not.toHaveBeenCalled();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#necesidad-situacion-actual-error')
        ?.textContent,
    ).toBe('Describe cómo se trabaja actualmente.');
  });

  it('presenta los datos recuperados del borrador', () => {
    fixture.componentRef.setInput('datosIniciales', {
      situacionActual: 'Registro manual',
      problemas: 'No existe trazabilidad',
      impacto: 'Aumentan los tiempos',
    });
    fixture.detectChanges();

    expect(obtenerTextarea('#necesidad-situacion-actual').value).toBe('Registro manual');
    expect(obtenerTextarea('#necesidad-problemas').value).toBe('No existe trazabilidad');
    expect(obtenerTextarea('#necesidad-impacto').value).toBe('Aumentan los tiempos');
  });

  it('deshabilita los campos durante la persistencia', () => {
    fixture.componentRef.setInput('procesando', true);
    fixture.detectChanges();

    expect(obtenerTextarea('#necesidad-situacion-actual').disabled).toBe(true);
    expect(obtenerTextarea('#necesidad-problemas').disabled).toBe(true);
    expect(obtenerTextarea('#necesidad-impacto').disabled).toBe(true);
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
