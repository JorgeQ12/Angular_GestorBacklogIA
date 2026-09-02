import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectorCampo } from './selector-campo';

@Component({
  imports: [ReactiveFormsModule, SelectorCampo],
  template: `
    <label id="prioridad-label" for="prioridad-control">Prioridad</label>
    <app-selector-campo
      id="prioridad"
      etiquetadoPor="prioridad-label"
      [opciones]="opciones"
      [soloLectura]="soloLectura()"
      [compacto]="compacto()"
      [formControl]="control"
    />
  `,
})
class ComponentePrueba {
  public readonly soloLectura = signal(false);
  public readonly compacto = signal(false);
  public readonly control = new FormControl<number | null>(null);
  public readonly opciones = [
    { valor: 1, etiqueta: 'Alta', descripcion: 'Atención prioritaria' },
    { valor: 2, etiqueta: 'Media' },
    { valor: null, etiqueta: 'Todas las prioridades' },
  ];
}

describe('SelectorCampo', () => {
  let fixture: ComponentFixture<ComponentePrueba>;
  let overlay: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComponentePrueba] }).compileComponents();
    fixture = TestBed.createComponent(ComponentePrueba);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('comunica al formulario la opción elegida', () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    const opciones = overlay.querySelectorAll<HTMLButtonElement>('[role="option"]');

    opciones[1]?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(2);
    expect(obtenerTrigger().textContent).toContain('Media');
  });

  it('permite elegir una opción usando el teclado', async () => {
    fixture.componentInstance.control.setValue(1);
    fixture.detectChanges();
    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    await fixture.whenStable();

    overlay
      .querySelector('[role="listbox"]')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    overlay
      .querySelector('[role="listbox"]')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(2);
  });

  it('refleja el estado deshabilitado del formulario', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(obtenerTrigger().disabled).toBe(true);
  });

  it('permite retirar la selección mediante una opción neutral', () => {
    fixture.componentInstance.control.setValue(1);
    fixture.detectChanges();
    obtenerTrigger().click();
    fixture.detectChanges();

    overlay.querySelectorAll<HTMLButtonElement>('[role="option"]')[2]?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBeNull();
    expect(obtenerTrigger().textContent).toContain('Todas las prioridades');
  });

  it('conserva la selección y no abre opciones en solo lectura', () => {
    fixture.componentInstance.control.setValue(1);
    fixture.componentInstance.soloLectura.set(true);
    fixture.detectChanges();

    obtenerTrigger().click();
    fixture.detectChanges();

    expect(obtenerTrigger().getAttribute('aria-readonly')).toBe('true');
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
    expect(fixture.componentInstance.control.value).toBe(1);
  });

  it('aplica la variante compacta también al panel renderizado en el overlay', () => {
    fixture.componentInstance.compacto.set(true);
    fixture.detectChanges();
    obtenerTrigger().click();
    fixture.detectChanges();

    expect(obtenerTrigger().classList).toContain('selector-campo__trigger--compacto');
    expect(overlay.querySelector('.selector-campo__lista--compacta')).not.toBeNull();
  });

  function obtenerTrigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('#prioridad-control') as HTMLButtonElement;
  }
});
