import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MotivoBloqueoPublicacionAzure } from '../../models/planificacion-proyecto.model';
import { PublicacionAzurePlanificacionComponent } from './publicacion-azure-planificacion';

describe('PublicacionAzurePlanificacionComponent', () => {
  let fixture: ComponentFixture<PublicacionAzurePlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionAzurePlanificacionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PublicacionAzurePlanificacionComponent);
  });

  it('habilita y emite la publicación cuando la planificación está completa', () => {
    const publicar = vi.fn();
    fixture.componentRef.setInput('disponibilidad', { puedePublicar: true, bloqueos: [] });
    fixture.componentInstance.publicar.subscribe(publicar);
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(boton?.disabled).toBe(false);
    expect(boton?.textContent).toContain('Planificación completa · lista para enviar');
    boton?.click();
    expect(publicar).toHaveBeenCalledOnce();
  });

  it('explica los bloqueos y mantiene deshabilitada la publicación', () => {
    fixture.componentRef.setInput('disponibilidad', {
      puedePublicar: false,
      bloqueos: [
        {
          motivo: MotivoBloqueoPublicacionAzure.CaracteristicasSinHistorias,
          cantidad: 2,
        },
        { motivo: MotivoBloqueoPublicacionAzure.HistoriasSinTareas, cantidad: 1 },
      ],
    });
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(boton?.disabled).toBe(true);
    expect(boton?.textContent).toContain('2 características sin historias');
    expect(boton?.textContent).toContain('1 historia sin tareas');
  });

  it('comunica la operación en curso y evita una segunda publicación', () => {
    fixture.componentRef.setInput('disponibilidad', { puedePublicar: true, bloqueos: [] });
    fixture.componentRef.setInput('procesando', true);
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(boton?.disabled).toBe(true);
    expect(boton?.textContent).toContain('Publicando la planificación…');
  });
});
