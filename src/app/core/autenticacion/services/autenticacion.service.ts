import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, Subscription, catchError, map, of, tap, throwError } from 'rxjs';
import {
  ENDPOINTS_AUTENTICACION,
  NOMBRE_VENTANA_AUTENTICACION,
} from '../config/autenticacion.config';
import { SesionUsuario } from '../models/sesion-usuario.model';

const ANCHO_VENTANA_AUTENTICACION = 520;
const ALTO_VENTANA_AUTENTICACION = 720;
const INTERVALO_COMPROBACION_RETORNO = 400;

/** Coordina el acceso externo y la sesión mantenida por Kong. */
@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly http = inject(HttpClient);
  private readonly documento = inject(DOCUMENT);
  private readonly sesion = signal<SesionUsuario | null>(null);

  /** Expone la última sesión confirmada por el backend. */
  public readonly sesionActual = this.sesion.asReadonly();

  /** Abre el acceso de Microsoft y notifica su retorno al origen de la aplicación. */
  public iniciarSesionConMicrosoft(): Observable<void> {
    return new Observable((observador) => {
      const ventana = this.obtenerVentana();
      const ventanaAutenticacion = ventana.open(
        ENDPOINTS_AUTENTICACION.iniciarSesion,
        NOMBRE_VENTANA_AUTENTICACION,
        this.construirCaracteristicasVentana(ventana),
      );

      if (!ventanaAutenticacion) {
        ventana.location.assign(ENDPOINTS_AUTENTICACION.iniciarSesion);
        observador.complete();
        return;
      }

      let comprobacionSesion: Subscription | null = null;
      const temporizador = ventana.setInterval(() => {
        if (ventanaAutenticacion.closed) {
          ventana.clearInterval(temporizador);
          comprobacionSesion = this.verificarSesion().subscribe({
            next: () => {
              observador.next();
              observador.complete();
            },
            error: () => observador.complete(),
          });
          return;
        }

        try {
          const retornoAlOrigen =
            ventanaAutenticacion.location.href !== 'about:blank' &&
            ventanaAutenticacion.location.origin === ventana.location.origin;

          if (retornoAlOrigen) {
            ventanaAutenticacion.close();
            observador.next();
            observador.complete();
          }
        } catch {
          // El navegador impide inspeccionar la ventana mientras permanece en otro origen.
        }
      }, INTERVALO_COMPROBACION_RETORNO);

      return () => {
        ventana.clearInterval(temporizador);
        comprobacionSesion?.unsubscribe();
      };
    });
  }

  /** Consulta la sesión después de que la aplicación ha ingresado al panel. */
  public verificarSesion(): Observable<SesionUsuario> {
    return this.http
      .get(ENDPOINTS_AUTENTICACION.sesionActual, {
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        map((respuesta) => this.exigirSesion(respuesta.headers)),
        catchError((error: unknown) => {
          const sesion =
            error instanceof HttpErrorResponse ? this.obtenerSesion(error.headers) : null;

          return sesion ? of(sesion) : throwError(() => error);
        }),
        tap({
          next: (sesion) => this.sesion.set(sesion),
          error: () => this.sesion.set(null),
        }),
      );
  }

  private exigirSesion(headers: HttpHeaders): SesionUsuario {
    const sesion = this.obtenerSesion(headers);

    if (!sesion) {
      throw new Error('La respuesta de Kong no contiene el header X-User-Name.');
    }

    return sesion;
  }

  private obtenerSesion(headers: HttpHeaders): SesionUsuario | null {
    const nombre = headers.get('X-User-Name')?.trim();
    return nombre ? { nombre } : null;
  }

  /** Delega a Kong la finalización de la sesión vigente. */
  public cerrarSesion(): void {
    this.sesion.set(null);
    this.obtenerVentana().location.assign(ENDPOINTS_AUTENTICACION.cerrarSesion);
  }

  private obtenerVentana(): Window {
    const ventana = this.documento.defaultView;

    if (!ventana) {
      throw new Error('La autenticación requiere un entorno de navegador.');
    }

    return ventana;
  }

  private construirCaracteristicasVentana(ventana: Window): string {
    const izquierda = Math.max(
      0,
      ventana.screenX + (ventana.outerWidth - ANCHO_VENTANA_AUTENTICACION) / 2,
    );
    const superior = Math.max(
      0,
      ventana.screenY + (ventana.outerHeight - ALTO_VENTANA_AUTENTICACION) / 2,
    );

    return [
      'popup=yes',
      `width=${ANCHO_VENTANA_AUTENTICACION}`,
      `height=${ALTO_VENTANA_AUTENTICACION}`,
      `left=${Math.round(izquierda)}`,
      `top=${Math.round(superior)}`,
    ].join(',');
  }
}
