import { FormGroup } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import type { DatosUsuario, Usuario } from '../../models/usuario.model';
import { EditorUsuario } from './editor-usuario';

describe('Editor de usuario', () => {
  const perfiles = [{ valor: 32, etiqueta: 'Arquitectura' }];
  const usuario: Usuario = {
    id: 7,
    idAzure: 'azure-7',
    nombre: 'Ada Lovelace',
    correo: 'ada@empresa.com',
    perfilTecnicoId: 32,
    perfilTecnicoCodigo: 'perfil_arquitectura',
    perfilTecnicoNombre: 'Arquitectura',
    limiteTokensMensual: 100000,
    activo: true,
    fechaCreacion: '2026-09-01T12:00:00Z',
    fechaActualizacion: null,
  };

  const crear = (entidad: Usuario | null = null, ocupado = false) => {
    const fixture = TestBed.createComponent(EditorUsuario);
    fixture.componentRef.setInput('contexto', { entidad });
    fixture.componentRef.setInput('perfilesTecnicos', perfiles);
    fixture.componentRef.setInput('ocupado', ocupado);
    fixture.detectChanges();
    return fixture;
  };

  it('rechaza el formulario vacío y presenta mensajes accesibles', () => {
    const fixture = crear();
    const emitir = vi.fn();
    fixture.componentInstance.guardar.subscribe(emitir);

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitir).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('El identificador de Azure es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('El nombre es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('Selecciona un perfil técnico.');
  });

  it('normaliza y emite un alta válida', () => {
    const fixture = crear();
    const emitir = vi.fn();
    fixture.componentInstance.guardar.subscribe(emitir);
    const formulario = Reflect.get(fixture.componentInstance, 'formulario') as FormGroup;
    formulario.setValue({
      idAzure: ' azure-7 ',
      nombre: ' Ada Lovelace ',
      correo: 'ada@empresa.com',
      perfilTecnicoId: 32,
      limiteTokensMensual: 0,
    });

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(emitir).toHaveBeenCalledWith({
      idAzure: 'azure-7',
      nombre: 'Ada Lovelace',
      correo: 'ada@empresa.com',
      perfilTecnicoId: 32,
      limiteTokensMensual: 0,
    } satisfies DatosUsuario);
  });

  it('hidrata la edición, bloquea IdAzure y deshabilita todo durante el guardado', () => {
    const fixture = crear(usuario, true);
    const identidad = fixture.nativeElement.querySelector('#usuario-id-azure') as HTMLInputElement;
    const nombre = fixture.nativeElement.querySelector('#usuario-nombre') as HTMLInputElement;

    expect(fixture.nativeElement.textContent).toContain('Editar usuario');
    expect(identidad.value).toBe('azure-7');
    expect(identidad.readOnly).toBe(true);
    expect(nombre.value).toBe('Ada Lovelace');
    expect(nombre.disabled).toBe(true);
  });

  it('rechaza límites negativos y fraccionarios', () => {
    const fixture = crear();
    const formulario = Reflect.get(fixture.componentInstance, 'formulario') as FormGroup;
    const limite = formulario.get('limiteTokensMensual')!;

    limite.setValue(-1);
    expect(limite.hasError('min')).toBe(true);
    limite.setValue(1.5);
    expect(limite.hasError('entero')).toBe(true);
  });
});
