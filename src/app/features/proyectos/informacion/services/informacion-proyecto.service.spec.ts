import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { ENDPOINTS_INFORMACION_PROYECTO } from '../config/endpoints-informacion-proyecto.config';
import type { ProyectoInformacionDto } from '../models/informacion-proyecto.dto';
import { InformacionProyectoService } from './informacion-proyecto.service';

describe('InformacionProyectoService', () => {
  let servicio: InformacionProyectoService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(InformacionProyectoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('consulta y adapta la fotografía vigente', async () => {
    const respuesta = firstValueFrom(servicio.obtenerProyecto(42));
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_INFORMACION_PROYECTO.obtenerProyecto,
    );
    expect(solicitud.request.params.get('ProyectoId')).toBe('42');
    solicitud.flush(resultado(DTO));
    await expect(respuesta).resolves.toMatchObject({ id: 42, versionId: 81, numeroVersion: 4 });
  });

  it('envía la versión esperada y conserva las secciones no editadas', async () => {
    const proyectoActual = firstValueFrom(servicio.obtenerProyecto(42));
    httpTesting
      .expectOne((request) => request.url === ENDPOINTS_INFORMACION_PROYECTO.obtenerProyecto)
      .flush(resultado(DTO));
    const proyecto = await proyectoActual;
    const respuesta = firstValueFrom(
      servicio.actualizarProyecto(proyecto, {
        seccion: ClaveSeccionProyecto.Alcance,
        datos: { incluido: 'Nuevo alcance', excluido: 'Pagos' },
      }),
    );
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_INFORMACION_PROYECTO.actualizarProyecto,
    );
    expect(solicitud.request.body).toMatchObject({
      id: 42,
      versionActualIdEsperada: 81,
      objetivosJson: DTO.objetivosJson,
    });
    solicitud.flush(resultado({ ...DTO, versionActualId: 82, numeroVersionActual: 5 }));
    await expect(respuesta).resolves.toMatchObject({ versionId: 82, numeroVersion: 5 });
  });
});

function resultado<T>(datos: T): ResultadoApi<T> {
  return { exitoso: true, tipo: 1, datos, mensaje: null, codigoError: null, errores: null };
}

const DTO: ProyectoInformacionDto = {
  id: 42,
  versionActualId: 81,
  nombre: 'Portal',
  responsable: 'Jorge',
  descripcion: 'Descripción',
  prioridadCatalogoId: 2,
  prioridadCatalogo: { id: 2, codigo: 'alta', nombre: 'Alta', descripcion: '' },
  estadoCatalogoId: 3,
  estadoCatalogo: { id: 3, codigo: 'en_progreso', nombre: 'En Progreso', descripcion: '' },
  fechaObjetivo: '2026-12-10',
  numeroVersionActual: 4,
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson: '{"situacionActual":"Actual","problemas":"Problema","impacto":"Impacto"}',
  objetivosJson: '{"objetivoGeneral":"Mejorar","objetivosEspecificos":["Automatizar"]}',
  alcanceJson: '{"incluido":"Portal","excluido":"Pagos"}',
  rolesJson: '[{"nombre":"Administrador","descripcion":"Configura"}]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  azure: {
    organizacion: 'interia',
    proyectoAzureNombre: 'PoC',
    teamNombre: 'Team',
    boardUrl: 'board',
    epicaAzureId: 1,
    urlEpica: 'epica',
    tituloEpica: 'Pruebas',
  },
};
