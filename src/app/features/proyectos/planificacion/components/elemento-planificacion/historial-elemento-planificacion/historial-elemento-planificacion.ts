import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { EstadoVacio } from '../../../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import type { NombreIconoAplicacion } from '../../../../../../shared/components/icono/iconos-aplicacion';
import { FechaPipe } from '../../../../../../shared/fechas/pipes/fecha.pipe';
import type { CatalogosFormularioElementoPlanificacion } from '../../../models/detalle-elemento-planificacion.model';
import type {
  VersionElementoPlanificacion,
  VersionElementoResumen,
} from '../../../models/historial-elemento-planificacion.model';
import { TipoElementoPlanificacion } from '../../../models/planificacion-proyecto.model';

/** Presenta la línea de tiempo y el contenido inmutable de cada versión anterior. */
@Component({
  selector: 'app-historial-elemento-planificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, EstadoVacio, IconoComponent, FechaPipe],
  templateUrl: './historial-elemento-planificacion.html',
  styleUrl: './historial-elemento-planificacion.css',
})
export class HistorialElementoPlanificacionComponent {
  public readonly versiones = input.required<readonly VersionElementoResumen[]>();
  public readonly versionSeleccionadaId = input.required<number | null>();
  public readonly versionSeleccionada = input.required<VersionElementoPlanificacion | null>();
  public readonly catalogos = input.required<CatalogosFormularioElementoPlanificacion>();
  public readonly hayMas = input(false);
  public readonly cargandoHistorial = input(false);
  public readonly cargandoVersion = input(false);
  public readonly errorHistorial = input(false);
  public readonly errorVersion = input(false);

  public readonly seleccionar = output<VersionElementoResumen>();
  public readonly cargarMas = output<void>();
  public readonly reintentarHistorial = output<void>();
  public readonly reintentarVersion = output<void>();
  public readonly volverDetalle = output<void>();

  protected readonly tipos = TipoElementoPlanificacion;

  protected obtenerNombreCatalogo(
    id: number | null,
    opciones: CatalogosFormularioElementoPlanificacion['prioridades'],
    alternativa: string,
  ): string {
    if (id === null) return alternativa;
    return opciones.find((opcion) => opcion.id === id)?.nombre ?? `Valor registrado #${id}`;
  }

  protected obtenerIconoVersion(versionId: number): NombreIconoAplicacion {
    return this.versionSeleccionadaId() === versionId ? 'confirmar' : 'continuar';
  }
}
