import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion,
  type PlanificacionProyecto,
} from '../../models/planificacion-proyecto.model';
import { ArbolPlanificacionProyecto } from './arbol-planificacion-proyecto';

describe('ArbolPlanificacionProyecto', () => {
  let fixture: ComponentFixture<ArbolPlanificacionProyecto>;
  let expandidos: Set<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ArbolPlanificacionProyecto] }).compileComponents();
    fixture = TestBed.createComponent(ArbolPlanificacionProyecto);
    expandidos = new Set(['epica:1']);
    fixture.componentRef.setInput('planificacion', PLANIFICACION);
    fixture.componentRef.setInput('elementos', PLANIFICACION.elementos);
    fixture.componentRef.setInput('expandidos', expandidos);
    fixture.componentInstance.expansionAlternada.subscribe((clave) => {
      if (expandidos.has(clave)) expandidos.delete(clave);
      else expandidos.add(clave);
      expandidos = new Set(expandidos);
      fixture.componentRef.setInput('expandidos', expandidos);
    });
    fixture.detectChanges();
  });

  it('presenta el proyecto y abre inicialmente sus épicas', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.getAttribute('role')).toBeNull();
    expect(elemento.querySelector('[role=tree]')).not.toBeNull();
    expect(elemento.textContent).toContain('Sistema de envíos');
    expect(elemento.textContent).toContain('Épica principal');
    expect(elemento.textContent).toContain('Registro de órdenes');
    expect(elemento.textContent).not.toContain('Crear orden');
  });

  it('muestra el tooltip Nueva épica en la acción de creación del proyecto', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.arbol-planificacion__crear-epica',
    );

    expect(boton?.getAttribute('data-tooltip')).toBe('Nueva épica');
    expect(boton?.getAttribute('aria-label')).toBe('Nueva épica');
    expect(boton?.classList.contains('ui-tooltip')).toBe(true);
    expect(boton?.querySelectorAll('.ui-create-icon app-icono')).toHaveLength(2);
  });
  it('permite expandir y contraer manualmente las ramas con hijos', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const expandirCaracteristica = obtenerBoton(elemento, 'Expandir Característica');

    expandirCaracteristica.click();
    fixture.detectChanges();
    expect(elemento.textContent).toContain('Lista de requisitos');
    expect(elemento.textContent).toContain('Registrar orden');

    obtenerBoton(elemento, 'Expandir Lista de requisitos').click();
    fixture.detectChanges();
    obtenerBoton(elemento, 'Expandir Actividad de requisito').click();
    fixture.detectChanges();
    obtenerBoton(elemento, 'Expandir Historia de usuario').click();
    fixture.detectChanges();
    expect(elemento.textContent).toContain('Validar dirección');
    expect(elemento.textContent).toContain('Crear orden');

    const contraerEpica = obtenerBoton(elemento, 'Contraer Épica');
    contraerEpica.click();
    fixture.detectChanges();
    expect(elemento.textContent).not.toContain('Registro de órdenes');
  });

  it('expone niveles y expansión mediante atributos del patrón ARIA tree', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const ramas = elemento.querySelectorAll<HTMLElement>('[role=treeitem]');

    expect(ramas[0]?.getAttribute('aria-level')).toBe('1');
    expect(ramas[0]?.getAttribute('aria-expanded')).toBe('true');
    expect(ramas[1]?.getAttribute('aria-level')).toBe('2');
    expect(ramas[1]?.getAttribute('aria-expanded')).toBe('false');
  });
  it('propaga la solicitud de sincronizacion de la epica principal', () => {
    const sincronizar = vi.fn();
    fixture.componentInstance.sincronizarEpica.subscribe(sincronizar);
    const elemento = fixture.nativeElement as HTMLElement;
    obtenerBoton(elemento, 'Acciones de Épica principal').click();
    fixture.detectChanges();
    expect(elemento.querySelector('.arbol-planificacion__rama--menu-abierto')).not.toBeNull();
    expect(elemento.querySelector('.arbol-planificacion--menu-abierto')).not.toBeNull();
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')]
      .find((actual) => actual.textContent?.includes('Sincronizar con Azure'));

    boton?.click();
    fixture.detectChanges();

    expect(elemento.querySelector('.arbol-planificacion__rama--menu-abierto')).toBeNull();
    expect(elemento.querySelector('.arbol-planificacion--menu-abierto')).toBeNull();
    expect(boton).toBeDefined();
    expect(sincronizar).toHaveBeenCalledOnce();
  });

  it('propaga la actividad de requisito seleccionada para eliminar', () => {
    const eliminar = vi.fn();
    fixture.componentInstance.eliminarElemento.subscribe(eliminar);
    const elemento = fixture.nativeElement as HTMLElement;
    obtenerBoton(elemento, 'Expandir Característica').click();
    fixture.detectChanges();
    obtenerBoton(elemento, 'Expandir Lista de requisitos').click();
    fixture.detectChanges();

    obtenerBoton(elemento, 'Acciones de Analizar cobertura').click();
    fixture.detectChanges();
    obtenerBoton(elemento, 'Eliminar actividad de requisito').click();

    expect(eliminar).toHaveBeenCalledWith(ACTIVIDAD_REQUISITO);
  });
});

function obtenerBoton(elemento: HTMLElement, inicioEtiqueta: string): HTMLButtonElement {
  const boton = [...elemento.querySelectorAll<HTMLButtonElement>('button')].find((actual) =>
    actual.getAttribute('aria-label')?.startsWith(inicioEtiqueta),
  );
  if (!boton) throw new Error(`No se encontró la acción ${inicioEtiqueta}.`);
  return boton;
}

const CAPACIDADES = {
  puedeConsultar: true,
  puedeEditar: true,
  puedeEliminar: false,
  puedeCrearHijo: true,
  puedeSincronizar: false,
  soloLectura: false,
} as const;

const TAREA: ElementoPlanificacion = {
  clave: 'tarea:3',
  id: 3,
  tipo: TipoElementoPlanificacion.Tarea,
  titulo: 'Crear orden',
  detalle: null,
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 1,
  vinculadaAzure: false,
  capacidades: { ...CAPACIDADES, puedeCrearHijo: false },
  hijos: [],
};

const TAREA_REQUISITO: ElementoPlanificacion = {
  clave: 'tarea-requisito:7',
  id: 7,
  tipo: TipoElementoPlanificacion.TareaRequisito,
  titulo: 'Validar dirección',
  detalle: null,
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 1,
  vinculadaAzure: false,
  capacidades: { ...CAPACIDADES, puedeEliminar: true, puedeCrearHijo: false },
  hijos: [],
};

const ACTIVIDAD_REQUISITO: ElementoPlanificacion = {
  clave: 'actividad-requisito:6',
  id: 6,
  tipo: TipoElementoPlanificacion.ActividadRequisito,
  titulo: 'Analizar cobertura',
  detalle: null,
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 1,
  vinculadaAzure: false,
  capacidades: { ...CAPACIDADES, puedeEliminar: true },
  hijos: [TAREA_REQUISITO],
};

const LISTA_REQUISITOS: ElementoPlanificacion = {
  clave: 'lista-requisitos:5',
  id: 5,
  tipo: TipoElementoPlanificacion.ListaRequisitos,
  titulo: 'Lista de requisitos',
  detalle: null,
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 1,
  vinculadaAzure: false,
  capacidades: { ...CAPACIDADES, puedeConsultar: false, puedeEditar: false },
  hijos: [ACTIVIDAD_REQUISITO],
};

const HISTORIA: ElementoPlanificacion = {
  clave: 'historia:4',
  id: 4,
  tipo: TipoElementoPlanificacion.Historia,
  titulo: 'Registrar orden',
  detalle: null,
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 1,
  vinculadaAzure: false,
  capacidades: CAPACIDADES,
  hijos: [TAREA],
};

const CARACTERISTICA: ElementoPlanificacion = {
  clave: 'caracteristica:2',
  id: 2,
  tipo: TipoElementoPlanificacion.Caracteristica,
  titulo: 'Registro de órdenes',
  detalle: null,
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 1,
  vinculadaAzure: false,
  capacidades: CAPACIDADES,
  hijos: [LISTA_REQUISITOS, HISTORIA],
};

const EPICA: ElementoPlanificacion = {
  clave: 'epica:1',
  id: 1,
  tipo: TipoElementoPlanificacion.Epica,
  titulo: 'Épica principal',
  detalle: null,
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 1,
  vinculadaAzure: true,
  capacidades: {
    ...CAPACIDADES,
    puedeEditar: false,
    puedeSincronizar: true,
    soloLectura: true,
  },
  hijos: [CARACTERISTICA],
};

const PLANIFICACION: PlanificacionProyecto = {
  proyectoId: 42,
  nombre: 'Sistema de envíos',
  versionId: 10,
  numeroVersion: 1,
  esHistorica: false,
  resumen: { epicas: 1, caracteristicas: 1, historias: 0, tareas: 1, totalElementos: 3 },
  publicacionAzure: { puedePublicar: true, bloqueos: [] },
  elementos: [EPICA],
};
