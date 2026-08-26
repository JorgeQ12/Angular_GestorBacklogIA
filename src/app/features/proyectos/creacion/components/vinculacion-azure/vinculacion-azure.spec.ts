import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../../models/vinculacion-azure.model';
import { VinculacionAzure } from './vinculacion-azure';

const RESULTADO: ResultadoVinculacionAzure = {
  organizacion: 'Interrapidísimo',
  nombreProyecto: 'InterIA',
  idEpica: 321,
  tituloEpica: 'Épica vigente',
  cantidadRevisiones: 2,
  nombreEquipo: 'Producto',
  cantidadMiembros: 5,
};

describe('VinculacionAzure', () => {
  let fixture: ComponentFixture<VinculacionAzure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VinculacionAzure],
    }).compileComponents();
    fixture = TestBed.createComponent(VinculacionAzure);
    fixture.detectChanges();
  });

  it('inicia con la captura sin presentar errores', () => {
    expect(obtenerElemento().querySelector('form')).toBeTruthy();
    expect(obtenerElemento().querySelector('header')).toBeNull();
    expect(obtenerElemento().querySelector('.ui-field-error')).toBeNull();
    expect(obtenerElemento().querySelector('footer .vinculacion-azure__aviso')).toBeTruthy();
  });

  it('impide un envío inválido y presenta los mensajes particulares', () => {
    const validar = vi.fn();
    fixture.componentInstance.validar.subscribe(validar);

    obtenerFormulario().requestSubmit();
    fixture.detectChanges();

    expect(validar).not.toHaveBeenCalled();
    expect(obtenerElemento().textContent).toContain(
      'El enlace del proyecto o board es obligatorio.',
    );
    expect(obtenerElemento().textContent).toContain('El ID de la épica principal es obligatorio.');
  });

  it('emite los valores normalizados para validar Azure', () => {
    let emitido: DatosVinculacionAzure | undefined;
    fixture.componentInstance.validar.subscribe((datos) => (emitido = datos));
    cambiarValor('vinculacion-url-board', '  https://dev.azure.com/interia/proyecto  ');
    cambiarValor('vinculacion-id-epica', '321');

    obtenerFormulario().requestSubmit();

    expect(emitido).toEqual({
      urlBoard: 'https://dev.azure.com/interia/proyecto',
      idEpica: 321,
      idEquipo: null,
    });
  });

  it('presenta el enlace como obligatorio cuando solo contiene espacios', () => {
    const validar = vi.fn();
    fixture.componentInstance.validar.subscribe(validar);
    cambiarValor('vinculacion-url-board', '   ');
    cambiarValor('vinculacion-id-epica', '321');

    obtenerFormulario().requestSubmit();
    fixture.detectChanges();

    expect(validar).not.toHaveBeenCalled();
    expect(obtenerElemento().textContent).toContain(
      'El enlace del proyecto o board es obligatorio.',
    );
  });

  it('emite el identificador cuando se indica un Team específico', () => {
    let emitido: DatosVinculacionAzure | undefined;
    fixture.componentInstance.validar.subscribe((datos) => (emitido = datos));
    cambiarValor('vinculacion-url-board', 'https://dev.azure.com/interia/proyecto');
    cambiarValor('vinculacion-id-epica', '321');
    cambiarValor('vinculacion-id-equipo', 'd2719ad4-a65b-4dbf-8ab7-4803d39d949f');
    obtenerFormulario().requestSubmit();

    expect(emitido?.idEquipo).toBe('d2719ad4-a65b-4dbf-8ab7-4803d39d949f');
  });

  it('reemplaza la captura por la confirmación dentro del mismo componente', () => {
    fixture.componentRef.setInput('resultadoValidacion', RESULTADO);
    fixture.detectChanges();

    expect(obtenerElemento().querySelector('form')).toBeNull();
    expect(obtenerElemento().querySelector('.vinculacion-azure--confirmacion')).toBeTruthy();
    expect(obtenerElemento().textContent).toContain('Épica vigente');
    expect(obtenerElemento().textContent).toContain('5 integrantes encontrados');
    expect(obtenerElemento().querySelectorAll('.vinculacion-azure__resultado-item')).toHaveLength(
      3,
    );
    expect(
      obtenerElemento().querySelector('section[aria-label="Datos vinculados de Azure"]'),
    ).toBeTruthy();
    expect(
      (
        fixture.debugElement.queryAll(By.directive(IconoComponent))[0]
          .componentInstance as IconoComponent
      ).nombre(),
    ).toBe('azureDevOps');
    expect(obtenerElemento().textContent).toContain('Los datos se guardarán como borrador.');
    expect(obtenerElemento().textContent).toContain('Confirmar y continuar');
    expect(obtenerElemento().querySelector('.vinculacion-azure__continuacion')).toBeNull();
    expect(obtenerElemento().querySelector('.vinculacion-azure__guardado app-icono')).toBeTruthy();
  });

  it('emite las decisiones disponibles durante la confirmación', () => {
    const editar = vi.fn();
    const confirmar = vi.fn();
    fixture.componentInstance.editar.subscribe(editar);
    fixture.componentInstance.confirmar.subscribe(confirmar);
    fixture.componentRef.setInput('resultadoValidacion', RESULTADO);
    fixture.detectChanges();

    const botones = obtenerElemento().querySelectorAll('button');

    expect(botones[0].textContent).toContain('Editar datos');
    expect(botones[1].textContent).toContain('Confirmar y continuar');
    botones[0].click();
    botones[1].click();

    expect(editar).toHaveBeenCalledOnce();
    expect(confirmar).toHaveBeenCalledOnce();
  });

  it('deshabilita los controles y las acciones durante una operación remota', () => {
    fixture.componentRef.setInput('procesando', true);
    fixture.detectChanges();

    expect(
      (obtenerElemento().querySelector('#vinculacion-url-board') as HTMLInputElement).disabled,
    ).toBe(true);
    expect(
      (obtenerElemento().querySelector('button[type="submit"]') as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  function obtenerElemento(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function obtenerFormulario(): HTMLFormElement {
    return obtenerElemento().querySelector('form') as HTMLFormElement;
  }

  function cambiarValor(id: string, valor: string): void {
    const control = obtenerElemento().querySelector(`#${id}`) as HTMLInputElement;
    control.value = valor;
    control.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
});
