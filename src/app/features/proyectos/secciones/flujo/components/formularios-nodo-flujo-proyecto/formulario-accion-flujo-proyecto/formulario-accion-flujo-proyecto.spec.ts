import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoEditorFlujoProyectoService } from '../../../services/estado-editor-flujo-proyecto.service';
import { crearFormularioNodoFlujoPrueba } from '../../../testing/formulario-nodo-flujo-proyecto.fixture';
import { FormularioAccionFlujoProyecto } from './formulario-accion-flujo-proyecto';

describe('FormularioAccionFlujoProyecto', () => {
  let fixture: ComponentFixture<FormularioAccionFlujoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAccionFlujoProyecto],
      providers: [
        {
          provide: EstadoEditorFlujoProyectoService,
          useValue: { roles: signal([]).asReadonly(), obtenerNombreRol: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioAccionFlujoProyecto);
    fixture.componentRef.setInput('formulario', crearFormularioNodoFlujoPrueba());
    fixture.detectChanges();
  });

  it('vincula el título y presenta la ayuda específica de una acción', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('label[for="flujo-accion-titulo"]')?.textContent).toContain(
      'Nombre de la acción',
    );
    expect(elemento.textContent).toContain('Resumen de la acción');
  });
});
