import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioObjetivosProyecto } from '../../../../secciones/objetivos/components/formulario-objetivos-proyecto/formulario-objetivos-proyecto';
import { deserializarObjetivosProyecto } from '../../../../secciones/objetivos/mappers/objetivos-proyecto.mapper';
import { ObjetivosProyecto } from '../../../../secciones/objetivos/models/objetivos-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Integra Objetivos con el estado del recorrido de creación. */
@Component({
  selector: 'app-paso-objetivos-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioObjetivosProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './paso-objetivos-proyecto.html',
  styleUrl: './paso-objetivos-proyecto.css',
})
export class PasoObjetivosProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);

  /** Solicita a la página abrir el siguiente paso después de guardar. */
  public readonly completado = output<void>();

  protected readonly objetivos = computed<ObjetivosProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarObjetivosProyecto(borrador.objetivosJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Objetivos antes de continuar. */
  protected guardarObjetivos(objetivos: ObjetivosProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Objetivos, datos: objetivos },
      () => this.completado.emit(),
    );
  }
}
