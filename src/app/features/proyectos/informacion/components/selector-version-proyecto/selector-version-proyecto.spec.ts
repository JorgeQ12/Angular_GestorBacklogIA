import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectorVersionProyecto } from './selector-version-proyecto';

describe('SelectorVersionProyecto', () => {
  let fixture: ComponentFixture<SelectorVersionProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorVersionProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectorVersionProyecto);
    fixture.componentRef.setInput('versiones', [
      { id: 2, numero: 2, fechaCreacion: '2026-09-01', esActual: true },
      { id: 1, numero: 1, fechaCreacion: '2026-08-20', esActual: false },
    ]);
    fixture.componentRef.setInput('versionSeleccionadaId', 2);
    fixture.detectChanges();
  });

  it('presenta el selector global con la versión vigente', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.textContent).toContain('Versión consultada');
    expect(elemento.textContent).toContain('Versión 2 · Actual');
  });
});
