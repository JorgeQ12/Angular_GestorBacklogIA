import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MensajesService } from '../../../../../../core/mensajes/services/mensajes.service';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { LienzoFlujoProyecto } from './lienzo-flujo-proyecto';

describe('LienzoFlujoProyecto', () => {
  let fixture: ComponentFixture<LienzoFlujoProyecto>;
  let estado: EstadoEditorFlujoProyectoService;

  beforeEach(async () => {
    spyOn(Element.prototype, 'setPointerCapture').and.stub();
    spyOn(Element.prototype, 'releasePointerCapture').and.stub();
    spyOn(Element.prototype, 'hasPointerCapture').and.returnValue(false);
    await TestBed.configureTestingModule({
      imports: [LienzoFlujoProyecto],
      providers: [
        EstadoEditorFlujoProyectoService,
        { provide: MensajesService, useValue: { confirmarDestructiva: jasmine.createSpy('confirmarDestructiva') } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LienzoFlujoProyecto);
    estado = TestBed.inject(EstadoEditorFlujoProyectoService);
    fixture.detectChanges();
  });

  it('presenta el estado vacío y emite la generación con IA', () => {
    const generar = jasmine.createSpy();
    fixture.componentInstance.generarConIASolicitado.subscribe(generar);
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (actual) => actual.textContent?.includes('Generar con IA'),
    );
    boton?.click();
    expect(generar).toHaveBeenCalledTimes(1);
  });

  it('conecta los controles de escala con el estado local', () => {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[aria-label="Acercar"]')
      ?.click();
    fixture.detectChanges();
    expect(estado.vista().escala).toBe(1.1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('110%');
  });

  it('aleja la vista y la restablece desde los controles del lienzo', () => {
    const componente = fixture.componentInstance as unknown as {
      alejar: () => void;
      restablecerVista: () => void;
    };

    componente.alejar();
    expect(estado.vista().escala).toBe(0.9);

    componente.restablecerVista();
    expect(estado.vista().escala).toBe(1);
    expect(estado.vista().desplazamientoX).toBe(0);
  });

  it('abre la paleta de bloques desde el lienzo', () => {
    const abrir = spyOn(estado, 'abrirPaletaBloques');

    (fixture.componentInstance as unknown as { abrirPaletaBloques: () => void }).abrirPaletaBloques();

    expect(abrir).toHaveBeenCalled();
  });

  it('limpia la selección al pulsar sobre la superficie vacía', () => {
    const limpiar = spyOn(estado, 'limpiarSeleccion');
    const cancelar = spyOn(estado, 'cancelarConexion');
    const componente = fixture.componentInstance as unknown as {
      seleccionarSuperficie: (evento: MouseEvent) => void;
    };

    componente.seleccionarSuperficie({ target: document.createElement('div') } as unknown as MouseEvent);

    expect(limpiar).toHaveBeenCalled();
    expect(cancelar).toHaveBeenCalled();
  });

  it('no limpia la selección al pulsar sobre un elemento interactivo', () => {
    const limpiar = spyOn(estado, 'limpiarSeleccion');
    const boton = document.createElement('button');
    const componente = fixture.componentInstance as unknown as {
      seleccionarSuperficie: (evento: MouseEvent) => void;
    };

    componente.seleccionarSuperficie({ target: boton } as unknown as MouseEvent);

    expect(limpiar).not.toHaveBeenCalled();
  });

  it('desplaza la vista al arrastrar el puntero sobre la superficie', () => {
    const desplazar = spyOn(estado, 'desplazarVista');
    const componente = fixture.componentInstance as unknown as {
      iniciarDesplazamiento: (evento: PointerEvent) => void;
    };

    componente.iniciarDesplazamiento({
      target: document.createElement('div'),
      clientX: 100,
      clientY: 100,
    } as unknown as PointerEvent);
    window.dispatchEvent(
      Object.assign(new Event('pointermove'), { clientX: 120, clientY: 140 }),
    );

    expect(desplazar).toHaveBeenCalledWith(20, 40);

    window.dispatchEvent(new Event('pointerup'));
  });

  it('no inicia el desplazamiento mientras se arrastra una conexión', () => {
    const componente = fixture.componentInstance as unknown as {
      iniciarDesplazamiento: (evento: PointerEvent) => void;
    };
    spyOn(estado, 'arrastrandoConexion').and.returnValue(true);
    const desplazar = spyOn(estado, 'desplazarVista');

    componente.iniciarDesplazamiento({
      target: document.createElement('div'),
      clientX: 0,
      clientY: 0,
    } as unknown as PointerEvent);
    window.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: 10, clientY: 10 }));

    expect(desplazar).not.toHaveBeenCalled();
  });

  it('no inicia el desplazamiento al presionar sobre un elemento interactivo', () => {
    const componente = fixture.componentInstance as unknown as {
      iniciarDesplazamiento: (evento: PointerEvent) => void;
    };
    const desplazar = spyOn(estado, 'desplazarVista');

    componente.iniciarDesplazamiento({
      target: document.createElement('button'),
      clientX: 0,
      clientY: 0,
    } as unknown as PointerEvent);
    window.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: 10, clientY: 10 }));

    expect(desplazar).not.toHaveBeenCalled();
  });

  it('actualiza el puntero de conexión solo mientras se arrastra una conexión', () => {
    const actualizar = spyOn(estado, 'actualizarPunteroConexion');
    const arrastrando = spyOn(estado, 'arrastrandoConexion').and.returnValue(false);
    const componente = fixture.componentInstance as unknown as {
      moverPunteroDocumento: (evento: PointerEvent) => void;
    };

    componente.moverPunteroDocumento({ clientX: 5, clientY: 5 } as PointerEvent);
    expect(actualizar).not.toHaveBeenCalled();

    arrastrando.and.returnValue(true);
    componente.moverPunteroDocumento({ clientX: 5, clientY: 5 } as PointerEvent);
    expect(actualizar).toHaveBeenCalled();
  });

  it('completa el arrastre de conexión al soltar el puntero', () => {
    const completar = spyOn(estado, 'completarArrastreConexion');
    const arrastrando = spyOn(estado, 'arrastrandoConexion').and.returnValue(false);
    const componente = fixture.componentInstance as unknown as {
      soltarPunteroDocumento: () => void;
    };

    componente.soltarPunteroDocumento();
    expect(completar).not.toHaveBeenCalled();

    arrastrando.and.returnValue(true);
    componente.soltarPunteroDocumento();
    expect(completar).toHaveBeenCalled();
  });

  it('cancela la conexión al pulsar Escape mientras se arrastra', () => {
    const cancelar = spyOn(estado, 'cancelarConexion');
    const arrastrando = spyOn(estado, 'arrastrandoConexion').and.returnValue(false);
    const componente = fixture.componentInstance as unknown as {
      pulsarEscape: () => void;
    };

    componente.pulsarEscape();
    expect(cancelar).not.toHaveBeenCalled();

    arrastrando.and.returnValue(true);
    componente.pulsarEscape();
    expect(cancelar).toHaveBeenCalled();
  });
});
