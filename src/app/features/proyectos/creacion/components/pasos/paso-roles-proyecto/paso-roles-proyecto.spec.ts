import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PasoRolesProyecto } from './paso-roles-proyecto';

describe('PasoRolesProyecto', () => {
  let fixture: ComponentFixture<PasoRolesProyecto>;
  let proyectoId: ReturnType<typeof signal<number | null>>;
  const rolesJson = '[{"nombre":"Administrador","descripcion":"Configura la solución."}]';
  const estadoCreacion = {
    proyectoId: () => proyectoId(),
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    proyectoId = signal<number | null>(42);
    estadoCreacion.cargar.mockReturnValue(of({ rolesJson }));
    estadoCreacion.guardarSeccion.mockReturnValue(of({ rolesJson }));

    await TestBed.configureTestingModule({
      imports: [PasoRolesProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PasoRolesProyecto);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('hidrata el formulario con los roles del borrador', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(obtenerControl(elemento, '#rol-nombre-0').value).toBe('Administrador');
    expect(obtenerControl(elemento, '#rol-descripcion-0').value).toBe('Configura la solución.');
  });

  it('guarda Roles y comunica que el recorrido puede continuar', () => {
    const completado = vi.fn();
    fixture.componentInstance.completado.subscribe(completado);
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
    expect(completado).toHaveBeenCalledOnce();
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
