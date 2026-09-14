import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, forkJoin } from 'rxjs';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { EncabezadoPagina } from '../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../shared/components/estado-error/estado-error';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { IndicadorEstado } from '../../../../shared/components/indicador-estado/indicador-estado';
import { RegionDesplazable } from '../../../../shared/components/region-desplazable/region-desplazable';
import { EditorCatalogo } from '../../components/editor-catalogo/editor-catalogo';
import { TablaOpcionesCatalogo } from '../../components/tabla-opciones-catalogo/tabla-opciones-catalogo';
import { ERRORES_CATALOGOS } from '../../config/catalogos.config';
import {
  Catalogo,
  ClaseCatalogo,
  DatosCatalogo,
  EditorCatalogo as ContextoEditor,
  ValorCatalogo,
} from '../../models/catalogo.model';
import { AdministracionCatalogosService } from '../../services/administracion-catalogos.service';

/** Coordina administración y selección desde una fotografía confirmada por el API. */
@Component({
  selector: 'app-pagina-catalogos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EncabezadoPagina,
    EstadoError,
    EstadoVacio,
    IconoComponent,
    IndicadorEstado,
    RegionDesplazable,
    EditorCatalogo,
    TablaOpcionesCatalogo,
  ],
  templateUrl: './pagina-catalogos.html',
  styleUrl: './pagina-catalogos.css',
})
export class PaginaCatalogos implements OnInit {

  /** Proporciona acceso al servicio remoto requerido por esta responsabilidad. */
  private readonly api = inject(AdministracionCatalogosService);

  /** Proporciona acceso al servicio de mensajes. */
  private readonly mensajes = inject(MensajesService);

  /** Proporciona acceso al servicio de notificador errores API. */
  private readonly errores = inject(NotificadorErroresApiService);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destruir = inject(DestroyRef);

  /** Conserva tipos como estado reactivo de la instancia. */
  protected readonly tipos = signal<Catalogo[]>([]);

  /** Conserva valores como estado reactivo de la instancia. */
  protected readonly valores = signal<ValorCatalogo[]>([]);

  /** Conserva seleccionado ID como estado reactivo de la instancia. */
  protected readonly seleccionadoId = signal<number | null>(null);

  /** Conserva cargando como estado reactivo de la instancia. */
  protected readonly cargando = signal(false);

  /** Conserva ocupado como estado reactivo de la instancia. */
  protected readonly ocupado = signal(false);

  /** Conserva error carga como estado reactivo de la instancia. */
  protected readonly errorCarga = signal(false);

  /** Conserva editor como estado reactivo de la instancia. */
  protected readonly editor = signal<ContextoEditor | null>(null);

  /** Deriva bloqueado a partir del estado vigente. */
  protected readonly bloqueado = computed(() => this.cargando() || this.ocupado());

  /** Conserva seleccionado para coordinar esta responsabilidad. */
  protected readonly seleccionado = computed<Catalogo | null>(
    () =>
      this.tipos().find((t) => t.id === this.seleccionadoId()) ??
      this.tipos().find((t) => t.activo) ??
      this.tipos()[0] ??
      null,
  );

  /** Deriva valores seleccionados a partir del estado vigente. */
  protected readonly valoresSeleccionados = computed(() =>
    this.valores().filter((valor) => valor.catalogoTipoId === this.seleccionado()?.id),
  );

  /** Deriva opciones activas por tipo a partir del estado vigente. */
  private readonly opcionesActivasPorTipo = computed(() => {
    const cantidades = new Map<number, number>();
    for (const valor of this.valores()) {
      if (valor.activo) {
        cantidades.set(valor.catalogoTipoId, (cantidades.get(valor.catalogoTipoId) ?? 0) + 1);
      }
    }
    return cantidades;
  });

  /** Recupera la fotografía inicial cuando el router activa la página. */
  public ngOnInit(): void {
    this.cargar();
  }

  /** Impide consultas superpuestas y cancela la suscripción al abandonar la página. */
  protected cargar(): void {
    if (this.bloqueado() || this.editor()) return;
    this.cargando.set(true);
    this.errorCarga.set(false);
    forkJoin({ tipos: this.api.obtenerTipos(), valores: this.api.obtenerValores() })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destruir),
      )
      .subscribe({
        next: (datos) => {
          const seleccionAnterior = this.seleccionado()?.id;
          this.tipos.set(this.ordenar(datos.tipos));
          this.valores.set(this.ordenar(datos.valores));
          this.seleccionadoId.set(
            seleccionAnterior ??
              this.tipos().find((tipo) => tipo.activo)?.id ??
              this.tipos()[0]?.id ??
              null,
          );
        },
        error: () => {
          this.errorCarga.set(true);
        },
      });
  }

  /** Cambia el catálogo utilizado como contexto del panel de opciones. */
  protected seleccionar(tipo: Catalogo): void {
    if (this.bloqueado() || this.editor()) return;
    this.seleccionadoId.set(tipo.id);
  }

  /** Resume las opciones disponibles con la concordancia correspondiente. */
  protected resumirOpcionesActivas(tipoId: number): string {
    const cantidad = this.opcionesActivasPorTipo().get(tipoId) ?? 0;
    return cantidad === 1 ? '1 opción activa' : `${cantidad} opciones activas`;
  }

  /** Abre la creación o edición de un tipo con su fotografía confirmada. */
  protected abrirTipo(entidad: Catalogo | null = null): void {
    if (!this.bloqueado() && !this.errorCarga() && !this.editor())
      this.editor.set({ clase: ClaseCatalogo.Tipo, entidad });
  }

  /** Abre una opción dentro del catálogo seleccionado cuando el estado lo permite. */
  protected abrirValor(entidad: ValorCatalogo | null = null): void {
    const padre = this.seleccionado();
    if (!padre || this.bloqueado() || this.editor() || (!entidad && !padre.activo)) return;
    this.editor.set({ clase: ClaseCatalogo.Valor, entidad, padre });
  }

  /** Cierra una edición disponible sin modificar la fotografía de la página. */
  protected cerrarEditor(): void {
    if (!this.ocupado()) this.editor.set(null);
  }

  /** La identidad y el estado proceden del contexto abierto, nunca del formulario. */
  protected guardar(datos: DatosCatalogo): void {
    const contexto = this.editor();
    if (!contexto || this.bloqueado()) return;
    if (contexto.clase === ClaseCatalogo.Tipo) {
      this.mutar(this.api.guardarTipo(datos, contexto.entidad), (entidad) => {
        this.tipos.update((lista) => this.reemplazar(lista, entidad));
        this.seleccionadoId.set(entidad.id);
        this.valores.update((lista) =>
          lista.map((v) =>
            v.catalogoTipoId === entidad.id ? { ...v, catalogoTipoNombre: entidad.nombre } : v,
          ),
        );
      });
    } else {
      this.mutar(this.api.guardarValor(datos, contexto.padre.id, contexto.entidad), (entidad) => {
        this.valores.update((lista) => this.reemplazar(lista, entidad));
      });
    }
  }

  /** Reserva la operación antes de confirmar para impedir decisiones o envíos duplicados. */
  protected async cambiarEstadoTipo(tipo: Catalogo): Promise<void> {
    if (this.bloqueado() || this.editor()) return;
    this.ocupado.set(true);
    const confirmado =
      !tipo.activo ||
      (await this.mensajes.confirmarDestructiva(
        `Desactivar ${tipo.nombre}`,
        'El catálogo dejará de estar disponible. Sus opciones activas deben desactivarse primero.',
        'Desactivar',
      ));
    if (this.destruir.destroyed) return;
    this.ocupado.set(false);
    if (!confirmado) return;
    this.mutar(
      tipo.activo ? this.api.inactivarTipo(tipo.id) : this.api.guardarTipo(tipo, tipo, true),
      (entidad) => this.tipos.update((lista) => this.reemplazar(lista, entidad)),
    );
  }

  /** Activa directamente o confirma la inactivación de una opción. */
  protected async cambiarEstadoValor(valor: ValorCatalogo): Promise<void> {
    if (this.bloqueado() || this.editor()) return;
    this.ocupado.set(true);
    const confirmado =
      !valor.activo ||
      (await this.mensajes.confirmarDestructiva(
        `Desactivar ${valor.nombre}`,
        'La opción dejará de estar disponible para nuevas selecciones y se conservará en registros históricos.',
        'Desactivar',
      ));
    if (this.destruir.destroyed) return;
    this.ocupado.set(false);
    if (!confirmado) return;
    this.mutar(
      valor.activo
        ? this.api.inactivarValor(valor.id)
        : this.api.guardarValor(valor, valor.catalogoTipoId, valor, true),
      (entidad) => this.valores.update((lista) => this.reemplazar(lista, entidad)),
    );
  }

  /** Aplica una mutación confirmada y conserva el editor cuando la solicitud falla. */
  private mutar<T>(solicitud: Observable<T>, aplicar: (entidad: T) => void): void {
    if (this.bloqueado()) return;
    this.ocupado.set(true);
    solicitud
      .pipe(
        finalize(() => this.ocupado.set(false)),
        takeUntilDestroyed(this.destruir),
      )
      .subscribe({
        next: (entidad) => {
          aplicar(entidad);
          this.editor.set(null);
          void this.mensajes.exito(
            'Cambios guardados',
            'La configuración se actualizó correctamente.',
          );
        },
        error: (error) => this.errores.comunicar(error, ERRORES_CATALOGOS.guardado),
      });
  }

  /** Mantiene las colecciones en orden alfabético estable para su presentación. */
  private ordenar<T extends Catalogo>(lista: readonly T[]): T[] {
    return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  /** Sustituye una entidad por identidad después de una respuesta confirmada. */
  private reemplazar<T extends Catalogo>(lista: T[], entidad: T): T[] {
    return this.ordenar([...lista.filter((e) => e.id !== entidad.id), entidad]);
  }
}
