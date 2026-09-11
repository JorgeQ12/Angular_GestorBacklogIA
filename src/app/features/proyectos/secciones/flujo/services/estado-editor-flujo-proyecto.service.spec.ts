import { TestBed } from '@angular/core/testing';
import {
  EtiquetaRamaDecision,
  FlujoProyecto,
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
    expect(creado).toMatchObject({
      tipo: TipoBloqueFlujo.Accion,
      titulo: 'Confirmar pedido',
      descripcion: 'Guarda la confirmación',
      criteriosAceptacion: ['Resultado visible'],
    });
    expect(estado.obtenerNombreRol(creado?.idsRoles[0] ?? '')).toBe('Operador');
  });

  it('crea una conexión por teclado y evita duplicar el mismo recorrido', () => {
    estado.iniciarArrastreConexion('decision-1', EtiquetaRamaDecision.Si);
    estado.establecerDestinoConexionEnfocado('accion-1');
    estado.completarArrastreConexion();
    expect(estado.flujo().conexiones).toHaveLength(1);

    estado.conectarBloques('decision-1', 'accion-1', EtiquetaRamaDecision.Si);
    expect(estado.flujo().conexiones).toHaveLength(1);
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
