import { Directive, ElementRef, inject } from '@angular/core';

/** Lleva el foco al primer control que comunica un estado inválido accesible. */
export function enfocarPrimerControlInvalido(contenedor: ParentNode): boolean {
  const control = contenedor.querySelector<HTMLElement>('[aria-invalid="true"]:not([disabled])');
  if (!control) return false;

  control.focus();
  return true;
}

/** Enfoca el primer control inválido después de enviar un formulario. */
@Directive({
  selector: 'form[appEnfocarPrimerControlInvalido]',
  host: { '(submit)': 'programarEnfoque()' },
})
export class EnfocarPrimerControlInvalidoDirective {
  private readonly formulario = inject<ElementRef<HTMLFormElement>>(ElementRef);

  /** Espera la presentación de errores antes de localizar el primer control. */
  protected programarEnfoque(): void {
    queueMicrotask(() => enfocarPrimerControlInvalido(this.formulario.nativeElement));
  }
}
