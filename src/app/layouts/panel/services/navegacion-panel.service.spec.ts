import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CATALOGO_NAVEGACION_PANEL } from '../config/navegacion-panel.config';
import {
  ClaveItemNavegacionPanel,
  ClavePermisoNavegacion,
  ItemNavegacionPanel,
} from '../models/item-navegacion-panel.model';
import { NavegacionPanelService, PERMISOS_NAVEGACION_PANEL } from './navegacion-panel.service';

describe('NavegacionPanelService', () => {
  const catalogo: readonly ItemNavegacionPanel[] = [
    {
      id: ClaveItemNavegacionPanel.Inicio,
      etiqueta: 'Inicio',
      descripcion: 'Ir al inicio',
      icono: 'inicio',
      ruta: '/panel',
    },
    {
      id: ClaveItemNavegacionPanel.Proyectos,
      etiqueta: 'Proyectos',
      descripcion: 'Consultar proyectos',
      icono: 'proyectos',
      ruta: '/panel/proyectos',
    },
    {
      id: 'configuracion',
      etiqueta: 'Configuración',
      descripcion: 'Administrar configuración',
      icono: 'inicio',
      ruta: '/panel/configuracion',
      permisos: ['administrar-configuracion'],
    },
  ];
  const permisos = signal<ReadonlySet<ClavePermisoNavegacion>>(new Set());
  let eventosRouter: Subject<NavigationEnd>;
  const router = { url: '/panel/inicio', events: new Subject<NavigationEnd>() };

  beforeEach(() => {
    permisos.set(new Set());
    eventosRouter = new Subject<NavigationEnd>();
    router.url = '/panel/inicio';
    router.events = eventosRouter;
    TestBed.configureTestingModule({
      providers: [
        NavegacionPanelService,
        { provide: CATALOGO_NAVEGACION_PANEL, useValue: catalogo },
        { provide: PERMISOS_NAVEGACION_PANEL, useValue: permisos.asReadonly() },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('mantiene visibles las opciones sin permisos requeridos', () => {
    const servicio = TestBed.inject(NavegacionPanelService);
    expect(servicio.itemsVisibles().map((item) => item.id)).toEqual([
      ClaveItemNavegacionPanel.Inicio,
      ClaveItemNavegacionPanel.Proyectos,
    ]);
  });

  it('incorpora una opción cuando el permiso está disponible', () => {
    const servicio = TestBed.inject(NavegacionPanelService);
    permisos.set(new Set(['administrar-configuracion']));
    expect(servicio.itemsVisibles().map((item) => item.id)).toEqual([
      ClaveItemNavegacionPanel.Inicio,
      ClaveItemNavegacionPanel.Proyectos,
      'configuracion',
    ]);
  });

  it('incorpora Información cuando la URL identifica un proyecto actual', () => {
    const servicio = TestBed.inject(NavegacionPanelService);
    navegarA('/panel/proyectos/42/informacion');

    const proyectos = servicio
      .itemsVisibles()
      .find((item) => item.id === ClaveItemNavegacionPanel.Proyectos);

    expect(proyectos?.subitems).toEqual([
      expect.objectContaining({
        id: ClaveItemNavegacionPanel.InformacionProyecto,
        ruta: '/panel/proyectos/42/informacion',
      }),
    ]);
  });

  it('no construye subitems sin una identidad de proyecto en la URL', () => {
    const servicio = TestBed.inject(NavegacionPanelService);
    navegarA('/panel/proyectos/creacion');

    const proyectos = servicio
      .itemsVisibles()
      .find((item) => item.id === ClaveItemNavegacionPanel.Proyectos);

    expect(proyectos?.subitems).toBeUndefined();
  });

  function navegarA(url: string): void {
    router.url = url;
    eventosRouter.next(new NavigationEnd(1, url, url));
  }
});
