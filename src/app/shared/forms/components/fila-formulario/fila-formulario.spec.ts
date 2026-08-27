import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilaFormulario } from './fila-formulario';

describe('FilaFormulario', () => {
  let fixture: ComponentFixture<FilaFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FilaFormulario] }).compileComponents();
    fixture = TestBed.createComponent(FilaFormulario);
    fixture.componentRef.setInput('numero', 2);
    fixture.componentRef.setInput('etiquetaEliminar', 'Eliminar elemento 2');
    fixture.detectChanges();
  });

  it('presenta la posición y comunica la eliminación', () => {
    const eliminar = vi.fn();
    fixture.componentInstance.eliminar.subscribe(eliminar);

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('.fila-formulario__numero')?.textContent).toBe('2');
    (elemento.querySelector('button') as HTMLButtonElement).click();

    expect(eliminar).toHaveBeenCalledOnce();
  });

  it('bloquea la acción cuando el elemento no puede eliminarse', () => {
    fixture.componentRef.setInput('eliminable', false);
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
    expect(boton.getAttribute('aria-label')).toBe('Eliminar elemento 2');
  });
});
