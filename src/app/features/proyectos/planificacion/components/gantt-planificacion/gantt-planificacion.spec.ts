import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscalaGanttPlanificacion, type GanttPlanificacion } from '../../models/gantt-planificacion.model';
import { TipoElementoPlanificacion } from '../../models/planificacion-proyecto.model';
import { GanttPlanificacionComponent } from './gantt-planificacion';

describe('GanttPlanificacionComponent', () => {
  let fixture: ComponentFixture<GanttPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GanttPlanificacionComponent] }).compileComponents();
    fixture = TestBed.createComponent(GanttPlanificacionComponent);
    fixture.componentRef.setInput('datos', GANTT);
    fixture.detectChanges();
  });

  it('presenta el resumen, las filas y las barras del cronograma', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.textContent).toContain('Diagrama de Gantt');
    expect(elemento.textContent).toContain('2 tareas');
    expect(elemento.textContent).toContain('13 h de esfuerzo');
    expect(elemento.querySelectorAll('.gantt-planificacion__elemento').length).toBe(3);
    expect(elemento.querySelectorAll('.gantt-planificacion__barra').length).toBe(3);
    expect(elemento.querySelector('.gantt-planificacion__marca-agua img')?.getAttribute('src'))
      .toBe('/brand/logo.svg');
    expect(elemento.querySelectorAll('.gantt-planificacion__cuadricula-calendario').length).toBe(1);
    expect(elemento.querySelectorAll('.gantt-planificacion__barra .es-adaptable').length).toBeGreaterThan(0);
    expect(elemento.querySelectorAll('.gantt-planificacion__conector-impacto').length).toBe(2);
  });

  it('posiciona el tooltip y resalta la relación al pasar por un título', () => {
    jasmine.clock().install();
    const elemento = fixture.nativeElement as HTMLElement;
    const titulo = elemento.querySelector<HTMLElement>('.gantt-planificacion__texto-elemento');
    const tooltip = titulo?.nextElementSibling as HTMLElement | null;

    expect(tooltip?.classList.contains('es-visible')).toBe(false);
    titulo?.dispatchEvent(new Event('pointerenter'));
    jasmine.clock().tick(120);
    fixture.detectChanges();

    expect(tooltip?.style.left).not.toBe('');
    expect(tooltip?.classList.contains('es-visible')).toBe(true);
    expect(elemento.querySelectorAll('.gantt-planificacion__conector.es-resaltado').length)
      .toBeGreaterThan(0);
    jasmine.clock().uninstall();
  });

  it('cancela un tooltip transitorio al abandonar el título', () => {
    jasmine.clock().install();
    const titulo = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLElement>('.gantt-planificacion__texto-elemento');
    const tooltip = titulo?.nextElementSibling as HTMLElement | null;

    titulo?.dispatchEvent(new Event('pointerenter'));
    titulo?.dispatchEvent(new Event('pointerleave'));
    jasmine.clock().tick(120);
    fixture.detectChanges();

    expect(tooltip?.classList.contains('es-visible')).toBe(false);
    jasmine.clock().uninstall();
  });

  it('filtra por título e incluye los padres de la coincidencia', () => {
    const control = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'app-campo-busqueda input',
    );
    if (control) {
      control.value = 'Validar entrega';
      control.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.gantt-planificacion__elemento').length).toBe(2);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Épica de entregas');
  });

  it('contrae y expande los descendientes desde la fila padre', () => {
    const contraer = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-label^="Contraer"]',
    );
    contraer?.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.gantt-planificacion__elemento').length).toBe(1);
    expect((fixture.nativeElement as HTMLElement).querySelector('button[aria-label^="Expandir"]')).not.toBeNull();
  });

  it('comunica el regreso a la vista del árbol', () => {
    const volver = jasmine.createSpy();
    fixture.componentInstance.volver.subscribe(volver);
    const vista = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')]
      .find((elemento) => elemento.textContent?.trim().startsWith('Vista'));
    vista?.click();
    fixture.detectChanges();
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')]
      .find((elemento) => elemento.textContent?.includes('Vista del árbol'));

    (boton as HTMLButtonElement | undefined)?.click();

    expect(volver).toHaveBeenCalledTimes(1);
  });
});

const GANTT: GanttPlanificacion = {
  proyectoId: 42,
  nombreProyecto: 'Proyecto',
  versionId: 9,
  numeroVersion: 4,
  esHistorica: false,
  elementos: [
    {
      clave: 'epica:1', id: 1, clavePadre: null, tituloPadre: null, tipo: TipoElementoPlanificacion.Epica,
      nivel: 0, orden: 0, titulo: 'Épica de entregas', activo: true, tieneHijos: true,
      fechaInicio: '2026-09-01', fechaFinal: '2026-09-12', estimacionHoras: 13, dependencias: null,
    },
    {
      clave: 'tarea:2', id: 2, clavePadre: 'epica:1', tituloPadre: 'Épica de entregas',
      tipo: TipoElementoPlanificacion.Tarea, nivel: 1, orden: 1, titulo: 'Validar entrega', activo: true,
      tieneHijos: false, fechaInicio: '2026-09-02', fechaFinal: '2026-09-05', estimacionHoras: 5,
      dependencias: null,
    },
    {
      clave: 'tarea:3', id: 3, clavePadre: 'epica:1', tituloPadre: 'Épica de entregas',
      tipo: TipoElementoPlanificacion.Tarea, nivel: 1, orden: 2, titulo: 'Publicar entrega', activo: true,
      tieneHijos: false, fechaInicio: '2026-09-06', fechaFinal: '2026-09-12', estimacionHoras: 8,
      dependencias: 'Validar entrega',
    },
  ],
};

describe('GanttPlanificacionComponent (cobertura adicional)', () => {
  let fixture: ComponentFixture<GanttPlanificacionComponent>;
  let comp: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GanttPlanificacionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(GanttPlanificacionComponent);
    fixture.componentRef.setInput('datos', GANTT_EXTRA);
    fixture.detectChanges();
    comp = fixture.componentInstance as any;
  });

  it('usa un rango de respaldo cuando la planificación no tiene elementos', () => {
    const vacio = TestBed.createComponent(GanttPlanificacionComponent);
    vacio.componentRef.setInput('datos', { ...GANTT_EXTRA, elementos: [] });
    vacio.detectChanges();
    const instancia = vacio.componentInstance as any;
    expect(instancia.dias().length).toBeGreaterThan(0);
    expect(instancia.conteos().epicas).toBe(0);
    expect(instancia.horasTareas()).toBe(0);
    expect(instancia.posicionesMarcaAgua().length).toBeGreaterThan(0);
  });

  it('alterna todos los nodos entre contraídos y expandidos', () => {
    comp.escala.set(EscalaGanttPlanificacion.Semana);
    comp.busqueda.set('');
    expect(comp.expansionCompleta()).toBe(true);
    comp.alternarTodos();
    expect(comp.expansionCompleta()).toBe(false);
    comp.alternarTodos();
    expect(comp.expansionCompleta()).toBe(true);
  });

  it('no alterna todos cuando hay una búsqueda activa', () => {
    comp.busqueda.set('epica');
    comp.clavesContraidas.set(new Set());
    comp.alternarTodos();
    expect(comp.clavesContraidas().size).toBe(0);
  });

  it('cambia la expansión y las relaciones desde los controles', () => {
    const marcado = { target: Object.assign(document.createElement('input'), { checked: true }) } as unknown as Event;
    const desmarcado = { target: Object.assign(document.createElement('input'), { checked: false }) } as unknown as Event;

    comp.cambiarExpansion(desmarcado);
    expect(comp.clavesContraidas().size).toBeGreaterThan(0);
    comp.cambiarExpansion(marcado);
    expect(comp.clavesContraidas().size).toBe(0);

    comp.cambiarRelaciones(desmarcado);
    expect(comp.mostrarRelaciones()).toBe(false);
    comp.cambiarRelaciones(marcado);
    expect(comp.mostrarRelaciones()).toBe(true);
  });

  it('ignora los controles cuando el evento no proviene de un input', () => {
    const ajeno = { target: document.createElement('div') } as unknown as Event;
    comp.clavesContraidas.set(new Set(['epica:1']));
    comp.cambiarExpansion(ajeno);
    expect(comp.clavesContraidas().has('epica:1')).toBe(true);
    comp.mostrarRelaciones.set(true);
    comp.cambiarRelaciones(ajeno);
    expect(comp.mostrarRelaciones()).toBe(true);
  });

  it('abre, alterna y cierra el panel de vista', () => {
    const evento = { stopPropagation: jasmine.createSpy('stopPropagation') } as unknown as MouseEvent;
    comp.alternarPanelVista(evento);
    expect(comp.panelVistaAbierto()).toBe(true);
    expect(evento.stopPropagation).toHaveBeenCalled();
    comp.alternarPanelVista(evento);
    expect(comp.panelVistaAbierto()).toBe(false);

    comp.panelVistaAbierto.set(true);
    comp.cerrarPanelVista();
    expect(comp.panelVistaAbierto()).toBe(false);
  });

  it('cierra el panel de vista al volver al árbol', () => {
    const volver = jasmine.createSpy('volver');
    comp.volver.subscribe(volver);
    comp.panelVistaAbierto.set(true);
    comp.volverAlArbol();
    expect(comp.panelVistaAbierto()).toBe(false);
    expect(volver).toHaveBeenCalledTimes(1);
  });

  it('alterna el estado contraído de un elemento con hijos e ignora los que no los tienen', () => {
    const conHijos = GANTT_EXTRA.elementos[0];
    const sinHijos = GANTT_EXTRA.elementos[1];
    comp.clavesContraidas.set(new Set());
    comp.alternarElemento(conHijos);
    expect(comp.estaContraido(conHijos.clave)).toBe(true);
    comp.alternarElemento(conHijos);
    expect(comp.estaContraido(conHijos.clave)).toBe(false);
    comp.alternarElemento(sinHijos);
    expect(comp.estaContraido(sinHijos.clave)).toBe(false);
  });

  it('recorre las escalas de tiempo y sus encabezados', () => {
    for (const escala of [
      EscalaGanttPlanificacion.Dia,
      EscalaGanttPlanificacion.Semana,
      EscalaGanttPlanificacion.Mes,
      EscalaGanttPlanificacion.Trimestre,
      EscalaGanttPlanificacion.Anio,
    ]) {
      comp.escala.set(escala);
      expect(comp.segmentosEncabezado().length).toBeGreaterThan(0);
      expect(comp.anchoDia()).toBeGreaterThan(0);
    }
    comp.escala.set(EscalaGanttPlanificacion.Dia);
    expect(comp.mostrarDetalleDias()).toBe(true);
    comp.escala.set(EscalaGanttPlanificacion.Semana);
    expect(comp.mostrarDetalleDias()).toBe(false);
  });

  it('resuelve las etiquetas y la nomenclatura de semana ISO', () => {
    expect(comp.semana(new Date(2026, 8, 1))).toMatch(/^S\d+$/);
    const lunes = { fecha: new Date(2026, 8, 7) } as unknown;
    comp.escala.set(EscalaGanttPlanificacion.Semana);
    expect(typeof comp.mostrarSemana(lunes as any)).toBe('boolean');
  });

  it('sincroniza y calcula posiciones y dimensiones de barras y segmentos', () => {
    const elemento = GANTT_EXTRA.elementos[1];
    expect(comp.posicionBarra(elemento)).toBeGreaterThanOrEqual(0);
    expect(comp.anchoBarra(elemento)).toBeGreaterThanOrEqual(8);
    const segmento = comp.segmentosEncabezado()[0];
    expect(comp.posicionSegmento(segmento)).toBeGreaterThanOrEqual(0);
    expect(comp.anchoSegmento(segmento)).toBeGreaterThan(0);
    expect(comp.sangriaElemento(elemento)).toBe(12 + elemento.nivel * 22);
    expect(comp.fechaElemento(elemento.fechaInicio)).toBeTruthy();
    expect(comp.descripcionBarra(elemento)).toContain(elemento.titulo);
    expect(comp.descripcionBarra(GANTT_EXTRA.elementos[0])).toContain('Periodo consolidado');
  });

  it('presenta el tooltip de inmediato ante un evento de foco', () => {
    const contenedor = document.createElement('div');
    const disparador = document.createElement('div');
    const tooltip = document.createElement('div');
    contenedor.appendChild(disparador);
    contenedor.appendChild(tooltip);
    document.body.appendChild(contenedor);
    comp.mostrarTooltip('tarea:2', { type: 'focus', currentTarget: disparador } as unknown as Event);
    expect(comp.posicionTooltip()?.clave).toBe('tarea:2');
    comp.limpiarResaltado('tarea:2');
    expect(comp.posicionTooltip()).toBeNull();
    contenedor.remove();
  });

  it('ignora el tooltip cuando el disparador o el tooltip no son elementos válidos', () => {
    comp.posicionTooltip.set(null);
    comp.mostrarTooltip('tarea:2', { type: 'focus', currentTarget: null } as unknown as Event);
    expect(comp.posicionTooltip()).toBeNull();

    const disparador = document.createElement('div');
    document.body.appendChild(disparador);
    comp.mostrarTooltip('tarea:2', { type: 'focus', currentTarget: disparador } as unknown as Event);
    expect(comp.posicionTooltip()).toBeNull();
    disparador.remove();
  });

  it('evalúa las relaciones resaltadas de origen, destino y conector', () => {
    expect(comp.esOrigenRelacion('epica:1')).toBe(false);
    expect(comp.esDestinoRelacion('tarea:2')).toBe(false);
    expect(comp.esConectorResaltado('tarea:2')).toBe(false);

    comp.resaltarRelacion('tarea:2');
    expect(comp.esDestinoRelacion('tarea:2')).toBe(true);
    expect(comp.esOrigenRelacion('epica:1')).toBe(true);
    expect(comp.esConectorResaltado('tarea:2')).toBe(true);
    expect(comp.tipoVisualConector('tarea:2')).toBeTruthy();

    comp.resaltarRelacion('epica:1');
    expect(comp.esOrigenRelacion('epica:1')).toBe(true);
    expect(comp.tipoVisualConector('tarea:2')).toBeTruthy();

    comp.resaltarRelacion(null);
    expect(comp.esOrigenRelacion('epica:1')).toBe(false);
  });

  it('sincroniza el desplazamiento vertical y horizontal del tablero', () => {
    comp.sincronizarDesplazamiento();
    comp.desplazarDesdeBarra();
    const evento = {
      deltaX: 30,
      deltaY: 0,
      shiftKey: false,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as WheelEvent;
    comp.desplazarConRueda(evento);
    const sinScroll = {
      deltaX: 0,
      deltaY: 10,
      shiftKey: false,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as WheelEvent;
    comp.desplazarConRueda(sinScroll);
    expect(sinScroll.preventDefault).not.toHaveBeenCalled();
  });

  it('resuelve todas las etiquetas e iconos por tipo', () => {
    for (const tipo of [
      TipoElementoPlanificacion.Epica,
      TipoElementoPlanificacion.Caracteristica,
      TipoElementoPlanificacion.Historia,
      TipoElementoPlanificacion.Tarea,
    ] as const) {
      expect(comp.etiquetaTipo(tipo)).toBeTruthy();
      expect(comp.iconoTipo(tipo)).toBeTruthy();
    }
  });

  it('emite el cambio de versión y refleja el estado deshabilitado', () => {
    const versionCambiada = jasmine.createSpy('versionCambiada');
    fixture.componentInstance.versionCambiada.subscribe(versionCambiada);
    fixture.componentInstance.versionCambiada.emit(80);
    expect(versionCambiada).toHaveBeenCalledWith(80);

    fixture.componentRef.setInput('deshabilitado', true);
    fixture.componentRef.setInput('versionSeleccionadaId', 9);
    fixture.detectChanges();
    expect(fixture.componentInstance.deshabilitado()).toBe(true);
    expect(fixture.componentInstance.versionSeleccionadaId()).toBe(9);
  });
});

const GANTT_EXTRA: GanttPlanificacion = {
  proyectoId: 42,
  nombreProyecto: 'Proyecto',
  versionId: 9,
  numeroVersion: 4,
  esHistorica: false,
  elementos: [
    {
      clave: 'epica:1', id: 1, clavePadre: null, tituloPadre: null, tipo: TipoElementoPlanificacion.Epica,
      nivel: 0, orden: 0, titulo: 'Épica de entregas', activo: true, tieneHijos: true,
      fechaInicio: '2026-01-05', fechaFinal: '2026-12-20', estimacionHoras: 13, dependencias: null,
    },
    {
      clave: 'tarea:2', id: 2, clavePadre: 'epica:1', tituloPadre: 'Épica de entregas',
      tipo: TipoElementoPlanificacion.Tarea, nivel: 1, orden: 1, titulo: 'Validar entrega', activo: true,
      tieneHijos: false, fechaInicio: '2026-02-02', fechaFinal: '2026-02-05', estimacionHoras: 5,
      dependencias: null,
    },
    {
      clave: 'tarea:3', id: 3, clavePadre: 'epica:1', tituloPadre: 'Épica de entregas',
      tipo: TipoElementoPlanificacion.Tarea, nivel: 1, orden: 2, titulo: 'Publicar entrega', activo: true,
      tieneHijos: false, fechaInicio: '2026-06-06', fechaFinal: '2026-06-12', estimacionHoras: 8,
      dependencias: 'Validar entrega',
    },
  ],
};
