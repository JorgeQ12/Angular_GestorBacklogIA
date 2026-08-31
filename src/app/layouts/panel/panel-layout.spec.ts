import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AutenticacionService } from '../../core/autenticacion/services/autenticacion.service';
import { PanelLayout } from './panel-layout';

describe('PanelLayout', () => {
  const autenticacion = {
    cerrarSesion: vi.fn(),
  };

  beforeEach(async () => {
    autenticacion.cerrarSesion.mockReset();

    await TestBed.configureTestingModule({
      imports: [PanelLayout],
      providers: [provideRouter([]), { provide: AutenticacionService, useValue: autenticacion }],
    }).compileComponents();
  });

  it('presenta la navegación y el contenido de las rutas hijas', () => {
    const fixture = crearComponente();

    expect(fixture.nativeElement.querySelector('app-barra-lateral-panel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Proyectos');
  });

  it('alterna la presentación de la barra lateral', () => {
    const fixture = crearComponente();
    const boton = fixture.nativeElement.querySelector(
      '.barra-lateral-panel__alternador',
    ) as HTMLButtonElement;

    boton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.layout-panel--colapsado')).toBeTruthy();
  });

  it('delega el cierre de sesión desde la barra lateral', () => {
    const fixture = crearComponente();
    const boton = fixture.nativeElement.querySelector(
      '.barra-lateral-panel__cerrar-sesion',
    ) as HTMLButtonElement;

    boton.click();

    expect(autenticacion.cerrarSesion).toHaveBeenCalledOnce();
  });

  function crearComponente(): ComponentFixture<PanelLayout> {
    const fixture = TestBed.createComponent(PanelLayout);
    fixture.detectChanges();
    return fixture;
  }
});
