import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modal } from './modal';

@Component({
  imports: [Modal],
  template: `
    <button type="button" class="accion-abrir" (click)="abierto = true">Abrir</button>
    @if (abierto) {
      <app-modal
        titulo="Confirmar vinculación"
        etiqueta="Nuevo proyecto"
        descripcion="Revisa los datos antes de continuar."
        icono="proyectos"
        [descartable]="descartable"
        [cierreExteriorHabilitado]="cierreExteriorHabilitado"
        [idFormulario]="idFormulario"
        textoConfirmar="Continuar"
        (cerrar)="cerrarModal()"
        (confirmar)="confirmarModal()"
      >
        <p class="contenido-proyectado">Información de Azure</p>
        <button type="button" class="accion-contenido">Acción interna</button>
      </app-modal>
    }
  `,
})
class AnfitrionModal {
  public abierto = false;
  public descartable = true;
  public cierreExteriorHabilitado = true;
  public idFormulario: string | null = null;
  public confirmaciones = 0;

  public cerrarModal(): void {
    this.abierto = false;
  }

  public confirmarModal(): void {
    this.confirmaciones++;
  }
}

describe('Modal', () => {
  let fixture: ComponentFixture<AnfitrionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionModal] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionModal);
    fixture.detectChanges();
  });

  function abrirModal(): HTMLElement {
    const botonAbrir = fixture.nativeElement.querySelector('.accion-abrir') as HTMLButtonElement;
    botonAbrir.focus();
    botonAbrir.click();
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.ui-modal') as HTMLElement;
  }

  it('presenta el contenido y las relaciones accesibles del diálogo', () => {
    const dialogo = abrirModal();
    const idTitulo = dialogo.getAttribute('aria-labelledby');
    const idDescripcion = dialogo.getAttribute('aria-describedby');

    expect(dialogo.getAttribute('role')).toBe('dialog');
    expect(fixture.nativeElement.querySelector(`#${idTitulo}`)?.textContent).toContain(
      'Confirmar vinculación',
    );
    expect(fixture.nativeElement.querySelector(`#${idDescripcion}`)?.textContent).toContain(
      'Revisa los datos antes de continuar.',
    );
    expect(dialogo.querySelector('.contenido-proyectado')?.textContent).toContain(
      'Información de Azure',
    );
    expect(document.activeElement).toBe(dialogo);
  });

  it('emite la confirmación cuando la acción no pertenece a un formulario', () => {
    const dialogo = abrirModal();

    expect(dialogo.querySelector('.ui-button--secondary app-icono')).toBeTruthy();
    expect(dialogo.querySelector('.ui-button--primary app-icono')).toBeTruthy();

    (fixture.nativeElement.querySelector('.ui-button--primary') as HTMLButtonElement).click();

    expect(fixture.componentInstance.confirmaciones).toBe(1);
  });

  it('vincula la acción principal con el formulario indicado sin emitir otra confirmación', () => {
    fixture.componentInstance.idFormulario = 'formulario-prueba';
    const dialogo = abrirModal();
    const accion = dialogo.querySelector('.ui-button--primary') as HTMLButtonElement;

    accion.click();

    expect(accion.type).toBe('submit');
    expect(accion.getAttribute('form')).toBe('formulario-prueba');
    expect(fixture.componentInstance.confirmaciones).toBe(0);
  });

  it('cierra desde el backdrop y restablece el foco en el elemento anterior', () => {
    abrirModal();
    const overlay = fixture.nativeElement.querySelector('.ui-modal-overlay') as HTMLElement;

    overlay.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.abierto).toBe(false);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.accion-abrir'));
  });

  it('ignora backdrop y Escape cuando el cierre exterior está deshabilitado', () => {
    fixture.componentInstance.cierreExteriorHabilitado = false;
    abrirModal();
    const overlay = fixture.nativeElement.querySelector('.ui-modal-overlay') as HTMLElement;

    overlay.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.abierto).toBe(true);
    const cerrar = fixture.nativeElement.querySelector('.ui-modal__close') as HTMLButtonElement;
    expect(cerrar).not.toBeNull();

    cerrar.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.abierto).toBe(false);
  });

  it('impide descartar por Escape cuando el flujo requiere una decisión explícita', () => {
    fixture.componentInstance.descartable = false;
    abrirModal();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.abierto).toBe(true);
    expect(fixture.nativeElement.querySelector('.ui-modal__close')).toBeNull();
  });

  it('mantiene el foco dentro del diálogo durante la navegación con Tab', () => {
    const dialogo = abrirModal();
    const elementosEnfocables = dialogo.querySelectorAll<HTMLButtonElement>('button');
    const ultimo = elementosEnfocables.item(elementosEnfocables.length - 1);
    const primero = elementosEnfocables.item(0);
    ultimo.focus();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    expect(document.activeElement).toBe(primero);
  });
});
