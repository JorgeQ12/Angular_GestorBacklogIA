import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PanelAsistenteIA } from './panel-asistente-ia';

describe('PanelAsistenteIA', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PanelAsistenteIA],
      providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }],
    }),
  );

  it('envía el mensaje capturado y limpia el compositor inmediatamente', () => {
    const fixture = TestBed.createComponent(PanelAsistenteIA);
    fixture.componentRef.setInput('mensajes', []);
    fixture.componentRef.setInput('nombreSeccion', 'Necesidad de negocio');
    fixture.detectChanges();
    const emitido = vi.fn();
    fixture.componentInstance.mensajeEnviado.subscribe(emitido);
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    const formulario = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    textarea.value = 'Ayúdame a mejorar el impacto';
    textarea.dispatchEvent(new Event('input'));
    formulario.dispatchEvent(new Event('submit'));

    expect(emitido).toHaveBeenCalledWith('Ayúdame a mejorar el impacto');
    expect(textarea.value).toBe('');
  });

  it('no emite un mensaje vacío al enviar un formulario inválido', () => {
    const fixture = TestBed.createComponent(PanelAsistenteIA);
    fixture.componentRef.setInput('mensajes', []);
    fixture.componentRef.setInput('nombreSeccion', 'Necesidad de negocio');
    fixture.detectChanges();
    const emitido = vi.fn();
    fixture.componentInstance.mensajeEnviado.subscribe(emitido);

    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );

    expect(emitido).not.toHaveBeenCalled();
  });

  it('envía con Enter y permite una nueva línea con Shift + Enter', () => {
    const fixture = TestBed.createComponent(PanelAsistenteIA);
    fixture.componentRef.setInput('mensajes', []);
    fixture.componentRef.setInput('nombreSeccion', 'Necesidad de negocio');
    fixture.detectChanges();
    const emitido = vi.fn();
    fixture.componentInstance.mensajeEnviado.subscribe(emitido);
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    textarea.value = 'Analiza esta necesidad';
    textarea.dispatchEvent(new Event('input'));
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    textarea.dispatchEvent(enter);

    expect(enter.defaultPrevented).toBe(true);
    expect(emitido).toHaveBeenCalledWith('Analiza esta necesidad');
    expect(textarea.value).toBe('');

    emitido.mockClear();
    textarea.value = 'Primera línea';
    textarea.dispatchEvent(new Event('input'));
    const shiftEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    textarea.dispatchEvent(shiftEnter);

    expect(shiftEnter.defaultPrevented).toBe(false);
    expect(emitido).not.toHaveBeenCalled();
    expect(textarea.value).toBe('Primera línea');
  });

  it('deshabilita el formulario y bloquea Enter durante una operación remota', () => {
    const fixture = TestBed.createComponent(PanelAsistenteIA);
    fixture.componentRef.setInput('mensajes', []);
    fixture.componentRef.setInput('nombreSeccion', 'Necesidad de negocio');
    fixture.detectChanges();
    const emitido = vi.fn();
    fixture.componentInstance.mensajeEnviado.subscribe(emitido);
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    textarea.value = 'No debe enviarse todavía';
    textarea.dispatchEvent(new Event('input'));
    fixture.componentRef.setInput('cargando', true);
    fixture.detectChanges();
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );

    expect(textarea.disabled).toBe(true);
    expect(emitido).not.toHaveBeenCalled();

    fixture.componentRef.setInput('cargando', false);
    fixture.detectChanges();
    expect(textarea.disabled).toBe(false);
  });

  it('bloquea el compositor después de un error de carga hasta reintentar', () => {
    const fixture = TestBed.createComponent(PanelAsistenteIA);
    fixture.componentRef.setInput('mensajes', []);
    fixture.componentRef.setInput('nombreSeccion', 'Necesidad de negocio');
    fixture.componentRef.setInput('errorCarga', true);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    const boton = fixture.nativeElement.querySelector(
      '.panel-asistente__enviar',
    ) as HTMLButtonElement;

    expect(textarea.disabled).toBe(true);
    expect(boton.disabled).toBe(true);
  });

  it('presenta el mensaje del asistente y mantiene ocultas las etiquetas accesibles', () => {
    const fixture = TestBed.createComponent(PanelAsistenteIA);
    fixture.componentRef.setInput('nombreSeccion', 'Necesidad de negocio');
    fixture.componentRef.setInput('mensajes', []);
    fixture.detectChanges();
    fixture.componentRef.setInput('mensajes', [
      {
        id: 2,
        rol: 'asistente',
        texto: 'Cuéntame cuál es la situación actual del proceso.',
        orden: 2,
        fechaCreacion: '2026-09-04T12:00:00Z',
        seccionContexto: 'necesidad',
        revisionContexto: 1,
        propuesta: null,
      },
    ]);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const etiqueta = elemento.querySelector<HTMLLabelElement>('label[for="mensaje-asistente-ia"]');

    expect(elemento.textContent).toContain(
      'Cuéntame cuál es la situación actual del proceso.',
    );
    expect(etiqueta?.classList.contains('ui-visually-hidden')).toBe(true);
    expect(elemento.querySelector('.sr-only')).toBeNull();
  });

  it('presenta una propuesta legible y solicita confirmación explícita', () => {
    const fixture = TestBed.createComponent(PanelAsistenteIA);
    fixture.componentRef.setInput('nombreSeccion', 'Alcance');
    fixture.componentRef.setInput('mensajes', [
      {
        id: 9,
        rol: 'asistente',
        texto: 'Preparé una propuesta.',
        orden: 1,
        fechaCreacion: '2026-09-04T12:00:00Z',
        seccionContexto: 'alcance',
        revisionContexto: 4,
        propuesta: {
          seccion: 'alcance',
          resumen: 'Aclara los límites.',
          contenidoJson: '{}',
          estado: 'pendiente',
          detalles: [{ etiqueta: 'Incluido', valores: ['Seguimiento de envíos'] }],
        },
      },
    ]);
    fixture.detectChanges();
    const emitido = vi.fn();
    fixture.componentInstance.propuestaAplicada.subscribe(emitido);
    const botones = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      'button',
    );
    const boton = Array.from(botones).find(
      (item) => item.textContent?.trim() === 'Aplicar propuesta',
    ) as HTMLButtonElement;

    boton.click();

    expect(fixture.nativeElement.textContent).toContain('Seguimiento de envíos');
    expect(emitido).toHaveBeenCalledWith(9);
  });

  it('bloquea las decisiones de propuesta mientras existe otra operación remota', () => {
    const fixture = TestBed.createComponent(PanelAsistenteIA);
    fixture.componentRef.setInput('nombreSeccion', 'Alcance');
    fixture.componentRef.setInput('mensajes', [
      {
        id: 9,
        rol: 'asistente',
        texto: 'Preparé una propuesta.',
        orden: 1,
        fechaCreacion: '2026-09-04T12:00:00Z',
        seccionContexto: 'alcance',
        revisionContexto: 4,
        propuesta: {
          seccion: 'alcance',
          resumen: 'Aclara los límites.',
          contenidoJson: '{}',
          estado: 'pendiente',
          detalles: [],
        },
      },
    ]);
    fixture.componentRef.setInput('enviando', true);
    fixture.detectChanges();

    const botones = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.propuesta-ia__acciones button',
      ),
    );

    expect(botones).toHaveLength(2);
    expect(botones.every((boton) => boton.disabled)).toBe(true);
  });
});
