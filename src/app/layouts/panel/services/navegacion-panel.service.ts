import { Injectable, InjectionToken, Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { obtenerProyectoIdUrl } from '../../../core/navegacion/rutas';
import {
  CATALOGO_NAVEGACION_PANEL,
  construirSubitemsProyecto,
} from '../config/navegacion-panel.config';
import {
  ClaveItemNavegacionPanel,
  ClavePermisoNavegacion,
  ItemNavegacionPanel,
} from '../models/item-navegacion-panel.model';

/** Proporciona los permisos vigentes para construir la navegación. */
export const PERMISOS_NAVEGACION_PANEL = new InjectionToken<
  Signal<ReadonlySet<ClavePermisoNavegacion>>
>('PERMISOS_NAVEGACION_PANEL', {
  providedIn: 'root',
  factory: () => signal<ReadonlySet<ClavePermisoNavegacion>>(new Set()).asReadonly(),
});

/** Construye la navegación visible a partir del catálogo y los permisos disponibles. */
@Injectable()
export class NavegacionPanelService {
  private readonly catalogo = inject(CATALOGO_NAVEGACION_PANEL);
  private readonly permisos = inject(PERMISOS_NAVEGACION_PANEL);
  private readonly router = inject(Router);
  private readonly urlActual = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Expone únicamente las opciones permitidas para el usuario actual. */
  public readonly itemsVisibles = computed(() => {
    const permisos = this.permisos();
    const proyectoId = obtenerProyectoIdUrl(this.urlActual());
    const itemsContextuales = this.catalogo.map((item) =>
      item.id === ClaveItemNavegacionPanel.Proyectos && proyectoId !== null
        ? { ...item, subitems: construirSubitemsProyecto(proyectoId) }
        : item,
    );

    return this.filtrarPermitidos(itemsContextuales, permisos);
  });

  private filtrarPermitidos(
    items: readonly ItemNavegacionPanel[],
    permisos: ReadonlySet<ClavePermisoNavegacion>,
  ): readonly ItemNavegacionPanel[] {
    return items.flatMap((item) => {
      const permitido =
        !item.permisos?.length || item.permisos.every((permiso) => permisos.has(permiso));
      if (!permitido) return [];

      return [
        {
          ...item,
          subitems: item.subitems ? this.filtrarPermitidos(item.subitems, permisos) : undefined,
        },
      ];
    });
  }
}
