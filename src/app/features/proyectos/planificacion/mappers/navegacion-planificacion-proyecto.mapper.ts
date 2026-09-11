/** Convierte el parámetro de consulta en una identidad de versión válida. */
export function obtenerVersionIdPlanificacionProyecto(valor: string | null): number | null {
  if (valor === null || valor.trim() === '') return null;
  const versionId = Number(valor);
  return Number.isInteger(versionId) && versionId > 0 ? versionId : null;
}
