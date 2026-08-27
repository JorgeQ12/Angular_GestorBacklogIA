import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { crearUrlNecesidadProyecto } from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioTipoSolucionProyecto } from '../../../../secciones/tipo-solucion/components/formulario-tipo-solucion-proyecto/formulario-tipo-solucion-proyecto';
import { deserializarTipoSolucionProyecto } from '../../../../secciones/tipo-solucion/mappers/tipo-solucion-proyecto.mapper';
import { TipoSolucionProyecto } from '../../../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Coordina Tipo de solución dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-tipo-solucion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioTipoSolucionProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './pagina-tipo-solucion-proyecto.html',
  styleUrl: './pagina-tipo-solucion-proyecto.css',
})
export class PaginaTipoSolucionProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);
  protected readonly tipoSolucion = computed<TipoSolucionProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarTipoSolucionProyecto(borrador.tipoSolucionJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Tipo de solución y abre Necesidad de negocio. */
  protected guardarTipoSolucion(tipoSolucion: TipoSolucionProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.TipoSolucion, datos: tipoSolucion },
      crearUrlNecesidadProyecto,
    );
  }
}
