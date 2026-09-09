import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import type { NombreIconoAplicacion } from '../../../../../shared/components/icono/iconos-aplicacion';
import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion as ElementoPlanificacionModel,
} from '../../models/planificacion-proyecto.model';
import { ElementoPlanificacion } from './elemento-planificacion';

describe('ElementoPlanificacion', () => {
  let fixture: ComponentFixture<ElementoPlanificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ElementoPlanificacion] }).compileComponents();
    fixture = TestBed.createComponent(ElementoPlanificacion);
  });

  it.each([
    [TipoElementoPlanificacion.Epica, 'epica'],
    [TipoElementoPlanificacion.Caracteristica, 'caracteristica'],
    [TipoElementoPlanificacion.ListaRequisitos, 'listaRequisitos'],
    [TipoElementoPlanificacion.ActividadRequisito, 'actividadRequisito'],
    [TipoElementoPlanificacion.TareaRequisito, 'tareaRequisito'],
    [TipoElementoPlanificacion.Historia, 'historiaUsuario'],
    [TipoElementoPlanificacion.Tarea, 'tarea'],
  ] as const)(
    'representa el tipo %s mediante el icono semántico %s',
    (tipo, nombreIcono: NombreIconoAplicacion) => {
      fixture.componentRef.setInput('elemento', crearElemento(tipo));
      fixture.detectChanges();

      const icono = fixture.debugElement
        .query(By.css('.elemento-planificacion__icono'))
        .query(By.directive(IconoComponent))
        .componentInstance as IconoComponent;
      expect(icono.nombre()).toBe(nombreIcono);
    },
  );

  it('emite la expansión únicamente cuando el elemento contiene hijos', () => {
    const alternar = vi.fn();
    fixture.componentRef.setInput('elemento', {
      ...crearElemento(TipoElementoPlanificacion.Epica),
      hijos: [crearElemento(TipoElementoPlanificacion.Caracteristica)],
    });
    fixture.componentInstance.alternar.subscribe(alternar);
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button');
    boton?.click();

    expect(alternar).toHaveBeenCalledOnce();
    expect(boton?.getAttribute('aria-expanded')).toBe('false');
  });

  it('representa las ramas cerradas con más y las abiertas con menos', () => {
    fixture.componentRef.setInput('elemento', {
      ...crearElemento(TipoElementoPlanificacion.Epica),
      hijos: [crearElemento(TipoElementoPlanificacion.Caracteristica)],
    });
    fixture.detectChanges();

    const obtenerIconoAlternador = () => {
      const alternador = fixture.debugElement.query(
        By.css('.elemento-planificacion__alternador'),
      );
      return alternador.query(By.directive(IconoComponent))
        .componentInstance as IconoComponent;
    };

    expect(obtenerIconoAlternador().nombre()).toBe('expandirRama');

    fixture.componentRef.setInput('expandido', true);
    fixture.detectChanges();

    expect(obtenerIconoAlternador().nombre()).toBe('contraerRama');
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('.elemento-planificacion__alternador')
        ?.getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('mantiene el más deshabilitado cuando una lista de requisitos aún no tiene actividades', () => {
    fixture.componentRef.setInput(
      'elemento',
      crearElemento(TipoElementoPlanificacion.ListaRequisitos),
    );
    fixture.detectChanges();

    const alternador = fixture.debugElement.query(
      By.css('.elemento-planificacion__alternador'),
    );
    const icono = alternador.query(By.directive(IconoComponent))
      .componentInstance as IconoComponent;
    const boton = alternador.nativeElement as HTMLButtonElement;

    expect(boton).toBeDefined();
    expect(boton.disabled).toBe(true);
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    expect(icono.nombre()).toBe('expandirRama');
  });

  it('bloquea la expansión manual cuando la búsqueda administra la rama', () => {
    const alternar = vi.fn();
    fixture.componentRef.setInput('elemento', {
      ...crearElemento(TipoElementoPlanificacion.Epica),
      hijos: [crearElemento(TipoElementoPlanificacion.Caracteristica)],
    });
    fixture.componentRef.setInput('expansionDeshabilitada', true);
    fixture.componentInstance.alternar.subscribe(alternar);
    fixture.detectChanges();
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button');

    boton?.click();

    expect(boton?.disabled).toBe(true);
    expect(alternar).not.toHaveBeenCalled();
  });

  it('permite consultar un elemento eliminado sin ofrecer acciones de modificación', () => {
    const consultar = vi.fn();
    fixture.componentRef.setInput('elemento', {
      ...crearElemento(TipoElementoPlanificacion.Tarea),
      activo: false,
      capacidades: {
        puedeConsultar: true,
        puedeEditar: false,
        puedeEliminar: false,
        puedeCrearHijo: false,
        puedeSincronizar: false,
        soloLectura: true,
      },
    });
    fixture.componentInstance.consultar.subscribe(consultar);
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;
    const botones = [...elemento.querySelectorAll<HTMLButtonElement>('button')];
    const botonConsulta = botones.find((boton) =>
      boton.getAttribute('aria-label')?.startsWith('Consultar Tarea'),
    );

    botonConsulta?.click();

    expect(elemento.textContent).toContain('Eliminado');
    expect(botonConsulta).toBeDefined();
    expect(consultar).toHaveBeenCalledOnce();
    expect(
      botones.some((boton) => boton.getAttribute('aria-label') === 'Editar Tarea'),
    ).toBe(false);
  });
  it('abre la edición desde el menú contextual', () => {
    const editar = vi.fn();
    fixture.componentRef.setInput('elemento', crearElemento(TipoElementoPlanificacion.Caracteristica));
    fixture.componentRef.setInput('menuAccionesAbierto', true);
    fixture.componentInstance.editar.subscribe(editar);
    fixture.detectChanges();
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')]
      .find((actual) => actual.textContent?.includes('Editar información'));

    boton?.click();

    expect(boton).toBeDefined();
    expect(editar).toHaveBeenCalledOnce();
  });

  it.each([
    [TipoElementoPlanificacion.Epica, 'Nueva característica'],
    [TipoElementoPlanificacion.Caracteristica, 'Nueva historia de usuario'],
    [TipoElementoPlanificacion.Historia, 'Nueva tarea'],
    [TipoElementoPlanificacion.ListaRequisitos, 'Crear actividad'],
    [TipoElementoPlanificacion.ActividadRequisito, 'Crear tarea de requisitos'],
  ] as const)('muestra el tooltip de creación correspondiente para %s', (tipo, etiqueta) => {
    const elemento = crearElemento(tipo);
    fixture.componentRef.setInput('elemento', {
      ...elemento,
      capacidades: { ...elemento.capacidades, puedeCrearHijo: true },
    });
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.elemento-planificacion__crear-hijo',
    );

    expect(boton?.getAttribute('data-tooltip')).toBe(etiqueta);
    expect(boton?.getAttribute('aria-label')).toBe(etiqueta);
    expect(boton?.classList.contains('ui-tooltip')).toBe(true);
  });
  it('ofrece crear característica, editar y eliminar cuando la épica está autorizada', () => {
    const crearHijo = vi.fn();
    const editar = vi.fn();
    const eliminar = vi.fn();
    const epica = crearElemento(TipoElementoPlanificacion.Epica);
    fixture.componentRef.setInput('elemento', {
      ...epica,
      capacidades: {
        ...epica.capacidades,
        puedeCrearHijo: true,
        puedeEliminar: true,
      },
    });
    fixture.componentRef.setInput('menuAccionesAbierto', true);
    fixture.componentInstance.crearHijo.subscribe(crearHijo);
    fixture.componentInstance.editar.subscribe(editar);
    fixture.componentInstance.eliminar.subscribe(eliminar);
    fixture.detectChanges();
    const botones = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ];
    const botonCrear = botones.find(
      (actual) => actual.getAttribute('aria-label') === 'Nueva característica',
    );
    const botonEditar = botones.find((actual) =>
      actual.textContent?.includes('Editar información'),
    );
    const botonEliminar = botones.find((actual) => actual.textContent?.includes('Eliminar'));

    botonCrear?.click();
    botonEditar?.click();
    botonEliminar?.click();

    expect(botonCrear).toBeDefined();
    expect(botonEditar).toBeDefined();
    expect(botonEliminar).toBeDefined();
    expect(crearHijo).toHaveBeenCalledOnce();
    expect(editar).toHaveBeenCalledOnce();
    expect(eliminar).toHaveBeenCalledOnce();
  });
  it('ofrece la sincronizacion solo cuando la capacidad fue autorizada', () => {
    const sincronizar = vi.fn();
    const epica = crearElemento(TipoElementoPlanificacion.Epica);
    fixture.componentRef.setInput('elemento', {
      ...epica,
      capacidades: {
        ...epica.capacidades,
        puedeEditar: false,
        puedeSincronizar: true,
        soloLectura: true,
      },
    });
    fixture.componentRef.setInput('menuAccionesAbierto', true);
    fixture.componentInstance.sincronizar.subscribe(sincronizar);
    fixture.detectChanges();
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')]
      .find((actual) => actual.textContent?.includes('Sincronizar con Azure'));

    boton?.click();

    expect(boton).toBeDefined();
    expect(sincronizar).toHaveBeenCalledOnce();
  });

  it('bloquea la sincronizacion mientras existe otra operacion de escritura', () => {
    const epica = crearElemento(TipoElementoPlanificacion.Epica);
    fixture.componentRef.setInput('elemento', {
      ...epica,
      capacidades: { ...epica.capacidades, puedeSincronizar: true },
    });
    fixture.componentRef.setInput('accionesDeshabilitadas', true);
    fixture.detectChanges();
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')]
      .find((actual) => actual.getAttribute('aria-label')?.startsWith('Acciones de'));

    expect(boton?.disabled).toBe(true);
  });

  it('permite eliminar una actividad de requisito autorizada por el backend', () => {
    const eliminar = vi.fn();
    const actividad = crearElemento(TipoElementoPlanificacion.ActividadRequisito);
    fixture.componentRef.setInput('elemento', {
      ...actividad,
      capacidades: { ...actividad.capacidades, puedeEliminar: true },
    });
    fixture.componentRef.setInput('menuAccionesAbierto', true);
    fixture.componentInstance.eliminar.subscribe(eliminar);
    fixture.detectChanges();
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')]
      .find((actual) => actual.getAttribute('aria-label')?.startsWith('Eliminar actividad'));

    boton?.click();

    expect(boton).toBeDefined();
    expect(eliminar).toHaveBeenCalledOnce();
  });

  it('permite eliminar una tarea autorizada por el backend', () => {
    const tarea = crearElemento(TipoElementoPlanificacion.Tarea);
    fixture.componentRef.setInput('elemento', {
      ...tarea,
      capacidades: { ...tarea.capacidades, puedeEliminar: true },
    });
    fixture.componentRef.setInput('menuAccionesAbierto', true);
    fixture.detectChanges();

    expect(
      [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')]
        .some((actual) => actual.getAttribute('aria-label')?.startsWith('Eliminar')),
    ).toBe(true);
  });
  it('ofrece crear actividad, editar y eliminar en la lista autorizada', () => {
    const lista = crearElemento(TipoElementoPlanificacion.ListaRequisitos);
    fixture.componentRef.setInput('elemento', {
      ...lista,
      capacidades: { ...lista.capacidades, puedeCrearHijo: true, puedeEditar: true, puedeEliminar: true },
    });
    fixture.componentRef.setInput('menuAccionesAbierto', true);
    fixture.detectChanges();
    const botones = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')];
    expect(botones.some(boton => boton.getAttribute('aria-label') === 'Crear actividad')).toBe(true);
    expect(botones.some(boton => boton.textContent?.includes('Editar información'))).toBe(true);
    expect(botones.some(boton => boton.textContent?.includes('Eliminar'))).toBe(true);
  });
});

function crearElemento(tipo: TipoElementoPlanificacion): ElementoPlanificacionModel {
  return {
    clave: `${tipo}:1`,
    id: 1,
    tipo,
    titulo: 'Elemento de prueba',
    detalle: null,
    terminosBusqueda: [],
    activo: true,
    numeroVersion: 1,
    vinculadaAzure: false,
    capacidades: {
      puedeConsultar: true,
      puedeEditar: true,
      puedeEliminar: false,
      puedeCrearHijo: false,
      puedeSincronizar: false,
      soloLectura: false,
    },
    hijos: [],
  };
}
