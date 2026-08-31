import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import type { ConsultaListadoProyectos } from '../models/consulta-listado-proyectos.model';
import type { PaginaListadoProyectos } from '../models/proyecto-listado.model';
import { ListadoProyectosService } from './listado-proyectos.service';

/** Conserva el estado remoto únicamente durante la permanencia en el listado. */
@Injectable()
export class EstadoListadoProyectosService {
  private readonly listadoProyectos = inject(ListadoProyectosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly estadoPagina = signal<PaginaListadoProyectos | null>(null);
  private readonly estadoErrorCarga = signal(false);
  private consultaActual: Subscription | null = null;
  private ultimaConsulta: ConsultaListadoProyectos | null = null;

  /** Expone la página confirmada por el backend. */
  public readonly pagina = this.estadoPagina.asReadonly();

  /** Indica si el contenido vigente debe permitir un reintento. */
  public readonly errorCarga = this.estadoErrorCarga.asReadonly();

  /** Reemplaza la consulta vigente y descarta cualquier respuesta anterior. */
  public consultar(consulta: ConsultaListadoProyectos): void {
    this.ultimaConsulta = consulta;
    this.consultaActual?.unsubscribe();
    this.estadoPagina.set(null);
    this.estadoErrorCarga.set(false);
    this.consultaActual = this.listadoProyectos
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
