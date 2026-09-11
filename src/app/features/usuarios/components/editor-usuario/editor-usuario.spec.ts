import { TestBed } from '@angular/core/testing';
import type { FormGroup } from '@angular/forms';
import type { Usuario } from '../../models/usuario.model';
import { EditorUsuario } from './editor-usuario';

describe('Editor de usuario', () => {
  const perfiles = [{ id: 36, nombre: 'QA', descripcion: 'Aseguramiento de calidad' }];
  const usuario: Usuario = {
    id: 12,
    idAzure: 'azure-12',
    nombre: 'Ana Torres',
    correo: 'ana@empresa.com',
    perfilTecnicoId: 36,
    perfilTecnicoCodigo: 'perfil_qa',
    perfilTecnicoNombre: 'QA',
    limiteTokensMensual: 250000,
    activo: true,
    fechaCreacion: '2026-09-10T10:00:00Z',
    fechaActualizacion: null,
  };

  function crear(entidad: Usuario | null = null) {
    const fixture = TestBed.createComponent(EditorUsuario);
    fixture.componentRef.setInput('perfilesTecnicos', perfiles);
    fixture.componentRef.setInput('usuario', entidad);
    fixture.detectChanges();
    return fixture;
  }

  it('rechaza el envío incompleto y presenta mensajes específicos', () => {
    const fixture = crear();
    const emitir = vi.fn();
    fixture.componentInstance.guardar.subscribe(emitir);

    enviar(fixture.nativeElement);
    fixture.detectChanges();

    expect(emitir).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('La identidad de Azure es obligatoria.');
    expect(fixture.nativeElement.textContent).toContain('El nombre es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('Selecciona un perfil técnico.');
  });

  it('normaliza y emite los datos válidos con límite mensual opcional', () => {
    const fixture = crear();
    const emitir = vi.fn();
    fixture.componentInstance.guardar.subscribe(emitir);
    const formulario = obtenerFormulario(fixture.componentInstance);
    formulario.setValue({
      idAzure: '  azure-20  ',
      nombre: '  Laura Díaz  ',
      correo: '  laura@empresa.com  ',
      perfilTecnicoId: 36,
      limiteTokensMensual: null,
    });

    enviar(fixture.nativeElement);

    expect(emitir).toHaveBeenCalledWith({
      idAzure: 'azure-20',
      nombre: 'Laura Díaz',
      correo: 'laura@empresa.com',
      perfilTecnicoId: 36,
      limiteTokensMensual: null,
    });
  });

  it('valida correo, enteros no negativos y límites reales de texto', () => {
    const fixture = crear();
    const formulario = obtenerFormulario(fixture.componentInstance);
    formulario.setValue({
      idAzure: 'a'.repeat(201),
      nombre: 'Ana',
      correo: 'correo-invalido',
      perfilTecnicoId: 36,
      limiteTokensMensual: -1.5,
    });

    enviar(fixture.nativeElement);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('200 caracteres');
    expect(fixture.nativeElement.textContent).toContain('Ingresa un correo válido.');
    expect(fixture.nativeElement.textContent).toContain('no puede ser negativo');
  });

  it('hidrata la edición, mantiene Azure en lectura y bloquea durante el guardado', () => {
    const fixture = crear(usuario);
    const emitir = vi.fn();
    fixture.componentInstance.guardar.subscribe(emitir);
    const identidad = fixture.nativeElement.querySelector('#usuario-id-azure') as HTMLInputElement;

    expect(identidad.value).toBe('azure-12');
    expect(identidad.readOnly).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('La identidad Azure no puede cambiarse.');

    fixture.componentRef.setInput('ocupado', true);
    fixture.detectChanges();
    expect(identidad.disabled).toBe(true);
    expect(
      (fixture.nativeElement.querySelector('#usuario-nombre') as HTMLInputElement).disabled,
    ).toBe(true);
    enviar(fixture.nativeElement);
    expect(emitir).not.toHaveBeenCalled();

    fixture.componentRef.setInput('ocupado', false);
    fixture.detectChanges();
    expect(identidad.disabled).toBe(false);
    expect(identidad.value).toBe('azure-12');
  });

  it('exige reemplazar un perfil que ya no está activo antes de editar', () => {
    const fixture = crear({ ...usuario, perfilTecnicoId: 99, perfilTecnicoNombre: 'Legado' });
    const formulario = obtenerFormulario(fixture.componentInstance);

    expect(formulario.get('perfilTecnicoId')?.value).toBeNull();
    enviar(fixture.nativeElement);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Selecciona un perfil técnico.');
  });
});

function obtenerFormulario(componente: EditorUsuario): FormGroup {
  return (componente as unknown as { formulario: FormGroup }).formulario;
}

function enviar(root: HTMLElement): void {
  root
    .querySelector('form')
    ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}
