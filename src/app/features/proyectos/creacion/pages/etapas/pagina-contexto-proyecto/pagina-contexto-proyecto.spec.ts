import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginaContextoProyecto } from './pagina-contexto-proyecto';

describe('PaginaContextoProyecto', () => {
  let fixture: ComponentFixture<PaginaContextoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaContextoProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaContextoProyecto);
    fixture.detectChanges();
  });

  it('presenta únicamente el contenido administrado por la etapa', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.textContent).toContain('El borrador está listo para continuar');
    expect(elemento.querySelector('header')).toBeNull();
    expect(elemento.querySelector('.ui-card')).toBeNull();
  });
});
