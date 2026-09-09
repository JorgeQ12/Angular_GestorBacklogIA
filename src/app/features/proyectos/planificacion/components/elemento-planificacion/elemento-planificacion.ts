import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import type { NombreIconoAplicacion } from '../../../../../shared/components/icono/iconos-aplicacion';
import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion as ElementoPlanificacionModel,
} from '../../models/planificacion-proyecto.model';

/** Representa un elemento del árbol según su categoría de planificación. */
@Component({
  selector: 'app-elemento-planificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './elemento-planificacion.html',
  styleUrl: './elemento-planificacion.css',
})
export class ElementoPlanificacion {
  /** Proporciona el elemento que se debe representar. */
  public readonly elemento = input.required<ElementoPlanificacionModel>();
  /** Indica si los descendientes del elemento están visibles. */
  public readonly expandido = input(false);
  /** Impide modificar manualmente una expansión administrada por la búsqueda. */
  public readonly expansionDeshabilitada = input(false);
  /** Impide ejecutar acciones de escritura mientras otra operación bloqueante continúa. */
  public readonly accionesDeshabilitadas = input(false);
  /** Indica si el menú contextual de este elemento está visible. */
  public readonly menuAccionesAbierto = input(false);
  /** Solicita alternar la visibilidad de los descendientes. */
  public readonly alternar = output<void>();
  /** Solicita consultar el detalle del elemento seleccionado. */
  public readonly consultar = output<void>();
  /** Solicita abrir directamente la edición del elemento. */
  public readonly editar = output<void>();
  /** Solicita crear el tipo de hijo permitido por la jerarquía. */
  public readonly crearHijo = output<void>();
  /** Solicita importar las revisiones de la épica principal desde Azure DevOps. */
  public readonly sincronizar = output<void>();
  /** Solicita alternar el menú contextual exclusivo del elemento. */
  public readonly alternarMenuAcciones = output<void>();
  /** Solicita cerrar el menú contextual antes de ejecutar una acción. */
  public readonly cerrarMenuAcciones = output<void>();
  /** Solicita eliminar lógicamente un elemento autorizado por el backend. */
  public readonly eliminar = output<void>();

  protected readonly tipos = TipoElementoPlanificacion;
  protected readonly tieneHijos = computed(() => this.elemento().hijos.length > 0);
  protected readonly muestraAlternador = computed(() =>
    admiteHijos(this.elemento().tipo),
  );
  protected readonly etiquetaTipo = computed(() => obtenerEtiquetaTipo(this.elemento().tipo));
  protected readonly descripcion = computed(() => construirDescripcion(this.elemento()));
  protected readonly etiquetaAlternador = computed(
    () =>
      `${this.expandido() ? 'Contraer' : 'Expandir'} ${this.etiquetaTipo()}: ${this.elemento().titulo}`,
  );
  protected readonly puedeConsultar = computed(
    () => this.elemento().capacidades.puedeConsultar,
  );
  protected readonly puedeEditar = computed(
    () => this.elemento().activo && this.elemento().capacidades.puedeEditar,
  );
  protected readonly puedeCrearHijo = computed(
    () => this.elemento().activo && this.elemento().capacidades.puedeCrearHijo,
  );
  protected readonly puedeSincronizar = computed(
    () => this.elemento().activo && this.elemento().capacidades.puedeSincronizar,
  );
  protected readonly puedeEliminar = computed(
    () =>
      this.elemento().activo &&
      this.elemento().capacidades.puedeEliminar,
  );
  protected readonly muestraMenuAcciones = computed(
    () => this.puedeEditar() || this.puedeSincronizar() || this.puedeEliminar(),
  );
  protected readonly iconoHijo = computed<NombreIconoAplicacion>(() =>
    obtenerIconoHijo(this.elemento().tipo),
  );
  protected readonly etiquetaConsulta = computed(
    () => `Consultar ${this.etiquetaTipo()}: ${this.elemento().titulo}`,
  );
  protected readonly etiquetaCrearHijo = computed(() =>
    obtenerEtiquetaCrearHijo(this.elemento().tipo),
  );
  protected readonly etiquetaEliminacion = computed(
    () => `Eliminar ${this.etiquetaTipo().toLowerCase()}: ${this.elemento().titulo}`,
  );

  protected alternarExpansion(): void {
    if (this.tieneHijos() && !this.expansionDeshabilitada()) this.alternar.emit();
  }

  protected abrirOCerrarMenu(evento: MouseEvent): void {
    evento.stopPropagation();
    this.alternarMenuAcciones.emit();
  }

  protected ejecutarEdicion(evento: MouseEvent): void {
    evento.stopPropagation();
    this.cerrarMenuAcciones.emit();
    this.editar.emit();
  }

  protected ejecutarSincronizacion(evento: MouseEvent): void {
    evento.stopPropagation();
    this.cerrarMenuAcciones.emit();
    this.sincronizar.emit();
  }

  protected ejecutarEliminacion(evento: MouseEvent): void {
    evento.stopPropagation();
    this.cerrarMenuAcciones.emit();
    this.eliminar.emit();
  }
}

function obtenerIconoHijo(tipo: TipoElementoPlanificacion): NombreIconoAplicacion {
  switch (tipo) {
    case TipoElementoPlanificacion.Epica:
      return 'caracteristica';
    case TipoElementoPlanificacion.Caracteristica:
      return 'historiaUsuario';
    case TipoElementoPlanificacion.ListaRequisitos:
      return 'actividadRequisito';
    case TipoElementoPlanificacion.ActividadRequisito:
      return 'tareaRequisito';
    case TipoElementoPlanificacion.Historia:
      return 'tarea';
    case TipoElementoPlanificacion.TareaRequisito:
    case TipoElementoPlanificacion.Tarea:
      return 'agregar';
  }
}

function obtenerEtiquetaCrearHijo(tipo: TipoElementoPlanificacion): string {
  switch (tipo) {
    case TipoElementoPlanificacion.Epica:
      return 'Nueva característica';
    case TipoElementoPlanificacion.Caracteristica:
      return 'Nueva historia de usuario';
    case TipoElementoPlanificacion.ListaRequisitos:
      return 'Crear actividad';
    case TipoElementoPlanificacion.ActividadRequisito:
      return 'Crear tarea de requisitos';
    case TipoElementoPlanificacion.Historia:
      return 'Nueva tarea';
    case TipoElementoPlanificacion.TareaRequisito:
    case TipoElementoPlanificacion.Tarea:
      return 'Crear elemento';
  }
}

function obtenerEtiquetaTipo(tipo: TipoElementoPlanificacion): string {
  switch (tipo) {
    case TipoElementoPlanificacion.Epica:
      return 'Épica';
    case TipoElementoPlanificacion.Caracteristica:
      return 'Característica';
    case TipoElementoPlanificacion.ListaRequisitos:
      return 'Lista de requisitos';
    case TipoElementoPlanificacion.ActividadRequisito:
      return 'Actividad de requisito';
    case TipoElementoPlanificacion.TareaRequisito:
      return 'Tarea de requisito';
    case TipoElementoPlanificacion.Historia:
      return 'Historia de usuario';
    case TipoElementoPlanificacion.Tarea:
      return 'Tarea';
  }
}

function admiteHijos(tipo: TipoElementoPlanificacion): boolean {
  return (
    tipo === TipoElementoPlanificacion.Epica ||
    tipo === TipoElementoPlanificacion.Caracteristica ||
    tipo === TipoElementoPlanificacion.ListaRequisitos ||
    tipo === TipoElementoPlanificacion.ActividadRequisito ||
    tipo === TipoElementoPlanificacion.Historia
  );
}

function construirDescripcion(elemento: ElementoPlanificacionModel): string {
  const partes = [obtenerEtiquetaTipo(elemento.tipo), `v${elemento.numeroVersion}`];
  if (elemento.detalle) partes.push(elemento.detalle);

  const cantidad = elemento.hijos.length;
  if (cantidad > 0) partes.push(describirHijos(elemento));
  if (!elemento.activo) partes.push('Eliminado');
  return partes.join(' · ');
}

function describirHijos(elemento: ElementoPlanificacionModel): string {
  const cantidad = elemento.hijos.length;
  switch (elemento.tipo) {
    case TipoElementoPlanificacion.Epica:
      return `${cantidad} ${cantidad === 1 ? 'característica' : 'características'}`;
    case TipoElementoPlanificacion.Caracteristica:
      return describirContenidoCaracteristica(elemento.hijos);
    case TipoElementoPlanificacion.ListaRequisitos:
      return `${cantidad} ${cantidad === 1 ? 'actividad' : 'actividades'}`;
    case TipoElementoPlanificacion.ActividadRequisito:
      return `${cantidad} ${cantidad === 1 ? 'tarea' : 'tareas'} de requisito`;
    case TipoElementoPlanificacion.Historia:
      return `${cantidad} ${cantidad === 1 ? 'tarea' : 'tareas'}`;
    case TipoElementoPlanificacion.TareaRequisito:
    case TipoElementoPlanificacion.Tarea:
      return '';
  }
}

function describirContenidoCaracteristica(
  hijos: readonly ElementoPlanificacionModel[],
): string {
  const historias = hijos.filter(
    (hijo) => hijo.tipo === TipoElementoPlanificacion.Historia,
  ).length;
  const tieneRequisitos = hijos.some(
    (hijo) => hijo.tipo === TipoElementoPlanificacion.ListaRequisitos,
  );
  const partes: string[] = [];
  if (tieneRequisitos) partes.push('lista de requisitos');
  if (historias > 0) {
    partes.push(`${historias} ${historias === 1 ? 'historia de usuario' : 'historias de usuario'}`);
  }
  return partes.join(' · ');
}
