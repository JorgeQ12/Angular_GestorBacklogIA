import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { ClavePasoCreacionProyecto } from '../config/pasos-creacion-proyecto.config';
import { EstadoCreacionProyectoService } from '../services/estado-creacion-proyecto.service';
import { avancePasoCreacionProyectoGuard } from './avance-paso-creacion-proyecto.guard';

describe('avancePasoCreacionProyectoGuard', () => {
  const estadoCreacion = { cargar: vi.fn() };
  const router = { parseUrl: vi.fn((url: string) => url as unknown as UrlTree) };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('permite abrir un paso ya alcanzado', async () => {
    estadoCreacion.cargar.mockReturnValue(of({ ...BORRADOR, pasoActual: 4 }));

    await expect(ejecutarGuard(ClaveSeccionProyecto.Necesidad)).resolves.toBe(true);
  });

  it('redirige al último paso disponible cuando se intenta saltar el recorrido', async () => {
    estadoCreacion.cargar.mockReturnValue(of({ ...BORRADOR, pasoActual: 2 }));

    await expect(ejecutarGuard(ClaveSeccionProyecto.Necesidad)).resolves.toBe(
      '/panel/proyectos/42/creacion/tipo-solucion',
    );
  });

  it('redirige a Alcance cuando Objetivos ya fue completado', async () => {
    estadoCreacion.cargar.mockReturnValue(of({ ...BORRADOR, pasoActual: 5 }));

    await expect(ejecutarGuard(ClaveSeccionProyecto.Roles)).resolves.toBe(
      '/panel/proyectos/42/creacion/alcance',
    );
  });

  it('permite abrir Roles cuando Alcance ya fue completado', async () => {
    estadoCreacion.cargar.mockReturnValue(of({ ...BORRADOR, pasoActual: 6 }));

    await expect(ejecutarGuard(ClaveSeccionProyecto.Roles)).resolves.toBe(true);
  });

  it('deja que la página presente el error cuando no puede recuperar el borrador', async () => {
    estadoCreacion.cargar.mockReturnValue(throwError(() => new Error('Sin conexión')));

    await expect(ejecutarGuard(ClaveSeccionProyecto.Necesidad)).resolves.toBe(true);
  });

  function ejecutarGuard(pasoActual: ClavePasoCreacionProyecto): Promise<GuardResult> {
    const ruta = {
      data: { pasoActual },
      parent: { paramMap: { get: () => '42' } },
    } as unknown as ActivatedRouteSnapshot;
    const estadoRuta = {} as RouterStateSnapshot;
    const resultado = TestBed.runInInjectionContext(() =>
      avancePasoCreacionProyectoGuard(ruta, estadoRuta),
    );

    return resultado instanceof Observable ? firstValueFrom(resultado) : Promise.resolve(resultado);
  }
});

const BORRADOR = {
  id: 42,
  revision: 4,
  pasoActual: 4,
} as BorradorProyecto;
