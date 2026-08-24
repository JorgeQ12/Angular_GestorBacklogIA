import { Directive, Input } from '@angular/core';
import { MensajesError, MensajesFormulario } from '../models/mensajes-error.model';

/** Proporciona a los controles descendientes los mensajes específicos del formulario. */
@Directive({
  selector: 'form[appMensajesFormulario]',
  standalone: true,
})
export class MensajesFormularioDirective {
  /** Define los mensajes específicos de los campos del formulario. */
  @Input({ required: true }) public appMensajesFormulario: MensajesFormulario = {};

  /** Proporciona los mensajes correspondientes a un campo. */
  public obtenerMensajes(campo: string | number | null): MensajesError | undefined {
    if (campo === null) {
      return undefined;
    }

    return this.appMensajesFormulario[String(campo)];
  }
}
