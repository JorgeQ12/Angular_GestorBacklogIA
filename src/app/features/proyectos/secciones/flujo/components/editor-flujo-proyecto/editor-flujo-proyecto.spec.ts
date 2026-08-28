import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlowBlockType, ProjectWorkflow } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { EditorFlujoProyecto } from './editor-flujo-proyecto';

describe('EditorFlujoProyecto', () => {
  let fixture: ComponentFixture<EditorFlujoProyecto>;
  let store: EstadoEditorFlujoProyectoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EditorFlujoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(EditorFlujoProyecto);
    fixture.componentRef.setInput('flujo', FLUJO_VACIO);
    fixture.detectChanges();
    store = fixture.debugElement.injector.get(EstadoEditorFlujoProyectoService);
  });

  it('presenta el editor embebido sin crear una página o ruta adicional', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.textContent).toContain('Construye el recorrido del proyecto');
    expect(elemento.querySelector('app-lienzo-flujo-proyecto')).not.toBeNull();
  });

  it('emite la fotografía completa cuando cambia un bloque', async () => {
    const flujoCambiado = vi.fn();
    fixture.componentInstance.flujoCambiado.subscribe(flujoCambiado);

    store.startNodeCreation(FlowBlockType.Action);
    store.commitNodeDraft({
      type: FlowBlockType.Action,
      title: 'Consultar proyecto',
      description: 'Abre la información del proyecto.',
      acceptanceCriteria: ['El proyecto existe.'],
      roleNames: ['Administrador'],
      data: {},
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(flujoCambiado).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: '42',
        nodes: [expect.objectContaining({ title: 'Consultar proyecto' })],
      }),
    );
  });

  it('bloquea el editor durante el guardado remoto', () => {
    fixture.componentRef.setInput('procesando', true);
    fixture.detectChanges();

    expect(store.isReadOnly()).toBe(true);
  });
});

const FLUJO_VACIO: ProjectWorkflow = {
  projectId: '42',
  roles: [],
  nodes: [],
  connections: [],
  updatedAt: '2026-08-28T10:00:00.000Z',
};
