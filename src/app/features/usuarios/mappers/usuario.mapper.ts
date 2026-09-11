import type { UsuarioDto } from '../models/usuario.dto';
import type { Usuario } from '../models/usuario.model';

/** Separa la representación de usuarios de la forma concreta de la respuesta HTTP. */
export function mapearUsuario(dto: UsuarioDto): Usuario {
  return {
    id: dto.id,
    idAzure: dto.idAzure,
    nombre: dto.nombre,
    correo: dto.correo,
    perfilTecnicoId: dto.perfilTecnicoId,
    perfilTecnicoCodigo: dto.perfilTecnicoCodigo,
    perfilTecnicoNombre: dto.perfilTecnicoNombre,
    limiteTokensMensual: dto.limiteTokensMensual,
    activo: dto.activo,
    fechaCreacion: dto.fechaCreacion,
    fechaActualizacion: dto.fechaActualizacion,
  };
}
