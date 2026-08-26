import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from '../services/estado-creacion-proyecto.service';
import { reanudacionCreacionProyectoGuard } from './reanudacion-creacion-proyecto.guard';

describe('reanudacionCreacionProyectoGuard', () => {
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

  it('redirige la ruta base al avance recuperado', async () => {
    estadoCreacion.cargar.mockReturnValue(of({ ...BORRADOR, pasoActual: 4 }));

    await expect(ejecutarGuard()).resolves.toBe('/panel/proyectos/42/creacion/objetivos');
  });

  it('respeta una ruta hija explícita', async () => {
    await expect(ejecutarGuard(true)).resolves.toBe(true);
    expect(estadoCreacion.cargar).not.toHaveBeenCalled();
  });

  it('abre Contexto para presentar un error recuperable cuando falla la consulta', async () => {
    estadoCreacion.cargar.mockReturnValue(throwError(() => new Error('Sin conexión')));

    await expect(ejecutarGuard()).resolves.toBe('/panel/proyectos/42/creacion/contexto');
  });

  it('abandona la creación cuando el identificador no es válido', async () => {
    await expect(ejecutarGuard(false, 'invalido')).resolves.toBe('/panel/inicio');
  });

  function ejecutarGuard(tieneRutaHija = false, proyectoId = '42'): Promise<GuardResult> {
    const ruta = {
      firstChild: tieneRutaHija ? ({} as ActivatedRouteSnapshot) : null,
      paramMap: { get: () => proyectoId },
    } as unknown as ActivatedRouteSnapshot;
    const resultado = TestBed.runInInjectionContext(() =>
      reanudacionCreacionProyectoGuard(ruta, {} as RouterStateSnapshot),
    );

    return resultado instanceof Observable ? firstValueFrom(resultado) : Promise.resolve(resultado);
  }
});

const BORRADOR = {
  id: 42,
  revision: 4,
  pasoActual: 4,
} as BorradorProyecto;
