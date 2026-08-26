import { FormControl } from '@angular/forms';
import { validarTextoRequerido } from './texto-requerido.validator';

describe('validarTextoRequerido', () => {
  it.each(['', ' ', '   \n  '])('rechaza texto vacío o compuesto por espacios: %j', (valor) => {
    expect(validarTextoRequerido(new FormControl(valor))).toEqual({ required: true });
  });

  it('admite texto con contenido aunque tenga espacios exteriores', () => {
    expect(validarTextoRequerido(new FormControl('  InterIA  '))).toBeNull();
  });

  it.each([null, 0, false])('rechaza valores que no son texto: %s', (valor) => {
    expect(validarTextoRequerido(new FormControl(valor))).toEqual({ required: true });
  });
});
