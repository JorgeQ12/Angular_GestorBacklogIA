import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValorCatalogo } from '../../models/catalogo.model';
import { TablaOpcionesCatalogo } from './tabla-opciones-catalogo';

describe('TablaOpcionesCatalogo', () => {
  let fixture: ComponentFixture<TablaOpcionesCatalogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TablaOpcionesCatalogo] }).compileComponents();
    fixture = TestBed.createComponent(TablaOpcionesCatalogo);
    fixture.componentRef.setInput('opciones', OPCIONES);
    fixture.detectChanges();
  });

  it('presenta código, estado y nombres accesibles para cada opción', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.textContent).toContain('perfil_qa');
    expect(elemento.textContent).toContain('Inactivo');
    expect(elemento.querySelector('[aria-label="Editar opción QA"]')).toBeTruthy();
    expect(elemento.querySelector('[aria-label="Activar QA"]')).toBeTruthy();
  });

  it('emite la opción seleccionada y bloquea todas las acciones durante una operación', () => {
    const editar = jasmine.createSpy('editar');
    fixture.componentInstance.editarOpcion.subscribe(editar);
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[aria-label="Editar opción QA"]')
      ?.click();
    expect(editar).toHaveBeenCalledWith(OPCIONES[0]);

    fixture.componentRef.setInput('bloqueado', true);
    fixture.detectChanges();
    expect(
      [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')].every(
        (boton) => boton.disabled,
      ),
    ).toBe(true);
  });
});

const OPCIONES: readonly ValorCatalogo[] = [
  {
    id: 36,
    codigo: 'perfil_qa',
    nombre: 'QA',
    descripcion: 'Calidad',
    activo: false,
    catalogoTipoId: 6,
    catalogoTipoCodigo: 'identidad_perfil_tecnico',
    catalogoTipoNombre: 'Perfil técnico',
  },
];
