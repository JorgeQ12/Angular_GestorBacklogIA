import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MensajesService } from '../../../../../../core/mensajes/services/mensajes.service';
import { NodoFlujoProyecto, TipoBloqueFlujo } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { TarjetaBloqueFlujoProyecto } from './tarjeta-bloque-flujo-proyecto';

describe('TarjetaBloqueFlujoProyecto', () => {
  let fixture: ComponentFixture<TarjetaBloqueFlujoProyecto>;
  const arrastrandoConexion = signal(false);
  const abrirEditorNodo = vi.fn();
  const iniciarArrastreConexion = vi.fn(() => arrastrandoConexion.set(true));
  const completarArrastreConexion = vi.fn(() => arrastrandoConexion.set(false));
  const estado = {
    soloLectura: signal(false).asReadonly(),
    arrastrandoConexion: arrastrandoConexion.asReadonly(),
    idBloqueSeleccionado: signal<string | null>('accion-1').asReadonly(),
    idOrigenConexionActiva: signal<string | null>(null).asReadonly(),
    esDestinoConexion: vi.fn(() => true),
    esDestinoConexionEnfocado: vi.fn(() => false),
    obtenerNombreRol: vi.fn((id: string) => id),
    abrirEditorNodo,
    iniciarArrastreConexion,
    completarArrastreConexion,
    establecerDestinoConexionEnfocado: vi.fn(),
    seleccionarBloque: vi.fn(),
    moverBloque: vi.fn(),
    vista: signal({ escala: 1, desplazamientoX: 0, desplazamientoY: 0 }).asReadonly(),
    eliminarBloque: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    arrastrandoConexion.set(false);
    await TestBed.configureTestingModule({
      imports: [TarjetaBloqueFlujoProyecto],
      providers: [
        { provide: EstadoEditorFlujoProyectoService, useValue: estado },
        {
          provide: MensajesService,
          useValue: { confirmarDestructiva: vi.fn().mockResolvedValue(true) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TarjetaBloqueFlujoProyecto);
    fixture.componentRef.setInput('bloque', BLOQUE);
    fixture.detectChanges();
  });

  it('abre el bloque con Espacio desde la tarjeta enfocada', () => {
    const tarjeta = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.tarjeta-bloque-flujo',
    );
    tarjeta?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(abrirEditorNodo).toHaveBeenCalledWith('accion-1');
  });

  it('inicia y completa una conexión utilizando únicamente el teclado', () => {
    const origen = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__conector--salida',
    );
    origen?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    const destino = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__conector--entrada',
    );
    destino?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(iniciarArrastreConexion).toHaveBeenCalledWith('accion-1', undefined);
    expect(completarArrastreConexion).toHaveBeenCalled();
  });
});

const BLOQUE: NodoFlujoProyecto = {
  id: 'accion-1',
  tipo: TipoBloqueFlujo.Accion,
  titulo: 'Confirmar solicitud',
  descripcion: 'Confirma la operación.',
  criteriosAceptacion: [],
  posicion: { x: 120, y: 80 },
  idsRoles: [],
  fechaCreacion: '2026-09-01T10:00:00.000Z',
  fechaActualizacion: '2026-09-01T10:00:00.000Z',
  datos: {},
};
