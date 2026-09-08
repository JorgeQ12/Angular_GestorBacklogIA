import { TestBed } from '@angular/core/testing';
import { ClaseCatalogo } from '../../models/catalogo.model';
import { EditorCatalogo } from './editor-catalogo';

describe('Editor de catálogo', () => {
  function crear() {
    const fixture = TestBed.createComponent(EditorCatalogo);
    fixture.componentRef.setInput('contexto', { clase: ClaseCatalogo.Tipo, entidad: null });
    fixture.detectChanges();
    return fixture;
  }
  it('rechaza campos vacíos y presenta mensajes específicos', () => {
    const fixture = crear();
    const emit = vi.fn();
    fixture.componentInstance.guardar.subscribe(emit);
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(emit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Define el nombre y la descripción del nuevo catálogo.',
    );
    expect(fixture.nativeElement.textContent).toContain('El nombre es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('La descripción es obligatoria.');
  });
  it('envía valores recortados mediante el botón externo del modal', () => {
    const fixture = crear();
    const emit = vi.fn();
    fixture.componentInstance.guardar.subscribe(emit);
    escribir(fixture.nativeElement, '#catalogo-nombre', '  Área  ');
    escribir(fixture.nativeElement, '#catalogo-descripcion', '  Operación  ');
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    expect(emit).toHaveBeenCalledWith({ nombre: 'Área', descripcion: 'Operación' });
  });
  it('rechaza espacios y el límite real del backend', () => {
    const fixture = crear();
    const emit = vi.fn();
    fixture.componentInstance.guardar.subscribe(emit);
    escribir(fixture.nativeElement, '#catalogo-nombre', 'a'.repeat(101));
    escribir(fixture.nativeElement, '#catalogo-descripcion', '   ');
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    expect(emit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('100 caracteres');
  });
  it('hidrata la edición y bloquea controles, cancelación y submit durante guardado', () => {
    const fixture = crear();
    const emit = vi.fn();
    fixture.componentInstance.guardar.subscribe(emit);
    fixture.componentRef.setInput('contexto', {
      clase: ClaseCatalogo.Tipo,
      entidad: { id: 1, nombre: 'Área', descripcion: 'Operación', activo: false },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').value).toBe('Área');
    expect(fixture.nativeElement.textContent).toContain(
      'Actualiza el nombre y la descripción de Área.',
    );
    fixture.componentRef.setInput('ocupado', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('textarea').disabled).toBe(true);
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    expect(emit).not.toHaveBeenCalled();
    fixture.componentRef.setInput('ocupado', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('input').value).toBe('Área');
  });
});
function escribir(root: HTMLElement, selector: string, valor: string) {
  const input = root.querySelector<HTMLInputElement>(selector)!;
  input.value = valor;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
