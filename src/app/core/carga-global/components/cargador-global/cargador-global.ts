import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CargaGlobalService } from '../../services/carga-global.service';

/** Presenta el estado global de carga sobre el contenido de la aplicación. */
@Component({
  selector: 'app-cargador-global',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cargador-global.html',
  styleUrl: './cargador-global.css',
})
export class CargadorGlobal {

  /** Proporciona acceso al servicio de carga global. */
  protected readonly visible = inject(CargaGlobalService).visible;
}
