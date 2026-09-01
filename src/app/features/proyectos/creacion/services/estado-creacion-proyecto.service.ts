import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, of, shareReplay, tap, throwError } from 'rxjs';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { AVANCE_BORRADOR_POR_PASO } from '../config/avance-borrador-proyecto.config';
import { ActualizacionSeccionProyecto } from '../../models/actualizacion-seccion-proyecto.model';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { CreacionProyectoService } from './creacion-proyecto.service';

/** Conserva el borrador y su revisión mientras permanece activo el recorrido. */
@Injectable()
export class EstadoCreacionProyectoService {
  private readonly creacionProyecto = inject(CreacionProyectoService);
  private readonly estadoProyectoId = signal<number | null>(null);
  private readonly estadoBorrador = signal<BorradorProyecto | null>(null);
  private readonly estadoNombreProyecto = signal('');
  private proyectoIdActivo: number | null = null;
  private cargaEnCurso: Observable<BorradorProyecto> | null = null;

  /** Expone la fotografía vigente sin permitir su modificación externa. */
  public readonly borrador = this.estadoBorrador.asReadonly();

  /** Expone el proyecto seleccionado por la página contenedora. */
  public readonly proyectoId = this.estadoProyectoId.asReadonly();

  /** Expone el nombre vigente para identificar el recorrido. */
  public readonly nombreProyecto = this.estadoNombreProyecto.asReadonly();

  /** Prepara el estado para el proyecto indicado y descarta la fotografía anterior. */
  public seleccionarProyecto(proyectoId: number | null): void {
    if (this.proyectoIdActivo === proyectoId) return;

    this.proyectoIdActivo = proyectoId;
    this.estadoProyectoId.set(proyectoId);
    this.cargaEnCurso = null;
    this.estadoBorrador.set(null);
    this.estadoNombreProyecto.set('');
  }

  /** Recupera el borrador una sola vez para los componentes del recorrido. */
  public cargar(proyectoId: number): Observable<BorradorProyecto> {
    this.seleccionarProyecto(proyectoId);
    const vigente = this.estadoBorrador();
    if (vigente?.id === proyectoId) return of(vigente);
    if (this.cargaEnCurso) return this.cargaEnCurso;

    const solicitud = this.creacionProyecto.obtenerBorrador(proyectoId).pipe(
      tap((borrador) => {
        if (this.proyectoIdActivo !== proyectoId) return;

        this.estadoBorrador.set(borrador);
        this.estadoNombreProyecto.set(borrador.contexto.nombre.trim());
      }),
      finalize(() => {
        if (this.cargaEnCurso === solicitud) this.cargaEnCurso = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.cargaEnCurso = solicitud;
    return solicitud;
  }

  /** Conserva el nombre escrito para identificar el proyecto durante el recorrido. */
  public actualizarNombreProyecto(nombre: string): void {
    this.estadoNombreProyecto.set(nombre.trim());
  }

  /** Guarda una sección y conserva la revisión devuelta para el recorrido. */
  public guardarSeccion(actualizacion: ActualizacionSeccionProyecto): Observable<BorradorProyecto> {
    const vigente = this.estadoBorrador();
    if (!vigente) return throwError(() => new Error('El borrador todavía no está disponible.'));

    const proyectoId = vigente.id;
    const avanceSeccion = AVANCE_BORRADOR_POR_PASO[actualizacion.seccion];
    const pasoActual = Math.max(vigente.pasoActual, avanceSeccion + 1);
    return this.creacionProyecto.actualizarBorrador(vigente, actualizacion, pasoActual).pipe(
      tap((borrador) => {
        if (this.proyectoIdActivo !== proyectoId) return;

        this.estadoBorrador.set(borrador);
        if (actualizacion.seccion === ClaveSeccionProyecto.Contexto) {
          this.estadoNombreProyecto.set(borrador.contexto.nombre.trim());
        }
      }),
    );
  }
}
