import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginaFlujoProyecto } from './pagina-flujo-proyecto';

describe('PaginaFlujoProyecto', () => {
  let fixture: ComponentFixture<PaginaFlujoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginaFlujoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PaginaFlujoProyecto);
    fixture.detectChanges();
  });

  it('conserva el destino estable del recorrido', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Equipo configurado');
  });
});
