import { LOCALE_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { CatalogosService } from '../../../../../core/catalogos/services/catalogos.service';
import { MensajesService } from '../../../../../core/mensajes/services/mensajes.service';
import { LOCALE_APLICACION } from '../../../../../core/localizacion/config/localizacion.config';
import { PlataformaSolucion } from '../../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import type { InformacionProyecto } from '../../models/informacion-proyecto.model';
import { EstadoInformacionProyectoService } from '../../services/estado-informacion-proyecto.service';
import { PaginaInformacionProyecto } from './pagina-informacion-proyecto';

describe('PaginaInformacionProyecto', () => {
  let fixture: ComponentFixture<PaginaInformacionProyecto>;
  let consulta$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  const estado = {
    proyectoActual: signal<{ id: number; versionId: number } | null>({ id: 42, versionId: 81 }),
    proyectoPresentado: signal<InformacionProyecto | null>(null),
    versiones: signal([]),
    errorCarga: signal(false),
    guardando: signal(false),
    cargar: vi.fn(),
    presentarVersion: vi.fn(),
    guardar: vi.fn(),
  };
  const router = { navigate: vi.fn(), navigateByUrl: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    consulta$ = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [PaginaInformacionProyecto],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ proyectoId: '42' })),
            queryParamMap: consulta$,
          },
        },
        { provide: Router, useValue: router },
        { provide: LOCALE_ID, useValue: LOCALE_APLICACION },
        { provide: CatalogosService, useValue: { obtenerOpciones: vi.fn(() => of([])) } },
        { provide: MensajesService, useValue: { confirmar: vi.fn(() => Promise.resolve(true)) } },
        { provide: EstadoInformacionProyectoService, useValue: estado },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaInformacionProyecto);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('carga el proyecto desde paramMap sin capturar un snapshot', () => {
    expect(estado.cargar).toHaveBeenCalledWith(42, null);
  });

  it('aplica la versión de la URL a todo el estado presentado', () => {
    consulta$.next(convertToParamMap({ version: '72' }));
    TestBed.flushEffects();
    expect(estado.presentarVersion).toHaveBeenLastCalledWith(72);
  });

  it('rehidrata los metadatos del encabezado desde la fotografía presentada', () => {
    estado.proyectoPresentado.set(PROYECTO_PRESENTADO);
    fixture.detectChanges();

    estado.proyectoPresentado.set({
      ...PROYECTO_PRESENTADO,
      contexto: {
        ...PROYECTO_PRESENTADO.contexto,
        responsable: 'María Gómez',
        fechaObjetivo: '2026-08-30',
      },
      prioridad: 'Media',
    });
    fixture.detectChanges();

    const encabezado = (fixture.nativeElement as HTMLElement).querySelector(
      'app-encabezado-pagina',
    );

    expect(encabezado?.textContent).toContain('RESPONSABLE María Gómez');
    expect(encabezado?.textContent).toContain('Prioridad Media');
    expect(encabezado?.textContent).toContain('30 de ago de 2026');
    expect(encabezado?.textContent).not.toContain('En Progreso');
    expect(encabezado?.textContent).not.toContain('Versión 4');
  });
});

const PROYECTO_PRESENTADO: InformacionProyecto = {
  id: 42,
  versionId: 81,
  numeroVersion: 4,
  fechaVersion: null,
  esVersionActual: true,
  contexto: {
    nombre: 'Portal',
    responsable: 'Jorge',
    descripcion: 'Descripción',
    prioridadCatalogoId: 2,
    fechaObjetivo: '2026-12-10',
  },
  estadoCatalogoId: 3,
  estado: 'En Progreso',
  prioridad: 'Alta',
  azure: null,
  tipoSolucion: { tieneInterfaz: true, plataforma: PlataformaSolucion.Web },
  necesidad: { situacionActual: 'Manual', problemas: 'Retrasos', impacto: 'Costos' },
  objetivos: { objetivoGeneral: 'Mejorar', objetivosEspecificos: ['Automatizar'] },
  alcance: { incluido: 'Portal', excluido: 'Pagos' },
  roles: { roles: [] },
  equipo: { integrantes: [] },
  flujo: {
    proyectoId: '42',
    roles: [],
    nodos: [],
    conexiones: [],
    fechaActualizacion: '2026-09-01',
  },
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson: '{"situacionActual":"Manual","problemas":"Retrasos","impacto":"Costos"}',
  objetivosJson: '{"objetivoGeneral":"Mejorar","objetivosEspecificos":["Automatizar"]}',
  alcanceJson: '{"incluido":"Portal","excluido":"Pagos"}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
};
