import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { DATOS_RUTA_ETAPAS_CREACION } from '../../config/etapas-creacion-proyecto.config';
import { PaginaCreacionProyecto } from './pagina-creacion-proyecto';

@Component({ template: '<p>Contenido de la etapa</p>' })
class EtapaPrueba {}

const RUTAS: Routes = [
  {
    path: 'proyectos/nuevo',
    component: PaginaCreacionProyecto,
    children: [
      {
        path: '',
        component: EtapaPrueba,
        data: DATOS_RUTA_ETAPAS_CREACION.vinculacionAzure,
      },
    ],
  },
  {
    path: 'proyectos/:proyectoId/creacion',
    component: PaginaCreacionProyecto,
    children: [
      {
        path: 'contexto',
        component: EtapaPrueba,
        data: DATOS_RUTA_ETAPAS_CREACION.contexto,
      },
    ],
  },
];

describe('PaginaCreacionProyecto', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaginaCreacionProyecto, EtapaPrueba],
      providers: [provideRouter(RUTAS)],
    });
  });

  it('presenta Azure como la primera etapa de un proyecto nuevo', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/nuevo');
    const elemento = harness.routeNativeElement as HTMLElement;

    expect(elemento.textContent).toContain('Creación de proyectos');
    expect(elemento.textContent).toContain(
      'Completa las etapas para definir la información esencial del proyecto.',
    );
    expect(elemento.textContent).not.toContain('antes de iniciar la definición');
    expect(obtenerPosicionRecorrido(elemento)).toBe('Paso 1 de 9');
    expect(elemento.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('1');
    expect(obtenerContextoEncabezado(elemento)).toBe('');
    expect(obtenerAccionEncabezado(elemento).classList).toContain('ui-button--primary');
    expect(obtenerAccionEncabezado(elemento).classList).not.toContain('ui-button--secondary');
    expect(elemento.querySelector('[aria-current="step"]')?.textContent).toContain('Azure DevOps');
    expect(obtenerTituloEtapa(elemento)).toBe('Azure DevOps');
    expect(obtenerDescripcionEtapa(elemento)).toBe('Vinculación de origen');
    expect(obtenerIconoEtapa(harness).nombre()).toBe('azureDevOps');
    expect(elemento.textContent).toContain('Contenido de la etapa');
  });

  it('presenta Azure completada al abrir Contexto desde un borrador', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/42/creacion/contexto');
    const elemento = harness.routeNativeElement as HTMLElement;
    const botones = elemento.querySelectorAll('.recorrido-creacion__boton');

    expect(elemento.textContent).toContain('Borrador #42');
    expect(elemento.textContent).toContain(
      'Completa las etapas para definir la información esencial del proyecto.',
    );
    expect(obtenerPosicionRecorrido(elemento)).toBe('Paso 2 de 9');
    expect(obtenerContextoEncabezado(elemento)).toBe('');
    expect(elemento.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe(
      'Paso 2 de 9',
    );
    expect(botones[0].textContent).toContain('Etapa completada');
    expect((botones[0] as HTMLButtonElement).disabled).toBe(true);
    expect(elemento.querySelector('[aria-current="step"]')?.textContent).toContain(
      'Contexto del proyecto',
    );
    expect(obtenerTituloEtapa(elemento)).toBe('Contexto del proyecto');
    expect(obtenerDescripcionEtapa(elemento)).toBe('Identidad y datos base');
    expect(obtenerIconoEtapa(harness).nombre()).toBe('contextoProyecto');
  });

  function obtenerTituloEtapa(elemento: HTMLElement): string {
    return (
      elemento.querySelector('.pagina-creacion__encabezado-etapa h2')?.textContent?.trim() ?? ''
    );
  }

  function obtenerDescripcionEtapa(elemento: HTMLElement): string {
    return elemento.querySelector('.pagina-creacion__descripcion-etapa')?.textContent?.trim() ?? '';
  }

  function obtenerPosicionRecorrido(elemento: HTMLElement): string {
    return elemento.querySelector('.recorrido-creacion__posicion')?.textContent?.trim() ?? '';
  }

  function obtenerContextoEncabezado(elemento: HTMLElement): string {
    return elemento.querySelector('.ui-page-header__context')?.textContent?.trim() ?? '';
  }

  function obtenerAccionEncabezado(elemento: HTMLElement): HTMLButtonElement {
    return elemento.querySelector('[encabezadoPaginaAcciones]') as HTMLButtonElement;
  }

  function obtenerIconoEtapa(harness: RouterTestingHarness): IconoComponent {
    const encabezado = harness.routeDebugElement?.query(
      By.css('.pagina-creacion__encabezado-etapa'),
    );
    return encabezado?.query(By.directive(IconoComponent)).componentInstance as IconoComponent;
  }
});
