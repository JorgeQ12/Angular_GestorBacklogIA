import { Injectable, computed, signal } from '@angular/core';
import {
  DESCRIPCIONES_TIPO_BLOQUE_FLUJO,
  ETIQUETAS_TIPO_BLOQUE_FLUJO,
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
  EstadoFiltroFlujo,
  EtiquetaRamaDecision,
  FiltroVistaFlujoProyecto,
  FlujoProyecto,
  LadoConexionFlujo,
  NodoFlujoProyecto,
  RolFlujoProyecto,
  TipoBloqueFlujo,
  VistaLienzoFlujo,
  crearDatosNodoPredeterminados,
  esEtiquetaRamaDecision,
} from '../models/flujo-proyecto.model';

type EstadoGuardado = 'sin-cambios' | 'guardado';
type ModoEditorNodo = 'crear' | 'editar';

interface EstadoEditorNodo {
  modo: ModoEditorNodo;
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

const VISTA_PREDETERMINADA: VistaLienzoFlujo = {
  desplazamientoX: 0,
  desplazamientoY: 0,
  escala: 1
};

const FILTRO_PREDETERMINADO: EstadoFiltroFlujo = {
  modo: FiltroVistaFlujoProyecto.Todos,
  idRol: null
};

/** Administra el estado local y las operaciones del editor visual del flujo. */
@Injectable()
export class EstadoEditorFlujoProyectoService {
  private readonly flujoSenal = signal<FlujoProyecto>(this.crearFlujoVacio(''));
  private readonly filtroSenal = signal<EstadoFiltroFlujo>(FILTRO_PREDETERMINADO);
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
  private readonly estadoGuardadoSenal = signal<EstadoGuardado>('sin-cambios');
  private readonly fechaUltimoGuardadoSenal = signal<string | null>(null);
  private readonly soloLecturaSenal = signal(false);

  public readonly tamanoLienzo = TAMANO_LIENZO_FLUJO;
  public readonly tamanoBloque = TAMANO_BLOQUE_FLUJO;
  public readonly opcionesTipoBloque = computed(() =>
    TIPOS_BLOQUE_FLUJO_DISPONIBLES.map((tipo) => ({
      tipo,
      etiqueta: ETIQUETAS_TIPO_BLOQUE_FLUJO[tipo],
      descripcion: DESCRIPCIONES_TIPO_BLOQUE_FLUJO[tipo]
    }))
  );
  public readonly flujo = computed(() => this.flujoSenal());
  public readonly roles = computed(() => this.flujoSenal().roles);
  public readonly bloques = computed(() => this.flujoSenal().nodos);
  public readonly conexiones = computed(() => this.flujoSenal().conexiones);
  public readonly filtro = computed(() => this.filtroSenal());
  public readonly vista = computed(() => this.vistaSenal());
  public readonly idBloqueSeleccionado = computed(() => this.idBloqueSeleccionadoSenal());
  public readonly idConexionSeleccionada = computed(() => this.idConexionSeleccionadaSenal());
  public readonly idOrigenConexionActiva = computed(() => this.idOrigenConexionSenal());
  public readonly etiquetaOrigenConexionActiva = computed(() => this.etiquetaOrigenConexionSenal());
  public readonly punteroConexionActiva = computed(() => this.punteroConexionSenal());
  public readonly idDestinoConexionActiva = computed(() => this.idDestinoConexionEnfocadoSenal());
  public readonly ladoDestinoConexionActiva = computed(() => this.ladoDestinoConexionEnfocadoSenal());
  public readonly paletaBloquesAbierta = computed(() => this.paletaBloquesAbiertaSenal());
  public readonly estadoEditorNodo = computed(() => this.estadoEditorNodoSenal());
  public readonly editorNodoAbierto = computed(() => this.estadoEditorNodoSenal() !== null);
  public readonly arrastrandoConexion = computed(() => this.idOrigenConexionSenal() !== null);
  public readonly bloqueSeleccionado = computed(() => {
    const idSeleccionado = this.idBloqueSeleccionadoSenal();
    return this.flujoSenal().nodos.find((bloque) => bloque.id === idSeleccionado) ?? null;
  });
  public readonly conexionSeleccionada = computed(() => {
    const idSeleccionado = this.idConexionSeleccionadaSenal();
    return this.flujoSenal().conexiones.find((conexion) => conexion.id === idSeleccionado) ?? null;
  });
  public readonly bloqueEnEdicion = computed(() => {
    const estadoEditor = this.estadoEditorNodoSenal();
    if (!estadoEditor?.idNodo) {
      return null;
    }

    return this.flujoSenal().nodos.find((nodo) => nodo.id === estadoEditor.idNodo) ?? null;
  });
  public readonly bloquesCompartidos = computed(() =>
    this.flujoSenal().nodos.filter((bloque) => bloque.idsRoles.length > 1)
  );
  public readonly bloquesVisibles = computed(() => {
    const flujo = this.flujoSenal();
    const filtro = this.filtroSenal();

    switch (filtro.modo) {
      case FiltroVistaFlujoProyecto.Rol:
        return flujo.nodos.filter((bloque) => bloque.idsRoles.includes(filtro.idRol ?? ''));
      case FiltroVistaFlujoProyecto.Compartidos:
        return flujo.nodos.filter((bloque) => bloque.idsRoles.length > 1);
      default:
        return flujo.nodos;
    }
  });
  public readonly conexionesVisibles = computed(() => {
    const idsBloquesVisibles = new Set(this.bloquesVisibles().map((bloque) => bloque.id));
    return this.flujoSenal().conexiones.filter(
      (conexion) =>
        idsBloquesVisibles.has(conexion.idBloqueOrigen) && idsBloquesVisibles.has(conexion.idBloqueDestino)
    );
  });
  public readonly fechaUltimoGuardado = computed(() => this.fechaUltimoGuardadoSenal());
  public readonly estadoGuardado = computed(() => this.estadoGuardadoSenal());
  public readonly soloLectura = computed(() => this.soloLecturaSenal());
  public readonly tieneContenido = computed(() => this.flujoSenal().nodos.length > 0);
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
    const puntoOrigen = obtenerPuntoAnclajeBloque(nodoOrigen, 'derecha', etiquetaOrigen);
    const idDestino = this.idDestinoConexionEnfocadoSenal();
    const nodoDestino = idDestino
      ? this.flujoSenal().nodos.find((nodo) => nodo.id === idDestino)
      : null;
    const ladoEnfocado = this.ladoDestinoConexionEnfocadoSenal();
    const puntero = this.punteroConexionSenal();
    const ladoDestino = nodoDestino
      ? ladoEnfocado ?? (puntero ? resolverLadoDestinoMasCercano(nodoDestino, puntero) : 'izquierda')
      : null;
    const puntoDestino = nodoDestino && ladoDestino
      ? obtenerPuntoAnclajeBloque(nodoDestino, ladoDestino)
      : puntero;

    if (!puntoDestino) {
      return null;
    }

    return {
      idOrigen,
      etiqueta: etiquetaOrigen,
      idDestino,
      ladoDestino,
      trayectoria: construirRutaConexion(puntoOrigen, puntoDestino, ladoDestino ?? 'izquierda')
    };
  });

  public hidratar(flujo: FlujoProyecto, proyectoId?: string, opciones?: OpcionesHidratacion): void {
    const flujoSiguiente = this.normalizarFlujo(flujo, proyectoId);

    this.establecerEstadoFlujo(
      flujoSiguiente,
      flujoSiguiente.nodos.length ? 'guardado' : 'sin-cambios',
      opciones
    );
  }

  public establecerSoloLectura(soloLectura: boolean): void {
    this.soloLecturaSenal.set(soloLectura);

    if (soloLectura) {
      this.paletaBloquesAbiertaSenal.set(false);
      this.estadoEditorNodoSenal.set(null);
      this.cancelarConexion();
      this.limpiarSeleccion();
    }
  }

  public crearRol(nombre: string): void {
    const nombreNormalizado = nombre.trim();

    if (!nombreNormalizado) {
      return;
    }

    const rol: RolFlujoProyecto = {
      id: this.crearId('rol'),
      nombre: nombreNormalizado,
      fechaCreacion: new Date().toISOString()
    };

    this.actualizarFlujo((flujo) => ({
      ...flujo,
      roles: [...flujo.roles, rol]
    }));
  }

  public actualizarRol(idRol: string, cambios: Partial<Pick<RolFlujoProyecto, 'nombre'>>): void {
    const nombreSiguiente = cambios.nombre?.trim();

    this.actualizarFlujo((flujo) => ({
      ...flujo,
      roles: flujo.roles.map((rol) =>
        rol.id === idRol
          ? { ...rol, nombre: nombreSiguiente && nombreSiguiente.length ? nombreSiguiente : rol.nombre }
          : rol
      )
    }));
  }

  public eliminarRol(idRol: string): void {
    this.actualizarFlujo((flujo) => ({
      ...flujo,
      roles: flujo.roles.filter((rol) => rol.id !== idRol),
      nodos: flujo.nodos.map((bloque) => ({
        ...bloque,
        idsRoles: bloque.idsRoles.filter((idRolActual) => idRolActual !== idRol),
        fechaActualizacion: new Date().toISOString()
      }))
    }));

    if (this.filtroSenal().idRol === idRol) {
      this.filtroSenal.set(FILTRO_PREDETERMINADO);
    }
  }

  public iniciarCreacionNodo(tipo: TipoBloqueFlujo): void {
    if (this.soloLecturaSenal()) {
      return;
    }

    this.paletaBloquesAbiertaSenal.set(false);
    this.estadoEditorNodoSenal.set({
      modo: 'crear',
      tipo,
      idNodo: null,
      posicionSugerida: this.obtenerSiguientePosicionSugerida()
    });
  }

  public abrirEditorNodo(idBloque: string): void {
    const bloque = this.flujoSenal().nodos.find((nodo) => nodo.id === idBloque);

    if (!bloque) {
      return;
    }

    this.seleccionarBloque(idBloque);
    this.paletaBloquesAbiertaSenal.set(false);
    this.estadoEditorNodoSenal.set({
      modo: 'editar',
      tipo: bloque.tipo,
      idNodo: bloque.id,
      posicionSugerida: bloque.posicion
    });
  }

  public cancelarBorradorNodo(): void {
    this.estadoEditorNodoSenal.set(null);
  }

  public confirmarBorradorNodo(borrador: BorradorNodoFlujo): void {
    if (this.soloLecturaSenal()) {
      return;
    }

    const { idsRoles, roles } = this.resolverRoles(borrador.nombresRoles);
    const estadoEditor = this.estadoEditorNodoSenal();

    if (!estadoEditor) {
      return;
    }

    if (estadoEditor.modo === 'crear') {
      const ahora = new Date().toISOString();
      const nodo: NodoFlujoProyecto = {
        id: this.crearId('bloque'),
        tipo: borrador.tipo,
        titulo: borrador.titulo.trim(),
        descripcion: borrador.descripcion.trim(),
        criteriosAceptacion: this.normalizarCriteriosAceptacion(borrador.criteriosAceptacion),
        posicion: estadoEditor.posicionSugerida,
        idsRoles,
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
        datos: borrador.datos as NodoFlujoProyecto['datos']
      } as NodoFlujoProyecto;

      this.actualizarFlujo((flujo) => ({
        ...flujo,
        roles,
        nodos: [...flujo.nodos, nodo]
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
              fechaActualizacion: new Date().toISOString()
            } as NodoFlujoProyecto)
          : nodo
      ) as NodoFlujoProyecto[]
    }));

    this.seleccionarBloque(estadoEditor.idNodo);
    this.estadoEditorNodoSenal.set(null);
  }

  public moverBloque(idBloque: string, posicion: { x: number; y: number }): void {
    this.actualizarFlujo((flujo) => ({
      ...flujo,
      nodos: flujo.nodos.map((bloque) =>
        bloque.id === idBloque
          ? {
              ...bloque,
              posicion: {
                x: this.limitar(posicion.x, 0, this.tamanoLienzo.ancho - this.tamanoBloque.ancho),
                y: this.limitar(posicion.y, 0, this.tamanoLienzo.alto - this.tamanoBloque.alto)
              },
              fechaActualizacion: new Date().toISOString()
            }
          : bloque
      )
    }));
  }

  public eliminarBloque(idBloque: string): void {
    this.actualizarFlujo((flujo) => ({
      ...flujo,
      nodos: flujo.nodos.filter((bloque) => bloque.id !== idBloque),
      conexiones: flujo.conexiones.filter(
        (conexion) => conexion.idBloqueOrigen !== idBloque && conexion.idBloqueDestino !== idBloque
      )
    }));

    if (this.idBloqueSeleccionadoSenal() === idBloque) {
      this.idBloqueSeleccionadoSenal.set(null);
    }

    if (this.idOrigenConexionSenal() === idBloque) {
      this.cancelarConexion();
    }
  }

  public conectarBloques(idBloqueOrigen: string, idBloqueDestino: string, etiqueta?: string, ladoDestino?: LadoConexionFlujo): void {
    if (idBloqueOrigen === idBloqueDestino) {
      return;
    }

    const etiquetaNormalizada = etiqueta?.trim() || '';
    const yaExiste = this.flujoSenal().conexiones.some(
      (conexion) =>
        conexion.idBloqueOrigen === idBloqueOrigen && conexion.idBloqueDestino === idBloqueDestino
    );

    if (yaExiste) {
      this.cancelarConexion();
      return;
    }

    const nodoOrigen = this.flujoSenal().nodos.find((nodo) => nodo.id === idBloqueOrigen);
    const ramaDecisionDuplicada = nodoOrigen?.tipo === TipoBloqueFlujo.Decision
      && esEtiquetaRamaDecision(etiquetaNormalizada)
      && this.flujoSenal().conexiones.some(
        (conexion) => conexion.idBloqueOrigen === idBloqueOrigen && conexion.etiqueta === etiquetaNormalizada
      );

    if (ramaDecisionDuplicada) {
      this.cancelarConexion();
      return;
    }

    const conexion: ConexionFlujoProyecto = {
      id: this.crearId('conexion'),
      idBloqueOrigen,
      idBloqueDestino,
      etiqueta: etiquetaNormalizada,
      ladoDestino,
      fechaCreacion: new Date().toISOString()
    };

    this.actualizarFlujo((flujo) => ({
      ...flujo,
      conexiones: [...flujo.conexiones, conexion]
    }));

    this.idOrigenConexionSenal.set(null);
    this.punteroConexionSenal.set(null);
    this.idDestinoConexionEnfocadoSenal.set(null);
    this.ladoDestinoConexionEnfocadoSenal.set(null);
    this.seleccionarConexion(conexion.id);
  }

  public actualizarConexion(idConexion: string, cambios: Partial<Pick<ConexionFlujoProyecto, 'etiqueta'>>): void {
    this.actualizarFlujo((flujo) => ({
      ...flujo,
      conexiones: flujo.conexiones.map((conexion) =>
        conexion.id === idConexion
          ? { ...conexion, etiqueta: cambios.etiqueta?.trim() ?? '' }
          : conexion
      )
    }));
  }

  public eliminarConexion(idConexion: string): void {
    this.actualizarFlujo((flujo) => ({
      ...flujo,
      conexiones: flujo.conexiones.filter((conexion) => conexion.id !== idConexion)
    }));

    if (this.idConexionSeleccionadaSenal() === idConexion) {
      this.idConexionSeleccionadaSenal.set(null);
    }
  }

  public establecerFiltro(filtro: EstadoFiltroFlujo): void {
    this.filtroSenal.set(filtro);
  }

  public establecerVista(vista: VistaLienzoFlujo): void {
    this.vistaSenal.set({
      desplazamientoX: vista.desplazamientoX,
      desplazamientoY: vista.desplazamientoY,
      escala: this.limitar(vista.escala, 0.2, 1.8)
    });
  }

  public restablecerVista(): void {
    this.vistaSenal.set(VISTA_PREDETERMINADA);
  }

  public ajustarEscala(delta: number): void {
    this.vistaSenal.update((vista) => ({
      ...vista,
      escala: this.limitar(Number((vista.escala + delta).toFixed(2)), 0.2, 1.8)
    }));
  }

  public desplazarVista(deltaX: number, deltaY: number): void {
    this.vistaSenal.update((vista) => ({
      ...vista,
      desplazamientoX: vista.desplazamientoX + deltaX,
      desplazamientoY: vista.desplazamientoY + deltaY
    }));
  }

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

  public actualizarPunteroConexion(punto: PuntoPrevisualizacionConexion): void {
    if (!this.idOrigenConexionSenal()) {
      return;
    }

    this.punteroConexionSenal.set(punto);
  }

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
      nodoDestino && puntero ? resolverLadoDestinoMasCercano(nodoDestino, puntero) : 'izquierda'
    );
  }

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
      this.ladoDestinoConexionEnfocadoSenal() ?? undefined
    );
  }

  public cancelarConexion(): void {
    this.idOrigenConexionSenal.set(null);
    this.etiquetaOrigenConexionSenal.set(null);
    this.punteroConexionSenal.set(null);
    this.idDestinoConexionEnfocadoSenal.set(null);
    this.ladoDestinoConexionEnfocadoSenal.set(null);
  }

  public abrirPaletaBloques(): void {
    if (this.soloLecturaSenal()) {
      return;
    }

    this.paletaBloquesAbiertaSenal.set(true);
  }

  public cerrarPaletaBloques(): void {
    this.paletaBloquesAbiertaSenal.set(false);
  }

  public seleccionarBloque(idBloque: string | null): void {
    this.idBloqueSeleccionadoSenal.set(idBloque);
    this.idConexionSeleccionadaSenal.set(null);
  }

  public seleccionarConexion(idConexion: string | null): void {
    this.idConexionSeleccionadaSenal.set(idConexion);
    this.idBloqueSeleccionadoSenal.set(null);
  }

  public limpiarSeleccion(): void {
    this.idBloqueSeleccionadoSenal.set(null);
    this.idConexionSeleccionadaSenal.set(null);
  }

  public obtenerNombreRol(idRol: string): string {
    return this.flujoSenal().roles.find((rol) => rol.id === idRol)?.nombre ?? 'Rol sin nombre';
  }

  public esDestinoConexion(idBloque: string): boolean {
    const idOrigen = this.idOrigenConexionSenal();
    return Boolean(idOrigen && idOrigen !== idBloque);
  }

  public esDestinoConexionEnfocado(idBloque: string): boolean {
    return this.idDestinoConexionEnfocadoSenal() === idBloque;
  }

  public obtenerNombresRoles(idsRoles: string[]): string[] {
    return idsRoles.map((idRol) => this.obtenerNombreRol(idRol));
  }

  public obtenerBorradorDesdeNodo(nodo: NodoFlujoProyecto): BorradorNodoFlujo {
    return {
      tipo: nodo.tipo,
      titulo: nodo.titulo,
      descripcion: nodo.descripcion,
      criteriosAceptacion: [...nodo.criteriosAceptacion],
      nombresRoles: this.obtenerNombresRoles(nodo.idsRoles),
      datos: structuredClone(nodo.datos)
    } as BorradorNodoFlujo;
  }

  public obtenerBorradorPredeterminado(tipo: TipoBloqueFlujo): BorradorNodoFlujo {
    return {
      tipo,
      titulo: ETIQUETAS_TIPO_BLOQUE_FLUJO[tipo],
      descripcion: '',
      criteriosAceptacion: [],
      nombresRoles: [],
      datos: crearDatosNodoPredeterminados(tipo)
    } as BorradorNodoFlujo;
  }

  private actualizarFlujo(proyectar: (flujo: FlujoProyecto) => FlujoProyecto): void {
    if (this.soloLecturaSenal()) {
      return;
    }

    const flujoSiguiente = proyectar(this.flujoSenal());
    const flujoFechado: FlujoProyecto = {
      ...flujoSiguiente,
      fechaActualizacion: new Date().toISOString()
    };

    this.flujoSenal.set(flujoFechado);
    this.fechaUltimoGuardadoSenal.set(flujoFechado.fechaActualizacion);
    this.estadoGuardadoSenal.set('guardado');
  }

  private establecerEstadoFlujo(flujo: FlujoProyecto, estadoGuardado: EstadoGuardado, opciones?: OpcionesHidratacion): void {
    const conservarVista = opciones?.conservarVista ?? false;
    const conservarSeleccion = opciones?.conservarSeleccion ?? false;
    const idBloqueSeleccionado = conservarSeleccion ? this.idBloqueSeleccionadoSenal() : null;
    const idConexionSeleccionada = conservarSeleccion ? this.idConexionSeleccionadaSenal() : null;

    this.flujoSenal.set(flujo);
    this.filtroSenal.set(FILTRO_PREDETERMINADO);
    if (!conservarVista) {
      this.vistaSenal.set(VISTA_PREDETERMINADA);
    }
    this.idBloqueSeleccionadoSenal.set(
      idBloqueSeleccionado && flujo.nodos.some((nodo) => nodo.id === idBloqueSeleccionado)
        ? idBloqueSeleccionado
        : null
    );
    this.idConexionSeleccionadaSenal.set(
      idConexionSeleccionada && flujo.conexiones.some((conexion) => conexion.id === idConexionSeleccionada)
        ? idConexionSeleccionada
        : null
    );
    this.idOrigenConexionSenal.set(null);
    this.etiquetaOrigenConexionSenal.set(null);
    this.punteroConexionSenal.set(null);
    this.idDestinoConexionEnfocadoSenal.set(null);
    this.ladoDestinoConexionEnfocadoSenal.set(null);
    this.paletaBloquesAbiertaSenal.set(false);
    this.estadoEditorNodoSenal.set(null);
    this.fechaUltimoGuardadoSenal.set(flujo.fechaActualizacion || null);
    this.estadoGuardadoSenal.set(estadoGuardado);
  }

  private crearFlujoVacio(proyectoId: string): FlujoProyecto {
    return {
      proyectoId,
      roles: [],
      nodos: [],
      conexiones: [],
      fechaActualizacion: new Date().toISOString()
    };
  }

  private normalizarFlujo(flujo: FlujoProyecto, proyectoId?: string): FlujoProyecto {
    return {
      ...structuredClone(flujo),
      proyectoId: proyectoId ?? flujo.proyectoId,
      roles: flujo.roles.map((rol) => ({ ...rol })),
      nodos: flujo.nodos.map((nodo) => ({
        ...structuredClone(nodo),
        idsRoles: [...nodo.idsRoles],
        criteriosAceptacion: this.normalizarCriteriosAceptacion(nodo.criteriosAceptacion),
      })) as NodoFlujoProyecto[],
      conexiones: flujo.conexiones.map((conexion) => ({ ...conexion })),
    };
  }

  private obtenerPuntoConectorSalida(idBloque: string, etiqueta?: string | null): PuntoPrevisualizacionConexion | null {
    const bloque = this.flujoSenal().nodos.find((nodo) => nodo.id === idBloque);

    if (!bloque) {
      return null;
    }

    return obtenerPuntoAnclajeBloque(bloque, 'derecha', etiqueta);
  }

  private obtenerSiguientePosicionSugerida(): { x: number; y: number } {
    const nodos = this.flujoSenal().nodos;
    const bloqueAncla =
      this.bloqueSeleccionado() ??
      nodos[nodos.length - 1];

    if (bloqueAncla) {
      const separacionHorizontal = 296;
      const separacionVertical = 176;
      let xSiguiente = bloqueAncla.posicion.x + separacionHorizontal;
      let ySiguiente = bloqueAncla.posicion.y;

      if (xSiguiente > this.tamanoLienzo.ancho - this.tamanoBloque.ancho - 40) {
        xSiguiente = Math.max(40, bloqueAncla.posicion.x - separacionHorizontal);
        ySiguiente = Math.min(
          this.tamanoLienzo.alto - this.tamanoBloque.alto - 40,
          bloqueAncla.posicion.y + separacionVertical
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
      (anclaX - vista.desplazamientoX + anchoVisible * 0.5) / vista.escala - this.tamanoBloque.ancho / 2
    );
    const y = Math.max(
      0,
      (anclaY - vista.desplazamientoY + altoVisible * 0.4) / vista.escala - this.tamanoBloque.alto / 2
    );

    return { x, y };
  }

  private resolverRoles(nombresRoles: string[]): { idsRoles: string[]; roles: RolFlujoProyecto[] } {
    const nombresRolesUnicos = [...new Set(nombresRoles.map((nombre) => nombre.trim()).filter(Boolean))];
    const flujo = this.flujoSenal();
    const rolesConocidos = [...flujo.roles];
    const idsRolesResueltos: string[] = [];

    for (const nombreRol of nombresRolesUnicos) {
      const rolExistente = rolesConocidos.find(
        (rol) => rol.nombre.toLowerCase() === nombreRol.toLowerCase()
      );

      if (rolExistente) {
        idsRolesResueltos.push(rolExistente.id);
        continue;
      }

      const rolNuevo: RolFlujoProyecto = {
        id: this.crearId('rol'),
        nombre: nombreRol,
        fechaCreacion: new Date().toISOString()
      };

      rolesConocidos.push(rolNuevo);
      idsRolesResueltos.push(rolNuevo.id);
    }

    return {
      idsRoles: idsRolesResueltos,
      roles: rolesConocidos
    };
  }

  private crearId(prefijo: string): string {
    return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private normalizarCriteriosAceptacion(valor: string[] | string | null | undefined): string[] {
    if (Array.isArray(valor)) {
      return valor
        .map((criterio) => String(criterio ?? '').trim())
        .filter(Boolean);
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


