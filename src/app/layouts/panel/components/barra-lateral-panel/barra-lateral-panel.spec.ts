import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  ClaveItemNavegacionPanel,
  type ItemNavegacionPanel,
} from '../../models/item-navegacion-panel.model';
import { BarraLateralPanel } from './barra-lateral-panel';

describe('BarraLateralPanel', () => {
  let fixture: ComponentFixture<BarraLateralPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraLateralPanel],
      providers: [
        provideRouter([
          {
            path: 'panel/proyectos/:proyectoId/informacion',
            component: PaginaInformacionPrueba,
          },
        ]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BarraLateralPanel);
    fixture.componentRef.setInput('rutaInicio', '/panel');
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
  });

  it('presenta los subitems recibidos debajo de su opción principal', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const subitem = elemento.querySelector<HTMLAnchorElement>('.navegacion-panel__subenlace');

    expect(elemento.textContent).toContain('Proyectos');
    expect(subitem?.textContent).toContain('Información');
    expect(subitem?.getAttribute('href')).toBe('/panel/proyectos/42/informacion');
    expect(subitem?.closest('.navegacion-panel__subnavegacion')).not.toBeNull();
  });

  it('mantiene activo el subitem al navegar entre pasos por parámetros de consulta', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/panel/proyectos/42/informacion?paso=tipo-solucion');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const subitem = elemento.querySelector<HTMLAnchorElement>('.navegacion-panel__subenlace');

    expect(subitem?.classList).toContain('es-activo');
    expect(subitem?.getAttribute('aria-current')).toBe('page');
  });
});

@Component({ template: '' })
class PaginaInformacionPrueba {}

const ITEMS: readonly ItemNavegacionPanel[] = [
  {
    id: ClaveItemNavegacionPanel.Proyectos,
    etiqueta: 'Proyectos',
    descripcion: 'Consultar proyectos',
    icono: 'proyectos',
    ruta: '/panel/proyectos',
    subitems: [
      {
        id: ClaveItemNavegacionPanel.InformacionProyecto,
        etiqueta: 'Información',
        descripcion: 'Consultar información',
        icono: 'informacion',
        ruta: '/panel/proyectos/42/informacion',
        coincidenciaExacta: true,
      },
    ],
  },
];
