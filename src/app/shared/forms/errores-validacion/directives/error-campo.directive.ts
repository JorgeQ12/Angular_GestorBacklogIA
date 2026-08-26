import {
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroupDirective, NgControl, NgForm, ValidationErrors } from '@angular/forms';
import { MENSAJES_ERROR_FORMULARIO } from '../config/mensajes-error.config';
import {
  CONTROL_CAMPO_PERSONALIZADO,
  ControlCampoPersonalizado,
} from '../models/control-campo-personalizado.model';
import { MensajesError } from '../models/mensajes-error.model';
import { MensajesFormularioDirective } from './mensajes-formulario.directive';

/** Presenta el error activo de un control con mensajes y atributos accesibles. */
@Directive({
  selector:
    'input[appErrorCampo], select[appErrorCampo], textarea[appErrorCampo], app-selector-campo[appErrorCampo], app-selector-fecha[appErrorCampo], app-selector-tarjetas[appErrorCampo]',
  standalone: true,
})
export class ErrorCampoDirective implements AfterViewInit, OnChanges, OnDestroy {
  /** Permite personalizar los mensajes de un control particular. */
  @Input() public appMensajesError: MensajesError | undefined;

  private readonly controlDirectiva = inject(NgControl, { self: true });
  private readonly formularioReactivo = inject(FormGroupDirective, { optional: true });
  private readonly formularioPlantilla = inject(NgForm, { optional: true });
  private readonly mensajesFormulario = inject(MensajesFormularioDirective, { optional: true });
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly controlPersonalizado = inject<ControlCampoPersonalizado>(
    CONTROL_CAMPO_PERSONALIZADO,
    { optional: true, self: true },
  );
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mensajesPredeterminados = inject(MENSAJES_ERROR_FORMULARIO);

  private contenedorCampo: HTMLElement | undefined;
  private elementoError: HTMLElement | undefined;
  private vistaInicializada = false;

  /** Expone el formulario que administra el control anfitrión. */
  private get formulario(): FormGroupDirective | NgForm | null {
    return this.formularioReactivo ?? this.formularioPlantilla;
  }

  /** Prepara la presentación de errores cuando el control está disponible. */
  public ngAfterViewInit(): void {
    this.vistaInicializada = true;
    this.contenedorCampo =
      (this.elemento.nativeElement.closest('.ui-field') as HTMLElement | null) ?? undefined;

    if (!this.contenedorCampo) {
      throw new Error('appErrorCampo requiere un contenedor ancestro con la clase ui-field.');
    }

    if (!this.elemento.nativeElement.id) {
      throw new Error('appErrorCampo requiere que el control tenga un atributo id.');
    }

    const control = this.controlDirectiva.control;

    if (!control) {
      throw new Error('appErrorCampo requiere formControl, formControlName o ngModel.');
    }

    control.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actualizarError());
    this.formulario?.form.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actualizarError());
    this.formulario?.ngSubmit
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actualizarError());

    this.actualizarError();
  }

  /** Renueva el mensaje cuando cambia la configuración del control. */
  public ngOnChanges(): void {
    if (this.vistaInicializada) {
      this.actualizarError();
    }
  }

  /** Retira la presentación administrada al destruir la directiva. */
  public ngOnDestroy(): void {
    this.ocultarError();
  }

  /** Refleja el estado actual de validación en la interfaz. */
  private actualizarError(): void {
    const control = this.controlDirectiva.control;
    const debeMostrar =
      !!control?.invalid && (control.touched || control.dirty || !!this.formulario?.submitted);
    const mensaje = debeMostrar ? this.obtenerMensaje(control.errors) : undefined;

    if (!mensaje) {
      this.ocultarError();
      return;
    }

    const idError = `${this.elemento.nativeElement.id}-error`;

    if (!this.elementoError) {
      this.elementoError = this.renderer.createElement('span') as HTMLElement;
      this.renderer.addClass(this.elementoError, 'ui-field-error');
      this.renderer.setAttribute(this.elementoError, 'role', 'alert');
      this.renderer.appendChild(this.contenedorCampo, this.elementoError);
    }

    this.renderer.setAttribute(this.elementoError, 'id', idError);
    this.renderer.setProperty(this.elementoError, 'textContent', mensaje);
    this.renderer.addClass(this.contenedorCampo, 'has-error');
    this.controlPersonalizado?.establecerEstadoError(true);
    const controlElemento = this.obtenerElementoInteraccion();
    this.renderer.setAttribute(controlElemento, 'aria-invalid', 'true');
    this.agregarDescripcion(idError);
  }

  /** Resuelve el mensaje prioritario para el error activo. */
  private obtenerMensaje(errores: ValidationErrors | null): string | undefined {
    if (!errores) {
      return undefined;
    }

    const mensajesCampo = this.mensajesFormulario?.obtenerMensajes(this.controlDirectiva.name);

    for (const [codigo, detalle] of Object.entries(errores)) {
      const mensaje =
        this.appMensajesError?.[codigo] ??
        mensajesCampo?.[codigo] ??
        this.mensajesPredeterminados[codigo];

      if (typeof mensaje === 'function') {
        return mensaje(detalle);
      }

      if (mensaje) {
        return mensaje;
      }
    }

    return 'El valor ingresado no es válido.';
  }

  /** Limpia el error visual y sus relaciones accesibles. */
  private ocultarError(): void {
    const idError = `${this.elemento.nativeElement.id}-error`;

    if (this.elementoError && this.contenedorCampo) {
      this.renderer.removeChild(this.contenedorCampo, this.elementoError);
      this.elementoError = undefined;
    }

    if (this.contenedorCampo) {
      this.renderer.removeClass(this.contenedorCampo, 'has-error');
    }

    this.controlPersonalizado?.establecerEstadoError(false);
    this.renderer.removeAttribute(this.obtenerElementoInteraccion(), 'aria-invalid');
    this.quitarDescripcion(idError);
  }

  /** Vincula el error con la descripción accesible del control. */
  private agregarDescripcion(idError: string): void {
    const control = this.obtenerElementoInteraccion();
    const descripciones = new Set(this.obtenerDescripciones());
    descripciones.add(idError);
    this.renderer.setAttribute(control, 'aria-describedby', [...descripciones].join(' '));
  }

  /** Retira la descripción administrada por la directiva. */
  private quitarDescripcion(idError: string): void {
    const control = this.obtenerElementoInteraccion();
    const descripciones = this.obtenerDescripciones().filter((id) => id !== idError);

    if (descripciones.length > 0) {
      this.renderer.setAttribute(control, 'aria-describedby', descripciones.join(' '));
    } else {
      this.renderer.removeAttribute(control, 'aria-describedby');
    }
  }

  /** Recupera las descripciones accesibles asociadas al control. */
  private obtenerDescripciones(): string[] {
    return (this.obtenerElementoInteraccion().getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(Boolean);
  }

  /** Localiza el elemento que recibe foco y semántica dentro del control. */
  private obtenerElementoInteraccion(): HTMLElement {
    return this.controlPersonalizado?.obtenerElementoInteraccion() ?? this.elemento.nativeElement;
  }
}
