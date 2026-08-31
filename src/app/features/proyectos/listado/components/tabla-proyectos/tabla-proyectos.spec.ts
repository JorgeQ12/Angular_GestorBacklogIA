import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { ProyectoListado } from '../../models/proyecto-listado.model';
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
    expect(elemento.querySelectorAll('th[scope="col"]')).toHaveLength(6);
    expect(elemento.textContent).toContain('Portal de clientes');
    expect(elemento.textContent).toContain('30 de sept de 2026');
  });

  it('muestra el avance y emite la continuación únicamente para borradores', () => {
    let seleccionado: ProyectoListado | undefined;
    fixture.componentInstance.continuarBorrador.subscribe((proyecto) => (seleccionado = proyecto));
    const elemento = fixture.nativeElement as HTMLElement;
    const botones = [...elemento.querySelectorAll<HTMLButtonElement>('tbody button')];

    expect(elemento.textContent).toContain('Paso 5 de 9');
    expect(botones).toHaveLength(1);
    botones[0].click();

    expect(seleccionado).toEqual(PROYECTOS[0]);
    expect(botones[0].getAttribute('aria-label')).toContain('Portal de clientes');
  });

  it('emite una página válida desde la paginación', () => {
    const paginaCambiada = vi.fn();
    fixture.componentInstance.paginaCambiada.subscribe(paginaCambiada);
    const botonSiguiente = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ].find((elemento) => elemento.textContent?.includes('Siguiente'));

    (botonSiguiente as HTMLButtonElement).click();

    expect(paginaCambiada).toHaveBeenCalledWith({ pagina: 2 });
  });
});

const PROYECTOS: readonly ProyectoListado[] = [
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
