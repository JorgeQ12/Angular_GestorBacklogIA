import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  PARAMETROS_RUTA,
  SEGMENTOS_RUTA,
  crearUrlPlanificacionProyecto,
} from '../../../../../core/navegacion/rutas';
import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion,
  type PlanificacionProyecto,
} from '../../models/planificacion-proyecto.model';
import {
  ModoEditorElementoPlanificacion,
  type ContextoEditorElementoPlanificacion,
  type DetalleElementoPlanificacion,
} from '../../models/detalle-elemento-planificacion.model';
import { EstadoPlanificacionProyectoService } from '../../services/estado-planificacion-proyecto.service';
import { EstadoEditorElementoPlanificacionService } from '../../services/estado-editor-elemento-planificacion.service';
import { EstadoHistorialElementoPlanificacionService } from '../../services/estado-historial-elemento-planificacion.service';
import { EstadoGeneracionIaPlanificacionService } from '../../services/estado-generacion-ia-planificacion.service';
import { EstadoExploracionPlanificacionService } from '../../services/estado-exploracion-planificacion.service';
import { EstadoPublicacionAzurePlanificacionService } from '../../services/estado-publicacion-azure-planificacion.service';
import { EstadoSincronizacionEpicaAzurePlanificacionService } from '../../services/estado-sincronizacion-epica-azure-planificacion.service';
import { EstadoEliminacionRequisitosPlanificacionService } from '../../services/estado-eliminacion-requisitos-planificacion.service';
import { EstadoGanttPlanificacionService } from '../../services/estado-gantt-planificacion.service';
import { NivelGeneracionIaPlanificacion } from '../../models/generacion-ia-planificacion.model';
import { PestanaElementoPlanificacion } from '../../models/historial-elemento-planificacion.model';
import { OrigenVersionPlanificacion } from '../../models/version-planificacion.model';
import type { ResultadoSincronizacionEpicaAzurePlanificacion } from '../../models/sincronizacion-epica-azure-planificacion.model';
import { PaginaPlanificacionProyecto } from './pagina-planificacion-proyecto';

describe('PaginaPlanificacionProyecto', () => {
  const planificacion = signal<PlanificacionProyecto | null>(PLANIFICACION);
  const planificacionActual = signal<PlanificacionProyecto | null>(PLANIFICACION);
  const versiones = signal(VERSIONES);
  const incluirEliminados = signal(false);
  const errorCarga = signal(false);
  const editorAbierto = signal(false);
  const editorContexto = signal<ContextoEditorElementoPlanificacion | null>(null);
  const editorDetalle = signal<DetalleElementoPlanificacion | null>(null);
  const estado = {
    planificacion: planificacion.asReadonly(),
    planificacionActual: planificacionActual.asReadonly(),
    versiones: versiones.asReadonly(),
    seleccionando: signal(false).asReadonly(),
    incluirEliminados: incluirEliminados.asReadonly(),
    errorCarga: errorCarga.asReadonly(),
    cargar: jasmine.createSpy('cargar'),
    presentarVersion: jasmine.createSpy('presentarVersion'),
    actualizarInclusionEliminados: jasmine.createSpy('actualizarInclusionEliminados'),
  };
  const editor = {
    abierto: editorAbierto.asReadonly(),
    contexto: editorContexto.asReadonly(),
    detalle: editorDetalle.asReadonly(),
    catalogos: signal({ prioridades: [], riesgos: [], actividadesTarea: [], actividadesRequisito: [] }).asReadonly(),
    cargando: signal(false).asReadonly(),
    guardando: signal(false).asReadonly(),
    soloLectura: signal(false).asReadonly(),
    puedeEditar: signal(false).asReadonly(),
    valoresFormulario: signal(null).asReadonly(),
    abrirCreacion: jasmine.createSpy('abrirCreacion'),
    abrirConsulta: jasmine.createSpy('abrirConsulta'),
    abrirEdicion: jasmine.createSpy('abrirEdicion'),
    iniciarEdicion: jasmine.createSpy('iniciarEdicion'),
    cerrar: jasmine.createSpy('cerrar'),
    guardar: jasmine.createSpy('guardar'),
  };
  const historial = {
    registros: signal([]).asReadonly(),
    siguienteCursor: signal(null).asReadonly(),
    hayMas: signal(false).asReadonly(),
    versionSeleccionadaId: signal(null).asReadonly(),
    versionSeleccionada: signal(null).asReadonly(),
    cargandoHistorial: signal(false).asReadonly(),
    cargandoVersion: signal(false).asReadonly(),
    errorHistorial: signal(false).asReadonly(),
    errorVersion: signal(false).asReadonly(),
    abrir: jasmine.createSpy('abrir'),
    seleccionar: jasmine.createSpy('seleccionar'),
    cargarMas: jasmine.createSpy('cargarMas'),
    reintentarHistorial: jasmine.createSpy('reintentarHistorial'),
    reintentarVersion: jasmine.createSpy('reintentarVersion'),
    cerrar: jasmine.createSpy('cerrar'),
  };
  const panelGeneracionAbierto = signal(false);
  const generarConIA = {
    panelAbierto: panelGeneracionAbierto.asReadonly(),
    procesando: signal(false).asReadonly(),
    alternarPanel: jasmine.createSpy('alternarPanel').and.callFake(() => panelGeneracionAbierto.update((abierto) => !abierto)),
    generar: jasmine.createSpy('generar'),
    restablecer: jasmine.createSpy('restablecer').and.callFake(() => panelGeneracionAbierto.set(false)),
  };
  const publicandoAzure = signal(false);
  const publicacionAzure = {
    publicando: publicandoAzure.asReadonly(),
    publicar: jasmine.createSpy('publicar'),
    restablecer: jasmine.createSpy('restablecer').and.callFake(() => publicandoAzure.set(false)),
  };
  const sincronizandoAzure = signal(false);
  const sincronizarEpica = jasmine.createSpy<
    (
      proyectoId: number,
      completado: (resultado: ResultadoSincronizacionEpicaAzurePlanificacion) => void,
    ) => void
  >('sincronizarEpica');
  const sincronizacionAzure = {
    sincronizando: sincronizandoAzure.asReadonly(),
    sincronizar: sincronizarEpica,
    restablecer: jasmine.createSpy('restablecer').and.callFake(() => sincronizandoAzure.set(false)),
  };
  const eliminandoRequisito = signal(false);
  const eliminarRequisito = jasmine.createSpy<
    (elemento: ElementoPlanificacion, actualizarArbol: () => void) => Promise<void>
  >('eliminarRequisito');
  const eliminacionRequisitos = {
    eliminando: eliminandoRequisito.asReadonly(),
    eliminar: eliminarRequisito,
    restablecer: jasmine.createSpy('restablecer').and.callFake(() => eliminandoRequisito.set(false)),
  };
  const ganttAbierto = signal(false);
  const gantt = {
    abierto: ganttAbierto.asReadonly(),
    cargando: signal(false).asReadonly(),
    error: signal(false).asReadonly(),
    datos: signal(null).asReadonly(),
    abrir: jasmine.createSpy('abrir').and.callFake(() => ganttAbierto.set(true)),
    cerrar: jasmine.createSpy('cerrar').and.callFake(() => ganttAbierto.set(false)),
    sincronizar: jasmine.createSpy('sincronizar'),
    reintentar: jasmine.createSpy('reintentar'),
    restablecer: jasmine.createSpy('restablecer').and.callFake(() => ganttAbierto.set(false)),
  };

  beforeEach(() => {
    estado.cargar.calls.reset();
    estado.presentarVersion.calls.reset();
    estado.actualizarInclusionEliminados.calls.reset();
    editor.abrirCreacion.calls.reset();
    editor.abrirConsulta.calls.reset();
    editor.abrirEdicion.calls.reset();
    editor.iniciarEdicion.calls.reset();
    editor.cerrar.calls.reset();
    editor.guardar.calls.reset();
    historial.abrir.calls.reset();
    historial.seleccionar.calls.reset();
    historial.cargarMas.calls.reset();
    historial.reintentarHistorial.calls.reset();
    historial.reintentarVersion.calls.reset();
    historial.cerrar.calls.reset();
    generarConIA.alternarPanel.calls.reset();
    generarConIA.generar.calls.reset();
    generarConIA.restablecer.calls.reset();
    publicacionAzure.publicar.calls.reset();
    publicacionAzure.restablecer.calls.reset();
    sincronizarEpica.calls.reset();
    sincronizacionAzure.restablecer.calls.reset();
    eliminarRequisito.calls.reset();
    eliminacionRequisitos.restablecer.calls.reset();
    gantt.abrir.calls.reset();
    gantt.cerrar.calls.reset();
    gantt.sincronizar.calls.reset();
    gantt.reintentar.calls.reset();
    gantt.restablecer.calls.reset();
    planificacion.set(PLANIFICACION);
    planificacionActual.set(PLANIFICACION);
    versiones.set(VERSIONES);
    incluirEliminados.set(false);
    errorCarga.set(false);
    editorAbierto.set(false);
    editorContexto.set(null);
    editorDetalle.set(null);
    panelGeneracionAbierto.set(false);
    publicandoAzure.set(false);
    sincronizandoAzure.set(false);
    eliminandoRequisito.set(false);
    ganttAbierto.set(false);
    eliminarRequisito.and.returnValue(Promise.resolve(undefined));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(RUTAS),
        { provide: EstadoPlanificacionProyectoService, useValue: estado },
        { provide: EstadoEditorElementoPlanificacionService, useValue: editor },
        { provide: EstadoHistorialElementoPlanificacionService, useValue: historial },
        { provide: EstadoGeneracionIaPlanificacionService, useValue: generarConIA },
        { provide: EstadoPublicacionAzurePlanificacionService, useValue: publicacionAzure },
        {
          provide: EstadoSincronizacionEpicaAzurePlanificacionService,
          useValue: sincronizacionAzure,
        },
        {
          provide: EstadoEliminacionRequisitosPlanificacionService,
          useValue: eliminacionRequisitos,
        },
        { provide: EstadoGanttPlanificacionService, useValue: gantt },
        EstadoExploracionPlanificacionService,
      ],
    });
  });

  it('carga y presenta el resumen de la planificación para el proyecto de la ruta', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );

    const elemento = harness.routeNativeElement;
    expect(estado.cargar).toHaveBeenCalledWith(42);
    expect(elemento?.querySelector('h1')?.textContent).toContain('Sistema de envíos');
    expect(elemento?.textContent).toContain('Versión 4');
    expect(elemento?.textContent).toContain('historias de usuario');
    expect(elemento?.textContent).toContain('5');
    expect(elemento?.textContent).toContain('Épica de entregas');
    expect(
      elemento?.querySelector('.pagina-planificacion__contenido--arbol'),
    ).not.toBeNull();
  });

  it('abre una característica vigente y autorizada directamente en edición', async () => {
    planificacion.set(PLANIFICACION_REQUISITOS);
    planificacionActual.set(PLANIFICACION_REQUISITOS);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );
    const boton = harness.routeNativeElement?.querySelector<HTMLButtonElement>(
      'button[aria-label^="Consultar Característica: Cobertura funcional"]',
    );

    boton?.click();

    expect(boton).toBeDefined();
    expect(editor.abrirEdicion).toHaveBeenCalledWith(
      42,
      TipoElementoPlanificacion.Caracteristica,
      20,
    );
    expect(editor.abrirConsulta).not.toHaveBeenCalled();
  });

  it('presenta un error reintentable sin consultar con un identificador inválido', async () => {
    planificacion.set(null);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/invalido/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );

    expect(estado.cargar).not.toHaveBeenCalled();
    expect(harness.routeNativeElement?.textContent).toContain(
      'No fue posible cargar la planificación',
    );
    expect(harness.routeNativeElement?.querySelector('app-encabezado-pagina')).toBeNull();
    expect(
      harness.routeNativeElement
        ?.querySelector('app-estado-error')
        ?.classList.contains('estado-error--pagina-completa'),
    ).toBe(true);
    expect(
      harness.routeNativeElement
        ?.querySelector('.pagina-planificacion')
        ?.getAttribute('aria-labelledby'),
    ).toBeNull();
  });

  it('distingue una planificación válida sin elementos mediante el estado vacío', async () => {
    planificacion.set({ ...PLANIFICACION, elementos: [] });
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );

    expect(harness.routeNativeElement?.textContent).toContain(
      'La planificación todavía no contiene elementos',
    );
    expect(harness.routeNativeElement?.textContent).toContain('Vista');
  });

  it('solicita incluir eliminados desde las opciones de visualización', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      '/' + SEGMENTOS_RUTA.proyectos + '/42/' + SEGMENTOS_RUTA.planificacion,
      PaginaPlanificacionProyecto,
    );
    abrirPanelVista(harness.routeNativeElement);
    harness.detectChanges();
    const control = harness.routeNativeElement?.querySelector<HTMLInputElement>(
      '#incluir-eliminados-planificacion',
    );

    control?.click();

    expect(estado.actualizarInclusionEliminados).toHaveBeenCalledWith(true);
  });

  it('abre el Gantt con la fotografía de planificación presentada', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      '/' + SEGMENTOS_RUTA.proyectos + '/42/' + SEGMENTOS_RUTA.planificacion,
      PaginaPlanificacionProyecto,
    );
    abrirPanelVista(harness.routeNativeElement);
    harness.detectChanges();
    const boton = [...(harness.routeNativeElement?.querySelectorAll('button') ?? [])]
      .find((elemento) => elemento.textContent?.includes('Vista Gantt'));

    (boton as HTMLButtonElement | undefined)?.click();
    harness.detectChanges();

    expect(gantt.abrir).toHaveBeenCalledWith(PLANIFICACION);
    expect(
      harness.routeNativeElement?.querySelector('.pagina-planificacion__contenido--arbol'),
    ).toBeNull();
  });

  it('filtra el árbol y permite limpiar una búsqueda sin resultados', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      '/' + SEGMENTOS_RUTA.proyectos + '/42/' + SEGMENTOS_RUTA.planificacion,
      PaginaPlanificacionProyecto,
    );
    const control = harness.routeNativeElement?.querySelector<HTMLInputElement>(
      'app-campo-busqueda input',
    );

    if (control) {
      control.value = 'inexistente';
      control.dispatchEvent(new Event('input'));
    }
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('No encontramos elementos');
    const limpiar = [...(harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
      .find((boton) => boton.textContent?.includes('Limpiar búsqueda'));
    limpiar?.click();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Épica de entregas');
  });

  it('construye la ruta canónica de planificación', () => {
    expect(crearUrlPlanificacionProyecto(42)).toBe('/panel/proyectos/42/planificacion');
  });

  it('solicita la versión histórica indicada en la URL', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}?${PARAMETROS_RUTA.versionProyectoId}=80`,
      PaginaPlanificacionProyecto,
    );

    expect(estado.presentarVersion).toHaveBeenCalledWith(80);
  });

  it('solicita la generación del nivel elegido para el proyecto de la ruta', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );
    const botones = Array.from(
      harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('button') ?? [],
    );
    botones.find((boton) => boton.textContent?.includes('Generar con IA'))?.click();
    harness.detectChanges();
    const botonCaracteristicas = Array.from(
      harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>(
        '.generacion-ia__opcion',
      ) ?? [],
    ).find((boton) => boton.textContent?.includes('Características'));

    botonCaracteristicas?.click();

    expect(generarConIA.generar).toHaveBeenCalledWith(
      42,
      NivelGeneracionIaPlanificacion.Caracteristicas,
    );
  });

  it('solicita publicar la planificación vigente en Azure DevOps', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );

    harness.routeNativeElement
      ?.querySelector<HTMLButtonElement>('app-publicacion-azure-planificacion button')
      ?.click();

    expect(publicacionAzure.publicar).toHaveBeenCalledWith(42);
  });

  it('sincroniza la epica principal autorizada y recarga la planificacion vigente', async () => {
    const epica = PLANIFICACION.elementos[0];
    planificacion.set({
      ...PLANIFICACION,
      elementos: [
        {
          ...epica,
          vinculadaAzure: true,
          capacidades: {
            ...epica.capacidades,
            puedeEditar: false,
            puedeSincronizar: true,
            soloLectura: true,
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );
    const acciones = [...(harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
      .find((actual) => actual.getAttribute('aria-label')?.startsWith('Acciones de'));
    acciones?.click();
    harness.detectChanges();
    const boton = [...(harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
      .find((actual) => actual.textContent?.includes('Sincronizar con Azure'));

    boton?.click();
    const completado = sincronizarEpica.calls.argsFor(0)?.[1];
    completado?.({
      epicaId: 1,
      azureWorkItemId: 1204,
      revisionesImportadas: 2,
      revisionAzureActual: 9,
      fechaSincronizacion: '2026-09-04T15:00:00Z',
      urlEpica: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
    });

    expect(sincronizarEpica).toHaveBeenCalledWith(42, jasmine.any(Function));
    expect(estado.cargar).toHaveBeenCalledWith(42, false);
  });

  it('ofrece la sincronizacion al consultar el detalle de la epica principal', async () => {
    editorAbierto.set(true);
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Consulta,
      tipo: TipoElementoPlanificacion.Epica,
      proyectoId: 42,
      versionPlanificacionId: null,
      padreId: null,
      elementoId: 1,
    });
    editorDetalle.set({
      ...DETALLE_TAREA,
      tipo: TipoElementoPlanificacion.Epica,
      id: 1,
      urlAzure: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
      capacidades: {
        puedeEditar: false,
        puedeVerHistorial: true,
        puedeSincronizar: true,
        soloLectura: true,
      },
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );
    const dialogo = harness.routeNativeElement?.querySelector<HTMLElement>('.ui-modal');
    const abrirAzure = dialogo?.querySelector<HTMLAnchorElement>(
      '.ui-modal__actions a[href*="_workitems/edit/1204"]',
    );
    const boton = [...(harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>(
      '.ui-modal__actions button',
    ) ?? [])].find((actual) => actual.textContent?.includes('Sincronizar'));

    boton?.click();

    expect(boton).toBeDefined();
    expect(dialogo?.textContent).toContain('Épica');
    expect(dialogo?.textContent).toContain('Versión 4');
    expect(dialogo?.textContent).toContain('Solo lectura');
    expect(abrirAzure?.textContent).toContain('Abrir en Azure');
    expect(sincronizarEpica).toHaveBeenCalledWith(42, jasmine.any(Function));
    expect(editor.iniciarEdicion).not.toHaveBeenCalled();
  });

  it('delega la eliminación de una actividad autorizada desde el árbol', async () => {
    planificacion.set(PLANIFICACION_REQUISITOS);
    planificacionActual.set(PLANIFICACION_REQUISITOS);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );
    const obtenerBoton = (inicio: string) =>
      [...(harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
        .find((actual) => actual.getAttribute('aria-label')?.startsWith(inicio));

    obtenerBoton('Expandir Característica')?.click();
    harness.detectChanges();
    obtenerBoton('Expandir Lista de requisitos')?.click();
    harness.detectChanges();
    obtenerBoton('Acciones de Analizar cobertura')?.click();
    harness.detectChanges();
    obtenerBoton('Eliminar actividad de requisito')?.click();

    expect(eliminarRequisito).toHaveBeenCalledWith(
      ACTIVIDAD_REQUISITO,
      jasmine.any(Function),
    );
  });

  it('abre el historial del elemento consultado desde la pestaña del diálogo', async () => {
    editorAbierto.set(true);
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Consulta,
      tipo: TipoElementoPlanificacion.Tarea,
      proyectoId: 42,
      versionPlanificacionId: null,
      padreId: null,
      elementoId: 783,
    });
    editorDetalle.set(DETALLE_TAREA);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );
    const botonHistorial = Array.from(
      harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('[role=tab]') ?? [],
    ).find((boton) => boton.textContent?.includes('Historial'));

    botonHistorial?.click();

    expect(historial.abrir).toHaveBeenCalledWith(TipoElementoPlanificacion.Tarea, 783);
  });

  ([
    [TipoElementoPlanificacion.Historia, 736],
    [TipoElementoPlanificacion.Tarea, 783],
  ] as const).forEach(([tipo, elementoId]) => {
    it(`mantiene funcionales Detalle e Historial al editar ${tipo}`, async () => {
      editorAbierto.set(true);
      editorContexto.set({
        modo: ModoEditorElementoPlanificacion.Edicion,
        tipo,
        proyectoId: 42,
        versionPlanificacionId: null,
        padreId: null,
        elementoId,
      });
      editorDetalle.set({ ...DETALLE_TAREA, tipo, id: elementoId });
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl(
        `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
        PaginaPlanificacionProyecto,
      );
      const obtenerPestana = (texto: string) =>
        Array.from(
          harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('[role=tab]') ?? [],
        ).find((boton) => boton.textContent?.includes(texto));
      const botonDetalle = obtenerPestana('Detalle');
      const botonHistorial = obtenerPestana('Historial');

      expect(botonDetalle).toBeDefined();
      expect(botonHistorial).toBeDefined();
      expect(botonDetalle?.getAttribute('aria-selected')).toBe('true');

      botonHistorial?.click();
      harness.detectChanges();

      expect(historial.abrir).toHaveBeenCalledWith(tipo, elementoId);
      expect(botonHistorial?.getAttribute('aria-selected')).toBe('true');

      botonDetalle?.click();
      harness.detectChanges();

      expect(historial.cerrar).toHaveBeenCalled();
      expect(botonDetalle?.getAttribute('aria-selected')).toBe('true');
    });
  });
});

function abrirPanelVista(elemento: HTMLElement | null): void {
  const boton = [...(elemento?.querySelectorAll<HTMLButtonElement>('button') ?? [])].find(
    (candidato) => candidato.textContent?.trim().startsWith('Vista'),
  );
  boton?.click();
}

const RUTAS: Routes = [
  {
    path: `${SEGMENTOS_RUTA.proyectos}/:proyectoId/${SEGMENTOS_RUTA.planificacion}`,
    component: PaginaPlanificacionProyecto,
  },
];

const PLANIFICACION: PlanificacionProyecto = {
  proyectoId: 42,
  nombre: 'Sistema de envíos',
  versionId: 81,
  numeroVersion: 4,
  esHistorica: false,
  resumen: {
    epicas: 1,
    caracteristicas: 2,
    historias: 3,
    tareas: 5,
    totalElementos: 11,
  },
  publicacionAzure: { puedePublicar: true, bloqueos: [] },
  elementos: [
    {
      clave: 'epica:1',
      id: 1,
      tipo: TipoElementoPlanificacion.Epica,
      titulo: 'Épica de entregas',
      detalle: null,
      terminosBusqueda: [],
      activo: true,
      numeroVersion: 1,
      vinculadaAzure: false,
      capacidades: {
        puedeConsultar: true,
        puedeEditar: true,
        puedeEliminar: false,
        puedeCrearHijo: true,
        puedeSincronizar: false,
        soloLectura: false,
      },
      hijos: [],
    },
  ],
};

const CAPACIDADES_REQUISITOS = {
  puedeConsultar: true,
  puedeEditar: true,
  puedeEliminar: false,
  puedeCrearHijo: true,
  puedeSincronizar: false,
  soloLectura: false,
} as const;

const ACTIVIDAD_REQUISITO: ElementoPlanificacion = {
  clave: 'actividad-requisito:501',
  id: 501,
  tipo: TipoElementoPlanificacion.ActividadRequisito,
  titulo: 'Analizar cobertura',
  detalle: 'Análisis',
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 4,
  vinculadaAzure: false,
  capacidades: { ...CAPACIDADES_REQUISITOS, puedeEliminar: true },
  hijos: [],
};

const PLANIFICACION_REQUISITOS: PlanificacionProyecto = {
  ...PLANIFICACION,
  elementos: [
    {
      ...PLANIFICACION.elementos[0],
      hijos: [
        {
          clave: 'caracteristica:20',
          id: 20,
          tipo: TipoElementoPlanificacion.Caracteristica,
          titulo: 'Cobertura funcional',
          detalle: null,
          terminosBusqueda: [],
          activo: true,
          numeroVersion: 2,
          vinculadaAzure: false,
          capacidades: CAPACIDADES_REQUISITOS,
          hijos: [
            {
              clave: 'lista-requisitos:30',
              id: 30,
              tipo: TipoElementoPlanificacion.ListaRequisitos,
              titulo: 'Lista de requisitos',
              detalle: null,
              terminosBusqueda: [],
              activo: true,
              numeroVersion: 1,
              vinculadaAzure: false,
              capacidades: {
                ...CAPACIDADES_REQUISITOS,
                puedeConsultar: false,
                puedeEditar: false,
              },
              hijos: [ACTIVIDAD_REQUISITO],
            },
          ],
        },
      ],
    },
  ],
};

const VERSIONES = [
  {
    id: 81,
    numero: 4,
    fechaInicio: '2026-09-03T10:00:00',
    fechaCierre: null,
    origen: OrigenVersionPlanificacion.GeneracionHistorias,
    esActual: true,
  },
  {
    id: 80,
    numero: 3,
    fechaInicio: '2026-09-02T08:00:00',
    fechaCierre: '2026-09-03T10:00:00',
    origen: OrigenVersionPlanificacion.Inicial,
    esActual: false,
  },
] as const;

const DETALLE_TAREA: DetalleElementoPlanificacion = {
  tipo: TipoElementoPlanificacion.Tarea,
  id: 783,
  proyectoId: 42,
  activo: true,
  numeroVersion: 4,
  titulo: 'Implementar servicio',
  descripcion: 'Construir el servicio.',
  estimacionHoras: 8,
  fechaInicio: '2026-09-01',
  fechaFinal: '2026-09-05',
  fechaCreacion: '2026-08-20T10:00:00',
  fechaInactivacion: null,
  motivoInactivacion: null,
  urlAzure: null,
  capacidades: {
    puedeEditar: true,
    puedeVerHistorial: true,
    puedeSincronizar: false,
    soloLectura: false,
  },
  alcance: '',
  riesgos: '',
  criteriosExito: '',
  prioridadCatalogoId: null,
  riesgoCatalogoId: null,
  objetivo: '',
  criteriosAceptacion: '',
  dependencias: '',
  actividadCatalogoId: 19,
  complejidad: 3,
  prioridad: 4,
  discusion: '',
  responsable: '',
  requisito: '',
};

describe('PaginaPlanificacionProyecto (cobertura adicional)', () => {
  const planificacion = signal<PlanificacionProyecto | null>(PLANIFICACION);
  const planificacionActual = signal<PlanificacionProyecto | null>(PLANIFICACION);
  const versiones = signal(VERSIONES);
  const incluirEliminados = signal(false);
  const errorCarga = signal(false);
  const editorAbierto = signal(false);
  const editorContexto = signal<ContextoEditorElementoPlanificacion | null>(null);
  const editorDetalle = signal<DetalleElementoPlanificacion | null>(null);
  const editorSoloLectura = signal(false);
  const editorPuedeEditar = signal(false);
  const sincronizandoAzure = signal(false);

  const estado = {
    planificacion: planificacion.asReadonly(),
    planificacionActual: planificacionActual.asReadonly(),
    versiones: versiones.asReadonly(),
    seleccionando: signal(false).asReadonly(),
    incluirEliminados: incluirEliminados.asReadonly(),
    errorCarga: errorCarga.asReadonly(),
    cargar: jasmine.createSpy('cargar'),
    presentarVersion: jasmine.createSpy('presentarVersion'),
    actualizarInclusionEliminados: jasmine.createSpy('actualizarInclusionEliminados'),
  };
  const editor = {
    abierto: editorAbierto.asReadonly(),
    contexto: editorContexto.asReadonly(),
    detalle: editorDetalle.asReadonly(),
    catalogos: signal({ prioridades: [], riesgos: [], actividadesTarea: [], actividadesRequisito: [] }).asReadonly(),
    cargando: signal(false).asReadonly(),
    guardando: signal(false).asReadonly(),
    soloLectura: editorSoloLectura.asReadonly(),
    puedeEditar: editorPuedeEditar.asReadonly(),
    valoresFormulario: signal(null).asReadonly(),
    abrirCreacion: jasmine.createSpy('abrirCreacion'),
    abrirConsulta: jasmine.createSpy('abrirConsulta'),
    abrirEdicion: jasmine.createSpy('abrirEdicion'),
    iniciarEdicion: jasmine.createSpy('iniciarEdicion'),
    cerrar: jasmine.createSpy('cerrar'),
    guardar: jasmine.createSpy('guardar'),
  };
  const historial = {
    registros: signal([]).asReadonly(),
    siguienteCursor: signal(null).asReadonly(),
    hayMas: signal(false).asReadonly(),
    versionSeleccionadaId: signal(null).asReadonly(),
    versionSeleccionada: signal(null).asReadonly(),
    cargandoHistorial: signal(false).asReadonly(),
    cargandoVersion: signal(false).asReadonly(),
    errorHistorial: signal(false).asReadonly(),
    errorVersion: signal(false).asReadonly(),
    abrir: jasmine.createSpy('abrir'),
    seleccionar: jasmine.createSpy('seleccionar'),
    cargarMas: jasmine.createSpy('cargarMas'),
    reintentarHistorial: jasmine.createSpy('reintentarHistorial'),
    reintentarVersion: jasmine.createSpy('reintentarVersion'),
    cerrar: jasmine.createSpy('cerrar'),
  };
  const generarConIA = {
    panelAbierto: signal(false).asReadonly(),
    procesando: signal(false).asReadonly(),
    alternarPanel: jasmine.createSpy('alternarPanel'),
    generar: jasmine.createSpy('generar'),
    restablecer: jasmine.createSpy('restablecer'),
  };
  const publicacionAzure = {
    publicando: signal(false).asReadonly(),
    publicar: jasmine.createSpy('publicar'),
    restablecer: jasmine.createSpy('restablecer'),
  };
  const sincronizarEpica = jasmine.createSpy<
    (
      proyectoId: number,
      completado: (resultado: ResultadoSincronizacionEpicaAzurePlanificacion) => void,
    ) => void
  >('sincronizarEpica');
  const sincronizacionAzure = {
    sincronizando: sincronizandoAzure.asReadonly(),
    sincronizar: sincronizarEpica,
    restablecer: jasmine.createSpy('restablecer'),
  };
  const eliminarRequisito = jasmine.createSpy<
    (elemento: ElementoPlanificacion, actualizarArbol: () => void) => Promise<void>
  >('eliminarRequisito');
  const eliminacionRequisitos = {
    eliminando: signal(false).asReadonly(),
    eliminar: eliminarRequisito,
    restablecer: jasmine.createSpy('restablecer'),
  };
  const gantt = {
    abierto: signal(false).asReadonly(),
    cargando: signal(false).asReadonly(),
    error: signal(false).asReadonly(),
    datos: signal(null).asReadonly(),
    abrir: jasmine.createSpy('abrir'),
    cerrar: jasmine.createSpy('cerrar'),
    sincronizar: jasmine.createSpy('sincronizar'),
    reintentar: jasmine.createSpy('reintentar'),
    restablecer: jasmine.createSpy('restablecer'),
  };

  async function crearPagina(proyectoId: string | number = 42): Promise<any> {
    const harness = await RouterTestingHarness.create();
    const componente = await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/${proyectoId}/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );
    return componente as any;
  }

  beforeEach(() => {
    estado.cargar.calls.reset();
    estado.presentarVersion.calls.reset();
    estado.actualizarInclusionEliminados.calls.reset();
    editor.abrirCreacion.calls.reset();
    editor.abrirConsulta.calls.reset();
    editor.abrirEdicion.calls.reset();
    editor.iniciarEdicion.calls.reset();
    editor.cerrar.calls.reset();
    editor.guardar.calls.reset();
    historial.abrir.calls.reset();
    historial.cerrar.calls.reset();
    generarConIA.generar.calls.reset();
    publicacionAzure.publicar.calls.reset();
    sincronizarEpica.calls.reset();
    eliminarRequisito.calls.reset();
    gantt.abrir.calls.reset();
    gantt.cerrar.calls.reset();
    planificacion.set(PLANIFICACION);
    planificacionActual.set(PLANIFICACION);
    versiones.set(VERSIONES);
    incluirEliminados.set(false);
    errorCarga.set(false);
    editorAbierto.set(false);
    editorContexto.set(null);
    editorDetalle.set(null);
    editorSoloLectura.set(false);
    editorPuedeEditar.set(false);
    sincronizandoAzure.set(false);
    eliminarRequisito.and.returnValue(Promise.resolve(undefined));
    sincronizarEpica.and.stub();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(RUTAS),
        { provide: EstadoPlanificacionProyectoService, useValue: estado },
        { provide: EstadoEditorElementoPlanificacionService, useValue: editor },
        { provide: EstadoHistorialElementoPlanificacionService, useValue: historial },
        { provide: EstadoGeneracionIaPlanificacionService, useValue: generarConIA },
        { provide: EstadoPublicacionAzurePlanificacionService, useValue: publicacionAzure },
        { provide: EstadoSincronizacionEpicaAzurePlanificacionService, useValue: sincronizacionAzure },
        { provide: EstadoEliminacionRequisitosPlanificacionService, useValue: eliminacionRequisitos },
        { provide: EstadoGanttPlanificacionService, useValue: gantt },
        EstadoExploracionPlanificacionService,
      ],
    });
  });

  it('recarga la planificación conservando la inclusión de eliminados', async () => {
    const comp = await crearPagina();
    estado.cargar.calls.reset();
    incluirEliminados.set(true);
    comp.recargar();
    expect(estado.cargar).toHaveBeenCalledWith(42, true);
  });

  it('abre la creación de una épica en la raíz del proyecto', async () => {
    const comp = await crearPagina();
    comp.crearEpica();
    expect(editor.abrirCreacion).toHaveBeenCalledWith(42, TipoElementoPlanificacion.Epica, 42);
  });

  it('abre la creación de un elemento solicitado desde el árbol', async () => {
    const comp = await crearPagina();
    comp.crearElemento({ tipo: TipoElementoPlanificacion.Tarea, padreId: 736 });
    expect(editor.abrirCreacion).toHaveBeenCalledWith(42, TipoElementoPlanificacion.Tarea, 736);
  });

  it('abre la lista de requisitos al consultar ese nodo en la versión vigente', async () => {
    const comp = await crearPagina();
    comp.consultarElemento({
      ...ACTIVIDAD_REQUISITO,
      tipo: TipoElementoPlanificacion.ListaRequisitos,
      id: 30,
    });
    expect(comp.listaRequisitosAbierta()).toBe(true);
    expect(editor.abrirConsulta).not.toHaveBeenCalled();
  });

  it('consulta en solo lectura los elementos de una versión histórica', async () => {
    planificacion.set({ ...PLANIFICACION, esHistorica: true, versionId: 80 });
    const comp = await crearPagina();
    comp.consultarElemento(ACTIVIDAD_REQUISITO);
    expect(editor.abrirConsulta).toHaveBeenCalledWith(
      42,
      TipoElementoPlanificacion.ActividadRequisito,
      501,
      80,
    );
    expect(editor.abrirEdicion).not.toHaveBeenCalled();
  });

  it('consulta una épica vigente en lugar de abrirla en edición', async () => {
    const comp = await crearPagina();
    comp.consultarElemento(PLANIFICACION.elementos[0]);
    expect(editor.abrirConsulta).toHaveBeenCalledWith(
      42,
      TipoElementoPlanificacion.Epica,
      1,
      null,
    );
  });

  it('abre la lista de requisitos al editar ese nodo', async () => {
    const comp = await crearPagina();
    comp.editarElemento({
      ...ACTIVIDAD_REQUISITO,
      tipo: TipoElementoPlanificacion.ListaRequisitos,
    });
    expect(comp.listaRequisitosAbierta()).toBe(true);
    expect(editor.abrirEdicion).not.toHaveBeenCalled();
  });

  it('edita un elemento vigente autorizado desde el árbol', async () => {
    const comp = await crearPagina();
    comp.editarElemento(ACTIVIDAD_REQUISITO);
    expect(editor.abrirEdicion).toHaveBeenCalledWith(
      42,
      TipoElementoPlanificacion.ActividadRequisito,
      501,
    );
  });

  it('no edita elementos cuando la planificación es histórica', async () => {
    planificacion.set({ ...PLANIFICACION, esHistorica: true });
    const comp = await crearPagina();
    comp.editarElemento(ACTIVIDAD_REQUISITO);
    expect(editor.abrirEdicion).not.toHaveBeenCalled();
  });

  it('guarda un elemento y expande la rama del padre de requisitos', async () => {
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Creacion,
      tipo: TipoElementoPlanificacion.ActividadRequisito,
      proyectoId: 42,
      versionPlanificacionId: null,
      padreId: 30,
      elementoId: null,
    });
    editor.guardar.and.callFake((_valores: unknown, completado: () => void) => completado());
    const comp = await crearPagina();
    const exploracion = TestBed.inject(EstadoExploracionPlanificacionService);
    const expandir = spyOn(exploracion, 'expandirRama');
    estado.cargar.calls.reset();

    comp.guardarElemento({});

    expect(expandir).toHaveBeenCalledWith(`${TipoElementoPlanificacion.ListaRequisitos}:30`);
    expect(estado.cargar).toHaveBeenCalled();
    editor.guardar.and.stub();
  });

  it('solicita generar con IA solo con un proyecto válido', async () => {
    const comp = await crearPagina();
    comp.generarConIa(NivelGeneracionIaPlanificacion.Caracteristicas);
    expect(generarConIA.generar).toHaveBeenCalledWith(
      42,
      NivelGeneracionIaPlanificacion.Caracteristicas,
    );
  });

  it('no genera con IA cuando el identificador de la ruta es inválido', async () => {
    planificacion.set(null);
    const comp = await crearPagina('invalido');
    comp.generarConIa(NivelGeneracionIaPlanificacion.Caracteristicas);
    expect(generarConIA.generar).not.toHaveBeenCalled();
  });

  it('publica en Azure únicamente con un proyecto válido', async () => {
    const comp = await crearPagina();
    comp.publicarEnAzure();
    expect(publicacionAzure.publicar).toHaveBeenCalledWith(42);
  });

  it('sincroniza la épica principal y reabre la consulta cuando coincide el contexto', async () => {
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Consulta,
      tipo: TipoElementoPlanificacion.Epica,
      proyectoId: 42,
      versionPlanificacionId: null,
      padreId: null,
      elementoId: 1,
    });
    sincronizarEpica.and.callFake((_id, completado) =>
      completado({
        epicaId: 1,
        azureWorkItemId: 1204,
        revisionesImportadas: 2,
        revisionAzureActual: 9,
        fechaSincronizacion: '2026-09-04T15:00:00Z',
        urlEpica: 'https://dev.azure.com/x/_workitems/edit/1204',
      }),
    );
    const comp = await crearPagina();
    estado.cargar.calls.reset();
    editor.abrirConsulta.calls.reset();

    comp.sincronizarEpicaPrincipal();

    expect(estado.cargar).toHaveBeenCalledWith(42, false);
    expect(editor.abrirConsulta).toHaveBeenCalledWith(
      42,
      TipoElementoPlanificacion.Epica,
      1,
    );
    sincronizarEpica.and.stub();
  });

  it('delega la eliminación de un elemento del árbol', async () => {
    const comp = await crearPagina();
    comp.eliminarElemento(ACTIVIDAD_REQUISITO);
    expect(eliminarRequisito).toHaveBeenCalledWith(ACTIVIDAD_REQUISITO, jasmine.any(Function));
  });

  it('cierra y reabre la lista de requisitos y actualiza el árbol', async () => {
    const comp = await crearPagina();
    comp.listaRequisitosAbierta.set(true);
    comp.cerrarListaRequisitos();
    expect(comp.listaRequisitosAbierta()).toBe(false);
    estado.cargar.calls.reset();
    comp.actualizarArbolDesdeLista();
    expect(estado.cargar).toHaveBeenCalled();
  });

  it('abre y cierra el Gantt con la planificación presentada', async () => {
    const comp = await crearPagina();
    comp.abrirGantt();
    expect(gantt.abrir).toHaveBeenCalledWith(PLANIFICACION);
    comp.cerrarGantt();
    expect(gantt.cerrar).toHaveBeenCalledTimes(1);
  });

  it('actualiza la inclusión de eliminados desde los controles', async () => {
    const comp = await crearPagina();
    comp.cambiarInclusionEliminados(true);
    expect(estado.actualizarInclusionEliminados).toHaveBeenCalledWith(true);
  });

  it('vuelve a la pestaña de detalle y cierra el historial', async () => {
    const comp = await crearPagina();
    comp.cambiarPestanaElemento(PestanaElementoPlanificacion.Detalle);
    expect(comp.pestanaElemento()).toBe(PestanaElementoPlanificacion.Detalle);
    expect(historial.cerrar).toHaveBeenCalled();
  });

  it('ignora el cambio a historial cuando el elemento no lo permite', async () => {
    editorDetalle.set(null);
    const comp = await crearPagina();
    comp.cambiarPestanaElemento(PestanaElementoPlanificacion.Historial);
    expect(historial.abrir).not.toHaveBeenCalled();
  });

  it('inicia la edición del elemento consultado cuando no procede sincronizar', async () => {
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Consulta,
      tipo: TipoElementoPlanificacion.Tarea,
      proyectoId: 42,
      versionPlanificacionId: null,
      padreId: null,
      elementoId: 783,
    });
    const comp = await crearPagina();
    comp.iniciarEdicionElemento();
    expect(editor.iniciarEdicion).toHaveBeenCalledTimes(1);
    expect(sincronizarEpica).not.toHaveBeenCalled();
  });

  it('cierra el editor restableciendo la pestaña de detalle', async () => {
    const comp = await crearPagina();
    comp.cerrarEditor();
    expect(historial.cerrar).toHaveBeenCalled();
    expect(comp.pestanaElemento()).toBe(PestanaElementoPlanificacion.Detalle);
    expect(editor.cerrar).toHaveBeenCalled();
  });

  it('navega para alternar entre la versión histórica y la vigente', async () => {
    const comp = await crearPagina();
    const router = TestBed.inject(Router);
    const navegar = spyOn(router, 'navigate').and.resolveTo(true);

    comp.cambiarVersionPlanificacion(80);
    expect(navegar).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: { [PARAMETROS_RUTA.versionProyectoId]: 80 },
      }),
    );

    comp.cambiarVersionPlanificacion(81);
    expect(navegar).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: { [PARAMETROS_RUTA.versionProyectoId]: null },
      }),
    );
  });

  it('describe los metadatos y textos del editor según el detalle vigente', async () => {
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Consulta,
      tipo: TipoElementoPlanificacion.Tarea,
      proyectoId: 42,
      versionPlanificacionId: null,
      padreId: null,
      elementoId: 783,
    });
    editorDetalle.set(DETALLE_TAREA);
    const comp = await crearPagina();
    expect(comp.metadatosEditor()).toEqual(['Versión 4']);
    expect(comp.tituloEditor()).toBe('Implementar servicio');
    expect(comp.etiquetaEditor()).toBe('Tarea');
    expect(comp.textoCancelarEditor()).toBe('Cerrar');
    expect(comp.textoConfirmarEditor()).toBe('Editar');
    expect(comp.iconoConfirmarEditor()).toBe('editar');
    expect(comp.descripcionEditor()).toContain('versión vigente');
  });

  it('marca solo lectura y describe una versión histórica en el editor', async () => {
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Consulta,
      tipo: TipoElementoPlanificacion.Tarea,
      proyectoId: 42,
      versionPlanificacionId: 80,
      padreId: null,
      elementoId: 783,
    });
    editorDetalle.set(DETALLE_TAREA);
    const comp = await crearPagina();
    expect(comp.metadatosEditor()).toEqual(['Versión 4', 'Solo lectura']);
    expect(comp.descripcionEditor()).toContain('versión histórica');
  });

  it('describe un elemento eliminado y su motivo de inactivación', async () => {
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Consulta,
      tipo: TipoElementoPlanificacion.Tarea,
      proyectoId: 42,
      versionPlanificacionId: null,
      padreId: null,
      elementoId: 783,
    });
    editorDetalle.set({ ...DETALLE_TAREA, activo: false });
    const comp = await crearPagina();
    expect(comp.detalleEliminado()).not.toBeNull();
    expect(comp.descripcionEditor()).toContain('ya no permite cambios');
    expect(comp.etiquetaMotivoInactivacion()).toBe('Sin motivo registrado');
    expect(comp.metadatosEditor()).toEqual(['Versión 4', 'Solo lectura']);
  });

  it('describe la creación de un elemento en el editor', async () => {
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Creacion,
      tipo: TipoElementoPlanificacion.Tarea,
      proyectoId: 42,
      versionPlanificacionId: null,
      padreId: 736,
      elementoId: null,
    });
    editorDetalle.set(null);
    const comp = await crearPagina();
    expect(comp.tituloEditor()).toContain('Nueva');
    expect(comp.textoConfirmarEditor()).toContain('Crear');
    expect(comp.iconoConfirmarEditor()).toBe('guardar');
    expect(comp.descripcionEditor()).toContain('nuevo elemento');
    expect(comp.metadatosEditor()).toEqual([]);
  });

  it('devuelve textos vacíos cuando no hay contexto de editor', async () => {
    const comp = await crearPagina();
    expect(comp.tituloEditor()).toBe('');
    expect(comp.etiquetaEditor()).toBe('');
    expect(comp.descripcionEditor()).toBe('');
    expect(comp.textoConfirmarEditor()).toBe('');
    expect(comp.iconoEditor()).toBe('epica');
  });

  it('describe la edición de un elemento en el editor', async () => {
    editorContexto.set({
      modo: ModoEditorElementoPlanificacion.Edicion,
      tipo: TipoElementoPlanificacion.Tarea,
      proyectoId: 42,
      versionPlanificacionId: null,
      padreId: null,
      elementoId: 783,
    });
    editorDetalle.set(DETALLE_TAREA);
    const comp = await crearPagina();
    expect(comp.descripcionEditor()).toContain('nueva versión');
    expect(comp.textoConfirmarEditor()).toBe('Guardar nueva versión');
  });
});
