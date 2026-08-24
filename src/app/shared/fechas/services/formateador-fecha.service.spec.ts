import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormateadorFechaService } from './formateador-fecha.service';

describe('FormateadorFechaService', () => {
  let formateador: FormateadorFechaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }],
    });

    formateador = TestBed.inject(FormateadorFechaService);
  });

  it('representa fechas sin hora conservando el día calendario', () => {
    expect(formateador.formatear('2026-08-24', 'breve')).toBe('24 de ago de 2026');
  });

  it('utiliza la alternativa cuando la fecha no es válida', () => {
    expect(formateador.formatear('fecha-invalida')).toBe('Sin fecha');
  });

  it('representa el tiempo transcurrido con el locale de la aplicación', () => {
    const ahora = new Date('2026-08-24T12:00:00-05:00').getTime();

    expect(formateador.formatearTiempoRelativo('2026-08-24T11:55:00-05:00', undefined, ahora)).toBe(
      'Hace 5 minutos',
    );
  });
});
