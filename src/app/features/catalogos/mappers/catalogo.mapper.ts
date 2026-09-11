import { CatalogoValorDto } from '../../../core/catalogos/models/catalogo-valor.dto';
import { CatalogoTipoDto } from '../models/catalogo-tipo.dto';
import { Catalogo, ValorCatalogo } from '../models/catalogo.model';
/** Conserva las identidades remotas sin derivar el código a partir del nombre. */
export function mapearCatalogo(dto: CatalogoTipoDto): Catalogo {
  return {
    id: dto.id,
    codigo: dto.codigo,
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    activo: dto.activo,
  };
}
/** Adapta una opción conservando la relación con su catálogo. */
export function mapearValorCatalogo(dto: CatalogoValorDto): ValorCatalogo {
  return {
    ...mapearCatalogo(dto),
    catalogoTipoId: dto.catalogoTipoId,
    catalogoTipoCodigo: dto.catalogoTipoCodigo,
    catalogoTipoNombre: dto.catalogoTipoNombre,
  };
}
