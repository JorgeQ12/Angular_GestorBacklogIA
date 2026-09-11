import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProyectoInicioPanel } from '../../models/resumen-inicio-panel.model';
import { ProyectosAtencion } from './proyectos-atencion';

describe('ProyectosAtencion', () => {
  let fixture: ComponentFixture<ProyectosAtencion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyectosAtencion],
      providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProyectosAtencion);
    fixture.componentRef.setInput('proyectos', [PROYECTO]);
    fixture.componentRef.setInput('vencidos', 1);
    fixture.componentRef.setInput('proximosAVencer', 2);
    fixture.detectChanges();
  });

  it('presenta el motivo y emite el proyecto que requiere revisión', () => {
    const seleccionar = jasmine.createSpy('seleccionar');
    fixture.componentInstance.seleccionarProyecto.subscribe(seleccionar);
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.proyecto-atencion',
    );
    expect(boton?.textContent).toContain('Fecha objetivo vencida');

    boton?.click();

    expect(seleccionar).toHaveBeenCalledWith(PROYECTO);
  });

  it('presenta el estado exitoso cuando no hay alertas', () => {
    fixture.componentRef.setInput('proyectos', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sin alertas pendientes');
  });
});

const PROYECTO: ProyectoInicioPanel = {
  id: 42,
  nombre: 'Portal de clientes',
  responsable: 'Jorge',
  estado: 'En Progreso',
  fechaObjetivo: '2026-09-01',
  tieneBacklog: true,
  motivoAtencion: 'Fecha objetivo vencida',
};
