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
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly estado = inject(EstadoPlanificacionProyectoService);
  protected readonly editor = inject(EstadoEditorElementoPlanificacionService);
  protected readonly historial = inject(EstadoHistorialElementoPlanificacionService);
  protected readonly generarConIA = inject(EstadoGeneracionIaPlanificacionService);
  protected readonly exploracion = inject(EstadoExploracionPlanificacionService);
  protected readonly publicacionAzure = inject(EstadoPublicacionAzurePlanificacionService);
  protected readonly sincronizacionAzure = inject(EstadoSincronizacionEpicaAzurePlanificacionService);
  protected readonly eliminacionRequisitos = inject(EstadoEliminacionRequisitosPlanificacionService);
  protected readonly gantt = inject(EstadoGanttPlanificacionService);
  private readonly parametrosRuta = toSignal(this.ruta.paramMap, { requireSync: true });
  private readonly parametrosConsulta = toSignal(this.ruta.queryParamMap, { requireSync: true });
  private proyectoCargadoId: number | null = null;
  private solicitudVersionProcesada: string | null = null;

  protected readonly proyectoId = computed(() => obtenerProyectoIdRuta(this.parametrosRuta()));
  protected readonly versionSolicitadaId = computed(() =>
    obtenerVersionIdPlanificacionProyecto(
      this.parametrosConsulta().get(PARAMETROS_RUTA.versionProyectoId),
    ),
  );
  protected readonly errorCarga = computed(
    () => this.proyectoId() === null || this.estado.errorCarga(),
  );
  protected readonly mensajeError = MENSAJE_ERROR_CARGA_PLANIFICACION_PROYECTO;
  protected readonly mensajeErrorGantt = MENSAJE_ERROR_CARGA_GANTT_PLANIFICACION;
  protected readonly idFormularioElemento = 'formulario-elemento-planificacion';
  protected readonly pestanasElemento = PestanaElementoPlanificacion;
  protected readonly pestanaElemento = signal(PestanaElementoPlanificacion.Detalle);
  protected readonly listaRequisitosAbierta = signal(false);
  protected readonly esHistorialElemento = computed(
    () => this.pestanaElemento() === PestanaElementoPlanificacion.Historial,
  );
  protected readonly esConsultaElemento = computed(
    () => this.editor.contexto()?.modo === ModoEditorElementoPlanificacion.Consulta,
  );
  protected readonly detalleEliminado = computed(() => {
    const detalle = this.editor.detalle();
    return detalle && !detalle.activo ? detalle : null;
  });
  protected readonly esEpicaAzureSeleccionada = computed(() => {
    const detalle = this.editor.detalle();
    return (
      detalle?.tipo === TipoElementoPlanificacion.Epica &&
      (detalle.urlAzure !== null || detalle.capacidades.puedeSincronizar)
    );
  });
  protected readonly urlAzureEpicaSeleccionada = computed(() =>
    this.esEpicaAzureSeleccionada() ? this.editor.detalle()?.urlAzure ?? null : null,
  );
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
  protected readonly etiquetaMotivoInactivacion = computed(() => {
    const motivo = this.detalleEliminado()?.motivoInactivacion;
    return motivo
      ? ETIQUETAS_MOTIVO_INACTIVACION_PLANIFICACION[motivo]
      : 'Sin motivo registrado';
  });
  protected readonly puedeVerHistorial = computed(() => {
    const detalle = this.editor.detalle();
    return (
      detalle !== null &&
      detalle.capacidades.puedeVerHistorial &&
      esTipoElementoVersionable(detalle.tipo)
    );
  });
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
  protected readonly rolPanelDetalle = computed(() =>
    this.puedeVerHistorial() ? 'tabpanel' : null,
  );
  protected readonly etiquetaPanelDetalle = computed(() =>
    this.puedeVerHistorial() ? 'pestana-detalle-elemento' : null,
  );
  protected readonly tituloEditor = computed(() => {
    const contexto = this.editor.contexto();
    if (!contexto) return '';
    const nombre = obtenerNombreTipo(contexto.tipo);
    if (contexto.modo === ModoEditorElementoPlanificacion.Creacion) return `Nueva ${nombre.toLowerCase()}`;
    return this.editor.detalle()?.titulo ?? nombre;
  });
  protected readonly etiquetaEditor = computed(() => {
    const contexto = this.editor.contexto();
    return contexto ? obtenerNombreTipo(contexto.tipo) : '';
  });
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
  protected readonly textoCancelarEditor = computed(() =>
    this.esConsultaElemento() ? 'Cerrar' : 'Cancelar',
  );
  protected readonly iconoConfirmarEditor = computed<NombreIconoAplicacion>(() =>
    this.puedeSincronizarEpicaSeleccionada()
      ? 'sincronizar'
      : this.esConsultaElemento()
        ? 'editar'
        : 'guardar',
  );
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

  protected recargar(): void {
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) {
      this.solicitudVersionProcesada = null;
      this.estado.cargar(proyectoId, this.estado.incluirEliminados());
    }
  }

  protected crearEpica(): void {
    this.prepararDetalleEditor();
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) {
      this.editor.abrirCreacion(proyectoId, TipoElementoPlanificacion.Epica, proyectoId);
    }
  }

  protected crearElemento(solicitud: CreacionElementoDesdeArbol): void {
    this.prepararDetalleEditor();
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) {
      this.editor.abrirCreacion(proyectoId, solicitud.tipo, solicitud.padreId);
    }
  }

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

  protected guardarElemento(valores: ValoresFormularioElementoPlanificacion): void {
    const contexto = this.editor.contexto();
    this.editor.guardar(valores, () => {
      const clavePadre = contexto ? obtenerClavePadreRequisito(contexto) : null;
      if (clavePadre) this.exploracion.expandirRama(clavePadre);
      this.recargar();
    });
  }

  protected generarConIa(nivel: NivelGeneracionIaPlanificacion): void {
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) void this.generarConIA.generar(proyectoId, nivel);
  }

  protected publicarEnAzure(): void {
    const proyectoId = this.proyectoId();
    if (proyectoId !== null) void this.publicacionAzure.publicar(proyectoId);
  }

  protected sincronizarEpicaPrincipal(): void {
    const proyectoId = this.proyectoId();
    if (proyectoId === null) return;
    this.sincronizacionAzure.sincronizar(proyectoId, (resultado) =>
      this.completarSincronizacionEpica(resultado),
    );
  }

  protected eliminarElemento(elemento: ElementoPlanificacion): void {
    void this.eliminacionRequisitos.eliminar(elemento, () => this.recargar());
  }

  protected cerrarListaRequisitos(): void {
    this.listaRequisitosAbierta.set(false);
  }

  protected actualizarArbolDesdeLista(): void {
    this.recargar();
  }

  protected abrirGantt(): void {
    const planificacion = this.estado.planificacion();
    if (planificacion) this.gantt.abrir(planificacion);
  }

  protected cerrarGantt(): void {
    this.gantt.cerrar();
  }

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

  protected cambiarInclusionEliminados(incluirEliminados: boolean): void {
    this.estado.actualizarInclusionEliminados(incluirEliminados);
  }

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

  protected iniciarEdicionElemento(): void {
    if (this.puedeSincronizarEpicaSeleccionada()) {
      this.sincronizarEpicaPrincipal();
      return;
    }
    this.prepararDetalleEditor();
    this.editor.iniciarEdicion();
  }

  protected cerrarEditor(): void {
    this.historial.cerrar();
    this.pestanaElemento.set(PestanaElementoPlanificacion.Detalle);
    this.editor.cerrar();
  }

  private prepararDetalleEditor(): void {
    this.historial.cerrar();
    this.pestanaElemento.set(PestanaElementoPlanificacion.Detalle);
  }

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
