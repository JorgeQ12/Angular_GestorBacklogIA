import { TestBed } from '@angular/core/testing';
import { FabricaMensajeError } from '../models/mensajes-error.model';
import {
  MENSAJES_ERROR_FORMULARIO,
  MENSAJES_ERROR_PREDETERMINADOS,
} from './mensajes-error.config';

describe('MENSAJES_ERROR_PREDETERMINADOS', () => {
  function comoFabrica(codigo: string): FabricaMensajeError {
    return (MENSAJES_ERROR_PREDETERMINADOS as Record<string, unknown>)[
      codigo
    ] as FabricaMensajeError;
  }

  it('provee mensajes estáticos para validadores sin detalle', () => {
    expect(MENSAJES_ERROR_PREDETERMINADOS.required).toBe('Este campo es obligatorio.');
    expect(MENSAJES_ERROR_PREDETERMINADOS.email).toBe('Debe ingresar un correo válido.');
    expect(MENSAJES_ERROR_PREDETERMINADOS.pattern).toBe('El formato ingresado no es válido.');
  });

  it('construye el mensaje de longitud mínima con el detalle recibido', () => {
    expect(comoFabrica('minlength')({ requiredLength: 5, actualLength: 2 })).toBe(
      'Debe tener al menos 5 caracteres.',
    );
  });

  it('construye el mensaje de longitud máxima con el detalle recibido', () => {
    expect(comoFabrica('maxlength')({ requiredLength: 10, actualLength: 12 })).toBe(
      'No debe superar 10 caracteres.',
    );
  });

  it('construye los mensajes de valor mínimo y máximo con el detalle recibido', () => {
    expect(comoFabrica('min')({ min: 1, actual: 0 })).toBe('El valor mínimo permitido es 1.');
    expect(comoFabrica('max')({ max: 100, actual: 120 })).toBe(
      'El valor máximo permitido es 100.',
    );
  });

  it('usa cero cuando el detalle numérico no está presente', () => {
    expect(comoFabrica('minlength')({})).toBe('Debe tener al menos 0 caracteres.');
    expect(comoFabrica('max')({})).toBe('El valor máximo permitido es 0.');
  });

  it('usa cero cuando la propiedad esperada no es numérica', () => {
    expect(comoFabrica('min')({ min: 'seis' })).toBe('El valor mínimo permitido es 0.');
  });

  it('usa cero cuando el detalle del error no es un objeto', () => {
    expect(comoFabrica('minlength')(true)).toBe('Debe tener al menos 0 caracteres.');
    expect(comoFabrica('maxlength')('detalle')).toBe('No debe superar 0 caracteres.');
  });

  it('usa cero cuando el detalle del error es nulo', () => {
    expect(comoFabrica('min')(null)).toBe('El valor mínimo permitido es 0.');
  });
});

describe('MENSAJES_ERROR_FORMULARIO', () => {
  it('expone los mensajes predeterminados mediante la fábrica del token', () => {
    const mensajes = TestBed.runInInjectionContext(() => TestBed.inject(MENSAJES_ERROR_FORMULARIO));

    expect(mensajes).toBe(MENSAJES_ERROR_PREDETERMINADOS);
  });
});
