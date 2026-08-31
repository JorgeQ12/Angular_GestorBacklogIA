import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PARAMETROS_RUTA, URL_CREACION_PROYECTO } from '../../../../../core/navegacion/rutas';
import { FormularioFiltrosListadoProyectos } from '../../components/filtros-listado-proyectos/filtros-listado-proyectos';
import type { PaginaListadoProyectos as PaginaProyectos } from '../../models/proyecto-listado.model';
import { EstadoListadoProyectosService } from '../../services/estado-listado-proyectos.service';
import { PaginaListadoProyectos } from './pagina-listado-proyectos';

describe('PaginaListadoProyectos', () => {
  let fixture: ComponentFixture<PaginaListadoProyectos>;
  let parametros$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let pagina: ReturnType<typeof signal<PaginaProyectos | null>>;
  const estadoListado = {
    pagina: () => pagina(),
    errorCarga: signal(false),
    consultar: vi.fn(),
    reintentar: vi.fn(),
  };
  const router = { navigate: vi.fn(), navigateByUrl: vi.fn() };
  const route = { queryParamMap: undefined as unknown };

  beforeEach(async () => {
    vi.clearAllMocks();
    pagina = signal<PaginaProyectos | null>(PAGINA);
    parametros$ = new BehaviorSubject(convertToParamMap({ estado: 'Activo', pagina: '2' }));
    route.queryParamMap = parametros$;
    router.navigate.mockResolvedValue(true);
    router.navigateByUrl.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [PaginaListadoProyectos],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: EstadoListadoProyectosService, useValue: estadoListado },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaListadoProyectos);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('consulta desde query params y vuelve a consultar cuando cambia la misma ruta', () => {
    expect(estadoListado.consultar).toHaveBeenCalledWith({
      nombre: '',
      responsable: '',
      estado: 'Activo',
      pagina: 2,
      paginaTamano: 10,
    });

    parametros$.next(convertToParamMap({ nombre: 'Portal' }));
    TestBed.flushEffects();

    expect(estadoListado.consultar).toHaveBeenLastCalledWith({
      nombre: 'Portal',
      responsable: '',
      estado: null,
      pagina: 1,
      paginaTamano: 10,
    });
  });

  it('refleja los filtros en la URL y reinicia la página', () => {
    const filtros = fixture.debugElement.query(
      (elemento) => elemento.componentInstance instanceof FormularioFiltrosListadoProyectos,
    ).componentInstance as FormularioFiltrosListadoProyectos;

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
