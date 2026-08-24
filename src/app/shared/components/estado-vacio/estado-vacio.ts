import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../icono/icono.component';
import { NombreIconoAplicacion } from '../icono/iconos-aplicacion';

/** Presenta la ausencia de contenido mediante un mensaje y una acción opcional. */
@Component({
  selector: 'app-estado-vacio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './estado-vacio.html',
  styleUrl: './estado-vacio.css',
})
export class EstadoVacio {
  /** Selecciona el icono que representa el contexto sin contenido. */
  public readonly icono = input.required<NombreIconoAplicacion>();

  /** Proporciona el mensaje principal del estado vacío. */
  public readonly titulo = input.required<string>();

  /** Proporciona información complementaria cuando resulta necesaria. */
  public readonly descripcion = input<string | null>(null);
}
