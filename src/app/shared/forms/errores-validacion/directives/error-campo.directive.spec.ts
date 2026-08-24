import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajesFormulario } from '../models/mensajes-error.model';
import { ErrorCampoDirective } from './error-campo.directive';
import { MensajesFormularioDirective } from './mensajes-formulario.directive';

@Component({
  imports: [ErrorCampoDirective, MensajesFormularioDirective, ReactiveFormsModule],
  template: `
    <form [formGroup]="formulario" [appMensajesFormulario]="mensajesFormulario">
      <div class="ui-field">
        <label for="usuario">Usuario</label>
        <div class="ui-control-wrap">
          <input
            id="usuario"
            formControlName="usuario"
            appErrorCampo
            aria-describedby="usuario-ayuda"
          />
        </div>
        <small id="usuario-ayuda">Texto de ayuda</small>
      </div>
      <button type="submit">Enviar</button>
    </form>
  `,
})
class ComponentePrueba {
  public readonly formulario = new FormGroup({
    usuario: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  public readonly mensajesFormulario = {
    usuario: {
      required: 'El usuario es obligatorio.',
    },
  } satisfies MensajesFormulario<'usuario'>;
}

describe('ErrorCampoDirective', () => {
  let fixture: ComponentFixture<ComponentePrueba>;
  let componente: ComponentePrueba;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentePrueba],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentePrueba);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('no muestra el error antes de que el usuario interactúe con el control', () => {
    expect(fixture.nativeElement.querySelector('.ui-field-error')).toBeNull();
  });

  it('resuelve el mensaje del formulario usando el nombre del NgControl', () => {
    componente.formulario.controls.usuario.markAsTouched();
    fixture.detectChanges();

    const campo = fixture.nativeElement.querySelector('.ui-field') as HTMLElement;
    const control = fixture.nativeElement.querySelector('#usuario') as HTMLInputElement;
    const error = fixture.nativeElement.querySelector('#usuario-error') as HTMLElement;

    expect(error.textContent).toBe('El usuario es obligatorio.');
    expect(error.classList.contains('ui-field-error')).toBe(true);
    expect(error.getAttribute('role')).toBe('alert');
    expect(campo.classList.contains('has-error')).toBe(true);
    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(control.getAttribute('aria-describedby')).toBe('usuario-ayuda usuario-error');
  });

  it('muestra el error al enviar aunque el control no haya sido tocado', () => {
    const formulario = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#usuario-error')?.textContent).toBe(
      'El usuario es obligatorio.',
    );
  });

  it('retira el error al validar y conserva otros descriptores accesibles', () => {
    componente.formulario.controls.usuario.markAsTouched();
    fixture.detectChanges();
    componente.formulario.controls.usuario.setValue('jquintero');
    fixture.detectChanges();

    const campo = fixture.nativeElement.querySelector('.ui-field') as HTMLElement;
    const control = fixture.nativeElement.querySelector('#usuario') as HTMLInputElement;

    expect(fixture.nativeElement.querySelector('.ui-field-error')).toBeNull();
    expect(campo.classList.contains('has-error')).toBe(false);
    expect(control.hasAttribute('aria-invalid')).toBe(false);
    expect(control.getAttribute('aria-describedby')).toBe('usuario-ayuda');
  });
});
