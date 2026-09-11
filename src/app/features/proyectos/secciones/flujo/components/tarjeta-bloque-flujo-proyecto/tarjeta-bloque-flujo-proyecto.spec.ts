import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MensajesService } from '../../../../../../core/mensajes/services/mensajes.service';
import { NodoFlujoProyecto, TipoBloqueFlujo } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { TarjetaBloqueFlujoProyecto } from './tarjeta-bloque-flujo-proyecto';

describe('TarjetaBloqueFlujoProyecto', () => {
  let fixture: ComponentFixture<TarjetaBloqueFlujoProyecto>;
  const arrastrandoConexion = signal(false);
  const soloLectura = signal(false);
  const abrirEditorNodo = jasmine.createSpy('abrirEditorNodo');
  const iniciarArrastreConexion = jasmine
    .createSpy('iniciarArrastreConexion')
    .and.callFake(() => arrastrandoConexion.set(true));
  const completarArrastreConexion = jasmine
    .createSpy('completarArrastreConexion')
    .and.callFake(() => arrastrandoConexion.set(false));
  const esDestinoConexion = jasmine.createSpy('esDestinoConexion').and.callFake(() => true);
  const esDestinoConexionEnfocado = jasmine
    .createSpy('esDestinoConexionEnfocado')
    .and.callFake(() => false);
  const obtenerNombreRol = jasmine
    .createSpy('obtenerNombreRol')
    .and.callFake((id: string) => id);
  const establecerDestinoConexionEnfocado = jasmine.createSpy('establecerDestinoConexionEnfocado');
  const seleccionarBloque = jasmine.createSpy('seleccionarBloque');
  const moverBloque = jasmine.createSpy('moverBloque');
  const eliminarBloque = jasmine.createSpy('eliminarBloque');
  const estado = {
    soloLectura: soloLectura.asReadonly(),
    arrastrandoConexion: arrastrandoConexion.asReadonly(),
    idBloqueSeleccionado: signal<string | null>('accion-1').asReadonly(),
    idOrigenConexionActiva: signal<string | null>(null).asReadonly(),
    esDestinoConexion,
    esDestinoConexionEnfocado,
    obtenerNombreRol,
    abrirEditorNodo,
    iniciarArrastreConexion,
    completarArrastreConexion,
    establecerDestinoConexionEnfocado,
    seleccionarBloque,
    moverBloque,
    vista: signal({ escala: 1, desplazamientoX: 0, desplazamientoY: 0 }).asReadonly(),
    eliminarBloque,
  };

  beforeEach(async () => {
    [
      abrirEditorNodo,
      iniciarArrastreConexion,
      completarArrastreConexion,
      esDestinoConexion,
      esDestinoConexionEnfocado,
      obtenerNombreRol,
      establecerDestinoConexionEnfocado,
      seleccionarBloque,
      moverBloque,
      eliminarBloque,
    ].forEach((spy) => spy.calls.reset());
    iniciarArrastreConexion.and.callFake(() => arrastrandoConexion.set(true));
    completarArrastreConexion.and.callFake(() => arrastrandoConexion.set(false));
    esDestinoConexion.and.callFake(() => true);
    esDestinoConexionEnfocado.and.callFake(() => false);
    obtenerNombreRol.and.callFake((id: string) => id);
    arrastrandoConexion.set(false);
    soloLectura.set(false);
    spyOn(Element.prototype, 'setPointerCapture').and.stub();
    spyOn(Element.prototype, 'releasePointerCapture').and.stub();
    spyOn(Element.prototype, 'hasPointerCapture').and.returnValue(false);
    await TestBed.configureTestingModule({
      imports: [TarjetaBloqueFlujoProyecto],
      providers: [
        { provide: EstadoEditorFlujoProyectoService, useValue: estado },
        {
          provide: MensajesService,
          useValue: {
            confirmarDestructiva: jasmine
              .createSpy('confirmarDestructiva')
              .and.returnValue(Promise.resolve(true)),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TarjetaBloqueFlujoProyecto);
    fixture.componentRef.setInput('bloque', BLOQUE);
    fixture.detectChanges();
  });

  it('abre el bloque con Espacio desde la tarjeta enfocada', () => {
    const tarjeta = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.tarjeta-bloque-flujo',
    );
    tarjeta?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(abrirEditorNodo).toHaveBeenCalledWith('accion-1');
  });

  it('inicia y completa una conexión utilizando únicamente el teclado', () => {
    const origen = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__conector--salida',
    );
    origen?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    const destino = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__conector--entrada',
    );
    destino?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(iniciarArrastreConexion).toHaveBeenCalledWith('accion-1', undefined);
    expect(completarArrastreConexion).toHaveBeenCalled();
  });

  it('abre el editor al pulsar sobre la tarjeta', () => {
    obtenerTarjeta().dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(abrirEditorNodo).toHaveBeenCalledWith('accion-1');
  });

  it('no abre el editor durante un arrastre de conexión activo', () => {
    arrastrandoConexion.set(true);
    fixture.detectChanges();

    obtenerTarjeta().dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(abrirEditorNodo).not.toHaveBeenCalled();
  });

  it('ignora la apertura por teclado cuando el evento proviene de un descendiente', () => {
    const boton = obtenerTarjeta().querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__abrir-menu',
    );
    boton?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(abrirEditorNodo).not.toHaveBeenCalled();
  });

  it('selecciona el bloque al iniciar un arrastre con el puntero', () => {
    obtenerTarjeta().dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0, bubbles: true }),
    );
    fixture.detectChanges();

    expect(seleccionarBloque).toHaveBeenCalledWith('accion-1');
  });

  it('no permite arrastrar el bloque en modo solo lectura', () => {
    soloLectura.set(true);
    fixture.detectChanges();

    obtenerTarjeta().dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0, bubbles: true }),
    );
    fixture.detectChanges();

    expect(seleccionarBloque).not.toHaveBeenCalled();
  });

  it('mueve el bloque y evita abrir el editor tras un desplazamiento real', () => {
    const tarjeta = obtenerTarjeta();
    tarjeta.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0, bubbles: true }),
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 40, clientY: 40 }),
    );
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    fixture.detectChanges();

    expect(moverBloque).toHaveBeenCalled();

    tarjeta.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(abrirEditorNodo).not.toHaveBeenCalled();
  });

  it('abre y cierra el menú de acciones del bloque', () => {
    const abrirMenu = obtenerTarjeta().querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__abrir-menu',
    );
    abrirMenu?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(obtenerTarjeta().querySelector('.tarjeta-bloque-flujo__menu')).not.toBeNull();

    abrirMenu?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(obtenerTarjeta().querySelector('.tarjeta-bloque-flujo__menu')).toBeNull();
  });

  it('cierra el menú de acciones al pulsar en el documento', () => {
    const abrirMenu = obtenerTarjeta().querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__abrir-menu',
    );
    abrirMenu?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(obtenerTarjeta().querySelector('.tarjeta-bloque-flujo__menu')).toBeNull();
  });

  it('abre el editor desde la opción editar del menú', () => {
    const abrirMenu = obtenerTarjeta().querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__abrir-menu',
    );
    abrirMenu?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const editar = obtenerTarjeta().querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__menu button',
    );
    editar?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(abrirEditorNodo).toHaveBeenCalledWith('accion-1');
  });

  it('elimina el bloque cuando la confirmación destructiva es aceptada', async () => {
    const abrirMenu = obtenerTarjeta().querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__abrir-menu',
    );
    abrirMenu?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const eliminar = obtenerTarjeta().querySelectorAll<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__menu button',
    )[1];
    eliminar?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(eliminarBloque).toHaveBeenCalledWith('accion-1');
  });

  it('conserva el bloque cuando la confirmación destructiva es rechazada', async () => {
    const servicioMensajes = TestBed.inject(MensajesService) as unknown as {
      confirmarDestructiva: jasmine.Spy;
    };
    servicioMensajes.confirmarDestructiva.and.returnValue(Promise.resolve(false));

    const abrirMenu = obtenerTarjeta().querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__abrir-menu',
    );
    abrirMenu?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const eliminar = obtenerTarjeta().querySelectorAll<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__menu button',
    )[1];
    eliminar?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(eliminarBloque).not.toHaveBeenCalled();
  });

  it('enfoca y desenfoca el destino al entrar y salir durante una conexión', () => {
    arrastrandoConexion.set(true);
    fixture.detectChanges();
    const tarjeta = obtenerTarjeta();

    tarjeta.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    expect(establecerDestinoConexionEnfocado).toHaveBeenCalledWith('accion-1');

    tarjeta.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    expect(establecerDestinoConexionEnfocado).toHaveBeenCalledWith(null);
  });

  it('no altera el destino enfocado al entrar sin una conexión activa', () => {
    obtenerTarjeta().dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));

    expect(establecerDestinoConexionEnfocado).not.toHaveBeenCalled();
  });

  it('completa una conexión al soltar el puntero sobre la tarjeta', () => {
    arrastrandoConexion.set(true);
    fixture.detectChanges();

    obtenerTarjeta().dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));

    expect(establecerDestinoConexionEnfocado).toHaveBeenCalledWith('accion-1');
    expect(completarArrastreConexion).toHaveBeenCalled();
  });

  it('ignora el soltado del puntero cuando no hay una conexión activa', () => {
    obtenerTarjeta().dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));

    expect(completarArrastreConexion).not.toHaveBeenCalled();
  });

  it('no completa una conexión desde teclado cuando no hay conexión activa', () => {
    const destino = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.tarjeta-bloque-flujo__conector--entrada',
    );
    destino?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(completarArrastreConexion).not.toHaveBeenCalled();
  });

  it('presenta las ramas de decisión para un bloque de tipo decisión', () => {
    fixture.componentRef.setInput('bloque', {
      ...BLOQUE,
      id: 'decision-1',
      tipo: TipoBloqueFlujo.Decision,
    });
    fixture.detectChanges();

    const ramas = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.tarjeta-bloque-flujo__conector--decision',
    );

    expect(ramas.length).toBe(2);
  });

  it('muestra los roles asignados al bloque limitados a dos y un conteo adicional', () => {
    fixture.componentRef.setInput('bloque', {
      ...BLOQUE,
      idsRoles: ['rol-1', 'rol-2', 'rol-3'],
    });
    fixture.detectChanges();

    const roles = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.tarjeta-bloque-flujo__roles span',
    );

    expect(roles[roles.length - 1]?.textContent).toContain('+1');
  });

  function obtenerTarjeta(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.tarjeta-bloque-flujo',
    ) as HTMLElement;
  }
});

const BLOQUE: NodoFlujoProyecto = {
  id: 'accion-1',
  tipo: TipoBloqueFlujo.Accion,
  titulo: 'Confirmar solicitud',
  descripcion: 'Confirma la operación.',
  criteriosAceptacion: [],
  posicion: { x: 120, y: 80 },
  idsRoles: [],
  fechaCreacion: '2026-09-01T10:00:00.000Z',
  fechaActualizacion: '2026-09-01T10:00:00.000Z',
  datos: {},
};
