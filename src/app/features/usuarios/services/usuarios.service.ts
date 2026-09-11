import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { exigirDatosResultadoApi } from '../../../core/http/mappers/resultado-api.mapper';
import type { ResultadoApi } from '../../../core/http/models/resultado-api.model';
import { ENDPOINTS_USUARIOS as E } from '../config/endpoints-usuarios.config';
import { mapearUsuario } from '../mappers/usuario.mapper';
import type { UsuarioDto } from '../models/usuario.dto';
import type { DatosUsuario, Usuario } from '../models/usuario.model';

/** Ejecuta las operaciones administrativas de usuarios mediante la carga HTTP global. */
@Injectable({ providedIn: 'root' })
export class UsuariosService {

  /** Ejecuta las solicitudes HTTP correspondientes a esta responsabilidad. */
  private readonly http = inject(HttpClient);

  /** Recupera la fotografía completa para administrar activos e inactivos. */
  public obtenerTodos(): Observable<readonly Usuario[]> {
    return this.http
      .get<ResultadoApi<UsuarioDto[]>>(E.obtenerUsuarios, {
        params: new HttpParams().set('IncluirInactivos', true),
      })
      .pipe(map((r) => exigirDatosResultadoApi(r, 'los usuarios').map(mapearUsuario)));
  }

  /** Crea o actualiza un usuario respetando la inmutabilidad de IdAzure. */
  public guardar(datos: DatosUsuario, entidad: Usuario | null): Observable<Usuario> {
    const camposEditables = {
      nombre: datos.nombre,
      correo: datos.correo || null,
      perfilTecnicoId: datos.perfilTecnicoId,
      limiteTokensMensual: datos.limiteTokensMensual,
    };
    const solicitud = entidad
      ? this.http.put<ResultadoApi<UsuarioDto>>(E.actualizarUsuario, {
          id: entidad.id,
          ...camposEditables,
          activo: entidad.activo,
        })
      : this.http.post<ResultadoApi<UsuarioDto>>(E.crearUsuario, {
          idAzure: datos.idAzure,
          ...camposEditables,
          activo: true,
        });
    return solicitud.pipe(map((r) => mapearUsuario(exigirDatosResultadoApi(r, 'el usuario'))));
  }

  /** Inactiva un usuario sin eliminar su identidad ni su historial. */
  public inactivar(id: number): Observable<Usuario> {
    return this.http
      .patch<ResultadoApi<UsuarioDto>>(E.inactivarUsuario, null, {
        params: new HttpParams().set('Id', id),
      })
      .pipe(map((r) => mapearUsuario(exigirDatosResultadoApi(r, 'el usuario inactivado'))));
  }

  /** Reactiva un usuario conservando sus datos administrativos actuales. */
  public activar(usuario: Usuario): Observable<Usuario> {
    return this.http
      .put<ResultadoApi<UsuarioDto>>(E.actualizarUsuario, {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        perfilTecnicoId: usuario.perfilTecnicoId,
        limiteTokensMensual: usuario.limiteTokensMensual,
        activo: true,
      })
      .pipe(map((r) => mapearUsuario(exigirDatosResultadoApi(r, 'el usuario activado'))));
  }
}
