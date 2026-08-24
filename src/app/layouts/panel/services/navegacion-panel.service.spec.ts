import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CATALOGO_NAVEGACION_PANEL } from '../config/navegacion-panel.config';
import {
  ClavePermisoNavegacion,
  ItemNavegacionPanel,
} from '../models/item-navegacion-panel.model';
import { NavegacionPanelService, PERMISOS_NAVEGACION_PANEL } from './navegacion-panel.service';

describe('NavegacionPanelService', () => {
  const catalogo: readonly ItemNavegacionPanel[] = [
    {
      id: 'inicio',
      etiqueta: 'Inicio',
      descripcion: 'Ir al inicio',
      icono: 'inicio',
      ruta: '/panel',
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

  beforeEach(() => {
    permisos.set(new Set());
    TestBed.configureTestingModule({
      providers: [
        NavegacionPanelService,
        { provide: CATALOGO_NAVEGACION_PANEL, useValue: catalogo },
        { provide: PERMISOS_NAVEGACION_PANEL, useValue: permisos.asReadonly() },
      ],
    });
  });

  it('mantiene visibles las opciones sin permisos requeridos', () => {
    const servicio = TestBed.inject(NavegacionPanelService);
    expect(servicio.itemsVisibles().map((item) => item.id)).toEqual(['inicio']);
  });

  it('incorpora una opción cuando el permiso está disponible', () => {
    const servicio = TestBed.inject(NavegacionPanelService);
    permisos.set(new Set(['administrar-configuracion']));
    expect(servicio.itemsVisibles().map((item) => item.id)).toEqual(['inicio', 'configuracion']);
  });
});
