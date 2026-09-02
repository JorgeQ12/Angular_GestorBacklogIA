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

  it('permite consultar el detalle de un bloque en modo lectura', () => {
    crearNodo(TipoBloqueFlujo.Accion);
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Lectura);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    elemento.querySelector<HTMLElement>('.tarjeta-bloque-flujo')?.click();
    fixture.detectChanges();

    const modal = elemento.querySelector<HTMLElement>('app-modal-nodo-flujo-proyecto');
    const titulo = modal?.querySelector<HTMLInputElement>('#flujo-accion-titulo');

    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('Detalle de acción');
    expect(titulo?.disabled).toBe(true);
    expect(modal?.querySelector('button[type="submit"]')).toBeNull();
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

  it('alterna el editor entre el canvas integrado y la pantalla completa', async () => {
    const documento = (fixture.nativeElement as HTMLElement).ownerDocument;
    const contenedorEditor = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.editor-flujo',
    )!;
    let elementoPantallaCompleta: Element | null = null;
    const solicitarPantallaCompleta = vi.fn(async () => {
      elementoPantallaCompleta = contenedorEditor;
      documento.dispatchEvent(new Event('fullscreenchange'));
    });
    const salirPantallaCompleta = vi.fn(async () => {
      elementoPantallaCompleta = null;
      documento.dispatchEvent(new Event('fullscreenchange'));
    });

    Object.defineProperty(documento, 'fullscreenElement', {
      configurable: true,
      get: () => elementoPantallaCompleta,
    });
    Object.defineProperty(documento, 'exitFullscreen', {
      configurable: true,
      value: salirPantallaCompleta,
    });
    Object.defineProperty(contenedorEditor, 'requestFullscreen', {
      configurable: true,
      value: solicitarPantallaCompleta,
    });

    try {
      const ampliar = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        '[aria-label="Ampliar canvas a pantalla completa"]',
      )!;
      ampliar.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(solicitarPantallaCompleta).toHaveBeenCalledOnce();
      const reducir = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        '[aria-label="Reducir canvas"]',
      )!;
      reducir.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(salirPantallaCompleta).toHaveBeenCalledOnce();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          '[aria-label="Ampliar canvas a pantalla completa"]',
        ),
      ).not.toBeNull();
    } finally {
      Reflect.deleteProperty(documento, 'fullscreenElement');
      Reflect.deleteProperty(documento, 'exitFullscreen');
      Reflect.deleteProperty(contenedorEditor, 'requestFullscreen');
    }
  });

  it.each([
    TipoBloqueFlujo.Modulo,
    TipoBloqueFlujo.Pagina,
    TipoBloqueFlujo.Accion,
    TipoBloqueFlujo.Componente,
  ])(
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

  it('elimina la asignación de roles de los bloques de decisión', () => {
    fixture.componentRef.setInput('flujo', FLUJO_CON_ROLES);
    fixture.detectChanges();

    estadoEditor.iniciarCreacionNodo(TipoBloqueFlujo.Decision);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#flujo-nombres-roles'),
    ).toBeNull();

    estadoEditor.confirmarBorradorNodo({
      tipo: TipoBloqueFlujo.Decision,
      titulo: '¿Continúa el proceso?',
      descripcion: 'Evalúa si el recorrido puede continuar.',
      criteriosAceptacion: ['La condición tiene un resultado definido.'],
      nombresRoles: ['Administrador'],
      datos: {},
    });

    expect(estadoEditor.flujo().nodos[0].idsRoles).toEqual([]);
  });

  it('permite crear un componente sin seleccionar roles', () => {
    estadoEditor.iniciarCreacionNodo(TipoBloqueFlujo.Componente);
    fixture.detectChanges();

    escribirCampo('#flujo-descripcion', 'Presenta la información del proyecto.');
    escribirCampo('#flujo-criterio-0', 'La información se presenta correctamente.');
    escribirCampo('#flujo-datos-capturados', 'Nombre y descripción.');
    escribirCampo('#flujo-campos-obligatorios', 'Nombre.');
    escribirCampo('#flujo-resultado-completado', 'Información disponible.');
    fixture.detectChanges();

    const botonGuardar = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[form="formulario-nodo-flujo-proyecto"]',
    );
    expect(botonGuardar?.disabled).toBe(false);

    botonGuardar?.click();
    fixture.detectChanges();

    expect(estadoEditor.flujo().nodos[0]).toMatchObject({
      tipo: TipoBloqueFlujo.Componente,
      idsRoles: [],
    });
  });

  it('conserva el último criterio requerido y permite eliminar filas adicionales', () => {
    estadoEditor.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const eliminarPrimero = elemento.querySelector<HTMLButtonElement>(
      '[aria-label="Eliminar criterio de aceptación 1"]',
    );

    expect(elemento.querySelectorAll('[id^="flujo-criterio-"]')).toHaveLength(1);
    expect(eliminarPrimero?.disabled).toBe(true);

    elemento.querySelector<HTMLButtonElement>('button.ui-form-section__action')?.click();
    fixture.detectChanges();

    expect(elemento.querySelectorAll('[id^="flujo-criterio-"]')).toHaveLength(2);
    const eliminarSegundo = elemento.querySelector<HTMLButtonElement>(
      '[aria-label="Eliminar criterio de aceptación 2"]',
    );
    expect(eliminarSegundo?.disabled).toBe(false);

    eliminarSegundo?.click();
    fixture.detectChanges();

    expect(elemento.querySelectorAll('[id^="flujo-criterio-"]')).toHaveLength(1);
    expect(
      elemento.querySelector<HTMLButtonElement>(
        '[aria-label="Eliminar criterio de aceptación 1"]',
      )?.disabled,
    ).toBe(true);
  });

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

  function escribirCampo(selector: string, valor: string): void {
    const control = (fixture.nativeElement as HTMLElement).querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >(selector)!;
    control.value = valor;
    control.dispatchEvent(new Event('input', { bubbles: true }));
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
