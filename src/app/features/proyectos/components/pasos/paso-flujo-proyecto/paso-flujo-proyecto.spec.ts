import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MensajesService } from '../../../../../core/mensajes/services/mensajes.service';
import { ACCIONES_CREACION_PASO_PROYECTO } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { EditorFlujoProyecto } from '../../../secciones/flujo/components/editor-flujo-proyecto/editor-flujo-proyecto';
import {
  FlujoProyecto,
  TipoBloqueFlujo,
} from '../../../secciones/flujo/models/flujo-proyecto.model';
import { PasoFlujoProyecto } from './paso-flujo-proyecto';

describe('PasoFlujoProyecto', () => {
  let fixture: ComponentFixture<PasoFlujoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PasoFlujoProyecto] }).compileComponents();
    fixture = TestBed.createComponent(PasoFlujoProyecto);
    fixture.componentRef.setInput('datos', {
      proyectoId: '42',
      roles: [],
      nodos: [],
      conexiones: [],
      fechaActualizacion: '2026-09-01T00:00:00.000Z',
    });
  });

  it('compone la tarjeta y el editor de Flujo', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Flujo de usuario');
    expect(fixture.nativeElement.querySelector('app-editor-flujo-proyecto')).toBeTruthy();
  });

  it('confirma desde el footer centralizado cuando el paso no utiliza formulario', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Edicion);
    fixture.componentRef.setInput('acciones', ACCIONES_CREACION_PASO_PROYECTO);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('app-acciones-paso-proyecto .ui-button--primary')
      ?.click();

    expect(guardar).toHaveBeenCalledOnce();
  });

  it('habilita el guardado del canvas cuando el editor comunica un cambio', () => {
    const guardarBorrador = vi.fn();
    const flujoModificado = {
      ...FLUJO_CON_CONTENIDO,
      fechaActualizacion: '2026-09-04T11:00:00.000Z',
    };
    fixture.componentInstance.guardarBorrador.subscribe(guardarBorrador);
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Edicion);
    fixture.componentRef.setInput('datos', FLUJO_CON_CONTENIDO);
    fixture.detectChanges();

    const botonGuardar = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[aria-label="Guardar cambios del flujo"]',
    )!;
    expect(botonGuardar.disabled).toBe(true);

    const editor = fixture.debugElement.query(By.directive(EditorFlujoProyecto))
      .componentInstance as EditorFlujoProyecto;
    editor.flujoCambiado.emit(flujoModificado);
    fixture.detectChanges();

    expect(botonGuardar.disabled).toBe(false);
    botonGuardar.click();

    expect(guardarBorrador).toHaveBeenCalledWith(flujoModificado);
  });

  it('considera pendiente el diagrama recién generado aunque todavía no se edite', () => {
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Edicion);
    fixture.componentRef.setInput('datos', FLUJO_CON_CONTENIDO);
    fixture.componentRef.setInput('cambioInicialPendiente', true);
    fixture.detectChanges();

    const botonGuardar = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[aria-label="Guardar cambios del flujo"]',
    );

    expect(botonGuardar?.disabled).toBe(false);
  });

  it('permite generar el primer diagrama desde el estado vacío del canvas', () => {
    const generarConIA = vi.fn();
    fixture.componentInstance.generarConIA.subscribe(generarConIA);
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Edicion);
    fixture.detectChanges();

    const boton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((elemento) => elemento.textContent?.includes('Generar con IA'));
    boton?.click();

    expect(generarConIA).toHaveBeenCalledOnce();
  });

  it('confirma antes de regenerar un diagrama existente', async () => {
    const generarConIA = vi.fn();
    const mensajes = TestBed.inject(MensajesService);
    fixture.componentInstance.generarConIA.subscribe(generarConIA);
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Edicion);
    fixture.componentRef.setInput('datos', FLUJO_CON_CONTENIDO);
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[accionesEncabezadoPasoProyecto]',
    );
    boton?.click();

    expect(boton?.textContent).toContain('Regenerar con IA');
    expect(mensajes.mensajeActual()?.titulo).toBe('Regenerar diagrama con IA');
    expect(generarConIA).not.toHaveBeenCalled();

    mensajes.aceptar();
    await fixture.whenStable();

    expect(generarConIA).toHaveBeenCalledOnce();
  });
});

const FLUJO_CON_CONTENIDO: FlujoProyecto = {
  proyectoId: '42',
  roles: [],
  nodos: [
    {
      id: 'accion-consultar-proyecto',
      tipo: TipoBloqueFlujo.Accion,
      titulo: 'Consultar proyecto',
      descripcion: 'Presenta la información vigente.',
      criteriosAceptacion: ['La información se presenta correctamente.'],
      posicion: { x: 80, y: 80 },
      idsRoles: [],
      fechaCreacion: '2026-09-04T10:00:00.000Z',
      fechaActualizacion: '2026-09-04T10:00:00.000Z',
      datos: {},
    },
  ],
  conexiones: [],
  fechaActualizacion: '2026-09-04T10:00:00.000Z',
};
