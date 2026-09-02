import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasoRolesProyecto } from './paso-roles-proyecto';

describe('PasoRolesProyecto', () => {
  let fixture: ComponentFixture<PasoRolesProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PasoRolesProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PasoRolesProyecto);
    fixture.componentRef.setInput('datos', {
      roles: [{ nombre: 'Administrador', descripcion: 'Configura la solución' }],
    });
  });

  it('compone la tarjeta y el formulario de Roles', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Roles');
    expect(fixture.nativeElement.querySelector('app-formulario-roles-proyecto')).toBeTruthy();
  });
});
