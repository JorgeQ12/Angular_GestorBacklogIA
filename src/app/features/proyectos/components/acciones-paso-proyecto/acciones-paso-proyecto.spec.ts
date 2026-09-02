import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ACCIONES_CREACION_PASO_PROYECTO,
  ACCIONES_INFORMACION_PASO_PROYECTO,
} from '../../models/acciones-paso-proyecto.model';
import { AccionesPasoProyecto } from './acciones-paso-proyecto';

describe('AccionesPasoProyecto', () => {
  let fixture: ComponentFixture<AccionesPasoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AccionesPasoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(AccionesPasoProyecto);
    fixture.componentRef.setInput('configuracion', ACCIONES_INFORMACION_PASO_PROYECTO);
  });

  it('presenta las acciones configuradas', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cancelar');
    expect(fixture.nativeElement.textContent).toContain('Guardar versión');
    expect(fixture.nativeElement.querySelector('.ui-form-footer--acciones-al-final')).not.toBeNull();
  });

  it('vincula la acción principal con el formulario indicado', () => {
    fixture.componentRef.setInput('idFormulario', 'formulario-contexto');
    fixture.detectChanges();

    const botonPrincipal = fixture.nativeElement.querySelector(
      '.ui-button--primary',
    ) as HTMLButtonElement;

    expect(botonPrincipal.type).toBe('button');
    expect(botonPrincipal.getAttribute('form')).toBe('formulario-contexto');
  });

  it('conserva la alineación original para las acciones de Creación', () => {
    fixture.componentRef.setInput('configuracion', ACCIONES_CREACION_PASO_PROYECTO);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ui-form-footer--acciones-al-final')).toBeNull();
  });

  it('delega la confirmación cuando el editor no utiliza un formulario nativo', () => {
    let confirmado = false;
    fixture.componentInstance.confirmar.subscribe(() => (confirmado = true));
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.ui-button--primary')
      ?.click();

    expect(confirmado).toBe(true);
  });
});
