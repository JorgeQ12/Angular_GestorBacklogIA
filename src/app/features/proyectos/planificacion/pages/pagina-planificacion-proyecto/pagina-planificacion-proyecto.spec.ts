import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';
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
    cargar: vi.fn(),
    presentarVersion: vi.fn(),
    actualizarInclusionEliminados: vi.fn(),
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
    abrirCreacion: vi.fn(),
    abrirConsulta: vi.fn(),
    abrirEdicion: vi.fn(),
    iniciarEdicion: vi.fn(),
    cerrar: vi.fn(),
    guardar: vi.fn(),
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
    abrir: vi.fn(),
    seleccionar: vi.fn(),
    cargarMas: vi.fn(),
    reintentarHistorial: vi.fn(),
    reintentarVersion: vi.fn(),
    cerrar: vi.fn(),
  };
  const panelGeneracionAbierto = signal(false);
  const generarConIA = {
    panelAbierto: panelGeneracionAbierto.asReadonly(),
    procesando: signal(false).asReadonly(),
    alternarPanel: vi.fn(() => panelGeneracionAbierto.update((abierto) => !abierto)),
    generar: vi.fn(),
    restablecer: vi.fn(() => panelGeneracionAbierto.set(false)),
  };
  const publicandoAzure = signal(false);
  const publicacionAzure = {
    publicando: publicandoAzure.asReadonly(),
    publicar: vi.fn(),
    restablecer: vi.fn(() => publicandoAzure.set(false)),
  };
  const sincronizandoAzure = signal(false);
  const sincronizarEpica = vi.fn<
    (
      proyectoId: number,
      completado: (resultado: ResultadoSincronizacionEpicaAzurePlanificacion) => void,
    ) => void
  >();
  const sincronizacionAzure = {
    sincronizando: sincronizandoAzure.asReadonly(),
    sincronizar: sincronizarEpica,
    restablecer: vi.fn(() => sincronizandoAzure.set(false)),
  };
  const eliminandoRequisito = signal(false);
  const eliminarRequisito = vi.fn<
    (elemento: ElementoPlanificacion, actualizarArbol: () => void) => Promise<void>
  >();
  const eliminacionRequisitos = {
    eliminando: eliminandoRequisito.asReadonly(),
    eliminar: eliminarRequisito,
    restablecer: vi.fn(() => eliminandoRequisito.set(false)),
  };
  const ganttAbierto = signal(false);
  const gantt = {
    abierto: ganttAbierto.asReadonly(),
    cargando: signal(false).asReadonly(),
    error: signal(false).asReadonly(),
    datos: signal(null).asReadonly(),
    abrir: vi.fn(() => ganttAbierto.set(true)),
    cerrar: vi.fn(() => ganttAbierto.set(false)),
    sincronizar: vi.fn(),
    reintentar: vi.fn(),
    restablecer: vi.fn(() => ganttAbierto.set(false)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
    eliminarRequisito.mockResolvedValue(undefined);
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
    const completado = sincronizarEpica.mock.calls[0]?.[1];
    completado?.({
      epicaId: 1,
      azureWorkItemId: 1204,
      revisionesImportadas: 2,
      revisionAzureActual: 9,
      fechaSincronizacion: '2026-09-04T15:00:00Z',
      urlEpica: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
    });

    expect(sincronizarEpica).toHaveBeenCalledWith(42, expect.any(Function));
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
    expect(sincronizarEpica).toHaveBeenCalledWith(42, expect.any(Function));
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
      expect.any(Function),
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

  it.each([
    [TipoElementoPlanificacion.Historia, 736],
    [TipoElementoPlanificacion.Tarea, 783],
  ] as const)(
    'mantiene funcionales Detalle e Historial al editar %s',
    async (tipo, elementoId) => {
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
    },
  );
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
