import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { Modal } from '../../../../../../shared/components/modal/modal';
import {
  EnfocarPrimerControlInvalidoDirective,
  MensajesFormularioDirective,
} from '../../../../../../shared/forms/errores-validacion';
import {
  DESCRIPCIONES_TIPO_BLOQUE_FLUJO,
  ETIQUETAS_TIPO_BLOQUE_FLUJO,
  ICONOS_TIPO_BLOQUE_FLUJO,
  MENSAJES_FORMULARIO_NODO_FLUJO,
} from '../../config/flujo-proyecto.config';
import {
  FormularioFranjaActividadModulo,
  FormularioNodoFlujoProyecto,
} from '../../models/formulario-nodo-flujo-proyecto.model';
import {
  BorradorNodoFlujo,
  DiaSemanaFlujo,
  FranjaMayorActividadModulo,
  ModoEditorNodoFlujo,
  TipoBloqueFlujo,
} from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { FormularioAccionFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-accion-flujo-proyecto/formulario-accion-flujo-proyecto';
import { FormularioComponenteFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-componente-flujo-proyecto/formulario-componente-flujo-proyecto';
import { FormularioDecisionFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-decision-flujo-proyecto/formulario-decision-flujo-proyecto';
import { FormularioModuloFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-modulo-flujo-proyecto/formulario-modulo-flujo-proyecto';
import { FormularioPaginaFlujoProyecto } from '../formularios-nodo-flujo-proyecto/formulario-pagina-flujo-proyecto/formulario-pagina-flujo-proyecto';

/** Coordina el formulario especializado utilizado para crear o editar un nodo. */
@Component({
  selector: 'app-modal-nodo-flujo-proyecto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    EnfocarPrimerControlInvalidoDirective,
    MensajesFormularioDirective,
    Modal,
    IconoComponent,
    FormularioModuloFlujoProyecto,
    FormularioPaginaFlujoProyecto,
    FormularioAccionFlujoProyecto,
    FormularioDecisionFlujoProyecto,
    FormularioComponenteFlujoProyecto,
  ],
  templateUrl: './modal-nodo-flujo-proyecto.html',
  styleUrl: './modal-nodo-flujo-proyecto.css',
})
export class ModalNodoFlujoProyecto {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);
  protected readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);
  private readonly formularioSenal = signal<FormularioNodoFlujoProyecto>(
    this.construirFormulario(
      this.estadoEditor.obtenerBorradorPredeterminado(TipoBloqueFlujo.Accion),
    ),
  );

  protected readonly estadoModal = this.estadoEditor.estadoEditorNodo;
  protected readonly formulario = computed(() => this.formularioSenal());
  protected readonly idFormulario = 'formulario-nodo-flujo-proyecto';
  protected readonly iconosTipo = ICONOS_TIPO_BLOQUE_FLUJO;
  protected readonly modosEditorNodo = ModoEditorNodoFlujo;
  protected readonly tiposBloque = TipoBloqueFlujo;
  protected readonly mensajesFormulario = MENSAJES_FORMULARIO_NODO_FLUJO;
  protected readonly encabezadoModal = computed(() =>
    this.estadoEditor.soloLectura()
      ? 'Versión histórica'
      : this.estadoModal()?.modo === ModoEditorNodoFlujo.Crear
        ? 'Nuevo bloque del flujo'
        : 'Edición del bloque',
  );
  protected readonly textoAccionPrincipal = computed(() =>
    this.estadoModal()?.modo === ModoEditorNodoFlujo.Crear
      ? 'Crear bloque'
      : 'Guardar cambios',
  );
  protected readonly etiquetaTipo = computed(() => {
    const tipo = this.estadoModal()?.tipo;
    return tipo ? ETIQUETAS_TIPO_BLOQUE_FLUJO[tipo] : '';
  });
  protected readonly descripcionTipo = computed(() => {
    const tipo = this.estadoModal()?.tipo;
    return tipo ? DESCRIPCIONES_TIPO_BLOQUE_FLUJO[tipo] : '';
  });
  protected readonly tituloModal = computed(() => {
    const estado = this.estadoModal();
    if (!estado) return '';

    if (this.estadoEditor.soloLectura()) {
      return `Detalle de ${this.obtenerEtiquetaTipo(estado.tipo)}`;
    }

    return estado.modo === ModoEditorNodoFlujo.Crear
      ? `Configurar ${this.obtenerEtiquetaTipo(estado.tipo)}`
      : `Editar ${this.obtenerEtiquetaTipo(estado.tipo)}`;
  });
  protected readonly descripcionModal = computed(() => {
    const estado = this.estadoModal();
    if (!estado) return '';

    if (this.estadoEditor.soloLectura()) {
      return 'Consulta la información que tenía este bloque en la versión seleccionada.';
    }

    return estado.modo === ModoEditorNodoFlujo.Crear
      ? 'Completa la información necesaria antes de incorporar este bloque al recorrido.'
      : 'Actualiza la información del bloque sin perder sus conexiones actuales.';
  });

  public constructor() {
    effect(() => {
      const estado = this.estadoEditor.estadoEditorNodo();
      if (!estado) return;

      const bloque = this.estadoEditor.bloqueEnEdicion();
      const borrador =
        estado.modo === ModoEditorNodoFlujo.Editar && bloque
          ? this.estadoEditor.obtenerBorradorDesdeNodo(bloque)
          : this.estadoEditor.obtenerBorradorPredeterminado(estado.tipo);
      const formulario = this.construirFormulario(borrador);

      if (this.estadoEditor.soloLectura()) {
        formulario.disable({ emitEvent: false });
      }

      this.formularioSenal.set(formulario);
    });
  }

  protected cerrar(): void {
    this.estadoEditor.cancelarBorradorNodo();
  }

  protected guardar(): void {
    if (this.estadoEditor.soloLectura()) return;

    const formulario = this.formulario();
    if (formulario.invalid) {
      formulario.markAllAsTouched();
      return;
    }

    this.estadoEditor.confirmarBorradorNodo(this.convertirFormularioEnBorrador(formulario));
  }

  private construirFormulario(borrador: BorradorNodoFlujo): FormularioNodoFlujoProyecto {
    const esModulo = borrador.tipo === TipoBloqueFlujo.Modulo;
    const esComponente = borrador.tipo === TipoBloqueFlujo.Componente;

    return this.constructorFormulario.group({
      titulo: this.constructorFormulario.control(borrador.titulo, Validators.required),
      descripcion: this.constructorFormulario.control(borrador.descripcion, Validators.required),
      criteriosAceptacion: this.crearCriteriosAceptacion(borrador.criteriosAceptacion),
      nombresRoles: this.constructorFormulario.control(
        borrador.nombresRoles.join(', '),
        Validators.required,
      ),
      permisosRoles: this.constructorFormulario.control(
        esModulo ? borrador.datos.permisosRoles : [],
      ),
      usuariosConcurrentes: this.constructorFormulario.control(
        esModulo ? borrador.datos.usuariosConcurrentes : '',
        esModulo ? Validators.required : [],
      ),
      horariosMayorActividad: this.crearHorariosMayorActividad(
        esModulo ? borrador.datos.horariosMayorActividad : [],
      ),
      datosCapturados: this.constructorFormulario.control(
        esComponente ? borrador.datos.datosCapturados : '',
        esComponente ? Validators.required : [],
      ),
      camposObligatorios: this.constructorFormulario.control(
        esComponente ? borrador.datos.camposObligatorios : '',
        esComponente ? Validators.required : [],
      ),
      resultadoCompletado: this.constructorFormulario.control(
        esComponente ? borrador.datos.resultadoCompletado : '',
        esComponente ? Validators.required : [],
      ),
    });
  }

  private convertirFormularioEnBorrador(
    formulario: FormularioNodoFlujoProyecto,
  ): BorradorNodoFlujo {
    const estado = this.estadoEditor.estadoEditorNodo();
    if (!estado) throw new Error('No hay un editor de nodo activo.');

    const valores = formulario.getRawValue();
    const datosComunes = {
      tipo: estado.tipo,
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim(),
      criteriosAceptacion: valores.criteriosAceptacion
        .map((criterio) => criterio.trim())
        .filter(Boolean),
      nombresRoles: this.separarLista(valores.nombresRoles),
    };

    switch (estado.tipo) {
      case TipoBloqueFlujo.Modulo:
        return {
          ...datosComunes,
          tipo: TipoBloqueFlujo.Modulo,
          datos: {
            permisosRoles: valores.permisosRoles,
            usuariosConcurrentes: String(valores.usuariosConcurrentes).trim(),
            horariosMayorActividad: valores.horariosMayorActividad,
          },
        };
      case TipoBloqueFlujo.Pagina:
        return { ...datosComunes, tipo: TipoBloqueFlujo.Pagina, datos: {} };
      case TipoBloqueFlujo.Accion:
        return { ...datosComunes, tipo: TipoBloqueFlujo.Accion, datos: {} };
      case TipoBloqueFlujo.Decision:
        return { ...datosComunes, tipo: TipoBloqueFlujo.Decision, datos: {} };
      case TipoBloqueFlujo.Componente:
        return {
          ...datosComunes,
          tipo: TipoBloqueFlujo.Componente,
          datos: {
            datosCapturados: valores.datosCapturados.trim(),
            camposObligatorios: valores.camposObligatorios.trim(),
            resultadoCompletado: valores.resultadoCompletado.trim(),
          },
        };
    }
  }

  private separarLista(valor: string): string[] {
    return valor
      .split(/[\n,]/)
      .map((elemento) => elemento.trim())
      .filter(Boolean);
  }

  private crearCriteriosAceptacion(criterios: string[]): FormArray<FormControl<string>> {
    const controles = (criterios.length ? criterios : ['']).map((criterio) =>
      this.constructorFormulario.control(criterio, Validators.required),
    );
    return this.constructorFormulario.array(controles);
  }

  private crearHorariosMayorActividad(
    franjas: FranjaMayorActividadModulo[],
  ): FormArray<FormularioFranjaActividadModulo> {
    const valores = franjas.length
      ? franjas
      : [{ dias: [], horaInicio: '00:00', horaFin: '00:00' }];
    return this.constructorFormulario.array(
      valores.map((franja) =>
        this.constructorFormulario.group({
          dias: this.constructorFormulario.control<DiaSemanaFlujo[]>(franja.dias),
          horaInicio: this.constructorFormulario.control(franja.horaInicio),
          horaFin: this.constructorFormulario.control(franja.horaFin),
        }),
      ),
    );
  }

  private obtenerEtiquetaTipo(tipo: TipoBloqueFlujo): string {
    return ETIQUETAS_TIPO_BLOQUE_FLUJO[tipo].toLowerCase();
  }
}
