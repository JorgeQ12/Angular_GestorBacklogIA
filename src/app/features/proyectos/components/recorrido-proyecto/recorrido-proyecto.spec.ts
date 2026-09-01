import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClavePasoEspecialProyecto, PASOS_PROYECTO } from '../../config/pasos-proyecto.config';
import { RecorridoProyecto } from './recorrido-proyecto';

describe('RecorridoProyecto', () => {
  let fixture: ComponentFixture<RecorridoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RecorridoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(RecorridoProyecto);
    fixture.componentRef.setInput('pasoActual', ClavePasoEspecialProyecto.VinculacionAzure);
  });

  it('presenta el catálogo completo del proyecto', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('li')).toHaveLength(PASOS_PROYECTO.length);
  });

  it('emite solamente pasos habilitados', () => {
    const siguiente = PASOS_PROYECTO[1].clave;
    fixture.componentRef.setInput('pasosNavegables', [siguiente]);
    let emitido = null;
    fixture.componentInstance.pasoSeleccionado.subscribe((paso) => (emitido = paso));
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('button')[1].click();
    expect(emitido).toBe(siguiente);
  });

  it('compacta el encabezado cuando no se representa progreso', () => {
    fixture.componentRef.setInput('mostrarProgreso', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.recorrido-proyecto--sin-progreso')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.recorrido-proyecto__progreso')).toBeNull();
  });
});
