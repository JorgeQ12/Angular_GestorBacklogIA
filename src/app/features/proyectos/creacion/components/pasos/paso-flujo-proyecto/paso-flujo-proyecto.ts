import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { EditorFlujoProyecto } from '../../../../secciones/flujo/components/editor-flujo-proyecto/editor-flujo-proyecto';
import { deserializarFlujoProyecto } from '../../../../secciones/flujo/mappers/flujo-proyecto.mapper';
import { ProjectWorkflow } from '../../../../secciones/flujo/models/flujo-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Integra el editor de Flujo con el borrador del recorrido de creación. */
@Component({
  selector: 'app-paso-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EditorFlujoProyecto, EstadoError, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './paso-flujo-proyecto.html',
  styleUrl: './paso-flujo-proyecto.css',
})
export class PasoFlujoProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);
  private readonly flujoEditado = signal<ProjectWorkflow | null>(null);
  private proyectoAnterior: number | null = null;

  protected readonly flujo = computed<ProjectWorkflow | null>(() => {
    const borrador = this.paso.borrador();
    if (!borrador) return null;

    return (
      this.flujoEditado() ?? deserializarFlujoProyecto(borrador.diagramFlujoJson, borrador.id)
    );
  });
  protected readonly errorContenido = computed(
    () => this.paso.contenidoListo() && this.flujo() === null,
  );

  public constructor() {
    effect(() => {
      const proyectoId = this.paso.proyectoId;
      if (this.proyectoAnterior === proyectoId) return;

      this.proyectoAnterior = proyectoId;
      this.flujoEditado.set(null);
    });
    this.paso.cargar();
  }

  /** Conserva la fotografía vigente emitida por el editor. */
  protected actualizarFlujo(flujo: ProjectWorkflow): void {
    this.flujoEditado.set(flujo);
  }

  /** Guarda el diagrama completo como la última sección del borrador. */
  protected guardarFlujo(): void {
    const flujo = this.flujo();
    if (!flujo) return;

    this.paso.guardar({ seccion: ClaveSeccionProyecto.Flujo, datos: flujo }, () => undefined);
  }
}
