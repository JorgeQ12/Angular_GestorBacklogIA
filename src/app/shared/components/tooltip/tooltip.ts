import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../icono/icono.component';

/** Posiciones admitidas respecto del elemento que activa la ayuda. */
export type PosicionTooltip = 'superior' | 'inferior' | 'derecha' | 'izquierda';

let secuenciaTooltip = 0;

/** Presenta ayuda contextual accesible mediante puntero, foco y teclado. */
@Component({
  selector: 'app-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
})
export class Tooltip {
  /** Contenido breve que amplía el contexto del elemento asociado. */
  public readonly texto = input.required<string>();

  /** Ubica la ayuda respecto del botón que la activa. */
  public readonly posicion = input<PosicionTooltip>('superior');

  /** Nombra la acción para tecnologías de asistencia. */
  public readonly etiqueta = input('Más información');

  /** Conserva ID tooltip para coordinar esta responsabilidad. */
  protected readonly idTooltip = `tooltip-${++secuenciaTooltip}`;

  /** Descarta la ayuda enfocada sin propagar Escape a contenedores como modales. */
  protected cerrarConEscape(evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
    (evento.currentTarget as HTMLButtonElement).blur();
  }
}
