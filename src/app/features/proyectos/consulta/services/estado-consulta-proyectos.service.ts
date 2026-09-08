import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import type { ConsultaProyectos } from '../models/consulta-proyectos.model';
import type { PaginaProyectos } from '../models/resumen-proyecto.model';
import { ConsultaProyectosService } from './consulta-proyectos.service';

/** Conserva el estado remoto únicamente durante la permanencia en la consulta. */
@Injectable()
export class EstadoConsultaProyectosService {
  private readonly consultaProyectos = inject(ConsultaProyectosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly estadoPagina = signal<PaginaProyectos | null>(null);
  private readonly estadoErrorCarga = signal(false);
  private consultaActual: Subscription | null = null;
  private ultimaConsulta: ConsultaProyectos | null = null;

  /** Expone la página confirmada por el backend. */
  public readonly pagina = this.estadoPagina.asReadonly();

  /** Indica si el contenido vigente debe permitir un reintento. */
  public readonly errorCarga = this.estadoErrorCarga.asReadonly();

  /** Reemplaza la consulta vigente y descarta cualquier respuesta anterior. */
  public consultar(consulta: ConsultaProyectos): void {
    this.ultimaConsulta = consulta;
    this.consultaActual?.unsubscribe();
    this.estadoPagina.set(null);
    this.estadoErrorCarga.set(false);
    this.consultaActual = this.consultaProyectos
      .obtenerProyectos(consulta)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pagina) => this.estadoPagina.set(pagina),
        error: () => this.estadoErrorCarga.set(true),
      });
  }

  /** Repite la última consulta solicitada por la página. */
  public reintentar(): void {
    if (this.ultimaConsulta) this.consultar(this.ultimaConsulta);
  }
}
