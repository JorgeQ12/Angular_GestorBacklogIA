import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { exigirDatosResultadoApi } from '../../../core/http/mappers/resultado-api.mapper';
import type { ResultadoApi } from '../../../core/http/models/resultado-api.model';
import { ENDPOINTS_USUARIOS as E } from '../config/endpoints-usuarios.config';
import { mapearUsuario } from '../mappers/usuario.mapper';
import type {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  UsuarioDto,
} from '../models/usuario.dto';
import type { DatosUsuario, Usuario } from '../models/usuario.model';

/** Administra usuarios mediante contratos explícitos y la carga HTTP global. */
@Injectable({ providedIn: 'root' })
export class AdministracionUsuariosService {
  private readonly http = inject(HttpClient);

  /** Recupera usuarios activos e inactivos para su administración. */
  public obtenerUsuarios(): Observable<readonly Usuario[]> {
    return this.http
      .get<ResultadoApi<readonly UsuarioDto[]>>(E.obtenerUsuarios, {
        params: new HttpParams().set('IncluirInactivos', true),
      })
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'los usuarios')),
        map((usuarios) => usuarios.map(mapearUsuario)),
      );
  }

  /** Crea o actualiza un usuario sin intentar modificar su identidad Azure al editar. */
  public guardar(
    datos: DatosUsuario,
    usuario: Usuario | null,
    activo = usuario?.activo ?? true,
  ): Observable<Usuario> {
    const solicitud = usuario
      ? this.http.put<ResultadoApi<UsuarioDto>>(E.actualizarUsuario, {
          id: usuario.id,
          nombre: datos.nombre,
          correo: datos.correo,
          perfilTecnicoId: datos.perfilTecnicoId,
          limiteTokensMensual: datos.limiteTokensMensual,
          activo,
        } satisfies ActualizarUsuarioDto)
      : this.http.post<ResultadoApi<UsuarioDto>>(E.crearUsuario, {
          idAzure: datos.idAzure,
          nombre: datos.nombre,
          correo: datos.correo,
          perfilTecnicoId: datos.perfilTecnicoId,
          limiteTokensMensual: datos.limiteTokensMensual,
          activo,
        } satisfies CrearUsuarioDto);

    return solicitud.pipe(
      map((resultado) => mapearUsuario(exigirDatosResultadoApi(resultado, 'el usuario guardado'))),
    );
  }

  /** Inactiva un usuario conservando su información e historial. */
  public inactivar(id: number): Observable<Usuario> {
    return this.http
      .patch<ResultadoApi<UsuarioDto>>(E.inactivarUsuario, null, {
        params: new HttpParams().set('Id', id),
      })
      .pipe(
        map((resultado) =>
          mapearUsuario(exigirDatosResultadoApi(resultado, 'el usuario inactivado')),
        ),
      );
  }
}
