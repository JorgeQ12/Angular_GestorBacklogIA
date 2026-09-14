import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ENDPOINTS_USUARIOS as E } from '../config/endpoints-usuarios.config';
import type { Usuario } from '../models/usuario.model';
import { UsuariosService } from './usuarios.service';

describe('Administración HTTP de usuarios', () => {
  let api: UsuariosService;
  let http: HttpTestingController;
  const usuario: Usuario = {
    id: 7,
    idAzure: 'azure-7',
    nombre: 'Ada Lovelace',
    correo: 'ada@empresa.com',
    perfilTecnicoId: 32,
    perfilTecnicoCodigo: 'perfil_arquitectura',
    perfilTecnicoNombre: 'Arquitectura',
    limiteTokensMensual: 100000,
    activo: true,
    fechaCreacion: '2026-09-01T12:00:00Z',
    fechaActualizacion: null,
  };
  const resultado = (datos: unknown) => ({
    exitoso: true,
    datos,
    tipo: 1,
    mensaje: null,
    codigoError: null,
    errores: null,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(UsuariosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta la colección incluyendo usuarios inactivos', async () => {
    const promesa = firstValueFrom(api.obtenerTodos());
    const req = http.expectOne(
      (solicitud) =>
        solicitud.url === E.obtenerUsuarios &&
        solicitud.params.get('IncluirInactivos') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush(resultado([usuario]));
    expect(await promesa).toEqual([usuario]);
  });

  it('crea un usuario con IdAzure y normaliza el correo vacío', async () => {
    const promesa = firstValueFrom(
      api.guardar(
        {
          idAzure: 'azure-7',
          nombre: 'Ada Lovelace',
          correo: '',
          perfilTecnicoId: 32,
          limiteTokensMensual: null,
        },
        null,
      ),
    );
    const req = http.expectOne(E.crearUsuario);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      idAzure: 'azure-7',
      nombre: 'Ada Lovelace',
      correo: null,
      perfilTecnicoId: 32,
      limiteTokensMensual: null,
      activo: true,
    });
    req.flush(resultado(usuario));
    await expect(promesa).resolves.toEqual(usuario);
  });

  it('actualiza sin enviar IdAzure y conserva el estado vigente', async () => {
    const promesa = firstValueFrom(
      api.guardar(
        {
          idAzure: 'identidad-ignorada',
          nombre: 'Ada actualizada',
          correo: 'ada@empresa.com',
          perfilTecnicoId: 33,
          limiteTokensMensual: 0,
        },
        usuario,
      ),
    );
    const req = http.expectOne(E.actualizarUsuario);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      id: 7,
      nombre: 'Ada actualizada',
      correo: 'ada@empresa.com',
      perfilTecnicoId: 33,
      limiteTokensMensual: 0,
      activo: true,
    });
    req.flush(resultado({ ...usuario, nombre: 'Ada actualizada' }));
    await promesa;
  });

  it('inactiva mediante PATCH y reactiva mediante PUT con la fotografía vigente', async () => {
    const inactivar = firstValueFrom(api.inactivar(7));
    const patch = http.expectOne(
      (solicitud) =>
        solicitud.url === E.inactivarUsuario && solicitud.params.get('Id') === '7',
    );
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toBeNull();
    patch.flush(resultado({ ...usuario, activo: false }));
    await inactivar;

    const activar = firstValueFrom(api.activar({ ...usuario, activo: false }));
    const put = http.expectOne(E.actualizarUsuario);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      perfilTecnicoId: usuario.perfilTecnicoId,
      limiteTokensMensual: usuario.limiteTokensMensual,
      activo: true,
    });
    put.flush(resultado(usuario));
    await activar;
  });
});
