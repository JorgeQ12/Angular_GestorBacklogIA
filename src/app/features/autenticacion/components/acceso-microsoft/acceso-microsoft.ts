import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';

/** Presenta la acción que inicia el acceso corporativo mediante Microsoft. */
@Component({
  selector: 'app-acceso-microsoft',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './acceso-microsoft.html',
  styleUrl: './acceso-microsoft.css',
})
export class AccesoMicrosoft {
  /** Indica si la ventana externa de autenticación permanece activa. */
  public readonly autenticando = input(false);

  /** Solicita el inicio del flujo corporativo de autenticación. */
  public readonly iniciarSesion = output<void>();

  /** Notifica la acción únicamente cuando no existe otra solicitud en curso. */
  protected solicitarInicioSesion(): void {
    if (!this.autenticando()) {
      this.iniciarSesion.emit();
    }
  }
}
