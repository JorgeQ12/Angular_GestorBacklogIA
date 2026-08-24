import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MensajesFormulario } from '../models/mensajes-error.model';
import { MensajesFormularioDirective } from './mensajes-formulario.directive';

@Component({
  imports: [MensajesFormularioDirective],
  template: `<form [appMensajesFormulario]="mensajes"></form>`,
})
class ComponentePrueba {
  public readonly mensajes = {
    usuario: {
      required: 'El usuario es obligatorio.',
    },
  } satisfies MensajesFormulario<'usuario'>;
}

describe('MensajesFormularioDirective', () => {
  let fixture: ComponentFixture<ComponentePrueba>;
  let directiva: MensajesFormularioDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentePrueba],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentePrueba);
    fixture.detectChanges();
    directiva = fixture.debugElement
      .query(By.directive(MensajesFormularioDirective))
      .injector.get(MensajesFormularioDirective);
  });

  it('devuelve los mensajes configurados para el campo', () => {
    expect(directiva.obtenerMensajes('usuario')?.['required']).toBe('El usuario es obligatorio.');
  });

  it('devuelve undefined para un campo sin configuración', () => {
    expect(directiva.obtenerMensajes('contrasena')).toBeUndefined();
  });
});
