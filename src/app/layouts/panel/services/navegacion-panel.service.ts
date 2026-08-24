import { Injectable, InjectionToken, Signal, computed, inject, signal } from '@angular/core';
import { CATALOGO_NAVEGACION_PANEL } from '../config/navegacion-panel.config';
import { ClavePermisoNavegacion } from '../models/item-navegacion-panel.model';

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

  /** Expone únicamente las opciones permitidas para el usuario actual. */
  public readonly itemsVisibles = computed(() => {
    const permisos = this.permisos();
    return this.catalogo.filter(
      (item) => !item.permisos?.length || item.permisos.every((permiso) => permisos.has(permiso)),
    );
  });
}
