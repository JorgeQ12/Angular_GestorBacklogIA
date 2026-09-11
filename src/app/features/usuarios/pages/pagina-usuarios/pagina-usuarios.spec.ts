import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import type { FormControl } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { CatalogosService } from '../../../../core/catalogos/services/catalogos.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import {
  NotificadorErroresApiService,
} from '../../../../core/mensajes/services/notificador-errores-api.service';
import { EditorUsuario } from '../../components/editor-usuario/editor-usuario';
import type { DatosUsuario, Usuario } from '../../models/usuario.model';
import { AdministracionUsuariosService } from '../../services/administracion-usuarios.service';
import { PaginaUsuarios } from './pagina-usuarios';

describe('Página de usuarios', () => {
  const usuario: Usuario = {
    id: 12,
    idAzure: 'azure-12',
    nombre: 'Ana Torres',
    correo: 'ana@empresa.com',
    perfilTecnicoId: 36,
    perfilTecnicoCodigo: 'perfil_qa',
    perfilTecnicoNombre: 'QA',
    limiteTokensMensual: 250000,
    activo: true,
    fechaCreacion: '2026-09-10T10:00:00Z',
    fechaActualizacion: null,
  };
  const inactivo = { ...usuario, id: 13, nombre: 'Bruno López', activo: false };
  const perfiles = [{ id: 36, nombre: 'QA', descripcion: 'Aseguramiento de calidad' }];
  const datos: DatosUsuario = {
    idAzure: 'azure-20',
    nombre: 'Laura Díaz',
    correo: 'laura@empresa.com',
    perfilTecnicoId: 36,
    limiteTokensMensual: null,
  };
  const api = {
    obtenerUsuarios: vi.fn(),
    guardar: vi.fn(),
    inactivar: vi.fn(),
  };
  const catalogos = { obtenerOpciones: vi.fn() };
  const confirmar = vi.fn();
  const exito = vi.fn();
  const comunicar = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    api.obtenerUsuarios.mockReturnValue(of([usuario, inactivo]));
    catalogos.obtenerOpciones.mockReturnValue(of(perfiles));
    confirmar.mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [
        { provide: AdministracionUsuariosService, useValue: api },
        { provide: CatalogosService, useValue: catalogos },
        {
          provide: MensajesService,
          useValue: { confirmarDestructiva: confirmar, exito },
        },
        { provide: NotificadorErroresApiService, useValue: { comunicar } },
      ],
    });
  });

  function crear() {
    const fixture = TestBed.createComponent(PaginaUsuarios);
    fixture.detectChanges();
    return fixture;
  }

  it('carga ambos estados, perfiles y la tabla administrativa completa', () => {
    const fixture = crear();
    const root = fixture.nativeElement as HTMLElement;
    const columnas = Array.from(root.querySelectorAll('th')).map((th) => th.textContent?.trim());

    expect(columnas).toEqual([
      'Usuario',
      'Identidad Azure',
      'Perfil técnico',
      'Límite mensual',
      'Estado',
      'Acciones',
    ]);
    expect(root.textContent).toContain('Ana Torres');
    expect(root.textContent).toContain('Bruno López');
    expect(root.textContent).toContain('250,000 tokens');
    expect(api.obtenerUsuarios).toHaveBeenCalledTimes(1);
    expect(catalogos.obtenerOpciones).toHaveBeenCalledWith('identidad_perfil_tecnico');
  });

  it('filtra por nombre y perfil ignorando mayúsculas y tildes', async () => {
    const fixture = crear();
    establecerBusqueda(fixture.componentInstance, 'BRUNO LOPEZ');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Ana Torres');
    expect(fixture.nativeElement.textContent).toContain('Bruno López');
    expect(fixture.nativeElement.textContent).toContain('1 de 2 visibles');
  });

  it('reemplaza toda la página por el error inicial y permite reintentar sin modal', () => {
    api.obtenerUsuarios.mockReturnValueOnce(throwError(() => new Error('fallo')));
    const fixture = crear();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('app-estado-error')).not.toBeNull();
    expect(root.querySelector('app-estado-error')?.classList).toContain(
      'estado-error--pagina-completa',
    );
    expect(root.querySelector('app-encabezado-pagina')).toBeNull();
    expect(root.querySelector('.usuarios__panel')).toBeNull();
    pulsar(root, 'Reintentar');
    fixture.detectChanges();
    expect(root.querySelector('app-encabezado-pagina')).not.toBeNull();
    expect(comunicar).not.toHaveBeenCalled();
  });

  it('presenta el estado vacío de datos y el de búsqueda sin resultados', async () => {
    api.obtenerUsuarios.mockReturnValueOnce(of([]));
    const vacio = crear();
    expect(vacio.nativeElement.textContent).toContain('Aún no hay usuarios');
    vacio.destroy();

    api.obtenerUsuarios.mockReturnValueOnce(of([usuario]));
    const filtrado = crear();
    establecerBusqueda(filtrado.componentInstance, 'inexistente');
    await filtrado.whenStable();
    filtrado.detectChanges();
    expect(filtrado.nativeElement.textContent).toContain('Sin coincidencias');
  });

  it('crea desde el editor y actualiza la fotografía sin recargar la lista', () => {
    const guardado = {
      ...usuario,
      id: 20,
      idAzure: datos.idAzure,
      nombre: datos.nombre,
      correo: datos.correo,
      limiteTokensMensual: null,
    };
    api.guardar.mockReturnValue(of(guardado));
    const fixture = crear();
    pulsar(fixture.nativeElement, 'Crear usuario');
    fixture.detectChanges();
    const editor = fixture.debugElement.query(By.directive(EditorUsuario))
      .componentInstance as EditorUsuario;

    editor.guardar.emit(datos);
    fixture.detectChanges();

    expect(api.guardar).toHaveBeenCalledWith(datos, null);
    expect(fixture.nativeElement.querySelector('app-editor-usuario')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Laura Díaz');
    expect(api.obtenerUsuarios).toHaveBeenCalledTimes(1);
  });

  it('conserva el editor y bloquea un segundo envío cuando guardar falla', () => {
    const pendiente = new Subject<Usuario>();
    api.guardar.mockReturnValue(pendiente);
    const fixture = crear();
    pulsar(fixture.nativeElement, 'Crear usuario');
    fixture.detectChanges();
    const editor = fixture.debugElement.query(By.directive(EditorUsuario))
      .componentInstance as EditorUsuario;

    editor.guardar.emit(datos);
    editor.guardar.emit(datos);
    fixture.detectChanges();
    expect(api.guardar).toHaveBeenCalledTimes(1);
    const nombre = fixture.nativeElement.querySelector('#usuario-nombre') as HTMLInputElement;
    expect(nombre.disabled).toBe(true);
    pendiente.error(new Error('conflicto'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-editor-usuario')).not.toBeNull();
    expect(comunicar).toHaveBeenCalledTimes(1);
  });

  it('confirma la inactivación y reactiva sin confirmación usando la actualización', async () => {
    api.inactivar.mockReturnValue(of({ ...usuario, activo: false }));
    api.guardar.mockReturnValue(of({ ...inactivo, activo: true }));
    const fixture = crear();

    pulsarEtiqueta(fixture.nativeElement, 'Desactivar Ana Torres');
    await Promise.resolve();
    fixture.detectChanges();
    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(api.inactivar).toHaveBeenCalledWith(usuario.id);

    pulsarEtiqueta(fixture.nativeElement, 'Activar Bruno López');
    fixture.detectChanges();
    expect(api.guardar).toHaveBeenCalledWith(
      expect.objectContaining({ perfilTecnicoId: 36 }),
      inactivo,
      true,
    );
    expect(confirmar).toHaveBeenCalledTimes(1);
  });

  it('abre la edición para completar un perfil faltante antes de activar', () => {
    api.obtenerUsuarios.mockReturnValueOnce(
      of([{ ...inactivo, perfilTecnicoId: null, perfilTecnicoNombre: null }]),
    );
    const fixture = crear();

    pulsarEtiqueta(fixture.nativeElement, 'Activar Bruno López');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-editor-usuario')).not.toBeNull();
    expect(api.guardar).not.toHaveBeenCalled();
  });

  it('cancela la consulta al destruir la página', () => {
    const consulta = new Subject<Usuario[]>();
    api.obtenerUsuarios.mockReturnValueOnce(consulta);
    const fixture = crear();
    expect(consulta.observed).toBe(true);
    fixture.destroy();
    expect(consulta.observed).toBe(false);
  });
});

function pulsar(root: HTMLElement, texto: string): void {
  const boton = Array.from(root.querySelectorAll('button')).find(
    (elemento) => elemento.textContent?.trim() === texto,
  );
  expect(boton).toBeDefined();
  boton?.click();
}

function pulsarEtiqueta(root: HTMLElement, etiqueta: string): void {
  const boton = root.querySelector<HTMLButtonElement>(`button[aria-label="${etiqueta}"]`);
  expect(boton).not.toBeNull();
  boton?.click();
}

function establecerBusqueda(componente: PaginaUsuarios, valor: string): void {
  (componente as unknown as { busqueda: FormControl<string> }).busqueda.setValue(valor);
}
