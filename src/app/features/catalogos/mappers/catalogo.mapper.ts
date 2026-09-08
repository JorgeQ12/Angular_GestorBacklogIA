import { CatalogoValorDto } from '../../../core/catalogos/models/catalogo-valor.dto';
import { CatalogoTipoDto } from '../models/catalogo-tipo.dto';
import { Catalogo, ValorCatalogo } from '../models/catalogo.model';
/** Conserva la identidad remota sin inventar códigos a partir del nombre. */
export function mapearCatalogo(dto: CatalogoTipoDto): Catalogo {
  return { id: dto.id, nombre: dto.nombre, descripcion: dto.descripcion, activo: dto.activo };
}
/** Adapta una opción conservando la relación con su catálogo. */
export function mapearValorCatalogo(dto: CatalogoValorDto): ValorCatalogo {
  return {
    ...mapearCatalogo(dto),
    catalogoTipoId: dto.catalogoTipoId,
    catalogoTipoNombre: dto.catalogoTipoNombre,
  };
}
