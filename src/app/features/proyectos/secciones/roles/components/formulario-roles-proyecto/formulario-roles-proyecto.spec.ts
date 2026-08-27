import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioRolesProyecto } from './formulario-roles-proyecto';

describe('FormularioRolesProyecto', () => {
  let fixture: ComponentFixture<FormularioRolesProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioRolesProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioRolesProyecto);
    fixture.detectChanges();
  });

  it('presenta los mensajes propios al enviar el rol vacío', () => {
    enviarFormulario();
    fixture.detectChanges();

    expect(obtenerElemento().querySelector('#rol-nombre-0-error')?.textContent).toBe(
      'Ingresa el nombre del rol.',
    );
    expect(obtenerElemento().querySelector('#rol-descripcion-0-error')?.textContent).toBe(
      'Describe la participación de este rol.',
    );
  });

  it('agrega roles y emite sus valores normalizados', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#rol-nombre-0', '  Administrador  ');
    escribir('#rol-descripcion-0', '  Configura la solución.  ');
    pulsar('.formulario-roles__encabezado button');
    fixture.detectChanges();
    escribir('#rol-nombre-1', '  Usuario final  ');
    escribir('#rol-descripcion-1', '  Utiliza las funcionalidades.  ');

    enviarFormulario();

    expect(guardar).toHaveBeenCalledWith({
      roles: [
        { nombre: 'Administrador', descripcion: 'Configura la solución.' },
        { nombre: 'Usuario final', descripcion: 'Utiliza las funcionalidades.' },
      ],
    });
  });

  it('rechaza nombres repetidos ignorando mayúsculas y espacios', () => {
    escribir('#rol-nombre-0', 'Administrador');
    escribir('#rol-descripcion-0', 'Configura');
    pulsar('.formulario-roles__encabezado button');
    fixture.detectChanges();
    escribir('#rol-nombre-1', '  administrador  ');
    escribir('#rol-descripcion-1', 'También configura');

    enviarFormulario();
    fixture.detectChanges();

    expect(obtenerElemento().querySelector('#rol-nombre-0-error')?.textContent).toBe(
      'Ya existe un rol con este nombre.',
    );
    expect(obtenerElemento().querySelector('#rol-nombre-1-error')?.textContent).toBe(
      'Ya existe un rol con este nombre.',
    );
  });

  it('conserva al menos un rol', () => {
    const eliminar = obtenerElemento().querySelector(
      '.formulario-roles__eliminar',
    ) as HTMLButtonElement;

    expect(eliminar.disabled).toBe(true);
    eliminar.click();
    fixture.detectChanges();
    expect(obtenerElemento().querySelectorAll('[id^="rol-nombre-"]')).toHaveLength(1);
  });

  it('presenta la colección recuperada del borrador', () => {
    fixture.componentRef.setInput('datosIniciales', {
      roles: [
        { nombre: 'Administrador', descripcion: 'Configura la solución.' },
        { nombre: 'Usuario final', descripcion: 'Consulta la información.' },
      ],
    });
    fixture.detectChanges();

    expect(obtenerControl('#rol-nombre-0').value).toBe('Administrador');
    expect(obtenerControl('#rol-descripcion-1').value).toBe('Consulta la información.');
  });

  it('deshabilita los campos y acciones durante la persistencia', () => {
    fixture.componentRef.setInput('procesando', true);
    fixture.detectChanges();

    expect(obtenerControl('#rol-nombre-0').disabled).toBe(true);
    expect(
      (obtenerElemento().querySelector('.formulario-roles__encabezado button') as HTMLButtonElement)
        .disabled,
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

  function obtenerControl(selector: string): HTMLInputElement {
    return obtenerElemento().querySelector(selector) as HTMLInputElement;
  }

  function obtenerElemento(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function enviarFormulario(): void {
    obtenerElemento().querySelector('form')?.dispatchEvent(new Event('submit'));
  }
});
