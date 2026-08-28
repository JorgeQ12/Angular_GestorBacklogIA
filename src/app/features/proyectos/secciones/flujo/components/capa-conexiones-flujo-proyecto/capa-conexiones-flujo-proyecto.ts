import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import {
  buildFlowConnectionPath,
  getFlowBlockAnchorPoint,
  resolveNearestFlowTargetSide
} from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

@Component({
  selector: 'app-capa-conexiones-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './capa-conexiones-flujo-proyecto.html',
  styleUrl: './capa-conexiones-flujo-proyecto.css'
})
export class CapaConexionesFlujoProyecto {
  protected readonly store = inject(EstadoEditorFlujoProyectoService);
  public readonly mode = input<'lines' | 'deleteOverlay'>('lines');

  protected readonly renderedConnections = computed(() => {
    const blocks = new Map(this.store.visibleBlocks().map((block) => [block.id, block]));

    return this.store.visibleConnections()
      .map((connection) => {
        const source = blocks.get(connection.sourceBlockId);
        const target = blocks.get(connection.targetBlockId);

        if (!source || !target) {
          return null;
        }

        const sourcePoint = getFlowBlockAnchorPoint(source, 'right', connection.label);
        const targetSide = (connection.targetSide === 'right' ? 'left' : connection.targetSide) ?? resolveNearestFlowTargetSide(target, sourcePoint);
        const targetPoint = getFlowBlockAnchorPoint(target, targetSide);
        const isDecisionBranch = connection.label === 'Si' || connection.label === 'No';
        const labelWidth = Math.max(34, connection.label ? (connection.label.length * 7) + 18 : 34);
        const labelCenterX = isDecisionBranch
          ? sourcePoint.x + Math.min(84, Math.max(52, Math.abs(targetPoint.x - sourcePoint.x) * 0.42))
          : sourcePoint.x + (targetPoint.x - sourcePoint.x) / 2;
        const labelCenterY = isDecisionBranch
          ? sourcePoint.y + (connection.label === 'Si' ? -18 : 18)
          : sourcePoint.y + (targetPoint.y - sourcePoint.y) / 2 - 14;

        return {
          ...connection,
          isDecisionBranch,
          targetSide,
          path: buildFlowConnectionPath(sourcePoint, targetPoint, targetSide),
          labelCenterX,
          labelCenterY,
          labelRectX: labelCenterX - labelWidth / 2,
          labelRectY: labelCenterY - 10,
          labelTextY: labelCenterY + 4,
          labelWidth,
          deleteChipX: labelCenterX - 56,
          deleteChipY: labelCenterY - (connection.label && !isDecisionBranch ? 42 : 14)
        };
      })
      .filter((connection): connection is NonNullable<typeof connection> => connection !== null);
  });
  protected readonly previewConnection = computed(() => this.store.activeConnectionPreview());

  protected selectConnection(connectionId: string): void {
    if (this.store.isReadOnly()) {
      return;
    }

    this.store.selectConnection(connectionId);
  }

  protected deleteConnection(connectionId: string): void {
    this.store.deleteConnection(connectionId);
  }
}

