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
  /** Versiones resumidas disponibles en la línea de tiempo. */
  public readonly versiones = input.required<readonly VersionElementoResumen[]>();
  /** Identificador de la versión cuyo detalle está seleccionado. */
  public readonly versionSeleccionadaId = input.required<number | null>();
  /** Contenido normalizado de la versión seleccionada. */
  public readonly versionSeleccionada = input.required<VersionElementoPlanificacion | null>();
  /** Catálogos usados para representar identificadores del contenido histórico. */
  public readonly catalogos = input.required<CatalogosFormularioElementoPlanificacion>();
  /** Indica si el historial dispone de otra página. */
  public readonly hayMas = input(false);
  /** Indica que se está obteniendo la lista de versiones. */
  public readonly cargandoHistorial = input(false);
  /** Indica que se está obteniendo el contenido de una versión. */
  public readonly cargandoVersion = input(false);
  /** Indica que la consulta de la lista falló. */
  public readonly errorHistorial = input(false);
  /** Indica que la consulta del contenido seleccionado falló. */
  public readonly errorVersion = input(false);

  /** Solicita consultar una versión de la línea de tiempo. */
  public readonly seleccionar = output<VersionElementoResumen>();
  /** Solicita la siguiente página del historial. */
  public readonly cargarMas = output<void>();
  /** Solicita repetir la consulta de la lista. */
  public readonly reintentarHistorial = output<void>();
  /** Solicita repetir la consulta del contenido seleccionado. */
  public readonly reintentarVersion = output<void>();
  /** Solicita regresar al detalle vigente del elemento. */
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
