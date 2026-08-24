import { TestBed } from '@angular/core/testing';
import { CargaGlobalService } from './carga-global.service';

describe('CargaGlobalService', () => {
  let servicio: CargaGlobalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servicio = TestBed.inject(CargaGlobalService);
  });

  it('permanece visible mientras existan operaciones pendientes', () => {
    servicio.iniciar();
    servicio.iniciar();

    servicio.finalizar();
    expect(servicio.visible()).toBe(true);

    servicio.finalizar();
    expect(servicio.visible()).toBe(false);
  });

  it('evita cantidades negativas al finalizar sin operaciones', () => {
    servicio.finalizar();

    expect(servicio.visible()).toBe(false);
  });
});
