import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription, finalize, forkJoin, map, of } from 'rxjs';
import { CatalogosService } from '../../../../core/catalogos/services/catalogos.service';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import {
  CATALOGOS_ELEMENTO_PLANIFICACION,
} from '../config/formulario-elemento-planificacion.config';
import { MENSAJES_ERROR_ELEMENTO_PLANIFICACION } from '../config/mensajes-planificacion-proyecto.config';
import {
  crearActualizacionElemento,
  crearSolicitudElemento,
  crearValoresFormularioElemento,
} from '../mappers/elemento-planificacion.mapper';
import {
  ModoEditorElementoPlanificacion,
  type CatalogosFormularioElementoPlanificacion,
  type ContextoEditorElementoPlanificacion,
  type DetalleElementoPlanificacion,
  type TipoItemPlanificacion,
  type ValoresFormularioElementoPlanificacion,
} from '../models/detalle-elemento-planificacion.model';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';
import { ElementoPlanificacionService } from './elemento-planificacion.service';

const CATALOGOS_VACIOS: CatalogosFormularioElementoPlanificacion = {
  prioridades: [],
  riesgos: [],
  actividadesTarea: [],
  actividadesRequisito: [],
};

/** Coordina el diálogo, su carga y la persistencia sin trasladar HTTP a la página. */
@Injectable()
export class EstadoEditorElementoPlanificacionService {

  /** Proporciona acceso al servicio remoto requerido por esta responsabilidad. */
  private readonly api = inject(ElementoPlanificacionService);

  /** Proporciona acceso al servicio de catálogos. */
  private readonly catalogosApi = inject(CatalogosService);

  /** Proporciona acceso al servicio de notificador errores API. */
  private readonly notificador = inject(NotificadorErroresApiService);

  /** Proporciona acceso al servicio de mensajes. */
  private readonly mensajes = inject(MensajesService);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destroyRef = inject(DestroyRef);

  /** Conserva operación actual para controlar el ciclo de vida de la operación. */
  private operacionActual: Subscription | null = null;

  /** Conserva contexto estado como estado reactivo de la instancia. */
  private readonly contextoEstado = signal<ContextoEditorElementoPlanificacion | null>(null);

  /** Conserva detalle estado como estado reactivo de la instancia. */
  private readonly detalleEstado = signal<DetalleElementoPlanificacion | null>(null);

  /** Conserva catálogos estado como estado reactivo de la instancia. */
  private readonly catalogosEstado = signal<CatalogosFormularioElementoPlanificacion>(CATALOGOS_VACIOS);

  /** Conserva cargando estado como estado reactivo de la instancia. */
  private readonly cargandoEstado = signal(false);

  /** Conserva guardando estado como estado reactivo de la instancia. */
  private readonly guardandoEstado = signal(false);

  /** Expone el flujo abierto y la identidad que debe persistirse. */
  public readonly contexto = this.contextoEstado.asReadonly();
  /** Expone el detalle confirmado por ObtenerWorkItem. */
  public readonly detalle = this.detalleEstado.asReadonly();
  /** Expone las opciones remotas requeridas por el tipo actual. */
  public readonly catalogos = this.catalogosEstado.asReadonly();
  /** Indica que se está preparando el contenido del diálogo. */
  public readonly cargando = this.cargandoEstado.asReadonly();
  /** Bloquea una segunda persistencia mientras la actual continúa. */
  public readonly guardando = this.guardandoEstado.asReadonly();
  /** Indica si existe un flujo visible. */
  public readonly abierto = computed(() => this.contextoEstado() !== null);
  /** Informa si el formulario vigente es únicamente consultivo. */
  public readonly soloLectura = computed(
    () => this.contextoEstado()?.modo === ModoEditorElementoPlanificacion.Consulta,
  );
  /** Permite cambiar de consulta a edición únicamente cuando el backend lo autoriza. */
  public readonly puedeEditar = computed(() => {
    const detalle = this.detalleEstado();
    return (
      this.contextoEstado()?.versionPlanificacionId === null &&
      detalle?.activo === true &&
      detalle?.capacidades.puedeEditar === true &&
      !detalle.capacidades.soloLectura
    );
  });
  /** Hidrata el formulario con la fotografía vigente o con valores de creación. */
  public readonly valoresFormulario = computed(() => {
    const contexto = this.contextoEstado();
    return contexto
      ? crearValoresFormularioElemento(contexto.tipo, this.catalogosEstado(), this.detalleEstado())
      : null;
  });

  /** Abre un elemento existente sin permitir mutaciones. */
  public abrirConsulta(
    proyectoId: number,
    tipo: TipoItemPlanificacion,
    elementoId: number,
    versionPlanificacionId: number | null = null,
  ): void {
    this.abrirDetalle(
      ModoEditorElementoPlanificacion.Consulta,
      proyectoId,
      tipo,
      elementoId,
      versionPlanificacionId,
    );
  }

  /** Abre directamente la edición de un elemento autorizado por el árbol. */
  public abrirEdicion(proyectoId: number, tipo: TipoItemPlanificacion, elementoId: number): void {
    this.abrirDetalle(ModoEditorElementoPlanificacion.Edicion, proyectoId, tipo, elementoId, null);
  }

  /** Prepara un elemento nuevo bajo su padre estable. */
  public abrirCreacion(proyectoId: number, tipo: TipoItemPlanificacion, padreId: number): void {
    this.cancelarOperacion();
    this.contextoEstado.set({
      modo: ModoEditorElementoPlanificacion.Creacion,
      tipo,
      proyectoId,
      versionPlanificacionId: null,
      padreId,
      elementoId: null,
    });
    this.detalleEstado.set(null);
    this.catalogosEstado.set(CATALOGOS_VACIOS);
    this.cargandoEstado.set(true);
    this.operacionActual = this.obtenerCatalogos(tipo)
      .pipe(
        finalize(() => this.cargandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (catalogos) => this.catalogosEstado.set(catalogos),
        error: (error: unknown) => {
          this.cerrarForzado();
          this.notificador.comunicar(error, MENSAJES_ERROR_ELEMENTO_PLANIFICACION.catalogos);
        },
      });
  }

  /** Convierte el detalle consultado en una edición sin volver a solicitarlo. */
  public iniciarEdicion(): void {
    const contexto = this.contextoEstado();
    if (!contexto || !this.puedeEditar()) return;
    this.contextoEstado.set({ ...contexto, modo: ModoEditorElementoPlanificacion.Edicion });
  }

  /** Cierra el flujo actual cuando no existe una persistencia en curso. */
  public cerrar(): void {
    if (!this.guardandoEstado()) this.cerrarForzado();
  }

  /** Crea o actualiza el elemento y renueva el árbol después de confirmar el backend. */
  public guardar(
    valores: ValoresFormularioElementoPlanificacion,
    completado: () => void,
  ): void {
    const contexto = this.contextoEstado();
    if (!contexto || this.guardandoEstado() || this.soloLectura()) return;

    const esCreacion = contexto.modo === ModoEditorElementoPlanificacion.Creacion;
    const detalle = this.detalleEstado();
    const operacion = esCreacion
      ? this.api.crear(crearSolicitudElemento(contexto, valores))
      : detalle
        ? this.api.actualizar(crearActualizacionElemento(detalle, valores))
        : null;
    if (!operacion) return;

    this.guardandoEstado.set(true);
    this.operacionActual = operacion
      .pipe(
        finalize(() => this.guardandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          const tipo = contexto.tipo;
          this.cerrarForzado();
          completado();
          void this.mensajes.exito(
            esCreacion ? 'Elemento creado' : 'Cambios guardados',
            esCreacion
              ? `La ${obtenerNombreTipo(tipo).toLowerCase()} fue creada correctamente.`
              : 'La nueva versión del elemento fue guardada correctamente.',
          );
        },
        error: (error: unknown) =>
          this.notificador.comunicar(
            error,
            esCreacion
              ? MENSAJES_ERROR_ELEMENTO_PLANIFICACION.creacion
              : MENSAJES_ERROR_ELEMENTO_PLANIFICACION.edicion,
          ),
      });
  }

  /** Abre detalle dentro del flujo actual. */
  private abrirDetalle(
    modo: ModoEditorElementoPlanificacion.Consulta | ModoEditorElementoPlanificacion.Edicion,
    proyectoId: number,
    tipo: TipoItemPlanificacion,
    elementoId: number,
    versionPlanificacionId: number | null,
  ): void {
    this.cancelarOperacion();
    this.contextoEstado.set({
      modo,
      tipo,
      proyectoId,
      versionPlanificacionId,
      padreId: null,
      elementoId,
    });
    this.detalleEstado.set(null);
    this.catalogosEstado.set(CATALOGOS_VACIOS);
    this.cargandoEstado.set(true);
    this.operacionActual = forkJoin({
      detalle: this.api.obtener(tipo, elementoId, versionPlanificacionId),
      catalogos: this.obtenerCatalogos(tipo),
    })
      .pipe(
        finalize(() => this.cargandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ detalle, catalogos }) => {
          this.detalleEstado.set(detalle);
          this.catalogosEstado.set(incorporarOpcionesVigentes(catalogos, detalle));
          if (
            modo === ModoEditorElementoPlanificacion.Edicion &&
            (!detalle.activo ||
              !detalle.capacidades.puedeEditar ||
              detalle.capacidades.soloLectura)
          ) {
            this.contextoEstado.set({
              modo: ModoEditorElementoPlanificacion.Consulta,
              tipo,
              proyectoId,
              versionPlanificacionId,
              padreId: null,
              elementoId,
            });
          }
        },
        error: (error: unknown) => {
          this.cerrarForzado();
          this.notificador.comunicar(error, MENSAJES_ERROR_ELEMENTO_PLANIFICACION.consulta);
        },
      });
  }

  /** Obtiene catálogos dentro del flujo actual. */
  private obtenerCatalogos(
    tipo: TipoItemPlanificacion,
  ): Observable<CatalogosFormularioElementoPlanificacion> {
    if (tipo === TipoElementoPlanificacion.Epica) {
      return forkJoin({
        prioridades: this.catalogosApi.obtenerOpciones(CATALOGOS_ELEMENTO_PLANIFICACION.prioridad),
        riesgos: this.catalogosApi.obtenerOpciones(CATALOGOS_ELEMENTO_PLANIFICACION.riesgo),
      }).pipe(map(({ prioridades, riesgos }) => ({ ...CATALOGOS_VACIOS, prioridades, riesgos })));
    }
    if (tipo === TipoElementoPlanificacion.Tarea) {
      return this.catalogosApi
        .obtenerOpciones(CATALOGOS_ELEMENTO_PLANIFICACION.actividadTarea)
        .pipe(map((actividadesTarea) => ({ ...CATALOGOS_VACIOS, actividadesTarea })));
    }
    if (tipo === TipoElementoPlanificacion.ActividadRequisito) {
      return this.catalogosApi
        .obtenerOpciones(CATALOGOS_ELEMENTO_PLANIFICACION.actividadRequisito)
        .pipe(map((actividadesRequisito) => ({ ...CATALOGOS_VACIOS, actividadesRequisito })));
    }
    return of(CATALOGOS_VACIOS);
  }

  /** Cancela operación dentro del flujo actual. */
  private cancelarOperacion(): void {
    this.operacionActual?.unsubscribe();
    this.cargandoEstado.set(false);
    this.guardandoEstado.set(false);
  }

  /** Cierra forzado dentro del flujo actual. */
  private cerrarForzado(): void {
    this.cancelarOperacion();
    this.contextoEstado.set(null);
    this.detalleEstado.set(null);
    this.catalogosEstado.set(CATALOGOS_VACIOS);
  }
}

function incorporarOpcionesVigentes(
  catalogos: CatalogosFormularioElementoPlanificacion,
  detalle: DetalleElementoPlanificacion,
): CatalogosFormularioElementoPlanificacion {
  const agregar = (opciones: CatalogosFormularioElementoPlanificacion['prioridades'], id: number | null) =>
    id !== null && !opciones.some((opcion) => opcion.id === id)
      ? [{ id, nombre: `Valor registrado #${id}`, descripcion: '' }, ...opciones]
      : opciones;
  return {
    prioridades: agregar(catalogos.prioridades, detalle.prioridadCatalogoId),
    riesgos: agregar(catalogos.riesgos, detalle.riesgoCatalogoId),
    actividadesTarea: agregar(catalogos.actividadesTarea, detalle.actividadCatalogoId),
    actividadesRequisito: agregar(catalogos.actividadesRequisito, detalle.actividadCatalogoId),
  };
}

/** Obtiene la etiqueta visible y mantiene exhaustiva la identidad de los tipos persistibles. */
export function obtenerNombreTipo(tipo: TipoItemPlanificacion): string {
  switch (tipo) {
    case TipoElementoPlanificacion.Epica:
      return 'Épica';
    case TipoElementoPlanificacion.Caracteristica:
      return 'Característica';
    case TipoElementoPlanificacion.Historia:
      return 'Historia de usuario';
    case TipoElementoPlanificacion.Tarea:
      return 'Tarea';
    case TipoElementoPlanificacion.ActividadRequisito:
      return 'Actividad de requisito';
    case TipoElementoPlanificacion.TareaRequisito:
      return 'Tarea de requisito';
  }
}
