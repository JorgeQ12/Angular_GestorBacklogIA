import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, finalize, forkJoin } from 'rxjs';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { EncabezadoPagina } from '../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../shared/components/estado-error/estado-error';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { RegionDesplazable } from '../../../../shared/components/region-desplazable/region-desplazable';
import { CampoBusqueda } from '../../../../shared/forms/controles/campo-busqueda/campo-busqueda';
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
    ReactiveFormsModule,
    EncabezadoPagina,
    EstadoError,
    EstadoVacio,
    IconoComponent,
    RegionDesplazable,
    CampoBusqueda,
    EditorCatalogo,
    TablaOpcionesCatalogo,
  ],
  templateUrl: './pagina-catalogos.html',
  styleUrl: './pagina-catalogos.css',
})
export class PaginaCatalogos implements OnInit {
  private readonly api = inject(AdministracionCatalogosService);
  private readonly mensajes = inject(MensajesService);
  private readonly errores = inject(NotificadorErroresApiService);
  private readonly destruir = inject(DestroyRef);
  protected readonly tipos = signal<Catalogo[]>([]);
  protected readonly valores = signal<ValorCatalogo[]>([]);
  protected readonly seleccionadoId = signal<number | null>(null);
  protected readonly cargando = signal(false);
  protected readonly ocupado = signal(false);
  protected readonly errorCarga = signal(false);
  protected readonly editor = signal<ContextoEditor | null>(null);
  protected readonly buscarValores = new FormControl('', { nonNullable: true });
  private readonly terminoValor = toSignal(this.buscarValores.valueChanges, { initialValue: '' });
  protected readonly bloqueado = computed(() => this.cargando() || this.ocupado());
  protected readonly seleccionado = computed<Catalogo | null>(
    () =>
      this.tipos().find((t) => t.id === this.seleccionadoId()) ??
      this.tipos().find((t) => t.activo) ??
      this.tipos()[0] ??
      null,
  );
  protected readonly valoresVisibles = computed(() =>
    this.valores().filter(
      (v) => v.catalogoTipoId === this.seleccionado()?.id && this.coincide(v, this.terminoValor()),
    ),
  );

  constructor() {
    effect(() => {
      const opciones = { emitEvent: false };
      if (this.bloqueado()) {
        this.buscarValores.disable(opciones);
      } else {
        this.buscarValores.enable(opciones);
      }
    });
  }

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
        error: (error) => {
          this.errorCarga.set(true);
          this.errores.comunicar(error, ERRORES_CATALOGOS.carga);
        },
      });
  }

  /** Cambia el catálogo en contexto y reinicia los filtros de sus opciones. */
  protected seleccionar(tipo: Catalogo): void {
    if (this.bloqueado() || this.editor()) return;
    this.seleccionadoId.set(tipo.id);
    this.buscarValores.setValue('');
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
        this.buscarValores.setValue('');
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

  /** Evalúa nombre y descripción para localizar opciones del catálogo seleccionado. */
  private coincide(entidad: Catalogo, termino: string): boolean {
    const consulta = termino.trim().toLocaleLowerCase('es');
    return [entidad.nombre, entidad.descripcion].some((texto) =>
      texto.toLocaleLowerCase('es').includes(consulta),
    );
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
