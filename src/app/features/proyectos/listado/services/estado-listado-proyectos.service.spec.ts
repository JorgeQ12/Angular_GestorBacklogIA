import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import type { ConsultaListadoProyectos } from '../models/consulta-listado-proyectos.model';
import type { PaginaListadoProyectos } from '../models/proyecto-listado.model';
import { EstadoListadoProyectosService } from './estado-listado-proyectos.service';
import { ListadoProyectosService } from './listado-proyectos.service';

describe('EstadoListadoProyectosService', () => {
  let servicio: EstadoListadoProyectosService;
  let primeraConsulta$: Subject<PaginaListadoProyectos>;
  const listadoProyectos = { obtenerProyectos: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    primeraConsulta$ = new Subject<PaginaListadoProyectos>();
    listadoProyectos.obtenerProyectos.mockReturnValue(primeraConsulta$);
    TestBed.configureTestingModule({
      providers: [
        EstadoListadoProyectosService,
        { provide: ListadoProyectosService, useValue: listadoProyectos },
      ],
    });
    servicio = TestBed.inject(EstadoListadoProyectosService);
  });

  it('expone únicamente la página confirmada por la consulta vigente', () => {
    servicio.consultar(CONSULTA);

    expect(servicio.pagina()).toBeNull();
    primeraConsulta$.next(PAGINA);

    expect(servicio.pagina()).toEqual(PAGINA);
    expect(servicio.errorCarga()).toBe(false);
  });

  it('cancela la consulta anterior cuando cambian los parámetros', () => {
    servicio.consultar(CONSULTA);
    const segundaConsulta$ = new Subject<PaginaListadoProyectos>();
    listadoProyectos.obtenerProyectos.mockReturnValueOnce(segundaConsulta$);

    servicio.consultar({ ...CONSULTA, pagina: 2 });
    primeraConsulta$.next(PAGINA);
    segundaConsulta$.next({ ...PAGINA, paginaActual: 2 });

    expect(servicio.pagina()?.paginaActual).toBe(2);
  });

  it('distingue una falla y permite reintentar la última consulta', () => {
    listadoProyectos.obtenerProyectos.mockReturnValueOnce(
      throwError(() => new Error('Sin conexión')),
    );
    servicio.consultar(CONSULTA);

    expect(servicio.errorCarga()).toBe(true);
    listadoProyectos.obtenerProyectos.mockReturnValueOnce(primeraConsulta$);
    servicio.reintentar();

    expect(listadoProyectos.obtenerProyectos).toHaveBeenLastCalledWith(CONSULTA);
    expect(servicio.errorCarga()).toBe(false);
  });
});

const CONSULTA: ConsultaListadoProyectos = {
  nombre: '',
  responsable: '',
  estado: null,
  pagina: 1,
  paginaTamano: 10,
};

const PAGINA: PaginaListadoProyectos = {
  proyectos: [],
  paginaActual: 1,
  paginaTamano: 10,
  totalRegistros: 0,
  totalPaginas: 0,
};
