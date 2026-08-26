import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, tap, throwError } from 'rxjs';
import { ContextoProyecto } from '../../secciones/contexto/models/contexto-proyecto.model';
import { AlcanceProyecto } from '../../secciones/alcance/models/alcance-proyecto.model';
import { NecesidadProyecto } from '../../secciones/necesidad/models/necesidad-proyecto.model';
import { ObjetivosProyecto } from '../../secciones/objetivos/models/objetivos-proyecto.model';
import { TipoSolucionProyecto } from '../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { CreacionProyectoService } from './creacion-proyecto.service';

const PASO_CONTEXTO_COMPLETADO = 2;
const PASO_TIPO_SOLUCION_COMPLETADO = 3;
const PASO_NECESIDAD_COMPLETADO = 4;
const PASO_OBJETIVOS_COMPLETADO = 5;
const PASO_ALCANCE_COMPLETADO = 6;

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

  /** Guarda Contexto y conserva la revisión devuelta para el siguiente paso. */
  public guardarContexto(contexto: ContextoProyecto): Observable<BorradorProyecto> {
    const vigente = this.estadoBorrador();
    if (!vigente) return throwError(() => new Error('El borrador todavía no está disponible.'));

    const pasoActual = Math.max(vigente.pasoActual, PASO_CONTEXTO_COMPLETADO);
    return this.creacionProyecto.actualizarContexto(vigente, contexto, pasoActual).pipe(
      tap((borrador) => {
        this.estadoBorrador.set(borrador);
        this.estadoNombreProyecto.set(borrador.contexto.nombre.trim());
      }),
    );
  }

  /** Guarda Tipo de solución y conserva la revisión para el siguiente paso. */
  public guardarTipoSolucion(tipoSolucion: TipoSolucionProyecto): Observable<BorradorProyecto> {
    const vigente = this.estadoBorrador();
    if (!vigente) return throwError(() => new Error('El borrador todavía no está disponible.'));

    const pasoActual = Math.max(vigente.pasoActual, PASO_TIPO_SOLUCION_COMPLETADO);
    return this.creacionProyecto
      .actualizarTipoSolucion(vigente, tipoSolucion, pasoActual)
      .pipe(tap((borrador) => this.estadoBorrador.set(borrador)));
  }

  /** Guarda Necesidad y conserva la revisión para el siguiente paso. */
  public guardarNecesidad(necesidad: NecesidadProyecto): Observable<BorradorProyecto> {
    const vigente = this.estadoBorrador();
    if (!vigente) return throwError(() => new Error('El borrador todavía no está disponible.'));

    const pasoActual = Math.max(vigente.pasoActual, PASO_NECESIDAD_COMPLETADO);
    return this.creacionProyecto
      .actualizarNecesidad(vigente, necesidad, pasoActual)
      .pipe(tap((borrador) => this.estadoBorrador.set(borrador)));
  }

  /** Guarda Objetivos y conserva la revisión para el siguiente paso. */
  public guardarObjetivos(objetivos: ObjetivosProyecto): Observable<BorradorProyecto> {
    const vigente = this.estadoBorrador();
    if (!vigente) return throwError(() => new Error('El borrador todavía no está disponible.'));

    const pasoActual = Math.max(vigente.pasoActual, PASO_OBJETIVOS_COMPLETADO);
    return this.creacionProyecto
      .actualizarObjetivos(vigente, objetivos, pasoActual)
      .pipe(tap((borrador) => this.estadoBorrador.set(borrador)));
  }

  /** Guarda Alcance y conserva la revisión para el siguiente paso. */
  public guardarAlcance(alcance: AlcanceProyecto): Observable<BorradorProyecto> {
    const vigente = this.estadoBorrador();
    if (!vigente) return throwError(() => new Error('El borrador todavía no está disponible.'));

    const pasoActual = Math.max(vigente.pasoActual, PASO_ALCANCE_COMPLETADO);
    return this.creacionProyecto
      .actualizarAlcance(vigente, alcance, pasoActual)
      .pipe(tap((borrador) => this.estadoBorrador.set(borrador)));
  }
}
