import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { ItemNavegacionPanel } from '../../models/item-navegacion-panel.model';

/** Presenta la marca y las opciones disponibles de la navegación principal. */
@Component({
  selector: 'app-barra-lateral-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconoComponent],
  templateUrl: './barra-lateral-panel.html',
  styleUrl: './barra-lateral-panel.css',
})
export class BarraLateralPanel {
  /** Define las opciones que puede consultar el usuario. */
  public readonly items = input.required<readonly ItemNavegacionPanel[]>();

  /** Proporciona el destino principal de la marca. */
  public readonly rutaInicio = input.required<string>();

  /** Indica si la navegación utiliza su presentación compacta. */
  public readonly colapsada = input(false);

  /** Solicita el cambio entre las presentaciones completa y compacta. */
  public readonly alternarColapso = output<void>();

  /** Solicita finalizar la sesión vigente. */
  public readonly cerrarSesion = output<void>();

  /** Gestiona la solicitud de cambio de la barra lateral. */
  protected solicitarAlternancia(): void {
    this.alternarColapso.emit();
  }

  /** Gestiona la solicitud de salida del aplicativo. */
  protected solicitarCierreSesion(): void {
    this.cerrarSesion.emit();
  }
}
