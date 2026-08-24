import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoError } from './estado-error';

describe('EstadoError', () => {
  let fixture: ComponentFixture<EstadoError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EstadoError] }).compileComponents();

    fixture = TestBed.createComponent(EstadoError);
    fixture.componentRef.setInput('reintentable', true);
    fixture.detectChanges();
  });

  it('presenta una falla genérica sin depender de una feature', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('[role="alert"]')).toBeTruthy();
    expect(elemento.querySelector('.ui-error-state__title')?.textContent).toContain(
      'No fue posible obtener la información',
    );
    expect(elemento.querySelector('app-icono')).toBeTruthy();
    expect(elemento.querySelector('.ui-error-state__retry app-icono')).toBeTruthy();
  });
});
