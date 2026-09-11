import { TestBed } from '@angular/core/testing';
import {
  DESCRIPCIONES_TIPO_BLOQUE_FLUJO,
  ETIQUETAS_TIPO_BLOQUE_FLUJO,
  TIPOS_BLOQUE_FLUJO_DISPONIBLES,
} from '../config/flujo-proyecto.config';
import {
  EtiquetaRamaDecision,
  FlujoProyecto,
  ModoEditorNodoFlujo,
  TipoBloqueFlujo,
} from '../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from './estado-editor-flujo-proyecto.service';

describe('EstadoEditorFlujoProyectoService', () => {
  let estado: EstadoEditorFlujoProyectoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [EstadoEditorFlujoProyectoService] });
    estado = TestBed.inject(EstadoEditorFlujoProyectoService);
    estado.hidratar(FLUJO);
  });

  it('hidrata una copia y retira roles que no aplican a decisiones', () => {
    expect(estado.flujo().nodos[0].idsRoles).toEqual([]);
    expect(estado.flujo()).not.toBe(FLUJO);
  });

  it('crea un bloque normalizando textos y roles nuevos', () => {
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    estado.confirmarBorradorNodo({
      tipo: TipoBloqueFlujo.Accion,
      titulo: ' Confirmar pedido ',
      descripcion: ' Guarda la confirmación ',
      criteriosAceptacion: [' Resultado visible ', ' '],
      nombresRoles: ['Operador'],
      datos: {},
    });

    const creado = estado.flujo().nodos.at(-1);
    expect(creado).toEqual(
      jasmine.objectContaining({
        tipo: TipoBloqueFlujo.Accion,
        titulo: 'Confirmar pedido',
        descripcion: 'Guarda la confirmación',
        criteriosAceptacion: ['Resultado visible'],
      }),
    );
    expect(estado.obtenerNombreRol(creado?.idsRoles[0] ?? '')).toBe('Operador');
  });

  it('crea una conexión por teclado y evita duplicar el mismo recorrido', () => {
    estado.iniciarArrastreConexion('decision-1', EtiquetaRamaDecision.Si);
    estado.establecerDestinoConexionEnfocado('accion-1');
    estado.completarArrastreConexion();
    expect(estado.flujo().conexiones.length).toBe(1);

    estado.conectarBloques('decision-1', 'accion-1', EtiquetaRamaDecision.Si);
    expect(estado.flujo().conexiones.length).toBe(1);
    expect(estado.arrastrandoConexion()).toBe(false);
  });

  it('limita el movimiento a la superficie del lienzo', () => {
    estado.moverBloque('accion-1', { x: -100, y: 99999 });
    const bloque = estado.flujo().nodos.find((nodo) => nodo.id === 'accion-1');
    expect(bloque?.posicion.x).toBe(0);
    expect(bloque?.posicion.y).toBe(estado.tamanoLienzo.alto - estado.tamanoBloque.alto);
  });

  it('bloquea mutaciones y limpia interacciones al entrar en lectura', () => {
    estado.abrirPaletaBloques();
    estado.seleccionarBloque('accion-1');
    estado.establecerSoloLectura(true);
    estado.eliminarBloque('accion-1');

    expect(estado.paletaBloquesAbierta()).toBe(false);
    expect(estado.idBloqueSeleccionado()).toBeNull();
    expect(estado.flujo().nodos.some((nodo) => nodo.id === 'accion-1')).toBe(true);
  });

  it('expone opciones de tipo de bloque con etiqueta y descripción', () => {
    const opciones = estado.opcionesTipoBloque();
    expect(opciones.length).toBe(TIPOS_BLOQUE_FLUJO_DISPONIBLES.length);
    expect(opciones[0]).toEqual(
      jasmine.objectContaining({
        tipo: TIPOS_BLOQUE_FLUJO_DISPONIBLES[0],
        etiqueta: ETIQUETAS_TIPO_BLOQUE_FLUJO[TIPOS_BLOQUE_FLUJO_DISPONIBLES[0]],
        descripcion: DESCRIPCIONES_TIPO_BLOQUE_FLUJO[TIPOS_BLOQUE_FLUJO_DISPONIBLES[0]],
      }),
    );
  });

  it('expone roles y estado de contenido del flujo hidratado', () => {
    expect(estado.roles().map((rol) => rol.id)).toEqual(['rol-1']);
    expect(estado.tieneContenido()).toBe(true);
    expect(estado.tamanoLienzo).toBeTruthy();
    expect(estado.tamanoBloque).toBeTruthy();
  });

  it('reporta ausencia de contenido cuando el flujo está vacío', () => {
    estado.hidratar({
      proyectoId: 'vacio',
      roles: [],
      nodos: [],
      conexiones: [],
      fechaActualizacion: FECHA,
    });
    expect(estado.tieneContenido()).toBe(false);
    expect(estado.bloqueSeleccionado()).toBeNull();
  });

  it('resuelve el bloque seleccionado y lo limpia al seleccionar una conexión', () => {
    estado.seleccionarBloque('accion-1');
    expect(estado.bloqueSeleccionado()?.id).toBe('accion-1');

    estado.seleccionarConexion('conexion-inexistente');
    expect(estado.idBloqueSeleccionado()).toBeNull();
    expect(estado.idConexionSeleccionada()).toBe('conexion-inexistente');
    expect(estado.bloqueSeleccionado()).toBeNull();
  });

  it('limpia toda la selección vigente', () => {
    estado.seleccionarBloque('accion-1');
    estado.limpiarSeleccion();
    expect(estado.idBloqueSeleccionado()).toBeNull();
    expect(estado.idConexionSeleccionada()).toBeNull();
  });

  it('abre el editor de un nodo existente y expone el bloque en edición', () => {
    estado.abrirEditorNodo('accion-1');
    expect(estado.editorNodoAbierto()).toBe(true);
    expect(estado.estadoEditorNodo()?.modo).toBe(ModoEditorNodoFlujo.Editar);
    expect(estado.bloqueEnEdicion()?.id).toBe('accion-1');
    expect(estado.idBloqueSeleccionado()).toBe('accion-1');
  });

  it('ignora abrir el editor de un nodo inexistente', () => {
    estado.abrirEditorNodo('nodo-fantasma');
    expect(estado.editorNodoAbierto()).toBe(false);
    expect(estado.bloqueEnEdicion()).toBeNull();
  });

  it('cancela el borrador de nodo abierto', () => {
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    expect(estado.editorNodoAbierto()).toBe(true);
    estado.cancelarBorradorNodo();
    expect(estado.editorNodoAbierto()).toBe(false);
  });

  it('no inicia la creación de nodo en modo solo lectura', () => {
    estado.establecerSoloLectura(true);
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    expect(estado.editorNodoAbierto()).toBe(false);
  });

  it('edita un nodo existente conservando su identidad', () => {
    estado.abrirEditorNodo('accion-1');
    estado.confirmarBorradorNodo({
      tipo: TipoBloqueFlujo.Accion,
      titulo: ' Actualizado ',
      descripcion: ' Nueva descripción ',
      criteriosAceptacion: [' Criterio uno ', 'Criterio dos', '  '],
      nombresRoles: ['Administrador'],
      datos: {},
    });

    const editado = estado.flujo().nodos.find((nodo) => nodo.id === 'accion-1');
    expect(editado?.titulo).toBe('Actualizado');
    expect(editado?.descripcion).toBe('Nueva descripción');
    expect(editado?.criteriosAceptacion).toEqual(['Criterio uno', 'Criterio dos']);
    expect(editado?.criteriosAceptacion.length).toBe(2);
    expect(editado?.idsRoles.length).toBe(1);
    expect(estado.editorNodoAbierto()).toBe(false);
  });

  it('no confirma borrador sin estado de editor abierto', () => {
    estado.confirmarBorradorNodo({
      tipo: TipoBloqueFlujo.Accion,
      titulo: 'Sin editor',
      descripcion: '',
      criteriosAceptacion: [],
      nombresRoles: [],
      datos: {},
    });
    expect(estado.flujo().nodos.some((nodo) => nodo.titulo === 'Sin editor')).toBe(false);
  });

  it('no confirma borrador en modo solo lectura', () => {
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    estado.establecerSoloLectura(true);
    estado.confirmarBorradorNodo({
      tipo: TipoBloqueFlujo.Accion,
      titulo: 'Bloqueado',
      descripcion: '',
      criteriosAceptacion: [],
      nombresRoles: [],
      datos: {},
    });
    expect(estado.flujo().nodos.some((nodo) => nodo.titulo === 'Bloqueado')).toBe(false);
  });

  it('crea un nodo de decisión sin asignar roles por política', () => {
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Decision);
    estado.confirmarBorradorNodo({
      tipo: TipoBloqueFlujo.Decision,
      titulo: 'Bifurcación',
      descripcion: 'Decide',
      criteriosAceptacion: [],
      nombresRoles: ['Rol ignorado'],
      datos: {},
    });
    const creado = estado.flujo().nodos.at(-1);
    expect(creado?.idsRoles).toEqual([]);
  });

  it('reutiliza roles existentes por coincidencia insensible a mayúsculas', () => {
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    estado.confirmarBorradorNodo({
      tipo: TipoBloqueFlujo.Accion,
      titulo: 'Con rol conocido',
      descripcion: '',
      criteriosAceptacion: [],
      nombresRoles: ['administrador', 'administrador', '  '],
      datos: {},
    });
    const creado = estado.flujo().nodos.at(-1);
    expect(creado?.idsRoles).toEqual(['rol-1']);
    expect(estado.roles().length).toBe(1);
  });

  it('elimina un bloque y sus conexiones dependientes', () => {
    estado.conectarBloques('decision-1', 'accion-1');
    expect(estado.flujo().conexiones.length).toBe(1);

    estado.seleccionarBloque('accion-1');
    estado.eliminarBloque('accion-1');
    expect(estado.flujo().nodos.some((nodo) => nodo.id === 'accion-1')).toBe(false);
    expect(estado.flujo().conexiones.length).toBe(0);
    expect(estado.idBloqueSeleccionado()).toBeNull();
  });

  it('cancela la conexión activa cuando se elimina su bloque de origen', () => {
    estado.iniciarArrastreConexion('decision-1');
    expect(estado.arrastrandoConexion()).toBe(true);
    estado.eliminarBloque('decision-1');
    expect(estado.arrastrandoConexion()).toBe(false);
  });

  it('ignora conexiones entre un bloque y sí mismo', () => {
    estado.conectarBloques('accion-1', 'accion-1');
    expect(estado.flujo().conexiones.length).toBe(0);
  });

  it('evita ramas de decisión duplicadas con la misma etiqueta', () => {
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    estado.confirmarBorradorNodo({
      tipo: TipoBloqueFlujo.Accion,
      titulo: 'Segundo destino',
      descripcion: '',
      criteriosAceptacion: [],
      nombresRoles: [],
      datos: {},
    });
    const segundoDestino = estado.flujo().nodos.at(-1)!.id;

    estado.conectarBloques('decision-1', 'accion-1', EtiquetaRamaDecision.Si);
    expect(estado.flujo().conexiones.length).toBe(1);

    estado.conectarBloques('decision-1', segundoDestino, EtiquetaRamaDecision.Si);
    expect(estado.flujo().conexiones.length).toBe(1);
  });

  it('elimina una conexión y limpia su selección', () => {
    estado.conectarBloques('decision-1', 'accion-1');
    const conexionId = estado.flujo().conexiones[0].id;
    estado.seleccionarConexion(conexionId);
    estado.eliminarConexion(conexionId);
    expect(estado.flujo().conexiones.length).toBe(0);
    expect(estado.idConexionSeleccionada()).toBeNull();
  });

  it('filtra conexiones cuyos extremos no son visibles', () => {
    estado.hidratar({
      proyectoId: '99',
      roles: [],
      nodos: [
        {
          id: 'a',
          tipo: TipoBloqueFlujo.Accion,
          titulo: 'A',
          descripcion: '',
          criteriosAceptacion: [],
          posicion: { x: 0, y: 0 },
          idsRoles: [],
          fechaCreacion: FECHA,
          fechaActualizacion: FECHA,
          datos: {},
        },
      ],
      conexiones: [
        {
          id: 'c-huerfana',
          idBloqueOrigen: 'a',
          idBloqueDestino: 'inexistente',
          fechaCreacion: FECHA,
        },
      ],
      fechaActualizacion: FECHA,
    });
    expect(estado.conexionesVisibles().length).toBe(0);
  });

  it('gestiona el zoom y el desplazamiento dentro de sus límites', () => {
    estado.ajustarEscala(5);
    expect(estado.vista().escala).toBe(1.8);
    estado.ajustarEscala(-10);
    expect(estado.vista().escala).toBe(0.2);
    estado.desplazarVista(30, -15);
    expect(estado.vista().desplazamientoX).toBe(30);
    expect(estado.vista().desplazamientoY).toBe(-15);
    estado.restablecerVista();
    expect(estado.vista()).toEqual({ desplazamientoX: 0, desplazamientoY: 0, escala: 1 });
  });

  it('gestiona la apertura y cierre de la paleta de bloques', () => {
    estado.abrirPaletaBloques();
    expect(estado.paletaBloquesAbierta()).toBe(true);
    estado.cerrarPaletaBloques();
    expect(estado.paletaBloquesAbierta()).toBe(false);
  });

  it('no abre la paleta en modo solo lectura', () => {
    estado.establecerSoloLectura(true);
    estado.abrirPaletaBloques();
    expect(estado.paletaBloquesAbierta()).toBe(false);
  });

  it('no inicia el arrastre de conexión en modo solo lectura', () => {
    estado.establecerSoloLectura(true);
    estado.iniciarArrastreConexion('decision-1');
    expect(estado.arrastrandoConexion()).toBe(false);
  });

  it('actualiza el puntero solo cuando hay una conexión en curso', () => {
    estado.actualizarPunteroConexion({ x: 10, y: 10 });
    expect(estado.previsualizacionConexionActiva()).toBeNull();

    estado.iniciarArrastreConexion('decision-1');
    estado.actualizarPunteroConexion({ x: 300, y: 200 });
    expect(estado.previsualizacionConexionActiva()).not.toBeNull();
  });

  it('establece y descarta el destino enfocado de la conexión', () => {
    estado.iniciarArrastreConexion('decision-1');
    estado.actualizarPunteroConexion({ x: 500, y: 120 });
    estado.establecerDestinoConexionEnfocado('accion-1');
    expect(estado.esDestinoConexionEnfocado('accion-1')).toBe(true);

    estado.establecerDestinoConexionEnfocado('decision-1');
    expect(estado.esDestinoConexionEnfocado('accion-1')).toBe(false);

    estado.establecerDestinoConexionEnfocado(null);
    expect(estado.esDestinoConexionEnfocado('accion-1')).toBe(false);
  });

  it('cancela el arrastre cuando no hay destino enfocado', () => {
    estado.iniciarArrastreConexion('decision-1');
    estado.completarArrastreConexion();
    expect(estado.arrastrandoConexion()).toBe(false);
    expect(estado.flujo().conexiones.length).toBe(0);
  });

  it('indica si un bloque puede ser destino de la conexión activa', () => {
    expect(estado.esDestinoConexion('accion-1')).toBe(false);
    estado.iniciarArrastreConexion('decision-1');
    expect(estado.esDestinoConexion('accion-1')).toBe(true);
    expect(estado.esDestinoConexion('decision-1')).toBe(false);
  });

  it('devuelve un nombre por defecto para roles desconocidos', () => {
    expect(estado.obtenerNombreRol('rol-1')).toBe('Administrador');
    expect(estado.obtenerNombreRol('inexistente')).toBe('Rol sin nombre');
    expect(estado.obtenerNombresRoles(['rol-1', 'inexistente'])).toEqual([
      'Administrador',
      'Rol sin nombre',
    ]);
  });

  it('construye un borrador editable a partir de un nodo confirmado', () => {
    const nodo = estado.flujo().nodos.find((n) => n.id === 'accion-1')!;
    const borrador = estado.obtenerBorradorDesdeNodo(nodo);
    expect(borrador.tipo).toBe(TipoBloqueFlujo.Accion);
    expect(borrador.titulo).toBe('Confirmar');
    expect(borrador.criteriosAceptacion).toEqual(['Se confirma.']);
    expect(borrador.nombresRoles).toEqual(['Administrador']);
  });

  it('construye un borrador predeterminado por tipo de bloque', () => {
    const borrador = estado.obtenerBorradorPredeterminado(TipoBloqueFlujo.Componente);
    expect(borrador.tipo).toBe(TipoBloqueFlujo.Componente);
    expect(borrador.titulo).toBe(ETIQUETAS_TIPO_BLOQUE_FLUJO[TipoBloqueFlujo.Componente]);
    expect(borrador.criteriosAceptacion).toEqual([]);
    expect(borrador.nombresRoles).toEqual([]);
  });

  it('conserva la vista y la selección cuando la hidratación lo indica', () => {
    estado.desplazarVista(50, 50);
    estado.seleccionarBloque('accion-1');
    estado.hidratar(FLUJO, '42', { conservarVista: true, conservarSeleccion: true });
    expect(estado.vista().desplazamientoX).toBe(50);
    expect(estado.idBloqueSeleccionado()).toBe('accion-1');
  });

  it('descarta la selección conservada si el nodo ya no existe', () => {
    estado.seleccionarBloque('accion-1');
    estado.hidratar(
      {
        proyectoId: '42',
        roles: [],
        nodos: [],
        conexiones: [],
        fechaActualizacion: FECHA,
      },
      '42',
      { conservarSeleccion: true },
    );
    expect(estado.idBloqueSeleccionado()).toBeNull();
  });

  it('sugiere una posición replegada cuando el ancla está cerca del borde derecho', () => {
    estado.hidratar({
      proyectoId: 'borde',
      roles: [],
      nodos: [
        {
          id: 'borde-1',
          tipo: TipoBloqueFlujo.Accion,
          titulo: 'Borde',
          descripcion: '',
          criteriosAceptacion: [],
          posicion: { x: estado.tamanoLienzo.ancho - 100, y: 100 },
          idsRoles: [],
          fechaCreacion: FECHA,
          fechaActualizacion: FECHA,
          datos: {},
        },
      ],
      conexiones: [],
      fechaActualizacion: FECHA,
    });
    estado.seleccionarBloque('borde-1');
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    const sugerida = estado.estadoEditorNodo()?.posicionSugerida;
    expect(sugerida).toBeTruthy();
    expect(sugerida!.x).toBeLessThan(estado.tamanoLienzo.ancho - 100);
  });

  it('sugiere una posición basada en la vista cuando no hay bloques', () => {
    estado.hidratar({
      proyectoId: 'sin-nodos',
      roles: [],
      nodos: [],
      conexiones: [],
      fechaActualizacion: FECHA,
    });
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Accion);
    const sugerida = estado.estadoEditorNodo()?.posicionSugerida;
    expect(sugerida?.x).toBeGreaterThanOrEqual(0);
    expect(sugerida?.y).toBeGreaterThanOrEqual(0);
  });
});

const FECHA = '2026-09-01T10:00:00.000Z';
const FLUJO: FlujoProyecto = {
  proyectoId: '42',
  roles: [{ id: 'rol-1', nombre: 'Administrador', fechaCreacion: FECHA }],
  nodos: [
    {
      id: 'decision-1',
      tipo: TipoBloqueFlujo.Decision,
      titulo: '¿Es válido?',
      descripcion: 'Valida la solicitud.',
      criteriosAceptacion: ['Se elige una ruta.'],
      posicion: { x: 100, y: 100 },
      idsRoles: ['rol-1'],
      fechaCreacion: FECHA,
      fechaActualizacion: FECHA,
      datos: {},
    },
    {
      id: 'accion-1',
      tipo: TipoBloqueFlujo.Accion,
      titulo: 'Confirmar',
      descripcion: 'Confirma la solicitud.',
      criteriosAceptacion: ['Se confirma.'],
      posicion: { x: 500, y: 100 },
      idsRoles: ['rol-1'],
      fechaCreacion: FECHA,
      fechaActualizacion: FECHA,
      datos: {},
    },
  ],
  conexiones: [],
  fechaActualizacion: FECHA,
};
