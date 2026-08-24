import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { FORMATOS_FECHA, FormatoFecha } from '../config/formatos-fecha.config';

export type ValorFecha = Date | string | number | null | undefined;

const PATRON_FECHA_SIN_HORA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Normaliza y representa fechas de acuerdo con la configuración regional vigente. */
@Injectable({ providedIn: 'root' })
export class FormateadorFechaService {
  private readonly locale = inject(LOCALE_ID);
  private readonly formateadores = new Map<FormatoFecha, Intl.DateTimeFormat>();
  private readonly tiempoRelativo = new Intl.RelativeTimeFormat(this.locale, { numeric: 'always' });
  private readonly tiempoActual = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });

  /** Representa una fecha mediante uno de los formatos compartidos. */
  public formatear(
    valor: ValorFecha,
    formato: FormatoFecha = 'breve',
    alternativa = 'Sin fecha',
  ): string {
    const fecha = this.normalizar(valor);
    return fecha ? this.obtenerFormateador(formato).format(fecha) : alternativa;
  }

  /** Representa el tiempo transcurrido desde una fecha válida. */
  public formatearTiempoRelativo(
    valor: ValorFecha,
    alternativa = 'Sin actividad reciente',
    ahora = Date.now(),
  ): string {
    const fecha = this.normalizar(valor);
    if (!fecha) return alternativa;

    const diferencia = fecha.getTime() - ahora;
    const magnitud = Math.abs(diferencia);

    if (magnitud < 60_000) {
      return this.capitalizar(this.tiempoActual.format(0, 'second'));
    }

    if (magnitud < 3_600_000) {
      return this.formatearDiferencia(diferencia, 60_000, 'minute');
    }

    if (magnitud < 86_400_000) {
      return this.formatearDiferencia(diferencia, 3_600_000, 'hour');
    }

    return this.formatearDiferencia(diferencia, 86_400_000, 'day');
  }

  private obtenerFormateador(formato: FormatoFecha): Intl.DateTimeFormat {
    const existente = this.formateadores.get(formato);
    if (existente) return existente;

    const formateador = new Intl.DateTimeFormat(this.locale, FORMATOS_FECHA[formato]);
    this.formateadores.set(formato, formateador);
    return formateador;
  }

  private normalizar(valor: ValorFecha): Date | null {
    if (valor === null || valor === undefined || valor === '') return null;
    if (valor instanceof Date) return this.esValida(valor) ? valor : null;

    const coincidencia = typeof valor === 'string' ? PATRON_FECHA_SIN_HORA.exec(valor) : null;
    const fecha = coincidencia
      ? new Date(Number(coincidencia[1]), Number(coincidencia[2]) - 1, Number(coincidencia[3]))
      : new Date(valor);

    return this.esValida(fecha) ? fecha : null;
  }

  private formatearDiferencia(
    diferencia: number,
    divisor: number,
    unidad: Intl.RelativeTimeFormatUnit,
  ): string {
    const cantidad = Math.max(1, Math.floor(Math.abs(diferencia) / divisor));
    const valor = diferencia < 0 ? -cantidad : cantidad;
    return this.capitalizar(this.tiempoRelativo.format(valor, unidad));
  }

  private esValida(fecha: Date): boolean {
    return !Number.isNaN(fecha.getTime());
  }

  private capitalizar(valor: string): string {
    return `${valor.charAt(0).toUpperCase()}${valor.slice(1)}`;
  }
}
