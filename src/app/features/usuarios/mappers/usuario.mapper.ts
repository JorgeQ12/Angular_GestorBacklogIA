import type { UsuarioDto } from '../models/usuario.dto';
import type { Usuario } from '../models/usuario.model';

/** Adapta la respuesta del backend sin derivar identidades ni perfiles. */
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
