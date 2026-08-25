import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Modal, type RolModal } from '../../../../shared/components/modal/modal';
import type { NombreIconoAplicacion } from '../../../../shared/components/icono/iconos-aplicacion';
import type { VarianteMensaje } from '../../models/mensaje.model';
import { MensajesService } from '../../services/mensajes.service';

const ICONO_POR_VARIANTE = {
  informacion: 'informacion',
  exito: 'completado',
  advertencia: 'alerta',
  error: 'error',
  confirmacion: 'completado',
  destructiva: 'eliminar',
} satisfies Record<VarianteMensaje, NombreIconoAplicacion>;

/** Representa el mensaje global vigente sobre el contenedor modal compartido. */
@Component({
  selector: 'app-modal-mensaje',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal],
  templateUrl: './modal-mensaje.html',
  styleUrl: './modal-mensaje.css',
})
export class ModalMensaje {
  protected readonly mensajes = inject(MensajesService);
  protected readonly mensaje = this.mensajes.mensajeActual;
  protected readonly iconoPorVariante = ICONO_POR_VARIANTE;

  /** Selecciona el rol accesible correspondiente a la urgencia del mensaje. */
  protected obtenerRol(variante: VarianteMensaje): RolModal {
    return variante === 'error' || variante === 'destructiva' ? 'alertdialog' : 'dialog';
  }

  /** Resuelve el cierre según el mensaje permita descartarse o requiera cancelación. */
  protected gestionarCierre(): void {
    if (this.mensaje()?.descartable) {
      this.mensajes.descartar();
    } else {
      this.mensajes.cancelar();
    }
  }
}
