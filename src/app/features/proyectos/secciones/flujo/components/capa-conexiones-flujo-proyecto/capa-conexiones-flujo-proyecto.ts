import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import {
  construirRutaConexion,
  obtenerPuntoAnclajeBloque,
  resolverLadoDestinoMasCercano,
} from '../../mappers/geometria-flujo-proyecto.mapper';
import {
  EtiquetaRamaDecision,
  LadoConexionFlujo,
  esEtiquetaRamaDecision,
} from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

/** Identifica la capa visual que debe representar el componente de conexiones. */
export enum ModoCapaConexionesFlujo {
  Lineas = 'lineas',
  SuperposicionEliminacion = 'superposicionEliminacion',
}

/** Representa las conexiones y sus acciones sobre el lienzo. */
@Component({
  selector: 'app-capa-conexiones-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './capa-conexiones-flujo-proyecto.html',
  styleUrl: './capa-conexiones-flujo-proyecto.css',
})
export class CapaConexionesFlujoProyecto {

  /** Proporciona acceso al servicio de estado editor flujo proyecto. */
  protected readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);
  /** Selecciona la superficie visual de conexiones que debe representarse. */
  public readonly modo = input<ModoCapaConexionesFlujo>(ModoCapaConexionesFlujo.Lineas);

  /** Conserva modos capa para coordinar esta responsabilidad. */
  protected readonly modosCapa = ModoCapaConexionesFlujo;

  /** Deriva conexiones representadas a partir del estado vigente. */
  protected readonly conexionesRepresentadas = computed(() => {
    const bloques = new Map(
      this.estadoEditor.bloquesVisibles().map((bloque) => [bloque.id, bloque]),
    );

    return this.estadoEditor
      .conexionesVisibles()
      .map((conexion) => {
        const origen = bloques.get(conexion.idBloqueOrigen);
        const destino = bloques.get(conexion.idBloqueDestino);
        if (!origen || !destino) return null;

        const puntoOrigen = obtenerPuntoAnclajeBloque(
          origen,
          LadoConexionFlujo.Derecha,
          conexion.etiqueta,
        );
        const ladoDestino =
          (conexion.ladoDestino === LadoConexionFlujo.Derecha
            ? LadoConexionFlujo.Izquierda
            : conexion.ladoDestino) ?? resolverLadoDestinoMasCercano(destino, puntoOrigen);
        const puntoDestino = obtenerPuntoAnclajeBloque(destino, ladoDestino);
        const esRamaDecision = esEtiquetaRamaDecision(conexion.etiqueta);
        const anchoEtiqueta = Math.max(
          34,
          conexion.etiqueta ? conexion.etiqueta.length * 7 + 18 : 34,
        );
        const centroEtiquetaX = esRamaDecision
          ? puntoOrigen.x +
            Math.min(84, Math.max(52, Math.abs(puntoDestino.x - puntoOrigen.x) * 0.42))
          : puntoOrigen.x + (puntoDestino.x - puntoOrigen.x) / 2;
        const centroEtiquetaY = esRamaDecision
          ? puntoOrigen.y + (conexion.etiqueta === EtiquetaRamaDecision.Si ? -18 : 18)
          : puntoOrigen.y + (puntoDestino.y - puntoOrigen.y) / 2 - 14;

        return {
          ...conexion,
          etiquetaAccesible: `Seleccionar conexión de ${origen.titulo} hacia ${destino.titulo}`,
          esRamaDecision,
          ladoDestino,
          trayectoria: construirRutaConexion(puntoOrigen, puntoDestino, ladoDestino),
          centroEtiquetaX,
          rectanguloEtiquetaX: centroEtiquetaX - anchoEtiqueta / 2,
          rectanguloEtiquetaY: centroEtiquetaY - 10,
          textoEtiquetaY: centroEtiquetaY + 4,
          anchoEtiqueta,
          eliminarX: centroEtiquetaX - 56,
          eliminarY: centroEtiquetaY - (conexion.etiqueta && !esRamaDecision ? 42 : 14),
        };
      })
      .filter((conexion): conexion is NonNullable<typeof conexion> => conexion !== null);
  });

  /** Deriva previsualización conexión a partir del estado vigente. */
  protected readonly previsualizacionConexion = computed(() =>
    this.estadoEditor.previsualizacionConexionActiva(),
  );

  /** Selecciona conexión dentro del flujo actual. */
  protected seleccionarConexion(idConexion: string): void {
    if (!this.estadoEditor.soloLectura()) this.estadoEditor.seleccionarConexion(idConexion);
  }

  /** Selecciona una conexión desde Enter o Espacio sin desplazar el lienzo. */
  protected seleccionarConexionDesdeTeclado(
    evento: Event,
    idConexion: string,
  ): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.seleccionarConexion(idConexion);
  }

  /** Elimina conexión dentro del flujo actual. */
  protected eliminarConexion(idConexion: string): void {
    this.estadoEditor.eliminarConexion(idConexion);
  }

  /** Determina si rama decision. */
  protected esRamaDecision(etiqueta: string | null): boolean {
    return esEtiquetaRamaDecision(etiqueta);
  }
}
