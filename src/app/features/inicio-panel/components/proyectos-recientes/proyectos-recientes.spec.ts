import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProyectoInicioPanel } from '../../models/resumen-inicio-panel.model';
import { ProyectosRecientes } from './proyectos-recientes';

describe('ProyectosRecientes', () => {
  let fixture: ComponentFixture<ProyectosRecientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyectosRecientes],
      providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProyectosRecientes);
    fixture.componentRef.setInput('proyectos', [PROYECTO]);
    fixture.detectChanges();
  });

  it('presenta el proyecto y emite su selección', () => {
    const seleccionar = jasmine.createSpy('seleccionar');
    fixture.componentInstance.seleccionarProyecto.subscribe(seleccionar);
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.proyecto-reciente',
    );
    expect(boton?.textContent).toContain('Portal de clientes');
    expect(boton?.textContent).toContain('Disponible');

    boton?.click();

    expect(seleccionar).toHaveBeenCalledWith(PROYECTO);
  });

  it('emite la consulta de todos los proyectos', () => {
    const verTodos = jasmine.createSpy('verTodos');
    fixture.componentInstance.verTodos.subscribe(verTodos);
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (actual) => actual.textContent?.includes('Ver todos'),
    );
    boton?.click();
    expect(verTodos).toHaveBeenCalledTimes(1);
  });
});

const PROYECTO: ProyectoInicioPanel = {
  id: 42,
  nombre: 'Portal de clientes',
  responsable: 'Jorge',
  estado: 'En Progreso',
  fechaObjetivo: '2026-09-30',
  tieneBacklog: true,
  motivoAtencion: null,
};
