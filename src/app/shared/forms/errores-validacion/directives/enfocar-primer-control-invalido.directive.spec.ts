import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnfocarPrimerControlInvalidoDirective } from './enfocar-primer-control-invalido.directive';

@Component({
  imports: [EnfocarPrimerControlInvalidoDirective],
  template: `
    <form appEnfocarPrimerControlInvalido>
      <button type="button" aria-invalid="false">Válido</button>
      <button type="button" aria-invalid="true">Inválido</button>
    </form>
  `,
})
class ComponentePrueba {}

describe('EnfocarPrimerControlInvalidoDirective', () => {
  let fixture: ComponentFixture<ComponentePrueba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComponentePrueba] }).compileComponents();
    fixture = TestBed.createComponent(ComponentePrueba);
    fixture.detectChanges();
  });

  it('enfoca el primer control que comunica aria-invalid', async () => {
    const formulario = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const controlInvalido = formulario.querySelector('[aria-invalid="true"]') as HTMLButtonElement;

    formulario.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(document.activeElement).toBe(controlInvalido);
  });
});
