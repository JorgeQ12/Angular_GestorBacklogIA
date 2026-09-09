import type { DetalleElementoPlanificacion } from '../models/detalle-elemento-planificacion.model';
import {
  type ElementoGanttPlanificacion,
  type GanttPlanificacion,
  type ReferenciaElementoGanttPlanificacion,
  type TipoElementoGanttPlanificacion,
} from '../models/gantt-planificacion.model';
import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion,
  type PlanificacionProyecto,
} from '../models/planificacion-proyecto.model';

const TIPOS_GANTT = new Set<TipoElementoPlanificacion>([
  TipoElementoPlanificacion.Epica,
  TipoElementoPlanificacion.Caracteristica,
  TipoElementoPlanificacion.Historia,
  TipoElementoPlanificacion.Tarea,
]);

/** Aplana la jerarquía funcional que formaba parte del Gantt original. */
export function crearReferenciasGantt(
  planificacion: PlanificacionProyecto,
): readonly ReferenciaElementoGanttPlanificacion[] {
  const referencias: ReferenciaElementoGanttPlanificacion[] = [];
  let orden = 0;

  const agregar = (
    elemento: ElementoPlanificacion,
    padre: ElementoPlanificacion | null,
    nivel: number,
  ): void => {
    if (!esTipoGantt(elemento.tipo)) return;
    referencias.push({
      clave: elemento.clave,
      id: elemento.id,
      clavePadre: padre?.clave ?? null,
      tituloPadre: padre?.titulo ?? null,
      tipo: elemento.tipo,
      nivel,
      orden: orden++,
      titulo: elemento.titulo,
      activo: elemento.activo,
      tieneHijos: elemento.hijos.some((hijo) => esTipoGantt(hijo.tipo)),
    });
    for (const hijo of elemento.hijos) agregar(hijo, elemento, nivel + 1);
  };

  for (const epica of planificacion.elementos) agregar(epica, null, 0);
  return referencias;
}

/** Combina una referencia jerárquica con el detalle recuperado del backend. */
export function mapearElementoGantt(
  referencia: ReferenciaElementoGanttPlanificacion,
  detalle: DetalleElementoPlanificacion,
): ElementoGanttPlanificacion {
  if (detalle.id !== referencia.id || detalle.tipo !== referencia.tipo) {
    throw new Error(`El detalle recibido no corresponde a ${referencia.clave}.`);
  }
  exigirFechaCalendario(detalle.fechaInicio, 'fechaInicio', referencia.clave);
  exigirFechaCalendario(detalle.fechaFinal, 'fechaFinal', referencia.clave);

  return {
    ...referencia,
    titulo: detalle.titulo,
    fechaInicio: detalle.fechaInicio,
    fechaFinal: detalle.fechaFinal,
    estimacionHoras: detalle.estimacionHoras,
    dependencias:
      detalle.tipo === TipoElementoPlanificacion.Tarea
        ? detalle.dependencias.trim() || null
        : null,
    activo: detalle.activo,
  };
}

/** Consolida en los padres el periodo de sus hijos y su esfuerzo cuando no tienen uno propio. */
export function consolidarPeriodosGantt(
  elementos: readonly ElementoGanttPlanificacion[],
): readonly ElementoGanttPlanificacion[] {
  const hijosPorPadre = new Map<string, string[]>();
  const elementoPorClave = new Map(elementos.map((elemento) => [elemento.clave, elemento]));

  for (const elemento of elementos) {
    if (!elemento.clavePadre) continue;
    const hijos = hijosPorPadre.get(elemento.clavePadre) ?? [];
    hijos.push(elemento.clave);
    hijosPorPadre.set(elemento.clavePadre, hijos);
  }

  for (const elemento of [...elementos].reverse()) {
    const hijos = (hijosPorPadre.get(elemento.clave) ?? [])
      .map((clave) => elementoPorClave.get(clave))
      .filter((hijo): hijo is ElementoGanttPlanificacion => hijo !== undefined);
    if (hijos.length === 0) continue;

    const fechasInicio = [elemento, ...hijos].map((entrada) => entrada.fechaInicio).sort();
    const fechasFinal = [elemento, ...hijos].map((entrada) => entrada.fechaFinal).sort();
    const horasHijos = hijos.reduce((total, hijo) => total + hijo.estimacionHoras, 0);
    elementoPorClave.set(elemento.clave, {
      ...elemento,
      fechaInicio: fechasInicio[0]!,
      fechaFinal: fechasFinal.at(-1)!,
      estimacionHoras: elemento.estimacionHoras > 0 ? elemento.estimacionHoras : horasHijos,
    });
  }

  return elementos.map((elemento) => elementoPorClave.get(elemento.clave)!);
}

/** Construye el contrato final consumido por el componente presentacional. */
export function crearGanttPlanificacion(
  planificacion: PlanificacionProyecto,
  elementos: readonly ElementoGanttPlanificacion[],
): GanttPlanificacion {
  return {
    proyectoId: planificacion.proyectoId,
    nombreProyecto: planificacion.nombre,
    versionId: planificacion.versionId,
    numeroVersion: planificacion.numeroVersion,
    esHistorica: planificacion.esHistorica,
    elementos,
  };
}

function esTipoGantt(
  tipo: TipoElementoPlanificacion,
): tipo is TipoElementoGanttPlanificacion {
  return TIPOS_GANTT.has(tipo);
}

function exigirFechaCalendario(fecha: string, campo: string, clave: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error(`El campo ${campo} de ${clave} no contiene una fecha calendario válida.`);
  }
}
