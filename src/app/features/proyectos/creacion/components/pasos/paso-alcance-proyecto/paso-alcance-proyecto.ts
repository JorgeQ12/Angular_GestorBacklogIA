import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioAlcanceProyecto } from '../../../../secciones/alcance/components/formulario-alcance-proyecto/formulario-alcance-proyecto';
import { deserializarAlcanceProyecto } from '../../../../secciones/alcance/mappers/alcance-proyecto.mapper';
import { AlcanceProyecto } from '../../../../secciones/alcance/models/alcance-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Integra Alcance con el estado del recorrido de creación. */
@Component({
  selector: 'app-paso-alcance-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioAlcanceProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './paso-alcance-proyecto.html',
  styleUrl: './paso-alcance-proyecto.css',
})
export class PasoAlcanceProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);

  /** Solicita a la página abrir el siguiente paso después de guardar. */
  public readonly completado = output<void>();

  protected readonly alcance = computed<AlcanceProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarAlcanceProyecto(borrador.alcanceJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Alcance antes de continuar. */
  protected guardarAlcance(alcance: AlcanceProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Alcance, datos: alcance },
      () => this.completado.emit(),
    );
  }
}
