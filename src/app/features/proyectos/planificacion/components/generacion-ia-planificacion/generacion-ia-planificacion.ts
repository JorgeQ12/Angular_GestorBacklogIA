import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import {
  OPCIONES_GENERACION_IA_PLANIFICACION,
  type OpcionGeneracionIaPlanificacion,
} from '../../config/opciones-generacion-ia-planificacion.config';
import { NivelGeneracionIaPlanificacion } from '../../models/generacion-ia-planificacion.model';
import type { ResumenPlanificacionProyecto } from '../../models/planificacion-proyecto.model';

/** Presenta las alternativas disponibles para generar la planificación mediante IA. */
@Component({
  selector: 'app-generacion-ia-planificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './generacion-ia-planificacion.html',
  styleUrl: './generacion-ia-planificacion.css',
})
export class GeneracionIaPlanificacionComponent {
  /** Proporciona los totales vigentes utilizados para habilitar cada nivel. */
  public readonly resumen = input.required<ResumenPlanificacionProyecto>();
  /** Indica si las alternativas se encuentran visibles. */
  public readonly abierto = input(false);
  /** Bloquea acciones mientras se confirma o ejecuta una generación. */
  public readonly procesando = input(false);
  /** Comunica el nivel que debe generarse. */
  public readonly generar = output<NivelGeneracionIaPlanificacion>();

  protected readonly opciones = OPCIONES_GENERACION_IA_PLANIFICACION;

  protected estaDeshabilitada(opcion: OpcionGeneracionIaPlanificacion): boolean {
    if (this.procesando()) return true;
    if (opcion.nivel === NivelGeneracionIaPlanificacion.Historias) {
      return this.resumen().caracteristicas === 0;
    }
    if (opcion.nivel === NivelGeneracionIaPlanificacion.Tareas) {
      return this.resumen().historias === 0;
    }
    return false;
  }

  protected obtenerResumen(opcion: OpcionGeneracionIaPlanificacion): string {
    const resumen = this.resumen();
    switch (opcion.nivel) {
      case NivelGeneracionIaPlanificacion.Epicas:
        return `${resumen.epicas} actuales`;
      case NivelGeneracionIaPlanificacion.Caracteristicas:
        return `${resumen.caracteristicas} vigentes`;
      case NivelGeneracionIaPlanificacion.Historias:
        return resumen.caracteristicas === 0
          ? 'Requiere características'
          : `${resumen.historias} vigentes`;
      case NivelGeneracionIaPlanificacion.Tareas:
        return resumen.historias === 0 ? 'Requiere historias' : `${resumen.tareas} vigentes`;
    }
  }
}
