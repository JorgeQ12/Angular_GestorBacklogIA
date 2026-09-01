import {
  EtiquetaRamaDecision,
  LadoConexionFlujo,
  NodoFlujoProyecto,
  TamanoLienzoFlujo,
  TipoBloqueFlujo,
  esEtiquetaRamaDecision,
} from '../models/flujo-proyecto.model';

/** Define el área disponible para ubicar nodos dentro del lienzo. */
export const TAMANO_LIENZO_FLUJO: TamanoLienzoFlujo = {
  ancho: 2400,
  alto: 1600,
};

/** Define las dimensiones uniformes de cada bloque del flujo. */
export const TAMANO_BLOQUE_FLUJO = {
  ancho: 248,
  alto: 156,
} as const;

const DESPLAZAMIENTO_CENTRO_CONECTOR_X = 1;
const DESPEJE_FLECHA_VERTICAL = 3;
const DESPLAZAMIENTO_CENTRO_CONECTOR_Y = TAMANO_BLOQUE_FLUJO.alto / 2;
const ALTURA_CONECTOR_DECISION: Record<EtiquetaRamaDecision, number> = {
  [EtiquetaRamaDecision.Si]: 74,
  [EtiquetaRamaDecision.No]: 114,
};

/** Obtiene la altura del conector de salida según el tipo de nodo y su etiqueta. */
export function obtenerDesplazamientoConectorSalidaY(
  tipo: TipoBloqueFlujo,
  etiqueta?: string | null,
): number {
  if (tipo === TipoBloqueFlujo.Decision && esEtiquetaRamaDecision(etiqueta)) {
    return ALTURA_CONECTOR_DECISION[etiqueta];
  }

  return DESPLAZAMIENTO_CENTRO_CONECTOR_Y;
}

/** Obtiene el punto de anclaje visible de un nodo para un lado determinado. */
export function obtenerPuntoAnclajeBloque(
  bloque: Pick<NodoFlujoProyecto, 'posicion' | 'tipo'>,
  lado: LadoConexionFlujo,
  etiqueta?: string | null,
): { x: number; y: number } {
  const izquierda = bloque.posicion.x - DESPLAZAMIENTO_CENTRO_CONECTOR_X;
  const derecha =
    bloque.posicion.x + TAMANO_BLOQUE_FLUJO.ancho + DESPLAZAMIENTO_CENTRO_CONECTOR_X;
  const centroX = bloque.posicion.x + TAMANO_BLOQUE_FLUJO.ancho / 2;
  const arriba = bloque.posicion.y;
  const abajo = bloque.posicion.y + TAMANO_BLOQUE_FLUJO.alto;
  const centroY =
    bloque.posicion.y + obtenerDesplazamientoConectorSalidaY(bloque.tipo, etiqueta);

  switch (lado) {
    case LadoConexionFlujo.Izquierda:
      return { x: izquierda, y: bloque.posicion.y + DESPLAZAMIENTO_CENTRO_CONECTOR_Y };
    case LadoConexionFlujo.Derecha:
      return { x: derecha, y: centroY };
    case LadoConexionFlujo.Arriba:
      return { x: centroX, y: arriba - DESPEJE_FLECHA_VERTICAL };
    case LadoConexionFlujo.Abajo:
      return { x: centroX, y: abajo + DESPEJE_FLECHA_VERTICAL };
  }
}

/** Resuelve el lado del nodo más cercano a un punto del lienzo. */
export function resolverLadoConexionMasCercano(
  bloque: Pick<NodoFlujoProyecto, 'posicion'>,
  punto: { x: number; y: number },
): LadoConexionFlujo {
  const distancias: Record<LadoConexionFlujo, number> = {
    [LadoConexionFlujo.Izquierda]: Math.abs(punto.x - bloque.posicion.x),
    [LadoConexionFlujo.Derecha]: Math.abs(
      punto.x - (bloque.posicion.x + TAMANO_BLOQUE_FLUJO.ancho),
    ),
    [LadoConexionFlujo.Arriba]: Math.abs(punto.y - bloque.posicion.y),
    [LadoConexionFlujo.Abajo]: Math.abs(
      punto.y - (bloque.posicion.y + TAMANO_BLOQUE_FLUJO.alto),
    ),
  };

  return (Object.entries(distancias).sort((a, b) => a[1] - b[1])[0]?.[0] ??
    LadoConexionFlujo.Izquierda) as LadoConexionFlujo;
}

/** Resuelve el lado de entrada permitido más cercano a un punto del lienzo. */
export function resolverLadoDestinoMasCercano(
  bloque: Pick<NodoFlujoProyecto, 'posicion'>,
  punto: { x: number; y: number },
): Exclude<LadoConexionFlujo, LadoConexionFlujo.Derecha> {
  const distancias: Record<Exclude<LadoConexionFlujo, LadoConexionFlujo.Derecha>, number> = {
    [LadoConexionFlujo.Izquierda]: Math.abs(punto.x - bloque.posicion.x),
    [LadoConexionFlujo.Arriba]: Math.abs(punto.y - bloque.posicion.y),
    [LadoConexionFlujo.Abajo]: Math.abs(
      punto.y - (bloque.posicion.y + TAMANO_BLOQUE_FLUJO.alto),
    ),
  };

  return (Object.entries(distancias).sort((a, b) => a[1] - b[1])[0]?.[0] ??
    LadoConexionFlujo.Izquierda) as Exclude<LadoConexionFlujo, LadoConexionFlujo.Derecha>;
}

/** Construye la trayectoria SVG entre el origen y el destino de una conexión. */
export function construirRutaConexion(
  puntoOrigen: { x: number; y: number },
  puntoDestino: { x: number; y: number },
  ladoDestino: LadoConexionFlujo,
): string {
  const desplazamientoHorizontal = Math.max(72, Math.abs(puntoDestino.x - puntoOrigen.x) / 2);
  const desplazamientoVertical = Math.max(56, Math.abs(puntoDestino.y - puntoOrigen.y) / 2);
  const tramoVertical = 14;

  switch (ladoDestino) {
    case LadoConexionFlujo.Arriba:
      return `M ${puntoOrigen.x} ${puntoOrigen.y} C ${puntoOrigen.x + desplazamientoHorizontal} ${puntoOrigen.y}, ${puntoDestino.x} ${puntoDestino.y - tramoVertical - desplazamientoVertical}, ${puntoDestino.x} ${puntoDestino.y - tramoVertical} L ${puntoDestino.x} ${puntoDestino.y}`;
    case LadoConexionFlujo.Abajo:
      return `M ${puntoOrigen.x} ${puntoOrigen.y} C ${puntoOrigen.x + desplazamientoHorizontal} ${puntoOrigen.y}, ${puntoDestino.x} ${puntoDestino.y + tramoVertical + desplazamientoVertical}, ${puntoDestino.x} ${puntoDestino.y + tramoVertical} L ${puntoDestino.x} ${puntoDestino.y}`;
    case LadoConexionFlujo.Derecha:
      return `M ${puntoOrigen.x} ${puntoOrigen.y} C ${puntoOrigen.x + desplazamientoHorizontal} ${puntoOrigen.y}, ${puntoDestino.x + desplazamientoHorizontal} ${puntoDestino.y}, ${puntoDestino.x} ${puntoDestino.y}`;
    case LadoConexionFlujo.Izquierda:
      return `M ${puntoOrigen.x} ${puntoOrigen.y} C ${puntoOrigen.x + desplazamientoHorizontal} ${puntoOrigen.y}, ${puntoDestino.x - desplazamientoHorizontal} ${puntoDestino.y}, ${puntoDestino.x} ${puntoDestino.y}`;
  }
}
