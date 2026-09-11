import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoBloqueFlujo } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { ModalNodoFlujoProyecto } from './modal-nodo-flujo-proyecto';

describe('ModalNodoFlujoProyecto', () => {
  let fixture: ComponentFixture<ModalNodoFlujoProyecto>;
  let estado: EstadoEditorFlujoProyectoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNodoFlujoProyecto],
      providers: [EstadoEditorFlujoProyectoService],
    }).compileComponents();
    estado = TestBed.inject(EstadoEditorFlujoProyectoService);
    estado.iniciarCreacionNodo(TipoBloqueFlujo.Decision);
    fixture = TestBed.createComponent(ModalNodoFlujoProyecto);
    fixture.detectChanges();
  });

  it('presenta el formulario especializado y no guarda datos inválidos', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.textContent).toContain('Configurar decisión');
    expect(elemento.querySelector('app-formulario-decision-flujo-proyecto')).toBeTruthy();

    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));

    expect(estado.flujo().nodos.length).toBe(0);
  });

  it('normaliza y crea la decisión después de completar sus campos obligatorios', () => {
    escribir('#flujo-decision-titulo', ' ¿La solicitud es válida? ');
    escribir('#flujo-descripcion', ' Evalúa la información. ');
    escribir('#flujo-criterio-0', ' Dirige a Sí o No. ');
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));

    expect(estado.flujo().nodos[0]).toEqual(
      jasmine.objectContaining({
        tipo: TipoBloqueFlujo.Decision,
        titulo: '¿La solicitud es válida?',
        descripcion: 'Evalúa la información.',
        criteriosAceptacion: ['Dirige a Sí o No.'],
        idsRoles: [],
      }),
    );
  });

  it('cancela el borrador al cerrar el modal', () => {
    const cancelar = spyOn(estado, 'cancelarBorradorNodo');

    (fixture.componentInstance as unknown as { cerrar: () => void }).cerrar();

    expect(cancelar).toHaveBeenCalled();
  });

  it('presenta los textos de creación mientras se crea un bloque', () => {
    const componente = fixture.componentInstance as unknown as {
      encabezadoModal: () => string;
      textoAccionPrincipal: () => string;
      tituloModal: () => string;
      descripcionModal: () => string;
      etiquetaTipo: () => string;
      descripcionTipo: () => string;
    };

    expect(componente.encabezadoModal()).toBe('Nuevo bloque del flujo');
    expect(componente.textoAccionPrincipal()).toBe('Crear bloque');
    expect(componente.tituloModal()).toContain('Configurar');
    expect(componente.descripcionModal()).toContain('Completa');
    expect(componente.etiquetaTipo()).not.toBe('');
    expect(componente.descripcionTipo()).not.toBe('');
  });

  it('presenta los textos de edición al abrir un bloque existente', () => {
    escribir('#flujo-decision-titulo', '¿Es válida?');
    escribir('#flujo-descripcion', 'Evalúa.');
    escribir('#flujo-criterio-0', 'Sí o No.');
    (fixture.nativeElement as HTMLElement).querySelector('form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const idNodo = estado.flujo().nodos[0].id;
    estado.abrirEditorNodo(idNodo);
    fixture.detectChanges();

    const componente = fixture.componentInstance as unknown as {
      encabezadoModal: () => string;
      textoAccionPrincipal: () => string;
      tituloModal: () => string;
      descripcionModal: () => string;
      formulario: () => { getRawValue: () => { titulo: string } };
    };

    expect(componente.encabezadoModal()).toBe('Edición del bloque');
    expect(componente.textoAccionPrincipal()).toBe('Guardar cambios');
    expect(componente.tituloModal()).toContain('Editar');
    expect(componente.descripcionModal()).toContain('Actualiza');
    expect(componente.formulario().getRawValue().titulo).toBe('¿Es válida?');
  });

  function escribir(selector: string, valor: string): void {
    const control = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement | HTMLTextAreaElement>(
      selector,
    );
    if (!control) throw new Error(`No se encontró ${selector}`);
    control.value = valor;
    control.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
});
