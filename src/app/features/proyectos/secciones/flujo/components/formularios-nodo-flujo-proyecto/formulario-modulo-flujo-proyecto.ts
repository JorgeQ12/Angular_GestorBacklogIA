import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CamposComunesNodoFlujoProyecto } from './campos-comunes-nodo-flujo-proyecto';
import { ModulePeakPeriod } from '../../models/flujo-proyecto.model';
import { SelectorCampo } from '../../../../../../shared/forms/controles/selector-campo/selector-campo';
import { OpcionSelector } from '../../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';

@Component({
  selector: 'project-flow-module-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, ReactiveFormsModule, CamposComunesNodoFlujoProyecto, SelectorCampo],
  templateUrl: './formulario-modulo-flujo-proyecto.html',
  styleUrl: './formulario-modulo-flujo-proyecto.css'
})
export class FormularioModuloFlujoProyecto {
  public readonly form = input.required<FormGroup>();
  protected readonly daysOfWeek = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'] as const;
  protected readonly timeOptions: readonly OpcionSelector[] = this.buildTimeOptions();
  protected readonly peakBusinessHours = computed(() =>
    this.form().get('peakBusinessHours') as FormArray<FormGroup> | null
  );

  protected isInvalid(control: AbstractControl | null): boolean {
    return Boolean(control && control.invalid && (control.touched || control.dirty));
  }

  protected addPeakPeriod(): void {
    this.peakBusinessHours()?.push(this.createPeakPeriodGroup());
  }

  protected removePeakPeriod(index: number): void {
    const peakBusinessHours = this.peakBusinessHours();

    if (!peakBusinessHours || peakBusinessHours.length <= 1 || index < 0 || index >= peakBusinessHours.length) {
      return;
    }

    peakBusinessHours.removeAt(index);
    peakBusinessHours.markAsDirty();
    peakBusinessHours.markAsTouched();
  }

  protected isDaySelected(periodIndex: number, day: string): boolean {
    const daysControl = this.getPeakPeriodDaysControl(periodIndex);
    return daysControl?.value.includes(day) ?? false;
  }

  protected toggleDay(periodIndex: number, day: string): void {
    const daysControl = this.getPeakPeriodDaysControl(periodIndex);

    if (!daysControl) {
      return;
    }

    const currentDays = [...daysControl.value];
    const dayIndex = currentDays.indexOf(day);

    if (dayIndex > -1) {
      currentDays.splice(dayIndex, 1);
    } else {
      currentDays.push(day);
    }

    daysControl.setValue(currentDays);
    daysControl.markAsTouched();
    daysControl.markAsDirty();
  }

  private getPeakPeriodDaysControl(periodIndex: number): FormControl<string[]> | null {
    const period = this.peakBusinessHours()?.at(periodIndex);
    return period?.get('days') as FormControl<string[]> | null;
  }

  private createPeakPeriodGroup(): FormGroup {
    const defaultPeriod: ModulePeakPeriod = {
      days: [],
      startTime: '00:00',
      endTime: '00:00'
    };

    return new FormGroup({
      days: new FormControl<string[]>(defaultPeriod.days, { nonNullable: true }),
      startTime: new FormControl(defaultPeriod.startTime, { nonNullable: true }),
      endTime: new FormControl(defaultPeriod.endTime, { nonNullable: true })
    });
  }

  private buildTimeOptions(): readonly OpcionSelector[] {
    const options: OpcionSelector[] = [];

    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 30) {
        const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push({
          valor: label,
          etiqueta: label
        });
      }
    }

    return options;
  }
}

