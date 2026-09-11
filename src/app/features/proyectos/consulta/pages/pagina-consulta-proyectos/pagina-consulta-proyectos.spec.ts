import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PARAMETROS_RUTA, URL_CREACION_PROYECTO } from '../../../../../core/navegacion/rutas';
import { FormularioFiltrosProyectos } from '../../components/filtros-proyectos/filtros-proyectos';
import type { PaginaProyectos } from '../../models/resumen-proyecto.model';
import { EstadoConsultaProyectosService } from '../../services/estado-consulta-proyectos.service';
import { PaginaConsultaProyectos } from './pagina-consulta-proyectos';

describe('PaginaConsultaProyectos', () => {
  let fixture: ComponentFixture<PaginaConsultaProyectos>;
  let parametros$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let pagina: ReturnType<typeof signal<PaginaProyectos | null>>;
  const estadoConsulta = {
    pagina: () => pagina(),
    errorCarga: signal(false),
    consultar: jasmine.createSpy('consultar'),
    reintentar: jasmine.createSpy('reintentar'),
  };
  const router = {
    navigate: jasmine.createSpy('navigate'),
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
  };
  const route = { queryParamMap: undefined as unknown };

  beforeEach(async () => {
    estadoConsulta.consultar.calls.reset();
    estadoConsulta.reintentar.calls.reset();
    router.navigate.calls.reset();
    router.navigateByUrl.calls.reset();
    estadoConsulta.errorCarga.set(false);
    pagina = signal<PaginaProyectos | null>(PAGINA);
    parametros$ = new BehaviorSubject(convertToParamMap({ estado: 'En Progreso', pagina: '2' }));
    route.queryParamMap = parametros$;
    router.navigate.and.returnValue(Promise.resolve(true));
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [PaginaConsultaProyectos],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: EstadoConsultaProyectosService, useValue: estadoConsulta },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaConsultaProyectos);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('consulta desde query params y vuelve a consultar cuando cambia la misma ruta', () => {
    expect(estadoConsulta.consultar).toHaveBeenCalledWith({
      nombre: '',
      responsable: '',
      estado: 'En Progreso',
      pagina: 2,
      paginaTamano: 10,
    });

    parametros$.next(convertToParamMap({ nombre: 'Portal' }));
    TestBed.flushEffects();

    expect(estadoConsulta.consultar.calls.mostRecent().args).toEqual([{
      nombre: 'Portal',
      responsable: '',
      estado: null,
      pagina: 1,
      paginaTamano: 10,
    }]);
  });

  it('refleja los filtros en la URL y reinicia la página', () => {
    const filtros = fixture.debugElement.query(
      (elemento) => elemento.componentInstance instanceof FormularioFiltrosProyectos,
    ).componentInstance as FormularioFiltrosProyectos;

    filtros.filtrosCambiados.emit({ nombre: 'Portal', responsable: 'María', estado: null });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: {
        [PARAMETROS_RUTA.nombreProyecto]: 'Portal',
        [PARAMETROS_RUTA.responsableProyecto]: 'María',
        [PARAMETROS_RUTA.estadoProyecto]: null,
        [PARAMETROS_RUTA.pagina]: null,
      },
      queryParamsHandling: 'merge',
    });
  });

  it('inicia la creación desde la ruta canónica', () => {
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (elemento) => elemento.textContent?.includes('Nuevo proyecto'),
    );

    (boton as HTMLButtonElement).click();

    expect(router.navigateByUrl).toHaveBeenCalledWith(URL_CREACION_PROYECTO);
  });

  it('evita repetir la cantidad de resultados y la limpieza en el encabezado o los filtros', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).not.toContain('11 resultados');
    expect(texto).not.toContain('Limpiar filtros');
  });

  it('reemplaza toda la página por un error bloqueante y permite reintentar', () => {
    estadoConsulta.errorCarga.set(true);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const error = elemento.querySelector<HTMLElement>('app-estado-error');

    expect(error?.classList).toContain('estado-error--pagina-completa');
    expect(elemento.querySelector('app-encabezado-pagina')).toBeNull();
    expect(elemento.querySelector('app-filtros-proyectos')).toBeNull();
    expect(elemento.querySelector('.pagina-consulta-proyectos__contenido')).toBeNull();
    expect(elemento.querySelector('.pagina-consulta-proyectos')?.getAttribute('aria-label')).toBe(
      'Estado de carga de proyectos',
    );

    error?.querySelector<HTMLButtonElement>('button')?.click();

    expect(estadoConsulta.reintentar).toHaveBeenCalledTimes(1);
  });

  it('reanuda un borrador sin construir rutas internas del recorrido', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'app-tabla-proyectos tbody button',
    );

    boton?.click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/panel/proyectos/creacion?proyectoId=42');
  });
});

const PAGINA: PaginaProyectos = {
  proyectos: [
    {
      id: 42,
      nombre: 'Portal de clientes',
      responsable: 'María',
      estado: 'Borrador',
      prioridad: 'Sin definir',
      fechaObjetivo: null,
      tieneBacklog: false,
      esBorrador: true,
      progresoCreacion: { posicion: 4, total: 9, porcentaje: 44.44 },
    },
  ],
  paginaActual: 2,
  paginaTamano: 10,
  totalRegistros: 11,
  totalPaginas: 2,
};
