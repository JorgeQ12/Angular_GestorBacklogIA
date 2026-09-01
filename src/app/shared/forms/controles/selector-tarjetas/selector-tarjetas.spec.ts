import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectorTarjetas } from './selector-tarjetas';

@Component({
  imports: [ReactiveFormsModule, SelectorTarjetas],
  template: `
    <h2 id="canal-label">Canal</h2>
    <app-selector-tarjetas
      id="canal"
      etiquetadoPor="canal-label"
      [opciones]="opciones"
      [soloLectura]="soloLectura()"
      [formControl]="control"
    />
  `,
})
class ComponentePrueba {
  public readonly soloLectura = signal(false);
  public readonly control = new FormControl<boolean | null>(null);
  public readonly opciones = [
    { valor: true, etiqueta: 'Con interfaz', descripcion: 'Con pantallas', icono: 'aplicacionWeb' },
    {
      valor: false,
      etiqueta: 'Sin interfaz',
      descripcion: 'Sin pantallas',
      icono: 'tipoSinInterfaz',
    },
  ] as const;
}

describe('SelectorTarjetas', () => {
  let fixture: ComponentFixture<ComponentePrueba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComponentePrueba] }).compileComponents();
    fixture = TestBed.createComponent(ComponentePrueba);
    fixture.detectChanges();
  });

  it('comunica al formulario la opción elegida', () => {
    const controles = obtenerControles();

    controles[1]?.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(false);
    expect(controles[1]?.checked).toBe(true);
  });

  it('refleja el estado deshabilitado del formulario', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(obtenerControles().every((control) => control.disabled)).toBe(true);
  });

  it('expone semántica de grupo para tecnologías de asistencia', () => {
    const grupo = (fixture.nativeElement as HTMLElement).querySelector('[role="radiogroup"]');

    expect(grupo?.getAttribute('aria-labelledby')).toBe('canal-label');
    expect(obtenerControles()).toHaveLength(2);
  });

  it('conserva la alternativa seleccionada en solo lectura', () => {
    fixture.componentInstance.control.setValue(true);
    fixture.componentInstance.soloLectura.set(true);
    fixture.detectChanges();

    obtenerControles()[1]?.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const grupo = (fixture.nativeElement as HTMLElement).querySelector('[role="radiogroup"]');
    expect(grupo?.getAttribute('aria-readonly')).toBe('true');
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  function obtenerControles(): HTMLInputElement[] {
    return [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
        'input[type="radio"]',
      ),
    ];
  }
});
