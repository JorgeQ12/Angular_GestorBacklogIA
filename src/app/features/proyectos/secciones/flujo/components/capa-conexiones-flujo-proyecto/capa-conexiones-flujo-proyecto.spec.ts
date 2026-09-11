import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LadoConexionFlujo, TipoBloqueFlujo } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { CapaConexionesFlujoProyecto } from './capa-conexiones-flujo-proyecto';

describe('CapaConexionesFlujoProyecto', () => {
  let fixture: ComponentFixture<CapaConexionesFlujoProyecto>;
  const soloLectura = signal(false);
  const seleccionarConexion = jasmine.createSpy('seleccionarConexion');
  const estado = {
    tamanoLienzo: { ancho: 1200, alto: 800 },
    bloquesVisibles: signal([
      crearBloque('origen', 'Inicio', 100, 100),
      crearBloque('destino', 'Confirmación', 500, 100),
    ]).asReadonly(),
    conexionesVisibles: signal([
      {
        id: 'conexion-1',
        idBloqueOrigen: 'origen',
        idBloqueDestino: 'destino',
        etiqueta: null,
        ladoDestino: LadoConexionFlujo.Izquierda,
      },
    ]).asReadonly(),
    previsualizacionConexionActiva: signal(null).asReadonly(),
    idConexionSeleccionada: signal<string | null>(null).asReadonly(),
    soloLectura: soloLectura.asReadonly(),
    seleccionarConexion,
    eliminarConexion: jasmine.createSpy('eliminarConexion'),
  };

  beforeEach(async () => {
    soloLectura.set(false);
    seleccionarConexion.calls.reset();
    await TestBed.configureTestingModule({
      imports: [CapaConexionesFlujoProyecto],
      providers: [{ provide: EstadoEditorFlujoProyectoService, useValue: estado }],
    }).compileComponents();
    fixture = TestBed.createComponent(CapaConexionesFlujoProyecto);
    fixture.detectChanges();
  });

  it('expone cada conexión editable y permite seleccionarla con el teclado', () => {
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg');
    const conexion = (fixture.nativeElement as HTMLElement).querySelector<SVGPathElement>(
      '[data-interaccion-conexion]',
    );

    expect(svg?.getAttribute('aria-hidden')).toBeNull();
    expect(conexion?.getAttribute('role')).toBe('button');
    expect(conexion?.getAttribute('aria-label')).toContain('Inicio hacia Confirmación');

    conexion?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(seleccionarConexion).toHaveBeenCalledWith('conexion-1');
  });

  it('retira la interacción de teclado en modo lectura', () => {
    soloLectura.set(true);
    fixture.detectChanges();

    const conexion = (fixture.nativeElement as HTMLElement).querySelector<SVGPathElement>(
      '[data-interaccion-conexion]',
    );
    expect(conexion?.getAttribute('tabindex')).toBeNull();
    expect(conexion?.getAttribute('aria-hidden')).toBe('true');
  });
});

function crearBloque(id: string, titulo: string, x: number, y: number) {
  return {
    id,
    tipo: TipoBloqueFlujo.Accion,
    titulo,
    descripcion: '',
    criteriosAceptacion: [],
    posicion: { x, y },
    idsRoles: [],
    fechaCreacion: '2026-09-01T10:00:00.000Z',
    fechaActualizacion: '2026-09-01T10:00:00.000Z',
    datos: {},
  };
}
