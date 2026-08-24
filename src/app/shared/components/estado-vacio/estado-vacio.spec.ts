import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoVacio } from './estado-vacio';

describe('EstadoVacio', () => {
  let fixture: ComponentFixture<EstadoVacio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EstadoVacio] }).compileComponents();

    fixture = TestBed.createComponent(EstadoVacio);
    fixture.componentRef.setInput('icono', 'proyectos');
    fixture.componentRef.setInput('titulo', 'Aún no hay proyectos');
    fixture.componentRef.setInput('descripcion', 'Los proyectos aparecerán aquí.');
    fixture.detectChanges();
  });

  it('presenta el contenido recibido mediante su contrato', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('.ui-empty-state__title')?.textContent).toContain(
      'Aún no hay proyectos',
    );
    expect(elemento.querySelector('.ui-empty-state__description')?.textContent).toContain(
      'Los proyectos aparecerán aquí.',
    );
    expect(elemento.querySelector('app-icono')).toBeTruthy();
  });
});
