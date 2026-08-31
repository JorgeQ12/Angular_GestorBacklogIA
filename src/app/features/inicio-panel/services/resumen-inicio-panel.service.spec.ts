import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ResultadoApi } from '../../../core/http/models/resultado-api.model';
import { ENDPOINTS_INICIO_PANEL } from '../config/endpoints-inicio-panel.config';
import { ResumenAdministrativoDto } from '../models/resumen-administrativo.dto';
import { ResumenInicioPanelService } from './resumen-inicio-panel.service';

const DATOS: ResumenAdministrativoDto = {
  fechaCorte: '2026-08-24',
  totalProyectos: 1,
  enBorrador: 0,
  enProgreso: 1,
  finalizados: 0,
  cerrados: 0,
  conBacklog: 1,
  pendientesBacklog: 0,
  vencidos: 1,
  proximosAVencer: 0,
  requierenAtencion: 1,
  atencion: [],
  recientes: [],
  borradoresRecientes: [],
};

describe('ResumenInicioPanelService', () => {
  let servicio: ResumenInicioPanelService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    servicio = TestBed.inject(ResumenInicioPanelService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('consulta el endpoint y entrega el resumen adaptado', async () => {
    const respuesta = firstValueFrom(servicio.obtenerResumen());
    const solicitud = httpTesting.expectOne(ENDPOINTS_INICIO_PANEL.resumenAdministrativo);

    expect(solicitud.request.method).toBe('GET');
    solicitud.flush(crearResultado(DATOS));

    await expect(respuesta).resolves.toMatchObject({
      fechaCorte: '2026-08-24',
      indicadores: { totalProyectos: 1, enProgreso: 1 },
    });
  });

  it('rechaza respuestas de negocio sin datos válidos', async () => {
    const respuesta = firstValueFrom(servicio.obtenerResumen());
    const solicitud = httpTesting.expectOne(ENDPOINTS_INICIO_PANEL.resumenAdministrativo);

    solicitud.flush({
      exitoso: false,
      tipo: 5,
      datos: null,
      mensaje: 'No fue posible obtener el resumen.',
      codigoError: 'resumen_no_disponible',
      errores: null,
    } satisfies ResultadoApi<ResumenAdministrativoDto>);

    await expect(respuesta).rejects.toThrow('No fue posible obtener el resumen.');
  });
});

function crearResultado(datos: ResumenAdministrativoDto): ResultadoApi<ResumenAdministrativoDto> {
  return {
    exitoso: true,
    tipo: 1,
    datos,
    mensaje: null,
    codigoError: null,
    errores: null,
  };
}
