import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasoEquipoProyecto } from './paso-equipo-proyecto';

describe('PasoEquipoProyecto', () => {
  let fixture: ComponentFixture<PasoEquipoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PasoEquipoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PasoEquipoProyecto);
    fixture.componentRef.setInput('datos', { integrantes: [] });
    fixture.componentRef.setInput('nombreEquipo', 'PoC IA Team');
  });

  it('presenta el Team y el formulario compartido', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('PoC IA Team');
    expect(fixture.nativeElement.querySelector('app-formulario-equipo-proyecto')).toBeTruthy();
  });
});
