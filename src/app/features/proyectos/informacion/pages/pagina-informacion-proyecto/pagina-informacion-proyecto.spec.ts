import { LOCALE_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgControl } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { CatalogosService } from '../../../../../core/catalogos/services/catalogos.service';
import { MensajesService } from '../../../../../core/mensajes/services/mensajes.service';
import { LOCALE_APLICACION } from '../../../../../core/localizacion/config/localizacion.config';
import { PARAMETROS_RUTA } from '../../../../../core/navegacion/rutas';
import { SelectorFecha } from '../../../../../shared/forms/controles/selector-fecha/selector-fecha';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import { PlataformaSolucion } from '../../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import type { InformacionProyecto } from '../../models/informacion-proyecto.model';
import { EstadoInformacionProyectoService } from '../../services/estado-informacion-proyecto.service';
import { PaginaInformacionProyecto } from './pagina-informacion-proyecto';

describe('PaginaInformacionProyecto', () => {
  let fixture: ComponentFixture<PaginaInformacionProyecto>;
  let consulta$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  const estado = {
    proyectoActual: signal<{ id: number; versionId: number } | null>({ id: 42, versionId: 81 }),
    proyectoPresentado: signal<InformacionProyecto | null>(null),
    versiones: signal([]),
    errorCarga: signal(false),
    guardando: signal(false),
    cargar: jasmine.createSpy('cargar'),
    presentarVersion: jasmine.createSpy('presentarVersion'),
    guardar: jasmine.createSpy('guardar'),
  };
  const router = {
    navigate: jasmine.createSpy('navigate'),
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
  };

  beforeEach(async () => {
    estado.cargar.calls.reset();
    estado.presentarVersion.calls.reset();
    estado.guardar.calls.reset();
    router.navigate.calls.reset();
    router.navigateByUrl.calls.reset();
    estado.proyectoActual.set({ id: 42, versionId: 81 });
    estado.proyectoPresentado.set(null);
    estado.errorCarga.set(false);
    estado.guardando.set(false);
    consulta$ = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [PaginaInformacionProyecto],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ proyectoId: '42' })),
            queryParamMap: consulta$,
          },
        },
        { provide: Router, useValue: router },
        { provide: LOCALE_ID, useValue: LOCALE_APLICACION },
        {
          provide: CatalogosService,
          useValue: {
            obtenerOpciones: jasmine.createSpy('obtenerOpciones').and.callFake(() =>
              of([
                { id: 2, nombre: 'Alta', descripcion: '' },
                { id: 3, nombre: 'Media', descripcion: '' },
              ]),
            ),
          },
        },
        {
          provide: MensajesService,
          useValue: {
            confirmar: jasmine.createSpy('confirmar').and.callFake(() => Promise.resolve(true)),
          },
        },
        { provide: EstadoInformacionProyectoService, useValue: estado },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaInformacionProyecto);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('carga el proyecto desde paramMap sin capturar un snapshot', () => {
    expect(estado.cargar).toHaveBeenCalledWith(42, null);
  });

  it('aplica la versión de la URL a todo el estado presentado', () => {
    consulta$.next(convertToParamMap({ version: '72' }));
    TestBed.flushEffects();
    expect(estado.presentarVersion.calls.mostRecent().args).toEqual([72]);
  });

  it('presenta un error de página completa sin encabezado ni recorrido', () => {
    estado.errorCarga.set(true);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const error = elemento.querySelector<HTMLElement>('app-estado-error');

    expect(error?.classList.contains('estado-error--pagina-completa')).toBe(true);
    expect(elemento.querySelector('app-encabezado-pagina')).toBeNull();
    expect(elemento.querySelector('app-recorrido-proyecto')).toBeNull();
    expect(elemento.querySelector('.pagina-informacion')?.getAttribute('aria-label')).toBe(
      'Estado de carga del proyecto',
    );
  });

  it('rehidrata los metadatos del encabezado desde la fotografía presentada', () => {
    estado.proyectoPresentado.set(PROYECTO_PRESENTADO);
    fixture.detectChanges();

    estado.proyectoPresentado.set({
      ...PROYECTO_PRESENTADO,
      contexto: {
        ...PROYECTO_PRESENTADO.contexto,
        responsable: 'María Gómez',
        fechaObjetivo: '2026-08-30',
      },
      prioridad: 'Media',
    });
    fixture.detectChanges();

    const encabezado = (fixture.nativeElement as HTMLElement).querySelector(
      'app-encabezado-pagina',
    );

    expect(encabezado?.textContent).toContain('RESPONSABLE María Gómez');
    expect(encabezado?.textContent).toContain('Prioridad Media');
    expect(encabezado?.textContent).toContain('30 de ago de 2026');
    expect(encabezado?.textContent).not.toContain('En Progreso');
    expect(encabezado?.textContent).not.toContain('Versión 4');
  });

  it('presenta el selector de versión dentro del encabezado del paso activo', () => {
    estado.proyectoPresentado.set(PROYECTO_PRESENTADO);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const encabezadoPaso = elemento.querySelector('.tarjeta-paso__encabezado');

    expect(encabezadoPaso?.querySelector('app-selector-version-proyecto')).not.toBeNull();
    expect(
      elemento.querySelector('.pagina-informacion > app-selector-version-proyecto'),
    ).toBeNull();
  });

  it('oculta el selector de versión mientras una sección se encuentra en edición', () => {
    estado.proyectoPresentado.set(PROYECTO_PRESENTADO);
    consulta$.next(
      convertToParamMap({ [PARAMETROS_RUTA.pasoProyecto]: ClaveSeccionProyecto.Contexto }),
    );
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    elemento
      .querySelector<HTMLButtonElement>('.tarjeta-paso__acciones-encabezado .ui-button')
      ?.click();
    fixture.detectChanges();

    expect(elemento.querySelector('app-selector-version-proyecto')).toBeNull();

    elemento.querySelector<HTMLButtonElement>('.ui-form-footer .ui-button--secondary')?.click();
    fixture.detectChanges();

    expect(elemento.querySelector('app-selector-version-proyecto')).not.toBeNull();
  });

  it('envía el formulario del paso al guardar una versión', () => {
    estado.proyectoPresentado.set(PROYECTO_PRESENTADO);
    consulta$.next(
      convertToParamMap({ [PARAMETROS_RUTA.pasoProyecto]: ClaveSeccionProyecto.Contexto }),
    );
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    elemento
      .querySelector<HTMLButtonElement>('.tarjeta-paso__acciones-encabezado .ui-button')
      ?.click();
    fixture.detectChanges();

    const formulario = elemento.querySelector<HTMLFormElement>('#formulario-paso-contexto');
    const guardar = elemento.querySelector<HTMLButtonElement>(
      '.ui-form-footer .ui-button--primary',
    );
    expect(guardar?.type).toBe('button');
    expect(guardar?.form).toBe(formulario);
    guardar?.click();
    fixture.detectChanges();

    expect(estado.guardar).toHaveBeenCalledWith(
      { seccion: ClaveSeccionProyecto.Contexto, datos: PROYECTO_PRESENTADO.contexto },
      jasmine.any(Function),
    );
  });

  it('refleja Contexto en el encabezado y restaura la fotografía al cancelar', () => {
    estado.proyectoPresentado.set(PROYECTO_PRESENTADO);
    consulta$.next(
      convertToParamMap({ [PARAMETROS_RUTA.pasoProyecto]: ClaveSeccionProyecto.Contexto }),
    );
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    elemento
      .querySelector<HTMLButtonElement>('.tarjeta-paso__acciones-encabezado .ui-button')
      ?.click();
    fixture.detectChanges();

    const nombre = elemento.querySelector<HTMLInputElement>('#contexto-nombre');
    if (!nombre) throw new Error('No se presentó el campo Nombre del proyecto.');
    nombre.value = 'Portal renovado';
    nombre.dispatchEvent(new Event('input'));
    const responsable = elemento.querySelector<HTMLInputElement>('#contexto-responsable');
    if (!responsable) throw new Error('No se presentó el campo Responsable.');
    responsable.value = 'Ana Torres';
    responsable.dispatchEvent(new Event('input'));
    fixture.debugElement
      .query(By.directive(SelectorFecha))
      .injector.get(NgControl)
      .control?.setValue('2027-01-15');
    fixture.debugElement
      .query(By.css('app-selector-campo#contexto-prioridad'))
      .injector.get(NgControl)
      .control?.setValue(3);
    fixture.detectChanges();

    const encabezado = elemento.querySelector('app-encabezado-pagina');
    expect(elemento.querySelector('#titulo-informacion-proyecto')?.textContent).toBe(
      'Portal renovado',
    );
    expect(encabezado?.textContent).toContain('RESPONSABLE Ana Torres');
    expect(encabezado?.textContent).toContain('Prioridad Media');
    expect(encabezado?.textContent).toContain('15 de ene de 2027');

    elemento.querySelector<HTMLButtonElement>('.ui-form-footer .ui-button--secondary')?.click();
    fixture.detectChanges();

    expect(elemento.querySelector('#titulo-informacion-proyecto')?.textContent).toBe('Portal');
    expect(encabezado?.textContent).toContain('RESPONSABLE Jorge');
    expect(encabezado?.textContent).toContain('Prioridad Alta');
    expect(encabezado?.textContent).toContain('10 de dic de 2026');
  });

  it('vuelve al listado de proyectos', () => {
    const componente = fixture.componentInstance as unknown as { volver: () => void };

    componente.volver();

    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('recarga el proyecto con la versión solicitada en la URL', () => {
    consulta$.next(convertToParamMap({ version: '72' }));
    TestBed.flushEffects();
    fixture.detectChanges();
    estado.cargar.calls.reset();

    (fixture.componentInstance as unknown as { recargar: () => void }).recargar();

    expect(estado.cargar).toHaveBeenCalledWith(42, 72);
  });

  it('navega al cambiar de paso cuando no hay edición pendiente', async () => {
    const componente = fixture.componentInstance as unknown as {
      cambiarPaso: (paso: ClaveSeccionProyecto) => Promise<void>;
    };

    await componente.cambiarPaso(ClaveSeccionProyecto.Necesidad);

    expect(router.navigate).toHaveBeenCalled();
  });

  it('no cambia de paso si el usuario decide seguir editando', async () => {
    estado.proyectoPresentado.set(PROYECTO_PRESENTADO);
    fixture.detectChanges();
    const confirmar = TestBed.inject(MensajesService).confirmar as jasmine.Spy;
    confirmar.and.returnValue(Promise.resolve(false));
    const componente = fixture.componentInstance as unknown as {
      editar: (seccion: ClaveSeccionProyecto) => void;
      cambiarPaso: (paso: ClaveSeccionProyecto) => Promise<void>;
    };

    componente.editar(ClaveSeccionProyecto.Contexto);
    await componente.cambiarPaso(ClaveSeccionProyecto.Necesidad);

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('limpia el query param de versión al elegir la versión actual', async () => {
    const componente = fixture.componentInstance as unknown as {
      cambiarVersion: (versionId: number) => Promise<void>;
    };

    await componente.cambiarVersion(81);

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: { [PARAMETROS_RUTA.versionProyectoId]: null },
      }),
    );
  });

  it('conserva el id al elegir una versión distinta de la actual', async () => {
    const componente = fixture.componentInstance as unknown as {
      cambiarVersion: (versionId: number) => Promise<void>;
    };

    await componente.cambiarVersion(72);

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: { [PARAMETROS_RUTA.versionProyectoId]: 72 },
      }),
    );
  });

  it('no inicia la edición cuando la versión presentada no es la actual', () => {
    estado.proyectoPresentado.set({ ...PROYECTO_PRESENTADO, esVersionActual: false });
    fixture.detectChanges();
    const componente = fixture.componentInstance as unknown as {
      editar: (seccion: ClaveSeccionProyecto) => void;
      seccionEditando: () => ClaveSeccionProyecto | null;
    };

    componente.editar(ClaveSeccionProyecto.Contexto);

    expect(componente.seccionEditando()).toBeNull();
  });

  it('ignora la actualización temporal de contexto si no se edita Contexto', () => {
    estado.proyectoPresentado.set(PROYECTO_PRESENTADO);
    fixture.detectChanges();
    const componente = fixture.componentInstance as unknown as {
      editar: (seccion: ClaveSeccionProyecto) => void;
      actualizarContextoTemporal: (contexto: InformacionProyecto['contexto']) => void;
      datosEncabezado: () => { nombre: string };
    };

    componente.editar(ClaveSeccionProyecto.Necesidad);
    componente.actualizarContextoTemporal({
      ...PROYECTO_PRESENTADO.contexto,
      nombre: 'Nombre temporal ignorado',
    });

    expect(componente.datosEncabezado().nombre).toBe('Portal');
  });
});

const PROYECTO_PRESENTADO: InformacionProyecto = {
  id: 42,
  versionId: 81,
  numeroVersion: 4,
  fechaVersion: null,
  esVersionActual: true,
  contexto: {
    nombre: 'Portal',
    responsable: 'Jorge',
    descripcion: 'Descripción',
    prioridadCatalogoId: 2,
    fechaObjetivo: '2026-12-10',
  },
  estadoCatalogoId: 3,
  estado: 'En Progreso',
  prioridad: 'Alta',
  azure: null,
  tipoSolucion: { tieneInterfaz: true, plataforma: PlataformaSolucion.Web },
  necesidad: { situacionActual: 'Manual', problemas: 'Retrasos', impacto: 'Costos' },
  objetivos: { objetivoGeneral: 'Mejorar', objetivosEspecificos: ['Automatizar'] },
  alcance: { incluido: 'Portal', excluido: 'Pagos' },
  roles: { roles: [] },
  equipo: { integrantes: [] },
  flujo: {
    proyectoId: '42',
    roles: [],
    nodos: [],
    conexiones: [],
    fechaActualizacion: '2026-09-01',
  },
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson: '{"situacionActual":"Manual","problemas":"Retrasos","impacto":"Costos"}',
  objetivosJson: '{"objetivoGeneral":"Mejorar","objetivosEspecificos":["Automatizar"]}',
  alcanceJson: '{"incluido":"Portal","excluido":"Pagos"}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
};
