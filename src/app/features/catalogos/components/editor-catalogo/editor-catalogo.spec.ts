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
    const emit = jasmine.createSpy('emit');
    fixture.componentInstance.guardar.subscribe(emit);
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(emit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Define el código, el nombre y la descripción del nuevo catálogo.',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Usa snake_case y antepone el nombre del módulo. Ejemplo: gestion_producto_prioridad.',
    );
    expect(fixture.nativeElement.textContent).toContain('El código es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('El nombre es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('La descripción es obligatoria.');
  });
  it('envía valores recortados mediante el botón externo del modal', () => {
    const fixture = crear();
    const emit = jasmine.createSpy('emit');
    fixture.componentInstance.guardar.subscribe(emit);
    escribir(fixture.nativeElement, '#catalogo-codigo', '  gestion_area  ');
    escribir(fixture.nativeElement, '#catalogo-nombre', '  Área  ');
    escribir(fixture.nativeElement, '#catalogo-descripcion', '  Operación  ');
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    expect(emit).toHaveBeenCalledWith({
      codigo: 'gestion_area',
      nombre: 'Área',
      descripcion: 'Operación',
    });
  });
  it('solicita un código al crear una opción del catálogo seleccionado', () => {
    const fixture = crear();
    const emit = jasmine.createSpy('emit');
    fixture.componentRef.setInput('contexto', {
      clase: ClaseCatalogo.Valor,
      entidad: null,
      padre: {
        id: 1,
        codigo: 'gestion_area',
        nombre: 'Área',
        descripcion: 'Operación',
        activo: true,
      },
    });
    fixture.componentInstance.guardar.subscribe(emit);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Agrega una opción reutilizable al catálogo Área y asígnale un código.',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Usa snake_case y antepone el nombre del catálogo padre. Ejemplo: prioridad_alta.',
    );
    escribir(fixture.nativeElement, '#catalogo-codigo', 'area_logistica');
    escribir(fixture.nativeElement, '#catalogo-nombre', 'Logística');
    escribir(fixture.nativeElement, '#catalogo-descripcion', 'Operación logística');
    fixture.nativeElement.querySelector('button[type="submit"]').click();

    expect(emit).toHaveBeenCalledWith({
      codigo: 'area_logistica',
      nombre: 'Logística',
      descripcion: 'Operación logística',
    });
  });
  it('rechaza espacios, códigos ajenos a snake_case y los límites reales del backend', () => {
    const fixture = crear();
    const emit = jasmine.createSpy('emit');
    fixture.componentInstance.guardar.subscribe(emit);
    escribir(fixture.nativeElement, '#catalogo-codigo', 'Gestión Área');
    escribir(fixture.nativeElement, '#catalogo-nombre', 'a'.repeat(101));
    escribir(fixture.nativeElement, '#catalogo-descripcion', '   ');
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    expect(emit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('100 caracteres');
    expect(fixture.nativeElement.textContent).toContain('Usa snake_case');
  });
  it('hidrata la edición y bloquea controles, cancelación y submit durante guardado', () => {
    const fixture = crear();
    const emit = jasmine.createSpy('emit');
    fixture.componentInstance.guardar.subscribe(emit);
    fixture.componentRef.setInput('contexto', {
      clase: ClaseCatalogo.Tipo,
      entidad: {
        id: 1,
        codigo: 'gestion_area',
        nombre: 'Área',
        descripcion: 'Operación',
        activo: false,
      },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#catalogo-codigo').value).toBe('gestion_area');
    expect(fixture.nativeElement.querySelector('#catalogo-codigo').readOnly).toBe(true);
    expect(fixture.nativeElement.querySelector('#catalogo-nombre').value).toBe('Área');
    expect(fixture.nativeElement.textContent).toContain(
      'Actualiza el nombre y la descripción de Área. El código es inmutable.',
    );
    expect(fixture.nativeElement.querySelector('app-tooltip')).toBeNull();
    fixture.componentRef.setInput('ocupado', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#catalogo-codigo').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('textarea').disabled).toBe(true);
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    expect(emit).not.toHaveBeenCalled();
    fixture.componentRef.setInput('ocupado', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#catalogo-codigo').disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('#catalogo-codigo').readOnly).toBe(true);
    expect(fixture.nativeElement.querySelector('#catalogo-nombre').value).toBe('Área');
  });
});
function escribir(root: HTMLElement, selector: string, valor: string) {
  const input = root.querySelector<HTMLInputElement>(selector)!;
  input.value = valor;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
