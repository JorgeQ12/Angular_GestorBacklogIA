import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutenticacionService } from '../../core/autenticacion/services/autenticacion.service';
import { URL_PANEL } from '../../core/navegacion/rutas';
import { BarraLateralPanel } from './components/barra-lateral-panel/barra-lateral-panel';
import { NavegacionPanelService } from './services/navegacion-panel.service';

/** Compone la navegación persistente y el contenido de las rutas del panel. */
@Component({
  selector: 'app-panel-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, BarraLateralPanel],
  providers: [NavegacionPanelService],
  templateUrl: './panel-layout.html',
  styleUrl: './panel-layout.css',
})
export class PanelLayout {
  private readonly autenticacion = inject(AutenticacionService);
  private readonly navegacionPanel = inject(NavegacionPanelService);

  protected readonly rutaInicio = URL_PANEL;
  protected readonly itemsNavegacion = this.navegacionPanel.itemsVisibles;
  protected readonly barraLateralColapsada = signal(false);

  /** Gestiona la presentación completa o compacta de la navegación. */
  protected alternarBarraLateral(): void {
    this.barraLateralColapsada.update((colapsada) => !colapsada);
  }

  /** Finaliza la sesión del usuario desde la navegación principal. */
  protected cerrarSesion(): void {
    this.autenticacion.cerrarSesion();
  }
}
