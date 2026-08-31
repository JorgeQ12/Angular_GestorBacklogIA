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
  ESPERA_BUSQUEDA_LISTADO_PROYECTOS_MILISEGUNDOS,
  LONGITUD_MINIMA_BUSQUEDA_LISTADO_PROYECTOS,
  OPCIONES_FILTRO_ESTADO_LISTADO_PROYECTOS,
} from '../../config/filtros-listado-proyectos.config';
import {
  mapearValoresFormularioFiltrosListadoProyectos,
  sonFiltrosListadoProyectosIguales,
} from '../../mappers/filtros-listado-proyectos.mapper';
import {
  FILTROS_LISTADO_PROYECTOS_VACIOS,
  type FiltrosListadoProyectos,
} from '../../models/consulta-listado-proyectos.model';
import type {
  ControlesFiltrosListadoProyectos,
  FormularioFiltrosListadoProyectosTipado,
} from '../../models/formulario-filtros-listado-proyectos.model';

/** Captura y normaliza los criterios aplicados al portafolio. */
@Component({
  selector: 'app-filtros-listado-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CampoBusqueda, SelectorCampo],
  templateUrl: './filtros-listado-proyectos.html',
  styleUrl: './filtros-listado-proyectos.css',
})
export class FormularioFiltrosListadoProyectos {
  private readonly constructorFormulario = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private filtrosRepresentados: FiltrosListadoProyectos = FILTROS_LISTADO_PROYECTOS_VACIOS;

  /** Proporciona los criterios derivados de la URL vigente. */
  public readonly filtrosIniciales = input<FiltrosListadoProyectos>(
    FILTROS_LISTADO_PROYECTOS_VACIOS,
  );

  /** Comunica una fotografía completa después de modificar los criterios. */
  public readonly filtrosCambiados = output<FiltrosListadoProyectos>();

  protected readonly longitudMinimaBusqueda = LONGITUD_MINIMA_BUSQUEDA_LISTADO_PROYECTOS;
  protected readonly opcionesEstado = OPCIONES_FILTRO_ESTADO_LISTADO_PROYECTOS;
  protected readonly formulario: FormularioFiltrosListadoProyectosTipado =
    this.constructorFormulario.group<ControlesFiltrosListadoProyectos>({
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
        debounceTime(ESPERA_BUSQUEDA_LISTADO_PROYECTOS_MILISEGUNDOS),
        map(() => mapearValoresFormularioFiltrosListadoProyectos(this.formulario.getRawValue())),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filtros) => {
        if (!sonFiltrosListadoProyectosIguales(filtros, this.filtrosRepresentados)) {
          this.filtrosRepresentados = filtros;
          this.filtrosCambiados.emit(filtros);
        }
      });
  }
}
