import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasoContextoProyecto } from './paso-contexto-proyecto';

describe('PasoContextoProyecto', () => {
  let fixture: ComponentFixture<PasoContextoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PasoContextoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PasoContextoProyecto);
    fixture.componentRef.setInput('datos', {
      nombre: 'Portal',
      responsable: 'María',
      fechaObjetivo: '2026-12-01',
      prioridadCatalogoId: 1,
      descripcion: 'Descripción',
    });
    fixture.componentRef.setInput('prioridades', [{ id: 1, nombre: 'Alta', descripcion: '' }]);
  });

  it('compone la tarjeta y el formulario de Contexto', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Contexto del proyecto');
    expect(fixture.nativeElement.querySelector('app-formulario-contexto-proyecto')).toBeTruthy();
  });
});
