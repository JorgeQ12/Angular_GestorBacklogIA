import { Injectable, inject } from '@angular/core';
import type { ContextoErrorApi } from '../../../../core/mensajes/models/contexto-error-api.model';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import {
  MENSAJES_GUARDADO_BORRADOR,
  SeccionGuardadoBorrador,
} from '../config/mensajes-guardado-borrador.config';

const TITULO_CONFLICTO_REVISION = 'El borrador cambió';
const DESCRIPCION_CONFLICTO_REVISION =
  'Otra actualización modificó el proyecto. Recarga la información antes de continuar.';

/** Presenta de forma uniforme los errores producidos al guardar el borrador. */
@Injectable({ providedIn: 'root' })
export class NotificadorErroresBorradorProyectoService {
  private readonly notificadorErrores = inject(NotificadorErroresApiService);

  /** Comunica un conflicto de revisión o el error particular de una sección. */
  public comunicar(error: unknown, seccion: SeccionGuardadoBorrador): void {
    const mensaje = MENSAJES_GUARDADO_BORRADOR[seccion];
    const contexto = {
      titulo: mensaje.titulo,
      descripcion: mensaje.descripcion,
      mensajesPorEstado: {
        409: {
          titulo: TITULO_CONFLICTO_REVISION,
          descripcion: DESCRIPCION_CONFLICTO_REVISION,
        },
      },
    } satisfies ContextoErrorApi;

    this.notificadorErrores.comunicar(error, contexto);
  }
}
