import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import type { NombreIconoAplicacion } from '../../../../../shared/components/icono/iconos-aplicacion';
import {
  TEXTOS_PUBLICACION_AZURE_PLANIFICACION,
  obtenerMensajeDisponibilidadPublicacionAzure,
} from '../../config/publicacion-azure-planificacion.config';
import type { DisponibilidadPublicacionAzure } from '../../models/planificacion-proyecto.model';

/** Presenta el estado y la acción principal de publicación en Azure DevOps. */
@Component({
  selector: 'app-publicacion-azure-planificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './publicacion-azure-planificacion.html',
  styleUrl: './publicacion-azure-planificacion.css',
})
export class PublicacionAzurePlanificacionComponent {
  /** Capacidades y bloqueos funcionales informados por el backend. */
  public readonly disponibilidad = input.required<DisponibilidadPublicacionAzure>();
  /** Indica que la publicación está en curso. */
  public readonly procesando = input(false);
  /** Aplica un bloqueo adicional decidido por el contenedor. */
  public readonly deshabilitado = input(false);
  /** Solicita publicar la planificación en Azure DevOps. */
  public readonly publicar = output<void>();

  protected readonly textos = TEXTOS_PUBLICACION_AZURE_PLANIFICACION;
  protected readonly mensaje = computed(() =>
    this.procesando()
      ? this.textos.procesando
      : obtenerMensajeDisponibilidadPublicacionAzure(this.disponibilidad()),
  );
  protected readonly estaDeshabilitado = computed(
    () => this.deshabilitado() || this.procesando() || !this.disponibilidad().puedePublicar,
  );
  protected readonly etiquetaAccesible = computed(() => `${this.textos.titulo}. ${this.mensaje()}`);
  protected readonly iconoEstado = computed<NombreIconoAplicacion>(() =>
    this.disponibilidad().puedePublicar ? 'continuar' : 'bloqueado',
  );
}
