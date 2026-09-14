import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconoComponent } from '../../../../../../../shared/components/icono/icono.component';
import { SelectorCampo } from '../../../../../../../shared/forms/controles/selector-campo/selector-campo';
import { OpcionSelector } from '../../../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { ErrorCampoDirective } from '../../../../../../../shared/forms/errores-validacion';
import { DIAS_SEMANA_FLUJO } from '../../../config/flujo-proyecto.config';
import {
  ControlesFranjaActividadModulo,
  FormularioFranjaActividadModulo,
  FormularioNodoFlujoProyecto,
} from '../../../models/formulario-nodo-flujo-proyecto.model';
import { DiaSemanaFlujo } from '../../../models/flujo-proyecto.model';
import { CamposComunesNodoFlujoProyecto } from '../campos-comunes-nodo-flujo-proyecto/campos-comunes-nodo-flujo-proyecto';

/** Presenta la configuración propia de un nodo de módulo. */
@Component({
  selector: 'app-formulario-modulo-flujo-proyecto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconoComponent,
    ReactiveFormsModule,
    ErrorCampoDirective,
    CamposComunesNodoFlujoProyecto,
    SelectorCampo,
  ],
  templateUrl: './formulario-modulo-flujo-proyecto.html',
  styleUrl: './formulario-modulo-flujo-proyecto.css',
})
export class FormularioModuloFlujoProyecto {
  /** Formulario tipado administrado por el modal contenedor. */
  public readonly formulario = input.required<FormularioNodoFlujoProyecto>();

  /** Conserva días semana para coordinar esta responsabilidad. */
  protected readonly diasSemana = DIAS_SEMANA_FLUJO;

  /** Conserva opciones hora para coordinar esta responsabilidad. */
  protected readonly opcionesHora: readonly OpcionSelector[] = this.construirOpcionesHora();

  /** Deriva horarios mayor actividad a partir del estado vigente. */
  protected readonly horariosMayorActividad = computed(
    () => this.formulario().controls.horariosMayorActividad,
  );

  /** Agrega franja actividad dentro del flujo actual. */
  protected agregarFranjaActividad(): void {
    this.horariosMayorActividad().push(this.crearGrupoFranjaActividad());
  }

  /** Elimina franja actividad dentro del flujo actual. */
  protected eliminarFranjaActividad(indice: number): void {
    const franjas = this.horariosMayorActividad();
    if (franjas.length <= 1 || indice < 0 || indice >= franjas.length) return;

    franjas.removeAt(indice);
    franjas.markAsDirty();
    franjas.markAsTouched();
  }

  /** Determina si ta seleccionado día. */
  protected estaSeleccionadoDia(indiceFranja: number, dia: DiaSemanaFlujo): boolean {
    return this.obtenerControlDias(indiceFranja)?.value.includes(dia) ?? false;
  }

  /** Alterna día dentro del flujo actual. */
  protected alternarDia(indiceFranja: number, dia: DiaSemanaFlujo): void {
    const controlDias = this.obtenerControlDias(indiceFranja);
    if (!controlDias) return;

    const dias = [...controlDias.value];
    const indiceDia = dias.indexOf(dia);
    if (indiceDia >= 0) dias.splice(indiceDia, 1);
    else dias.push(dia);

    controlDias.setValue(dias);
    controlDias.markAsTouched();
    controlDias.markAsDirty();
  }

  /** Obtiene control días dentro del flujo actual. */
  private obtenerControlDias(indiceFranja: number): FormControl<DiaSemanaFlujo[]> | null {
    return this.horariosMayorActividad().at(indiceFranja)?.controls.dias ?? null;
  }

  /** Crea grupo franja actividad dentro del flujo actual. */
  private crearGrupoFranjaActividad(): FormularioFranjaActividadModulo {
    return new FormGroup<ControlesFranjaActividadModulo>({
      dias: new FormControl<DiaSemanaFlujo[]>([], { nonNullable: true }),
      horaInicio: new FormControl('00:00', { nonNullable: true }),
      horaFin: new FormControl('00:00', { nonNullable: true }),
    });
  }

  /** Construye opciones hora dentro del flujo actual. */
  private construirOpcionesHora(): readonly OpcionSelector[] {
    const opciones: OpcionSelector[] = [];
    for (let hora = 0; hora < 24; hora += 1) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const etiqueta = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
        opciones.push({ valor: etiqueta, etiqueta });
      }
    }
    return opciones;
  }
}
