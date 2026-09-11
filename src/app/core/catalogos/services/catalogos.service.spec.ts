import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ResultadoApi } from '../../http/models/resultado-api.model';
import { ENDPOINTS_CATALOGOS } from '../config/endpoints-catalogos.config';
import { CatalogoValorDto } from '../models/catalogo-valor.dto';
import { CodigoTipoCatalogoGestionProducto } from '../models/codigo-tipo-catalogo-gestion-producto.enum';
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

  it('consulta por código y entrega solo las opciones activas del catálogo solicitado', async () => {
    const respuesta = firstValueFrom(
      servicio.obtenerOpciones(CodigoTipoCatalogoGestionProducto.Prioridad),
    );
    const solicitud = httpTesting.expectOne(
      (peticion) =>
        peticion.url === ENDPOINTS_CATALOGOS.obtenerValores &&
        peticion.params.get('catalogoTipoCodigo') === CodigoTipoCatalogoGestionProducto.Prioridad &&
        !peticion.params.has('catalogoTipoNombre'),
    );

    solicitud.flush(
      crearResultado([
        crearValor(13, 'Alta', true),
        crearValor(14, 'Media', false),
        crearValor(21, 'Alto', true, CodigoTipoCatalogoGestionProducto.Riesgo, 'Riesgo'),
      ]),
    );

    await expect(respuesta).resolves.toEqual([
      { id: 13, nombre: 'Alta', descripcion: 'Prioridad Alta' },
    ]);
  });
});

function crearValor(
  id: number,
  nombre: string,
  activo: boolean,
  catalogoTipoCodigo = CodigoTipoCatalogoGestionProducto.Prioridad,
  catalogoTipoNombre = 'Prioridad',
): CatalogoValorDto {
  return {
    id,
    codigo: `${catalogoTipoCodigo}_${nombre.toLowerCase()}`,
    catalogoTipoId: 3,
    catalogoTipoCodigo,
    catalogoTipoNombre,
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
