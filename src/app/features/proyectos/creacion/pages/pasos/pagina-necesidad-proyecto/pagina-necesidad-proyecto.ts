import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { crearUrlObjetivosProyecto } from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioNecesidadProyecto } from '../../../../secciones/necesidad/components/formulario-necesidad-proyecto/formulario-necesidad-proyecto';
import { deserializarNecesidadProyecto } from '../../../../secciones/necesidad/mappers/necesidad-proyecto.mapper';
import { NecesidadProyecto } from '../../../../secciones/necesidad/models/necesidad-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Coordina Necesidad de negocio dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-necesidad-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioNecesidadProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './pagina-necesidad-proyecto.html',
  styleUrl: './pagina-necesidad-proyecto.css',
})
export class PaginaNecesidadProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);
  protected readonly necesidad = computed<NecesidadProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarNecesidadProyecto(borrador.necesidadJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Necesidad y abre Objetivos. */
  protected guardarNecesidad(necesidad: NecesidadProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Necesidad, datos: necesidad },
      crearUrlObjetivosProyecto,
    );
  }
}
