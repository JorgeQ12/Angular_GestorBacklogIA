import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../../../core/autenticacion/services/autenticacion.service';
import { EncabezadoPagina } from '../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { FechaPipe } from '../../../../shared/fechas/pipes/fecha.pipe';
import { BorradoresRecientes } from '../../components/borradores-recientes/borradores-recientes';
import { EstadoProyectos } from '../../components/estado-proyectos/estado-proyectos';
import { IndicadoresProyectos } from '../../components/indicadores-proyectos/indicadores-proyectos';
import { ProyectosAtencion } from '../../components/proyectos-atencion/proyectos-atencion';
import { ProyectosRecientes } from '../../components/proyectos-recientes/proyectos-recientes';
import {
  BorradorInicioPanel,
  EstadoProyecto,
  ProyectoInicioPanel,
  RESUMEN_INICIO_PANEL_VACIO,
} from '../../models/resumen-inicio-panel.model';
import { ResumenInicioPanelService } from '../../services/resumen-inicio-panel.service';

/** Compone el resumen operativo disponible para el usuario vigente. */
@Component({
  selector: 'app-pagina-inicio-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EncabezadoPagina,
    EstadoError,
    IconoComponent,
    FechaPipe,
    IndicadoresProyectos,
    EstadoProyectos,
    ProyectosAtencion,
    ProyectosRecientes,
    BorradoresRecientes,
  ],
  templateUrl: './pagina-inicio-panel.html',
  styleUrl: './pagina-inicio-panel.css',
})
export class PaginaInicioPanel {
  private readonly autenticacion = inject(AutenticacionService);
  private readonly resumenService = inject(ResumenInicioPanelService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hoy = new Date();

  protected readonly resumen = signal(RESUMEN_INICIO_PANEL_VACIO);
  protected readonly errorResumen = signal(false);

  protected readonly descripcionBienvenida = computed(() => {
    const primerNombre = this.obtenerPrimerNombre(this.autenticacion.sesionActual()?.nombre);
    const saludo = primerNombre ? `Hola, ${primerNombre}. ` : '';
    return `${saludo}Revisa el estado de tus proyectos y continúa con tus actividades.`;
  });

  protected readonly fechaContexto = computed(() => this.resumen().fechaCorte ?? this.hoy);

  public constructor() {
    this.cargarResumen();
  }

  /** Renueva el resumen administrativo presentado en el inicio. */
  protected cargarResumen(): void {
    this.errorResumen.set(false);

    this.resumenService
      .obtenerResumen()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resumen) => this.resumen.set(resumen),
        error: () => this.errorResumen.set(true),
      });
  }

  /** Conserva el punto de entrada hacia la creación de proyectos. */
  protected crearProyecto(): void {
    // TODO: Navegar al flujo de creación cuando su ruta sea migrada.
  }

  /** Conserva el punto de entrada hacia los proyectos disponibles. */
  protected verProyectos(_estado?: EstadoProyecto): void {
    // TODO: Navegar a los proyectos cuando su ruta sea migrada.
  }

  /** Conserva el punto de entrada hacia el detalle de un proyecto. */
  protected abrirProyecto(proyecto: ProyectoInicioPanel): void {
    void this.router.navigate(['/panel/proyectos', proyecto.id]);
  }

  /** Conserva el punto de entrada hacia la definición pendiente. */
  protected continuarBorrador(_borrador: BorradorInicioPanel): void {
    // TODO: Navegar al flujo de definición cuando su ruta sea migrada.
  }

  private obtenerPrimerNombre(nombre: string | null | undefined): string | null {
    const primerNombre = nombre?.trim().split(/\s+/)[0];
    return primerNombre ? `${primerNombre.charAt(0).toUpperCase()}${primerNombre.slice(1)}` : null;
  }
}
