import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AutenticacionService } from '../../../../core/autenticacion/services/autenticacion.service';
import { URL_PANEL } from '../../../../core/navegacion/rutas';
import { AccesoMicrosoft } from '../../components/acceso-microsoft/acceso-microsoft';

/** Presenta el acceso y conecta el formulario con el flujo de autenticación. */
@Component({
  selector: 'app-pagina-inicio-sesion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccesoMicrosoft],
  templateUrl: './pagina-inicio-sesion.html',
  styleUrl: './pagina-inicio-sesion.css',
})
export class PaginaInicioSesion {

  /** Proporciona acceso al servicio de autenticación. */
  private readonly autenticacion = inject(AutenticacionService);

  /** Proporciona acceso a la navegación administrada por Angular. */
  private readonly router = inject(Router);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destroyRef = inject(DestroyRef);

  /** Conserva autenticando como estado reactivo de la instancia. */
  protected readonly autenticando = signal(false);

  /** Coordina la ventana externa y continúa hacia el panel cuando regresa al aplicativo. */
  protected iniciarSesionConMicrosoft(): void {
    if (this.autenticando()) {
      return;
    }

    this.autenticando.set(true);

    this.autenticacion
      .iniciarSesionConMicrosoft()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.autenticando.set(false)),
      )
      .subscribe(() => void this.router.navigateByUrl(URL_PANEL));
  }
}
