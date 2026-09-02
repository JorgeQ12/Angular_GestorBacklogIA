import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { ModoFormularioProyecto } from '../../models/modo-formulario-proyecto.model';
import { ACCIONES_INFORMACION_PASO_PROYECTO } from '../../models/acciones-paso-proyecto.model';
import { TarjetaPasoProyecto } from './tarjeta-paso-proyecto';

describe('TarjetaPasoProyecto', () => {
  let fixture: ComponentFixture<TarjetaPasoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TarjetaPasoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(TarjetaPasoProyecto);
    fixture.componentRef.setInput('paso', ClaveSeccionProyecto.Contexto);
  });

  it('presenta la identidad del catálogo compartido', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Contexto del proyecto');
  });

  it('ofrece edición únicamente cuando está autorizada en lectura', () => {
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Lectura);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Editar');
  });

  it('presenta en un único lugar el footer asociado al formulario del paso', () => {
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Edicion);
    fixture.componentRef.setInput('acciones', ACCIONES_INFORMACION_PASO_PROYECTO);
    fixture.componentRef.setInput('idFormulario', 'formulario-contexto');
    fixture.detectChanges();

    const accion = fixture.nativeElement.querySelector(
      'app-acciones-paso-proyecto .ui-button--primary',
    ) as HTMLButtonElement;

    expect(accion.getAttribute('form')).toBe('formulario-contexto');
  });

  it('integra opcionalmente el selector de versión en el encabezado', () => {
    fixture.componentRef.setInput('versionamiento', {
      versiones: [{ id: 7, numero: 3, fechaCreacion: '2026-09-01', esActual: true }],
      versionSeleccionadaId: 7,
      deshabilitado: false,
    });
    fixture.detectChanges();

    const encabezado = (fixture.nativeElement as HTMLElement).querySelector(
      '.tarjeta-paso__encabezado',
    );

    expect(encabezado?.querySelector('app-selector-version-proyecto')).not.toBeNull();
    expect(encabezado?.textContent).toContain('Versión 3 · Actual');
  });
});
