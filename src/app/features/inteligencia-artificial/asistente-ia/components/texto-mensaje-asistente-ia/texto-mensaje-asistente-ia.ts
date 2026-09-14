import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

enum TipoBloqueTextoAsistenteIA {
  Parrafo = 'parrafo',
  ListaOrdenada = 'listaOrdenada',
  ListaNoOrdenada = 'listaNoOrdenada',
}

interface SegmentoTextoAsistenteIA {
  readonly texto: string;
  readonly resaltado: boolean;
}

interface BloqueTextoAsistenteIA {
  readonly tipo: TipoBloqueTextoAsistenteIA;
  readonly contenidos: readonly (readonly SegmentoTextoAsistenteIA[])[];
  readonly inicioLista: number | null;
}

const PATRON_NEGRITA = /\*\*(.+?)\*\*/g;
const PATRON_LISTA_ORDENADA = /^\s*(\d+)[.)]\s+(.+)$/;
const PATRON_LISTA_NO_ORDENADA = /^\s*[-*•]\s+(.+)$/;

function segmentarTexto(texto: string): readonly SegmentoTextoAsistenteIA[] {
  const segmentos: SegmentoTextoAsistenteIA[] = [];
  let posicion = 0;

  for (const coincidencia of texto.matchAll(PATRON_NEGRITA)) {
    const indice = coincidencia.index;
    if (indice > posicion) {
      segmentos.push({ texto: texto.slice(posicion, indice), resaltado: false });
    }
    segmentos.push({ texto: coincidencia[1], resaltado: true });
    posicion = indice + coincidencia[0].length;
  }

  if (posicion < texto.length) {
    segmentos.push({ texto: texto.slice(posicion), resaltado: false });
  }

  return segmentos.length ? segmentos : [{ texto, resaltado: false }];
}

function estructurarTexto(texto: string): readonly BloqueTextoAsistenteIA[] {
  const bloques: BloqueTextoAsistenteIA[] = [];
  let lineasParrafo: string[] = [];
  let listaActual: {
    tipo: TipoBloqueTextoAsistenteIA;
    contenidos: SegmentoTextoAsistenteIA[][];
    inicioLista: number | null;
  } | null = null;

  const cerrarParrafo = (): void => {
    if (!lineasParrafo.length) return;
    bloques.push({
      tipo: TipoBloqueTextoAsistenteIA.Parrafo,
      contenidos: lineasParrafo.map(segmentarTexto),
      inicioLista: null,
    });
    lineasParrafo = [];
  };

  for (const lineaOriginal of texto.replace(/\r\n?/g, '\n').split('\n')) {
    const linea = lineaOriginal.trim();
    if (!linea) {
      cerrarParrafo();
      continue;
    }

    const elementoOrdenado = linea.match(PATRON_LISTA_ORDENADA);
    const elementoNoOrdenado = linea.match(PATRON_LISTA_NO_ORDENADA);
    if (elementoOrdenado || elementoNoOrdenado) {
      cerrarParrafo();
      const tipo = elementoOrdenado
        ? TipoBloqueTextoAsistenteIA.ListaOrdenada
        : TipoBloqueTextoAsistenteIA.ListaNoOrdenada;
      const contenido = elementoOrdenado?.[2] ?? elementoNoOrdenado?.[1] ?? '';
      if (listaActual === null || listaActual.tipo !== tipo) {
        if (listaActual !== null) bloques.push(listaActual);
        listaActual = {
          tipo,
          contenidos: [],
          inicioLista: elementoOrdenado ? Number(elementoOrdenado[1]) : null,
        };
      }
      listaActual.contenidos.push([...segmentarTexto(contenido)]);
      continue;
    }

    if (listaActual !== null) {
      bloques.push(listaActual);
      listaActual = null;
    }
    lineasParrafo.push(linea);
  }

  cerrarParrafo();
  if (listaActual !== null) bloques.push(listaActual);
  return bloques;
}

/** Presenta el formato conversacional permitido sin interpretar HTML del modelo. */
@Component({
  selector: 'app-texto-mensaje-asistente-ia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './texto-mensaje-asistente-ia.html',
  styleUrl: './texto-mensaje-asistente-ia.css',
})
export class TextoMensajeAsistenteIA {
  /** Recibe el contenido textual devuelto por el modelo. */
  public readonly texto = input.required<string>();

  /** Expone los tipos de bloque admitidos a la plantilla. */
  protected readonly tiposBloque = TipoBloqueTextoAsistenteIA;

  /** Estructura el texto en párrafos y listas con énfasis acotado. */
  protected readonly bloques = computed(() => estructurarTexto(this.texto()));
}
