import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioTipoSolucionProyecto } from '../../../../secciones/tipo-solucion/components/formulario-tipo-solucion-proyecto/formulario-tipo-solucion-proyecto';
import { deserializarTipoSolucionProyecto } from '../../../../secciones/tipo-solucion/mappers/tipo-solucion-proyecto.mapper';
import { TipoSolucionProyecto } from '../../../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Integra Tipo de solución con el estado del recorrido de creación. */
@Component({
  selector: 'app-paso-tipo-solucion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioTipoSolucionProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './paso-tipo-solucion-proyecto.html',
  styleUrl: './paso-tipo-solucion-proyecto.css',
})
export class PasoTipoSolucionProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);

  /** Solicita a la página abrir el siguiente paso después de guardar. */
  public readonly completado = output<void>();

  protected readonly tipoSolucion = computed<TipoSolucionProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarTipoSolucionProyecto(borrador.tipoSolucionJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Tipo de solución antes de continuar. */
  protected guardarTipoSolucion(tipoSolucion: TipoSolucionProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.TipoSolucion, datos: tipoSolucion },
      () => this.completado.emit(),
    );
  }
}
