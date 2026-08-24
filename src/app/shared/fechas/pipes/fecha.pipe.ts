import { Pipe, PipeTransform, inject } from '@angular/core';
import { FormatoFecha } from '../config/formatos-fecha.config';
import { FormateadorFechaService, ValorFecha } from '../services/formateador-fecha.service';

/** Expone los formatos compartidos de fecha dentro de las plantillas. */
@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  private readonly formateador = inject(FormateadorFechaService);

  public transform(
    valor: ValorFecha,
    formato: FormatoFecha = 'breve',
    alternativa = 'Sin fecha',
  ): string {
    return this.formateador.formatear(valor, formato, alternativa);
  }
}
