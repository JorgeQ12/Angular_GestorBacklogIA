import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { PlataformaSolucion } from '../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { ENDPOINTS_CREACION_PROYECTO } from '../config/endpoints-creacion-proyecto.config';
import { CrearBorradorProyectoRespuestaDto } from '../models/borrador-proyecto.dto';
import {
  SincronizarEquipoAzureRespuestaDto,
  ValidarVinculacionAzureRespuestaDto,
} from '../models/vinculacion-azure.dto';
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

  it('obtiene la fotografía editable del borrador', async () => {
    const respuesta = firstValueFrom(servicio.obtenerBorrador(42));
    const solicitud = httpTesting.expectOne(
      (peticion) =>
        peticion.url === ENDPOINTS_CREACION_PROYECTO.obtenerBorrador &&
        peticion.params.get('proyectoId') === '42',
    );

    expect(solicitud.request.method).toBe('GET');
    solicitud.flush(crearResultado(crearBorradorDto()));

    await expect(respuesta).resolves.toMatchObject({
      id: 42,
      revision: 1,
      contexto: {
        nombre: 'InterIA',
        prioridadCatalogoId: null,
      },
      equipoAzure: {
        idEquipo: VINCULACION_DTO.teamId,
        nombreEquipo: 'Producto',
      },
    });
  });

  it('sincroniza el Team de Azure y adapta sus integrantes', async () => {
    const respuesta = firstValueFrom(servicio.sincronizarEquipoAzure(42));
    const solicitud = httpTesting.expectOne(
      (peticion) =>
        peticion.url === ENDPOINTS_CREACION_PROYECTO.sincronizarEquipoAzure &&
        peticion.params.get('ProyectoId') === '42',
    );

    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toBeNull();
    solicitud.flush(
      crearResultado({
        teamId: 'team-1',
        teamNombre: 'Producto',
        miembros: [
          { id: 'u1', nombre: 'Jorge', correo: 'jorge@interia.co', esAdministrador: true },
        ],
        grupos: [],
        fechaSincronizacion: '2026-08-27T10:00:00Z',
      } satisfies SincronizarEquipoAzureRespuestaDto),
    );

    await expect(respuesta).resolves.toEqual({
      idEquipo: 'team-1',
      nombreEquipo: 'Producto',
      integrantes: [
        {
          idAzure: 'u1',
          nombre: 'Jorge',
          correo: 'jorge@interia.co',
          esAdministradorAzure: true,
        },
      ],
      fechaSincronizacion: '2026-08-27T10:00:00Z',
    });
  });

  it('actualiza Contexto conservando los datos de las demás secciones', async () => {
    const borradorDto = crearBorradorDto();
    const cargaBorrador = firstValueFrom(servicio.obtenerBorrador(42));
    httpTesting
      .expectOne(
        (peticion) =>
          peticion.url === ENDPOINTS_CREACION_PROYECTO.obtenerBorrador &&
          peticion.params.get('proyectoId') === '42',
      )
      .flush(crearResultado(borradorDto));
    const borrador = await cargaBorrador;
    const contexto = {
      nombre: 'InterIA renovado',
      responsable: 'María Gómez',
      descripcion: 'Una descripción completa.',
      prioridadCatalogoId: 13,
      fechaObjetivo: '2026-09-30',
    };

    const respuesta = firstValueFrom(
      servicio.actualizarBorrador(
        borrador,
        { seccion: ClaveSeccionProyecto.Contexto, datos: contexto },
        2,
      ),
    );
    const solicitud = httpTesting.expectOne(ENDPOINTS_CREACION_PROYECTO.actualizarBorrador);

    expect(solicitud.request.method).toBe('PUT');
    expect(solicitud.request.body).toEqual({
      proyectoId: 42,
      revisionEsperada: 1,
      pasoActual: 2,
      nombre: contexto.nombre,
      responsable: contexto.responsable,
      descripcion: contexto.descripcion,
      prioridadCatalogoId: 13,
      estadoCatalogoId: null,
      fechaObjetivo: '2026-09-30',
      tipoSolucionJson: '{}',
      necesidadJson: '{}',
      objetivosJson: '{}',
      alcanceJson: '{}',
      rolesJson: '[]',
      equipoJson: '[]',
      diagramFlujoJson: '{}',
    });
    solicitud.flush(
      crearResultado({
        ...borradorDto,
        revision: 2,
        pasoActual: 2,
        nombre: contexto.nombre,
        responsable: contexto.responsable,
        descripcion: contexto.descripcion,
        prioridadCatalogoId: 13,
        fechaObjetivo: '2026-09-30T00:00:00',
      }),
    );

    await expect(respuesta).resolves.toMatchObject({
      revision: 2,
      pasoActual: 2,
      contexto: { nombre: contexto.nombre, fechaObjetivo: '2026-09-30' },
    });
  });

  it('actualiza Tipo de solución con el formato canónico y conserva Contexto', async () => {
    const borradorDto = crearBorradorDto();
    const cargaBorrador = firstValueFrom(servicio.obtenerBorrador(42));
    httpTesting
      .expectOne(
        (peticion) =>
          peticion.url === ENDPOINTS_CREACION_PROYECTO.obtenerBorrador &&
          peticion.params.get('proyectoId') === '42',
      )
      .flush(crearResultado(borradorDto));
    const borrador = await cargaBorrador;

    const respuesta = firstValueFrom(
      servicio.actualizarBorrador(
        borrador,
        {
          seccion: ClaveSeccionProyecto.TipoSolucion,
          datos: { tieneInterfaz: true, plataforma: PlataformaSolucion.Web },
        },
        3,
      ),
    );
    const solicitud = httpTesting.expectOne(ENDPOINTS_CREACION_PROYECTO.actualizarBorrador);

    expect(solicitud.request.body).toMatchObject({
      proyectoId: 42,
      revisionEsperada: 1,
      pasoActual: 3,
      nombre: 'InterIA',
      tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
      necesidadJson: '{}',
    });
    solicitud.flush(
      crearResultado({
        ...borradorDto,
        revision: 2,
        pasoActual: 3,
        tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
      }),
    );

    await expect(respuesta).resolves.toMatchObject({ revision: 2, pasoActual: 3 });
  });

  it('actualiza Necesidad con el formato canónico y conserva las demás secciones', async () => {
    const borradorDto = crearBorradorDto();
    const cargaBorrador = firstValueFrom(servicio.obtenerBorrador(42));
    httpTesting
      .expectOne(
        (peticion) =>
          peticion.url === ENDPOINTS_CREACION_PROYECTO.obtenerBorrador &&
          peticion.params.get('proyectoId') === '42',
      )
      .flush(crearResultado(borradorDto));
    const borrador = await cargaBorrador;

    const respuesta = firstValueFrom(
      servicio.actualizarBorrador(
        borrador,
        {
          seccion: ClaveSeccionProyecto.Necesidad,
          datos: {
            situacionActual: 'Registro manual',
            problemas: 'Reprocesos',
            impacto: 'Costos altos',
          },
        },
        4,
      ),
    );
    const solicitud = httpTesting.expectOne(ENDPOINTS_CREACION_PROYECTO.actualizarBorrador);

    expect(solicitud.request.body).toMatchObject({
      proyectoId: 42,
      revisionEsperada: 1,
      pasoActual: 4,
      tipoSolucionJson: '{}',
      necesidadJson:
        '{"situacionActual":"Registro manual","problemas":"Reprocesos","impacto":"Costos altos"}',
      objetivosJson: '{}',
    });
    solicitud.flush(
      crearResultado({
        ...borradorDto,
        revision: 2,
        pasoActual: 4,
        necesidadJson: solicitud.request.body.necesidadJson,
      }),
    );

    await expect(respuesta).resolves.toMatchObject({ revision: 2, pasoActual: 4 });
  });

  it('actualiza Objetivos con el formato canónico en español', async () => {
    const borradorDto = crearBorradorDto();
    const cargaBorrador = firstValueFrom(servicio.obtenerBorrador(42));
    httpTesting
      .expectOne(
        (peticion) =>
          peticion.url === ENDPOINTS_CREACION_PROYECTO.obtenerBorrador &&
          peticion.params.get('proyectoId') === '42',
      )
      .flush(crearResultado(borradorDto));
    const borrador = await cargaBorrador;

    const respuesta = firstValueFrom(
      servicio.actualizarBorrador(
        borrador,
        {
          seccion: ClaveSeccionProyecto.Objetivos,
          datos: {
            objetivoGeneral: 'Reducir tiempos',
            objetivosEspecificos: ['Automatizar tareas', 'Medir resultados'],
          },
        },
        5,
      ),
    );
    const solicitud = httpTesting.expectOne(ENDPOINTS_CREACION_PROYECTO.actualizarBorrador);

    expect(solicitud.request.body).toMatchObject({
      proyectoId: 42,
      revisionEsperada: 1,
      pasoActual: 5,
      necesidadJson: '{}',
      objetivosJson:
        '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar tareas","Medir resultados"]}',
      alcanceJson: '{}',
    });
    solicitud.flush(
      crearResultado({
        ...borradorDto,
        revision: 2,
        pasoActual: 5,
        objetivosJson: solicitud.request.body.objetivosJson,
      }),
    );

    await expect(respuesta).resolves.toMatchObject({ revision: 2, pasoActual: 5 });
  });

  it('actualiza Alcance con el formato canónico en español', async () => {
    const borradorDto = crearBorradorDto();
    const cargaBorrador = firstValueFrom(servicio.obtenerBorrador(42));
    httpTesting
      .expectOne(
        (peticion) =>
          peticion.url === ENDPOINTS_CREACION_PROYECTO.obtenerBorrador &&
          peticion.params.get('proyectoId') === '42',
      )
      .flush(crearResultado(borradorDto));
    const borrador = await cargaBorrador;

    const respuesta = firstValueFrom(
      servicio.actualizarBorrador(
        borrador,
        {
          seccion: ClaveSeccionProyecto.Alcance,
          datos: {
            incluido: 'Seguimiento de envíos',
            excluido: 'Pagos en línea',
          },
        },
        6,
      ),
    );
    const solicitud = httpTesting.expectOne(ENDPOINTS_CREACION_PROYECTO.actualizarBorrador);

    expect(solicitud.request.body).toMatchObject({
      proyectoId: 42,
      revisionEsperada: 1,
      pasoActual: 6,
      objetivosJson: '{}',
      alcanceJson: '{"incluido":"Seguimiento de envíos","excluido":"Pagos en línea"}',
      rolesJson: '[]',
    });
    solicitud.flush(
      crearResultado({
        ...borradorDto,
        revision: 2,
        pasoActual: 6,
        alcanceJson: solicitud.request.body.alcanceJson,
      }),
    );

    await expect(respuesta).resolves.toMatchObject({ revision: 2, pasoActual: 6 });
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
