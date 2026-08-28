import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioNecesidadProyecto } from '../../../../secciones/necesidad/components/formulario-necesidad-proyecto/formulario-necesidad-proyecto';
import { deserializarNecesidadProyecto } from '../../../../secciones/necesidad/mappers/necesidad-proyecto.mapper';
import { NecesidadProyecto } from '../../../../secciones/necesidad/models/necesidad-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Integra Necesidad de negocio con el estado del recorrido de creación. */
@Component({
  selector: 'app-paso-necesidad-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioNecesidadProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './paso-necesidad-proyecto.html',
  styleUrl: './paso-necesidad-proyecto.css',
})
export class PasoNecesidadProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);

  /** Solicita a la página abrir el siguiente paso después de guardar. */
  public readonly completado = output<void>();

  protected readonly necesidad = computed<NecesidadProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarNecesidadProyecto(borrador.necesidadJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Necesidad antes de continuar. */
  protected guardarNecesidad(necesidad: NecesidadProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Necesidad, datos: necesidad },
      () => this.completado.emit(),
    );
  }
}
