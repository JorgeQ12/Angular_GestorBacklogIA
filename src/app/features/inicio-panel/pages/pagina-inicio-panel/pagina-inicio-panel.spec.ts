import { LOCALE_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AutenticacionService } from '../../../../core/autenticacion/services/autenticacion.service';
import {
  PARAMETROS_RUTA,
  URL_CREACION_PROYECTO,
  URL_PROYECTOS,
} from '../../../../core/navegacion/rutas';
import { ResumenInicioPanel } from '../../models/resumen-inicio-panel.model';
import { ResumenInicioPanelService } from '../../services/resumen-inicio-panel.service';
import { PaginaInicioPanel } from './pagina-inicio-panel';

const RESUMEN: ResumenInicioPanel = {
  fechaCorte: '2026-08-24',
  indicadores: {
    totalProyectos: 5,
    enBorrador: 4,
    enProgreso: 1,
    finalizados: 0,
    cerrados: 0,
    conBacklog: 1,
    pendientesBacklog: 0,
    vencidos: 1,
    proximosAVencer: 0,
    requierenAtencion: 1,
  },
  proyectosAtencion: [],
  proyectosRecientes: [],
  borradoresRecientes: [],
};

describe('PaginaInicioPanel', () => {
  let fixture: ComponentFixture<PaginaInicioPanel>;
  let resumen$: Subject<ResumenInicioPanel>;

  beforeEach(async () => {
    const sesion = signal({ nombre: 'Jorge Quintero' });
    resumen$ = new Subject<ResumenInicioPanel>();

    await TestBed.configureTestingModule({
      imports: [PaginaInicioPanel],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'es-CO' },
        {
          provide: AutenticacionService,
          useValue: { sesionActual: sesion.asReadonly() },
        },
        {
          provide: ResumenInicioPanelService,
          useValue: { obtenerResumen: () => resumen$ },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaInicioPanel);
    fixture.detectChanges();
    resumen$.next(RESUMEN);
    fixture.detectChanges();
  });

  it('compone un único inicio con el encabezado y sus indicadores', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('app-encabezado-pagina')).toBeTruthy();
    expect(elemento.querySelector('.ui-page-header__description')?.textContent).toContain(
      'Hola, Jorge.',
    );
    expect(elemento.querySelectorAll('.indicador-proyecto')).toHaveLength(4);
  });

  it('presenta las secciones globales sin depender de un rol', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('app-estado-proyectos')).toBeTruthy();
    expect(elemento.querySelector('app-proyectos-atencion')).toBeTruthy();
    expect(elemento.querySelector('app-proyectos-recientes')).toBeTruthy();
    expect(elemento.querySelector('app-borradores-recientes')).toBeTruthy();
  });

  it('utiliza la fecha de corte y el total real de borradores', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('.ui-page-header__context')?.textContent).toContain(
      'lunes, 24 de agosto',
    );
    expect(
      elemento.querySelector('app-borradores-recientes .ui-card__count')?.textContent,
    ).toContain('4');
  });

  it('distingue un error de consulta de un resumen vacío', () => {
    resumen$.error(new Error('Backend no disponible'));
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain(
      'No fue posible obtener la información',
    );
    expect(elemento.querySelector('app-encabezado-pagina')).toBeNull();
    expect(elemento.querySelector('app-indicadores-proyectos')).toBeNull();
    expect(elemento.querySelector('app-estado-error button app-icono')).toBeTruthy();
  });

  it('mantiene la creación en el encabezado y no la repite en los borradores vacíos', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('app-borradores-recientes button')).toBeNull();
    expect(elemento.textContent).toContain('Nuevo proyecto');
  });

  it('abre el punto de partida al seleccionar un nuevo proyecto', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (elemento) => elemento.textContent?.includes('Nuevo proyecto'),
    );

    (boton as HTMLButtonElement).click();

    expect(navegar).toHaveBeenCalledWith(URL_CREACION_PROYECTO);
  });

  it('abre el listado y conserva el estado seleccionado como filtro', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (elemento) => elemento.textContent?.includes('En progreso'),
    );

    (boton as HTMLButtonElement).click();

    expect(navegar).toHaveBeenCalledWith([URL_PROYECTOS], {
      queryParams: { [PARAMETROS_RUTA.estadoProyecto]: 'En Progreso' },
    });
  });

  it('reanuda un borrador en el paso alcanzado y presenta el recorrido real', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    resumen$.next({
      ...RESUMEN,
      indicadores: { ...RESUMEN.indicadores, enBorrador: 1 },
      borradoresRecientes: [
        {
          id: 42,
          nombre: 'Portal de clientes',
          responsable: 'Jorge',
          pasoActual: 4,
          fechaUltimoGuardado: '2026-08-25T12:00:00Z',
        },
      ],
    });
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const borrador = elemento.querySelector<HTMLButtonElement>('.borrador-reciente');
    const progreso = elemento.querySelector<HTMLElement>('.borrador-reciente__progreso i');

    expect(borrador?.textContent).toContain('Paso 5 de 9');
    expect(Number.parseFloat(progreso?.style.width ?? '')).toBeCloseTo(55.56, 1);

    borrador?.click();

    expect(navegar).toHaveBeenCalledWith('/panel/proyectos/creacion?proyectoId=42');
  });
});
