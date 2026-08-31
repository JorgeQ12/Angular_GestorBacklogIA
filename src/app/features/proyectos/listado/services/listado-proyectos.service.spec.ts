import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { PaginadoDto } from '../../../../core/http/models/paginado.dto';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';
import { ENDPOINTS_LISTADO_PROYECTOS } from '../config/endpoints-listado-proyectos.config';
import type { ProyectoListadoDto } from '../models/proyecto-listado.dto';
import { ListadoProyectosService } from './listado-proyectos.service';

describe('ListadoProyectosService', () => {
  let servicio: ListadoProyectosService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(ListadoProyectosService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('consulta el paginado con filtros normalizados y adapta la respuesta', async () => {
    const respuesta = firstValueFrom(
      servicio.obtenerProyectos({
        nombre: ' Portal ',
        responsable: ' María ',
        estado: EstadoCatalogoProyecto.EnProgreso,
        pagina: 2,
        paginaTamano: 10,
      }),
    );
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_LISTADO_PROYECTOS.obtenerProyectos,
    );

    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.params.get('nombre')).toBe('Portal');
    expect(solicitud.request.params.get('responsable')).toBe('María');
    expect(solicitud.request.params.get('estado')).toBe('1');
    expect(solicitud.request.params.get('paginaActual')).toBe('2');
    expect(solicitud.request.params.get('paginaTamano')).toBe('10');
    solicitud.flush(crearResultado(PAGINA_DTO));

    await expect(respuesta).resolves.toMatchObject({
      totalRegistros: 1,
      proyectos: [{ id: 42, nombre: 'Portal de clientes' }],
    });
  });

  it('omite los filtros vacíos en lugar de enviarlos como parámetros', () => {
    servicio
      .obtenerProyectos({
        nombre: ' ',
        responsable: '',
        estado: null,
        pagina: 1,
        paginaTamano: 10,
      })
      .subscribe();
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_LISTADO_PROYECTOS.obtenerProyectos,
    );

    expect(solicitud.request.params.has('nombre')).toBe(false);
    expect(solicitud.request.params.has('responsable')).toBe(false);
    expect(solicitud.request.params.has('estado')).toBe(false);
    solicitud.flush(crearResultado(PAGINA_DTO));
  });

  it('rechaza un resultado funcional fallido en lugar de convertirlo en vacío', async () => {
    const respuesta = firstValueFrom(
      servicio.obtenerProyectos({
        nombre: '',
        responsable: '',
        estado: null,
        pagina: 1,
        paginaTamano: 10,
      }),
    );
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_LISTADO_PROYECTOS.obtenerProyectos,
    );
    solicitud.flush({
      exitoso: false,
      tipo: 5,
      datos: null,
      mensaje: 'No fue posible consultar los proyectos.',
      codigoError: 'consulta_no_disponible',
      errores: null,
    } satisfies ResultadoApi<PaginadoDto<ProyectoListadoDto>>);

    await expect(respuesta).rejects.toThrow('No fue posible consultar los proyectos.');
  });
});

function crearResultado(
  datos: PaginadoDto<ProyectoListadoDto>,
): ResultadoApi<PaginadoDto<ProyectoListadoDto>> {
  return {
    exitoso: true,
    tipo: 1,
    datos,
    mensaje: null,
    codigoError: null,
    errores: null,
  };
}

const PAGINA_DTO: PaginadoDto<ProyectoListadoDto> = {
  registros: [
    {
      id: 42,
      nombre: 'Portal de clientes',
      responsable: 'María',
      prioridadCatalogoId: 3,
      prioridadCatalogo: { id: 3, codigo: 'alta', nombre: 'Alta', descripcion: '' },
      estadoCatalogoId: 7,
      estadoCatalogo: {
        id: 7,
        codigo: 'en_progreso',
        nombre: 'En Progreso',
        descripcion: '',
      },
      estado: 'En Progreso',
      fechaObjetivo: null,
      tieneBacklog: false,
      esBorrador: false,
      pasoActual: null,
    },
  ],
  paginaActual: 1,
  paginaTamano: 10,
  totalRegistros: 1,
  paginas: 1,
};
