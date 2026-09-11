import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ResultadoApi } from '../../http/models/resultado-api.model';
import { ENDPOINTS_CATALOGOS } from '../config/endpoints-catalogos.config';
import { CatalogoValorDto } from '../models/catalogo-valor.dto';
import { CatalogosService } from './catalogos.service';

describe('CatalogosService', () => {
  let servicio: CatalogosService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(CatalogosService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('consulta por código técnico y entrega únicamente opciones activas', async () => {
    const respuesta = firstValueFrom(servicio.obtenerOpciones('gestion_producto_prioridad'));
    const solicitud = httpTesting.expectOne(
      (peticion) =>
        peticion.url === ENDPOINTS_CATALOGOS.obtenerValores &&
        peticion.params.get('catalogoTipoCodigo') === 'gestion_producto_prioridad',
    );

    solicitud.flush(crearResultado([crearValor(13, 'Alta', true), crearValor(14, 'Media', false)]));

    await expect(respuesta).resolves.toEqual([
      { id: 13, nombre: 'Alta', descripcion: 'Prioridad Alta' },
    ]);
  });
});

function crearValor(id: number, nombre: string, activo: boolean): CatalogoValorDto {
  return {
    id,
    codigo: `prioridad_${nombre.toLowerCase()}`,
    catalogoTipoId: 3,
    catalogoTipoCodigo: 'gestion_producto_prioridad',
    catalogoTipoNombre: 'Prioridad',
    nombre,
    descripcion: `Prioridad ${nombre}`,
    activo,
  };
}

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
