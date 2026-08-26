import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectorFecha } from './selector-fecha';

@Component({
  imports: [ReactiveFormsModule, SelectorFecha],
  template: `
    <label id="fecha-label" for="fecha-control">Fecha</label>
    <app-selector-fecha
      id="fecha"
      etiquetadoPor="fecha-label"
      fechaMinima="2026-08-01"
      fechaMaxima="2026-08-31"
      [formControl]="control"
    />
  `,
})
class ComponentePrueba {
  public readonly control = new FormControl('2026-08-24', { nonNullable: true });
}

describe('SelectorFecha', () => {
  let fixture: ComponentFixture<ComponentePrueba>;
  let overlay: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComponentePrueba] }).compileComponents();
    fixture = TestBed.createComponent(ComponentePrueba);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('conserva el valor ISO al seleccionar una fecha', () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    const dia = [...overlay.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')].find(
      (elemento) =>
        elemento.textContent?.trim() === '26' &&
        !elemento.classList.contains('selector-fecha__dia--otro-mes'),
    );

    dia?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('2026-08-26');
    expect(obtenerTrigger().textContent).toContain('26');
  });

  it('navega por días mediante las flechas del teclado', async () => {
    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    await fixture.whenStable();
    const calendario = overlay.querySelector('[role="dialog"]');

    calendario?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    calendario?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('2026-08-25');
  });

  it('refleja el estado deshabilitado del formulario', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(obtenerTrigger().disabled).toBe(true);
  });

  function obtenerTrigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('#fecha-control') as HTMLButtonElement;
  }
});
