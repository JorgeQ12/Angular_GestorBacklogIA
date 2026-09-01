import { OverlayContainer } from '@angular/cdk/overlay';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_APLICACION } from '../../../../core/localizacion/config/localizacion.config';
import { SelectorVersionProyecto } from './selector-version-proyecto';

describe('SelectorVersionProyecto', () => {
  let fixture: ComponentFixture<SelectorVersionProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorVersionProyecto],
      providers: [{ provide: LOCALE_ID, useValue: LOCALE_APLICACION }],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectorVersionProyecto);
    fixture.componentRef.setInput('versiones', [
      { id: 2, numero: 2, fechaCreacion: '2026-09-01', esActual: true },
      { id: 1, numero: 1, fechaCreacion: '2026-08-20', esActual: false },
    ]);
    fixture.componentRef.setInput('versionSeleccionadaId', 2);
    fixture.detectChanges();
  });

  it('presenta de forma compacta la versión vigente', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.textContent).toContain('Versión 2 · Actual');
    expect(elemento.querySelector('section')).toBeNull();
  });

  it('presenta la fecha de creación en las versiones históricas', () => {
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[role="combobox"]')
      ?.click();
    fixture.detectChanges();

    expect(overlay.textContent).toContain('Versión 1');
    expect(overlay.textContent).toContain('20 de ago de 2026');
    expect(overlay.textContent).not.toContain('Histórica · Solo lectura');
  });
});
