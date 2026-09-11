import {
  EtiquetaRamaDecision,
  LadoConexionFlujo,
  TipoBloqueFlujo,
} from '../models/flujo-proyecto.model';
import {
  TAMANO_BLOQUE_FLUJO,
  construirRutaConexion,
  obtenerDesplazamientoConectorSalidaY,
  obtenerPuntoAnclajeBloque,
  resolverLadoDestinoMasCercano,
} from './geometria-flujo-proyecto.mapper';

describe('geometria-flujo-proyecto.mapper', () => {
  it('separa verticalmente las ramas de una decisión', () => {
    expect(
      obtenerDesplazamientoConectorSalidaY(TipoBloqueFlujo.Decision, EtiquetaRamaDecision.Si),
    ).toBe(74);
    expect(
      obtenerDesplazamientoConectorSalidaY(TipoBloqueFlujo.Decision, EtiquetaRamaDecision.No),
    ).toBe(114);
    expect(obtenerDesplazamientoConectorSalidaY(TipoBloqueFlujo.Accion)).toBe(
      TAMANO_BLOQUE_FLUJO.alto / 2,
    );
  });

  it('calcula los cuatro puntos de anclaje respetando el despeje visual', () => {
    const bloque = { posicion: { x: 100, y: 200 }, tipo: TipoBloqueFlujo.Accion };

    expect(obtenerPuntoAnclajeBloque(bloque, LadoConexionFlujo.Izquierda)).toEqual({
      x: 99,
      y: 278,
    });
    expect(obtenerPuntoAnclajeBloque(bloque, LadoConexionFlujo.Derecha)).toEqual({
      x: 349,
      y: 278,
    });
    expect(obtenerPuntoAnclajeBloque(bloque, LadoConexionFlujo.Arriba)).toEqual({
      x: 224,
      y: 197,
    });
    expect(obtenerPuntoAnclajeBloque(bloque, LadoConexionFlujo.Abajo)).toEqual({
      x: 224,
      y: 359,
    });
  });

  it('elige únicamente lados de entrada y conserva el más cercano', () => {
    const bloque = { posicion: { x: 100, y: 200 } };

    expect(resolverLadoDestinoMasCercano(bloque, { x: 90, y: 260 })).toBe(
      LadoConexionFlujo.Izquierda,
    );
    expect(resolverLadoDestinoMasCercano(bloque, { x: 220, y: 190 })).toBe(
      LadoConexionFlujo.Arriba,
    );
    expect(resolverLadoDestinoMasCercano(bloque, { x: 220, y: 370 })).toBe(LadoConexionFlujo.Abajo);
  });

  it.each([
    LadoConexionFlujo.Izquierda,
    LadoConexionFlujo.Derecha,
    LadoConexionFlujo.Arriba,
    LadoConexionFlujo.Abajo,
  ])('construye una trayectoria SVG completa hacia %s', (lado) => {
    const ruta = construirRutaConexion({ x: 10, y: 20 }, { x: 200, y: 160 }, lado);

    expect(ruta).toMatch(/^M 10 20 C /);
    expect(ruta).toMatch(/200 160$/);
  });
});
