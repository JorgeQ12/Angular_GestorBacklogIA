import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoProyecto, IndicadoresInicioPanel } from '../../models/resumen-inicio-panel.model';
import { EstadoProyectos } from './estado-proyectos';

const INDICADORES: IndicadoresInicioPanel = {
  totalProyectos: 10,
  nuevos: 2,
  activos: 4,
  finalizados: 3,
  cerrados: 1,
  conBacklog: 5,
  pendientesBacklog: 5,
  vencidos: 1,
  proximosAVencer: 2,
  requierenAtencion: 1,
};

describe('EstadoProyectos', () => {
  let fixture: ComponentFixture<EstadoProyectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EstadoProyectos] }).compileComponents();
    fixture = TestBed.createComponent(EstadoProyectos);
    fixture.componentRef.setInput('indicadores', INDICADORES);
    fixture.detectChanges();
  });

  it('representa las cantidades y porcentajes de los proyectos', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('.estado-proyectos__resumen strong')?.textContent).toContain(
      '10',
    );
    expect(elemento.querySelector('.cobertura-backlog strong')?.textContent).toContain('50%');
  });

  it('emite el estado seleccionado', () => {
    let estadoSeleccionado: string | undefined;
    fixture.componentInstance.seleccionarEstado.subscribe(
      (estado) => (estadoSeleccionado = estado),
    );

    const boton = fixture.nativeElement.querySelector(
      '.estado-proyectos__item.es-activo',
    ) as HTMLButtonElement;
    boton.click();

    expect(estadoSeleccionado).toBe(EstadoProyecto.Activo);
  });
});
