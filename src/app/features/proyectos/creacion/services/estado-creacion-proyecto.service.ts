import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, tap, throwError } from 'rxjs';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { AVANCE_BORRADOR_POR_PASO } from '../config/pasos-creacion-proyecto.config';
import { ActualizacionSeccionBorrador } from '../models/actualizacion-seccion-borrador.model';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { CreacionProyectoService } from './creacion-proyecto.service';

/** Conserva el borrador y su revisión mientras permanece activo el recorrido. */
@Injectable()
export class EstadoCreacionProyectoService {
  private readonly creacionProyecto = inject(CreacionProyectoService);
  private readonly estadoBorrador = signal<BorradorProyecto | null>(null);
  private readonly estadoNombreProyecto = signal('');

  /** Expone la fotografía vigente sin permitir su modificación externa. */
  public readonly borrador = this.estadoBorrador.asReadonly();

  /** Expone el nombre vigente para identificar el recorrido. */
  public readonly nombreProyecto = this.estadoNombreProyecto.asReadonly();

  /** Recupera el borrador una sola vez para las páginas hijas del recorrido. */
  public cargar(proyectoId: number): Observable<BorradorProyecto> {
    const vigente = this.estadoBorrador();
    if (vigente?.id === proyectoId) return of(vigente);

    return this.creacionProyecto.obtenerBorrador(proyectoId).pipe(
      tap((borrador) => {
        this.estadoBorrador.set(borrador);
        this.estadoNombreProyecto.set(borrador.contexto.nombre.trim());
      }),
    );
  }

  /** Conserva el nombre escrito para identificar el proyecto durante el recorrido. */
  public actualizarNombreProyecto(nombre: string): void {
    this.estadoNombreProyecto.set(nombre.trim());
  }

  /** Guarda una sección y conserva la revisión devuelta para el recorrido. */
  public guardarSeccion(actualizacion: ActualizacionSeccionBorrador): Observable<BorradorProyecto> {
    const vigente = this.estadoBorrador();
    if (!vigente) return throwError(() => new Error('El borrador todavía no está disponible.'));

    const avanceSeccion = AVANCE_BORRADOR_POR_PASO[actualizacion.seccion];
    const pasoActual = Math.max(vigente.pasoActual, avanceSeccion + 1);
    return this.creacionProyecto.actualizarBorrador(vigente, actualizacion, pasoActual).pipe(
      tap((borrador) => {
        this.estadoBorrador.set(borrador);
        if (actualizacion.seccion === ClaveSeccionProyecto.Contexto) {
          this.estadoNombreProyecto.set(borrador.contexto.nombre.trim());
        }
      }),
    );
  }
}
