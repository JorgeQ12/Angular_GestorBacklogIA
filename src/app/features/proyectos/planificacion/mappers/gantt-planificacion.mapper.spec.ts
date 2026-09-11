import type { DetalleElementoPlanificacion } from '../models/detalle-elemento-planificacion.model';
import { MotivoInactivacionElementoPlanificacion } from '../models/detalle-elemento-planificacion.model';
import { TipoElementoPlanificacion, type ElementoPlanificacion, type PlanificacionProyecto } from '../models/planificacion-proyecto.model';
import {
  consolidarPeriodosGantt,
  crearGanttPlanificacion,
  crearReferenciasGantt,
  mapearElementoGantt,
} from './gantt-planificacion.mapper';

describe('gantt-planificacion.mapper', () => {
  it('aplana épicas, características, historias y tareas sin incorporar la rama de requisitos', () => {
    const referencias = crearReferenciasGantt(PLANIFICACION);

    expect(referencias.map((referencia) => referencia.clave)).toEqual([
      'epica:1',
      'caracteristica:2',
      'historia:3',
      'tarea:4',
    ]);
    expect(referencias[2]).toEqual(
      jasmine.objectContaining({
        clavePadre: 'caracteristica:2',
        tituloPadre: 'Característica',
        nivel: 2,
        orden: 2,
        tieneHijos: true,
      }),
    );
  });

  it('combina el detalle y conserva dependencias únicamente para las tareas', () => {
    const referencia = crearReferenciasGantt(PLANIFICACION)[3]!;
    const elemento = mapearElementoGantt(referencia, crearDetalle(4, TipoElementoPlanificacion.Tarea));

    expect(elemento).toEqual(
      jasmine.objectContaining({
        clave: 'tarea:4',
        fechaInicio: '2026-09-08',
        fechaFinal: '2026-09-10',
        estimacionHoras: 8,
        dependencias: 'Tarea previa',
      }),
    );
  });

  it('consolida el periodo y el esfuerzo de los hijos cuando el padre no tiene estimación', () => {
    const referencias = crearReferenciasGantt(PLANIFICACION);
    const padre = mapearElementoGantt(
      referencias[2]!,
      { ...crearDetalle(3, TipoElementoPlanificacion.Historia), estimacionHoras: 0, fechaInicio: '2026-09-09' },
    );
    const hijo = mapearElementoGantt(referencias[3]!, crearDetalle(4, TipoElementoPlanificacion.Tarea));

    const consolidados = consolidarPeriodosGantt([padre, hijo]);

    expect(consolidados[0]).toEqual(
      jasmine.objectContaining({
        fechaInicio: '2026-09-08',
        fechaFinal: '2026-09-10',
        estimacionHoras: 8,
      }),
    );
  });

  it('construye la fotografía final con la identidad de la versión presentada', () => {
    expect(crearGanttPlanificacion(PLANIFICACION, [])).toEqual(
      jasmine.objectContaining({
        proyectoId: 42,
        nombreProyecto: 'Proyecto',
        versionId: 9,
        numeroVersion: 4,
        esHistorica: false,
        elementos: [],
      }),
    );
  });
});

const CAPACIDADES = {
  puedeConsultar: true,
  puedeEditar: true,
  puedeEliminar: false,
  puedeCrearHijo: true,
  puedeSincronizar: false,
  soloLectura: false,
};

function elemento(
  id: number,
  tipo: TipoElementoPlanificacion,
  titulo: string,
  hijos: readonly ElementoPlanificacion[] = [],
): ElementoPlanificacion {
  return {
    clave: `${tipo}:${id}`,
    id,
    tipo,
    titulo,
    detalle: null,
    terminosBusqueda: [],
    activo: true,
    numeroVersion: 1,
    vinculadaAzure: false,
    capacidades: CAPACIDADES,
    hijos,
  };
}

const PLANIFICACION: PlanificacionProyecto = {
  proyectoId: 42,
  nombre: 'Proyecto',
  versionId: 9,
  numeroVersion: 4,
  esHistorica: false,
  resumen: { epicas: 1, caracteristicas: 1, historias: 1, tareas: 1, totalElementos: 4 },
  publicacionAzure: { puedePublicar: true, bloqueos: [] },
  elementos: [
    elemento(1, TipoElementoPlanificacion.Epica, 'Épica', [
      elemento(2, TipoElementoPlanificacion.Caracteristica, 'Característica', [
        elemento(20, TipoElementoPlanificacion.ListaRequisitos, 'Lista', [
          elemento(21, TipoElementoPlanificacion.ActividadRequisito, 'Actividad'),
        ]),
        elemento(3, TipoElementoPlanificacion.Historia, 'Historia', [
          elemento(4, TipoElementoPlanificacion.Tarea, 'Tarea'),
        ]),
      ]),
    ]),
  ],
};

function crearDetalle(id: number, tipo: DetalleElementoPlanificacion['tipo']): DetalleElementoPlanificacion {
  return {
    tipo,
    id,
    proyectoId: 42,
    activo: true,
    numeroVersion: 1,
    titulo: `Elemento ${id}`,
    descripcion: '',
    estimacionHoras: 8,
    fechaInicio: '2026-09-08',
    fechaFinal: '2026-09-10',
    fechaCreacion: '2026-09-01T00:00:00Z',
    fechaInactivacion: null,
    motivoInactivacion: null as MotivoInactivacionElementoPlanificacion | null,
    urlAzure: null,
    capacidades: { puedeEditar: true, puedeVerHistorial: true, puedeSincronizar: false, soloLectura: false },
    alcance: '',
    riesgos: '',
    criteriosExito: '',
    prioridadCatalogoId: null,
    riesgoCatalogoId: null,
    objetivo: '',
    criteriosAceptacion: '',
    dependencias: 'Tarea previa',
    actividadCatalogoId: null,
    complejidad: 0,
    prioridad: 0,
    discusion: '',
    responsable: '',
    requisito: '',
  };
}
