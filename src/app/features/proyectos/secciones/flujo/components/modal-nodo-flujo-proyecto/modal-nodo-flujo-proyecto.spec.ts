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

    expect(estado.flujo().nodos).toHaveLength(0);
  });

  it('normaliza y crea la decisión después de completar sus campos obligatorios', () => {
    escribir('#flujo-decision-titulo', ' ¿La solicitud es válida? ');
    escribir('#flujo-descripcion', ' Evalúa la información. ');
    escribir('#flujo-criterio-0', ' Dirige a Sí o No. ');
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));

    expect(estado.flujo().nodos[0]).toMatchObject({
      tipo: TipoBloqueFlujo.Decision,
      titulo: '¿La solicitud es válida?',
      descripcion: 'Evalúa la información.',
      criteriosAceptacion: ['Dirige a Sí o No.'],
      idsRoles: [],
    });
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
