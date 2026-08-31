import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CatalogosService } from '../../../../../../core/catalogos/services/catalogos.service';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PasoContextoProyecto } from './paso-contexto-proyecto';

describe('PasoContextoProyecto', () => {
  let fixture: ComponentFixture<PasoContextoProyecto>;
  let proyectoId: ReturnType<typeof signal<number | null>>;
  const contextoGuardado = {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión inteligente del backlog.',
    prioridadCatalogoId: 14,
    fechaObjetivo: '2026-09-30',
  };
  const estadoCreacion = {
    proyectoId: () => proyectoId(),
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
    actualizarNombreProyecto: vi.fn(),
  };
  const catalogos = {
    obtenerOpciones: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    proyectoId = signal<number | null>(42);
    estadoCreacion.cargar.mockReturnValue(of({ contexto: contextoGuardado }));
    estadoCreacion.guardarSeccion.mockReturnValue(of({ contexto: contextoGuardado }));
    catalogos.obtenerOpciones.mockReturnValue(
      of([
        { id: 13, nombre: 'Alta', descripcion: 'Prioridad alta' },
        { id: 14, nombre: 'Media', descripcion: 'Prioridad media' },
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [PasoContextoProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        { provide: CatalogosService, useValue: catalogos },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PasoContextoProyecto);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('carga el borrador y los catálogos antes de presentar Contexto', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(catalogos.obtenerOpciones).toHaveBeenCalledOnce();
    expect((elemento.querySelector('#contexto-nombre') as HTMLInputElement).value).toBe('InterIA');
    expect(elemento.textContent).toContain('Guardar y continuar');
  });

  it('mantiene el nombre visible del recorrido alineado con el formulario', () => {
    const control = (fixture.nativeElement as HTMLElement).querySelector(
      '#contexto-nombre',
    ) as HTMLInputElement;

    control.value = 'Portal de clientes';
    control.dispatchEvent(new Event('input'));

    expect(estadoCreacion.actualizarNombreProyecto).toHaveBeenCalledWith('Portal de clientes');
  });

  it('guarda Contexto y comunica que el recorrido puede continuar', () => {
    const completado = vi.fn();
    fixture.componentInstance.completado.subscribe(completado);

    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.Contexto,
      datos: expect.objectContaining({ nombre: 'InterIA', prioridadCatalogoId: 14 }),
    });
    expect(completado).toHaveBeenCalledOnce();
  });
});
