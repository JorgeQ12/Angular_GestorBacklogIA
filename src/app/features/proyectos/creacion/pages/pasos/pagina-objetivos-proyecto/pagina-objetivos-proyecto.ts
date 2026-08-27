import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { crearUrlAlcanceProyecto } from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioObjetivosProyecto } from '../../../../secciones/objetivos/components/formulario-objetivos-proyecto/formulario-objetivos-proyecto';
import { deserializarObjetivosProyecto } from '../../../../secciones/objetivos/mappers/objetivos-proyecto.mapper';
import { ObjetivosProyecto } from '../../../../secciones/objetivos/models/objetivos-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Coordina Objetivos dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-objetivos-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioObjetivosProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './pagina-objetivos-proyecto.html',
  styleUrl: './pagina-objetivos-proyecto.css',
})
export class PaginaObjetivosProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);
  protected readonly objetivos = computed<ObjetivosProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarObjetivosProyecto(borrador.objetivosJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Objetivos y abre Alcance. */
  protected guardarObjetivos(objetivos: ObjetivosProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Objetivos, datos: objetivos },
      crearUrlAlcanceProyecto,
    );
  }
}
