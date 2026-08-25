import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_CREACION_PROYECTO } from '../config/endpoints-creacion-proyecto.config';
import { CrearBorradorProyectoRespuestaDto } from '../models/borrador-proyecto.dto';
import { ValidarVinculacionAzureRespuestaDto } from '../models/vinculacion-azure.dto';
import { DatosVinculacionAzure } from '../models/vinculacion-azure.model';
import { CreacionProyectoService } from './creacion-proyecto.service';

const DATOS: DatosVinculacionAzure = {
  urlBoard: 'https://dev.azure.com/interia/proyecto',
  idEpica: 321,
  idEquipo: null,
};

const VINCULACION_DTO: ValidarVinculacionAzureRespuestaDto = {
  organizacion: 'Interrapidísimo',
  proyectoAzureId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  proyectoAzureNombre: 'InterIA',
  teamId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  teamNombre: 'Producto',
  boardUrl: DATOS.urlBoard,
  areaPath: null,
  iterationPath: null,
  epicaAzureId: 321,
  tipoWorkItemEpica: 'Epic',
  urlEpica: 'https://dev.azure.com/interia/_workitems/edit/321',
  miembros: [],
  revisiones: [],
};

describe('CreacionProyectoService', () => {
  let servicio: CreacionProyectoService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(CreacionProyectoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('valida Azure con el contrato esperado y entrega un resumen de interfaz', async () => {
    const respuesta = firstValueFrom(servicio.validarVinculacionAzure(DATOS));
    const solicitud = httpTesting.expectOne(ENDPOINTS_CREACION_PROYECTO.validarVinculacionAzure);

    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({
      boardUrl: DATOS.urlBoard,
      epicaAzureId: 321,
      teamId: null,
    });
    solicitud.flush(crearResultado(VINCULACION_DTO));

    await expect(respuesta).resolves.toMatchObject({
      nombreProyecto: 'InterIA',
      idEpica: 321,
      nombreEquipo: 'Producto',
    });
  });

  it('crea el borrador encapsulando la vinculación validada', async () => {
    const respuesta = firstValueFrom(servicio.crearBorrador(DATOS));
    const solicitud = httpTesting.expectOne(ENDPOINTS_CREACION_PROYECTO.crearBorrador);

    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({
      vinculacionAzure: {
        boardUrl: DATOS.urlBoard,
        epicaAzureId: 321,
        teamId: null,
      },
    });
    solicitud.flush(crearResultado(crearBorradorDto()));

    await expect(respuesta).resolves.toEqual({ id: 42, revision: 1, pasoActual: 1 });
  });

  it('rechaza una respuesta funcional que no contiene datos válidos', async () => {
    const respuesta = firstValueFrom(servicio.validarVinculacionAzure(DATOS));
    const solicitud = httpTesting.expectOne(ENDPOINTS_CREACION_PROYECTO.validarVinculacionAzure);

    solicitud.flush({
      exitoso: false,
      tipo: 4,
      datos: null,
      mensaje: 'La épica no existe.',
      codigoError: 'epica_no_encontrada',
      errores: null,
    } satisfies ResultadoApi<ValidarVinculacionAzureRespuestaDto>);

    await expect(respuesta).rejects.toThrow('La épica no existe.');
  });
});

function crearResultado<T>(datos: T): ResultadoApi<T> {
  return {
    exitoso: true,
    tipo: 1,
    datos,
    mensaje: null,
    codigoError: null,
    errores: null,
  };
}

function crearBorradorDto(): CrearBorradorProyectoRespuestaDto {
  return {
    proyectoId: 42,
    revision: 1,
    pasoActual: 1,
    nombre: 'InterIA',
    responsable: '',
    descripcion: '',
    prioridadCatalogoId: null,
    prioridadCodigo: null,
    estadoCatalogoId: null,
    estadoCodigo: null,
    fechaObjetivo: null,
    tipoSolucionJson: '{}',
    necesidadJson: '{}',
    objetivosJson: '{}',
    alcanceJson: '{}',
    rolesJson: '[]',
    equipoJson: '[]',
    diagramFlujoJson: '{}',
    fechaUltimoGuardado: '2026-08-24T12:00:00Z',
    azure: VINCULACION_DTO,
    insumos: [],
  };
}
