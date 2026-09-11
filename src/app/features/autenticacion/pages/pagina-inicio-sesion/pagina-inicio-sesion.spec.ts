import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { AutenticacionService } from '../../../../core/autenticacion/services/autenticacion.service';
import { URL_PANEL } from '../../../../core/navegacion/rutas';
import { AccesoMicrosoft } from '../../components/acceso-microsoft/acceso-microsoft';
import { PaginaInicioSesion } from './pagina-inicio-sesion';

describe('PaginaInicioSesion', () => {
  let fixture: ComponentFixture<PaginaInicioSesion>;
  const autenticacion = {
    iniciarSesionConMicrosoft: jasmine.createSpy<() => Observable<void>>('iniciarSesionConMicrosoft'),
  };

  beforeEach(async () => {
    autenticacion.iniciarSesionConMicrosoft.calls.reset();
    autenticacion.iniciarSesionConMicrosoft.and.returnValue(EMPTY);

    await TestBed.configureTestingModule({
      imports: [PaginaInicioSesion],
      providers: [provideRouter([]), { provide: AutenticacionService, useValue: autenticacion }],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaInicioSesion);
    fixture.detectChanges();
  });

  it('crea la página de inicio de sesión', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('compone el encabezado accesible y el acceso de Microsoft', () => {
    const titulo = fixture.nativeElement.querySelector('#inicio-sesion-titulo') as HTMLElement;
    const tarjeta = fixture.nativeElement.querySelector('.inicio-sesion__tarjeta') as HTMLElement;
    const acceso = fixture.debugElement.query(
      (elemento) => elemento.componentInstance instanceof AccesoMicrosoft,
    );

    expect(titulo.textContent).toContain('Bienvenido a InterIA');
    expect(tarjeta.getAttribute('aria-labelledby')).toBe(titulo.id);
    expect(acceso).toBeTruthy();
  });

  it('mantiene el estado de espera hasta que la ventana externa regresa', () => {
    const resultado = new Subject<void>();
    autenticacion.iniciarSesionConMicrosoft.and.returnValue(resultado);

    obtenerBoton().click();
    fixture.detectChanges();

    expect(obtenerBoton().disabled).toBe(true);
    expect(obtenerBoton().textContent).toContain('Esperando a Microsoft');

    resultado.complete();
    fixture.detectChanges();

    expect(obtenerBoton().disabled).toBe(false);
  });

  it('navega al panel únicamente después del retorno del popup', () => {
    const resultado = new Subject<void>();
    const router = TestBed.inject(Router);
    const navegar = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    autenticacion.iniciarSesionConMicrosoft.and.returnValue(resultado);

    obtenerBoton().click();
    expect(navegar).not.toHaveBeenCalled();

    resultado.next();

    expect(navegar).toHaveBeenCalledWith(URL_PANEL);
  });

  function obtenerBoton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }
});
