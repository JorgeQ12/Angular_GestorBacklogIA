import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { crearUrlRolesProyecto } from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioAlcanceProyecto } from '../../../../secciones/alcance/components/formulario-alcance-proyecto/formulario-alcance-proyecto';
import { deserializarAlcanceProyecto } from '../../../../secciones/alcance/mappers/alcance-proyecto.mapper';
import { AlcanceProyecto } from '../../../../secciones/alcance/models/alcance-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Coordina Alcance dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-alcance-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioAlcanceProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './pagina-alcance-proyecto.html',
  styleUrl: './pagina-alcance-proyecto.css',
})
export class PaginaAlcanceProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);
  protected readonly alcance = computed<AlcanceProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarAlcanceProyecto(borrador.alcanceJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Alcance y abre Roles. */
  protected guardarAlcance(alcance: AlcanceProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Alcance, datos: alcance },
      crearUrlRolesProyecto,
    );
  }
}
