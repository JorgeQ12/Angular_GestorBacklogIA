import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import type {
  CreacionElementoDesdeArbol,
  TipoItemPlanificacion,
} from '../../models/detalle-elemento-planificacion.model';
import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion as ElementoPlanificacionModel,
  type PlanificacionProyecto,
} from '../../models/planificacion-proyecto.model';
import { ElementoPlanificacion } from '../elemento-planificacion/elemento-planificacion';

/** Presenta la jerarquía navegable de elementos que conforman una planificación. */
@Component({
  selector: 'app-arbol-planificacion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, IconoComponent, ElementoPlanificacion],
  templateUrl: './arbol-planificacion-proyecto.html',
  styleUrl: './arbol-planificacion-proyecto.css',
})
export class ArbolPlanificacionProyecto {
  private readonly menuAccionesClave = signal<string | null>(null);
  /** Proporciona la planificación y su jerarquía adaptada. */
  public readonly planificacion = input.required<PlanificacionProyecto>();
  /** Proporciona los elementos que cumplen el criterio de exploración vigente. */
  public readonly elementos = input.required<readonly ElementoPlanificacionModel[]>();
  /** Identifica las ramas que deben presentar sus descendientes. */
  public readonly expandidos = input.required<ReadonlySet<string>>();
  /** Impide modificar manualmente la expansión durante una búsqueda automática. */
  public readonly expansionDeshabilitada = input(false);
  /** Bloquea las acciones de escritura mientras otra operación de planificación continúa. */
  public readonly accionesDeshabilitadas = input(false);
  /** Solicita crear una épica directamente bajo el proyecto. */
  public readonly crearEpica = output<void>();
  /** Comunica el elemento persistible que se debe consultar. */
  public readonly consultarElemento = output<ElementoPlanificacionModel>();
  /** Comunica el elemento persistible que se debe editar. */
  public readonly editarElemento = output<ElementoPlanificacionModel>();
  /** Comunica el tipo y el padre del nuevo elemento solicitado. */
  public readonly crearElemento = output<CreacionElementoDesdeArbol>();
  /** Solicita alternar la expansión manual de una rama. */
  public readonly expansionAlternada = output<string>();
  /** Solicita sincronizar la épica principal autorizada por el backend. */
  public readonly sincronizarEpica = output<void>();
  /** Comunica la actividad o tarea de requisitos que se debe eliminar lógicamente. */
  public readonly eliminarElemento = output<ElementoPlanificacionModel>();

  protected readonly resumenProyecto = computed(() => {
    const resumen = this.planificacion().resumen;
    return `${resumen.epicas} épicas · ${resumen.caracteristicas} características · ${resumen.historias} historias de usuario · ${resumen.tareas} tareas`;
  });

  protected estaExpandido(clave: string): boolean {
    return this.expandidos().has(clave);
  }

  protected esRamaTerminal(elemento: ElementoPlanificacionModel): boolean {
    return (
      elemento.tipo === TipoElementoPlanificacion.Tarea ||
      elemento.tipo === TipoElementoPlanificacion.TareaRequisito
    );
  }

  protected alternar(clave: string): void {
    this.expansionAlternada.emit(clave);
  }

  protected estaAbiertoMenuAcciones(clave: string): boolean {
    return this.menuAccionesClave() === clave;
  }

  protected hayMenuAccionesAbierto(): boolean {
    return this.menuAccionesClave() !== null;
  }

  protected alternarMenuAcciones(clave: string): void {
    this.menuAccionesClave.update((actual) => actual === clave ? null : clave);
  }

  protected cerrarMenuAcciones(): void {
    this.menuAccionesClave.set(null);
  }

  @HostListener('document:click')
  protected cerrarMenuDesdeExterior(): void {
    this.cerrarMenuAcciones();
  }

  @HostListener('document:keydown.escape')
  protected cerrarMenuConEscape(): void {
    this.cerrarMenuAcciones();
  }

  protected solicitarCreacion(elemento: ElementoPlanificacionModel): void {
    const tipo = obtenerTipoHijo(elemento.tipo);
    if (tipo) this.crearElemento.emit({ tipo, padreId: elemento.id });
  }
}

function obtenerTipoHijo(tipo: TipoElementoPlanificacion): TipoItemPlanificacion | null {
  switch (tipo) {
    case TipoElementoPlanificacion.Epica:
      return TipoElementoPlanificacion.Caracteristica;
    case TipoElementoPlanificacion.Caracteristica:
      return TipoElementoPlanificacion.Historia;
    case TipoElementoPlanificacion.ListaRequisitos:
      return TipoElementoPlanificacion.ActividadRequisito;
    case TipoElementoPlanificacion.ActividadRequisito:
      return TipoElementoPlanificacion.TareaRequisito;
    case TipoElementoPlanificacion.Historia:
      return TipoElementoPlanificacion.Tarea;
    case TipoElementoPlanificacion.TareaRequisito:
    case TipoElementoPlanificacion.Tarea:
      return null;
  }
}
