import { TestBed } from '@angular/core/testing';
import type { Usuario } from '../../models/usuario.model';
import { TablaUsuarios } from './tabla-usuarios';

describe('Tabla de usuarios', () => {
  const usuario: Usuario = {
    id: 7,
    idAzure: 'azure-7',
    nombre: 'Ada Lovelace',
    correo: null,
    perfilTecnicoId: 32,
    perfilTecnicoCodigo: 'perfil_arquitectura',
    perfilTecnicoNombre: 'Arquitectura',
    limiteTokensMensual: null,
    activo: false,
    fechaCreacion: '2026-09-01T12:00:00Z',
    fechaActualizacion: null,
  };

  it('presenta valores opcionales y emite acciones por usuario', () => {
    const fixture = TestBed.createComponent(TablaUsuarios);
    const editar = jasmine.createSpy('editar');
    const cambiarEstado = jasmine.createSpy('cambiarEstado');
    fixture.componentRef.setInput('usuarios', [usuario]);
    fixture.componentRef.setInput('paginaActual', 1);
    fixture.componentRef.setInput('totalPaginas', 1);
    fixture.componentInstance.editarUsuario.subscribe(editar);
    fixture.componentInstance.cambiarEstadoUsuario.subscribe(cambiarEstado);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sin correo');
    expect(fixture.nativeElement.textContent).toContain('Sin límite');
    expect(fixture.nativeElement.textContent).toContain('Inactivo');
    (
      fixture.nativeElement.querySelector(
        '[aria-label="Editar usuario Ada Lovelace"]',
      ) as HTMLButtonElement
    ).click();
    (
      fixture.nativeElement.querySelector(
        '[aria-label="Activar Ada Lovelace"]',
      ) as HTMLButtonElement
    ).click();
    expect(editar).toHaveBeenCalledWith(usuario);
    expect(cambiarEstado).toHaveBeenCalledWith(usuario);
  });

  it('bloquea todas las acciones durante una operación remota', () => {
    const fixture = TestBed.createComponent(TablaUsuarios);
    fixture.componentRef.setInput('usuarios', [usuario]);
    fixture.componentRef.setInput('paginaActual', 1);
    fixture.componentRef.setInput('totalPaginas', 2);
    fixture.componentRef.setInput('bloqueado', true);
    fixture.detectChanges();

    const acciones = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(Array.from(acciones).every((accion) => accion.disabled)).toBe(true);
  });

  it('emite navegación únicamente hacia páginas disponibles', () => {
    const fixture = TestBed.createComponent(TablaUsuarios);
    const paginaCambiada = jasmine.createSpy('paginaCambiada');
    fixture.componentRef.setInput('usuarios', [usuario]);
    fixture.componentRef.setInput('paginaActual', 2);
    fixture.componentRef.setInput('totalPaginas', 3);
    fixture.componentInstance.paginaCambiada.subscribe(paginaCambiada);
    fixture.detectChanges();

    const botones = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.tabla-usuarios__paginacion button',
      ),
    );
    botones[0].click();
    botones[1].click();

    expect(paginaCambiada.calls.allArgs()).toEqual([[{ pagina: 1 }], [{ pagina: 3 }]]);
  });
});
