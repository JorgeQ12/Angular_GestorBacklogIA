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
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import { CampoBusqueda } from '../../../../../shared/forms/controles/campo-busqueda/campo-busqueda';
import { SelectorCampo } from '../../../../../shared/forms/controles/selector-campo/selector-campo';
import type { EstadoCatalogoProyecto } from '../../../models/estado-catalogo-proyecto.model';
import {
  ESPERA_BUSQUEDA_PROYECTOS_MILISEGUNDOS,
  LONGITUD_MINIMA_BUSQUEDA_PROYECTOS,
  OPCIONES_FILTRO_ESTADO_PROYECTOS,
} from '../../config/filtros-proyectos.config';
import {
  mapearValoresFormularioFiltrosProyectos,
  sonFiltrosProyectosIguales,
} from '../../mappers/filtros-proyectos.mapper';
import {
  FILTROS_PROYECTOS_VACIOS,
  type FiltrosProyectos,
} from '../../models/consulta-proyectos.model';
import type {
  ControlesFiltrosProyectos,
  FormularioFiltrosProyectosTipado,
} from '../../models/formulario-filtros-proyectos.model';

/** Captura y normaliza los criterios aplicados al portafolio. */
@Component({
  selector: 'app-filtros-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CampoBusqueda, SelectorCampo],
  templateUrl: './filtros-proyectos.html',
  styleUrl: './filtros-proyectos.css',
})
export class FormularioFiltrosProyectos {

  /** Construye los controles reactivos administrados por el componente. */
  private readonly constructorFormulario = inject(FormBuilder);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destroyRef = inject(DestroyRef);

  /** Conserva filtros representados para coordinar esta responsabilidad. */
  private filtrosRepresentados: FiltrosProyectos = FILTROS_PROYECTOS_VACIOS;

  /** Proporciona los criterios derivados de la URL vigente. */
  public readonly filtrosIniciales = input<FiltrosProyectos>(FILTROS_PROYECTOS_VACIOS);

  /** Comunica una fotografía completa después de modificar los criterios. */
  public readonly filtrosCambiados = output<FiltrosProyectos>();

  /** Conserva longitud minima búsqueda para coordinar esta responsabilidad. */
  protected readonly longitudMinimaBusqueda = LONGITUD_MINIMA_BUSQUEDA_PROYECTOS;

  /** Conserva opciones estado para coordinar esta responsabilidad. */
  protected readonly opcionesEstado = OPCIONES_FILTRO_ESTADO_PROYECTOS;

  /** Administra los valores y validaciones del formulario reactivo. */
  protected readonly formulario: FormularioFiltrosProyectosTipado =
    this.constructorFormulario.group<ControlesFiltrosProyectos>({
      busqueda: this.constructorFormulario.nonNullable.control(''),
      estado: this.constructorFormulario.control<EstadoCatalogoProyecto | null>(null),
    });

  public constructor() {
    effect(() => {
      const filtros = this.filtrosIniciales();
      this.filtrosRepresentados = filtros;
      this.formulario.reset(
        {
          busqueda: filtros.nombre || filtros.responsable,
          estado: filtros.estado,
        },
        { emitEvent: false },
      );
    });

    this.formulario.valueChanges
      .pipe(
        debounceTime(ESPERA_BUSQUEDA_PROYECTOS_MILISEGUNDOS),
        map(() => mapearValoresFormularioFiltrosProyectos(this.formulario.getRawValue())),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filtros) => {
        if (!sonFiltrosProyectosIguales(filtros, this.filtrosRepresentados)) {
          this.filtrosRepresentados = filtros;
          this.filtrosCambiados.emit(filtros);
        }
      });
  }
}
