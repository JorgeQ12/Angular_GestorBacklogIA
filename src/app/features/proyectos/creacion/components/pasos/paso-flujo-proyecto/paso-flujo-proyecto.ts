import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { EditorFlujoProyecto } from '../../../../secciones/flujo/components/editor-flujo-proyecto/editor-flujo-proyecto';
import { deserializarFlujoProyecto } from '../../../../secciones/flujo/mappers/flujo-proyecto.mapper';
import { FlujoProyecto } from '../../../../secciones/flujo/models/flujo-proyecto.model';
import { deserializarRolesProyecto } from '../../../../secciones/roles/mappers/roles-proyecto.mapper';
import { sincronizarRolesDelFlujo } from '../../../mappers/flujo-creacion-proyecto.mapper';
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
  private readonly flujoEditado = signal<FlujoProyecto | null>(null);
  protected readonly cambiosPendientes = signal(false);
  private proyectoAnterior: number | null = null;

  /** Comunica que el flujo final fue guardado y el recorrido puede cerrarse. */
  public readonly completado = output<void>();

  protected readonly flujo = computed<FlujoProyecto | null>(() => {
    const borrador = this.paso.borrador();
    if (!borrador) return null;

    const flujoEditado = this.flujoEditado();
    if (flujoEditado) return flujoEditado;

    const flujo = deserializarFlujoProyecto(borrador.diagramFlujoJson, borrador.id);
    const roles = deserializarRolesProyecto(borrador.rolesJson);
    if (!flujo || !roles) return null;

    return sincronizarRolesDelFlujo(flujo, roles, borrador.fechaUltimoGuardado);
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
      this.cambiosPendientes.set(false);
    });
    this.paso.cargar();
  }

  /** Conserva la fotografía vigente emitida por el editor. */
  protected actualizarFlujo(flujo: FlujoProyecto): void {
    this.flujoEditado.set(flujo);
    this.cambiosPendientes.set(true);
  }

  /** Guarda cambios desde el canvas y conserva visible el editor. */
  protected guardarCambiosFlujo(): void {
    this.guardarFlujo(() => this.cambiosPendientes.set(false));
  }

  /** Guarda la última sección y solicita cerrar el recorrido. */
  protected guardarYFinalizar(): void {
    this.guardarFlujo(() => {
      this.cambiosPendientes.set(false);
      this.completado.emit();
    });
  }

  private guardarFlujo(alCompletar: () => void): void {
    const flujo = this.flujo();
    if (!flujo) return;

    this.paso.guardar({ seccion: ClaveSeccionProyecto.Flujo, datos: flujo }, alCompletar);
  }
}
