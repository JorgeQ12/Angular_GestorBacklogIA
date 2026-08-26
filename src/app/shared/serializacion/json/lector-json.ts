/** Representa un objeto JSON comprobado sin asumir un contrato de dominio. */
export type ObjetoJson = Readonly<Record<string, unknown>>;

/** Recupera un objeto JSON sin propagar errores ni aceptar colecciones como objetos. */
export function deserializarObjetoJson(contenido: string): ObjetoJson {
  try {
    const valor: unknown = JSON.parse(contenido || '{}');
    return valor !== null && typeof valor === 'object' && !Array.isArray(valor)
      ? (valor as ObjetoJson)
      : {};
  } catch {
    return {};
  }
}

/** Recupera una propiedad textual normalizada desde un objeto JSON comprobado. */
export function obtenerTextoJson(objeto: ObjetoJson, propiedad: string): string | null {
  const valor = objeto[propiedad];
  return typeof valor === 'string' ? valor.trim() : null;
}
