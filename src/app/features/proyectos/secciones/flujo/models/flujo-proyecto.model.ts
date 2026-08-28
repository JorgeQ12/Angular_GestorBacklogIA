export enum FlowBlockType {
  Module = 'module',
  Screen = 'screen',
  Action = 'action',
  Decision = 'decision',
  Form = 'form'
}

export enum ProjectFlowViewFilter {
  All = 'all',
  Shared = 'shared',
  Role = 'role'
}

export interface CanvasViewport {
  panX: number;
  panY: number;
  zoom: number;
}

export interface ProjectFlowRole {
  id: string;
  name: string;
  createdAt: string;
}

export interface ProjectFlowBlockPosition {
  x: number;
  y: number;
}

export type DecisionBranchLabel = 'Si' | 'No';
export type ModulePermissionAction = 'Ver' | 'Crear' | 'Editar' | 'Eliminar';

export interface ModuleRolePermission {
  roleId: string;
  permissions: ModulePermissionAction[];
}

export interface ModulePeakPeriod {
  days: string[];
  startTime: string;
  endTime: string;
}

export interface ModuleNodeData {
  rolePermissions: ModuleRolePermission[];
  concurrentUsers: string;
  peakBusinessHours: ModulePeakPeriod[];
}

export interface ScreenNodeData {}

export interface ActionNodeData {}

export interface DecisionNodeData {}

export interface FormNodeData {
  capturedData: string;
  requiredFields: string;
  completionOutcome: string;
}

export type ProjectWorkflowNodeData =
  | ModuleNodeData
  | ScreenNodeData
  | ActionNodeData
  | DecisionNodeData
  | FormNodeData;

export interface ProjectWorkflowNodeBase {
  id: string;
  type: FlowBlockType;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  position: ProjectFlowBlockPosition;
  roleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWorkflowNodeDraftBase {
  type: FlowBlockType;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  roleNames: string[];
}

export interface ProjectWorkflowModuleNode extends ProjectWorkflowNodeBase {
  type: FlowBlockType.Module;
  data: ModuleNodeData;
}

export interface ProjectWorkflowScreenNode extends ProjectWorkflowNodeBase {
  type: FlowBlockType.Screen;
  data: ScreenNodeData;
}

export interface ProjectWorkflowActionNode extends ProjectWorkflowNodeBase {
  type: FlowBlockType.Action;
  data: ActionNodeData;
}

export interface ProjectWorkflowDecisionNode extends ProjectWorkflowNodeBase {
  type: FlowBlockType.Decision;
  data: DecisionNodeData;
}

export interface ProjectWorkflowFormNode extends ProjectWorkflowNodeBase {
  type: FlowBlockType.Form;
  data: FormNodeData;
}

export type ProjectWorkflowNode =
  | ProjectWorkflowModuleNode
  | ProjectWorkflowScreenNode
  | ProjectWorkflowActionNode
  | ProjectWorkflowDecisionNode
  | ProjectWorkflowFormNode;

export type ProjectWorkflowNodeDraft =
  | (ProjectWorkflowNodeDraftBase & { type: FlowBlockType.Module; data: ModuleNodeData })
  | (ProjectWorkflowNodeDraftBase & { type: FlowBlockType.Screen; data: ScreenNodeData })
  | (ProjectWorkflowNodeDraftBase & { type: FlowBlockType.Action; data: ActionNodeData })
  | (ProjectWorkflowNodeDraftBase & { type: FlowBlockType.Decision; data: DecisionNodeData })
  | (ProjectWorkflowNodeDraftBase & { type: FlowBlockType.Form; data: FormNodeData });

export type ProjectFlowConnectionSide = 'left' | 'right' | 'top' | 'bottom';

export interface ProjectFlowConnection {
  id: string;
  sourceBlockId: string;
  targetBlockId: string;
  label?: string;
  targetSide?: ProjectFlowConnectionSide;
  createdAt: string;
}

export interface ProjectWorkflow {
  projectId: string;
  roles: ProjectFlowRole[];
  nodes: ProjectWorkflowNode[];
  connections: ProjectFlowConnection[];
  updatedAt: string;
}

export type ProjectFlowBlock = ProjectWorkflowNode;
export type ProjectFlowDocument = ProjectWorkflow;
export type ProjectWorkflowConnection = ProjectFlowConnection;

export interface ProjectFlowFilterState {
  mode: ProjectFlowViewFilter;
  roleId: string | null;
}

export interface ProjectFlowCanvasSize {
  width: number;
  height: number;
}

export const PROJECT_FLOW_CANVAS_SIZE: ProjectFlowCanvasSize = {
  width: 2400,
  height: 1600
};

export const PROJECT_FLOW_BLOCK_SIZE = {
  width: 248,
  height: 156
} as const;

// Los handles visuales sobresalen 1px respecto al borde real de la card.
// Estas constantes alinean la conexion SVG con el centro visible de esos puntos.
export const PROJECT_FLOW_HANDLE_CENTER_OFFSET_X = 1;
export const PROJECT_FLOW_HANDLE_CENTER_OFFSET_Y = PROJECT_FLOW_BLOCK_SIZE.height / 2;
export const PROJECT_FLOW_VERTICAL_ARROW_CLEARANCE = 3;
export const PROJECT_FLOW_DECISION_HANDLE_Y: Record<DecisionBranchLabel, number> = {
  Si: 74,
  No: 114
};

export const FLOW_BLOCK_TYPE_LABELS: Record<FlowBlockType, string> = {
  [FlowBlockType.Module]: 'Módulo',
  [FlowBlockType.Screen]: 'Página',
  [FlowBlockType.Action]: 'Acción',
  [FlowBlockType.Decision]: 'Decisión',
  [FlowBlockType.Form]: 'Componente'
};

export const FLOW_BLOCK_TYPE_DESCRIPTIONS: Record<FlowBlockType, string> = {
  [FlowBlockType.Module]: 'Agrupa una capacidad funcional del proyecto.',
  [FlowBlockType.Screen]: 'Representa una página que el usuario utiliza.',
  [FlowBlockType.Action]: 'Describe una acción que el usuario ejecuta.',
  [FlowBlockType.Decision]: 'Expresa una bifurcación por criterio de negocio.',
  [FlowBlockType.Form]: 'Representa un componente que captura o presenta información dentro del flujo.'
};

export const FLOW_BLOCK_TYPE_ORDER: readonly FlowBlockType[] = [
  FlowBlockType.Module,
  FlowBlockType.Screen,
  FlowBlockType.Action,
  FlowBlockType.Decision,
  FlowBlockType.Form
];

export const createDefaultNodeData = (type: FlowBlockType): ProjectWorkflowNodeData => {
  switch (type) {
    case FlowBlockType.Module:
      return {
        rolePermissions: [],
        concurrentUsers: '',
        peakBusinessHours: [
          {
            days: [],
            startTime: '00:00',
            endTime: '00:00'
          }
        ]
      };
    case FlowBlockType.Screen:
      return {};
    case FlowBlockType.Action:
      return {};
    case FlowBlockType.Decision:
      return {};
    case FlowBlockType.Form:
      return {
        capturedData: '',
        requiredFields: '',
        completionOutcome: ''
      };
  }
};

export const isDecisionBranchLabel = (value: string | null | undefined): value is DecisionBranchLabel =>
  value === 'Si' || value === 'No';

export const isModulePermissionAction = (value: string | null | undefined): value is ModulePermissionAction =>
  value === 'Ver' || value === 'Crear' || value === 'Editar' || value === 'Eliminar';

export const getFlowOutputHandleOffsetY = (
  type: FlowBlockType,
  label?: string | null
): number => {
  if (type === FlowBlockType.Decision && isDecisionBranchLabel(label)) {
    return PROJECT_FLOW_DECISION_HANDLE_Y[label];
  }

  return PROJECT_FLOW_HANDLE_CENTER_OFFSET_Y;
};

export const getFlowBlockAnchorPoint = (
  block: Pick<ProjectWorkflowNode, 'position' | 'type'>,
  side: ProjectFlowConnectionSide,
  label?: string | null
): { x: number; y: number } => {
  const left = block.position.x - PROJECT_FLOW_HANDLE_CENTER_OFFSET_X;
  const right = block.position.x + PROJECT_FLOW_BLOCK_SIZE.width + PROJECT_FLOW_HANDLE_CENTER_OFFSET_X;
  const centerX = block.position.x + (PROJECT_FLOW_BLOCK_SIZE.width / 2);
  const top = block.position.y;
  const bottom = block.position.y + PROJECT_FLOW_BLOCK_SIZE.height;
  const centerY = block.position.y + getFlowOutputHandleOffsetY(block.type, label);

  switch (side) {
    case 'left':
      return { x: left, y: block.position.y + PROJECT_FLOW_HANDLE_CENTER_OFFSET_Y };
    case 'right':
      return { x: right, y: centerY };
    case 'top':
      return { x: centerX, y: top - PROJECT_FLOW_VERTICAL_ARROW_CLEARANCE };
    case 'bottom':
      return { x: centerX, y: bottom + PROJECT_FLOW_VERTICAL_ARROW_CLEARANCE };
  }
};

export const resolveNearestFlowConnectionSide = (
  block: Pick<ProjectWorkflowNode, 'position'>,
  point: { x: number; y: number }
): ProjectFlowConnectionSide => {
  const distances: Record<ProjectFlowConnectionSide, number> = {
    left: Math.abs(point.x - block.position.x),
    right: Math.abs(point.x - (block.position.x + PROJECT_FLOW_BLOCK_SIZE.width)),
    top: Math.abs(point.y - block.position.y),
    bottom: Math.abs(point.y - (block.position.y + PROJECT_FLOW_BLOCK_SIZE.height))
  };

  return (Object.entries(distances).sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'left') as ProjectFlowConnectionSide;
};

export const resolveNearestFlowTargetSide = (
  block: Pick<ProjectWorkflowNode, 'position'>,
  point: { x: number; y: number }
): Exclude<ProjectFlowConnectionSide, 'right'> => {
  const distances: Record<Exclude<ProjectFlowConnectionSide, 'right'>, number> = {
    left: Math.abs(point.x - block.position.x),
    top: Math.abs(point.y - block.position.y),
    bottom: Math.abs(point.y - (block.position.y + PROJECT_FLOW_BLOCK_SIZE.height))
  };

  return (Object.entries(distances).sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'left') as Exclude<ProjectFlowConnectionSide, 'right'>;
};

export const buildFlowConnectionPath = (
  sourcePoint: { x: number; y: number },
  targetPoint: { x: number; y: number },
  targetSide: ProjectFlowConnectionSide
): string => {
  const horizontalOffset = Math.max(72, Math.abs(targetPoint.x - sourcePoint.x) / 2);
  const verticalOffset = Math.max(56, Math.abs(targetPoint.y - sourcePoint.y) / 2);
  const verticalStem = 14;

  switch (targetSide) {
    case 'top':
      return `M ${sourcePoint.x} ${sourcePoint.y} C ${sourcePoint.x + horizontalOffset} ${sourcePoint.y}, ${targetPoint.x} ${targetPoint.y - verticalStem - verticalOffset}, ${targetPoint.x} ${targetPoint.y - verticalStem} L ${targetPoint.x} ${targetPoint.y}`;
    case 'bottom':
      return `M ${sourcePoint.x} ${sourcePoint.y} C ${sourcePoint.x + horizontalOffset} ${sourcePoint.y}, ${targetPoint.x} ${targetPoint.y + verticalStem + verticalOffset}, ${targetPoint.x} ${targetPoint.y + verticalStem} L ${targetPoint.x} ${targetPoint.y}`;
    case 'right':
      return `M ${sourcePoint.x} ${sourcePoint.y} C ${sourcePoint.x + horizontalOffset} ${sourcePoint.y}, ${targetPoint.x + horizontalOffset} ${targetPoint.y}, ${targetPoint.x} ${targetPoint.y}`;
    case 'left':
    default:
      return `M ${sourcePoint.x} ${sourcePoint.y} C ${sourcePoint.x + horizontalOffset} ${sourcePoint.y}, ${targetPoint.x - horizontalOffset} ${targetPoint.y}, ${targetPoint.x} ${targetPoint.y}`;
  }
};


