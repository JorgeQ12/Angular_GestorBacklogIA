import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Modal, type RolModal } from '../../../../shared/components/modal/modal';
import type { NombreIconoAplicacion } from '../../../../shared/components/icono/iconos-aplicacion';
import { VarianteMensaje } from '../../models/mensaje.model';
import { MensajesService } from '../../services/mensajes.service';

const ICONO_POR_VARIANTE = {
  [VarianteMensaje.Informacion]: 'informacion',
  [VarianteMensaje.Exito]: 'completado',
  [VarianteMensaje.Advertencia]: 'alerta',
  [VarianteMensaje.Error]: 'error',
  [VarianteMensaje.Confirmacion]: 'completado',
  [VarianteMensaje.Destructiva]: 'eliminar',
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
  protected readonly variantes = VarianteMensaje;

  /** Selecciona el rol accesible correspondiente a la urgencia del mensaje. */
  protected obtenerRol(variante: VarianteMensaje): RolModal {
    return variante === VarianteMensaje.Error || variante === VarianteMensaje.Destructiva
      ? 'alertdialog'
      : 'dialog';
  }
}
