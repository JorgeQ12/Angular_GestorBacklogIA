import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../../../core/mensajes/services/notificador-errores-api.service';
import { crearUrlFlujoProyecto } from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { ERROR_SINCRONIZACION_EQUIPO } from '../../../config/mensajes-error-creacion-proyecto.config';
import { FormularioEquipoProyecto } from '../../../../secciones/equipo/components/formulario-equipo-proyecto/formulario-equipo-proyecto';
import {
  combinarEquipoConAzure,
  deserializarEquipoProyecto,
} from '../../../../secciones/equipo/mappers/equipo-proyecto.mapper';
import {
  type EquipoProyecto,
  type OrigenEquipoAzureProyecto,
  type ProgresoEquipoProyecto,
} from '../../../../secciones/equipo/models/equipo-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';
import {
  ContenidoEncabezadoPasoCreacionService,
  type ContenidoEncabezadoPasoCreacion,
} from '../../../services/contenido-encabezado-paso-creacion.service';
import { CreacionProyectoService } from '../../../services/creacion-proyecto.service';

/** Coordina Equipo dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-equipo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioEquipoProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './pagina-equipo-proyecto.html',
  styleUrl: './pagina-equipo-proyecto.css',
})
export class PaginaEquipoProyecto {
  private readonly creacionProyecto = inject(CreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly encabezadoPaso = inject(ContenidoEncabezadoPasoCreacionService);
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);

  private readonly formularioEquipo = viewChild(FormularioEquipoProyecto);

  private readonly origenActualizado = signal<OrigenEquipoAzureProyecto | null>(null);
  private readonly equipoActualizado = signal<EquipoProyecto | null>(null);
  private readonly progresoEditado = signal<ProgresoEquipoProyecto | null>(null);
  private sincronizacionInicialSolicitada = false;

  private readonly origenEquipo = computed(
    () => this.origenActualizado() ?? this.paso.borrador()?.equipoAzure ?? null,
  );
  private readonly equipoGuardado = computed<EquipoProyecto>(() => {
    const borrador = this.paso.borrador();
    return borrador
      ? (deserializarEquipoProyecto(borrador.equipoJson) ?? { integrantes: [] })
      : { integrantes: [] };
  });

  protected readonly sincronizando = signal(false);
  protected readonly equipo = computed<EquipoProyecto>(() => {
    const actualizado = this.equipoActualizado();
    if (actualizado) return actualizado;

    const guardado = this.equipoGuardado();
    const origen = this.origenEquipo();
    return origen ? combinarEquipoConAzure(origen, guardado) : guardado;
  });

  private readonly nombreEquipo = computed(
    () => this.origenEquipo()?.nombreEquipo || 'Team de Azure DevOps',
  );
  private readonly progresoEquipo = computed<ProgresoEquipoProyecto>(() => {
    const editado = this.progresoEditado();
    if (editado) return editado;

    const integrantes = this.equipo().integrantes;
    const configurados = integrantes.filter(
      (integrante) => integrante.perfilTecnicoCodigo && integrante.dedicacionCodigo,
    ).length;
    return { configurados, pendientes: integrantes.length - configurados };
  });
  private readonly textoProgreso = computed(() => {
    const progreso = this.progresoEquipo();
    return `${progreso.configurados} configurados · ${progreso.pendientes} pendientes`;
  });
  private readonly textoSincronizacion = computed(() =>
    this.sincronizando() ? 'Sincronizando' : 'Actualizar desde Azure',
  );
  private readonly accionDeshabilitada = computed(
    () => this.sincronizando() || this.paso.procesando(),
  );
  private readonly contenidoEncabezado: ContenidoEncabezadoPasoCreacion = {
    iconoDetalle: 'azureDevOps',
    detallePrincipal: this.nombreEquipo,
    detalleSecundario: this.textoProgreso,
    accion: {
      icono: 'reintentar',
      texto: this.textoSincronizacion,
      deshabilitada: this.accionDeshabilitada,
      ejecutar: () => this.solicitarSincronizacionDesdeEncabezado(),
    },
  };

  public constructor() {
    effect(() => this.sincronizarAlCargar());
    this.encabezadoPaso.registrar(this.contenidoEncabezado);
    this.destroyRef.onDestroy(() => this.encabezadoPaso.limpiar(this.contenidoEncabezado));
    this.paso.cargar();
  }

  /** Mantiene el avance del encabezado alineado con la edición vigente. */
  protected actualizarProgreso(progreso: ProgresoEquipoProyecto): void {
    this.progresoEditado.set(progreso);
  }

  /** Completa Equipo para continuar hacia Flujo de usuario. */
  protected guardarEquipo(equipo: EquipoProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Equipo, datos: equipo },
      crearUrlFlujoProyecto,
    );
  }

  /** Proporciona la membresía vigente al ingresar en Equipo. */
  private sincronizarAlCargar(): void {
    if (!this.paso.contenidoListo() || this.sincronizacionInicialSolicitada) return;

    this.sincronizacionInicialSolicitada = true;
    const guardado = this.equipoGuardado();
    if (guardado.integrantes.length > 0) return;

    this.sincronizarEquipo(guardado);
  }

  /** Conserva la edición local durante una actualización manual. */
  private solicitarSincronizacionDesdeEncabezado(): void {
    const equipoVigente = this.formularioEquipo()?.obtenerDatosVigentes() ?? this.equipo();
    this.sincronizarEquipo(equipoVigente);
  }

  /** Mantiene la membresía local alineada con Azure DevOps. */
  private sincronizarEquipo(equipoVigente: EquipoProyecto): void {
    if (this.sincronizando()) return;

    this.sincronizando.set(true);
    this.creacionProyecto
      .sincronizarEquipoAzure(this.paso.proyectoId)
      .pipe(
        finalize(() => this.sincronizando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (origen) => {
          this.origenActualizado.set(origen);
          this.equipoActualizado.set(combinarEquipoConAzure(origen, equipoVigente));
          this.progresoEditado.set(null);
        },
        error: (error: unknown) =>
          this.notificadorErrores.comunicar(error, ERROR_SINCRONIZACION_EQUIPO),
      });
  }
}
