import { Injectable, computed, signal } from '@angular/core';
import {
  DESCRIPCIONES_TIPO_BLOQUE_FLUJO,
  ETIQUETAS_TIPO_BLOQUE_FLUJO,
  POLITICA_ROLES_POR_TIPO_BLOQUE,
  TIPOS_BLOQUE_FLUJO_DISPONIBLES,
} from '../config/flujo-proyecto.config';
import {
  construirRutaConexion,
  TAMANO_BLOQUE_FLUJO,
  TAMANO_LIENZO_FLUJO,
  obtenerPuntoAnclajeBloque,
  resolverLadoDestinoMasCercano,
} from '../mappers/geometria-flujo-proyecto.mapper';
import {
  BorradorNodoFlujo,
  ConexionFlujoProyecto,
  EtiquetaRamaDecision,
  FlujoProyecto,
  LadoConexionFlujo,
  ModoEditorNodoFlujo,
  NodoFlujoProyecto,
  PoliticaRolesBloqueFlujo,
  RolFlujoProyecto,
  TipoBloqueFlujo,
  VistaLienzoFlujo,
  crearDatosNodoPredeterminados,
  esEtiquetaRamaDecision,
} from '../models/flujo-proyecto.model';

interface EstadoEditorNodo {
  modo: ModoEditorNodoFlujo;
  tipo: TipoBloqueFlujo;
  idNodo: string | null;
  posicionSugerida: { x: number; y: number };
}

interface PuntoPrevisualizacionConexion {
  x: number;
  y: number;
}

interface OpcionesHidratacion {
  conservarVista?: boolean;
  conservarSeleccion?: boolean;
}

enum PrefijoIdentificadorFlujo {
  Rol = 'rol',
  Bloque = 'bloque',
  Conexion = 'conexion',
}

const VISTA_PREDETERMINADA: VistaLienzoFlujo = {
  desplazamientoX: 0,
  desplazamientoY: 0,
  escala: 1,
};

/** Administra el estado local y las operaciones del editor visual del flujo. */
@Injectable()
export class EstadoEditorFlujoProyectoService {
  private readonly flujoSenal = signal<FlujoProyecto>(this.crearFlujoVacio(''));
  private readonly vistaSenal = signal<VistaLienzoFlujo>(VISTA_PREDETERMINADA);
  private readonly idBloqueSeleccionadoSenal = signal<string | null>(null);
  private readonly idConexionSeleccionadaSenal = signal<string | null>(null);
  private readonly idOrigenConexionSenal = signal<string | null>(null);
  private readonly etiquetaOrigenConexionSenal = signal<string | null>(null);
  private readonly punteroConexionSenal = signal<PuntoPrevisualizacionConexion | null>(null);
  private readonly idDestinoConexionEnfocadoSenal = signal<string | null>(null);
  private readonly ladoDestinoConexionEnfocadoSenal = signal<LadoConexionFlujo | null>(null);
  private readonly paletaBloquesAbiertaSenal = signal(false);
  private readonly estadoEditorNodoSenal = signal<EstadoEditorNodo | null>(null);
  private readonly soloLecturaSenal = signal(false);

  /** Expone los límites compartidos del área editable. */
  public readonly tamanoLienzo = TAMANO_LIENZO_FLUJO;

  /** Expone las dimensiones usadas para posicionar cada bloque. */
  public readonly tamanoBloque = TAMANO_BLOQUE_FLUJO;

  /** Construye las opciones visibles de tipos de bloque disponibles. */
  public readonly opcionesTipoBloque = computed(() =>
    TIPOS_BLOQUE_FLUJO_DISPONIBLES.map((tipo) => ({
      tipo,
      etiqueta: ETIQUETAS_TIPO_BLOQUE_FLUJO[tipo],
      descripcion: DESCRIPCIONES_TIPO_BLOQUE_FLUJO[tipo],
    })),
  );

  /** Expone el flujo completo que mantiene el editor. */
  public readonly flujo = computed(() => this.flujoSenal());

  /** Expone los roles disponibles para asignar a los nodos. */
  public readonly roles = computed(() => this.flujoSenal().roles);

  /** Expone el desplazamiento y la escala actuales del lienzo. */
  public readonly vista = computed(() => this.vistaSenal());

  /** Identifica el bloque seleccionado, si existe. */
  public readonly idBloqueSeleccionado = computed(() => this.idBloqueSeleccionadoSenal());

  /** Identifica la conexión seleccionada, si existe. */
  public readonly idConexionSeleccionada = computed(() => this.idConexionSeleccionadaSenal());

  /** Identifica el bloque donde comienza la conexión en curso. */
  public readonly idOrigenConexionActiva = computed(() => this.idOrigenConexionSenal());

  /** Indica si la paleta de bloques permanece abierta. */
  public readonly paletaBloquesAbierta = computed(() => this.paletaBloquesAbiertaSenal());

  /** Expone la operación de creación o edición del nodo. */
  public readonly estadoEditorNodo = computed(() => this.estadoEditorNodoSenal());

  /** Indica si el diálogo de nodo está visible. */
  public readonly editorNodoAbierto = computed(() => this.estadoEditorNodoSenal() !== null);

  /** Indica si el usuario está construyendo una conexión. */
  public readonly arrastrandoConexion = computed(() => this.idOrigenConexionSenal() !== null);

  /** Resuelve el bloque correspondiente a la selección actual. */
  public readonly bloqueSeleccionado = computed(() => {
    const idSeleccionado = this.idBloqueSeleccionadoSenal();
    return this.flujoSenal().nodos.find((bloque) => bloque.id === idSeleccionado) ?? null;
  });

  /** Resuelve el bloque que alimenta el formulario de edición. */
  public readonly bloqueEnEdicion = computed(() => {
    const estadoEditor = this.estadoEditorNodoSenal();
    if (!estadoEditor?.idNodo) {
      return null;
    }

    return this.flujoSenal().nodos.find((nodo) => nodo.id === estadoEditor.idNodo) ?? null;
  });

  /** Expone los bloques representables en el lienzo actual. */
  public readonly bloquesVisibles = computed(() => this.flujoSenal().nodos);

  /** Excluye conexiones cuyos extremos no forman parte del flujo visible. */
  public readonly conexionesVisibles = computed(() => {
    const idsBloquesVisibles = new Set(this.bloquesVisibles().map((bloque) => bloque.id));
    return this.flujoSenal().conexiones.filter(
      (conexion) =>
        idsBloquesVisibles.has(conexion.idBloqueOrigen) &&
        idsBloquesVisibles.has(conexion.idBloqueDestino),
    );
  });

  /** Indica si el editor debe impedir cambios funcionales. */
  public readonly soloLectura = computed(() => this.soloLecturaSenal());

  /** Indica si el flujo contiene al menos un nodo. */
  public readonly tieneContenido = computed(() => this.flujoSenal().nodos.length > 0);

  /** Construye la ruta temporal de la conexión que está en curso. */
  public readonly previsualizacionConexionActiva = computed(() => {
    const idOrigen = this.idOrigenConexionSenal();

    if (!idOrigen) {
      return null;
    }

    const nodoOrigen = this.flujoSenal().nodos.find((nodo) => nodo.id === idOrigen);

    if (!nodoOrigen) {
      return null;
    }

    const etiquetaOrigen = this.etiquetaOrigenConexionSenal();
    const puntoOrigen = obtenerPuntoAnclajeBloque(
      nodoOrigen,
      LadoConexionFlujo.Derecha,
      etiquetaOrigen,
    );
    const idDestino = this.idDestinoConexionEnfocadoSenal();
    const nodoDestino = idDestino
      ? this.flujoSenal().nodos.find((nodo) => nodo.id === idDestino)
      : null;
    const ladoEnfocado = this.ladoDestinoConexionEnfocadoSenal();
    const puntero = this.punteroConexionSenal();
    const ladoDestino = nodoDestino
      ? (ladoEnfocado ??
        (puntero
          ? resolverLadoDestinoMasCercano(nodoDestino, puntero)
          : LadoConexionFlujo.Izquierda))
      : null;
    const puntoDestino =
      nodoDestino && ladoDestino ? obtenerPuntoAnclajeBloque(nodoDestino, ladoDestino) : puntero;

    if (!puntoDestino) {
      return null;
    }

    return {
      idOrigen,
      etiqueta: etiquetaOrigen,
      idDestino,
      ladoDestino,
      trayectoria: construirRutaConexion(
        puntoOrigen,
        puntoDestino,
        ladoDestino ?? LadoConexionFlujo.Izquierda,
      ),
    };
  });

  /** Reemplaza la fotografía del editor y normaliza sus identidades internas. */
  public hidratar(flujo: FlujoProyecto, proyectoId?: string, opciones?: OpcionesHidratacion): void {
    const flujoSiguiente = this.normalizarFlujo(flujo, proyectoId);

    this.establecerEstadoFlujo(flujoSiguiente, opciones);
  }

  /** Aplica el modo consultivo y cierra interacciones incompatibles. */
  public establecerSoloLectura(soloLectura: boolean): void {
    this.soloLecturaSenal.set(soloLectura);

    if (soloLectura) {
      this.paletaBloquesAbiertaSenal.set(false);
      this.estadoEditorNodoSenal.set(null);
      this.cancelarConexion();
      this.limpiarSeleccion();
    }
  }

  /** Abre un borrador nuevo del tipo seleccionado. */
  public iniciarCreacionNodo(tipo: TipoBloqueFlujo): void {
    if (this.soloLecturaSenal()) {
      return;
    }

    this.paletaBloquesAbiertaSenal.set(false);
    this.estadoEditorNodoSenal.set({
      modo: ModoEditorNodoFlujo.Crear,
      tipo,
      idNodo: null,
      posicionSugerida: this.obtenerSiguientePosicionSugerida(),
    });
  }

  /** Abre el bloque identificado para edición o consulta. */
  public abrirEditorNodo(idBloque: string): void {
    const bloque = this.flujoSenal().nodos.find((nodo) => nodo.id === idBloque);

    if (!bloque) {
      return;
    }

    this.seleccionarBloque(idBloque);
    this.paletaBloquesAbiertaSenal.set(false);
    this.estadoEditorNodoSenal.set({
      modo: ModoEditorNodoFlujo.Editar,
      tipo: bloque.tipo,
      idNodo: bloque.id,
      posicionSugerida: bloque.posicion,
    });
  }

  /** Descarta el borrador de nodo abierto. */
  public cancelarBorradorNodo(): void {
    this.estadoEditorNodoSenal.set(null);
  }

  /** Incorpora los datos normalizados del borrador a la fotografía local. */
  public confirmarBorradorNodo(borrador: BorradorNodoFlujo): void {
    if (this.soloLecturaSenal()) {
      return;
    }

    const estadoEditor = this.estadoEditorNodoSenal();

    if (!estadoEditor) {
      return;
    }

    const politicaRoles = POLITICA_ROLES_POR_TIPO_BLOQUE[borrador.tipo];
    const { idsRoles, roles } =
      politicaRoles === PoliticaRolesBloqueFlujo.NoAplica
        ? { idsRoles: [], roles: this.flujoSenal().roles }
        : this.resolverRoles(borrador.nombresRoles);

    if (estadoEditor.modo === ModoEditorNodoFlujo.Crear) {
      const ahora = new Date().toISOString();
      const nodo: NodoFlujoProyecto = {
        id: this.crearId(PrefijoIdentificadorFlujo.Bloque),
        tipo: borrador.tipo,
        titulo: borrador.titulo.trim(),
        descripcion: borrador.descripcion.trim(),
        criteriosAceptacion: this.normalizarCriteriosAceptacion(borrador.criteriosAceptacion),
        posicion: estadoEditor.posicionSugerida,
        idsRoles,
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
        datos: borrador.datos as NodoFlujoProyecto['datos'],
      } as NodoFlujoProyecto;

      this.actualizarFlujo((flujo) => ({
        ...flujo,
        roles,
        nodos: [...flujo.nodos, nodo],
      }));

      this.seleccionarBloque(nodo.id);
      this.estadoEditorNodoSenal.set(null);
      return;
    }

    this.actualizarFlujo((flujo) => ({
      ...flujo,
      roles,
      nodos: flujo.nodos.map((nodo) =>
        nodo.id === estadoEditor.idNodo
          ? ({
              ...nodo,
              titulo: borrador.titulo.trim(),
              descripcion: borrador.descripcion.trim(),
              criteriosAceptacion: this.normalizarCriteriosAceptacion(borrador.criteriosAceptacion),
              idsRoles,
              datos: borrador.datos,
              fechaActualizacion: new Date().toISOString(),
            } as NodoFlujoProyecto)
          : nodo,
      ) as NodoFlujoProyecto[],
    }));

    this.seleccionarBloque(estadoEditor.idNodo);
    this.estadoEditorNodoSenal.set(null);
  }

  /** Mueve un bloque sin permitir que abandone los límites del lienzo. */
  public moverBloque(idBloque: string, posicion: { x: number; y: number }): void {
    this.actualizarFlujo((flujo) => ({
      ...flujo,
      nodos: flujo.nodos.map((bloque) =>
        bloque.id === idBloque
          ? {
              ...bloque,
              posicion: {
                x: this.limitar(posicion.x, 0, this.tamanoLienzo.ancho - this.tamanoBloque.ancho),
                y: this.limitar(posicion.y, 0, this.tamanoLienzo.alto - this.tamanoBloque.alto),
              },
              fechaActualizacion: new Date().toISOString(),
            }
          : bloque,
      ),
    }));
  }

  /** Elimina un bloque junto con sus conexiones dependientes. */
  public eliminarBloque(idBloque: string): void {
    this.actualizarFlujo((flujo) => ({
      ...flujo,
      nodos: flujo.nodos.filter((bloque) => bloque.id !== idBloque),
      conexiones: flujo.conexiones.filter(
        (conexion) => conexion.idBloqueOrigen !== idBloque && conexion.idBloqueDestino !== idBloque,
      ),
    }));

    if (this.idBloqueSeleccionadoSenal() === idBloque) {
      this.idBloqueSeleccionadoSenal.set(null);
    }

    if (this.idOrigenConexionSenal() === idBloque) {
      this.cancelarConexion();
    }
  }

  /** Crea una conexión válida y evita duplicados o ramas repetidas. */
  public conectarBloques(
    idBloqueOrigen: string,
    idBloqueDestino: string,
    etiqueta?: string,
    ladoDestino?: LadoConexionFlujo,
  ): void {
    if (idBloqueOrigen === idBloqueDestino) {
      return;
    }

    const etiquetaNormalizada = etiqueta?.trim() || '';
    const yaExiste = this.flujoSenal().conexiones.some(
      (conexion) =>
        conexion.idBloqueOrigen === idBloqueOrigen && conexion.idBloqueDestino === idBloqueDestino,
    );

    if (yaExiste) {
      this.cancelarConexion();
      return;
    }

    const nodoOrigen = this.flujoSenal().nodos.find((nodo) => nodo.id === idBloqueOrigen);
    const ramaDecisionDuplicada =
      nodoOrigen?.tipo === TipoBloqueFlujo.Decision &&
      esEtiquetaRamaDecision(etiquetaNormalizada) &&
      this.flujoSenal().conexiones.some(
        (conexion) =>
          conexion.idBloqueOrigen === idBloqueOrigen && conexion.etiqueta === etiquetaNormalizada,
      );

    if (ramaDecisionDuplicada) {
      this.cancelarConexion();
      return;
    }

    const conexion: ConexionFlujoProyecto = {
      id: this.crearId(PrefijoIdentificadorFlujo.Conexion),
      idBloqueOrigen,
      idBloqueDestino,
      etiqueta: etiquetaNormalizada,
      ladoDestino,
      fechaCreacion: new Date().toISOString(),
    };

    this.actualizarFlujo((flujo) => ({
      ...flujo,
      conexiones: [...flujo.conexiones, conexion],
    }));

    this.idOrigenConexionSenal.set(null);
    this.punteroConexionSenal.set(null);
    this.idDestinoConexionEnfocadoSenal.set(null);
    this.ladoDestinoConexionEnfocadoSenal.set(null);
    this.seleccionarConexion(conexion.id);
  }

  /** Retira una conexión de la fotografía local. */
  public eliminarConexion(idConexion: string): void {
    this.actualizarFlujo((flujo) => ({
      ...flujo,
      conexiones: flujo.conexiones.filter((conexion) => conexion.id !== idConexion),
    }));

    if (this.idConexionSeleccionadaSenal() === idConexion) {
      this.idConexionSeleccionadaSenal.set(null);
    }
  }

  /** Devuelve zoom y desplazamiento a sus valores iniciales. */
  public restablecerVista(): void {
    this.vistaSenal.set(VISTA_PREDETERMINADA);
  }

  /** Ajusta el zoom dentro del intervalo permitido. */
  public ajustarEscala(delta: number): void {
    this.vistaSenal.update((vista) => ({
      ...vista,
      escala: this.limitar(Number((vista.escala + delta).toFixed(2)), 0.2, 1.8),
    }));
  }

  /** Traslada el lienzo por la distancia indicada. */
  public desplazarVista(deltaX: number, deltaY: number): void {
    this.vistaSenal.update((vista) => ({
      ...vista,
      desplazamientoX: vista.desplazamientoX + deltaX,
      desplazamientoY: vista.desplazamientoY + deltaY,
    }));
  }

  /** Inicia la previsualización de una conexión desde un bloque. */
  public iniciarArrastreConexion(idBloque: string, etiqueta?: EtiquetaRamaDecision): void {
    if (this.soloLecturaSenal()) {
      return;
    }

    this.idOrigenConexionSenal.set(idBloque);
    this.etiquetaOrigenConexionSenal.set(etiqueta ?? null);
    this.punteroConexionSenal.set(this.obtenerPuntoConectorSalida(idBloque, etiqueta));
    this.idDestinoConexionEnfocadoSenal.set(null);
    this.ladoDestinoConexionEnfocadoSenal.set(null);
    this.seleccionarBloque(idBloque);
  }

  /** Actualiza el extremo libre de la conexión en curso. */
  public actualizarPunteroConexion(punto: PuntoPrevisualizacionConexion): void {
    if (!this.idOrigenConexionSenal()) {
      return;
    }

    this.punteroConexionSenal.set(punto);
  }

  /** Selecciona el destino potencial y calcula su lado de entrada. */
  public establecerDestinoConexionEnfocado(idBloque: string | null): void {
    const idOrigen = this.idOrigenConexionSenal();
    const puntero = this.punteroConexionSenal();

    if (!idOrigen || !idBloque || idBloque === idOrigen) {
      this.idDestinoConexionEnfocadoSenal.set(null);
      this.ladoDestinoConexionEnfocadoSenal.set(null);
      return;
    }

    const nodoDestino = this.flujoSenal().nodos.find((nodo) => nodo.id === idBloque);

    this.idDestinoConexionEnfocadoSenal.set(idBloque);
    this.ladoDestinoConexionEnfocadoSenal.set(
      nodoDestino && puntero
        ? resolverLadoDestinoMasCercano(nodoDestino, puntero)
        : LadoConexionFlujo.Izquierda,
    );
  }

  /** Confirma la conexión previsualizada cuando existe un destino válido. */
  public completarArrastreConexion(): void {
    const idOrigen = this.idOrigenConexionSenal();
    const idDestino = this.idDestinoConexionEnfocadoSenal();

    if (!idOrigen || !idDestino) {
      this.cancelarConexion();
      return;
    }

    this.conectarBloques(
      idOrigen,
      idDestino,
      this.etiquetaOrigenConexionSenal() ?? undefined,
      this.ladoDestinoConexionEnfocadoSenal() ?? undefined,
    );
  }

  /** Limpia todo el estado transitorio de conexión. */
  public cancelarConexion(): void {
    this.idOrigenConexionSenal.set(null);
    this.etiquetaOrigenConexionSenal.set(null);
    this.punteroConexionSenal.set(null);
    this.idDestinoConexionEnfocadoSenal.set(null);
    this.ladoDestinoConexionEnfocadoSenal.set(null);
  }

  /** Presenta la paleta cuando el editor admite cambios. */
  public abrirPaletaBloques(): void {
    if (this.soloLecturaSenal()) {
      return;
    }

    this.paletaBloquesAbiertaSenal.set(true);
  }

  /** Oculta la paleta de bloques. */
  public cerrarPaletaBloques(): void {
    this.paletaBloquesAbiertaSenal.set(false);
  }

  /** Selecciona un bloque y limpia la selección de conexión. */
  public seleccionarBloque(idBloque: string | null): void {
    this.idBloqueSeleccionadoSenal.set(idBloque);
    this.idConexionSeleccionadaSenal.set(null);
  }

  /** Selecciona una conexión y limpia la selección de bloque. */
  public seleccionarConexion(idConexion: string | null): void {
    this.idConexionSeleccionadaSenal.set(idConexion);
    this.idBloqueSeleccionadoSenal.set(null);
  }

  /** Retira cualquier selección vigente del lienzo. */
  public limpiarSeleccion(): void {
    this.idBloqueSeleccionadoSenal.set(null);
    this.idConexionSeleccionadaSenal.set(null);
  }

  /** Resuelve el nombre visible de un rol del flujo. */
  public obtenerNombreRol(idRol: string): string {
    return this.flujoSenal().roles.find((rol) => rol.id === idRol)?.nombre ?? 'Rol sin nombre';
  }

  /** Indica si un bloque puede actuar como destino durante el arrastre. */
  public esDestinoConexion(idBloque: string): boolean {
    const idOrigen = this.idOrigenConexionSenal();
    return Boolean(idOrigen && idOrigen !== idBloque);
  }

  /** Indica si un bloque es el destino actualmente enfocado. */
  public esDestinoConexionEnfocado(idBloque: string): boolean {
    return this.idDestinoConexionEnfocadoSenal() === idBloque;
  }

  /** Traduce una colección de identidades de rol a nombres visibles. */
  public obtenerNombresRoles(idsRoles: string[]): string[] {
    return idsRoles.map((idRol) => this.obtenerNombreRol(idRol));
  }

  /** Construye una copia editable a partir de un nodo confirmado. */
  public obtenerBorradorDesdeNodo(nodo: NodoFlujoProyecto): BorradorNodoFlujo {
    return {
      tipo: nodo.tipo,
      titulo: nodo.titulo,
      descripcion: nodo.descripcion,
      criteriosAceptacion: [...nodo.criteriosAceptacion],
      nombresRoles: this.obtenerNombresRoles(nodo.idsRoles),
      datos: structuredClone(nodo.datos),
    } as BorradorNodoFlujo;
  }

  /** Construye el borrador inicial correspondiente a un tipo de bloque. */
  public obtenerBorradorPredeterminado(tipo: TipoBloqueFlujo): BorradorNodoFlujo {
    return {
      tipo,
      titulo: ETIQUETAS_TIPO_BLOQUE_FLUJO[tipo],
      descripcion: '',
      criteriosAceptacion: [],
      nombresRoles: [],
      datos: crearDatosNodoPredeterminados(tipo),
    } as BorradorNodoFlujo;
  }

  private actualizarFlujo(proyectar: (flujo: FlujoProyecto) => FlujoProyecto): void {
    if (this.soloLecturaSenal()) {
      return;
    }

    const flujoSiguiente = proyectar(this.flujoSenal());
    const flujoFechado: FlujoProyecto = {
      ...flujoSiguiente,
      fechaActualizacion: new Date().toISOString(),
    };

    this.flujoSenal.set(flujoFechado);
  }

  private establecerEstadoFlujo(flujo: FlujoProyecto, opciones?: OpcionesHidratacion): void {
    const conservarVista = opciones?.conservarVista ?? false;
    const conservarSeleccion = opciones?.conservarSeleccion ?? false;
    const idBloqueSeleccionado = conservarSeleccion ? this.idBloqueSeleccionadoSenal() : null;
    const idConexionSeleccionada = conservarSeleccion ? this.idConexionSeleccionadaSenal() : null;

    this.flujoSenal.set(flujo);
    if (!conservarVista) {
      this.vistaSenal.set(VISTA_PREDETERMINADA);
    }
    this.idBloqueSeleccionadoSenal.set(
      idBloqueSeleccionado && flujo.nodos.some((nodo) => nodo.id === idBloqueSeleccionado)
        ? idBloqueSeleccionado
        : null,
    );
    this.idConexionSeleccionadaSenal.set(
      idConexionSeleccionada &&
        flujo.conexiones.some((conexion) => conexion.id === idConexionSeleccionada)
        ? idConexionSeleccionada
        : null,
    );
    this.idOrigenConexionSenal.set(null);
    this.etiquetaOrigenConexionSenal.set(null);
    this.punteroConexionSenal.set(null);
    this.idDestinoConexionEnfocadoSenal.set(null);
    this.ladoDestinoConexionEnfocadoSenal.set(null);
    this.paletaBloquesAbiertaSenal.set(false);
    this.estadoEditorNodoSenal.set(null);
  }

  private crearFlujoVacio(proyectoId: string): FlujoProyecto {
    return {
      proyectoId,
      roles: [],
      nodos: [],
      conexiones: [],
      fechaActualizacion: new Date().toISOString(),
    };
  }

  private normalizarFlujo(flujo: FlujoProyecto, proyectoId?: string): FlujoProyecto {
    return {
      ...structuredClone(flujo),
      proyectoId: proyectoId ?? flujo.proyectoId,
      roles: flujo.roles.map((rol) => ({ ...rol })),
      nodos: flujo.nodos.map((nodo) => ({
        ...structuredClone(nodo),
        idsRoles:
          POLITICA_ROLES_POR_TIPO_BLOQUE[nodo.tipo] === PoliticaRolesBloqueFlujo.NoAplica
            ? []
            : [...nodo.idsRoles],
        criteriosAceptacion: this.normalizarCriteriosAceptacion(nodo.criteriosAceptacion),
      })) as NodoFlujoProyecto[],
      conexiones: flujo.conexiones.map((conexion) => ({ ...conexion })),
    };
  }

  private obtenerPuntoConectorSalida(
    idBloque: string,
    etiqueta?: string | null,
  ): PuntoPrevisualizacionConexion | null {
    const bloque = this.flujoSenal().nodos.find((nodo) => nodo.id === idBloque);

    if (!bloque) {
      return null;
    }

    return obtenerPuntoAnclajeBloque(bloque, LadoConexionFlujo.Derecha, etiqueta);
  }

  private obtenerSiguientePosicionSugerida(): { x: number; y: number } {
    const nodos = this.flujoSenal().nodos;
    const bloqueAncla = this.bloqueSeleccionado() ?? nodos[nodos.length - 1];

    if (bloqueAncla) {
      const separacionHorizontal = 296;
      const separacionVertical = 176;
      let xSiguiente = bloqueAncla.posicion.x + separacionHorizontal;
      let ySiguiente = bloqueAncla.posicion.y;

      if (xSiguiente > this.tamanoLienzo.ancho - this.tamanoBloque.ancho - 40) {
        xSiguiente = Math.max(40, bloqueAncla.posicion.x - separacionHorizontal);
        ySiguiente = Math.min(
          this.tamanoLienzo.alto - this.tamanoBloque.alto - 40,
          bloqueAncla.posicion.y + separacionVertical,
        );
      }

      return { x: xSiguiente, y: ySiguiente };
    }

    const vista = this.vistaSenal();
    const anchoVisible = 960;
    const altoVisible = 640;
    const anclaX = 120;
    const anclaY = 96;
    const x = Math.max(
      0,
      (anclaX - vista.desplazamientoX + anchoVisible * 0.5) / vista.escala -
        this.tamanoBloque.ancho / 2,
    );
    const y = Math.max(
      0,
      (anclaY - vista.desplazamientoY + altoVisible * 0.4) / vista.escala -
        this.tamanoBloque.alto / 2,
    );

    return { x, y };
  }

  private resolverRoles(nombresRoles: string[]): { idsRoles: string[]; roles: RolFlujoProyecto[] } {
    const nombresRolesUnicos = [
      ...new Set(nombresRoles.map((nombre) => nombre.trim()).filter(Boolean)),
    ];
    const flujo = this.flujoSenal();
    const rolesConocidos = [...flujo.roles];
    const idsRolesResueltos: string[] = [];

    for (const nombreRol of nombresRolesUnicos) {
      const rolExistente = rolesConocidos.find(
        (rol) => rol.nombre.toLowerCase() === nombreRol.toLowerCase(),
      );

      if (rolExistente) {
        idsRolesResueltos.push(rolExistente.id);
        continue;
      }

      const rolNuevo: RolFlujoProyecto = {
        id: this.crearId(PrefijoIdentificadorFlujo.Rol),
        nombre: nombreRol,
        fechaCreacion: new Date().toISOString(),
      };

      rolesConocidos.push(rolNuevo);
      idsRolesResueltos.push(rolNuevo.id);
    }

    return {
      idsRoles: idsRolesResueltos,
      roles: rolesConocidos,
    };
  }

  private crearId(prefijo: PrefijoIdentificadorFlujo): string {
    return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private normalizarCriteriosAceptacion(valor: string[] | string | null | undefined): string[] {
    if (Array.isArray(valor)) {
      return valor.map((criterio) => String(criterio ?? '').trim()).filter(Boolean);
    }

    return String(valor ?? '')
      .split('\n')
      .map((criterio) => criterio.trim())
      .filter(Boolean);
  }

  private limitar(valor: number, minimo: number, maximo: number): number {
    return Math.min(maximo, Math.max(minimo, valor));
  }
}
