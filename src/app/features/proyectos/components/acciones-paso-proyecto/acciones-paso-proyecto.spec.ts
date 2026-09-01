import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ACCIONES_INFORMACION_PASO_PROYECTO } from '../../models/acciones-paso-proyecto.model';
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
  });

  it('vincula la acción principal con el formulario indicado', () => {
    fixture.componentRef.setInput('idFormulario', 'formulario-contexto');
    fixture.detectChanges();

    const botonPrincipal = fixture.nativeElement.querySelector(
      '.ui-button--primary',
    ) as HTMLButtonElement;

    expect(botonPrincipal.type).toBe('submit');
    expect(botonPrincipal.getAttribute('form')).toBe('formulario-contexto');
  });
});
