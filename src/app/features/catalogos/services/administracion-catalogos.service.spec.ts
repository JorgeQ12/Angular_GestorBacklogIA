import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ENDPOINTS_ADMINISTRACION_CATALOGOS as E } from '../config/endpoints-administracion-catalogos.config';
import { AdministracionCatalogosService } from './administracion-catalogos.service';

describe('Administración HTTP de catálogos', () => {
  let api: AdministracionCatalogosService;
  let http: HttpTestingController;
  const tipo = {
    id: 51,
    codigo: 'gestion_areas',
    nombre: 'Áreas',
    descripcion: 'Áreas operativas',
    activo: false,
  };
  const valor = {
    ...tipo,
    id: 83,
    codigo: 'areas_logistica',
    catalogoTipoId: 51,
    catalogoTipoCodigo: 'gestion_areas',
    catalogoTipoNombre: 'Áreas',
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AdministracionCatalogosService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  const resultado = (datos: unknown, exitoso = true) => ({
    exitoso,
    datos,
    tipo: 1,
    mensaje: null,
    codigoError: null,
    errores: null,
  });
  it('consulta ambas colecciones incluyendo inactivos', async () => {
    const tipos = firstValueFrom(api.obtenerTipos());
    const opciones = firstValueFrom(api.obtenerValores());
    for (const [url, datos] of [
      [E.obtenerTipos, tipo],
      [E.obtenerValores, valor],
    ] as const) {
      const req = http.expectOne(
        (r) => r.url === url && r.params.get('IncluirInactivos') === 'true',
      );
      expect(req.request.method).toBe('GET');
      req.flush(resultado([datos]));
    }
    expect(await tipos).toEqual([tipo]);
    expect(await opciones).toEqual([valor]);
  });
  it('crea y actualiza tipos con los campos persistibles y conserva el estado al editar', async () => {
    const crear = firstValueFrom(api.guardarTipo(tipo, null));
    const post = http.expectOne(E.crearTipo);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      codigo: tipo.codigo,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      activo: true,
    });
    post.flush(resultado(tipo));
    expect(await crear).toEqual(tipo);
    const editar = firstValueFrom(api.guardarTipo(tipo, tipo));
    const put = http.expectOne(E.actualizarTipo);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({
      id: tipo.id,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      activo: tipo.activo,
    });
    put.flush(resultado(tipo));
    await editar;
  });
  it('crea y activa opciones conservando la identidad del padre', async () => {
    const crear = firstValueFrom(api.guardarValor(valor, 51, null));
    const post = http.expectOne(E.crearValor);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      codigo: valor.codigo,
      nombre: valor.nombre,
      descripcion: valor.descripcion,
      catalogoTipoId: 51,
      activo: true,
    });
    post.flush(resultado(valor));
    expect(await crear).toEqual(valor);
    const editar = firstValueFrom(api.guardarValor(valor, 51, valor, true));
    const put = http.expectOne(E.actualizarValor);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({
      id: 83,
      nombre: valor.nombre,
      descripcion: valor.descripcion,
      catalogoTipoId: 51,
      activo: true,
    });
    put.flush(resultado({ ...valor, activo: true }));
    expect((await editar).activo).toBe(true);
  });
  it('inactiva tipos y opciones con PATCH, Id y cuerpo nulo', async () => {
    const tipos = firstValueFrom(api.inactivarTipo(51));
    const valores = firstValueFrom(api.inactivarValor(83));
    for (const [url, datos] of [
      [E.inactivarTipo, tipo],
      [E.inactivarValor, valor],
    ] as const) {
      const req = http.expectOne((r) => r.url === url && r.params.get('Id') === String(datos.id));
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBeNull();
      req.flush(resultado(datos));
    }
    expect(await tipos).toEqual(tipo);
    expect(await valores).toEqual(valor);
  });
  it('rechaza fallos funcionales aunque incluyan datos y rechaza datos nulos', async () => {
    const respuesta = firstValueFrom(api.obtenerTipos());
    const rechazo = expect(respuesta).rejects.toBeDefined();
    http.expectOne((r) => r.url === E.obtenerTipos).flush(resultado([tipo], false));
    await rechazo;
    const guardado = firstValueFrom(api.guardarTipo(tipo, null));
    const sinDatos = expect(guardado).rejects.toBeDefined();
    http.expectOne(E.crearTipo).flush(resultado(null));
    await sinDatos;
  });
});
