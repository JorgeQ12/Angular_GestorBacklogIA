import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasoFlujoProyecto } from './paso-flujo-proyecto';

describe('PasoFlujoProyecto', () => {
  let fixture: ComponentFixture<PasoFlujoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PasoFlujoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PasoFlujoProyecto);
    fixture.detectChanges();
  });

  it('mantiene visible el destino pendiente del recorrido', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.textContent).toContain('Equipo configurado');
    expect(elemento.textContent).toContain('Flujo de usuario será la siguiente sección');
  });
});
