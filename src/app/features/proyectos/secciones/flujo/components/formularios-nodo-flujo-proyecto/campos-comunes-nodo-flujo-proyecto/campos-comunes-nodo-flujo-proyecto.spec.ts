import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccionPermisoModulo } from '../../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../../services/estado-editor-flujo-proyecto.service';
import { crearFormularioNodoFlujoPrueba } from '../../../testing/formulario-nodo-flujo-proyecto.fixture';
import { CamposComunesNodoFlujoProyecto } from './campos-comunes-nodo-flujo-proyecto';

describe('CamposComunesNodoFlujoProyecto', () => {
  let fixture: ComponentFixture<CamposComunesNodoFlujoProyecto>;
  const formulario = crearFormularioNodoFlujoPrueba();
  const roles = [{ id: 'rol-1', nombre: 'Administrador', descripcion: 'Administra' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CamposComunesNodoFlujoProyecto],
      providers: [
        {
          provide: EstadoEditorFlujoProyectoService,
          useValue: {
            roles: signal(roles).asReadonly(),
            obtenerNombreRol: (id: string) => roles.find((rol) => rol.id === id)?.nombre ?? '',
          },
        },
      ],
    }).compileComponents();
    formulario.reset();
    while (formulario.controls.criteriosAceptacion.length > 1) {
      formulario.controls.criteriosAceptacion.removeAt(1);
    }
    fixture = TestBed.createComponent(CamposComunesNodoFlujoProyecto);
    fixture.componentRef.setInput('formulario', formulario);
    fixture.detectChanges();
  });

  it('agrega y elimina criterios sin permitir retirar la última fila', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    [...elemento.querySelectorAll<HTMLButtonElement>('button')]
      .find((boton) => boton.textContent?.includes('Agregar criterio'))
      ?.click();
    fixture.detectChanges();
    expect(formulario.controls.criteriosAceptacion.length).toBe(2);

    elemento.querySelector<HTMLButtonElement>('[aria-label="Eliminar criterio de aceptación 2"]')?.click();
    fixture.detectChanges();
    expect(formulario.controls.criteriosAceptacion.length).toBe(1);
  });

  it('sincroniza la selección de rol y sus permisos con el formulario', () => {
    fixture.componentRef.setInput('usarPermisosRoles', true);
    fixture.detectChanges();
    const control = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#flujo-rol-rol-1',
    )!;
    control.checked = true;
    control.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(formulario.controls.permisosRoles.value).toEqual([
      { idRol: 'rol-1', permisos: [AccionPermisoModulo.Ver] },
    ]);
    expect(formulario.controls.nombresRoles.value).toBe('Administrador');
  });

  it('mantiene la última fila de criterios al intentar eliminarla', () => {
    const componente = fixture.componentInstance as unknown as {
      eliminarCriterioAceptacion: (indice: number) => void;
    };

    componente.eliminarCriterioAceptacion(0);

    expect(formulario.controls.criteriosAceptacion.length).toBe(1);
  });

  it('ignora el cambio de rol cuando el evento no procede de un checkbox', () => {
    const componente = fixture.componentInstance as unknown as {
      cambiarSeleccionRol: (rol: { id: string; nombre: string }, evento: Event) => void;
    };

    componente.cambiarSeleccionRol(roles[0], { target: null } as unknown as Event);

    expect(formulario.controls.nombresRoles.value).toBe('');
  });

  it('retira el rol cuando se desmarca su último permiso', () => {
    fixture.componentRef.setInput('usarPermisosRoles', true);
    fixture.detectChanges();
    const componente = fixture.componentInstance as unknown as {
      cambiarSeleccionRol: (rol: { id: string; nombre: string }, evento: Event) => void;
      alternarPermiso: (idRol: string, permiso: AccionPermisoModulo) => void;
      estaSeleccionadoRol: (idRol: string) => boolean;
    };

    componente.cambiarSeleccionRol(roles[0], {
      target: { checked: true } as HTMLInputElement,
    } as unknown as Event);
    componente.alternarPermiso('rol-1', AccionPermisoModulo.Ver);

    expect(componente.estaSeleccionadoRol('rol-1')).toBe(false);
    expect(formulario.controls.permisosRoles.value).toEqual([]);
  });

  it('no reporta permiso para un rol que no está seleccionado', () => {
    const componente = fixture.componentInstance as unknown as {
      tienePermiso: (idRol: string, permiso: AccionPermisoModulo) => boolean;
    };

    expect(componente.tienePermiso('rol-inexistente', AccionPermisoModulo.Ver)).toBe(false);
  });
});
