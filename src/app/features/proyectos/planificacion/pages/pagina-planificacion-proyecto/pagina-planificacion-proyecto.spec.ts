import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  SEGMENTOS_RUTA,
  crearUrlPlanificacionProyecto,
} from '../../../../../core/navegacion/rutas';
import { PaginaPlanificacionProyecto } from './pagina-planificacion-proyecto';

const RUTAS: Routes = [
  {
    path: `${SEGMENTOS_RUTA.proyectos}/:proyectoId/${SEGMENTOS_RUTA.planificacion}`,
    component: PaginaPlanificacionProyecto,
  },
];

describe('PaginaPlanificacionProyecto', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(RUTAS)],
    });
  });

  it('presenta la identidad de la planificación para el proyecto de la ruta', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl(
      `/${SEGMENTOS_RUTA.proyectos}/42/${SEGMENTOS_RUTA.planificacion}`,
      PaginaPlanificacionProyecto,
    );

    const elemento = harness.routeNativeElement;
    expect(elemento?.querySelector('h1')?.textContent).toContain('Planificación del proyecto');
    expect(elemento?.textContent).toContain('Proyecto #42');
    expect(elemento?.textContent).toContain(
      'La estructura de planificación aún no está disponible',
    );
  });

  it('construye la ruta canónica de planificación', () => {
    expect(crearUrlPlanificacionProyecto(42)).toBe('/panel/proyectos/42/planificacion');
  });
});