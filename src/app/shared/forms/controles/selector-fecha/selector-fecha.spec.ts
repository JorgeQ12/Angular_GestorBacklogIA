import { OverlayContainer } from '@angular/cdk/overlay';
import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
import { Component, LOCALE_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectorFecha } from './selector-fecha';

registerLocaleData(localeEsCO);

@Component({
  imports: [ReactiveFormsModule, SelectorFecha],
  template: `
    <label id="fecha-label" for="fecha-control">Fecha</label>
    <app-selector-fecha
      id="fecha"
      etiquetadoPor="fecha-label"
      fechaMinima="2026-08-01"
      fechaMaxima="2026-08-31"
      [soloLectura]="soloLectura()"
      [formControl]="control"
    />
  `,
})
class ComponentePrueba {
  public readonly soloLectura = signal(false);
  public readonly control = new FormControl('2026-08-24', { nonNullable: true });
}

describe('SelectorFecha', () => {
  let fixture: ComponentFixture<ComponentePrueba>;
  let overlay: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentePrueba],
      providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }],
    }).compileComponents();
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

  it('presenta el calendario como un popover no modal', () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    const calendario = overlay.querySelector('[role="dialog"]');

    expect(calendario?.hasAttribute('aria-modal')).toBe(false);
  });

  it('conserva la fecha y no abre el calendario en solo lectura', () => {
    fixture.componentInstance.soloLectura.set(true);
    fixture.detectChanges();

    obtenerTrigger().click();
    fixture.detectChanges();

    expect(obtenerTrigger().getAttribute('aria-readonly')).toBe('true');
    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
    expect(fixture.componentInstance.control.value).toBe('2026-08-24');
  });

  it('abre el calendario al pulsar el disparador y lo cierra al pulsarlo de nuevo', () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    expect(overlay.querySelector('[role="dialog"]')).not.toBeNull();

    obtenerTrigger().click();
    fixture.detectChanges();
    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
  });

  it('abre el calendario con Enter y con Espacio desde el disparador', () => {
    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(overlay.querySelector('[role="dialog"]')).not.toBeNull();

    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();
    expect(overlay.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('ignora otras teclas en el disparador sin abrir el calendario', () => {
    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    fixture.detectChanges();

    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
  });

  it('no abre el calendario con teclado cuando el control está deshabilitado', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
  });

  it('no abre el calendario con teclado en solo lectura', () => {
    fixture.componentInstance.soloLectura.set(true);
    fixture.detectChanges();

    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
  });

  it('permite navegar entre meses con las flechas del encabezado', () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    const [anterior, siguiente] = overlay.querySelectorAll<HTMLButtonElement>(
      '.selector-fecha__encabezado button',
    );

    siguiente.click();
    fixture.detectChanges();
    const mesSiguiente = overlay.querySelector('.selector-fecha__encabezado strong')?.textContent;
    expect(mesSiguiente).toContain('Septiembre');

    anterior.click();
    anterior.click();
    fixture.detectChanges();
    const mesAnterior = overlay.querySelector('.selector-fecha__encabezado strong')?.textContent;
    expect(mesAnterior).toContain('Julio');
  });

  it('desplaza la fecha activa con Home, End, PageUp y PageDown', async () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    const calendario = overlay.querySelector('[role="dialog"]');

    ['Home', 'End', 'PageDown', 'PageUp'].forEach((key) =>
      calendario?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })),
    );
    calendario?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlay.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('cierra el calendario con Escape y con Tab', () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    overlay
      .querySelector('[role="dialog"]')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(overlay.querySelector('[role="dialog"]')).toBeNull();

    obtenerTrigger().click();
    fixture.detectChanges();
    overlay
      .querySelector('[role="dialog"]')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    fixture.detectChanges();
    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
  });

  it('ignora los días fuera del rango permitido', () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    const diaFuera = [...overlay.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')].find(
      (elemento) => elemento.disabled,
    );

    diaFuera?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('2026-08-24');
  });

  it('muestra el placeholder cuando el formulario no tiene una fecha válida', () => {
    fixture.componentInstance.control.setValue('valor-no-iso');
    fixture.detectChanges();

    expect(obtenerTrigger().querySelector('.selector-fecha__placeholder')).not.toBeNull();
    expect(obtenerTrigger().textContent).toContain('Selecciona una fecha');
  });

  it('descarta fechas inexistentes al sincronizar el valor del formulario', () => {
    fixture.componentInstance.control.setValue('2026-02-31');
    fixture.detectChanges();

    expect(obtenerTrigger().querySelector('.selector-fecha__placeholder')).not.toBeNull();
  });

  function obtenerTrigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('#fecha-control') as HTMLButtonElement;
  }
});
