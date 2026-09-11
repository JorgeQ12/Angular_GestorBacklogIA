import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndicadoresInicioPanel } from '../../models/resumen-inicio-panel.model';
import { IndicadoresProyectos } from './indicadores-proyectos';

describe('IndicadoresProyectos', () => {
  let fixture: ComponentFixture<IndicadoresProyectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IndicadoresProyectos] }).compileComponents();
    fixture = TestBed.createComponent(IndicadoresProyectos);
    fixture.componentRef.setInput('indicadores', INDICADORES);
    fixture.detectChanges();
  });

  it('presenta los cuatro indicadores y deriva los proyectos en seguimiento', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelectorAll('.indicador-proyecto').length).toBe(4);
    expect(elemento.textContent).toContain('En seguimiento');
    expect(elemento.textContent).toContain('5');
  });

  it('resalta la atención únicamente cuando existen proyectos pendientes', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('.indicador-proyecto--advertencia')).toBeTruthy();

    fixture.componentRef.setInput('indicadores', { ...INDICADORES, requierenAtencion: 0 });
    fixture.detectChanges();
    expect(elemento.querySelector('.indicador-proyecto--advertencia')).toBeNull();
  });
});

const INDICADORES: IndicadoresInicioPanel = {
  totalProyectos: 8,
  enBorrador: 2,
  enProgreso: 3,
  finalizados: 2,
  cerrados: 1,
  conBacklog: 4,
  pendientesBacklog: 1,
  vencidos: 1,
  proximosAVencer: 2,
  requierenAtencion: 1,
};
