import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import {
  MENSAJES_GUARDADO_BORRADOR,
  SeccionGuardadoBorrador,
} from '../config/mensajes-guardado-borrador.config';

const ESTADO_CONFLICTO_REVISION = 409;
const TITULO_CONFLICTO_REVISION = 'El borrador cambió';
const DESCRIPCION_CONFLICTO_REVISION =
  'Otra actualización modificó el proyecto. Recarga la información antes de continuar.';

/** Presenta de forma uniforme los errores producidos al guardar el borrador. */
@Injectable({ providedIn: 'root' })
export class NotificadorErroresBorradorProyectoService {
  private readonly mensajes = inject(MensajesService);

  /** Comunica un conflicto de revisión o el error particular de una sección. */
  public comunicar(error: unknown, seccion: SeccionGuardadoBorrador): void {
    const conflicto =
      error instanceof HttpErrorResponse && error.status === ESTADO_CONFLICTO_REVISION;
    const mensaje = MENSAJES_GUARDADO_BORRADOR[seccion];

    void this.mensajes.error(
      conflicto ? TITULO_CONFLICTO_REVISION : mensaje.titulo,
      conflicto ? DESCRIPCION_CONFLICTO_REVISION : mensaje.descripcion,
    );
  }
}
