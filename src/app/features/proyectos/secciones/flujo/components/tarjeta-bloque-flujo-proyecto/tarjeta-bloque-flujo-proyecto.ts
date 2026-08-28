import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { MensajesService } from '../../../../../../core/mensajes/services/mensajes.service';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ICONOS_TIPO_BLOQUE_FLUJO } from '../../config/flujo-proyecto.config';
import { DecisionBranchLabel, FLOW_BLOCK_TYPE_LABELS, FlowBlockType, ProjectFlowBlock } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

@Component({
  selector: 'app-tarjeta-bloque-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './tarjeta-bloque-flujo-proyecto.html',
  styleUrl: './tarjeta-bloque-flujo-proyecto.css'
})
export class TarjetaBloqueFlujoProyecto {
  private readonly destroyRef = inject(DestroyRef);
  private readonly mensajes = inject(MensajesService);
  protected readonly store = inject(EstadoEditorFlujoProyectoService);
  public readonly block = input.required<ProjectFlowBlock>();
  private movedDuringDrag = false;
  protected readonly actionsOpen = signal(false);
  protected readonly decisionBranches: readonly DecisionBranchLabel[] = ['Si', 'No'];

  protected readonly typeLabels = FLOW_BLOCK_TYPE_LABELS;
  protected readonly typeIcons = ICONOS_TIPO_BLOQUE_FLUJO;
  protected readonly roleNames = computed(() =>
    this.block().roleIds.map((roleId) => this.store.getRoleName(roleId))
  );

  protected isDecisionBlock(): boolean {
    return this.block().type === FlowBlockType.Decision;
  }

  protected openEditor(): void {
    if (this.movedDuringDrag || this.store.isConnectionDragging()) {
      this.movedDuringDrag = false;
      return;
    }

    this.store.openNodeEditor(this.block().id);
  }

  protected startConnectionDrag(event: PointerEvent, label?: DecisionBranchLabel): void {
    event.preventDefault();
    event.stopPropagation();
    this.store.startConnectionDrag(this.block().id, label);
  }

  protected toggleActions(event: MouseEvent): void {
    event.stopPropagation();
    this.actionsOpen.update((isOpen) => !isOpen);
  }

  protected editBlock(event: MouseEvent): void {
    event.stopPropagation();
    this.actionsOpen.set(false);
    this.store.openNodeEditor(this.block().id);
  }

  protected async deleteBlock(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    this.actionsOpen.set(false);

    const currentBlock = this.block();
    const confirmed = await this.mensajes.confirmarDestructiva(
      `Eliminar ${this.typeLabels[currentBlock.type].toLowerCase()}`,
      `El bloque “${currentBlock.title}” y sus conexiones dejarán de formar parte del flujo.`,
      'Eliminar bloque'
    );

    if (confirmed) {
      this.store.deleteBlock(currentBlock.id);
    }
  }

  @HostListener('document:click')
  protected closeActions(): void {
    this.actionsOpen.set(false);
  }

  protected onTargetPointerEnter(): void {
    this.store.setConnectionHoverTarget(this.block().id);
  }

  protected onTargetPointerLeave(): void {
    this.store.setConnectionHoverTarget(null);
  }

  protected onCardPointerEnter(): void {
    if (!this.store.isConnectionDragging() || !this.store.isConnectionTarget(this.block().id)) {
      return;
    }

    this.store.setConnectionHoverTarget(this.block().id);
  }

  protected onCardPointerLeave(): void {
    if (!this.store.isConnectionDragging() || !this.store.isConnectionTarget(this.block().id)) {
      return;
    }

    this.store.setConnectionHoverTarget(null);
  }

  protected completeConnectionDrag(event: PointerEvent): void {
    if (!this.store.isConnectionDragging()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.store.setConnectionHoverTarget(this.block().id);
    this.store.completeConnectionDrag();
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.store.isReadOnly()) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest('button')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.store.selectBlock(this.block().id);

    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const initialPosition = this.block().position;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const zoom = this.store.viewport().zoom;
      const deltaX = (moveEvent.clientX - startClientX) / zoom;
      const deltaY = (moveEvent.clientY - startClientY) / zoom;

      if (Math.abs(moveEvent.clientX - startClientX) > 3 || Math.abs(moveEvent.clientY - startClientY) > 3) {
        this.movedDuringDrag = true;
      }

      this.store.moveBlock(this.block().id, {
        x: initialPosition.x + deltaX,
        y: initialPosition.y + deltaY
      });
    };

    const stopDragging = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDragging);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging, { once: true });
    this.destroyRef.onDestroy(stopDragging);
  }
}

