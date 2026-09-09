import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion,
  type PlanificacionProyecto,
} from '../models/planificacion-proyecto.model';
import { EstadoExploracionPlanificacionService } from './estado-exploracion-planificacion.service';

describe('EstadoExploracionPlanificacionService', () => {
  let servicio: EstadoExploracionPlanificacionService;

  beforeEach(() => {
    servicio = new EstadoExploracionPlanificacionService();
    servicio.sincronizarPlanificacion(PLANIFICACION);
  });

  it('abre inicialmente las épicas y conserva contraídos los niveles interiores', () => {
    expect([...servicio.expandidosPresentados()]).toEqual(['epica:1']);
    expect(servicio.hayRamasExpandidas()).toBe(true);
  });

  it('busca sin distinguir mayúsculas o acentos y conserva los ancestros de una coincidencia', () => {
    servicio.buscar('DIRECCION');

    const [epica] = servicio.elementosVisibles();
    const [caracteristica] = epica.hijos;
    const [historia] = caracteristica.hijos;

    expect(epica.titulo).toBe('Épica logística');
    expect(caracteristica.titulo).toBe('Registro de órdenes');
    expect(historia.titulo).toBe('Registrar envío');
    expect(historia.hijos.map((elemento) => elemento.titulo)).toEqual(['Validar dirección']);
    expect(servicio.cantidadResultados()).toBe(4);
    expect([...servicio.expandidosPresentados()]).toEqual([
      'epica:1',
      'caracteristica:2',
      'historia:6',
    ]);
  });

  it('incluye el subárbol completo cuando coincide un elemento padre', () => {
    servicio.buscar('registro');

    expect(servicio.cantidadResultados()).toBe(7);
    expect(servicio.elementosVisibles()[0].hijos[0].hijos).toHaveLength(2);
  });

  it('encuentra contenido alternativo no visible de una tarea de requisito', () => {
    servicio.buscar('contráctual');

    expect(servicio.elementosVisibles()[0].hijos[0].hijos[0].hijos[0].hijos[0].titulo).toBe(
      'Revisar restricciones',
    );
  });

  it('restaura la expansión manual después de limpiar la búsqueda', () => {
    servicio.alternarRama('epica:1');
    expect(servicio.expandidosPresentados().size).toBe(0);

    servicio.buscar('dirección');
    expect(servicio.expandidosPresentados().has('epica:1')).toBe(true);

    servicio.limpiarBusqueda();
    expect(servicio.expandidosPresentados().size).toBe(0);
  });

  it('expande y contrae todas las ramas disponibles', () => {
    servicio.actualizarExpansionCompleta(true);
    expect([...servicio.expandidosPresentados()]).toEqual([
      'epica:1',
      'caracteristica:2',
      'lista-requisitos:3',
      'actividad-requisito:4',
      'historia:6',
    ]);

    servicio.actualizarExpansionCompleta(false);
    expect(servicio.expandidosPresentados().size).toBe(0);
  });

  it('limpia la búsqueda al cambiar de versión o inclusión de eliminados', () => {
    servicio.buscar('dirección');
    servicio.sincronizarPlanificacion({ ...PLANIFICACION, versionId: 11 });
    expect(servicio.terminoBusqueda()).toBe('');

    servicio.buscar('registro');
    servicio.sincronizarPlanificacion({ ...PLANIFICACION, versionId: 11 }, true);
    expect(servicio.terminoBusqueda()).toBe('');
  });

  it('conserva la expansión durante una recarga transitoria de la misma fotografía', () => {
    servicio.alternarRama('caracteristica:2');
    servicio.alternarRama('lista-requisitos:3');

    servicio.sincronizarPlanificacion(null);
    servicio.sincronizarPlanificacion(PLANIFICACION);

    expect(servicio.expandidosPresentados().has('caracteristica:2')).toBe(true);
    expect(servicio.expandidosPresentados().has('lista-requisitos:3')).toBe(true);
  });

  it('expande de forma explícita la rama que recibe un nuevo requisito', () => {
    servicio.expandirRama('lista-requisitos:3');

    expect(servicio.expandidosPresentados().has('lista-requisitos:3')).toBe(true);
  });
});

const CAPACIDADES = {
  puedeConsultar: true,
  puedeEditar: true,
  puedeEliminar: false,
  puedeCrearHijo: true,
  puedeSincronizar: false,
  soloLectura: false,
} as const;

function crearElemento(
  clave: string,
  tipo: TipoElementoPlanificacion,
  titulo: string,
  hijos: readonly ElementoPlanificacion[] = [],
  terminosBusqueda: readonly string[] = [],
): ElementoPlanificacion {
  return {
    clave,
    id: Number(clave.split(':')[1]),
    tipo,
    titulo,
    detalle: null,
    terminosBusqueda,
    activo: true,
    numeroVersion: 1,
    vinculadaAzure: false,
    capacidades: CAPACIDADES,
    hijos,
  };
}

const TAREA = crearElemento(
  'tarea:7',
  TipoElementoPlanificacion.Tarea,
  'Validar dirección',
);
const HISTORIA = crearElemento(
  'historia:6',
  TipoElementoPlanificacion.Historia,
  'Registrar envío',
  [TAREA],
);
const TAREA_REQUISITO = crearElemento(
  'tarea-requisito:5',
  TipoElementoPlanificacion.TareaRequisito,
  'Revisar restricciones',
  [],
  ['Cobertura contractual'],
);
const ACTIVIDAD_REQUISITO = crearElemento(
  'actividad-requisito:4',
  TipoElementoPlanificacion.ActividadRequisito,
  'Analizar cobertura',
  [TAREA_REQUISITO],
);
const LISTA_REQUISITOS = crearElemento(
  'lista-requisitos:3',
  TipoElementoPlanificacion.ListaRequisitos,
  'Lista de requisitos',
  [ACTIVIDAD_REQUISITO],
);
const CARACTERISTICA = crearElemento(
  'caracteristica:2',
  TipoElementoPlanificacion.Caracteristica,
  'Registro de órdenes',
  [LISTA_REQUISITOS, HISTORIA],
);
const EPICA = crearElemento(
  'epica:1',
  TipoElementoPlanificacion.Epica,
  'Épica logística',
  [CARACTERISTICA],
);

const PLANIFICACION: PlanificacionProyecto = {
  proyectoId: 42,
  nombre: 'Sistema de envíos',
  versionId: 10,
  numeroVersion: 1,
  esHistorica: false,
  resumen: { epicas: 1, caracteristicas: 1, historias: 1, tareas: 1, totalElementos: 7 },
  publicacionAzure: { puedePublicar: true, bloqueos: [] },
  elementos: [EPICA],
};
