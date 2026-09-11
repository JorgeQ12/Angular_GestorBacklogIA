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
    const editar = vi.fn();
    const cambiarEstado = vi.fn();
    fixture.componentRef.setInput('usuarios', [usuario]);
    fixture.componentInstance.editarUsuario.subscribe(editar);
    fixture.componentInstance.cambiarEstadoUsuario.subscribe(cambiarEstado);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sin correo');
    expect(fixture.nativeElement.textContent).toContain('Sin límite');
    expect(fixture.nativeElement.textContent).toContain('Inactivo');
    (fixture.nativeElement.querySelector('[aria-label="Editar usuario Ada Lovelace"]') as HTMLButtonElement).click();
    (fixture.nativeElement.querySelector('[aria-label="Activar Ada Lovelace"]') as HTMLButtonElement).click();
    expect(editar).toHaveBeenCalledWith(usuario);
    expect(cambiarEstado).toHaveBeenCalledWith(usuario);
  });

  it('bloquea todas las acciones durante una operación remota', () => {
    const fixture = TestBed.createComponent(TablaUsuarios);
    fixture.componentRef.setInput('usuarios', [usuario]);
    fixture.componentRef.setInput('bloqueado', true);
    fixture.detectChanges();

    const acciones = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(Array.from(acciones).every((accion) => accion.disabled)).toBe(true);
  });
});
