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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { CatalogosService } from '../../../../core/catalogos/services/catalogos.service';
import { CodigoTipoCatalogoUsuarios } from '../../../../core/catalogos/models/codigo-tipo-catalogo-usuarios.enum';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { EncabezadoPagina } from '../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../shared/components/estado-error/estado-error';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { CampoBusqueda } from '../../../../shared/forms/controles/campo-busqueda/campo-busqueda';
import type { OpcionSelector } from '../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { EditorUsuario } from '../../components/editor-usuario/editor-usuario';
import { TablaUsuarios } from '../../components/tabla-usuarios/tabla-usuarios';
import { ERRORES_USUARIOS } from '../../config/usuarios.config';
import type {
  CambioPaginaUsuarios,
  ConsultaUsuarios,
  DatosUsuario,
  EditorUsuario as ContextoEditor,
  PaginaUsuarios as ResultadoPaginaUsuarios,
  Usuario,
} from '../../models/usuario.model';
import { UsuariosService } from '../../services/usuarios.service';

/** Coordina la administración local de personas, perfiles y límites de tokens. */
@Component({
  selector: 'app-pagina-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    EncabezadoPagina,
    EstadoError,
    EstadoVacio,
    IconoComponent,
    CampoBusqueda,
    EditorUsuario,
    TablaUsuarios,
  ],
  templateUrl: './pagina-usuarios.html',
  styleUrl: './pagina-usuarios.css',
})
export class PaginaUsuarios implements OnInit {
  /** Ejecuta las operaciones de consulta y mantenimiento de usuarios. */
  private readonly api = inject(UsuariosService);

  /** Obtiene los perfiles técnicos disponibles desde el catálogo central. */
  private readonly catalogos = inject(CatalogosService);

  /** Presenta confirmaciones y resultados de las acciones del usuario. */
  private readonly mensajes = inject(MensajesService);

  /** Traduce los errores del API en mensajes consistentes para la interfaz. */
  private readonly errores = inject(NotificadorErroresApiService);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destruir = inject(DestroyRef);

  /** Mantiene la página de usuarios confirmada por el backend. */
  protected readonly pagina = signal<ResultadoPaginaUsuarios | null>(null);

  /** Mantiene las opciones activas de perfil técnico disponibles para edición. */
  protected readonly perfilesTecnicos = signal<readonly OpcionSelector[]>([]);

  /** Indica que la fotografía inicial o una recarga está en curso. */
  protected readonly cargando = signal(false);

  /** Indica que existe una creación, actualización o cambio de estado en curso. */
  protected readonly ocupado = signal(false);

  /** Indica que no fue posible obtener los datos necesarios para presentar la página. */
  protected readonly errorCarga = signal(false);

  /** Conserva el contexto de creación o edición que se encuentra abierto. */
  protected readonly editor = signal<ContextoEditor | null>(null);

  /** Recibe el criterio utilizado para filtrar el listado de usuarios. */
  protected readonly terminoBusqueda = new FormControl('', { nonNullable: true });

  /** Conserva el criterio normalizado que corresponde a la consulta vigente. */
  protected readonly busqueda = signal('');

  /** Conserva la página solicitada aunque todavía no exista una respuesta. */
  private readonly paginaSolicitada = signal(1);

  /** Cancela la consulta anterior cuando cambia el criterio o la página. */
  private readonly solicitudesUsuarios = new Subject<ConsultaUsuarios>();

  /** Impide acciones concurrentes mientras se consulta o persiste información. */
  protected readonly bloqueado = computed(() => this.cargando() || this.ocupado());

  /** Expone únicamente los registros que pertenecen a la página vigente. */
  protected readonly usuarios = computed(() => this.pagina()?.usuarios ?? []);

  /** Habilita la creación únicamente cuando la página y sus catálogos están disponibles. */
  protected readonly puedeCrear = computed(
    () => !this.bloqueado() && !this.errorCarga() && this.perfilesTecnicos().length > 0,
  );

  /** Incluye temporalmente el perfil inactivo del usuario para permitir una edición coherente. */
  protected readonly perfilesTecnicosEditor = computed<readonly OpcionSelector[]>(() => {
    const perfiles = this.perfilesTecnicos();
    const usuario = this.editor()?.entidad;
    if (
      !usuario?.perfilTecnicoId ||
      perfiles.some((perfil) => perfil.valor === usuario.perfilTecnicoId)
    ) {
      return perfiles;
    }
    return [
      ...perfiles,
      {
        valor: usuario.perfilTecnicoId,
        etiqueta: usuario.perfilTecnicoNombre ?? 'Perfil no disponible',
        descripcion: 'Perfil inactivo; selecciona uno vigente para guardar.',
        deshabilitada: true,
      },
    ];
  });

  /** Recupera usuarios y perfiles cuando el router activa la página. */
  public ngOnInit(): void {
    this.configurarConsultasUsuarios();
    this.configurarBusqueda();
    this.cargar();
  }

  /** Obtiene una fotografía coherente e impide consultas superpuestas. */
  protected cargar(): void {
    if (this.bloqueado() || this.editor()) return;
    this.cargando.set(true);
    this.errorCarga.set(false);
    forkJoin({
      pagina: this.api.obtenerTodos(this.crearConsulta()),
      perfiles: this.catalogos.obtenerOpciones(CodigoTipoCatalogoUsuarios.PerfilTecnico),
    })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destruir),
      )
      .subscribe({
        next: ({ pagina, perfiles }) => {
          this.pagina.set(pagina);
          this.perfilesTecnicos.set(
            perfiles.map((perfil) => ({
              valor: perfil.id,
              etiqueta: perfil.nombre,
              descripcion: perfil.descripcion,
            })),
          );
        },
        error: () => this.errorCarga.set(true),
      });
  }

  /** Solicita otra página conservando el criterio de búsqueda actual. */
  protected cambiarPagina(cambio: CambioPaginaUsuarios): void {
    if (this.bloqueado() || this.editor() || cambio.pagina === this.paginaSolicitada()) return;
    this.paginaSolicitada.set(cambio.pagina);
    this.solicitarUsuarios();
  }

  /** Abre una creación cuando existen perfiles técnicos seleccionables. */
  protected crear(): void {
    if (this.puedeCrear() && !this.editor()) this.editor.set({ entidad: null });
  }

  /** Abre la edición desde la fotografía confirmada del listado. */
  protected editar(usuario: Usuario): void {
    if (!this.bloqueado() && !this.editor()) this.editor.set({ entidad: usuario });
  }

  /** Cierra el formulario sin alterar los datos persistidos. */
  protected cerrarEditor(): void {
    if (!this.ocupado()) this.editor.set(null);
  }

  /** Persiste los datos utilizando la identidad del contexto abierto. */
  protected guardar(datos: DatosUsuario): void {
    const contexto = this.editor();
    if (!contexto || this.bloqueado()) return;
    this.mutar(
      this.api.guardar(datos, contexto.entidad),
      'Usuario guardado',
      'La información del usuario se actualizó correctamente.',
      ERRORES_USUARIOS.guardado,
    );
  }

  /** Confirma la baja lógica y reactiva directamente registros inactivos. */
  protected async cambiarEstado(usuario: Usuario): Promise<void> {
    if (this.bloqueado() || this.editor()) return;
    if (!usuario.activo && (!usuario.perfilTecnicoId || usuario.perfilTecnicoId <= 0)) return;
    this.ocupado.set(true);
    const confirmado =
      !usuario.activo ||
      (await this.mensajes.confirmarDestructiva(
        `Inactivar ${usuario.nombre}`,
        'El usuario no podrá utilizar las capacidades que dependan de su registro local. Su historial se conservará.',
        'Inactivar',
      ));
    if (this.destruir.destroyed) return;
    this.ocupado.set(false);
    if (!confirmado) return;
    this.mutar(
      usuario.activo ? this.api.inactivar(usuario.id) : this.api.activar(usuario),
      usuario.activo ? 'Usuario inactivado' : 'Usuario activado',
      `El usuario ${usuario.nombre} quedó ${usuario.activo ? 'inactivo' : 'activo'}.`,
      ERRORES_USUARIOS.estado,
    );
  }

  /** Aplica exclusivamente la respuesta confirmada y conserva el editor ante fallos. */
  private mutar(
    solicitud: Observable<Usuario>,
    tituloExito: string,
    descripcionExito: string,
    mensajeError: { readonly titulo: string; readonly descripcion: string },
  ): void {
    if (this.bloqueado()) return;
    let completada = false;
    this.ocupado.set(true);
    solicitud
      .pipe(
        finalize(() => {
          this.ocupado.set(false);
          if (completada && !this.destruir.destroyed) this.solicitarUsuarios();
        }),
        takeUntilDestroyed(this.destruir),
      )
      .subscribe({
        next: () => {
          completada = true;
          this.editor.set(null);
          void this.mensajes.exito(tituloExito, descripcionExito);
        },
        error: (error) => this.errores.comunicar(error, mensajeError),
      });
  }

  /** Conecta el criterio escrito con una nueva consulta desde la primera página. */
  private configurarBusqueda(): void {
    this.terminoBusqueda.valueChanges
      .pipe(
        map((valor) => valor.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destruir),
      )
      .subscribe((busqueda) => {
        this.busqueda.set(busqueda);
        this.paginaSolicitada.set(1);
        this.solicitarUsuarios();
      });
  }

  /** Atiende la última consulta y descarta automáticamente cualquier respuesta anterior. */
  private configurarConsultasUsuarios(): void {
    this.solicitudesUsuarios
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.errorCarga.set(false);
        }),
        switchMap((consulta) =>
          this.api.obtenerTodos(consulta).pipe(
            map((pagina) => ({ pagina, error: false }) as const),
            catchError(() => of({ pagina: null, error: true } as const)),
          ),
        ),
        takeUntilDestroyed(this.destruir),
      )
      .subscribe((resultado) => {
        this.cargando.set(false);
        this.errorCarga.set(resultado.error);
        if (resultado.pagina) this.pagina.set(resultado.pagina);
      });
  }

  /** Emite la consulta vigente cuando ninguna edición puede perderse. */
  private solicitarUsuarios(): void {
    if (this.ocupado() || this.editor()) return;
    this.solicitudesUsuarios.next(this.crearConsulta());
  }

  /** Construye el contrato paginado con valores estables para el backend. */
  private crearConsulta(): ConsultaUsuarios {
    return {
      busqueda: this.busqueda(),
      incluirInactivos: true,
      paginaActual: this.paginaSolicitada(),
      paginaTamano: 10,
    };
  }
}
