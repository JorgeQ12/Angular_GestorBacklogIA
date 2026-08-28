import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModulePermissionAction,
  ModuleRolePermission,
  ProjectFlowRole
} from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

@Component({
  selector: 'project-flow-node-common-fields',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, ReactiveFormsModule],
  templateUrl: './campos-comunes-nodo-flujo-proyecto.html',
  styleUrl: './campos-comunes-nodo-flujo-proyecto.css'
})
export class CamposComunesNodoFlujoProyecto {
  private readonly store = inject(EstadoEditorFlujoProyectoService);

  public readonly form = input.required<FormGroup>();
  public readonly descriptionLabel = input('Descripción funcional');
  public readonly descriptionPlaceholder = input('Describe brevemente para que sirve este paso dentro del flujo.');
  public readonly acceptancePlaceholder = input(
    'Ej: El usuario puede completar este paso sin errores y continuar al siguiente punto del flujo.'
  );
  public readonly rolesLabel = input('Roles involucrados');
  public readonly rolesHint = input('Selecciona los roles ya creados que participan en este bloque.');

  protected readonly availableRoles = computed(() => this.store.roles());
  protected readonly permissionOptions: readonly ModulePermissionAction[] = ['Ver', 'Crear', 'Editar', 'Eliminar'];
  protected readonly usesRolePermissions = computed(() => this.form().contains('rolePermissions'));
  protected readonly acceptanceCriteriaControls = computed(() => this.acceptanceCriteriaArray.controls);
  protected readonly acceptanceCriteriaHasError = computed(() =>
    this.acceptanceCriteriaArray.invalid
    && (this.acceptanceCriteriaArray.touched || this.acceptanceCriteriaArray.dirty)
  );

  protected addAcceptanceCriterion(): void {
    this.acceptanceCriteriaArray.push(new FormControl('', { nonNullable: true, validators: [Validators.required] }));
    this.acceptanceCriteriaArray.markAsDirty();
    this.acceptanceCriteriaArray.updateValueAndValidity();
  }

  protected removeAcceptanceCriterion(index: number): void {
    if (this.acceptanceCriteriaArray.length <= 1) {
      this.acceptanceCriteriaArray.at(0)?.setValue('');
      this.acceptanceCriteriaArray.at(0)?.markAsTouched();
      this.acceptanceCriteriaArray.markAsDirty();
      this.acceptanceCriteriaArray.updateValueAndValidity();
      return;
    }

    this.acceptanceCriteriaArray.removeAt(index);
    this.acceptanceCriteriaArray.markAsDirty();
    this.acceptanceCriteriaArray.markAsTouched();
    this.acceptanceCriteriaArray.updateValueAndValidity();
  }

  protected isAcceptanceCriterionInvalid(index: number): boolean {
    const control = this.acceptanceCriteriaArray.at(index);
    return Boolean(control && control.invalid && (control.touched || control.dirty));
  }

  protected isRoleSelected(roleId: string): boolean {
    if (this.usesRolePermissions()) {
      return this.getRolePermissions().some((rolePermission) => rolePermission.roleId === roleId);
    }

    return this.getSelectedRoleIds().includes(roleId);
  }

  protected hasPermission(roleId: string, permission: ModulePermissionAction): boolean {
    return this.getRolePermissions()
      .find((rolePermission) => rolePermission.roleId === roleId)
      ?.permissions.includes(permission) ?? false;
  }

  protected toggleRole(role: ProjectFlowRole, checked: boolean): void {
    if (this.usesRolePermissions()) {
      const current = this.getRolePermissions();
      const next = checked
        ? [...current, { roleId: role.id, permissions: ['Ver'] as ModulePermissionAction[] }]
        : current.filter((rolePermission) => rolePermission.roleId !== role.id);

      this.updateRolePermissions(next);
      return;
    }

    const nextIds = checked
      ? [...this.getSelectedRoleIds(), role.id]
      : this.getSelectedRoleIds().filter((currentRoleId) => currentRoleId !== role.id);

    this.updateRoleNamesFromIds(nextIds);
  }

  protected togglePermission(roleId: string, permission: ModulePermissionAction): void {
    const next = this.getRolePermissions()
      .map((rolePermission) => {
        if (rolePermission.roleId !== roleId) {
          return rolePermission;
        }

        const hasPermission = rolePermission.permissions.includes(permission);
        const permissions = hasPermission
          ? rolePermission.permissions.filter((item) => item !== permission)
          : [...rolePermission.permissions, permission];

        return {
          ...rolePermission,
          permissions
        };
      })
      .filter((rolePermission) => rolePermission.permissions.length > 0);

    this.updateRolePermissions(next);
  }

  private getSelectedRoleIds(): string[] {
    const rawValue = this.roleNamesControl.value ?? '';
    const selectedNames = rawValue
      .split(/[\n,]/)
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);

    return this.availableRoles()
      .filter((role) => selectedNames.includes(role.name.trim().toLowerCase()))
      .map((role) => role.id);
  }

  private updateRoleNamesFromIds(roleIds: string[]): void {
    const roleNames = roleIds
      .map((roleId) => this.store.getRoleName(roleId))
      .filter((roleName) => roleName !== 'Rol sin nombre')
      .join(', ');

    this.roleNamesControl.setValue(roleNames);
    this.roleNamesControl.markAsDirty();
    this.roleNamesControl.markAsTouched();
    this.roleNamesControl.updateValueAndValidity();
  }

  private getRolePermissions(): ModuleRolePermission[] {
    return this.rolePermissionsControl?.value ?? [];
  }

  private updateRolePermissions(rolePermissions: ModuleRolePermission[]): void {
    this.rolePermissionsControl?.setValue(rolePermissions);
    this.rolePermissionsControl?.markAsDirty();
    this.rolePermissionsControl?.markAsTouched();
    this.updateRoleNamesFromIds(rolePermissions.map((rolePermission) => rolePermission.roleId));
  }

  private get rolePermissionsControl(): FormControl<ModuleRolePermission[]> | null {
    return this.form().get('rolePermissions') as FormControl<ModuleRolePermission[]> | null;
  }

  private get acceptanceCriteriaArray(): FormArray<FormControl<string>> {
    return this.form().get('acceptanceCriteria') as FormArray<FormControl<string>>;
  }

  private get roleNamesControl(): FormControl<string> {
    return this.form().get('roleNames') as FormControl<string>;
  }
}

