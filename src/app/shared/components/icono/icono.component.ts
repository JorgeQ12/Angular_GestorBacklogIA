import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { ICONOS_APLICACION, NombreIconoAplicacion } from './iconos-aplicacion';

/** Renderiza iconos del catálogo compartido con una semántica uniforme. */
@Component({
  selector: 'app-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  template: `
    <svg
      [lucideIcon]="datosIcono()"
      [title]="etiqueta()"
      [strokeWidth]="1.8"
      [attr.aria-hidden]="etiqueta() ? null : 'true'"
      [attr.aria-label]="etiqueta()"
      [attr.role]="etiqueta() ? 'img' : null"
      focusable="false"
    ></svg>
  `,
  styleUrl: './icono.component.css',
})
export class IconoComponent {
  /** Selecciona el icono semántico que se presentará. */
  public readonly nombre = input.required<NombreIconoAplicacion>();

  /** Proporciona una descripción cuando el icono comunica información. */
  public readonly etiqueta = input<string | null>(null);

  /** Resuelve la definición gráfica asociada al nombre solicitado. */
  protected readonly datosIcono = computed(() => ICONOS_APLICACION[this.nombre()]);
}
