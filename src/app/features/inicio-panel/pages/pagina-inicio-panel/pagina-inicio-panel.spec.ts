import { LOCALE_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AutenticacionService } from '../../../../core/autenticacion/services/autenticacion.service';
import { URL_NUEVO_PROYECTO } from '../../../../core/navegacion/rutas';
import { ResumenInicioPanel } from '../../models/resumen-inicio-panel.model';
import { ResumenInicioPanelService } from '../../services/resumen-inicio-panel.service';
import { PaginaInicioPanel } from './pagina-inicio-panel';

const RESUMEN: ResumenInicioPanel = {
  fechaCorte: '2026-08-24',
  totalBorradores: 4,
  indicadores: {
    totalProyectos: 1,
    nuevos: 0,
    activos: 1,
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

    expect(navegar).toHaveBeenCalledWith(URL_NUEVO_PROYECTO);
  });
});
