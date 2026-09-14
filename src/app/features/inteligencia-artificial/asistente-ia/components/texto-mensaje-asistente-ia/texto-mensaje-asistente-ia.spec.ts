import { TestBed } from '@angular/core/testing';
import { TextoMensajeAsistenteIA } from './texto-mensaje-asistente-ia';

describe('TextoMensajeAsistenteIA', () => {
  it('presenta listas numeradas y negritas sin mostrar la sintaxis Markdown', () => {
    const fixture = TestBed.createComponent(TextoMensajeAsistenteIA);
    fixture.componentRef.setInput(
      'texto',
      [
        'Confirma estos detalles:',
        '',
        '1. **Situación actual**: ¿Cómo gestionan las solicitudes?',
        '',
        '2. **Problemas principales**: ¿Cuáles son los inconvenientes?',
      ].join('\n'),
    );
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const elementosLista = elemento.querySelectorAll('ol li');
    const resaltados = elemento.querySelectorAll('strong');

    expect(elementosLista.length).toBe(2);
    expect(resaltados.length).toBe(2);
    expect(resaltados[0].textContent).toBe('Situación actual');
    expect(elemento.textContent).not.toContain('**');
  });

  it('presenta viñetas como una lista semántica', () => {
    const fixture = TestBed.createComponent(TextoMensajeAsistenteIA);
    fixture.componentRef.setInput('texto', '- Primer punto\n- Segundo punto');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('ul li').length).toBe(2);
  });

  it('mantiene cualquier HTML recibido como texto sin crear elementos ejecutables', () => {
    const fixture = TestBed.createComponent(TextoMensajeAsistenteIA);
    fixture.componentRef.setInput('texto', '<img src=x onerror=alert(1)> **Contenido seguro**');
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('img')).toBeNull();
    expect(elemento.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(elemento.querySelector('strong')?.textContent).toBe('Contenido seguro');
  });
});
