import { Injectable, computed, signal } from '@angular/core';
import type {
  ElementoPlanificacion,
  PlanificacionProyecto,
} from '../models/planificacion-proyecto.model';

/** Coordina la búsqueda y la expansión local del árbol de planificación. */
@Injectable()
export class EstadoExploracionPlanificacionService {
  private readonly planificacionEstado = signal<PlanificacionProyecto | null>(null);
  private readonly terminoBusquedaEstado = signal('');
  private readonly expandidosEstado = signal<ReadonlySet<string>>(new Set());
  private fotografiaInicializada: string | null = null;

  /** Expone el término escrito sin alterar su representación en el campo. */
  public readonly terminoBusqueda = this.terminoBusquedaEstado.asReadonly();
  /** Indica si existe un criterio efectivo de búsqueda. */
  public readonly hayBusqueda = computed(
    () => normalizarTexto(this.terminoBusquedaEstado()).length > 0,
  );
  /** Expone el término limpio utilizado en el resumen de resultados. */
  public readonly terminoPresentado = computed(() => this.terminoBusquedaEstado().trim());
  /** Conserva únicamente coincidencias y los ancestros necesarios para ubicarlas. */
  public readonly elementosVisibles = computed(() => {
    const elementos = this.planificacionEstado()?.elementos ?? [];
    const termino = normalizarTexto(this.terminoBusquedaEstado());
    return termino ? filtrarElementos(elementos, termino) : elementos;
  });
  /** Cuenta todos los elementos que permanecen visibles en el resultado. */
  public readonly cantidadResultados = computed(() => contarElementos(this.elementosVisibles()));
  /** Indica si la planificación contiene ramas que puedan expandirse. */
  public readonly hayElementosExpandibles = computed(
    () => obtenerClavesExpandibles(this.planificacionEstado()?.elementos ?? []).length > 0,
  );
  /** Refleja el estado empleado por la acción global de expansión. */
  public readonly hayRamasExpandidas = computed(() => this.expandidosEstado().size > 0);
  /** Combina la expansión manual con la expansión automática de una búsqueda. */
  public readonly expandidosPresentados = computed<ReadonlySet<string>>(() =>
    this.hayBusqueda()
      ? new Set(obtenerClavesExpandibles(this.elementosVisibles()))
      : this.expandidosEstado(),
  );

  /** Sincroniza la fotografía presentada y conserva expansiones que todavía sean válidas. */
  public sincronizarPlanificacion(
    planificacion: PlanificacionProyecto | null,
    incluirEliminados = false,
  ): void {
    this.planificacionEstado.set(planificacion);
    if (!planificacion) {
      return;
    }

    const clavesVigentes = new Set(obtenerClavesExpandibles(planificacion.elementos));
    const fotografia = `${planificacion.proyectoId}:${planificacion.versionId}:${incluirEliminados}`;
    if (this.fotografiaInicializada !== fotografia) {
      this.fotografiaInicializada = fotografia;
      this.terminoBusquedaEstado.set('');
      this.expandidosEstado.set(
        new Set(
          planificacion.elementos
            .filter((elemento) => elemento.hijos.length > 0)
            .map((elemento) => elemento.clave),
        ),
      );
      return;
    }

    this.expandidosEstado.update(
      (actuales) => new Set([...actuales].filter((clave) => clavesVigentes.has(clave))),
    );
  }

  /** Actualiza el criterio aplicado a todos los niveles del árbol. */
  public buscar(termino: string): void {
    this.terminoBusquedaEstado.set(termino);
  }

  /** Retira el criterio y recupera la expansión manual previa. */
  public limpiarBusqueda(): void {
    this.terminoBusquedaEstado.set('');
  }

  /** Alterna una rama sin modificar el estado preservado de las demás. */
  public alternarRama(clave: string): void {
    if (this.hayBusqueda()) return;
    const siguientes = new Set(this.expandidosEstado());
    if (siguientes.has(clave)) siguientes.delete(clave);
    else siguientes.add(clave);
    this.expandidosEstado.set(siguientes);
  }

  /** Mantiene visible una rama que acaba de recibir un nuevo elemento. */
  public expandirRama(clave: string): void {
    const siguientes = new Set(this.expandidosEstado());
    siguientes.add(clave);
    this.expandidosEstado.set(siguientes);
  }

  /** Expande o contrae de una vez todas las ramas de la fotografía vigente. */
  public actualizarExpansionCompleta(expandir: boolean): void {
    if (this.hayBusqueda()) return;
    this.expandidosEstado.set(
      expandir
        ? new Set(obtenerClavesExpandibles(this.planificacionEstado()?.elementos ?? []))
        : new Set(),
    );
  }
}

function filtrarElementos(
  elementos: readonly ElementoPlanificacion[],
  termino: string,
): readonly ElementoPlanificacion[] {
  return elementos.reduce<ElementoPlanificacion[]>((visibles, elemento) => {
    if (coincideElemento(elemento, termino)) {
      visibles.push(elemento);
      return visibles;
    }

    const hijos = filtrarElementos(elemento.hijos, termino);
    if (hijos.length > 0) visibles.push({ ...elemento, hijos });
    return visibles;
  }, []);
}

function coincideElemento(elemento: ElementoPlanificacion, termino: string): boolean {
  return [elemento.titulo, elemento.detalle ?? '', ...elemento.terminosBusqueda].some((texto) =>
    normalizarTexto(texto).includes(termino),
  );
}

function obtenerClavesExpandibles(
  elementos: readonly ElementoPlanificacion[],
): readonly string[] {
  return elementos.flatMap((elemento) => [
    ...(elemento.hijos.length > 0 ? [elemento.clave] : []),
    ...obtenerClavesExpandibles(elemento.hijos),
  ]);
}

function contarElementos(elementos: readonly ElementoPlanificacion[]): number {
  return elementos.reduce(
    (total, elemento) => total + 1 + contarElementos(elemento.hijos),
    0,
  );
}

function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
