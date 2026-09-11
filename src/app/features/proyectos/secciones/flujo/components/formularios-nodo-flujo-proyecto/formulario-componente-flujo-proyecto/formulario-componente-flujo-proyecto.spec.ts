import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoEditorFlujoProyectoService } from '../../../services/estado-editor-flujo-proyecto.service';
import { crearFormularioNodoFlujoPrueba } from '../../../testing/formulario-nodo-flujo-proyecto.fixture';
import { FormularioComponenteFlujoProyecto } from './formulario-componente-flujo-proyecto';

describe('FormularioComponenteFlujoProyecto', () => {
  let fixture: ComponentFixture<FormularioComponenteFlujoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioComponenteFlujoProyecto],
      providers: [
        {
          provide: EstadoEditorFlujoProyectoService,
          useValue: { roles: signal([]).asReadonly(), obtenerNombreRol: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioComponenteFlujoProyecto);
    fixture.componentRef.setInput('formulario', crearFormularioNodoFlujoPrueba());
    fixture.detectChanges();
  });

  it('presenta los tres datos especializados del componente', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('#flujo-datos-capturados')).toBeTruthy();
    expect(elemento.querySelector('#flujo-campos-obligatorios')).toBeTruthy();
    expect(elemento.querySelector('#flujo-resultado-completado')).toBeTruthy();
  });
});
