import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoCatalogoProyecto } from '../../../models/estado-catalogo-proyecto.model';
import type { ResumenProyecto } from '../../models/resumen-proyecto.model';
import { TablaProyectos } from './tabla-proyectos';

describe('TablaProyectos', () => {
  let fixture: ComponentFixture<TablaProyectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaProyectos],
      providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }],
    }).compileComponents();
    fixture = TestBed.createComponent(TablaProyectos);
    fixture.componentRef.setInput('proyectos', PROYECTOS);
    fixture.componentRef.setInput('paginaActual', 1);
    fixture.componentRef.setInput('totalPaginas', 3);
    fixture.detectChanges();
  });

  it('presenta una tabla semántica con la identidad y la fecha compartida', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('caption')?.textContent).toContain('Proyectos disponibles');
    expect(elemento.querySelectorAll('th[scope="col"]').length).toBe(6);
    expect(elemento.textContent).toContain('Portal de clientes');
    expect(elemento.textContent).toContain('30 de sept de 2026');
    expect(elemento.querySelectorAll('.ui-table app-indicador-estado').length).toBe(2);
  });

  it('muestra el avance y emite la continuación únicamente para borradores', () => {
    let seleccionado: ResumenProyecto | undefined;
    fixture.componentInstance.continuarBorrador.subscribe((proyecto) => (seleccionado = proyecto));
    const elemento = fixture.nativeElement as HTMLElement;
    const botones = [...elemento.querySelectorAll<HTMLButtonElement>('tbody button')];

    expect(elemento.textContent).toContain('Paso 5 de 9');
    expect(botones.length).toBe(2);
    botones[0].click();

    expect(seleccionado).toEqual(PROYECTOS[0]);
    expect(botones[0].getAttribute('aria-label')).toContain('Portal de clientes');
  });

  it('emite la consulta únicamente para proyectos publicados', () => {
    const consultar = jasmine.createSpy('consultar');
    fixture.componentInstance.consultarProyecto.subscribe(consultar);
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('tbody button')].find(
      (elemento) => elemento.textContent?.includes('Ver información'),
    ) as HTMLButtonElement;

    boton.click();

    expect(consultar).toHaveBeenCalledWith(PROYECTOS[1]);
  });

  it('emite una página válida desde la paginación', () => {
    const paginaCambiada = jasmine.createSpy('paginaCambiada');
    fixture.componentInstance.paginaCambiada.subscribe(paginaCambiada);
    const botonSiguiente = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ].find((elemento) => elemento.textContent?.includes('Siguiente'));

    (botonSiguiente as HTMLButtonElement).click();

    expect(paginaCambiada).toHaveBeenCalledWith({ pagina: 2 });
  });

  it('deriva el tono del estado según el borrador y el estado del catálogo', () => {
    const componente = fixture.componentInstance as unknown as {
      obtenerTonoEstado: (proyecto: ResumenProyecto) => string;
    };
    const base = PROYECTOS[1];

    expect(componente.obtenerTonoEstado(PROYECTOS[0])).toBe('neutral');
    expect(componente.obtenerTonoEstado(base)).toBe('informativo');
    expect(
      componente.obtenerTonoEstado({ ...base, estado: EstadoCatalogoProyecto.Finalizado }),
    ).toBe('positivo');
    expect(
      componente.obtenerTonoEstado({ ...base, estado: EstadoCatalogoProyecto.Cerrado }),
    ).toBe('neutral');
  });

  it('emite la página anterior cuando existe una posición previa', () => {
    fixture.componentRef.setInput('paginaActual', 2);
    fixture.detectChanges();
    const paginaCambiada = jasmine.createSpy('paginaCambiada');
    fixture.componentInstance.paginaCambiada.subscribe(paginaCambiada);
    const botonAnterior = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ].find((elemento) => elemento.textContent?.includes('Anterior'));

    (botonAnterior as HTMLButtonElement).click();

    expect(paginaCambiada).toHaveBeenCalledWith({ pagina: 1 });
  });

  it('no emite la página anterior desde la primera posición', () => {
    const paginaCambiada = jasmine.createSpy('paginaCambiada');
    fixture.componentInstance.paginaCambiada.subscribe(paginaCambiada);
    const componente = fixture.componentInstance as unknown as { anterior: () => void };

    componente.anterior();

    expect(paginaCambiada).not.toHaveBeenCalled();
  });

  it('no emite la página siguiente desde la última posición', () => {
    fixture.componentRef.setInput('paginaActual', 3);
    fixture.detectChanges();
    const paginaCambiada = jasmine.createSpy('paginaCambiada');
    fixture.componentInstance.paginaCambiada.subscribe(paginaCambiada);
    const componente = fixture.componentInstance as unknown as { siguiente: () => void };

    componente.siguiente();

    expect(paginaCambiada).not.toHaveBeenCalled();
  });

  it('oculta la paginación cuando solo existe una página', () => {
    fixture.componentRef.setInput('totalPaginas', 1);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.tabla-proyectos__paginacion')).toBeNull();
  });

  it('muestra un guion para la fecha objetivo ausente', () => {
    const filas = [...(fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr')];
    const filaSinFecha = filas[1];

    expect(filaSinFecha.textContent).toContain('Operación logística');
    expect(filaSinFecha.querySelector('.tabla-proyectos__fecha')?.textContent).not.toContain('2026');
  });
});

const PROYECTOS: readonly ResumenProyecto[] = [
  {
    id: 42,
    nombre: 'Portal de clientes',
    responsable: 'María',
    estado: 'Borrador',
    prioridad: 'Sin definir',
    fechaObjetivo: '2026-09-30',
    tieneBacklog: false,
    esBorrador: true,
    progresoCreacion: { posicion: 5, total: 9, porcentaje: 55.55 },
  },
  {
    id: 84,
    nombre: 'Operación logística',
    responsable: 'Jorge',
    estado: 'En Progreso',
    prioridad: 'Alta',
    fechaObjetivo: null,
    tieneBacklog: true,
    esBorrador: false,
    progresoCreacion: null,
  },
];
