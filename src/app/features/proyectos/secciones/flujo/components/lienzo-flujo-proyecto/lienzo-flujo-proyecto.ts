import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, ViewChild, computed, inject } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { TarjetaBloqueFlujoProyecto } from '../tarjeta-bloque-flujo-proyecto/tarjeta-bloque-flujo-proyecto';
import { CapaConexionesFlujoProyecto } from '../capa-conexiones-flujo-proyecto/capa-conexiones-flujo-proyecto';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

@Component({
  selector: 'app-lienzo-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, CapaConexionesFlujoProyecto, TarjetaBloqueFlujoProyecto],
  templateUrl: './lienzo-flujo-proyecto.html',
  styleUrl: './lienzo-flujo-proyecto.css'
})
export class LienzoFlujoProyecto {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly store = inject(EstadoEditorFlujoProyectoService);
  @ViewChild('viewportElement', { static: true }) private readonly viewportElement?: ElementRef<HTMLDivElement>;

  protected readonly sceneTransform = computed(() => {
    const viewport = this.store.viewport();
    return `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`;
  });

  protected readonly canvasSizeStyle = computed(() => ({
    width: `${this.store.canvasSize.width}px`,
    height: `${this.store.canvasSize.height}px`,
    transform: this.sceneTransform()
  }));
  protected readonly viewportGridStyle = computed(() => {
    const viewport = this.store.viewport();
    const gridSize = 40 * viewport.zoom;

    return {
      backgroundSize: `${gridSize}px ${gridSize}px`,
      backgroundPosition: `${viewport.panX}px ${viewport.panY}px`
    };
  });
  protected readonly zoomLabel = computed(() => `${Math.round(this.store.viewport().zoom * 100)}%`);

  protected zoomIn(): void {
    this.store.zoomBy(0.1);
  }

  protected zoomOut(): void {
    this.store.zoomBy(-0.1);
  }

  protected resetView(): void {
    this.store.resetView();
  }

  protected openBlockPicker(): void {
    this.store.openBlockPicker();
  }

  protected onSurfaceClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (target?.closest('[data-flow-card], [data-connection-hit="true"], button, input, textarea, label')) {
      return;
    }

    this.store.clearSelection();
    this.store.cancelConnection();
  }

  protected onSurfacePointerDown(event: PointerEvent): void {
    if (this.store.isConnectionDragging()) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest('[data-flow-card], [data-connection-hit="true"], button, input, textarea, label')) {
      return;
    }

    let startClientX = event.clientX;
    let startClientY = event.clientY;

    const moveHandler = (moveEvent: PointerEvent) => {
      this.store.panBy(moveEvent.clientX - startClientX, moveEvent.clientY - startClientY);
      startClientX = moveEvent.clientX;
      startClientY = moveEvent.clientY;
    };

    const stopPanning = () => {
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', stopPanning);
    };

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', stopPanning, { once: true });
    this.destroyRef.onDestroy(stopPanning);
  }

  @HostListener('document:pointermove', ['$event'])
  protected onDocumentPointerMove(event: PointerEvent): void {
    if (!this.store.isConnectionDragging()) {
      return;
    }

    this.store.updateConnectionPointer(this.toCanvasPoint(event.clientX, event.clientY));
  }

  @HostListener('document:pointerup')
  protected onDocumentPointerUp(): void {
    if (!this.store.isConnectionDragging()) {
      return;
    }

    this.store.completeConnectionDrag();
  }

  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    if (this.store.isConnectionDragging()) {
      this.store.cancelConnection();
    }
  }

  private toCanvasPoint(clientX: number, clientY: number): { x: number; y: number } {
    const viewportRect = this.viewportElement?.nativeElement.getBoundingClientRect();
    const viewport = this.store.viewport();

    if (!viewportRect) {
      return { x: 0, y: 0 };
    }

    return {
      x: (clientX - viewportRect.left - viewport.panX) / viewport.zoom,
      y: (clientY - viewportRect.top - viewport.panY) / viewport.zoom
    };
  }
}
