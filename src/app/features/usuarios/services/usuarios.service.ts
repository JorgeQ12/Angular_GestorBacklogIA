import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { exigirDatosResultadoApi } from '../../../core/http/mappers/resultado-api.mapper';
import type { PaginadoDto } from '../../../core/http/models/paginado.dto';
import type { ResultadoApi } from '../../../core/http/models/resultado-api.model';
import { ENDPOINTS_USUARIOS as E } from '../config/endpoints-usuarios.config';
import { mapearPaginaUsuarios, mapearUsuario } from '../mappers/usuario.mapper';
import type { UsuarioDto } from '../models/usuario.dto';
import type {
  ConsultaUsuarios,
  DatosUsuario,
  PaginaUsuarios,
  Usuario,
} from '../models/usuario.model';

/** Ejecuta las operaciones administrativas de usuarios mediante la carga HTTP global. */
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  /** Ejecuta las solicitudes HTTP correspondientes a esta responsabilidad. */
  private readonly http = inject(HttpClient);

  /** Recupera una página de usuarios según el criterio administrativo vigente. */
  public obtenerTodos(consulta: ConsultaUsuarios): Observable<PaginaUsuarios> {
    let parametros = new HttpParams()
      .set('incluirInactivos', consulta.incluirInactivos)
      .set('paginaActual', consulta.paginaActual)
      .set('paginaTamano', consulta.paginaTamano);
    if (consulta.busqueda) parametros = parametros.set('busqueda', consulta.busqueda);

    return this.http
      .get<ResultadoApi<PaginadoDto<UsuarioDto>>>(E.obtenerUsuarios, { params: parametros })
      .pipe(map((r) => mapearPaginaUsuarios(exigirDatosResultadoApi(r, 'los usuarios'))));
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
