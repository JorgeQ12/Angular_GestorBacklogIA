import { OverlayContainer } from '@angular/cdk/overlay';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_APLICACION } from '../../../../../core/localizacion/config/localizacion.config';
import { OrigenVersionPlanificacion } from '../../models/version-planificacion.model';
import { SelectorVersionPlanificacionComponent } from './selector-version-planificacion';

describe('SelectorVersionPlanificacionComponent', () => {
  let fixture: ComponentFixture<SelectorVersionPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorVersionPlanificacionComponent],
      providers: [{ provide: LOCALE_ID, useValue: LOCALE_APLICACION }],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectorVersionPlanificacionComponent);
    fixture.componentRef.setInput('versiones', VERSIONES);
    fixture.componentRef.setInput('versionSeleccionadaId', 82);
    fixture.detectChanges();
  });

  it('presenta la versión vigente en el control compacto', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Versión 5 · Actual');
  });

  it('distingue la fecha y el estado de las versiones históricas', () => {
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[role=combobox]')
      ?.click();
    fixture.detectChanges();

    expect(overlay.textContent).toContain('Versión 4');
    expect(overlay.textContent).toContain('03 de sept de 2026');
    expect(overlay.textContent).toContain('Histórica · Solo lectura');
  });
});

const VERSIONES = [
  {
    id: 82,
    numero: 5,
    fechaInicio: '2026-09-03T10:00:00',
    fechaCierre: null,
    origen: OrigenVersionPlanificacion.GeneracionHistorias,
    esActual: true,
  },
  {
    id: 81,
    numero: 4,
    fechaInicio: '2026-09-02T08:00:00',
    fechaCierre: '2026-09-03T10:00:00',
    origen: OrigenVersionPlanificacion.Inicial,
    esActual: false,
  },
] as const;
