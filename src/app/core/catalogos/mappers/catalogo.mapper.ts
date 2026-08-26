import { CatalogoValorDto } from '../models/catalogo-valor.dto';
import { OpcionCatalogo } from '../models/opcion-catalogo.model';

/** Adapta los valores activos del backend a opciones de interfaz. */
export function mapearOpcionesCatalogo(valores: readonly CatalogoValorDto[]): OpcionCatalogo[] {
  return valores
    .filter((valor) => valor.activo)
    .map((valor) => ({
      id: valor.id,
      nombre: valor.nombre,
      descripcion: valor.descripcion,
    }));
}
