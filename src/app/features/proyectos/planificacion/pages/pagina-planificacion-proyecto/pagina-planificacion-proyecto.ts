import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { obtenerProyectoIdRuta } from '../../../../../core/navegacion/rutas';
import { EncabezadoPagina } from '../../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../../../../shared/components/estado-vacio/estado-vacio';

/** Compone la identidad y el espacio de trabajo de la planificación de un proyecto. */
@Component({
  selector: 'app-pagina-planificacion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EncabezadoPagina, EstadoVacio],
  templateUrl: './pagina-planificacion-proyecto.html',
  styleUrl: './pagina-planificacion-proyecto.css',
})
export class PaginaPlanificacionProyecto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly proyectoId = toSignal(
    this.ruta.paramMap.pipe(map(obtenerProyectoIdRuta), distinctUntilChanged()),
    { initialValue: null },
  );

  protected readonly etiquetaEncabezado = computed(() => {
    const proyectoId = this.proyectoId();
    return proyectoId ? `Proyecto #${proyectoId}` : 'Proyecto';
  });

  protected readonly tituloEncabezado = 'Planificación del proyecto';
  protected readonly descripcionEncabezado =
    'Administra y organiza las épicas, características, requisitos, historias de usuario y tareas del proyecto.';
}
