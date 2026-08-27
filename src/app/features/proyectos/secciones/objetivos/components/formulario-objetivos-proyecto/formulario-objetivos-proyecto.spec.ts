import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioObjetivosProyecto } from './formulario-objetivos-proyecto';

describe('FormularioObjetivosProyecto', () => {
  let fixture: ComponentFixture<FormularioObjetivosProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioObjetivosProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioObjetivosProyecto);
    fixture.detectChanges();
  });

  it('presenta mensajes propios al enviar valores vacíos', () => {
    enviarFormulario();
    fixture.detectChanges();

    const elemento = obtenerElemento();
    expect(elemento.querySelector('#objetivos-general-error')?.textContent).toBe(
      'Describe el objetivo general del proyecto.',
    );
    expect(elemento.querySelector('#objetivos-especifico-0-error')?.textContent).toBe(
      'Describe el objetivo específico.',
    );
  });

  it('emite los objetivos sin espacios exteriores', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#objetivos-general', '  Reducir los tiempos  ');
    escribir('#objetivos-especifico-0', '  Automatizar validaciones  ');
    pulsar('.formulario-objetivos__acciones-lista button');
    fixture.detectChanges();
    escribir('#objetivos-especifico-1', '  Medir resultados  ');

    enviarFormulario();

    expect(guardar).toHaveBeenCalledWith({
      objetivoGeneral: 'Reducir los tiempos',
      objetivosEspecificos: ['Automatizar validaciones', 'Medir resultados'],
    });
  });

  it('limita la colección a ocho objetivos específicos', () => {
    for (let indice = 1; indice < 10; indice += 1) {
      pulsar('.formulario-objetivos__acciones-lista button');
      fixture.detectChanges();
    }

    expect(obtenerElemento().querySelectorAll('[id^="objetivos-especifico-"]')).toHaveLength(8);
    expect(
      (
        obtenerElemento().querySelector(
          '.formulario-objetivos__acciones-lista button',
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it('conserva al menos un objetivo específico', () => {
    const eliminar = obtenerElemento().querySelector(
      '.formulario-objetivos__eliminar',
    ) as HTMLButtonElement;

    expect(eliminar.disabled).toBe(true);
    eliminar.click();
    fixture.detectChanges();
    expect(obtenerElemento().querySelectorAll('[id^="objetivos-especifico-"]')).toHaveLength(1);
  });

  it('identifica cada control dinámico sin agregar una etiqueta visual redundante', () => {
    const control = obtenerControl('#objetivos-especifico-0');

    expect(control.getAttribute('aria-label')).toBe('Objetivo específico 1');
    expect(obtenerElemento().querySelector('.formulario-objetivos__label-especifico')).toBeNull();
  });

  it('presenta la colección recuperada del borrador', () => {
    fixture.componentRef.setInput('datosIniciales', {
      objetivoGeneral: 'Reducir tiempos',
      objetivosEspecificos: ['Automatizar', 'Medir'],
    });
    fixture.detectChanges();

    expect(obtenerControl('#objetivos-general').value).toBe('Reducir tiempos');
    expect(obtenerControl('#objetivos-especifico-0').value).toBe('Automatizar');
    expect(obtenerControl('#objetivos-especifico-1').value).toBe('Medir');
  });

  it('deshabilita los campos y acciones durante la persistencia', () => {
    fixture.componentRef.setInput('procesando', true);
    fixture.detectChanges();

    expect(obtenerControl('#objetivos-general').disabled).toBe(true);
    expect(obtenerControl('#objetivos-especifico-0').disabled).toBe(true);
    expect(
      (
        obtenerElemento().querySelector(
          '.formulario-objetivos__acciones-lista button',
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  function escribir(selector: string, valor: string): void {
    const control = obtenerControl(selector);
    control.value = valor;
    control.dispatchEvent(new Event('input'));
  }

  function pulsar(selector: string): void {
    (obtenerElemento().querySelector(selector) as HTMLButtonElement).click();
  }

  function obtenerControl(selector: string): HTMLInputElement | HTMLTextAreaElement {
    return obtenerElemento().querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
  }

  function obtenerElemento(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function enviarFormulario(): void {
    obtenerElemento().querySelector('form')?.dispatchEvent(new Event('submit'));
  }
});
