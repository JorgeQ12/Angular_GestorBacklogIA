import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { firstValueFrom, of } from 'rxjs';
import { SEGMENTOS_RUTA } from '../../../../../core/navegacion/rutas';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { DATOS_RUTA_PASOS_CREACION } from '../../config/pasos-creacion-proyecto.config';
import { BorradorProyecto } from '../../models/borrador-proyecto.model';
import { CreacionProyectoService } from '../../services/creacion-proyecto.service';
import { EstadoCreacionProyectoService } from '../../services/estado-creacion-proyecto.service';
import { PaginaCreacionProyecto } from './pagina-creacion-proyecto';

@Component({ template: '<p>Contenido del paso</p>' })
class PasoPrueba {}

const RUTAS: Routes = [
  {
    path: `${SEGMENTOS_RUTA.proyectos}/${SEGMENTOS_RUTA.nuevo}`,
    component: PaginaCreacionProyecto,
    providers: [EstadoCreacionProyectoService],
    children: [
      {
        path: '',
        component: PasoPrueba,
        data: DATOS_RUTA_PASOS_CREACION.vinculacionAzure,
      },
    ],
  },
  {
    path: `${SEGMENTOS_RUTA.proyectos}/:proyectoId/${SEGMENTOS_RUTA.creacion}`,
    component: PaginaCreacionProyecto,
    providers: [EstadoCreacionProyectoService],
    children: [
      {
        path: SEGMENTOS_RUTA.contexto,
        component: PasoPrueba,
        data: DATOS_RUTA_PASOS_CREACION.contexto,
      },
      {
        path: SEGMENTOS_RUTA.tipoSolucion,
        component: PasoPrueba,
        data: DATOS_RUTA_PASOS_CREACION.tipoSolucion,
      },
      {
        path: SEGMENTOS_RUTA.necesidad,
        component: PasoPrueba,
        data: DATOS_RUTA_PASOS_CREACION.necesidad,
      },
      {
        path: SEGMENTOS_RUTA.objetivos,
        component: PasoPrueba,
        data: DATOS_RUTA_PASOS_CREACION.objetivos,
      },
      {
        path: SEGMENTOS_RUTA.alcance,
        component: PasoPrueba,
        data: DATOS_RUTA_PASOS_CREACION.alcance,
      },
      {
        path: SEGMENTOS_RUTA.roles,
        component: PasoPrueba,
        data: DATOS_RUTA_PASOS_CREACION.roles,
      },
    ],
  },
];

describe('PaginaCreacionProyecto', () => {
  const creacionProyecto = { obtenerBorrador: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR_AVANZADO));
    TestBed.configureTestingModule({
      imports: [PaginaCreacionProyecto, PasoPrueba],
      providers: [
        provideRouter(RUTAS),
        { provide: CreacionProyectoService, useValue: creacionProyecto },
      ],
    });
  });

  it('presenta Azure como el primer paso de un proyecto nuevo', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/nuevo');
    const elemento = harness.routeNativeElement as HTMLElement;

    expect(elemento.textContent).toContain('Creación de proyectos');
    expect(elemento.textContent).toContain(
      'Completa los pasos para definir la información esencial del proyecto.',
    );
    expect(elemento.textContent).not.toContain('antes de iniciar la definición');
    expect(obtenerPosicionRecorrido(elemento)).toBe('Paso 1 de 9');
    expect(elemento.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('1');
    expect(obtenerContextoEncabezado(elemento)).toBe('');
    expect(obtenerAccionEncabezado(elemento).classList).toContain('ui-button--primary');
    expect(obtenerAccionEncabezado(elemento).classList).not.toContain('ui-button--secondary');
    expect(elemento.querySelector('[aria-current="step"]')?.textContent).toContain('Azure DevOps');
    expect(obtenerTituloPaso(elemento)).toBe('Azure DevOps');
    expect(obtenerDescripcionPaso(elemento)).toBe('Vinculación de origen');
    expect(obtenerIconoPaso(harness).nombre()).toBe('azureDevOps');
    expect(elemento.textContent).toContain('Contenido del paso');
  });

  it('presenta Azure completada al abrir Contexto desde un borrador', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/42/creacion/contexto');
    const elemento = harness.routeNativeElement as HTMLElement;
    const botones = elemento.querySelectorAll('.recorrido-creacion__boton');

    expect(elemento.textContent).toContain('Borrador #42');
    expect(elemento.textContent).toContain(
      'Completa los pasos para definir la información esencial del proyecto.',
    );
    expect(obtenerPosicionRecorrido(elemento)).toBe('Paso 2 de 9');
    expect(obtenerContextoEncabezado(elemento)).toBe('');
    expect(elemento.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe(
      'Paso 2 de 9',
    );
    expect(botones[0].textContent).toContain('Paso completado');
    expect((botones[0] as HTMLButtonElement).disabled).toBe(true);
    expect(elemento.querySelector('[aria-current="step"]')?.textContent).toContain(
      'Contexto del proyecto',
    );
    expect(obtenerTituloPaso(elemento)).toBe('Contexto del proyecto');
    expect(obtenerDescripcionPaso(elemento)).toBe('Identidad y datos base');
    expect(obtenerIconoPaso(harness).nombre()).toBe('contextoProyecto');
  });

  it('presenta el nombre vigente del proyecto en el encabezado', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/42/creacion/contexto');
    const estado = harness.routeDebugElement?.injector.get(EstadoCreacionProyectoService);

    estado?.actualizarNombreProyecto('Portal de clientes');
    harness.detectChanges();

    expect(
      (harness.routeNativeElement as HTMLElement).querySelector('.ui-page-header__title')
        ?.textContent,
    ).toContain('Portal de clientes');
  });

  it('conserva los pasos alcanzados al regresar a Contexto', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/42/creacion/contexto');
    const estado = harness.routeDebugElement?.injector.get(EstadoCreacionProyectoService);
    await firstValueFrom(estado!.cargar(42));
    harness.detectChanges();
    const botones = (harness.routeNativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      '.recorrido-creacion__boton',
    );

    expect(botones[1].disabled).toBe(true);
    expect(botones[1].textContent).toContain('Paso completado');
    expect(botones[2].disabled).toBe(false);
    expect(botones[3].disabled).toBe(false);
    expect(botones[3].textContent).toContain('Paso completado');
    expect(botones[4].disabled).toBe(false);
  });

  function obtenerTituloPaso(elemento: HTMLElement): string {
    return (
      elemento.querySelector('.pagina-creacion__encabezado-paso h2')?.textContent?.trim() ?? ''
    );
  }

  function obtenerDescripcionPaso(elemento: HTMLElement): string {
    return elemento.querySelector('.pagina-creacion__descripcion-paso')?.textContent?.trim() ?? '';
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

  function obtenerIconoPaso(harness: RouterTestingHarness): IconoComponent {
    const encabezado = harness.routeDebugElement?.query(
      By.css('.pagina-creacion__encabezado-paso'),
    );
    return encabezado?.query(By.directive(IconoComponent)).componentInstance as IconoComponent;
  }
});

const BORRADOR_AVANZADO: BorradorProyecto = {
  id: 42,
  revision: 4,
  pasoActual: 4,
  equipoAzure: null,
  contexto: {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión inteligente del backlog.',
    prioridadCatalogoId: 14,
    fechaObjetivo: '2026-09-30',
  },
  estadoCatalogoId: null,
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson:
    '{"situacionActual":"Registro manual","problemas":"Reprocesos","impacto":"Costos"}',
  objetivosJson: '{}',
  alcanceJson: '{}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};
