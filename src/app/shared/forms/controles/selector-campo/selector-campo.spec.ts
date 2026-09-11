import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OpcionSelector } from './models/opcion-selector.model';
import { SelectorCampo } from './selector-campo';

@Component({
  imports: [ReactiveFormsModule, SelectorCampo],
  template: `
    <label id="prioridad-label" for="prioridad-control">Prioridad</label>
    <app-selector-campo
      id="prioridad"
      etiquetadoPor="prioridad-label"
      [opciones]="opciones()"
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
  public readonly opciones = signal<OpcionSelector[]>([
    { valor: 1, etiqueta: 'Alta', descripcion: 'Atención prioritaria' },
    { valor: 2, etiqueta: 'Media' },
    { valor: null, etiqueta: 'Todas las prioridades' },
  ]);
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

  it('abre la lista al pulsar el disparador y la cierra al volver a pulsarlo', () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    expect(overlay.querySelector('[role="listbox"]')).not.toBeNull();

    obtenerTrigger().click();
    fixture.detectChanges();
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
  });

  it('abre la lista con Enter y con Espacio desde el disparador', () => {
    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(overlay.querySelector('[role="listbox"]')).not.toBeNull();

    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();
    expect(overlay.querySelector('[role="listbox"]')).not.toBeNull();
  });

  it('abre la lista con ArrowUp activando el último elemento disponible', async () => {
    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    fixture.detectChanges();
    await fixture.whenStable();
    const opciones = overlay.querySelectorAll<HTMLButtonElement>('[role="option"]');

    expect(opciones[opciones.length - 1]?.classList).toContain('selector-campo__opcion--activa');
  });

  it('ignora teclas del disparador que no abren la lista', () => {
    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    fixture.detectChanges();

    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
  });

  it('no responde al teclado del disparador cuando está deshabilitado', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    obtenerTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
  });

  it('navega hasta los extremos de la lista con Home y End', async () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    const lista = overlay.querySelector('[role="listbox"]');

    lista?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    let opciones = overlay.querySelectorAll<HTMLButtonElement>('[role="option"]');
    expect(opciones[opciones.length - 1]?.classList).toContain('selector-campo__opcion--activa');

    lista?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    opciones = overlay.querySelectorAll<HTMLButtonElement>('[role="option"]');
    expect(opciones[0]?.classList).toContain('selector-campo__opcion--activa');
  });

  it('recorre las opciones de forma circular hacia arriba con ArrowUp', async () => {
    obtenerTrigger().click();
    fixture.detectChanges();
    const lista = overlay.querySelector('[role="listbox"]');
    const opciones = overlay.querySelectorAll<HTMLButtonElement>('[role="option"]');
    expect(opciones[2]?.classList).toContain('selector-campo__opcion--activa');

    lista?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(opciones[1]?.classList).toContain('selector-campo__opcion--activa');
  });

  it('cierra la lista con Tab sin devolver el foco', () => {
    obtenerTrigger().click();
    fixture.detectChanges();

    overlay
      .querySelector('[role="listbox"]')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    fixture.detectChanges();

    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
  });

  it('no permite seleccionar una opción deshabilitada', () => {
    fixture.componentInstance.opciones.set([
      { valor: 1, etiqueta: 'Alta' },
      { valor: 2, etiqueta: 'Media', deshabilitada: true },
    ]);
    fixture.detectChanges();
    obtenerTrigger().click();
    fixture.detectChanges();

    overlay.querySelectorAll<HTMLButtonElement>('[role="option"]')[1]?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('muestra el mensaje de lista vacía cuando no hay opciones', () => {
    fixture.componentInstance.opciones.set([]);
    fixture.detectChanges();
    obtenerTrigger().click();
    fixture.detectChanges();

    expect(overlay.querySelector('.selector-campo__vacio')?.textContent).toContain(
      'No hay opciones disponibles',
    );
  });

  function obtenerTrigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('#prioridad-control') as HTMLButtonElement;
  }
});
