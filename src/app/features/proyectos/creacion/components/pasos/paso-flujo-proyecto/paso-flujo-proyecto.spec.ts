import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { BorradorProyecto } from '../../../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PasoFlujoProyecto } from './paso-flujo-proyecto';

describe('PasoFlujoProyecto', () => {
  const proyectoId = signal<number | null>(42);
  let borrador: BorradorProyecto;
  let fixture: ComponentFixture<PasoFlujoProyecto>;
  const estadoCreacion = {
    proyectoId: proyectoId.asReadonly(),
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    borrador = { ...BORRADOR };
    estadoCreacion.cargar.mockImplementation(() => of(borrador));
    estadoCreacion.guardarSeccion.mockImplementation(() => of({ ...borrador, pasoActual: 9 }));

    await TestBed.configureTestingModule({
      imports: [PasoFlujoProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
      ],
    }).compileComponents();
  });

  it('guarda el flujo mediante el estado común del recorrido', () => {
    crearComponente();

    obtenerBoton('Guardar flujo').click();
    fixture.detectChanges();

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.Flujo,
      datos: expect.objectContaining({
        projectId: '42',
        nodes: [],
        connections: [],
      }),
    });
  });

  it('no convierte un contrato inválido en un flujo vacío', () => {
    borrador = {
      ...BORRADOR,
      diagramFlujoJson:
        '{"projectId":"42","roles":[],"blocks":[],"connections":[],"updatedAt":"2026-08-28T10:00:00.000Z"}',
    };
    crearComponente();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No fue posible interpretar el flujo',
    );
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Guardar flujo');
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(PasoFlujoProyecto);
    fixture.detectChanges();
  }

  function obtenerBoton(texto: string): HTMLButtonElement {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((boton) => boton.textContent?.includes(texto))!;
  }
});

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 3,
  pasoActual: 8,
  equipoAzure: null,
  contexto: {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión del backlog.',
    prioridadCatalogoId: 14,
    fechaObjetivo: '2026-09-30',
  },
  estadoCatalogoId: null,
  tipoSolucionJson: '{}',
  necesidadJson: '{}',
  objetivosJson: '{}',
  alcanceJson: '{}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-28T10:00:00.000Z',
};
