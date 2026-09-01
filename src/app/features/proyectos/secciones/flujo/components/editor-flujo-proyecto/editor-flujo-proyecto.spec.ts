import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModoFormularioProyecto } from '../../../../models/modo-formulario-proyecto.model';
import {
  BorradorNodoFlujo,
  FlujoProyecto,
  TipoBloqueFlujo,
  crearDatosNodoPredeterminados,
} from '../../models/flujo-proyecto.model';
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

  it('bloquea el editor y retira sus superficies de edición en modo lectura', () => {
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Lectura);
    estadoEditor.abrirPaletaBloques();
    fixture.detectChanges();

    expect(estadoEditor.soloLectura()).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('app-panel-lateral-flujo-proyecto'),
    ).toBeNull();
  });

  it('aplica cinco acentos distintos en la selección y en los bloques del lienzo', () => {
    estadoEditor.abrirPaletaBloques();
    fixture.detectChanges();

    const opciones = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.paleta-bloques-flujo__elemento',
      ),
    );
    const acentosPaleta = opciones.map((opcion) =>
      opcion.style.getPropertyValue('--acento-bloque-flujo'),
    );

    expect(opciones).toHaveLength(Object.values(TipoBloqueFlujo).length);
    expect(new Set(acentosPaleta).size).toBe(Object.values(TipoBloqueFlujo).length);

    estadoEditor.cerrarPaletaBloques();
    Object.values(TipoBloqueFlujo).forEach((tipo) => crearNodo(tipo));
    fixture.detectChanges();

    const tarjetas = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.tarjeta-bloque-flujo',
      ),
    );
    const acentosLienzo = tarjetas.map((tarjeta) =>
      tarjeta.style.getPropertyValue('--acento-bloque-flujo'),
    );

    expect(tarjetas).toHaveLength(Object.values(TipoBloqueFlujo).length);
    expect(new Set(acentosLienzo)).toEqual(new Set(acentosPaleta));
  });

  it('mantiene abierto el formulario al pulsar el fondo o Escape', () => {
    estadoEditor.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    fixture.detectChanges();
    const overlay = (fixture.nativeElement as HTMLElement).querySelector(
      '.ui-modal-overlay',
    ) as HTMLElement;

    overlay.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('app-modal-nodo-flujo-proyecto'),
    ).not.toBeNull();

    const cerrar = (fixture.nativeElement as HTMLElement).querySelector(
      '.ui-modal__close',
    ) as HTMLButtonElement;
    cerrar.click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('app-modal-nodo-flujo-proyecto'),
    ).toBeNull();
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

  function crearNodo(tipo: TipoBloqueFlujo): void {
    estadoEditor.iniciarCreacionNodo(tipo);
    estadoEditor.confirmarBorradorNodo({
      tipo,
      titulo: `Bloque ${tipo}`,
      descripcion: `Descripción de ${tipo}`,
      criteriosAceptacion: ['Criterio válido'],
      nombresRoles: [],
      datos: crearDatosNodoPredeterminados(tipo),
    } as BorradorNodoFlujo);
  }
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
