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

  /** Proporciona acceso al servicio de autenticación. */
  private readonly autenticacion = inject(AutenticacionService);

  /** Proporciona acceso al servicio de navegación panel. */
  private readonly navegacionPanel = inject(NavegacionPanelService);

  /** Conserva ruta inicio para coordinar esta responsabilidad. */
  protected readonly rutaInicio = URL_PANEL;

  /** Conserva items navegación para coordinar esta responsabilidad. */
  protected readonly itemsNavegacion = this.navegacionPanel.itemsVisibles;

  /** Conserva barra lateral colapsada como estado reactivo de la instancia. */
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
