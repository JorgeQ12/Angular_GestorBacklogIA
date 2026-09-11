import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ENDPOINTS_USUARIOS as E } from '../config/endpoints-usuarios.config';
import { AdministracionUsuariosService } from './administracion-usuarios.service';

describe('Administración HTTP de usuarios', () => {
  let api: AdministracionUsuariosService;
  let http: HttpTestingController;
  const usuario = {
    id: 12,
    idAzure: 'azure-12',
    nombre: 'Ana Torres',
    correo: 'ana@empresa.com',
    perfilTecnicoId: 36,
    perfilTecnicoCodigo: 'perfil_qa',
    perfilTecnicoNombre: 'Ingeniero automatizador de calidad',
    limiteTokensMensual: 250000,
    activo: true,
    fechaCreacion: '2026-09-10T10:00:00Z',
    fechaActualizacion: null,
  };
  const datos = {
    idAzure: usuario.idAzure,
    nombre: usuario.nombre,
    correo: usuario.correo,
    perfilTecnicoId: usuario.perfilTecnicoId,
    limiteTokensMensual: usuario.limiteTokensMensual,
  };
  const resultado = (contenido: unknown, exitoso = true) => ({
    exitoso,
    datos: contenido,
    tipo: 1,
    mensaje: null,
    codigoError: null,
    errores: null,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AdministracionUsuariosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta usuarios incluyendo registros inactivos', async () => {
    const respuesta = firstValueFrom(api.obtenerUsuarios());
    const peticion = http.expectOne(
      (solicitud) =>
        solicitud.url === E.obtenerUsuarios &&
        solicitud.params.get('IncluirInactivos') === 'true',
    );
    expect(peticion.request.method).toBe('GET');
    peticion.flush(resultado([usuario]));
    expect(await respuesta).toEqual([usuario]);
  });

  it('crea un usuario activo con identidad Azure y perfil técnico', async () => {
    const respuesta = firstValueFrom(api.guardar(datos, null));
    const peticion = http.expectOne(E.crearUsuario);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ ...datos, activo: true });
    peticion.flush(resultado(usuario));
    expect(await respuesta).toEqual(usuario);
  });

  it('actualiza sin enviar la identidad Azure y conserva el estado vigente', async () => {
    const inactivo = { ...usuario, activo: false };
    const respuesta = firstValueFrom(api.guardar(datos, inactivo));
    const peticion = http.expectOne(E.actualizarUsuario);
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.body).toEqual({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      perfilTecnicoId: usuario.perfilTecnicoId,
      limiteTokensMensual: usuario.limiteTokensMensual,
      activo: false,
    });
    expect(peticion.request.body).not.toHaveProperty('idAzure');
    peticion.flush(resultado(inactivo));
    expect((await respuesta).activo).toBe(false);
  });

  it('inactiva con PATCH, Id como parámetro y cuerpo nulo', async () => {
    const respuesta = firstValueFrom(api.inactivar(usuario.id));
    const peticion = http.expectOne(
      (solicitud) =>
        solicitud.url === E.inactivarUsuario && solicitud.params.get('Id') === String(usuario.id),
    );
    expect(peticion.request.method).toBe('PATCH');
    expect(peticion.request.body).toBeNull();
    peticion.flush(resultado({ ...usuario, activo: false }));
    expect((await respuesta).activo).toBe(false);
  });

  it('rechaza una respuesta funcional fallida aunque contenga datos', async () => {
    const respuesta = firstValueFrom(api.obtenerUsuarios());
    const rechazo = expect(respuesta).rejects.toBeDefined();
    http.expectOne((solicitud) => solicitud.url === E.obtenerUsuarios).flush(
      resultado([usuario], false),
    );
    await rechazo;
  });
});
