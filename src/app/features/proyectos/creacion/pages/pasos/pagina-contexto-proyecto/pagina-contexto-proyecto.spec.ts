import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { CatalogosService } from '../../../../../../core/catalogos/services/catalogos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { BorradorProyecto } from '../../../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PaginaContextoProyecto } from './pagina-contexto-proyecto';

describe('PaginaContextoProyecto', () => {
  let fixture: ComponentFixture<PaginaContextoProyecto>;
  const estadoCreacion = {
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
    actualizarNombreProyecto: vi.fn(),
  };
  const router = { navigateByUrl: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    estadoCreacion.cargar.mockReturnValue(of(BORRADOR));
    estadoCreacion.guardarSeccion.mockReturnValue(of({ ...BORRADOR, revision: 4, pasoActual: 2 }));

    await TestBed.configureTestingModule({
      imports: [PaginaContextoProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        {
          provide: CatalogosService,
          useValue: {
            obtenerOpciones: vi.fn().mockReturnValue(
              of([
                { id: 13, nombre: 'Alta', descripcion: 'Prioridad alta' },
                { id: 14, nombre: 'Media', descripcion: 'Prioridad media' },
              ]),
            ),
          },
        },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { snapshot: { paramMap: convertToParamMap({ proyectoId: '42' }) } },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaContextoProyecto);
    fixture.detectChanges();
  });

  it('presenta el formulario reutilizable con los datos del borrador', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect((elemento.querySelector('#contexto-nombre') as HTMLInputElement).value).toBe('InterIA');
    expect(elemento.textContent).toContain('Guardar y continuar');
    expect(elemento.querySelector('header')).toBeNull();
    expect(elemento.querySelector('.ui-card')).toBeNull();
  });

  it('lleva el nombre escrito al estado del recorrido', () => {
    const control = (fixture.nativeElement as HTMLElement).querySelector(
      '#contexto-nombre',
    ) as HTMLInputElement;

    control.value = 'Portal de clientes';
    control.dispatchEvent(new Event('input'));

    expect(estadoCreacion.actualizarNombreProyecto).toHaveBeenCalledWith('Portal de clientes');
  });

  it('guarda Contexto mediante la actualización centralizada', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.Contexto,
      datos: expect.objectContaining({ nombre: 'InterIA' }),
    });
  });
});

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 3,
  pasoActual: 1,
  contexto: {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión inteligente del backlog.',
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
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};
