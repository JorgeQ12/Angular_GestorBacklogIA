import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MensajesService } from '../../../../../core/mensajes/services/mensajes.service';
import { NotificadorErroresApiService } from '../../../../../core/mensajes/services/notificador-errores-api.service';
import {
  ModoUbicacionRequisito,
  type CatalogoRequisitos,
  type RequisitoProyecto,
} from '../../models/lista-requisitos.model';
import { ListaRequisitosPlanificacionService } from '../../services/lista-requisitos-planificacion.service';
import { ListaRequisitosPlanificacion } from './lista-requisitos-planificacion';

describe('ListaRequisitosPlanificacion', () => {
  let fixture: ComponentFixture<ListaRequisitosPlanificacion>;

  const requisito: RequisitoProyecto = {
    id: 1,
    codigo: 'REQ-1',
    area: 'Arquitectura',
    seccion: 'Integración',
    titulo: 'Trazabilidad',
    descripcion: 'Registrar trazabilidad.',
    transversal: false,
    responsable: 'Arquitecto',
    nombreResponsable: 'Ana',
    validador: 'Líder',
    aplica: true,
    tipo: 'Funcional',
    agrupador: 'Diseño',
    orden: 1,
    cumple: false,
  };
  const catalogo: CatalogoRequisitos = {
    areas: [
      {
        id: 10,
        nombre: 'Arquitectura',
        secciones: [{ id: 100, nombre: 'Integración' }],
      },
    ],
    tipos: [{ valor: 5, etiqueta: 'Funcional' }],
    responsables: [{ valor: 'Arquitecto', etiqueta: 'Arquitecto' }],
    validadores: [{ valor: 'Líder', etiqueta: 'Líder' }],
    agrupadores: [{ valor: 'Diseño', etiqueta: 'Diseño' }],
    nombresResponsables: { Arquitecto: 'Ana' },
  };
  const api = {
    obtener: jasmine.createSpy('obtener').and.callFake(() => of([requisito])),
    obtenerCatalogo: jasmine.createSpy('obtenerCatalogo').and.callFake(() => of(catalogo)),
    crear: jasmine.createSpy('crear'),
    actualizar: jasmine.createSpy('actualizar'),
  };

  beforeEach(async () => {
    api.obtener.calls.reset();
    api.obtenerCatalogo.calls.reset();
    api.crear.calls.reset();
    api.actualizar.calls.reset();
    await TestBed.configureTestingModule({
      imports: [ListaRequisitosPlanificacion],
      providers: [
        { provide: ListaRequisitosPlanificacionService, useValue: api },
        { provide: MensajesService, useValue: { confirmar: jasmine.createSpy('confirmar'), exito: jasmine.createSpy('exito') } },
        { provide: NotificadorErroresApiService, useValue: { comunicar: jasmine.createSpy('comunicar') } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ListaRequisitosPlanificacion);
    fixture.componentRef.setInput('proyectoId', 42);
    fixture.detectChanges();
  });

  it('carga y agrupa la lista completa del proyecto', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(api.obtener).toHaveBeenCalledWith(42);
    expect(api.obtenerCatalogo).toHaveBeenCalledTimes(1);
    expect(elemento.textContent).toContain('Arquitectura');
    expect(elemento.textContent).toContain('REQ-1 · Funcional');
    expect(elemento.textContent).toContain('Trazabilidad');
  });

  it('abre el detalle funcional del requisito', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.fila-requisito__contenido',
    );
    boton?.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Información del requisito',
    );
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Registrar trazabilidad.');
  });

  it('presenta errores compartidos y evita crear cuando el formulario es inválido', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    elemento.querySelector<HTMLButtonElement>('.lista-requisitos__acciones button')?.click();
    fixture.detectChanges();

    elemento
      .querySelector<HTMLFormElement>('#formulario-nuevo-requisito')
      ?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(api.crear).not.toHaveBeenCalled();
    expect(elemento.querySelector('.ui-field-error')?.textContent).toContain('Selecciona un área');
  });

  it('marca error de carga cuando la consulta de requisitos falla', () => {
    api.obtener.and.callFake(() => throwError(() => new Error('fallo')));
    const nuevo = TestBed.createComponent(ListaRequisitosPlanificacion);
    nuevo.componentRef.setInput('proyectoId', 7);
    nuevo.detectChanges();
    const comp = nuevo.componentInstance as any;
    expect(comp.errorCarga()).toBe(true);
    expect(comp.cargando()).toBe(false);
    api.obtener.and.callFake(() => of([requisito]));
  });

  it('marca error de catálogo cuando su consulta falla', () => {
    api.obtenerCatalogo.and.callFake(() => throwError(() => new Error('fallo')));
    const nuevo = TestBed.createComponent(ListaRequisitosPlanificacion);
    nuevo.componentRef.setInput('proyectoId', 8);
    nuevo.detectChanges();
    const comp = nuevo.componentInstance as any;
    expect(comp.errorCatalogo()).toBe(true);
    expect(comp.cargandoCatalogo()).toBe(false);
    api.obtenerCatalogo.and.callFake(() => of(catalogo));
  });

  it('alterna la expansión de áreas y secciones', () => {
    const comp = fixture.componentInstance as any;
    expect(comp.areaExpandida('Arquitectura')).toBe(true);
    comp.alternarArea('Arquitectura');
    expect(comp.areaExpandida('Arquitectura')).toBe(false);
    comp.alternarArea('Arquitectura');
    expect(comp.areaExpandida('Arquitectura')).toBe(true);

    expect(comp.seccionExpandida('Arquitectura', 'Integración')).toBe(true);
    comp.alternarSeccion('Arquitectura', 'Integración');
    expect(comp.seccionExpandida('Arquitectura', 'Integración')).toBe(false);
  });

  it('abre y cierra el detalle de un requisito', () => {
    const comp = fixture.componentInstance as any;
    comp.abrirDetalle(1);
    expect(comp.requisitoAbierto()?.id).toBe(1);
    comp.cerrarDetalle();
    expect(comp.requisitoAbierto()).toBeNull();
  });

  it('devuelve un estado por defecto para un id desconocido', () => {
    const comp = fixture.componentInstance as any;
    expect(comp.estado(999)).toEqual({
      cumple: false,
      aplica: false,
      transversal: false,
      nombreResponsable: '',
    });
  });

  it('actualiza campos binarios salvo cuando el requisito se está guardando', () => {
    const comp = fixture.componentInstance as any;
    comp.actualizarBinario(1, 'cumple', true);
    expect(comp.estado(1).cumple).toBe(true);

    comp.guardandoIds.set(new Set([1]));
    comp.actualizarBinario(1, 'aplica', false);
    expect(comp.estado(1).aplica).toBe(true);
    comp.guardandoIds.set(new Set());
  });

  it('actualiza el nombre del responsable desde un input', () => {
    const comp = fixture.componentInstance as any;
    const input = document.createElement('input');
    input.value = 'Nuevo Nombre';
    comp.actualizarNombre(1, { target: input } as unknown as Event);
    expect(comp.estado(1).nombreResponsable).toBe('Nuevo Nombre');
  });

  it('ignora actualizarNombre cuando el target no es un input', () => {
    const comp = fixture.componentInstance as any;
    const antes = comp.estado(1).nombreResponsable;
    comp.actualizarNombre(1, { target: document.createElement('div') } as unknown as Event);
    expect(comp.estado(1).nombreResponsable).toBe(antes);
  });

  it('ignora actualizarNombre cuando el requisito se está guardando', () => {
    const comp = fixture.componentInstance as any;
    comp.guardandoIds.set(new Set([1]));
    const input = document.createElement('input');
    input.value = 'Otro';
    comp.actualizarNombre(1, { target: input } as unknown as Event);
    expect(comp.estado(1).nombreResponsable).not.toBe('Otro');
    comp.guardandoIds.set(new Set());
  });

  it('gestiona los valores iniciales del formulario de creación', () => {
    const comp = fixture.componentInstance as any;
    comp.establecerInicial('cumple', true);
    expect(comp.valorInicial('cumple')).toBe(true);
    comp.establecerInicial('cumple', false);
    expect(comp.valorInicial('cumple')).toBe(false);
  });

  it('cambia el modo de ubicación y ajusta el estado de los controles', () => {
    const comp = fixture.componentInstance as any;
    comp.cambiarModo(ModoUbicacionRequisito.NuevaArea);
    expect(comp.creandoArea()).toBe(true);
    expect(comp.creandoSeccion()).toBe(true);
    expect(comp.formulario.controls.areaId.disabled).toBe(true);
    expect(comp.formulario.controls.areaNombre.enabled).toBe(true);

    comp.cambiarModo(ModoUbicacionRequisito.NuevaSeccion);
    expect(comp.creandoArea()).toBe(false);
    expect(comp.creandoSeccion()).toBe(true);

    comp.cambiarModo(ModoUbicacionRequisito.Existente);
    expect(comp.creandoSeccion()).toBe(false);
  });

  it('habilita la sección al elegir un área en modo existente', () => {
    const comp = fixture.componentInstance as any;
    comp.cambiarModo(ModoUbicacionRequisito.Existente);
    comp.formulario.controls.areaId.setValue(10);
    fixture.detectChanges();
    expect(comp.formulario.controls.seccionId.enabled).toBe(true);
    comp.formulario.controls.areaId.setValue(null);
    fixture.detectChanges();
    expect(comp.formulario.controls.seccionId.disabled).toBe(true);
  });

  it('expone opciones de sección derivadas del área seleccionada', () => {
    const comp = fixture.componentInstance as any;
    comp.formulario.controls.areaId.setValue(10);
    fixture.detectChanges();
    expect(comp.opcionesSeccion().length).toBe(1);
    expect(comp.opcionesArea().length).toBe(1);
    expect(comp.opcionesTipo().length).toBe(1);
    expect(comp.opcionesResponsable().length).toBe(1);
    expect(comp.opcionesValidador().length).toBe(1);
    expect(comp.opcionesAgrupador().length).toBe(1);
  });

  it('propaga el nombre del responsable al seleccionarlo', () => {
    const comp = fixture.componentInstance as any;
    comp.formulario.controls.responsable.setValue('Arquitecto');
    fixture.detectChanges();
    expect(comp.formulario.controls.nombreResponsable.value).toBe('Ana');
  });

  it('abre y cierra el modal de creación', () => {
    const comp = fixture.componentInstance as any;
    comp.abrirCreacion();
    expect(comp.modalCreacionAbierto()).toBe(true);
    comp.cerrarCreacion();
    expect(comp.modalCreacionAbierto()).toBe(false);
  });

  it('no cierra el modal de creación mientras se está creando', () => {
    const comp = fixture.componentInstance as any;
    comp.abrirCreacion();
    comp.creando.set(true);
    comp.cerrarCreacion();
    expect(comp.modalCreacionAbierto()).toBe(true);
    comp.creando.set(false);
  });

  it('crea un requisito válido en modo existente y emite cambios guardados', async () => {
    const creado: RequisitoProyecto = { ...requisito, id: 2, codigo: 'REQ-2', orden: 2 };
    api.crear.and.callFake(() => of(creado));
    const mensajes = TestBed.inject(MensajesService) as any;
    const comp = fixture.componentInstance as any;
    let emitido = false;
    comp.cambiosGuardados.subscribe(() => (emitido = true));

    comp.abrirCreacion();
    comp.formulario.controls.areaId.setValue(10);
    comp.formulario.controls.seccionId.setValue(100);
    comp.formulario.controls.tipoId.setValue(5);
    comp.formulario.controls.titulo.setValue('Nuevo requisito');
    comp.formulario.controls.descripcion.setValue('Descripción');
    comp.formulario.controls.responsable.setValue('Arquitecto');
    comp.formulario.controls.validador.setValue('Líder');
    comp.formulario.controls.agrupador.setValue('Diseño');

    await comp.crear();

    expect(api.crear).toHaveBeenCalledTimes(1);
    expect(comp.requisitos().some((r: RequisitoProyecto) => r.id === 2)).toBe(true);
    expect(comp.modalCreacionAbierto()).toBe(false);
    expect(emitido).toBe(true);
    expect(mensajes.exito).toHaveBeenCalled();
  });

  it('recarga el catálogo tras crear en un modo distinto a existente', async () => {
    const creado: RequisitoProyecto = { ...requisito, id: 3, codigo: 'REQ-3', orden: 3 };
    api.crear.and.callFake(() => of(creado));
    const comp = fixture.componentInstance as any;
    api.obtenerCatalogo.calls.reset();

    comp.abrirCreacion();
    comp.cambiarModo(ModoUbicacionRequisito.NuevaArea);
    comp.formulario.controls.areaNombre.setValue('Nueva Área');
    comp.formulario.controls.seccionNombre.setValue('Nueva Sección');
    comp.formulario.controls.tipoId.setValue(5);
    comp.formulario.controls.titulo.setValue('Req');
    comp.formulario.controls.descripcion.setValue('Desc');
    comp.formulario.controls.responsable.setValue('Arquitecto');
    comp.formulario.controls.validador.setValue('Líder');
    comp.formulario.controls.agrupador.setValue('Diseño');

    await comp.crear();
    expect(api.obtenerCatalogo).toHaveBeenCalledTimes(1);
  });

  it('notifica un error cuando la creación remota falla', async () => {
    api.crear.and.callFake(() => throwError(() => new Error('fallo')));
    const notificador = TestBed.inject(NotificadorErroresApiService) as any;
    const comp = fixture.componentInstance as any;

    comp.abrirCreacion();
    comp.formulario.controls.areaId.setValue(10);
    comp.formulario.controls.seccionId.setValue(100);
    comp.formulario.controls.tipoId.setValue(5);
    comp.formulario.controls.titulo.setValue('Requisito');
    comp.formulario.controls.descripcion.setValue('Descripción');
    comp.formulario.controls.responsable.setValue('Arquitecto');
    comp.formulario.controls.validador.setValue('Líder');
    comp.formulario.controls.agrupador.setValue('Diseño');

    await comp.crear();
    expect(notificador.comunicar).toHaveBeenCalled();
    expect(comp.creando()).toBe(false);
    api.crear.and.callFake(() => of(requisito));
  });

  it('no crea cuando el formulario es inválido', async () => {
    const comp = fixture.componentInstance as any;
    api.crear.calls.reset();
    comp.abrirCreacion();
    await comp.crear();
    expect(api.crear).not.toHaveBeenCalled();
  });

  it('vuelve directamente cuando no hay cambios pendientes', async () => {
    const comp = fixture.componentInstance as any;
    let volvio = false;
    comp.volver.subscribe(() => (volvio = true));
    await comp.solicitarVolver();
    expect(volvio).toBe(true);
  });

  it('restaura los estados y vuelve cuando el usuario descarta los cambios', async () => {
    const mensajes = TestBed.inject(MensajesService) as any;
    mensajes.confirmar.and.returnValue(Promise.resolve(false));
    const comp = fixture.componentInstance as any;
    comp.actualizarBinario(1, 'cumple', true);
    expect(comp.modificados()).toEqual([1]);

    let volvio = false;
    comp.volver.subscribe(() => (volvio = true));
    await comp.solicitarVolver();

    expect(volvio).toBe(true);
    expect(comp.estado(1).cumple).toBe(false);
  });

  it('guarda los cambios pendientes cuando el usuario confirma', async () => {
    const mensajes = TestBed.inject(MensajesService) as any;
    mensajes.confirmar.and.returnValue(Promise.resolve(true));
    api.actualizar.and.callFake(() => of(requisito));
    const comp = fixture.componentInstance as any;
    comp.actualizarBinario(1, 'cumple', true);

    let guardo = false;
    comp.cambiosGuardados.subscribe(() => (guardo = true));
    await comp.solicitarVolver();

    expect(api.actualizar).toHaveBeenCalledTimes(1);
    expect(guardo).toBe(true);
    expect(comp.modificados()).toEqual([]);
  });

  it('notifica cuando alguna actualización falla al guardar', async () => {
    const mensajes = TestBed.inject(MensajesService) as any;
    mensajes.confirmar.and.returnValue(Promise.resolve(true));
    api.actualizar.and.callFake(() => throwError(() => new Error('fallo')));
    const notificador = TestBed.inject(NotificadorErroresApiService) as any;
    notificador.comunicar.calls.reset();
    const comp = fixture.componentInstance as any;
    comp.actualizarBinario(1, 'cumple', true);

    await comp.solicitarVolver();
    expect(notificador.comunicar).toHaveBeenCalled();
    api.actualizar.and.callFake(() => of(requisito));
  });
});

describe('ListaRequisitosPlanificacion (cobertura adicional)', () => {
  let fixture: ComponentFixture<ListaRequisitosPlanificacion>;

  const requisito: RequisitoProyecto = {
    id: 1,
    codigo: 'REQ-1',
    area: 'Arquitectura',
    seccion: 'Integración',
    titulo: 'Trazabilidad',
    descripcion: 'Registrar trazabilidad.',
    transversal: false,
    responsable: 'Arquitecto',
    nombreResponsable: 'Ana',
    validador: 'Líder',
    aplica: true,
    tipo: 'Funcional',
    agrupador: 'Diseño',
    orden: 1,
    cumple: false,
  };
  const catalogo: CatalogoRequisitos = {
    areas: [
      {
        id: 10,
        nombre: 'Arquitectura',
        secciones: [{ id: 100, nombre: 'Integración' }],
      },
    ],
    tipos: [{ valor: 5, etiqueta: 'Funcional' }],
    responsables: [{ valor: 'Arquitecto', etiqueta: 'Arquitecto' }],
    validadores: [{ valor: 'Líder', etiqueta: 'Líder' }],
    agrupadores: [{ valor: 'Diseño', etiqueta: 'Diseño' }],
    nombresResponsables: { Arquitecto: 'Ana' },
  };
  const api = {
    obtener: jasmine.createSpy('obtener').and.callFake(() => of([requisito])),
    obtenerCatalogo: jasmine.createSpy('obtenerCatalogo').and.callFake(() => of(catalogo)),
    crear: jasmine.createSpy('crear'),
    actualizar: jasmine.createSpy('actualizar'),
  };

  beforeEach(async () => {
    api.obtener.calls.reset();
    api.obtenerCatalogo.calls.reset();
    api.crear.calls.reset();
    api.actualizar.calls.reset();
    api.obtener.and.callFake(() => of([requisito]));
    api.obtenerCatalogo.and.callFake(() => of(catalogo));
    await TestBed.configureTestingModule({
      imports: [ListaRequisitosPlanificacion],
      providers: [
        { provide: ListaRequisitosPlanificacionService, useValue: api },
        {
          provide: MensajesService,
          useValue: {
            confirmar: jasmine.createSpy('confirmar'),
            exito: jasmine.createSpy('exito').and.returnValue(Promise.resolve(undefined)),
          },
        },
        { provide: NotificadorErroresApiService, useValue: { comunicar: jasmine.createSpy('comunicar') } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ListaRequisitosPlanificacion);
    fixture.componentRef.setInput('proyectoId', 42);
    fixture.detectChanges();
  });

  it('vuelve a consultar la lista al invocar cargar de nuevo', () => {
    const comp = fixture.componentInstance as any;
    api.obtener.calls.reset();
    comp.cargar();
    expect(api.obtener).toHaveBeenCalledTimes(1);
    expect(comp.cargando()).toBe(false);
    expect(comp.errorCarga()).toBe(false);
  });

  it('vuelve a consultar el catálogo al invocar cargarCatalogo de nuevo', () => {
    const comp = fixture.componentInstance as any;
    api.obtenerCatalogo.calls.reset();
    comp.cargarCatalogo();
    expect(api.obtenerCatalogo).toHaveBeenCalledTimes(1);
    expect(comp.cargandoCatalogo()).toBe(false);
  });

  it('habilita el nombre de sección al escribir un área nueva y lo deshabilita al borrarla', () => {
    const comp = fixture.componentInstance as any;
    comp.abrirCreacion();
    comp.cambiarModo(ModoUbicacionRequisito.NuevaArea);

    comp.formulario.controls.areaNombre.setValue('Nueva Área');
    fixture.detectChanges();
    expect(comp.formulario.controls.seccionNombre.enabled).toBe(true);

    comp.formulario.controls.areaNombre.setValue('   ');
    fixture.detectChanges();
    expect(comp.formulario.controls.seccionNombre.disabled).toBe(true);
  });

  it('habilita el nombre de sección al elegir un área en modo nueva sección', () => {
    const comp = fixture.componentInstance as any;
    comp.abrirCreacion();
    comp.cambiarModo(ModoUbicacionRequisito.NuevaSeccion);

    comp.formulario.controls.areaId.setValue(10);
    fixture.detectChanges();
    expect(comp.formulario.controls.seccionNombre.enabled).toBe(true);

    comp.formulario.controls.areaId.setValue(null);
    fixture.detectChanges();
    expect(comp.formulario.controls.seccionNombre.disabled).toBe(true);
  });

  it('limpia el nombre del responsable cuando el catálogo no lo conoce', () => {
    const comp = fixture.componentInstance as any;
    comp.formulario.controls.responsable.setValue('Desconocido');
    fixture.detectChanges();
    expect(comp.formulario.controls.nombreResponsable.value).toBe('');
  });

  it('no crea cuando falta el tipo aun con datos de ubicación válidos', async () => {
    const comp = fixture.componentInstance as any;
    comp.abrirCreacion();
    comp.formulario.controls.areaId.setValue(10);
    comp.formulario.controls.seccionId.setValue(100);
    comp.formulario.controls.tipoId.setValue(999);
    comp.formulario.controls.titulo.setValue('Requisito');
    comp.formulario.controls.descripcion.setValue('Descripción');
    comp.formulario.controls.responsable.setValue('Arquitecto');
    comp.formulario.controls.validador.setValue('Líder');
    comp.formulario.controls.agrupador.setValue('Diseño');

    await comp.crear();

    expect(api.crear).not.toHaveBeenCalled();
    expect(comp.creando()).toBe(false);
  });

  it('crea un requisito con área y sección nuevas usando los nombres capturados', async () => {
    const creado: RequisitoProyecto = { ...requisito, id: 4, codigo: 'REQ-4', orden: 4 };
    api.crear.and.callFake(() => of(creado));
    const comp = fixture.componentInstance as any;

    comp.abrirCreacion();
    comp.cambiarModo(ModoUbicacionRequisito.NuevaArea);
    comp.formulario.controls.areaNombre.setValue('Área Nueva');
    comp.formulario.controls.seccionNombre.setValue('Sección Nueva');
    comp.formulario.controls.tipoId.setValue(5);
    comp.formulario.controls.titulo.setValue('Req');
    comp.formulario.controls.descripcion.setValue('Desc');
    comp.formulario.controls.responsable.setValue('Arquitecto');
    comp.formulario.controls.validador.setValue('Líder');
    comp.formulario.controls.agrupador.setValue('Diseño');

    await comp.crear();

    expect(api.crear).toHaveBeenCalledWith(
      42,
      jasmine.objectContaining({ area: 'Área Nueva', seccion: 'Sección Nueva' }),
    );
  });

  it('reporta en plural cuando varias actualizaciones fallan al guardar', async () => {
    const segundo: RequisitoProyecto = { ...requisito, id: 2, codigo: 'REQ-2', orden: 2 };
    api.obtener.and.callFake(() => of([requisito, segundo]));
    const propio = TestBed.createComponent(ListaRequisitosPlanificacion);
    propio.componentRef.setInput('proyectoId', 42);
    propio.detectChanges();
    const mensajes = TestBed.inject(MensajesService) as any;
    mensajes.confirmar.and.returnValue(Promise.resolve(true));
    api.actualizar.and.callFake(() => throwError(() => new Error('fallo')));
    const notificador = TestBed.inject(NotificadorErroresApiService) as any;
    notificador.comunicar.calls.reset();
    const comp = propio.componentInstance as any;
    comp.actualizarBinario(1, 'cumple', true);
    comp.actualizarBinario(2, 'aplica', false);

    await comp.solicitarVolver();

    expect(notificador.comunicar).toHaveBeenCalledWith(
      jasmine.any(Error),
      jasmine.objectContaining({
        descripcion: '2 requisitos quedaron pendientes de guardar.',
      }),
    );
    api.actualizar.and.callFake(() => of(requisito));
    api.obtener.and.callFake(() => of([requisito]));
  });

  it('conserva un estado editable vacío cuando el requisito no tiene nombre de responsable', () => {
    const sinNombre: RequisitoProyecto = { ...requisito, id: 9, nombreResponsable: null };
    api.obtener.and.callFake(() => of([sinNombre]));
    const propio = TestBed.createComponent(ListaRequisitosPlanificacion);
    propio.componentRef.setInput('proyectoId', 42);
    propio.detectChanges();
    const comp = propio.componentInstance as any;
    expect(comp.estado(9).nombreResponsable).toBe('');
    api.obtener.and.callFake(() => of([requisito]));
  });
});
