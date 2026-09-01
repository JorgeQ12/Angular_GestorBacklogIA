import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LienzoFlujoProyecto } from '../lienzo-flujo-proyecto/lienzo-flujo-proyecto';
import { ModalNodoFlujoProyecto } from '../modal-nodo-flujo-proyecto/modal-nodo-flujo-proyecto';
import { PanelLateralFlujoProyecto } from '../panel-lateral-flujo-proyecto/panel-lateral-flujo-proyecto';
import { FlujoProyecto } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

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
  private readonly documento = inject(DOCUMENT);
  private readonly contenedorEditor = viewChild.required<ElementRef<HTMLElement>>('contenedorEditor');
  protected readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);
  protected readonly pantallaCompleta = signal(false);

  /** Proporciona la fotografía canónica que debe presentar el editor. */
  public readonly flujo = input.required<FlujoProyecto>();

  /** Bloquea temporalmente la edición durante el guardado remoto. */
  public readonly procesando = input(false);

  /** Indica si el consumidor conserva una fotografía pendiente de guardado. */
  public readonly cambiosPendientes = input(false);

  /** Comunica una nueva fotografía cada vez que cambia el diagrama. */
  public readonly flujoCambiado = output<FlujoProyecto>();

  /** Solicita al consumidor persistir el flujo sin abandonar el editor. */
  public readonly guardarSolicitado = output<void>();

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

    effect(() => this.estadoEditor.establecerSoloLectura(this.procesando()));

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

  /** Alterna el editor entre su tamaño integrado y la pantalla completa del navegador. */
  protected async alternarPantallaCompleta(): Promise<void> {
    const contenedor = this.contenedorEditor().nativeElement;

    try {
      if (this.documento.fullscreenElement === contenedor) {
        await this.documento.exitFullscreen();
      } else if (typeof contenedor.requestFullscreen === 'function') {
        await contenedor.requestFullscreen();
      }
    } catch {
      // El navegador puede rechazar la solicitud si pierde la activación del usuario.
    } finally {
      this.sincronizarPantallaCompleta();
    }
  }

  @HostListener('document:fullscreenchange')
  protected sincronizarPantallaCompleta(): void {
    this.pantallaCompleta.set(
      this.documento.fullscreenElement === this.contenedorEditor().nativeElement,
    );
  }
}
