import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ACCIONES_CREACION_PASO_PROYECTO } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { PasoFlujoProyecto } from './paso-flujo-proyecto';

describe('PasoFlujoProyecto', () => {
  let fixture: ComponentFixture<PasoFlujoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PasoFlujoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PasoFlujoProyecto);
    fixture.componentRef.setInput('datos', {
      proyectoId: '42',
      roles: [],
      nodos: [],
      conexiones: [],
      fechaActualizacion: '2026-09-01T00:00:00.000Z',
    });
  });

  it('compone la tarjeta y el editor de Flujo', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Flujo de usuario');
    expect(fixture.nativeElement.querySelector('app-editor-flujo-proyecto')).toBeTruthy();
  });

  it('confirma desde el footer centralizado cuando el paso no utiliza formulario', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Edicion);
    fixture.componentRef.setInput('acciones', ACCIONES_CREACION_PASO_PROYECTO);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('app-acciones-paso-proyecto .ui-button--primary')
      ?.click();

    expect(guardar).toHaveBeenCalledOnce();
  });
});
