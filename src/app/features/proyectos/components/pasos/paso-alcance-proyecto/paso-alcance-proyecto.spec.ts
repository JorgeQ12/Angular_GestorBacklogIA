import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ACCIONES_CREACION_PASO_PROYECTO } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { PasoAlcanceProyecto } from './paso-alcance-proyecto';

describe('PasoAlcanceProyecto', () => {
  let fixture: ComponentFixture<PasoAlcanceProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PasoAlcanceProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PasoAlcanceProyecto);
    fixture.componentRef.setInput('datos', { incluido: 'Incluido', excluido: 'Excluido' });
  });

  it('compone la tarjeta y el formulario de Alcance', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Alcance');
    expect(fixture.nativeElement.querySelector('app-formulario-alcance-proyecto')).toBeTruthy();
  });

  it('envía el formulario desde el footer centralizado de la tarjeta', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Edicion);
    fixture.componentRef.setInput('acciones', ACCIONES_CREACION_PASO_PROYECTO);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const formulario = elemento.querySelector('form') as HTMLFormElement;
    const botonPrincipal = elemento.querySelector(
      'app-acciones-paso-proyecto .ui-button--primary',
    ) as HTMLButtonElement;

    expect(botonPrincipal.getAttribute('form')).toBe(formulario.id);
    expect(botonPrincipal.form).toBe(formulario);
    formulario.requestSubmit(botonPrincipal);

    expect(guardar).toHaveBeenCalledWith({ incluido: 'Incluido', excluido: 'Excluido' });
  });
});
