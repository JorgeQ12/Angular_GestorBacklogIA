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
import { Observable, finalize, forkJoin } from 'rxjs';
import type { OpcionCatalogo } from '../../../../core/catalogos/models/opcion-catalogo.model';
import { CatalogosService } from '../../../../core/catalogos/services/catalogos.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import {
  NotificadorErroresApiService,
} from '../../../../core/mensajes/services/notificador-errores-api.service';
import type { ContextoErrorApi } from '../../../../core/mensajes/models/contexto-error-api.model';
import {
  EncabezadoPagina,
} from '../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../shared/components/estado-error/estado-error';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { CampoBusqueda } from '../../../../shared/forms/controles/campo-busqueda/campo-busqueda';
import { EditorUsuario } from '../../components/editor-usuario/editor-usuario';
import { TablaUsuarios } from '../../components/tabla-usuarios/tabla-usuarios';
import {
  CATALOGO_PERFILES_TECNICOS_USUARIO,
  ERRORES_USUARIOS,
} from '../../config/usuarios.config';
import type { DatosUsuario, Usuario } from '../../models/usuario.model';
import { AdministracionUsuariosService } from '../../services/administracion-usuarios.service';

/** Coordina la administración de usuarios desde fotografías confirmadas por el API. */
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
  private readonly api = inject(AdministracionUsuariosService);
  private readonly catalogos = inject(CatalogosService);
  private readonly mensajes = inject(MensajesService);
  private readonly errores = inject(NotificadorErroresApiService);
  private readonly destruir = inject(DestroyRef);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly perfilesTecnicos = signal<readonly OpcionCatalogo[]>([]);
  protected readonly cargando = signal(false);
  protected readonly ocupado = signal(false);
  protected readonly errorCarga = signal(false);
  protected readonly editor = signal<Usuario | null | undefined>(undefined);
  protected readonly busqueda = new FormControl('', { nonNullable: true });
  private readonly criterioBusqueda = signal('');
  protected readonly bloqueado = computed(() => this.cargando() || this.ocupado());
  protected readonly usuariosVisibles = computed(() => {
    const criterio = this.normalizar(this.criterioBusqueda());
    if (!criterio) return this.usuarios();

    return this.usuarios().filter((usuario) =>
      [
        usuario.nombre,
        usuario.correo,
        usuario.idAzure,
        usuario.perfilTecnicoNombre,
        usuario.perfilTecnicoCodigo,
      ].some((valor) => this.normalizar(valor).includes(criterio)),
    );
  });

  public constructor() {
    this.busqueda.valueChanges
      .pipe(takeUntilDestroyed(this.destruir))
      .subscribe((criterio) => this.criterioBusqueda.set(criterio));
  }

  /** Recupera usuarios y perfiles técnicos al activar la página. */
  public ngOnInit(): void {
    this.cargar();
  }

  /** Evita consultas superpuestas y trata cualquier fallo inicial como bloqueante. */
  protected cargar(): void {
    if (this.bloqueado() || this.editor() !== undefined) return;
    this.cargando.set(true);
    this.errorCarga.set(false);

    forkJoin({
      usuarios: this.api.obtenerUsuarios(),
      perfiles: this.catalogos.obtenerOpciones(CATALOGO_PERFILES_TECNICOS_USUARIO),
    })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destruir),
      )
      .subscribe({
        next: ({ usuarios, perfiles }) => {
          this.usuarios.set(this.ordenar(usuarios));
          this.perfilesTecnicos.set(perfiles);
        },
        error: () => this.errorCarga.set(true),
      });
  }

  /** Abre creación o edición únicamente con datos auxiliares disponibles. */
  protected abrirEditor(usuario: Usuario | null = null): void {
    if (this.bloqueado() || this.errorCarga() || this.editor() !== undefined) return;
    this.editor.set(usuario);
  }

  /** Cierra una edición disponible sin alterar los datos persistidos. */
  protected cerrarEditor(): void {
    if (!this.ocupado()) this.editor.set(undefined);
  }

  /** Persiste los valores del editor y conserva el estado vigente al actualizar. */
  protected guardar(datos: DatosUsuario): void {
    const usuario = this.editor();
    if (usuario === undefined || this.bloqueado()) return;

    this.mutar(
      this.api.guardar(datos, usuario),
      (guardado) => this.usuarios.update((lista) => this.reemplazar(lista, guardado)),
      ERRORES_USUARIOS.guardado,
      'La información del usuario se actualizó correctamente.',
    );
  }

  /** Activa directamente o confirma la inactivación antes de cambiar el estado. */
  protected async cambiarEstado(usuario: Usuario): Promise<void> {
    if (this.bloqueado() || this.editor() !== undefined) return;

    if (!usuario.activo) {
      if (
        usuario.perfilTecnicoId === null ||
        !this.perfilesTecnicos().some((perfil) => perfil.id === usuario.perfilTecnicoId)
      ) {
        this.abrirEditor(usuario);
        return;
      }
      this.activar(usuario, usuario.perfilTecnicoId);
      return;
    }

    this.ocupado.set(true);
    const confirmado = await this.mensajes.confirmarDestructiva(
      `Desactivar ${usuario.nombre}`,
      'El usuario no podrá consumir nuevas capacidades de la aplicación, ' +
        'pero su historial se conservará.',
      'Desactivar',
    );
    if (this.destruir.destroyed) return;
    this.ocupado.set(false);
    if (!confirmado) return;

    this.mutar(
      this.api.inactivar(usuario.id),
      (guardado) => this.usuarios.update((lista) => this.reemplazar(lista, guardado)),
      ERRORES_USUARIOS.estado,
      'El usuario quedó inactivo y su historial se conserva.',
    );
  }

  /** Reactiva un registro usando la actualización admitida por el backend. */
  private activar(usuario: Usuario, perfilTecnicoId: number): void {
    this.mutar(
      this.api.guardar(
        {
          idAzure: usuario.idAzure ?? '',
          nombre: usuario.nombre,
          correo: usuario.correo,
          perfilTecnicoId,
          limiteTokensMensual: usuario.limiteTokensMensual,
        },
        usuario,
        true,
      ),
      (guardado) => this.usuarios.update((lista) => this.reemplazar(lista, guardado)),
      ERRORES_USUARIOS.estado,
      'El usuario volvió a estar disponible.',
    );
  }

  /** Aplica una mutación confirmada y conserva el editor cuando la solicitud falla. */
  private mutar(
    solicitud: Observable<Usuario>,
    aplicar: (usuario: Usuario) => void,
    contextoError: ContextoErrorApi,
    descripcionExito: string,
  ): void {
    if (this.bloqueado()) return;
    this.ocupado.set(true);
    solicitud
      .pipe(
        finalize(() => this.ocupado.set(false)),
        takeUntilDestroyed(this.destruir),
      )
      .subscribe({
        next: (usuario) => {
          aplicar(usuario);
          this.editor.set(undefined);
          void this.mensajes.exito('Cambios guardados', descripcionExito);
        },
        error: (error) => this.errores.comunicar(error, contextoError),
      });
  }

  /** Mantiene la colección en orden alfabético estable. */
  private ordenar(usuarios: readonly Usuario[]): Usuario[] {
    return [...usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  /** Sustituye una entidad por identidad después de una respuesta confirmada. */
  private reemplazar(usuarios: Usuario[], usuario: Usuario): Usuario[] {
    return this.ordenar([...usuarios.filter((actual) => actual.id !== usuario.id), usuario]);
  }

  /** Permite búsquedas insensibles a mayúsculas y tildes. */
  private normalizar(valor: string | null | undefined): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('es')
      .trim();
  }
}
