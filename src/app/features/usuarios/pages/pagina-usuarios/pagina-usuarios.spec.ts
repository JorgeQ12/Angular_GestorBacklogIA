import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { CatalogosService } from '../../../../core/catalogos/services/catalogos.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { EditorUsuario } from '../../components/editor-usuario/editor-usuario';
import type { Usuario } from '../../models/usuario.model';
import { UsuariosService } from '../../services/usuarios.service';
import { PaginaUsuarios } from './pagina-usuarios';

describe('Página de usuarios', () => {
  const usuario: Usuario = {
    id: 7,
    idAzure: 'azure-7',
    nombre: 'Ada Lovelace',
    correo: 'ada@empresa.com',
    perfilTecnicoId: 32,
    perfilTecnicoCodigo: 'perfil_arquitectura',
    perfilTecnicoNombre: 'Arquitectura',
    limiteTokensMensual: 100000,
    activo: true,
    fechaCreacion: '2026-09-01T12:00:00Z',
    fechaActualizacion: null,
  };
  const api = {
    obtenerTodos: vi.fn(),
    obtener: vi.fn(),
    guardar: vi.fn(),
    inactivar: vi.fn(),
    activar: vi.fn(),
  };
  const catalogos = { obtenerOpciones: vi.fn() };
  const confirmar = vi.fn();
  const exito = vi.fn();
  const comunicar = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    api.obtenerTodos.mockReturnValue(of([usuario]));
    catalogos.obtenerOpciones.mockReturnValue(
      of([{ id: 32, nombre: 'Arquitectura', descripcion: 'Diseño técnico' }]),
    );
    confirmar.mockResolvedValue(true);
    exito.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: UsuariosService, useValue: api },
        { provide: CatalogosService, useValue: catalogos },
        { provide: MensajesService, useValue: { confirmarDestructiva: confirmar, exito } },
        { provide: NotificadorErroresApiService, useValue: { comunicar } },
      ],
    });
  });

  const crear = () => {
    const fixture = TestBed.createComponent(PaginaUsuarios);
    fixture.detectChanges();
    return fixture;
  };

  it('carga usuarios y perfiles, presenta la tabla y habilita la creación', () => {
    const fixture = crear();
    const root = fixture.nativeElement as HTMLElement;

    expect(api.obtenerTodos).toHaveBeenCalledTimes(1);
    expect(catalogos.obtenerOpciones).toHaveBeenCalledTimes(1);
    expect(root.textContent).toContain('Ada Lovelace');
    expect(root.textContent).toContain('Arquitectura');
    const botonCrear = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
      (boton) => boton.textContent?.includes('Crear usuario'),
    );
    expect(botonCrear?.disabled).toBe(false);
    expect(botonCrear?.classList).toContain('ui-button--on-inverse');
  });

  it('filtra por correo, identidad y perfil desde el buscador compartido', () => {
    api.obtenerTodos.mockReturnValue(
      of([usuario, { ...usuario, id: 8, nombre: 'Grace Hopper', correo: 'grace@empresa.com' }]),
    );
    const fixture = crear();
    const buscador = fixture.nativeElement.querySelector(
      'app-campo-busqueda input',
    ) as HTMLInputElement;
    buscador.value = 'grace@empresa.com';
    buscador.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Grace Hopper');
    expect(fixture.nativeElement.textContent).not.toContain('Ada Lovelace');
    expect(fixture.nativeElement.textContent).toContain('1 de 2 usuarios');
  });

  it('reemplaza toda la composición por un error reintentable cuando falla la carga', () => {
    api.obtenerTodos.mockReturnValueOnce(throwError(() => new Error('fallo')));
    const fixture = crear();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('app-encabezado-pagina')).toBeNull();
    expect(root.querySelector('app-tabla-usuarios')).toBeNull();
    expect(root.querySelector('app-estado-error')?.classList).toContain(
      'estado-error--pagina-completa',
    );
    (root.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(root.textContent).toContain('Ada Lovelace');
    expect(comunicar).not.toHaveBeenCalled();
  });

  it('impide crear sin perfiles activos y explica el bloqueo', () => {
    catalogos.obtenerOpciones.mockReturnValue(of([]));
    const fixture = crear();
    const root = fixture.nativeElement as HTMLElement;
    const boton = Array.from(
      root.querySelectorAll<HTMLButtonElement>('button'),
    ).find((actual) => actual.textContent?.includes('Crear usuario'))!;

    expect(boton.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('No hay perfiles técnicos activos');
  });

  it('conserva el editor y bloquea envíos duplicados cuando falla el guardado', () => {
    const pendiente = new Subject<Usuario>();
    api.guardar.mockReturnValue(pendiente);
    const fixture = crear();
    pulsar(fixture.nativeElement, 'Crear usuario');
    fixture.detectChanges();
    const editor = fixture.debugElement.query(By.directive(EditorUsuario)).componentInstance as EditorUsuario;
    const formulario = Reflect.get(editor, 'formulario') as FormGroup;
    formulario.setValue({
      idAzure: 'azure-8',
      nombre: 'Grace Hopper',
      correo: 'grace@empresa.com',
      perfilTecnicoId: 32,
      limiteTokensMensual: null,
    });
    const elementoFormulario = fixture.nativeElement.querySelector(
      '#formulario-usuario',
    ) as HTMLFormElement;
    elementoFormulario.dispatchEvent(new Event('submit'));
    elementoFormulario.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(api.guardar).toHaveBeenCalledTimes(1);
    expect((fixture.nativeElement.querySelector('#usuario-nombre') as HTMLInputElement).disabled).toBe(
      true,
    );
    pendiente.error(new Error('conflicto'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-editor-usuario')).not.toBeNull();
    expect(comunicar).toHaveBeenCalledTimes(1);
  });

  it('confirma la inactivación y aplica la respuesta del backend', async () => {
    api.inactivar.mockReturnValue(of({ ...usuario, activo: false }));
    const fixture = crear();
    (
      fixture.nativeElement.querySelector('[aria-label="Inactivar Ada Lovelace"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(api.inactivar).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.textContent).toContain('Inactivo');
  });

  it('cancela la consulta al destruir la página', () => {
    const consulta = new Subject<Usuario[]>();
    api.obtenerTodos.mockReturnValue(consulta);
    const fixture = crear();
    expect(consulta.observed).toBe(true);
    fixture.destroy();
    expect(consulta.observed).toBe(false);
  });
});

function pulsar(root: HTMLElement, texto: string): void {
  const boton = Array.from(root.querySelectorAll('button')).find(
    (actual) => actual.textContent?.trim() === texto,
  );
  expect(boton).toBeDefined();
  boton!.click();
}
