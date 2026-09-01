import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasoTipoSolucionProyecto } from './paso-tipo-solucion-proyecto';

describe('PasoTipoSolucionProyecto', () => {
  let fixture: ComponentFixture<PasoTipoSolucionProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasoTipoSolucionProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(PasoTipoSolucionProyecto);
    fixture.componentRef.setInput('datos', { tieneInterfaz: false, plataforma: null });
  });

  it('compone la tarjeta y el formulario de Tipo de solución', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Tipo de solución');
    expect(
      fixture.nativeElement.querySelector('app-formulario-tipo-solucion-proyecto'),
    ).toBeTruthy();
  });
});
