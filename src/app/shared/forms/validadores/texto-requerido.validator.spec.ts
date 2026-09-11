import { FormControl } from '@angular/forms';
import { validarTextoRequerido } from './texto-requerido.validator';

describe('validarTextoRequerido', () => {
  ['', ' ', '   \n  '].forEach((valor) => {
    it(`rechaza texto vacío o compuesto por espacios: ${JSON.stringify(valor)}`, () => {
      expect(validarTextoRequerido(new FormControl(valor))).toEqual({ required: true });
    });
  });

  it('admite texto con contenido aunque tenga espacios exteriores', () => {
    expect(validarTextoRequerido(new FormControl('  InterIA  '))).toBeNull();
  });

  [null, 0, false].forEach((valor) => {
    it(`rechaza valores que no son texto: ${valor}`, () => {
      expect(validarTextoRequerido(new FormControl(valor))).toEqual({ required: true });
    });
  });
});
