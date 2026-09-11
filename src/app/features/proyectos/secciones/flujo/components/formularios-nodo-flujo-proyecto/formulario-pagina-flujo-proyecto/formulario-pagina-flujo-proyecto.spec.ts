import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoEditorFlujoProyectoService } from '../../../services/estado-editor-flujo-proyecto.service';
import { crearFormularioNodoFlujoPrueba } from '../../../testing/formulario-nodo-flujo-proyecto.fixture';
import { FormularioPaginaFlujoProyecto } from './formulario-pagina-flujo-proyecto';

describe('FormularioPaginaFlujoProyecto', () => {
  let fixture: ComponentFixture<FormularioPaginaFlujoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioPaginaFlujoProyecto],
      providers: [
        {
          provide: EstadoEditorFlujoProyectoService,
          useValue: { roles: signal([]).asReadonly(), obtenerNombreRol: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioPaginaFlujoProyecto);
    fixture.componentRef.setInput('formulario', crearFormularioNodoFlujoPrueba());
    fixture.detectChanges();
  });

  it('presenta el contrato específico de una página', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('label[for="flujo-pagina-titulo"]')?.textContent).toContain(
      'Nombre de la página',
    );
    expect(elemento.textContent).toContain('Descripción de la página');
  });
});
