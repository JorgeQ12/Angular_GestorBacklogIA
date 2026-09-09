import { NgControl } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectorCampo } from '../../../../../../shared/forms/controles/selector-campo/selector-campo';
import {
  ModoEditorElementoPlanificacion,
  type CatalogosFormularioElementoPlanificacion,
  type DetalleElementoPlanificacion,
  type ValoresFormularioElementoPlanificacion,
} from '../../../models/detalle-elemento-planificacion.model';
import { TipoElementoPlanificacion } from '../../../models/planificacion-proyecto.model';
import { FormularioElementoPlanificacionComponent } from './formulario-elemento-planificacion';

describe('FormularioElementoPlanificacionComponent', () => {
  let fixture: ComponentFixture<FormularioElementoPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioElementoPlanificacionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioElementoPlanificacionComponent);
    fixture.componentRef.setInput('idFormulario', 'formulario-elemento-prueba');
    fixture.componentRef.setInput('tipo', TipoElementoPlanificacion.Tarea);
    fixture.componentRef.setInput('modo', ModoEditorElementoPlanificacion.Creacion);
    fixture.componentRef.setInput('datosIniciales', VALORES_VALIDOS);
    fixture.componentRef.setInput('catalogos', CATALOGOS);
    fixture.detectChanges();
  });

  it('presenta los campos particulares del tipo seleccionado', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('#elemento-definicion-tarea')).not.toBeNull();
    expect(elemento.querySelector('#elemento-dependencias')).not.toBeNull();
    expect(elemento.querySelector('#elemento-objetivo')).toBeNull();
  });

  it('conserva la distribución de campos de Tarea del frontend anterior', () => {
    const elemento = obtenerElemento();
    const seccionDefinicion = elemento
      .querySelector('#elemento-definicion-tarea')
      ?.closest('section');
    const seccionPlanificacion = elemento
      .querySelector('#elemento-planificacion')
      ?.closest('section');

    expect(seccionDefinicion?.textContent).toContain('Definición funcional');
    expect(seccionDefinicion?.textContent).toContain(
      'Información que delimita y valida el trabajo esperado.',
    );
    expect(seccionDefinicion?.querySelector('#elemento-dependencias')).not.toBeNull();
    expect(seccionDefinicion?.querySelector('#elemento-actividad')).toBeNull();
    expect(seccionDefinicion?.querySelector('#elemento-complejidad')).toBeNull();

    expect(seccionPlanificacion?.textContent).toContain('Esfuerzo y periodo de ejecución.');
    expect(seccionPlanificacion?.querySelector('#elemento-actividad')).not.toBeNull();
    expect(seccionPlanificacion?.querySelector('#elemento-complejidad')).not.toBeNull();
    expect(seccionPlanificacion?.querySelector('#elemento-estimacion')).not.toBeNull();
    expect(seccionPlanificacion?.querySelector('#elemento-fecha-inicio')).not.toBeNull();
    expect(seccionPlanificacion?.querySelector('#elemento-fecha-final')).not.toBeNull();
  });

  it('impide guardar una tarea cuando faltan sus campos obligatorios', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#elemento-titulo', '   ');
    escribir('#elemento-descripcion', '');
    establecerPrimerSelector(null);

    enviarFormulario();
    fixture.detectChanges();

    expect(guardar).not.toHaveBeenCalled();
    expect(obtenerElemento().querySelector('#elemento-titulo-error')?.textContent).toBe(
      'El título es obligatorio.',
    );
  });

  it('emite la fotografía válida de una tarea para que el estado construya el comando', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    escribir('#elemento-titulo', 'Tarea actualizada');
    escribir('#elemento-dependencias', 'Servicio desplegado');
    establecerPrimerSelector(23);

    enviarFormulario();

    expect(guardar).toHaveBeenCalledWith({
      ...VALORES_VALIDOS,
      titulo: 'Tarea actualizada',
      dependencias: 'Servicio desplegado',
      actividadCatalogoId: 23,
    });
  });

  it('mantiene el formulario consultivo en solo lectura y bloquea su envío', () => {
    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    fixture.componentRef.setInput('modo', ModoEditorElementoPlanificacion.Consulta);
    fixture.detectChanges();

    enviarFormulario();

    expect(
      obtenerElemento().querySelector<HTMLInputElement>('#elemento-titulo')?.readOnly,
    ).toBe(true);
    expect(guardar).not.toHaveBeenCalled();
  });
  it('presenta la épica con los campos y metadatos del frontend anterior', () => {
    fixture.componentRef.setInput('tipo', TipoElementoPlanificacion.Epica);
    fixture.componentRef.setInput('modo', ModoEditorElementoPlanificacion.Consulta);
    fixture.componentRef.setInput('detalle', DETALLE_EPICA);
    fixture.componentRef.setInput('datosIniciales', {
      ...VALORES_VALIDOS,
      titulo: DETALLE_EPICA.titulo,
      descripcion: DETALLE_EPICA.descripcion,
      alcance: DETALLE_EPICA.alcance,
      riesgos: DETALLE_EPICA.riesgos,
      criteriosExito: DETALLE_EPICA.criteriosExito,
      estimacionHoras: DETALLE_EPICA.estimacionHoras,
    });
    fixture.detectChanges();

    const elemento = obtenerElemento();
    const controles = elemento.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input, textarea',
    );

    expect(
      elemento.querySelector<HTMLInputElement>('#elemento-estimacion')?.value,
    ).toBe('70');
    expect(elemento.querySelector('#elemento-prioridad')).toBeNull();
    expect(elemento.querySelector('#elemento-riesgo')).toBeNull();
    expect(elemento.querySelector('label[for="elemento-riesgos"]')?.textContent).toBe('Riesgos');
    expect(elemento.textContent).not.toContain('Riesgos identificados');
    expect(elemento.textContent).toContain('Información del registro');
    expect(elemento.textContent).toContain('Versión actual');
    expect(elemento.textContent).toContain('Activo');
    expect([...controles].every((control) => control.readOnly)).toBe(true);
  });

  it('mantiene la característica editable y presenta su información del registro', () => {
    const detalle = {
      ...DETALLE_EPICA,
      tipo: TipoElementoPlanificacion.Caracteristica,
      urlAzure: null,
      capacidades: {
        ...DETALLE_EPICA.capacidades,
        puedeEditar: true,
        puedeSincronizar: false,
        soloLectura: false,
      },
    } satisfies DetalleElementoPlanificacion;
    fixture.componentRef.setInput('tipo', TipoElementoPlanificacion.Caracteristica);
    fixture.componentRef.setInput('modo', ModoEditorElementoPlanificacion.Edicion);
    fixture.componentRef.setInput('detalle', detalle);
    fixture.componentRef.setInput('datosIniciales', {
      ...VALORES_VALIDOS,
      titulo: detalle.titulo,
      descripcion: detalle.descripcion,
      alcance: detalle.alcance,
      estimacionHoras: detalle.estimacionHoras,
    });
    fixture.detectChanges();

    const elemento = obtenerElemento();
    const controles = elemento.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input, textarea',
    );

    expect(elemento.textContent).toContain('Información del registro');
    expect(elemento.textContent).toContain('Versión actual');
    expect([...controles].every((control) => !control.readOnly)).toBe(true);
  });

  it.each([
    TipoElementoPlanificacion.Historia,
    TipoElementoPlanificacion.Tarea,
  ] as const)('presenta Información del registro para la %s', (tipo) => {
    const detalle = {
      ...DETALLE_EPICA,
      tipo,
      urlAzure: null,
    } satisfies DetalleElementoPlanificacion;
    fixture.componentRef.setInput('tipo', tipo);
    fixture.componentRef.setInput('modo', ModoEditorElementoPlanificacion.Edicion);
    fixture.componentRef.setInput('detalle', detalle);
    fixture.componentRef.setInput('datosIniciales', VALORES_VALIDOS);
    fixture.detectChanges();

    const elemento = obtenerElemento();
    expect(elemento.textContent).toContain('Información del registro');
    expect(elemento.textContent).toContain('Versión actual');
  });

  function escribir(selector: string, valor: string): void {
    const control = obtenerElemento().querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    control.value = valor;
    control.dispatchEvent(new Event('input'));
  }

  function establecerPrimerSelector(valor: number | null): void {
    const control = fixture.debugElement.query(By.directive(SelectorCampo)).injector.get(NgControl).control;
    control?.setValue(valor);
  }

  function enviarFormulario(): void {
    const formulario = obtenerElemento().querySelector('form') as HTMLFormElement;
    formulario.dispatchEvent(new Event('submit'));
  }

  function obtenerElemento(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});

const CATALOGOS: CatalogosFormularioElementoPlanificacion = {
  prioridades: [],
  riesgos: [],
  actividadesTarea: [
    { id: 19, nombre: 'Desarrollo', descripcion: '' },
    { id: 23, nombre: 'Despliegue', descripcion: '' },
  ],
  actividadesRequisito: [],
};

const VALORES_VALIDOS: ValoresFormularioElementoPlanificacion = {
  titulo: 'Implementar servicio',
  descripcion: 'Construir el servicio.',
  alcance: '',
  riesgos: '',
  criteriosExito: '',
  prioridadCatalogoId: null,
  riesgoCatalogoId: null,
  objetivo: '',
  criteriosAceptacion: '',
  dependencias: '',
  actividadCatalogoId: 19,
  complejidad: 3,
  prioridad: 4,
  discusion: '',
  responsable: '',
  requisito: '',
  estimacionHoras: 8,
  fechaInicio: '2026-09-03',
  fechaFinal: '2026-09-05',
};
const DETALLE_EPICA: DetalleElementoPlanificacion = {
  tipo: TipoElementoPlanificacion.Epica,
  id: 1,
  proyectoId: 42,
  urlAzure: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
  activo: true,
  numeroVersion: 1,
  titulo: 'Gestión del catálogo de activos y ubicaciones',
  descripcion: 'Permite mantener el inventario maestro de activos.',
  estimacionHoras: 70,
  fechaInicio: '2026-08-25',
  fechaFinal: '2026-09-03',
  fechaCreacion: '2026-08-25T10:00:00',
  fechaInactivacion: null,
  motivoInactivacion: null,
  capacidades: {
    puedeEditar: false,
    puedeVerHistorial: true,
    puedeSincronizar: true,
    soloLectura: true,
  },
  alcance: 'Incluye alta, edición y consulta de activos.',
  riesgos: 'Calidad insuficiente de datos iniciales.',
  criteriosExito: 'Inventario disponible para usuarios autorizados.',
  prioridadCatalogoId: null,
  riesgoCatalogoId: null,
  objetivo: '',
  criteriosAceptacion: '',
  dependencias: '',
  actividadCatalogoId: null,
  complejidad: 3,
  prioridad: 4,
  discusion: '',
  responsable: '',
  requisito: '',
};
