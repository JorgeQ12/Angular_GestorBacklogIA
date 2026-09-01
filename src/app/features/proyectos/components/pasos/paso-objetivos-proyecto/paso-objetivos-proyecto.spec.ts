import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasoObjetivosProyecto } from './paso-objetivos-proyecto';

describe('PasoObjetivosProyecto', () => {
  let fixture: ComponentFixture<PasoObjetivosProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PasoObjetivosProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PasoObjetivosProyecto);
    fixture.componentRef.setInput('datos', {
      objetivoGeneral: 'Automatizar',
      objetivosEspecificos: ['Reducir tiempos'],
    });
  });

  it('compone la tarjeta y el formulario de Objetivos', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Objetivos');
    expect(fixture.nativeElement.querySelector('app-formulario-objetivos-proyecto')).toBeTruthy();
  });
});
