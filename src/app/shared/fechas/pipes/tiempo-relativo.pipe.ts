import { Pipe, PipeTransform, inject } from '@angular/core';
import { FormateadorFechaService, ValorFecha } from '../services/formateador-fecha.service';

/** Expone el tiempo transcurrido desde una fecha dentro de las plantillas. */
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  private readonly formateador = inject(FormateadorFechaService);

  public transform(valor: ValorFecha, alternativa = 'Sin actividad reciente'): string {
    return this.formateador.formatearTiempoRelativo(valor, alternativa);
  }
}
