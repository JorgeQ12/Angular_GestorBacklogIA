import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiaSemanaFlujo } from '../../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../../services/estado-editor-flujo-proyecto.service';
import { crearFormularioNodoFlujoPrueba } from '../../../testing/formulario-nodo-flujo-proyecto.fixture';
import { FormularioModuloFlujoProyecto } from './formulario-modulo-flujo-proyecto';

describe('FormularioModuloFlujoProyecto', () => {
  let fixture: ComponentFixture<FormularioModuloFlujoProyecto>;
  const formulario = crearFormularioNodoFlujoPrueba();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioModuloFlujoProyecto],
      providers: [
        {
          provide: EstadoEditorFlujoProyectoService,
          useValue: { roles: signal([]).asReadonly(), obtenerNombreRol: jasmine.createSpy('obtenerNombreRol') },
        },
      ],
    }).compileComponents();
    while (formulario.controls.horariosMayorActividad.length > 1) {
      formulario.controls.horariosMayorActividad.removeAt(1);
    }
    fixture = TestBed.createComponent(FormularioModuloFlujoProyecto);
    fixture.componentRef.setInput('formulario', formulario);
    fixture.detectChanges();
  });

  it('agrega y elimina franjas conservando al menos una', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    [...elemento.querySelectorAll<HTMLButtonElement>('button')]
      .find((boton) => boton.textContent?.includes('Agregar franja'))
      ?.click();
    fixture.detectChanges();
    expect(formulario.controls.horariosMayorActividad.length).toBe(2);

    elemento.querySelector<HTMLButtonElement>('[aria-label="Eliminar horario 2"]')?.click();
    fixture.detectChanges();
    expect(formulario.controls.horariosMayorActividad.length).toBe(1);
    expect(elemento.querySelector<HTMLButtonElement>('[aria-label="Eliminar horario 1"]')?.disabled).toBe(
      true,
    );
  });

  it('alterna un día de mayor actividad', () => {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>(`[aria-label="${DiaSemanaFlujo.Lunes}"]`)
      ?.click();
    expect(formulario.controls.horariosMayorActividad.at(0).controls.dias.value).toContain(
      DiaSemanaFlujo.Lunes,
    );
  });
});
