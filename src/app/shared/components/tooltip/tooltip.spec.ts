import { TestBed } from '@angular/core/testing';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  it('asocia el disparador con la ayuda y conserva su posición', () => {
    const fixture = TestBed.createComponent(Tooltip);
    fixture.componentRef.setInput('texto', 'Usa snake_case.');
    fixture.componentRef.setInput('etiqueta', 'Ayuda sobre el código');
    fixture.componentRef.setInput('posicion', 'derecha');
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const trigger = elemento.querySelector<HTMLButtonElement>('.ui-tooltip__trigger')!;
    const contenido = elemento.querySelector<HTMLElement>('[role="tooltip"]')!;

    expect(trigger.type).toBe('button');
    expect(trigger.getAttribute('aria-label')).toBe('Ayuda sobre el código');
    expect(trigger.getAttribute('aria-describedby')).toBe(contenido.id);
    expect(contenido.textContent).toContain('Usa snake_case.');
    expect(elemento.querySelector('.ui-tooltip')?.getAttribute('data-posicion')).toBe('derecha');
  });

  it('retira el foco al presionar Escape', () => {
    const fixture = TestBed.createComponent(Tooltip);
    fixture.componentRef.setInput('texto', 'Ayuda contextual');
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(document.activeElement).not.toBe(trigger);
  });
});
