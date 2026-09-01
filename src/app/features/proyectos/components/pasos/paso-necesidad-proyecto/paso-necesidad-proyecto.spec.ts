import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasoNecesidadProyecto } from './paso-necesidad-proyecto';

describe('PasoNecesidadProyecto', () => {
  let fixture: ComponentFixture<PasoNecesidadProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PasoNecesidadProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PasoNecesidadProyecto);
    fixture.componentRef.setInput('datos', {
      situacionActual: 'Situación',
      problemas: 'Problemas',
      impacto: 'Impacto',
    });
  });

  it('compone la tarjeta y el formulario de Necesidad', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Necesidad de negocio');
    expect(fixture.nativeElement.querySelector('app-formulario-necesidad-proyecto')).toBeTruthy();
  });
});
