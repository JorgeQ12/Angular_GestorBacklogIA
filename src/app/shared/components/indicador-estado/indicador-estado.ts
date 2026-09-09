import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TonoIndicadorEstado =
  'neutral' | 'informativo' | 'positivo' | 'advertencia' | 'critico';

export type PresentacionIndicadorEstado = 'discreta' | 'etiqueta';

/** Representa un estado mediante una apariencia semántica independiente del dominio. */
@Component({
  selector: 'app-indicador-estado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './indicador-estado.html',
  styleUrl: './indicador-estado.css',
})
export class IndicadorEstado {
  /** Proporciona el nombre legible del estado. */
  public readonly texto = input.required<string>();

  /** Selecciona el color semántico sin introducir reglas del dominio. */
  public readonly tono = input<TonoIndicadorEstado>('neutral');

  /** Define si el estado se muestra como texto ligero o como etiqueta delimitada. */
  public readonly presentacion = input<PresentacionIndicadorEstado>('discreta');
}
