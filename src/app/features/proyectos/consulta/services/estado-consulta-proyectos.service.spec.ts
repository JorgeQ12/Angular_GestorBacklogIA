import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import type { ConsultaProyectos } from '../models/consulta-proyectos.model';
import type { PaginaProyectos } from '../models/resumen-proyecto.model';
import { EstadoConsultaProyectosService } from './estado-consulta-proyectos.service';
import { ConsultaProyectosService } from './consulta-proyectos.service';

describe('EstadoConsultaProyectosService', () => {
  let servicio: EstadoConsultaProyectosService;
  let primeraConsulta$: Subject<PaginaProyectos>;
  const consultaProyectos = { obtenerProyectos: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    primeraConsulta$ = new Subject<PaginaProyectos>();
    consultaProyectos.obtenerProyectos.mockReturnValue(primeraConsulta$);
    TestBed.configureTestingModule({
      providers: [
        EstadoConsultaProyectosService,
        { provide: ConsultaProyectosService, useValue: consultaProyectos },
      ],
    });
    servicio = TestBed.inject(EstadoConsultaProyectosService);
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
    const segundaConsulta$ = new Subject<PaginaProyectos>();
    consultaProyectos.obtenerProyectos.mockReturnValueOnce(segundaConsulta$);

    servicio.consultar({ ...CONSULTA, pagina: 2 });
    primeraConsulta$.next(PAGINA);
    segundaConsulta$.next({ ...PAGINA, paginaActual: 2 });

    expect(servicio.pagina()?.paginaActual).toBe(2);
  });

  it('distingue una falla y permite reintentar la última consulta', () => {
    consultaProyectos.obtenerProyectos.mockReturnValueOnce(
      throwError(() => new Error('Sin conexión')),
    );
    servicio.consultar(CONSULTA);

    expect(servicio.errorCarga()).toBe(true);
    consultaProyectos.obtenerProyectos.mockReturnValueOnce(primeraConsulta$);
    servicio.reintentar();

    expect(consultaProyectos.obtenerProyectos).toHaveBeenLastCalledWith(CONSULTA);
    expect(servicio.errorCarga()).toBe(false);
  });
});

const CONSULTA: ConsultaProyectos = {
  nombre: '',
  responsable: '',
  estado: null,
  pagina: 1,
  paginaTamano: 10,
};

const PAGINA: PaginaProyectos = {
  proyectos: [],
  paginaActual: 1,
  paginaTamano: 10,
  totalRegistros: 0,
  totalPaginas: 0,
};
