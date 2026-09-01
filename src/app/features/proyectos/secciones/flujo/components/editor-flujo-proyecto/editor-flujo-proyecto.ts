import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { LienzoFlujoProyecto } from '../lienzo-flujo-proyecto/lienzo-flujo-proyecto';
import { ModalNodoFlujoProyecto } from '../modal-nodo-flujo-proyecto/modal-nodo-flujo-proyecto';
import { PanelLateralFlujoProyecto } from '../panel-lateral-flujo-proyecto/panel-lateral-flujo-proyecto';
import { FlujoProyecto } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { ModoFormularioProyecto } from '../../../../models/modo-formulario-proyecto.model';

/** Presenta y edita el flujo sin conocer rutas, HTTP ni el borrador de creación. */
@Component({
  selector: 'app-editor-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LienzoFlujoProyecto,
    ModalNodoFlujoProyecto,
    PanelLateralFlujoProyecto,
  ],
  providers: [EstadoEditorFlujoProyectoService],
  templateUrl: './editor-flujo-proyecto.html',
  styleUrl: './editor-flujo-proyecto.css',
})
export class EditorFlujoProyecto {
  protected readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);

  /** Proporciona la fotografía canónica que debe presentar el editor. */
  public readonly flujo = input.required<FlujoProyecto>();

  /** Bloquea temporalmente la edición durante el guardado remoto. */
  public readonly procesando = input(false);

  /** Define si el diagrama admite cambios o se presenta como fotografía confirmada. */
  public readonly modo = input(ModoFormularioProyecto.Edicion);

  /** Comunica una nueva fotografía cada vez que cambia el diagrama. */
  public readonly flujoCambiado = output<FlujoProyecto>();

  protected readonly esSoloLectura = computed(() => this.modo() === ModoFormularioProyecto.Lectura);

  private fotografiaHidratada = '';
  private fotografiaEmitida = '';
  private editorHidratado = false;

  public constructor() {
    effect(() => {
      const flujo = this.flujo();
      const fotografiaEntrante = JSON.stringify(flujo);
      if (fotografiaEntrante === this.fotografiaHidratada) return;

      this.estadoEditor.hidratar(structuredClone(flujo), flujo.proyectoId, {
        conservarSeleccion: true,
        conservarVista: true,
      });
      const fotografiaNormalizada = JSON.stringify(this.estadoEditor.flujo());
      this.fotografiaHidratada = fotografiaNormalizada;
      this.fotografiaEmitida = fotografiaNormalizada;
      this.editorHidratado = true;
    });

    effect(() =>
      this.estadoEditor.establecerSoloLectura(this.procesando() || this.esSoloLectura()),
    );

    effect(() => {
      const flujo = this.estadoEditor.flujo();
      const fotografia = JSON.stringify(flujo);
      if (
        !this.editorHidratado ||
        fotografia === this.fotografiaHidratada ||
        fotografia === this.fotografiaEmitida
      ) {
        return;
      }

      this.fotografiaEmitida = fotografia;
      queueMicrotask(() => this.flujoCambiado.emit(structuredClone(flujo)));
    });
  }
}
