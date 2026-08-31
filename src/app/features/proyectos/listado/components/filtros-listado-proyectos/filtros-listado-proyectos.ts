import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { CampoBusqueda } from '../../../../../shared/forms/controles/campo-busqueda/campo-busqueda';
import { SelectorCampo } from '../../../../../shared/forms/controles/selector-campo/selector-campo';
import { EstadoCatalogoProyecto } from '../../../models/estado-catalogo-proyecto.model';
import { OPCIONES_ESTADO_LISTADO_PROYECTOS } from '../../config/filtros-listado-proyectos.config';
import {
  FILTROS_LISTADO_PROYECTOS_VACIOS,
  type FiltrosListadoProyectos,
} from '../../models/consulta-listado-proyectos.model';
import type { ControlesFiltrosListadoProyectos } from '../../models/formulario-filtros-listado-proyectos.model';

const ESPERA_BUSQUEDA_MILISEGUNDOS = 300;

/** Captura y normaliza los criterios aplicados al portafolio. */
@Component({
  selector: 'app-filtros-listado-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CampoBusqueda, SelectorCampo, IconoComponent],
  templateUrl: './filtros-listado-proyectos.html',
  styleUrl: './filtros-listado-proyectos.css',
})
export class FormularioFiltrosListadoProyectos {
  private readonly constructorFormulario = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  /** Proporciona los criterios derivados de la URL vigente. */
  public readonly filtrosIniciales = input<FiltrosListadoProyectos>(
    FILTROS_LISTADO_PROYECTOS_VACIOS,
  );

  /** Comunica una fotografía completa después de modificar los criterios. */
  public readonly filtrosCambiados = output<FiltrosListadoProyectos>();

  protected readonly opcionesEstado = OPCIONES_ESTADO_LISTADO_PROYECTOS;
  protected readonly formulario: FormGroup<ControlesFiltrosListadoProyectos> =
    this.constructorFormulario.group<ControlesFiltrosListadoProyectos>({
      nombre: this.constructorFormulario.nonNullable.control(''),
      responsable: this.constructorFormulario.nonNullable.control(''),
      estado: this.constructorFormulario.control<EstadoCatalogoProyecto | null>(null),
    });

  public constructor() {
    effect(() => {
      this.formulario.reset(this.filtrosIniciales(), { emitEvent: false });
    });

    this.formulario.valueChanges
      .pipe(
        debounceTime(ESPERA_BUSQUEDA_MILISEGUNDOS),
        map(() => this.formulario.getRawValue()),
        distinctUntilChanged(sonFiltrosIguales),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filtros) => this.emitirFiltros(filtros));
  }

  /** Restablece todos los criterios desde una única acción. */
  protected limpiar(): void {
    this.formulario.reset(FILTROS_LISTADO_PROYECTOS_VACIOS, { emitEvent: false });
    this.emitirFiltros();
  }

  private emitirFiltros(filtros = this.formulario.getRawValue()): void {
    this.filtrosCambiados.emit({
      nombre: filtros.nombre.trim(),
      responsable: filtros.responsable.trim(),
      estado: filtros.estado,
    });
  }
}

function sonFiltrosIguales(
  anterior: FiltrosListadoProyectos,
  actual: FiltrosListadoProyectos,
): boolean {
  return (
    anterior.nombre === actual.nombre &&
    anterior.responsable === actual.responsable &&
    anterior.estado === actual.estado
  );
}
