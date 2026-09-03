import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { SEGMENTOS_RUTA, URL_INICIO_PANEL } from '../../../../../core/navegacion/rutas';
import { PasoFlujoProyecto } from '../../../components/pasos/paso-flujo-proyecto/paso-flujo-proyecto';
import { BorradorProyecto } from '../../models/borrador-proyecto.model';
import type { DatosVinculacionAzure } from '../../../models/vinculacion-azure-proyecto.model';
import { CreacionProyectoService } from '../../services/creacion-proyecto.service';
import { EstadoCreacionProyectoService } from '../../services/estado-creacion-proyecto.service';
import { PaginaCreacionProyecto } from './pagina-creacion-proyecto';

const RUTAS: Routes = [
  {
    path: `${SEGMENTOS_RUTA.proyectos}/${SEGMENTOS_RUTA.creacion}`,
    component: PaginaCreacionProyecto,
    providers: [EstadoCreacionProyectoService],
  },
];

describe('PaginaCreacionProyecto', () => {
  const creacionProyecto = {
    obtenerBorrador: vi.fn(),
    validarVinculacionAzure: vi.fn(),
    crearBorrador: vi.fn(),
    actualizarBorrador: vi.fn(),
    guardarProyecto: vi.fn(),
    sincronizarEquipoAzure: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR_AVANZADO));
    creacionProyecto.crearBorrador.mockReturnValue(of({ id: 42, revision: 1, pasoActual: 1 }));
    creacionProyecto.actualizarBorrador.mockReturnValue(
      of({ ...BORRADOR_FLUJO, revision: 5, pasoActual: 9 }),
    );
    creacionProyecto.guardarProyecto.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      imports: [PaginaCreacionProyecto],
      providers: [
        provideRouter(RUTAS),
        { provide: CreacionProyectoService, useValue: creacionProyecto },
      ],
    });
  });

  it('presenta Azure en la única ruta de creación sin un router-outlet interno', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion');
    const elemento = harness.routeNativeElement as HTMLElement;

    expect(obtenerPosicionRecorrido(elemento)).toBe('Paso 1 de 9');
    expect(elemento.querySelector('[aria-current="step"]')?.textContent).toContain('Azure DevOps');
    expect(elemento.querySelector('app-paso-vinculacion-azure-proyecto')).not.toBeNull();
    expect(elemento.querySelector('router-outlet')).toBeNull();
  });

  it('reanuda el último paso alcanzado mediante proyectoId como query param', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const elemento = harness.routeNativeElement as HTMLElement;

    expect(creacionProyecto.obtenerBorrador).toHaveBeenCalledWith(42);
    expect(obtenerPosicionRecorrido(elemento)).toBe('Paso 5 de 9');
    expect(elemento.querySelector('[aria-current="step"]')?.textContent).toContain('Objetivos');
    expect(elemento.querySelector('app-paso-objetivos-proyecto')).not.toBeNull();
  });

  it('oculta el encabezado y el recorrido cuando falla la carga del borrador', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValueOnce(
      throwError(() => new Error('Error de carga')),
    );

    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const elemento = harness.routeNativeElement as HTMLElement;

    expect(elemento.querySelector('app-estado-error')).not.toBeNull();
    expect(elemento.querySelector('app-encabezado-pagina')).toBeNull();
    expect(elemento.querySelector('app-recorrido-proyecto')).toBeNull();
  });

  it('cambia solo el componente del paso y conserva la URL', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const elemento = harness.routeNativeElement as HTMLElement;
    const router = TestBed.inject(Router);
    const botonContexto = Array.from(
      elemento.querySelectorAll<HTMLButtonElement>('.recorrido-proyecto__boton'),
    ).find((boton) => boton.textContent?.includes('Contexto del proyecto'));

    botonContexto?.click();
    harness.detectChanges();

    expect(elemento.querySelector('app-paso-contexto-proyecto')).not.toBeNull();
    expect(router.url).toBe('/proyectos/creacion?proyectoId=42');
  });

  it('habilita solo los pasos alcanzados por el borrador', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const botones = (harness.routeNativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      '.recorrido-proyecto__boton',
    );

    expect(botones[1].disabled).toBe(false);
    expect(botones[3].disabled).toBe(false);
    expect(botones[4].disabled).toBe(true);
    expect(botones[5].disabled).toBe(true);
  });

  it('crea el borrador y agrega su id a la misma ruta', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion');
    const componente = harness.routeDebugElement?.componentInstance as PaginaCreacionProyecto;
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate');

    (componente as unknown as { datosVinculacion: { set: (datos: DatosVinculacionAzure) => void } })
      .datosVinculacion.set(DATOS_VINCULACION);
    (componente as unknown as { crearBorrador: () => void }).crearBorrador();

    expect(creacionProyecto.crearBorrador).toHaveBeenCalledWith(DATOS_VINCULACION);
    expect(navegar).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { proyectoId: 42 },
      replaceUrl: true,
    });
  });

  it('actualiza el flujo, guarda con la nueva revisión y luego regresa al inicio', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR_FLUJO));
    const confirmacionGuardado = new Subject<void>();
    creacionProyecto.guardarProyecto.mockReturnValueOnce(confirmacionGuardado.asObservable());
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const pasoFlujo = harness.routeDebugElement?.query(By.directive(PasoFlujoProyecto))
      .componentInstance as PasoFlujoProyecto;

    pasoFlujo.guardar.emit(pasoFlujo.datos());

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalled();
    expect(creacionProyecto.guardarProyecto).toHaveBeenCalledWith({
      proyectoId: 42,
      revisionEsperada: 5,
    });
    expect(navegar).not.toHaveBeenCalled();

    confirmacionGuardado.next();
    confirmacionGuardado.complete();

    expect(navegar).toHaveBeenCalledWith(URL_INICIO_PANEL);
  });

  function obtenerPosicionRecorrido(elemento: HTMLElement): string {
    return elemento.querySelector('.recorrido-proyecto__posicion')?.textContent?.trim() ?? '';
  }
});

const DATOS_VINCULACION: DatosVinculacionAzure = {
  urlBoard: 'https://dev.azure.com/interia/plataforma',
  idEpica: 123,
  idEquipo: null,
};

const BORRADOR_AVANZADO: BorradorProyecto = {
  id: 42,
  revision: 4,
  pasoActual: 4,
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
    '{"situacionActual":"Registro manual","problemas":"Reprocesos","impacto":"Costos"}',
  objetivosJson: '{}',
  alcanceJson: '{}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};

const BORRADOR_FLUJO: BorradorProyecto = {
  ...BORRADOR_AVANZADO,
  pasoActual: 8,
  diagramFlujoJson: '{}',
};
