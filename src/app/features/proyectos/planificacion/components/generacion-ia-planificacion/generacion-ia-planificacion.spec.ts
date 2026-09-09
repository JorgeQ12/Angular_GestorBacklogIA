import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NivelGeneracionIaPlanificacion } from '../../models/generacion-ia-planificacion.model';
import { GeneracionIaPlanificacionComponent } from './generacion-ia-planificacion';

describe('GeneracionIaPlanificacionComponent', () => {
  let fixture: ComponentFixture<GeneracionIaPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneracionIaPlanificacionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(GeneracionIaPlanificacionComponent);
    fixture.componentRef.setInput('resumen', {
      epicas: 1,
      caracteristicas: 0,
      historias: 0,
      tareas: 0,
      totalElementos: 1,
    });
    fixture.componentRef.setInput('abierto', true);
    fixture.detectChanges();
  });

  it('presenta los cuatro niveles y bloquea los que no tienen padres', () => {
    const botones = obtenerBotonesNivel();

    expect(botones).toHaveLength(4);
    expect(botones[0].disabled).toBe(false);
    expect(botones[1].disabled).toBe(false);
    expect(botones[2].disabled).toBe(true);
    expect(botones[2].textContent).toContain('Requiere características');
    expect(botones[3].disabled).toBe(true);
    expect(botones[3].textContent).toContain('Requiere historias');
  });

  it('emite el nivel seleccionado cuando sus padres están disponibles', () => {
    const generar = vi.fn();
    fixture.componentInstance.generar.subscribe(generar);
    fixture.componentRef.setInput('resumen', {
      epicas: 1,
      caracteristicas: 2,
      historias: 3,
      tareas: 5,
      totalElementos: 11,
    });
    fixture.detectChanges();

    obtenerBotonesNivel()[2].click();

    expect(generar).toHaveBeenCalledWith(NivelGeneracionIaPlanificacion.Historias);
  });

  function obtenerBotonesNivel(): HTMLButtonElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.generacion-ia__opcion',
      ),
    );
  }
});
