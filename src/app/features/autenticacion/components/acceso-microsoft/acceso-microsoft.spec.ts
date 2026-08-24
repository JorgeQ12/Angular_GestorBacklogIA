import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccesoMicrosoft } from './acceso-microsoft';

describe('AccesoMicrosoft', () => {
  let fixture: ComponentFixture<AccesoMicrosoft>;
  let componente: AccesoMicrosoft;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesoMicrosoft],
    }).compileComponents();

    fixture = TestBed.createComponent(AccesoMicrosoft);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('presenta la acción de acceso corporativo', () => {
    const boton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const icono = boton.querySelector('.acceso-microsoft__icono') as HTMLImageElement;

    expect(boton.textContent).toContain('Iniciar sesión con Microsoft');
    expect(boton.type).toBe('button');
    expect(icono.getAttribute('src')).toBe('/brand/microsoft.svg');
    expect(icono.alt).toBe('');
  });

  it('emite la solicitud al seleccionar el botón', () => {
    let solicitudes = 0;
    const suscripcion = componente.iniciarSesion.subscribe(() => solicitudes++);

    obtenerBoton().click();

    expect(solicitudes).toBe(1);
    suscripcion.unsubscribe();
  });

  it('deshabilita la acción mientras autentica', () => {
    fixture.componentRef.setInput('autenticando', true);
    fixture.detectChanges();

    expect(obtenerBoton().disabled).toBe(true);
    expect(obtenerBoton().textContent).toContain('Esperando a Microsoft');
  });

  function obtenerBoton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }
});
