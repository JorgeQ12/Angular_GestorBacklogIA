import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PARAMETROS_RUTA, obtenerProyectoIdRuta } from '../../../../../core/navegacion/rutas';
import { EncabezadoPagina } from '../../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../../shared/components/estado-error/estado-error';
import { EstadoVacio } from '../../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { Modal } from '../../../../../shared/components/modal/modal';
import { FechaPipe } from '../../../../../shared/fechas/pipes/fecha.pipe';
import type { NombreIconoAplicacion } from '../../../../../shared/components/icono/iconos-aplicacion';
import { ArbolPlanificacionProyecto } from '../../components/arbol-planificacion-proyecto/arbol-planificacion-proyecto';
import { ControlesVistaPlanificacionComponent } from '../../components/controles-vista-planificacion/controles-vista-planificacion';
import { GeneracionIaPlanificacionComponent } from '../../components/generacion-ia-planificacion/generacion-ia-planificacion';
import { PublicacionAzurePlanificacionComponent } from '../../components/publicacion-azure-planificacion/publicacion-azure-planificacion';
import { GanttPlanificacionComponent } from '../../components/gantt-planificacion/gantt-planificacion';
import { ListaRequisitosPlanificacion } from '../../components/lista-requisitos-planificacion/lista-requisitos-planificacion';
import { FormularioElementoPlanificacionComponent } from '../../components/elemento-planificacion/formulario-elemento-planificacion/formulario-elemento-planificacion';
import { HistorialElementoPlanificacionComponent } from '../../components/elemento-planificacion/historial-elemento-planificacion/historial-elemento-planificacion';
import {
  MENSAJE_ERROR_CARGA_GANTT_PLANIFICACION,
  MENSAJE_ERROR_CARGA_PLANIFICACION_PROYECTO,
} from '../../config/mensajes-planificacion-proyecto.config';
import { ETIQUETAS_MOTIVO_INACTIVACION_PLANIFICACION } from '../../config/etiquetas-inactivacion-planificacion.config';
import {
  ModoEditorElementoPlanificacion,
  type ContextoEditorElementoPlanificacion,
  type CreacionElementoDesdeArbol,
  type TipoItemPlanificacion,
  type ValoresFormularioElementoPlanificacion,
} from '../../models/detalle-elemento-planificacion.model';
import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion,
} from '../../models/planificacion-proyecto.model';
import {
  PestanaElementoPlanificacion,
  esTipoElementoVersionable,
} from '../../models/historial-elemento-planificacion.model';
import {
  EstadoEditorElementoPlanificacionService,
  obtenerNombreTipo,
} from '../../services/estado-editor-elemento-planificacion.service';
import { EstadoPlanificacionProyectoService } from '../../services/estado-planificacion-proyecto.service';
import { EstadoHistorialElementoPlanificacionService } from '../../services/estado-historial-elemento-planificacion.service';
import { EstadoGeneracionIaPlanificacionService } from '../../services/estado-generacion-ia-planificacion.service';
import { EstadoExploracionPlanificacionService } from '../../services/estado-exploracion-planificacion.service';
import { EstadoPublicacionAzurePlanificacionService } from '../../services/estado-publicacion-azure-planificacion.service';
import { EstadoSincronizacionEpicaAzurePlanificacionService } from '../../services/estado-sincronizacion-epica-azure-planificacion.service';
import { EstadoEliminacionRequisitosPlanificacionService } from '../../services/estado-eliminacion-requisitos-planificacion.service';
import { EstadoGanttPlanificacionService } from '../../services/estado-gantt-planificacion.service';
import { NivelGeneracionIaPlanificacion } from '../../models/generacion-ia-planificacion.model';
import { obtenerVersionIdPlanificacionProyecto } from '../../mappers/navegacion-planificacion-proyecto.mapper';
import type { ResultadoSincronizacionEpicaAzurePlanificacion } from '../../models/sincronizacion-epica-azure-planificacion.model';

/** Compone la identidad y el espacio de trabajo de la planificación de un proyecto. */
@Component({
  selector: 'app-pagina-planificacion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EncabezadoPagina,
    EstadoError,
    EstadoVacio,
    IconoComponent,
    Modal,
    FechaPipe,
    ArbolPlanificacionProyecto,
    ControlesVistaPlanificacionComponent,
    GeneracionIaPlanificacionComponent,
    PublicacionAzurePlanificacionComponent,
    GanttPlanificacionComponent,
    ListaRequisitosPlanificacion,
    FormularioElementoPlanificacionComponent,
    HistorialElementoPlanificacionComponent,
  ],
  templateUrl: './pagina-planificacion-proyecto.html',
  styleUrl: './pagina-planificacion-proyecto.css',
})
export class PaginaPlanificacionProyecto {

  /** Proporciona acceso a activated route. */
  private readonly ruta = inject(ActivatedRoute);

  /** Proporciona acceso a la navegación administrada por Angular. */
  private readonly router = inject(Router);

  /** Proporciona acceso al servicio de estado planificación proyecto. */
  protected readonly estado = inject(EstadoPlanificacionProyectoService);

  /** Proporciona acceso al servicio de estado editor elemento planificación. */
  protected readonly editor = inject(EstadoEditorElementoPlanificacionService);

  /** Proporciona acceso al servicio de estado historial elemento planificación. */
  protected readonly historial = inject(EstadoHistorialElementoPlanificacionService);

  /** Proporciona acceso al servicio de estado generacion IA planificación. */
  protected readonly generarConIA = inject(EstadoGeneracionIaPlanificacionService);

  /** Proporciona acceso al servicio de estado exploracion planificación. */
  protected readonly exploracion = inject(EstadoExploracionPlanificacionService);

  /** Proporciona acceso al servicio de estado publicacion azure planificación. */
  protected readonly publicacionAzure = inject(EstadoPublicacionAzurePlanificacionService);

  /** Proporciona acceso al servicio de estado sincronizacion epica azure planificación. */
  protected readonly sincronizacionAzure = inject(EstadoSincronizacionEpicaAzurePlanificacionService);

  /** Proporciona acceso al servicio de estado eliminacion requisitos planificación. */
  protected readonly eliminacionRequisitos = inject(EstadoEliminacionRequisitosPlanificacionService);

  /** Proporciona acceso al servicio de estado gantt planificación. */
  protected readonly gantt = inject(EstadoGanttPlanificacionService);

  /** Conserva parametros ruta para coordinar esta responsabilidad. */
  private readonly parametrosRuta = toSignal(this.ruta.paramMap, { requireSync: true });

  /** Conserva parametros consulta para coordinar esta responsabilidad. */
  private readonly parametrosConsulta = toSignal(this.ruta.queryParamMap, { requireSync: true });

  /** Conserva proyecto cargado ID para coordinar esta responsabilidad. */
  private proyectoCargadoId: number | null = null;

  /** Conserva solicitud version procesada para coordinar esta responsabilidad. */
  private solicitudVersionProcesada: string | null = null;

  /** Deriva proyecto ID a partir del estado vigente. */
  protected readonly proyectoId = computed(() => obtenerProyectoIdRuta(this.parametrosRuta()));

  /** Deriva version solicitada ID a partir del estado vigente. */
  protected readonly versionSolicitadaId = computed(() =>
    obtenerVersionIdPlanificacionProyecto(
      this.parametrosConsulta().get(PARAMETROS_RUTA.versionProyectoId),
    ),
  );

  /** Deriva error carga a partir del estado vigente. */
  protected readonly errorCarga = computed(
    () => this.proyectoId() === null || this.estado.errorCarga(),
  );

  /** Conserva mensaje error para coordinar esta responsabilidad. */
  protected readonly mensajeError = MENSAJE_ERROR_CARGA_PLANIFICACION_PROYECTO;

  /** Conserva mensaje error gantt para coordinar esta responsabilidad. */
  protected readonly mensajeErrorGantt = MENSAJE_ERROR_CARGA_GANTT_PLANIFICACION;

  /** Conserva ID formulario elemento para coordinar esta responsabilidad. */
  protected readonly idFormularioElemento = 'formulario-elemento-planificacion';

  /** Conserva pestanas elemento para coordinar esta responsabilidad. */
  protected readonly pestanasElemento = PestanaElementoPlanificacion;

  /** Conserva pestana elemento como estado reactivo de la instancia. */
  protected readonly pestanaElemento = signal(PestanaElementoPlanificacion.Detalle);

  /** Conserva lista requisitos abierta como estado reactivo de la instancia. */
  protected readonly listaRequisitosAbierta = signal(false);

  /** Deriva es historial elemento a partir del estado vigente. */
  protected readonly esHistorialElemento = computed(
    () => this.pestanaElemento() === PestanaElementoPlanificacion.Historial,
  );

  /** Deriva es consulta elemento a partir del estado vigente. */
  protected readonly esConsultaElemento = computed(
    () => this.editor.contexto()?.modo === ModoEditorElementoPlanificacion.Consulta,
  );

  /** Deriva detalle eliminado a partir del estado vigente. */
  protected readonly detalleEliminado = computed(() => {
    const detalle = this.editor.detalle();
    return detalle && !detalle.activo ? detalle : null;
  });

  /** Deriva es epica azure seleccionada a partir del estado vigente. */
  protected readonly esEpicaAzureSeleccionada = computed(() => {
    const detalle = this.editor.detalle();
    return (
      detalle?.tipo === TipoElementoPlanificacion.Epica &&
      (detalle.urlAzure !== null || detalle.capacidades.puedeSincronizar)
    );
  });

  /** Deriva url azure epica seleccionada a partir del estado vigente. */
  protected readonly urlAzureEpicaSeleccionada = computed(() =>
    this.esEpicaAzureSeleccionada() ? this.editor.detalle()?.urlAzure ?? null : null,
  );

  /** Conserva metadatos editor para coordinar esta responsabilidad. */
  protected readonly metadatosEditor = computed<readonly string[]>(() => {
    const contexto = this.editor.contexto();
    const detalle = this.editor.detalle();
    if (!contexto || !detalle) return [];

    const metadatos = [`Versión ${detalle.numeroVersion}`];
    if (
      detalle.capacidades.soloLectura ||
      !detalle.activo ||
      contexto.versionPlanificacionId !== null
    ) {
      metadatos.push('Solo lectura');
    }
    return metadatos;
  });

  /** Deriva etiqueta motivo inactivacion a partir del estado vigente. */
  protected readonly etiquetaMotivoInactivacion = computed(() => {
    const motivo = this.detalleEliminado()?.motivoInactivacion;
    return motivo
      ? ETIQUETAS_MOTIVO_INACTIVACION_PLANIFICACION[motivo]
      : 'Sin motivo registrado';
  });

  /** Deriva puede ver historial a partir del estado vigente. */
  protected readonly puedeVerHistorial = computed(() => {
    const detalle = this.editor.detalle();
    return (
      detalle !== null &&
      detalle.capacidades.puedeVerHistorial &&
      esTipoElementoVersionable(detalle.tipo)
    );
  });

  /** Deriva puede sincronizar epica seleccionada a partir del estado vigente. */
  protected readonly puedeSincronizarEpicaSeleccionada = computed(() => {
    const contexto = this.editor.contexto();
    const detalle = this.editor.detalle();
    return (
      contexto?.modo === ModoEditorElementoPlanificacion.Consulta &&
      contexto.tipo === TipoElementoPlanificacion.Epica &&
      contexto.versionPlanificacionId === null &&
      detalle?.activo === true &&
      this.esEpicaAzureSeleccionada()
    );
  });

  /** Deriva rol panel detalle a partir del estado vigente. */
  protected readonly rolPanelDetalle = computed(() =>
    this.puedeVerHistorial() ? 'tabpanel' : null,
  );

  /** Deriva etiqueta panel detalle a partir del estado vigente. */
  protected readonly etiquetaPanelDetalle = computed(() =>
    this.puedeVerHistorial() ? 'pestana-detalle-elemento' : null,
  );

  /** Deriva titulo editor a partir del estado vigente. */
  protected readonly tituloEditor = computed(() => {
    const contexto = this.editor.contexto();
    if (!contexto) return '';
    const nombre = obtenerNombreTipo(contexto.tipo);
    if (contexto.modo === ModoEditorElementoPlanificacion.Creacion) return `Nueva ${nombre.toLowerCase()}`;
    return this.editor.detalle()?.titulo ?? nombre;
  });

  /** Deriva etiqueta editor a partir del estado vigente. */
  protected readonly etiquetaEditor = computed(() => {
    const contexto = this.editor.contexto();
    return contexto ? obtenerNombreTipo(contexto.tipo) : '';
  });

  /** Deriva descripción editor a partir del estado vigente. */
  protected readonly descripcionEditor = computed(() => {
    const contexto = this.editor.contexto();
    if (!contexto) return '';
    if (this.esEpicaAzureSeleccionada()) {
      return 'Información sincronizada desde Azure DevOps. Puedes consultar sus campos y su historial.';
    }
    if (this.esHistorialElemento()) {
      return 'Consulta el contenido que quedó registrado antes de cada modificación.';
    }
    if (contexto.modo === ModoEditorElementoPlanificacion.Creacion) {
      return 'Define el contenido y la planificación del nuevo elemento.';
    }
    if (contexto.modo === ModoEditorElementoPlanificacion.Edicion) {
      return 'Los cambios confirmados crearán una nueva versión del elemento.';
    }
    if (contexto.versionPlanificacionId !== null) {
      return 'Consulta la información registrada en la versión histórica seleccionada.';
    }
    if (this.detalleEliminado()) {
      return 'Consulta la última información registrada. Este elemento ya no permite cambios.';
    }
    return 'Consulta la información registrada en la versión vigente.';
  });

  /** Deriva texto confirmar editor a partir del estado vigente. */
  protected readonly textoConfirmarEditor = computed(() => {
    const contexto = this.editor.contexto();
    if (!contexto) return '';
    if (this.puedeSincronizarEpicaSeleccionada()) {
      return this.sincronizacionAzure.sincronizando() ? 'Sincronizando…' : 'Sincronizar';
    }
    if (contexto.modo === ModoEditorElementoPlanificacion.Consulta) return 'Editar';
    if (contexto.modo === ModoEditorElementoPlanificacion.Creacion) {
      return `Crear ${obtenerNombreTipo(contexto.tipo).toLowerCase()}`;
    }
    return 'Guardar nueva versión';
  });

  /** Deriva texto cancelar editor a partir del estado vigente. */
  protected readonly textoCancelarEditor = computed(() =>
    this.esConsultaElemento() ? 'Cerrar' : 'Cancelar',
  );

  /** Conserva icono confirmar editor para coordinar esta responsabilidad. */
  protected readonly iconoConfirmarEditor = computed<NombreIconoAplicacion>(() =>
    this.puedeSincronizarEpicaSeleccionada()
      ? 'sincronizar'
      : this.esConsultaElemento()
        ? 'editar'
        : 'guardar',
  );

  /** Conserva icono editor para coordinar esta responsabilidad. */
  protected readonly iconoEditor = computed<NombreIconoAplicacion>(() =>
    obtenerIconoTipo(this.editor.contexto()?.tipo ?? TipoElementoPlanificacion.Epica),
  );

  public constructor() {
    effect(() => {
      const proyectoId = this.proyectoId();
      if (proyectoId === null || proyectoId === this.proyectoCargadoId) return;
      this.generarConIA.restablecer();
      this.publicacionAzure.restablecer();
      this.sincronizacionAzure.restablecer();
      this.eliminacionRequisitos.restablecer();
      this.gantt.restablecer();
      this.solicitudVersionProcesada = null;
      this.proyectoCargadoId = proyectoId;
      this.estado.cargar(proyectoId);
    });
    effect(() => {
      const proyectoId = this.proyectoId();
      const actual = this.estado.planificacionActual();
      const versionId = this.versionSolicitadaId();
      if (proyectoId === null || actual?.proyectoId !== proyectoId) return;
      const claveSolicitud = `${proyectoId}:${actual.versionId}:${versionId ?? 'actual'}`;
      if (this.solicitudVersionProcesada === claveSolicitud) return;
      this.solicitudVersionProcesada = claveSolicitud;
      this.prepararDetalleEditor();
      this.editor.cerrar();
      this.generarConIA.restablecer();
      this.publicacionAzure.restablecer();
      this.sincronizacionAzure.restablecer();
      this.eliminacionRequisitos.restablecer();
      this.estado.presentarVersion(versionId);
    });
    effect(() => {
      const planificacion = this.estado.planificacion();
      const incluirEliminados = this.estado.incluirEliminados();
      untracked(() =>
        this.exploracion.sincronizarPlanificacion(planificacion, incluirEliminados),
      );
    });
    effect(() => {
      const planificacion = this.estado.planificacion();
      untracked(() => this.gantt.sincronizar(planificacion));
    });
  }

  /** Ejecuta recargar como parte del flujo interno. */
  protected recargar(): void {
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) {
      this.solicitudVersionProcesada = null;
      this.estado.cargar(proyectoId, this.estado.incluirEliminados());
    }
  }

  /** Crea epica dentro del flujo actual. */
  protected crearEpica(): void {
    this.prepararDetalleEditor();
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) {
      this.editor.abrirCreacion(proyectoId, TipoElementoPlanificacion.Epica, proyectoId);
    }
  }

  /** Crea elemento dentro del flujo actual. */
  protected crearElemento(solicitud: CreacionElementoDesdeArbol): void {
    this.prepararDetalleEditor();
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) {
      this.editor.abrirCreacion(proyectoId, solicitud.tipo, solicitud.padreId);
    }
  }

  /** Ejecuta consultar elemento como parte del flujo interno. */
  protected consultarElemento(elemento: ElementoPlanificacion): void {
    if (
      elemento.tipo === TipoElementoPlanificacion.ListaRequisitos &&
      !this.estado.planificacion()?.esHistorica
    ) {
      this.listaRequisitosAbierta.set(true);
      return;
    }
    this.prepararDetalleEditor();
    const proyectoId = this.proyectoId();
    const planificacion = this.estado.planificacion();
    if (proyectoId === null || !esTipoItem(elemento.tipo)) return;

    const versionPlanificacionId = planificacion?.esHistorica
      ? planificacion.versionId
      : null;
    const abreEnEdicion =
      elemento.tipo !== TipoElementoPlanificacion.Epica &&
      versionPlanificacionId === null &&
      elemento.activo &&
      elemento.capacidades.puedeEditar &&
      !elemento.capacidades.soloLectura;

    if (abreEnEdicion) {
      this.editor.abrirEdicion(proyectoId, elemento.tipo, elemento.id);
      return;
    }

    this.editor.abrirConsulta(
      proyectoId,
      elemento.tipo,
      elemento.id,
      versionPlanificacionId,
    );
  }

  /** Ejecuta editar elemento como parte del flujo interno. */
  protected editarElemento(elemento: ElementoPlanificacion): void {
    if (elemento.tipo === TipoElementoPlanificacion.ListaRequisitos) {
      this.listaRequisitosAbierta.set(true);
      return;
    }
    this.prepararDetalleEditor();
    const proyectoId = this.proyectoId();
    if (
      proyectoId !== null &&
      !this.estado.planificacion()?.esHistorica &&
      esTipoItem(elemento.tipo)
    ) {
      this.editor.abrirEdicion(proyectoId, elemento.tipo, elemento.id);
    }
  }

  /** Guarda elemento dentro del flujo actual. */
  protected guardarElemento(valores: ValoresFormularioElementoPlanificacion): void {
    const contexto = this.editor.contexto();
    this.editor.guardar(valores, () => {
      const clavePadre = contexto ? obtenerClavePadreRequisito(contexto) : null;
      if (clavePadre) this.exploracion.expandirRama(clavePadre);
      this.recargar();
    });
  }

  /** Ejecuta generar con IA como parte del flujo interno. */
  protected generarConIa(nivel: NivelGeneracionIaPlanificacion): void {
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) void this.generarConIA.generar(proyectoId, nivel);
  }

  /** Ejecuta publicar en azure como parte del flujo interno. */
  protected publicarEnAzure(): void {
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) void this.publicacionAzure.publicar(proyectoId);
  }

  /** Sincroniza epica principal dentro del flujo actual. */
  protected sincronizarEpicaPrincipal(): void {
    const proyectoId = this.proyectoId();
    if (proyectoId === null) return;
    this.sincronizacionAzure.sincronizar(proyectoId, (resultado) =>
      this.completarSincronizacionEpica(resultado),
    );
  }

  /** Elimina elemento dentro del flujo actual. */
  protected eliminarElemento(elemento: ElementoPlanificacion): void {
    void this.eliminacionRequisitos.eliminar(elemento, () => this.recargar());
  }

  /** Cierra lista requisitos dentro del flujo actual. */
  protected cerrarListaRequisitos(): void {
    this.listaRequisitosAbierta.set(false);
  }

  /** Actualiza arbol desde lista dentro del flujo actual. */
  protected actualizarArbolDesdeLista(): void {
    this.recargar();
  }

  /** Abre gantt dentro del flujo actual. */
  protected abrirGantt(): void {
    const planificacion = this.estado.planificacion();
    if (planificacion) this.gantt.abrir(planificacion);
  }

  /** Cierra gantt dentro del flujo actual. */
  protected cerrarGantt(): void {
    this.gantt.cerrar();
  }

  /** Ejecuta cambiar version planificación como parte del flujo interno. */
  protected cambiarVersionPlanificacion(versionId: number): void {
    const actualId = this.estado.planificacionActual()?.versionId;
    void this.router.navigate([], {
      relativeTo: this.ruta,
      queryParams: {
        [PARAMETROS_RUTA.versionProyectoId]: versionId === actualId ? null : versionId,
      },
      queryParamsHandling: 'merge',
    });
  }

  /** Ejecuta cambiar inclusion eliminados como parte del flujo interno. */
  protected cambiarInclusionEliminados(incluirEliminados: boolean): void {
    this.estado.actualizarInclusionEliminados(incluirEliminados);
  }

  /** Ejecuta cambiar pestana elemento como parte del flujo interno. */
  protected cambiarPestanaElemento(pestana: PestanaElementoPlanificacion): void {
    if (pestana === PestanaElementoPlanificacion.Detalle) {
      this.pestanaElemento.set(pestana);
      this.historial.cerrar();
      return;
    }

    const detalle = this.editor.detalle();
    if (!this.puedeVerHistorial() || !detalle || !esTipoElementoVersionable(detalle.tipo)) return;
    this.pestanaElemento.set(pestana);
    this.historial.abrir(detalle.tipo, detalle.id);
  }

  /** Inicia edicion elemento dentro del flujo actual. */
  protected iniciarEdicionElemento(): void {
    if (this.puedeSincronizarEpicaSeleccionada()) {
      this.sincronizarEpicaPrincipal();
      return;
    }
    this.prepararDetalleEditor();
    this.editor.iniciarEdicion();
  }

  /** Cierra editor dentro del flujo actual. */
  protected cerrarEditor(): void {
    this.historial.cerrar();
    this.pestanaElemento.set(PestanaElementoPlanificacion.Detalle);
    this.editor.cerrar();
  }

  /** Ejecuta preparar detalle editor como parte del flujo interno. */
  private prepararDetalleEditor(): void {
    this.historial.cerrar();
    this.pestanaElemento.set(PestanaElementoPlanificacion.Detalle);
  }

  /** Ejecuta completar sincronizacion epica como parte del flujo interno. */
  private completarSincronizacionEpica(
    resultado: ResultadoSincronizacionEpicaAzurePlanificacion,
  ): void {
    const proyectoId = this.proyectoId();
    if (proyectoId === null) return;

    const contexto = this.editor.contexto();
    this.estado.cargar(proyectoId, this.estado.incluirEliminados());
    if (
      contexto?.modo === ModoEditorElementoPlanificacion.Consulta &&
      contexto.tipo === TipoElementoPlanificacion.Epica &&
      contexto.elementoId === resultado.epicaId
    ) {
      this.prepararDetalleEditor();
      this.editor.abrirConsulta(
        proyectoId,
        TipoElementoPlanificacion.Epica,
        resultado.epicaId,
      );
    }
  }
}

function esTipoItem(tipo: TipoElementoPlanificacion): tipo is TipoItemPlanificacion {
  return tipo !== TipoElementoPlanificacion.ListaRequisitos;
}

function obtenerIconoTipo(tipo: TipoItemPlanificacion): NombreIconoAplicacion {
  switch (tipo) {
    case TipoElementoPlanificacion.Epica:
      return 'epica';
    case TipoElementoPlanificacion.Caracteristica:
      return 'caracteristica';
    case TipoElementoPlanificacion.Historia:
      return 'historiaUsuario';
    case TipoElementoPlanificacion.Tarea:
      return 'tarea';
    case TipoElementoPlanificacion.ActividadRequisito:
      return 'actividadRequisito';
    case TipoElementoPlanificacion.TareaRequisito:
      return 'tareaRequisito';
  }
}

function obtenerClavePadreRequisito(
  contexto: ContextoEditorElementoPlanificacion,
): string | null {
  if (
    contexto.modo !== ModoEditorElementoPlanificacion.Creacion ||
    contexto.padreId === null
  ) {
    return null;
  }
  if (contexto.tipo === TipoElementoPlanificacion.ActividadRequisito) {
    return `${TipoElementoPlanificacion.ListaRequisitos}:${contexto.padreId}`;
  }
  if (contexto.tipo === TipoElementoPlanificacion.TareaRequisito) {
    return `${TipoElementoPlanificacion.ActividadRequisito}:${contexto.padreId}`;
  }
  return null;
}
