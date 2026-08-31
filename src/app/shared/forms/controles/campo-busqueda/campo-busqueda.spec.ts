import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CampoBusqueda } from './campo-busqueda';

@Component({
  imports: [CampoBusqueda, ReactiveFormsModule],
  template: `
    <app-campo-busqueda
      id="busqueda-proyectos"
      etiqueta="Buscar proyecto"
      placeholder="Buscar por nombre"
      [longitudMinima]="3"
      [formControl]="control"
    />
  `,
})
class ComponentePrueba {
  public readonly control = new FormControl('', { nonNullable: true });
}

describe('CampoBusqueda', () => {
  let fixture: ComponentFixture<ComponentePrueba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComponentePrueba] }).compileComponents();
    fixture = TestBed.createComponent(ComponentePrueba);
    fixture.detectChanges();
  });

  it('comunica al formulario el término escrito', () => {
    const campo = obtenerCampo();
    campo.value = 'InterIA';
    campo.dispatchEvent(new Event('input'));

    expect(fixture.componentInstance.control.value).toBe('InterIA');
  });

  it('refleja el valor y el estado administrados por el formulario', () => {
    fixture.componentInstance.control.setValue('Portal');
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(obtenerCampo().value).toBe('Portal');
    expect(obtenerCampo().disabled).toBe(true);
  });

  it('comunica la interacción al abandonar el campo', () => {
    obtenerCampo().dispatchEvent(new Event('blur'));

    expect(fixture.componentInstance.control.touched).toBe(true);
  });

  it('proporciona nombre accesible y orientación contextual', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('label')?.textContent).toContain('Buscar proyecto');
    expect(obtenerCampo().placeholder).toBe('Buscar por nombre');
    expect(obtenerCampo().minLength).toBe(3);
  });

  function obtenerCampo(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
  }
});
