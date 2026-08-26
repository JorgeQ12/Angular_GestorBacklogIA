import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginaRolesProyecto } from './pagina-roles-proyecto';

describe('PaginaRolesProyecto', () => {
  let fixture: ComponentFixture<PaginaRolesProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaRolesProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaRolesProyecto);
    fixture.detectChanges();
  });

  it('conserva el destino estable para continuar el recorrido', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Roles será la siguiente sección',
    );
  });
});
