import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { URL_INICIO_SESION } from '../../navegacion/rutas';
import { SesionUsuario } from '../models/sesion-usuario.model';
import { AutenticacionService } from '../services/autenticacion.service';
import { sesionGuard } from './sesion.guard';

describe('sesionGuard', () => {
  const sesion = signal<SesionUsuario | null>(null);
  const autenticacion = {
    sesionActual: sesion.asReadonly(),
    verificarSesion: vi.fn(() => of({ nombre: 'Jorge' })),
  };

  beforeEach(() => {
    sesion.set(null);
    autenticacion.verificarSesion.mockReset();
    autenticacion.verificarSesion.mockReturnValue(of({ nombre: 'Jorge' }));

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AutenticacionService, useValue: autenticacion }],
    });
  });

  it('permite el acceso sin consultar nuevamente una sesión confirmada', () => {
    sesion.set({ nombre: 'Jorge' });

    expect(ejecutarGuard()).toBe(true);
    expect(autenticacion.verificarSesion).not.toHaveBeenCalled();
  });

  it('permite el acceso cuando Kong confirma la sesión', async () => {
    const resultado = ejecutarGuard() as Observable<boolean | UrlTree>;

    expect(await firstValueFrom(resultado)).toBe(true);
    expect(autenticacion.verificarSesion).toHaveBeenCalledOnce();
  });

  it('redirige al inicio cuando Kong rechaza la sesión', async () => {
    autenticacion.verificarSesion.mockReturnValue(throwError(() => ({ status: 401 })));
    const resultado = ejecutarGuard() as Observable<boolean | UrlTree>;

    expect((await firstValueFrom(resultado)).toString()).toBe(URL_INICIO_SESION);
  });

  function ejecutarGuard(): ReturnType<typeof sesionGuard> {
    return TestBed.runInInjectionContext(() =>
      sesionGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }
});
