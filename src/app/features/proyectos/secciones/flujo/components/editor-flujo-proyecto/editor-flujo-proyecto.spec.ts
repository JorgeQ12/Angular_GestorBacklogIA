import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoBloqueFlujo, FlujoProyecto } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { EditorFlujoProyecto } from './editor-flujo-proyecto';

describe('EditorFlujoProyecto', () => {
  let fixture: ComponentFixture<EditorFlujoProyecto>;
  let estadoEditor: EstadoEditorFlujoProyectoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EditorFlujoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(EditorFlujoProyecto);
    fixture.componentRef.setInput('flujo', FLUJO_VACIO);
    fixture.detectChanges();
    estadoEditor = fixture.debugElement.injector.get(EstadoEditorFlujoProyectoService);
  });

  it('presenta el editor embebido sin crear una página o ruta adicional', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.textContent).toContain('Construye el recorrido del proyecto');
    expect(elemento.querySelector('app-lienzo-flujo-proyecto')).not.toBeNull();
  });

  it('emite la fotografía completa cuando cambia un bloque', async () => {
    const flujoCambiado = vi.fn();
    fixture.componentInstance.flujoCambiado.subscribe(flujoCambiado);

    estadoEditor.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    estadoEditor.confirmarBorradorNodo({
      tipo: TipoBloqueFlujo.Accion,
      titulo: 'Consultar proyecto',
      descripcion: 'Abre la información del proyecto.',
      criteriosAceptacion: ['El proyecto existe.'],
      nombresRoles: ['Administrador'],
      datos: {},
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(flujoCambiado).toHaveBeenCalledWith(
      expect.objectContaining({
        proyectoId: '42',
        nodos: [expect.objectContaining({ titulo: 'Consultar proyecto' })],
      }),
    );
  });

  it('bloquea el editor durante el guardado remoto', () => {
    fixture.componentRef.setInput('procesando', true);
    fixture.detectChanges();

    expect(estadoEditor.soloLectura()).toBe(true);
  });

  it.each(Object.values(TipoBloqueFlujo))(
    'presenta los roles disponibles en el formulario de %s',
    (tipo) => {
      fixture.componentRef.setInput('flujo', FLUJO_CON_ROLES);
      fixture.detectChanges();

      estadoEditor.iniciarCreacionNodo(tipo);
      fixture.detectChanges();

      const modal = (fixture.nativeElement as HTMLElement).querySelector(
        'app-modal-nodo-flujo-proyecto',
      );
      expect(modal?.textContent).toContain('Administrador');
      expect(modal?.querySelector<HTMLInputElement>('#flujo-rol-rol-administrador')).not.toBeNull();
    },
  );
});

const FLUJO_VACIO: FlujoProyecto = {
  proyectoId: '42',
  roles: [],
  nodos: [],
  conexiones: [],
  fechaActualizacion: '2026-08-28T10:00:00.000Z',
};

const FLUJO_CON_ROLES: FlujoProyecto = {
  ...FLUJO_VACIO,
  roles: [
    {
      id: 'rol-administrador',
      nombre: 'Administrador',
      fechaCreacion: '2026-08-28T10:00:00.000Z',
    },
  ],
};
