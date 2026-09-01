import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type { OpcionCatalogo } from '../../../../../core/catalogos/models/opcion-catalogo.model';
import { CatalogosService } from '../../../../../core/catalogos/services/catalogos.service';
import { MensajesService } from '../../../../../core/mensajes/services/mensajes.service';
import { PARAMETROS_RUTA, URL_PROYECTOS, obtenerProyectoIdRuta } from '../../../../../core/navegacion/rutas';
import { EncabezadoPagina } from '../../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { FechaPipe } from '../../../../../shared/fechas/pipes/fecha.pipe';
import { PasoAlcanceProyecto } from '../../../components/pasos/paso-alcance-proyecto/paso-alcance-proyecto';
import { PasoContextoProyecto } from '../../../components/pasos/paso-contexto-proyecto/paso-contexto-proyecto';
import { PasoEquipoProyecto } from '../../../components/pasos/paso-equipo-proyecto/paso-equipo-proyecto';
import { PasoFlujoProyecto } from '../../../components/pasos/paso-flujo-proyecto/paso-flujo-proyecto';
import { PasoNecesidadProyecto } from '../../../components/pasos/paso-necesidad-proyecto/paso-necesidad-proyecto';
import { PasoObjetivosProyecto } from '../../../components/pasos/paso-objetivos-proyecto/paso-objetivos-proyecto';
import { PasoRolesProyecto } from '../../../components/pasos/paso-roles-proyecto/paso-roles-proyecto';
import { PasoTipoSolucionProyecto } from '../../../components/pasos/paso-tipo-solucion-proyecto/paso-tipo-solucion-proyecto';
import { PasoVinculacionAzureProyecto } from '../../../components/pasos/paso-vinculacion-azure-proyecto/paso-vinculacion-azure-proyecto';
import { RecorridoProyecto } from '../../../components/recorrido-proyecto/recorrido-proyecto';
import {
  ClavePasoEspecialProyecto,
  type ClavePasoProyecto,
  PASOS_PROYECTO,
} from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { ActualizacionSeccionProyecto } from '../../../models/actualizacion-seccion-proyecto.model';
import { ACCIONES_INFORMACION_PASO_PROYECTO } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { CATALOGO_PRIORIDADES_PROYECTO } from '../../../secciones/contexto/config/contexto-proyecto.config';
import { SelectorVersionProyecto } from '../../components/selector-version-proyecto/selector-version-proyecto';
import { MENSAJE_ERROR_CARGA_INFORMACION_PROYECTO } from '../../config/mensajes-informacion-proyecto.config';
import {
  obtenerPasoInformacionProyecto,
  obtenerVersionIdInformacionProyecto,
} from '../../mappers/navegacion-informacion-proyecto.mapper';
import { EstadoInformacionProyectoService } from '../../services/estado-informacion-proyecto.service';

/** Compone el recorrido compartido con la consulta y edición versionada del proyecto. */
@Component({
  selector: 'app-pagina-informacion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EncabezadoPagina,
    EstadoError,
    FechaPipe,
    IconoComponent,
    SelectorVersionProyecto,
    RecorridoProyecto,
    PasoVinculacionAzureProyecto,
    PasoContextoProyecto,
    PasoTipoSolucionProyecto,
    PasoNecesidadProyecto,
    PasoObjetivosProyecto,
    PasoAlcanceProyecto,
    PasoRolesProyecto,
    PasoEquipoProyecto,
    PasoFlujoProyecto,
  ],
  templateUrl: './pagina-informacion-proyecto.html',
  styleUrl: './pagina-informacion-proyecto.css',
})
export class PaginaInformacionProyecto {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogos = inject(CatalogosService);
  private readonly mensajes = inject(MensajesService);
  protected readonly estado = inject(EstadoInformacionProyectoService);
  private readonly parametrosRuta = toSignal(this.route.paramMap, { requireSync: true });
  private readonly parametrosConsulta = toSignal(this.route.queryParamMap, { requireSync: true });
  private proyectoCargadoId: number | null = null;

  protected readonly pasoAzure = ClavePasoEspecialProyecto.VinculacionAzure;
  protected readonly secciones = ClaveSeccionProyecto;
  protected readonly pasosNavegables = PASOS_PROYECTO.map((paso) => paso.clave);
  protected readonly accionesInformacion = ACCIONES_INFORMACION_PASO_PROYECTO;
  protected readonly pasoActivo = computed(() =>
    obtenerPasoInformacionProyecto(this.parametrosConsulta().get(PARAMETROS_RUTA.pasoProyecto)),
  );
  protected readonly versionSolicitadaId = computed(() =>
    obtenerVersionIdInformacionProyecto(
      this.parametrosConsulta().get(PARAMETROS_RUTA.versionProyectoId),
    ),
  );
  protected readonly seccionEditando = signal<ClaveSeccionProyecto | null>(null);
  protected readonly modoFormulario = computed(() =>
    this.seccionEditando() === this.pasoActivo()
      ? ModoFormularioProyecto.Edicion
      : ModoFormularioProyecto.Lectura,
  );
  protected readonly prioridades = signal<readonly OpcionCatalogo[]>([]);
  protected readonly mensajeError = MENSAJE_ERROR_CARGA_INFORMACION_PROYECTO;

  public constructor() {
    this.catalogos
      .obtenerOpciones(CATALOGO_PRIORIDADES_PROYECTO)
      .pipe(takeUntilDestroyed())
      .subscribe({ next: (opciones) => this.prioridades.set(opciones) });
    effect(() => {
      const proyectoId = obtenerProyectoIdRuta(this.parametrosRuta());
      if (proyectoId === null) return;
      this.seccionEditando.set(null);
      if (this.proyectoCargadoId !== proyectoId) {
        this.proyectoCargadoId = proyectoId;
        this.estado.cargar(proyectoId, null);
      }
    });
    effect(() => {
      const proyectoId = obtenerProyectoIdRuta(this.parametrosRuta());
      const actual = this.estado.proyectoActual();
      if (proyectoId !== null && actual?.id === proyectoId) {
        this.estado.presentarVersion(this.versionSolicitadaId());
      }
    });
  }

  protected volver(): void {
    void this.router.navigateByUrl(URL_PROYECTOS);
  }

  protected recargar(): void {
    const proyectoId = obtenerProyectoIdRuta(this.parametrosRuta());
    if (proyectoId !== null) this.estado.cargar(proyectoId, this.versionSolicitadaId());
  }

  protected async cambiarPaso(paso: ClavePasoProyecto): Promise<void> {
    if (!(await this.descartarEdicionSiCorresponde())) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [PARAMETROS_RUTA.pasoProyecto]:
          paso === ClavePasoEspecialProyecto.VinculacionAzure ? null : paso,
      },
      queryParamsHandling: 'merge',
    });
  }

  protected async cambiarVersion(versionId: number): Promise<void> {
    if (!(await this.descartarEdicionSiCorresponde())) return;
    const actualId = this.estado.proyectoActual()?.versionId;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [PARAMETROS_RUTA.versionProyectoId]: versionId === actualId ? null : versionId,
      },
      queryParamsHandling: 'merge',
    });
  }

  protected editar(seccion: ClaveSeccionProyecto): void {
    if (!this.estado.proyectoPresentado()?.esVersionActual) return;
    this.seccionEditando.set(seccion);
  }

  protected cancelarEdicion(): void {
    this.seccionEditando.set(null);
  }

  protected guardar(actualizacion: ActualizacionSeccionProyecto): void {
    this.estado.guardar(actualizacion, () => this.cancelarEdicion());
  }

  private async descartarEdicionSiCorresponde(): Promise<boolean> {
    if (this.seccionEditando() === null) return true;
    const descartar = await this.mensajes.confirmar(
      '¿Descartar los cambios?',
      'Los cambios sin guardar de esta sección se perderán.',
      'Descartar cambios',
      'Seguir editando',
    );
    if (descartar) this.cancelarEdicion();
    return descartar;
  }
}
