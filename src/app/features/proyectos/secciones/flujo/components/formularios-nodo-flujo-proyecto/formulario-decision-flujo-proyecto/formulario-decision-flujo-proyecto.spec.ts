import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoEditorFlujoProyectoService } from '../../../services/estado-editor-flujo-proyecto.service';
import { crearFormularioNodoFlujoPrueba } from '../../../testing/formulario-nodo-flujo-proyecto.fixture';
import { FormularioDecisionFlujoProyecto } from './formulario-decision-flujo-proyecto';

describe('FormularioDecisionFlujoProyecto', () => {
  let fixture: ComponentFixture<FormularioDecisionFlujoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioDecisionFlujoProyecto],
      providers: [
        {
          provide: EstadoEditorFlujoProyectoService,
          useValue: { roles: signal([]).asReadonly(), obtenerNombreRol: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioDecisionFlujoProyecto);
    fixture.componentRef.setInput('formulario', crearFormularioNodoFlujoPrueba());
    fixture.detectChanges();
  });

  it('explica las ramas de decisión y retira la asignación de roles', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.textContent).toContain('rutas Sí y No');
    expect(elemento.textContent).not.toContain('Roles involucrados');
  });
});
