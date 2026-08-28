import { Injectable, computed, signal } from '@angular/core';
import {
  buildFlowConnectionPath,
  CanvasViewport,
  createDefaultNodeData,
  DecisionBranchLabel,
  FLOW_BLOCK_TYPE_DESCRIPTIONS,
  FLOW_BLOCK_TYPE_LABELS,
  FlowBlockType,
  getFlowOutputHandleOffsetY,
  isDecisionBranchLabel,
  isModulePermissionAction,
  ModulePermissionAction,
  ModulePeakPeriod,
  ModuleRolePermission,
  PROJECT_FLOW_HANDLE_CENTER_OFFSET_X,
  PROJECT_FLOW_HANDLE_CENTER_OFFSET_Y,
  PROJECT_FLOW_BLOCK_SIZE,
  PROJECT_FLOW_CANVAS_SIZE,
  ProjectFlowConnection,
  ProjectFlowConnectionSide,
  ProjectFlowFilterState,
  ProjectFlowRole,
  ProjectFlowViewFilter,
  ProjectWorkflow,
  ProjectWorkflowNode,
  ProjectWorkflowNodeDraft,
  getFlowBlockAnchorPoint,
  resolveNearestFlowConnectionSide,
  resolveNearestFlowTargetSide
} from '../models/flujo-proyecto.model';

type SaveState = 'idle' | 'saved';
type NodeEditorMode = 'create' | 'edit';

interface NodeEditorState {
  mode: NodeEditorMode;
  type: FlowBlockType;
  nodeId: string | null;
  suggestedPosition: { x: number; y: number };
}

interface ConnectionPreviewPoint {
  x: number;
  y: number;
}

interface HydrateOptions {
  preserveViewport?: boolean;
  preserveSelection?: boolean;
}

const DEFAULT_VIEWPORT: CanvasViewport = {
  panX: 0,
  panY: 0,
  zoom: 1
};

const DEFAULT_FILTER: ProjectFlowFilterState = {
  mode: ProjectFlowViewFilter.All,
  roleId: null
};

const AVAILABLE_PROCESS_BLOCK_TYPES: readonly FlowBlockType[] = [
  FlowBlockType.Module,
  FlowBlockType.Screen,
  FlowBlockType.Form,
  FlowBlockType.Action,
  FlowBlockType.Decision
] as const;

@Injectable()
export class EstadoEditorFlujoProyectoService {
  private readonly documentSignal = signal<ProjectWorkflow>(this.createEmptyDocument(''));
  private readonly filterSignal = signal<ProjectFlowFilterState>(DEFAULT_FILTER);
  private readonly viewportSignal = signal<CanvasViewport>(DEFAULT_VIEWPORT);
  private readonly selectedBlockIdSignal = signal<string | null>(null);
  private readonly selectedConnectionIdSignal = signal<string | null>(null);
  private readonly connectionSourceIdSignal = signal<string | null>(null);
  private readonly connectionSourceLabelSignal = signal<string | null>(null);
  private readonly connectionPointerSignal = signal<ConnectionPreviewPoint | null>(null);
  private readonly connectionHoverTargetIdSignal = signal<string | null>(null);
  private readonly connectionHoverTargetSideSignal = signal<ProjectFlowConnectionSide | null>(null);
  private readonly blockPickerOpenSignal = signal(false);
  private readonly nodeEditorStateSignal = signal<NodeEditorState | null>(null);
  private readonly saveStateSignal = signal<SaveState>('idle');
  private readonly lastSavedAtSignal = signal<string | null>(null);
  private readonly readOnlySignal = signal(false);

  public readonly canvasSize = PROJECT_FLOW_CANVAS_SIZE;
  public readonly blockSize = PROJECT_FLOW_BLOCK_SIZE;
  public readonly blockTypeOptions = computed(() =>
    AVAILABLE_PROCESS_BLOCK_TYPES.map((type) => ({
      type,
      label: FLOW_BLOCK_TYPE_LABELS[type],
      description: FLOW_BLOCK_TYPE_DESCRIPTIONS[type]
    }))
  );
  public readonly document = computed(() => this.documentSignal());
  public readonly roles = computed(() => this.documentSignal().roles);
  public readonly blocks = computed(() => this.documentSignal().nodes);
  public readonly connections = computed(() => this.documentSignal().connections);
  public readonly filter = computed(() => this.filterSignal());
  public readonly viewport = computed(() => this.viewportSignal());
  public readonly selectedBlockId = computed(() => this.selectedBlockIdSignal());
  public readonly selectedConnectionId = computed(() => this.selectedConnectionIdSignal());
  public readonly activeConnectionSourceId = computed(() => this.connectionSourceIdSignal());
  public readonly activeConnectionSourceLabel = computed(() => this.connectionSourceLabelSignal());
  public readonly activeConnectionPointer = computed(() => this.connectionPointerSignal());
  public readonly activeConnectionTargetId = computed(() => this.connectionHoverTargetIdSignal());
  public readonly activeConnectionTargetSide = computed(() => this.connectionHoverTargetSideSignal());
  public readonly isBlockPickerOpen = computed(() => this.blockPickerOpenSignal());
  public readonly nodeEditorState = computed(() => this.nodeEditorStateSignal());
  public readonly isNodeEditorOpen = computed(() => this.nodeEditorStateSignal() !== null);
  public readonly isConnectionDragging = computed(() => this.connectionSourceIdSignal() !== null);
  public readonly selectedBlock = computed(() => {
    const selectedId = this.selectedBlockIdSignal();
    return this.documentSignal().nodes.find((block) => block.id === selectedId) ?? null;
  });
  public readonly selectedConnection = computed(() => {
    const selectedId = this.selectedConnectionIdSignal();
    return this.documentSignal().connections.find((connection) => connection.id === selectedId) ?? null;
  });
  public readonly editingBlock = computed(() => {
    const editorState = this.nodeEditorStateSignal();
    if (!editorState?.nodeId) {
      return null;
    }

    return this.documentSignal().nodes.find((node) => node.id === editorState.nodeId) ?? null;
  });
  public readonly sharedBlocks = computed(() =>
    this.documentSignal().nodes.filter((block) => block.roleIds.length > 1)
  );
  public readonly visibleBlocks = computed(() => {
    const document = this.documentSignal();
    const filter = this.filterSignal();

    switch (filter.mode) {
      case ProjectFlowViewFilter.Role:
        return document.nodes.filter((block) => block.roleIds.includes(filter.roleId ?? ''));
      case ProjectFlowViewFilter.Shared:
        return document.nodes.filter((block) => block.roleIds.length > 1);
      default:
        return document.nodes;
    }
  });
  public readonly visibleConnections = computed(() => {
    const visibleBlockIds = new Set(this.visibleBlocks().map((block) => block.id));
    return this.documentSignal().connections.filter(
      (connection) =>
        visibleBlockIds.has(connection.sourceBlockId) && visibleBlockIds.has(connection.targetBlockId)
    );
  });
  public readonly lastSavedAt = computed(() => this.lastSavedAtSignal());
  public readonly saveState = computed(() => this.saveStateSignal());
  public readonly isReadOnly = computed(() => this.readOnlySignal());
  public readonly hasContent = computed(() => this.documentSignal().nodes.length > 0);
  public readonly activeConnectionPreview = computed(() => {
    const sourceId = this.connectionSourceIdSignal();

    if (!sourceId) {
      return null;
    }

    const sourceNode = this.documentSignal().nodes.find((node) => node.id === sourceId);

    if (!sourceNode) {
      return null;
    }

    const sourceLabel = this.connectionSourceLabelSignal();
    const sourcePoint = getFlowBlockAnchorPoint(sourceNode, 'right', sourceLabel);
    const targetId = this.connectionHoverTargetIdSignal();
    const targetNode = targetId
      ? this.documentSignal().nodes.find((node) => node.id === targetId)
      : null;
    const hoveredSide = this.connectionHoverTargetSideSignal();
    const pointer = this.connectionPointerSignal();
    const targetSide = targetNode
      ? hoveredSide ?? (pointer ? resolveNearestFlowTargetSide(targetNode, pointer) : 'left')
      : null;
    const targetPoint = targetNode && targetSide
      ? getFlowBlockAnchorPoint(targetNode, targetSide)
      : pointer;

    if (!targetPoint) {
      return null;
    }

      return {
        sourceId,
        label: sourceLabel,
        targetId,
        targetSide,
        path: buildFlowConnectionPath(sourcePoint, targetPoint, targetSide ?? 'left')
      };
  });

  public hydrate(document: ProjectWorkflow, projectId?: string, options?: HydrateOptions): void {
    const nextDocument = this.normalizeDocument(document, projectId);

    this.setDocumentState(nextDocument, nextDocument.nodes.length ? 'saved' : 'idle', options);
  }

  public setReadOnly(readOnly: boolean): void {
    this.readOnlySignal.set(readOnly);

    if (readOnly) {
      this.blockPickerOpenSignal.set(false);
      this.nodeEditorStateSignal.set(null);
      this.cancelConnection();
      this.clearSelection();
    }
  }

  public createRole(name: string): void {
    const normalizedName = name.trim();

    if (!normalizedName) {
      return;
    }

    const role: ProjectFlowRole = {
      id: this.createId('role'),
      name: normalizedName,
      createdAt: new Date().toISOString()
    };

    this.updateDocument((document) => ({
      ...document,
      roles: [...document.roles, role]
    }));
  }

  public updateRole(roleId: string, patch: Partial<Pick<ProjectFlowRole, 'name'>>): void {
    const nextName = patch.name?.trim();

    this.updateDocument((document) => ({
      ...document,
      roles: document.roles.map((role) =>
        role.id === roleId ? { ...role, name: nextName && nextName.length ? nextName : role.name } : role
      )
    }));
  }

  public deleteRole(roleId: string): void {
    this.updateDocument((document) => ({
      ...document,
      roles: document.roles.filter((role) => role.id !== roleId),
      nodes: document.nodes.map((block) => ({
        ...block,
        roleIds: block.roleIds.filter((currentRoleId) => currentRoleId !== roleId),
        updatedAt: new Date().toISOString()
      }))
    }));

    if (this.filterSignal().roleId === roleId) {
      this.filterSignal.set(DEFAULT_FILTER);
    }
  }

  public startNodeCreation(type: FlowBlockType): void {
    if (this.readOnlySignal()) {
      return;
    }

    this.blockPickerOpenSignal.set(false);
    this.nodeEditorStateSignal.set({
      mode: 'create',
      type,
      nodeId: null,
      suggestedPosition: this.getNextSuggestedPosition()
    });
  }

  public openNodeEditor(blockId: string): void {
    const block = this.documentSignal().nodes.find((node) => node.id === blockId);

    if (!block) {
      return;
    }

    this.selectBlock(blockId);
    this.blockPickerOpenSignal.set(false);
    this.nodeEditorStateSignal.set({
      mode: 'edit',
      type: block.type,
      nodeId: block.id,
      suggestedPosition: block.position
    });
  }

  public cancelNodeDraft(): void {
    this.nodeEditorStateSignal.set(null);
  }

  public commitNodeDraft(draft: ProjectWorkflowNodeDraft): void {
    if (this.readOnlySignal()) {
      return;
    }

    const { roleIds, roles } = this.resolveRoles(draft.roleNames);
    const editorState = this.nodeEditorStateSignal();

    if (!editorState) {
      return;
    }

    if (editorState.mode === 'create') {
      const now = new Date().toISOString();
      const node: ProjectWorkflowNode = {
        id: this.createId('block'),
        type: draft.type,
        title: draft.title.trim(),
        description: draft.description.trim(),
        acceptanceCriteria: this.normalizeAcceptanceCriteria(draft.acceptanceCriteria),
        position: editorState.suggestedPosition,
        roleIds,
        createdAt: now,
        updatedAt: now,
        data: draft.data as ProjectWorkflowNode['data']
      } as ProjectWorkflowNode;

      this.updateDocument((document) => ({
        ...document,
        roles,
        nodes: [...document.nodes, node]
      }));

      this.selectBlock(node.id);
      this.nodeEditorStateSignal.set(null);
      return;
    }

    this.updateDocument((document) => ({
      ...document,
      roles,
      nodes: document.nodes.map((node) =>
        node.id === editorState.nodeId
          ? ({
              ...node,
              title: draft.title.trim(),
              description: draft.description.trim(),
              acceptanceCriteria: this.normalizeAcceptanceCriteria(draft.acceptanceCriteria),
              roleIds,
              data: draft.data,
              updatedAt: new Date().toISOString()
            } as ProjectWorkflowNode)
          : node
      ) as ProjectWorkflowNode[]
    }));

    this.selectBlock(editorState.nodeId);
    this.nodeEditorStateSignal.set(null);
  }

  public moveBlock(blockId: string, position: { x: number; y: number }): void {
    this.updateDocument((document) => ({
      ...document,
      nodes: document.nodes.map((block) =>
        block.id === blockId
          ? {
              ...block,
              position: {
                x: this.clamp(position.x, 0, this.canvasSize.width - this.blockSize.width),
                y: this.clamp(position.y, 0, this.canvasSize.height - this.blockSize.height)
              },
              updatedAt: new Date().toISOString()
            }
          : block
      )
    }));
  }

  public deleteBlock(blockId: string): void {
    this.updateDocument((document) => ({
      ...document,
      nodes: document.nodes.filter((block) => block.id !== blockId),
      connections: document.connections.filter(
        (connection) => connection.sourceBlockId !== blockId && connection.targetBlockId !== blockId
      )
    }));

    if (this.selectedBlockIdSignal() === blockId) {
      this.selectedBlockIdSignal.set(null);
    }

    if (this.connectionSourceIdSignal() === blockId) {
      this.cancelConnection();
    }
  }

  public connectBlocks(sourceBlockId: string, targetBlockId: string, label?: string, targetSide?: ProjectFlowConnectionSide): void {
    if (sourceBlockId === targetBlockId) {
      return;
    }

    const normalizedLabel = label?.trim() || '';
    const alreadyExists = this.documentSignal().connections.some(
      (connection) =>
        connection.sourceBlockId === sourceBlockId && connection.targetBlockId === targetBlockId
    );

    if (alreadyExists) {
      this.cancelConnection();
      return;
    }

    const sourceNode = this.documentSignal().nodes.find((node) => node.id === sourceBlockId);
    const duplicatedDecisionBranch = sourceNode?.type === FlowBlockType.Decision
      && isDecisionBranchLabel(normalizedLabel)
      && this.documentSignal().connections.some(
        (connection) => connection.sourceBlockId === sourceBlockId && connection.label === normalizedLabel
      );

    if (duplicatedDecisionBranch) {
      this.cancelConnection();
      return;
    }

    const connection: ProjectFlowConnection = {
      id: this.createId('connection'),
      sourceBlockId,
      targetBlockId,
      label: normalizedLabel,
      targetSide,
      createdAt: new Date().toISOString()
    };

    this.updateDocument((document) => ({
      ...document,
      connections: [...document.connections, connection]
    }));

    this.connectionSourceIdSignal.set(null);
    this.connectionPointerSignal.set(null);
    this.connectionHoverTargetIdSignal.set(null);
    this.connectionHoverTargetSideSignal.set(null);
    this.selectConnection(connection.id);
  }

  public updateConnection(connectionId: string, patch: Partial<Pick<ProjectFlowConnection, 'label'>>): void {
    this.updateDocument((document) => ({
      ...document,
      connections: document.connections.map((connection) =>
        connection.id === connectionId ? { ...connection, label: patch.label?.trim() ?? '' } : connection
      )
    }));
  }

  public deleteConnection(connectionId: string): void {
    this.updateDocument((document) => ({
      ...document,
      connections: document.connections.filter((connection) => connection.id !== connectionId)
    }));

    if (this.selectedConnectionIdSignal() === connectionId) {
      this.selectedConnectionIdSignal.set(null);
    }
  }

  public setFilter(filter: ProjectFlowFilterState): void {
    this.filterSignal.set(filter);
  }

  public setViewport(viewport: CanvasViewport): void {
    this.viewportSignal.set({
      panX: viewport.panX,
      panY: viewport.panY,
      zoom: this.clamp(viewport.zoom, 0.2, 1.8)
    });
  }

  public resetView(): void {
    this.viewportSignal.set(DEFAULT_VIEWPORT);
  }

  public zoomBy(delta: number): void {
    this.viewportSignal.update((viewport) => ({
      ...viewport,
      zoom: this.clamp(Number((viewport.zoom + delta).toFixed(2)), 0.2, 1.8)
    }));
  }

  public panBy(deltaX: number, deltaY: number): void {
    this.viewportSignal.update((viewport) => ({
      ...viewport,
      panX: viewport.panX + deltaX,
      panY: viewport.panY + deltaY
    }));
  }

  public startConnectionDrag(blockId: string, label?: DecisionBranchLabel): void {
    if (this.readOnlySignal()) {
      return;
    }

    this.connectionSourceIdSignal.set(blockId);
    this.connectionSourceLabelSignal.set(label ?? null);
    this.connectionPointerSignal.set(this.getOutputHandlePoint(blockId, label));
    this.connectionHoverTargetIdSignal.set(null);
    this.connectionHoverTargetSideSignal.set(null);
    this.selectBlock(blockId);
  }

  public updateConnectionPointer(point: ConnectionPreviewPoint): void {
    if (!this.connectionSourceIdSignal()) {
      return;
    }

    this.connectionPointerSignal.set(point);
  }

  public setConnectionHoverTarget(blockId: string | null): void {
    const sourceId = this.connectionSourceIdSignal();
    const pointer = this.connectionPointerSignal();

    if (!sourceId || !blockId || blockId === sourceId) {
      this.connectionHoverTargetIdSignal.set(null);
      this.connectionHoverTargetSideSignal.set(null);
      return;
    }

    const targetNode = this.documentSignal().nodes.find((node) => node.id === blockId);

    this.connectionHoverTargetIdSignal.set(blockId);
    this.connectionHoverTargetSideSignal.set(
      targetNode && pointer ? resolveNearestFlowTargetSide(targetNode, pointer) : 'left'
    );
  }

  public completeConnectionDrag(): void {
    const sourceId = this.connectionSourceIdSignal();
    const targetId = this.connectionHoverTargetIdSignal();

    if (!sourceId || !targetId) {
      this.cancelConnection();
      return;
    }

    this.connectBlocks(
      sourceId,
      targetId,
      this.connectionSourceLabelSignal() ?? undefined,
      this.connectionHoverTargetSideSignal() ?? undefined
    );
  }

  public cancelConnection(): void {
    this.connectionSourceIdSignal.set(null);
    this.connectionSourceLabelSignal.set(null);
    this.connectionPointerSignal.set(null);
    this.connectionHoverTargetIdSignal.set(null);
    this.connectionHoverTargetSideSignal.set(null);
  }

  public openBlockPicker(): void {
    if (this.readOnlySignal()) {
      return;
    }

    this.blockPickerOpenSignal.set(true);
  }

  public closeBlockPicker(): void {
    this.blockPickerOpenSignal.set(false);
  }

  public selectBlock(blockId: string | null): void {
    this.selectedBlockIdSignal.set(blockId);
    this.selectedConnectionIdSignal.set(null);
  }

  public selectConnection(connectionId: string | null): void {
    this.selectedConnectionIdSignal.set(connectionId);
    this.selectedBlockIdSignal.set(null);
  }

  public clearSelection(): void {
    this.selectedBlockIdSignal.set(null);
    this.selectedConnectionIdSignal.set(null);
  }

  public getRoleName(roleId: string): string {
    return this.documentSignal().roles.find((role) => role.id === roleId)?.name ?? 'Rol sin nombre';
  }

  public isConnectionTarget(blockId: string): boolean {
    const sourceId = this.connectionSourceIdSignal();
    return Boolean(sourceId && sourceId !== blockId);
  }

  public isHoveredConnectionTarget(blockId: string): boolean {
    return this.connectionHoverTargetIdSignal() === blockId;
  }

  public getRoleNames(roleIds: string[]): string[] {
    return roleIds.map((roleId) => this.getRoleName(roleId));
  }

  public getDraftFromNode(node: ProjectWorkflowNode): ProjectWorkflowNodeDraft {
    return {
      type: node.type,
      title: node.title,
      description: node.description,
      acceptanceCriteria: [...node.acceptanceCriteria],
      roleNames: this.getRoleNames(node.roleIds),
      data: structuredClone(node.data)
    } as ProjectWorkflowNodeDraft;
  }

  public getDefaultDraft(type: FlowBlockType): ProjectWorkflowNodeDraft {
    return {
      type,
      title: FLOW_BLOCK_TYPE_LABELS[type],
      description: '',
      acceptanceCriteria: [],
      roleNames: [],
      data: createDefaultNodeData(type)
    } as ProjectWorkflowNodeDraft;
  }

  private updateDocument(projector: (document: ProjectWorkflow) => ProjectWorkflow): void {
    if (this.readOnlySignal()) {
      return;
    }

    const nextDocument = projector(this.documentSignal());
    const stampedDocument: ProjectWorkflow = {
      ...nextDocument,
      updatedAt: new Date().toISOString()
    };

    this.documentSignal.set(stampedDocument);
    this.lastSavedAtSignal.set(stampedDocument.updatedAt);
    this.saveStateSignal.set('saved');
  }

  private setDocumentState(document: ProjectWorkflow, saveState: SaveState, options?: HydrateOptions): void {
    const preserveViewport = options?.preserveViewport ?? false;
    const preserveSelection = options?.preserveSelection ?? false;
    const selectedBlockId = preserveSelection ? this.selectedBlockIdSignal() : null;
    const selectedConnectionId = preserveSelection ? this.selectedConnectionIdSignal() : null;

    this.documentSignal.set(document);
    this.filterSignal.set(DEFAULT_FILTER);
    if (!preserveViewport) {
      this.viewportSignal.set(DEFAULT_VIEWPORT);
    }
    this.selectedBlockIdSignal.set(
      selectedBlockId && document.nodes.some((node) => node.id === selectedBlockId) ? selectedBlockId : null
    );
    this.selectedConnectionIdSignal.set(
      selectedConnectionId && document.connections.some((connection) => connection.id === selectedConnectionId)
        ? selectedConnectionId
        : null
    );
    this.connectionSourceIdSignal.set(null);
    this.connectionSourceLabelSignal.set(null);
    this.connectionPointerSignal.set(null);
    this.connectionHoverTargetIdSignal.set(null);
    this.connectionHoverTargetSideSignal.set(null);
    this.blockPickerOpenSignal.set(false);
    this.nodeEditorStateSignal.set(null);
    this.lastSavedAtSignal.set(document.updatedAt || null);
    this.saveStateSignal.set(saveState);
  }

  private createEmptyDocument(projectId: string): ProjectWorkflow {
    return {
      projectId,
      roles: [],
      nodes: [],
      connections: [],
      updatedAt: new Date().toISOString()
    };
  }

  private normalizeDocument(document: Partial<ProjectWorkflow> & { blocks?: ProjectWorkflowNode[] }, projectId?: string): ProjectWorkflow {
    const legacyNodes = Array.isArray(document.blocks) ? document.blocks : [];
    const incomingNodes = Array.isArray(document.nodes) ? document.nodes : legacyNodes;

    return {
      projectId: projectId ?? document.projectId ?? '',
      roles: Array.isArray(document.roles) ? [...document.roles] : [],
      nodes: incomingNodes.map((node) => {
        const roleIds = Array.isArray(node.roleIds) ? [...node.roleIds] : [];
        const mergedData = {
          ...createDefaultNodeData(node.type),
          ...(node.data ?? {})
        } as ProjectWorkflowNode['data'];

        if (node.type === FlowBlockType.Module) {
          const moduleData = mergedData as ProjectWorkflowNode['data'] & {
            rolePermissions: ModuleRolePermission[];
            concurrentUsers: string;
            peakBusinessHours: ModulePeakPeriod[];
          };
          const rawPermissions =
            node.data && typeof node.data === 'object' && Array.isArray((node.data as { rolePermissions?: ModuleRolePermission[] }).rolePermissions)
              ? (node.data as { rolePermissions: ModuleRolePermission[] }).rolePermissions
              : [];
          const rawPeakBusinessHours =
            node.data && typeof node.data === 'object' && Array.isArray((node.data as { peakBusinessHours?: ModulePeakPeriod[] }).peakBusinessHours)
              ? (node.data as { peakBusinessHours: ModulePeakPeriod[] }).peakBusinessHours
              : [];

          moduleData.rolePermissions = rawPermissions.length > 0
            ? rawPermissions
                .map((permission) => ({
                  roleId: String(permission.roleId ?? '').trim(),
                  permissions: Array.isArray(permission.permissions)
                    ? permission.permissions.filter(isModulePermissionAction)
                    : []
                }))
                .filter((permission) => permission.roleId.length > 0)
            : roleIds.map((roleId) => ({
                roleId,
                permissions: ['Ver'] as ModulePermissionAction[]
              }));
          moduleData.concurrentUsers = String(
            node.data && typeof node.data === 'object'
              ? (node.data as { concurrentUsers?: string }).concurrentUsers ?? ''
              : ''
          ).trim();
          moduleData.peakBusinessHours = rawPeakBusinessHours.length > 0
            ? rawPeakBusinessHours.map((period) => ({
                days: Array.isArray(period.days)
                  ? period.days.map((day) => String(day ?? '').trim()).filter(Boolean)
                  : [],
                startTime: String(period.startTime ?? '').trim(),
                endTime: String(period.endTime ?? '').trim()
              }))
            : [{
                days: [],
                startTime: '00:00',
                endTime: '00:00'
              }];
        }

        return {
          ...node,
          acceptanceCriteria: this.normalizeAcceptanceCriteria(
            Array.isArray((node as ProjectWorkflowNode & { acceptanceCriteria?: string[] }).acceptanceCriteria)
              ? (node as ProjectWorkflowNode & { acceptanceCriteria: string[] }).acceptanceCriteria
              : typeof (node as ProjectWorkflowNode & { acceptanceCriteria?: string }).acceptanceCriteria === 'string'
                ? (node as ProjectWorkflowNode & { acceptanceCriteria: string }).acceptanceCriteria
                : (
                  node.type === FlowBlockType.Module
                    && node.data
                    && typeof node.data === 'object'
                    && typeof (node.data as { acceptanceCriteria?: string }).acceptanceCriteria === 'string'
                )
                  ? String((node.data as { acceptanceCriteria?: string }).acceptanceCriteria ?? '')
                  : []
          ),
          data: mergedData,
          roleIds,
          updatedAt: node.updatedAt || new Date().toISOString(),
          createdAt: node.createdAt || new Date().toISOString()
        };
      }) as ProjectWorkflowNode[],
      connections: Array.isArray(document.connections)
        ? document.connections.map((connection) => ({
            ...connection,
            targetSide:
              connection.targetSide === 'left'
              || connection.targetSide === 'top'
              || connection.targetSide === 'bottom'
                ? connection.targetSide
                : connection.targetSide === 'right'
                  ? 'left'
                  : undefined
          }))
        : [],
      updatedAt: document.updatedAt || new Date().toISOString()
    };
  }

  private getOutputHandlePoint(blockId: string, label?: string | null): ConnectionPreviewPoint | null {
    const block = this.documentSignal().nodes.find((node) => node.id === blockId);

    if (!block) {
      return null;
    }

    return getFlowBlockAnchorPoint(block, 'right', label);
  }

  private getNextSuggestedPosition(): { x: number; y: number } {
    const nodes = this.documentSignal().nodes;
    const anchorBlock =
      this.selectedBlock() ??
      nodes[nodes.length - 1];

    if (anchorBlock) {
      const horizontalSpacing = 296;
      const verticalSpacing = 176;
      let nextX = anchorBlock.position.x + horizontalSpacing;
      let nextY = anchorBlock.position.y;

      if (nextX > this.canvasSize.width - this.blockSize.width - 40) {
        nextX = Math.max(40, anchorBlock.position.x - horizontalSpacing);
        nextY = Math.min(
          this.canvasSize.height - this.blockSize.height - 40,
          anchorBlock.position.y + verticalSpacing
        );
      }

      return { x: nextX, y: nextY };
    }

    const viewport = this.viewportSignal();
    const visibleViewportWidth = 960;
    const visibleViewportHeight = 640;
    const anchorX = 120;
    const anchorY = 96;
    const x = Math.max(
      0,
      (anchorX - viewport.panX + visibleViewportWidth * 0.5) / viewport.zoom - this.blockSize.width / 2
    );
    const y = Math.max(
      0,
      (anchorY - viewport.panY + visibleViewportHeight * 0.4) / viewport.zoom - this.blockSize.height / 2
    );

    return { x, y };
  }

  private resolveRoles(roleNames: string[]): { roleIds: string[]; roles: ProjectFlowRole[] } {
    const uniqueRoleNames = [...new Set(roleNames.map((name) => name.trim()).filter(Boolean))];
    const document = this.documentSignal();
    const knownRoles = [...document.roles];
    const resolvedRoleIds: string[] = [];

    for (const roleName of uniqueRoleNames) {
      const existingRole = knownRoles.find((role) => role.name.toLowerCase() === roleName.toLowerCase());

      if (existingRole) {
        resolvedRoleIds.push(existingRole.id);
        continue;
      }

      const newRole: ProjectFlowRole = {
        id: this.createId('role'),
        name: roleName,
        createdAt: new Date().toISOString()
      };

      knownRoles.push(newRole);
      resolvedRoleIds.push(newRole.id);
    }

    return {
      roleIds: resolvedRoleIds,
      roles: knownRoles
    };
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private normalizeAcceptanceCriteria(value: string[] | string | null | undefined): string[] {
    if (Array.isArray(value)) {
      return value
        .map((criterion) => String(criterion ?? '').trim())
        .filter(Boolean);
    }

    return String(value ?? '')
      .split('\n')
      .map((criterion) => criterion.trim())
      .filter(Boolean);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}


