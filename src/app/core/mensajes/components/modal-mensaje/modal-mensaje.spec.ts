import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VarianteMensaje } from '../../models/mensaje.model';
import { MensajesService } from '../../services/mensajes.service';
import { ModalMensaje } from './modal-mensaje';

describe('ModalMensaje', () => {
  let fixture: ComponentFixture<ModalMensaje>;
  let mensajes: MensajesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ModalMensaje] }).compileComponents();
    fixture = TestBed.createComponent(ModalMensaje);
    mensajes = TestBed.inject(MensajesService);
    fixture.detectChanges();
  });

  it('presenta un mensaje informativo con una única acción', async () => {
    const reconocimiento = mensajes.informar(
      'Vinculación validada',
      'La información de Azure está disponible.',
    );
    fixture.detectChanges();

    const dialogo = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialogo.querySelector('.ui-modal__title')?.textContent).toContain(
      'Vinculación validada',
    );
    expect(dialogo.querySelector('.ui-modal__close')).toBeNull();
    expect(dialogo.querySelector('.ui-button--secondary')).toBeNull();
    expect(dialogo.querySelector('.ui-button--primary')?.textContent).toContain('Aceptar');

    (dialogo.querySelector('.ui-button--primary') as HTMLButtonElement).click();
    fixture.detectChanges();
    await expect(reconocimiento).resolves.toBeUndefined();
  });

  it('presenta los detalles asociados a una advertencia', () => {
    void mensajes.abrir({
      titulo: 'Información incompleta',
      descripcion: 'Revisa los datos antes de continuar.',
      variante: VarianteMensaje.Advertencia,
      detalles: ['Falta el responsable', 'Falta la fecha objetivo'],
    });
    fixture.detectChanges();

    const detalles = fixture.nativeElement.querySelectorAll('.modal-mensaje__detalles li');

    expect(detalles).toHaveLength(2);
    expect(detalles.item(0).textContent).toContain('Falta el responsable');
    mensajes.aceptar();
  });

  it('exige una decisión y aplica intención de peligro a una acción destructiva', async () => {
    const decision = mensajes.confirmarDestructiva(
      'Eliminar proyecto',
      'Esta acción no puede deshacerse.',
    );
    fixture.detectChanges();

    const dialogo = fixture.nativeElement.querySelector('[role="alertdialog"]') as HTMLElement;

    expect(dialogo).toBeTruthy();
    expect(dialogo.querySelector('.ui-modal__close')).toBeNull();
    expect(dialogo.querySelector('.ui-button--danger')?.textContent).toContain('Eliminar');

    (dialogo.querySelector('.ui-button--secondary') as HTMLButtonElement).click();
    fixture.detectChanges();
    await expect(decision).resolves.toBe(false);
  });
});
