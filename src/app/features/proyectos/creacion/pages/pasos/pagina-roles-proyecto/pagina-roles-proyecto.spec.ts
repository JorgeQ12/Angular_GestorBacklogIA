import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { BorradorProyecto } from '../../../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PaginaRolesProyecto } from './pagina-roles-proyecto';

describe('PaginaRolesProyecto', () => {
  let fixture: ComponentFixture<PaginaRolesProyecto>;
  const estadoCreacion = {
    seleccionarProyecto: vi.fn(),
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };
  const router = { navigateByUrl: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    estadoCreacion.cargar.mockReturnValue(of(BORRADOR));
    estadoCreacion.guardarSeccion.mockReturnValue(of({ ...BORRADOR, revision: 8, pasoActual: 7 }));

    await TestBed.configureTestingModule({
      imports: [PaginaRolesProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { paramMap: of(convertToParamMap({ proyectoId: '42' })) },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaRolesProyecto);
    fixture.detectChanges();
  });

  it('recupera el contrato canónico y presenta los roles', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(obtenerControl(elemento, '#rol-nombre-0').value).toBe('Administrador');
    expect(obtenerControl(elemento, '#rol-descripcion-0').value).toBe('Configura la solución.');
  });

  it('guarda los roles y abre Equipo', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    escribir(elemento, '#rol-nombre-0', 'Usuario final');
    escribir(elemento, '#rol-descripcion-0', 'Consulta la información.');
    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.Roles,
      datos: {
        roles: [{ nombre: 'Usuario final', descripcion: 'Consulta la información.' }],
      },
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/panel/proyectos/42/creacion/equipo');
  });
});

function obtenerControl(elemento: HTMLElement, selector: string): HTMLInputElement {
  return elemento.querySelector(selector) as HTMLInputElement;
}

function escribir(elemento: HTMLElement, selector: string, valor: string): void {
  const control = obtenerControl(elemento, selector);
  control.value = valor;
  control.dispatchEvent(new Event('input'));
}

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 7,
  pasoActual: 6,
  equipoAzure: null,
  contexto: {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión inteligente del backlog.',
    prioridadCatalogoId: 14,
    fechaObjetivo: '2026-09-30',
  },
  estadoCatalogoId: null,
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson:
    '{"situacionActual":"Registro manual","problemas":"Reprocesos","impacto":"Tiempos altos"}',
  objetivosJson:
    '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar tareas"]}',
  alcanceJson: '{"incluido":"Seguimiento de envíos","excluido":"Pagos en línea"}',
  rolesJson: '[{"nombre":"Administrador","descripcion":"Configura la solución."}]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};
