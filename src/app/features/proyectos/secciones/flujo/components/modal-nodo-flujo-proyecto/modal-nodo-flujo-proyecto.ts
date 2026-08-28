import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../../../../shared/components/modal/modal';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ICONOS_TIPO_BLOQUE_FLUJO } from '../../config/flujo-proyecto.config';
import {
  FLOW_BLOCK_TYPE_LABELS,
  FLOW_BLOCK_TYPE_DESCRIPTIONS,
  FlowBlockType,
  isModulePermissionAction,
  ModulePeakPeriod,
  ModuleRolePermission,
  ProjectWorkflowNodeDraft
} from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { FormularioAccionFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-accion-flujo-proyecto';
import { FormularioDecisionFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-decision-flujo-proyecto';
import { FormularioComponenteFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-componente-flujo-proyecto';
import { FormularioModuloFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-modulo-flujo-proyecto';
import { FormularioPaginaFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-pagina-flujo-proyecto';

@Component({
  selector: 'app-modal-nodo-flujo-proyecto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    Modal,
    IconoComponent,
    FormularioModuloFlujoProyecto,
    FormularioPaginaFlujoProyecto,
    FormularioAccionFlujoProyecto,
    FormularioDecisionFlujoProyecto,
    FormularioComponenteFlujoProyecto
  ],
  templateUrl: './modal-nodo-flujo-proyecto.html',
  styleUrl: './modal-nodo-flujo-proyecto.css'
})
export class ModalNodoFlujoProyecto {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  protected readonly store = inject(EstadoEditorFlujoProyectoService);
  private readonly formSignal = signal<FormGroup>(this.formBuilder.group({}));

  protected readonly editorState = this.store.nodeEditorState;
  protected readonly form = computed(() => this.formSignal());
  protected readonly formId = 'app-modal-nodo-flujo-proyecto-form';
  protected readonly typeIcons = ICONOS_TIPO_BLOQUE_FLUJO;
  protected readonly modalEyebrow = computed(() =>
    this.store.isReadOnly()
      ? 'Versión histórica'
      : this.editorState()?.mode === 'create' ? 'Nuevo bloque del flujo' : 'Edición del bloque'
  );
  protected readonly primaryActionText = computed(() =>
    this.editorState()?.mode === 'create' ? 'Crear bloque' : 'Guardar cambios'
  );
  protected readonly typeLabel = computed(() => {
    const type = this.editorState()?.type;
    return type ? FLOW_BLOCK_TYPE_LABELS[type] : '';
  });
  protected readonly typeDescription = computed(() => {
    const type = this.editorState()?.type;
    return type ? FLOW_BLOCK_TYPE_DESCRIPTIONS[type] : '';
  });
  protected readonly modalTitle = computed(() => {
    const editorState = this.editorState();

    if (!editorState) {
      return '';
    }

    if (this.store.isReadOnly()) {
      return `Detalle de ${this.getTypeLabel(editorState.type)}`;
    }

    return editorState.mode === 'create'
      ? `Configurar ${this.getTypeLabel(editorState.type)}`
      : `Editar ${this.getTypeLabel(editorState.type)}`;
  });
  protected readonly modalDescription = computed(() => {
    const editorState = this.editorState();
    if (!editorState) {
      return '';
    }

    if (this.store.isReadOnly()) {
      return 'Consulta la información que tenía este bloque en la versión seleccionada.';
    }

    return editorState.mode === 'create'
      ? 'Completa la información necesaria antes de incorporar este bloque al recorrido.'
      : 'Actualiza la información del bloque sin perder sus conexiones actuales.';
  });

  public constructor() {
    effect(() => {
      const editorState = this.store.nodeEditorState();

      if (!editorState) {
        return;
      }

      const readOnly = this.store.isReadOnly();
      const draft = editorState.mode === 'edit' && this.store.editingBlock()
        ? this.store.getDraftFromNode(this.store.editingBlock()!)
        : this.store.getDefaultDraft(editorState.type);

      const form = this.buildForm(draft);
      if (readOnly) {
        form.disable({ emitEvent: false });
      }
      this.formSignal.set(form);
    });
  }

  protected close(): void {
    this.store.cancelNodeDraft();
  }

  protected save(): void {
    if (this.store.isReadOnly()) {
      return;
    }

    const form = this.form();

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.store.commitNodeDraft(this.mapFormToDraft(form.getRawValue() as Record<string, unknown>));
  }

  private buildForm(draft: ProjectWorkflowNodeDraft): FormGroup {
    const commonControls = {
      title: this.formBuilder.control(draft.title, Validators.required),
      description: this.formBuilder.control(draft.description, Validators.required),
      acceptanceCriteria: this.createAcceptanceCriteriaArray(draft.acceptanceCriteria),
      roleNames: this.formBuilder.control(draft.roleNames.join(', '), Validators.required)
    };

    switch (draft.type) {
      case FlowBlockType.Module:
        return this.formBuilder.group({
          ...commonControls,
          rolePermissions: this.formBuilder.control<ModuleRolePermission[]>(draft.data.rolePermissions ?? []),
          concurrentUsers: this.formBuilder.control(draft.data.concurrentUsers, Validators.required),
          peakBusinessHours: this.createPeakBusinessHoursArray(draft.data.peakBusinessHours)
        });
      case FlowBlockType.Screen:
        return this.formBuilder.group(commonControls);
      case FlowBlockType.Action:
        return this.formBuilder.group(commonControls);
      case FlowBlockType.Decision:
        return this.formBuilder.group(commonControls);
      case FlowBlockType.Form:
        return this.formBuilder.group({
          ...commonControls,
          capturedData: this.formBuilder.control(draft.data.capturedData, Validators.required),
          requiredFields: this.formBuilder.control(draft.data.requiredFields, Validators.required),
          completionOutcome: this.formBuilder.control(draft.data.completionOutcome, Validators.required)
        });
    }
  }

  private mapFormToDraft(rawValue: Record<string, unknown>): ProjectWorkflowNodeDraft {
    const editorState = this.store.nodeEditorState();

    if (!editorState) {
      throw new Error('No hay editor de nodo activo.');
    }

    const read = (key: string): string => String(rawValue[key] ?? '');
    const readRolePermissions = (): ModuleRolePermission[] => {
      const rawPermissions = rawValue['rolePermissions'];

      if (!Array.isArray(rawPermissions)) {
        return [];
      }

      return rawPermissions
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const roleId = String((item as { roleId?: string }).roleId ?? '').trim();
          const permissions = Array.isArray((item as { permissions?: string[] }).permissions)
            ? (item as { permissions: string[] }).permissions.filter(isModulePermissionAction)
            : [];

          if (!roleId) {
            return null;
          }

          return {
            roleId,
            permissions
          };
        })
        .filter((item): item is ModuleRolePermission => Boolean(item));
    };
    const readPeakBusinessHours = (): ModulePeakPeriod[] => {
      const rawPeakBusinessHours = rawValue['peakBusinessHours'];

      if (!Array.isArray(rawPeakBusinessHours)) {
        return [{
          days: [],
          startTime: '00:00',
          endTime: '00:00'
        }];
      }

      const periods = rawPeakBusinessHours
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const candidate = item as {
            days?: unknown;
            startTime?: unknown;
            endTime?: unknown;
          };

          return {
            days: Array.isArray(candidate.days)
              ? candidate.days.map((day) => String(day ?? '').trim()).filter(Boolean)
              : [],
            startTime: String(candidate.startTime ?? '').trim(),
            endTime: String(candidate.endTime ?? '').trim()
          };
        })
        .filter((item): item is ModulePeakPeriod => Boolean(item));

      return periods.length > 0
        ? periods
        : [{
            days: [],
            startTime: '00:00',
            endTime: '00:00'
          }];
    };
    const commonDraft = {
      type: editorState.type,
      title: read('title').trim(),
      description: read('description').trim(),
      acceptanceCriteria: this.readStringArray(rawValue['acceptanceCriteria']),
      roleNames: this.parseList(read('roleNames'))
    };

    switch (editorState.type) {
      case FlowBlockType.Module:
        return {
          ...commonDraft,
          type: FlowBlockType.Module,
          data: {
            rolePermissions: readRolePermissions(),
            concurrentUsers: read('concurrentUsers').trim(),
            peakBusinessHours: readPeakBusinessHours()
          }
        };
      case FlowBlockType.Screen:
        return {
          ...commonDraft,
          type: FlowBlockType.Screen,
          data: {}
        };
      case FlowBlockType.Action:
        return {
          ...commonDraft,
          type: FlowBlockType.Action,
          data: {}
        };
      case FlowBlockType.Decision:
        return {
          ...commonDraft,
          type: FlowBlockType.Decision,
          data: {}
        };
      case FlowBlockType.Form:
        return {
          ...commonDraft,
          type: FlowBlockType.Form,
          data: {
            capturedData: read('capturedData').trim(),
            requiredFields: read('requiredFields').trim(),
            completionOutcome: read('completionOutcome').trim()
          }
        };
    }
  }

  private parseList(value: string): string[] {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private createAcceptanceCriteriaArray(criteria: string[]): FormArray<FormControl<string>> {
    const controls = (criteria.length ? criteria : [''])
      .map((criterion) => this.formBuilder.control(criterion, Validators.required));

    return this.formBuilder.array<FormControl<string>>(controls);
  }

  private createPeakBusinessHoursArray(periods: ModulePeakPeriod[]): FormArray<FormGroup> {
    const controls = (periods.length ? periods : [{
      days: [],
      startTime: '00:00',
      endTime: '00:00'
    }]).map((period) => this.formBuilder.group({
      days: this.formBuilder.control<string[]>(period.days ?? []),
      startTime: this.formBuilder.control(period.startTime ?? ''),
      endTime: this.formBuilder.control(period.endTime ?? '')
    }));

    return this.formBuilder.array<FormGroup>(controls);
  }

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean);
  }

  private getTypeLabel(type: FlowBlockType): string {
    return FLOW_BLOCK_TYPE_LABELS[type].toLowerCase();
  }

}

