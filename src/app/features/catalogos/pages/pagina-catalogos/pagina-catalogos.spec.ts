import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { Catalogo } from '../../models/catalogo.model';
import { AdministracionCatalogosService } from '../../services/administracion-catalogos.service';
import { PaginaCatalogos } from './pagina-catalogos';

describe('Página de catálogos', () => {
  const tipo = { id: 51, nombre: 'Áreas', descripcion: 'Áreas de operación', activo: true };
  const valor = {
    ...tipo,
    id: 83,
    nombre: 'Logística',
    catalogoTipoId: 51,
    catalogoTipoNombre: 'Áreas',
  };
  const api = {
    obtenerTipos: vi.fn(),
    obtenerValores: vi.fn(),
    guardarTipo: vi.fn(),
    guardarValor: vi.fn(),
    inactivarTipo: vi.fn(),
    inactivarValor: vi.fn(),
  };
  const comunicar = vi.fn();
  const confirmar = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    api.obtenerTipos.mockReturnValue(
      of([tipo, { ...tipo, id: 52, nombre: 'Archivados', activo: false }]),
    );
    api.obtenerValores.mockReturnValue(of([valor]));
    TestBed.configureTestingModule({
      providers: [
        { provide: AdministracionCatalogosService, useValue: api },
        { provide: NotificadorErroresApiService, useValue: { comunicar } },
        { provide: MensajesService, useValue: { exito: vi.fn(), confirmarDestructiva: confirmar } },
      ],
    });
  });
  const crear = () => {
    const fixture = TestBed.createComponent(PaginaCatalogos);
    fixture.detectChanges();
    return fixture;
  };
  it('presenta los catálogos de ambos estados y sus opciones', () => {
    const f = crear();
    const root = f.nativeElement as HTMLElement;
    const columnas = Array.from(root.querySelectorAll<HTMLTableCellElement>('th')).map(
      (encabezado) => encabezado.textContent?.trim(),
    );
    expect(columnas).toEqual(['Título', 'Descripción', 'Estado', 'Acciones']);
    expect(f.nativeElement.textContent).toContain('Logística');
    expect(f.nativeElement.textContent).toContain('Archivados');
    expect(root.querySelectorAll('.ui-table__action-group .ui-button--secondary')).toHaveLength(2);
    expect(root.querySelector('.ui-table app-indicador-estado')).not.toBeNull();
  });

  it('resume el contenido del aside sin una acción manual de actualización', () => {
    const f = crear();
    const root = f.nativeElement as HTMLElement;
    const resumenes = Array.from(root.querySelectorAll('.catalogos__tipo-resumen')).map(
      (elemento) => elemento.textContent?.trim(),
    );

    expect(root.querySelector('.catalogos__total')?.textContent?.trim()).toBe('2 en total');
    expect(root.textContent).toContain('Selecciona uno para administrarlo');
    expect(resumenes).toEqual(expect.arrayContaining(['1 opción activa', '0 opciones activas']));
    expect(root.querySelector('.catalogos__tipo-descripcion')).toBeNull();
    expect(root.querySelector('[aria-label="Actualizar catálogos"]')).toBeNull();
  });

  it('reúne las acciones con texto en el encabezado y no presenta footer en el detalle', () => {
    const f = crear();
    const encabezado = f.nativeElement.querySelector('.catalogos__encabezado') as HTMLElement;
    const acciones = encabezado.querySelectorAll('.catalogos__acciones-catalogo button');
    const pie = f.nativeElement.querySelector('.catalogos__detalle-panel .catalogos__pie');

    expect(encabezado.querySelector('app-campo-busqueda')).toBeNull();
    expect(acciones).toHaveLength(3);
    expect(Array.from(acciones).map((accion) => accion.textContent?.trim())).toEqual([
      'Editar',
      'Desactivar',
      'Crear opción',
    ]);
    expect(acciones[1].classList).toContain('ui-button--secondary');
    expect(pie).toBeNull();
  });

  it('distingue error de consulta y permite reintentar', () => {
    api.obtenerTipos.mockReturnValueOnce(throwError(() => new Error('fallo')));
    const f = crear();
    const root = f.nativeElement as HTMLElement;
    const error = root.querySelector<HTMLElement>('app-estado-error');
    expect(error).not.toBeNull();
    expect(error?.classList.contains('estado-error--pagina-completa')).toBe(true);
    expect(root.querySelector('app-encabezado-pagina')).toBeNull();
    expect(root.querySelector('.catalogos__recorrido')).toBeNull();
    expect(root.querySelector('app-estado-vacio')).toBeNull();
    expect(root.querySelector('.catalogos')?.getAttribute('aria-label')).toBe(
      'Estado de carga de catálogos',
    );
    pulsar(f.nativeElement, 'Reintentar');
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Logística');
    expect(f.nativeElement.querySelector('app-encabezado-pagina')).not.toBeNull();
    expect(comunicar).not.toHaveBeenCalled();
  });
  it('conserva la edición al fallar y evita enviar dos veces mientras guarda', () => {
    const pendiente = new Subject<Catalogo>();
    api.guardarTipo.mockReturnValue(pendiente);
    const f = crear();
    pulsar(f.nativeElement, 'Crear catálogo');
    f.detectChanges();
    escribir(f.nativeElement, '#catalogo-nombre', 'Nuevo');
    escribir(f.nativeElement, '#catalogo-descripcion', 'Descripción');
    const form = f.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    f.detectChanges();
    expect(api.guardarTipo).toHaveBeenCalledTimes(1);
    expect(f.nativeElement.querySelector('#catalogo-nombre').disabled).toBe(true);
    pendiente.error(new Error('conflicto'));
    f.detectChanges();
    expect(f.nativeElement.querySelector('#catalogo-nombre').value).toBe('Nuevo');
    expect(f.nativeElement.querySelector('#catalogo-nombre').disabled).toBe(false);
    expect(comunicar).toHaveBeenCalledTimes(1);
  });
  it('actualiza la fotografía confirmada y cierra el editor después del éxito', () => {
    api.guardarTipo.mockReturnValue(of({ ...tipo, id: 60, nombre: 'Nuevo' }));
    const f = crear();
    pulsar(f.nativeElement, 'Crear catálogo');
    f.detectChanges();
    escribir(f.nativeElement, '#catalogo-nombre', 'Nuevo');
    escribir(f.nativeElement, '#catalogo-descripcion', 'Descripción');
    f.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    f.detectChanges();
    expect(f.nativeElement.querySelector('app-editor-catalogo')).toBeNull();
    expect(f.nativeElement.textContent).toContain('Nuevo');
    expect(api.obtenerTipos).toHaveBeenCalledTimes(1);
  });
  it('no ejecuta una confirmación pendiente después de abandonar la página', async () => {
    let resolver!: (valor: boolean) => void;
    confirmar.mockReturnValue(new Promise<boolean>((r) => (resolver = r)));
    const f = crear();
    pulsarEtiqueta(f.nativeElement, 'Desactivar Áreas');
    f.detectChanges();
    expect(confirmar).toHaveBeenCalledTimes(1);
    f.destroy();
    resolver(true);
    await Promise.resolve();
    expect(api.inactivarTipo).not.toHaveBeenCalled();
  });
  it('cancela la consulta al destruir la página', () => {
    const consulta = new Subject<Catalogo[]>();
    api.obtenerTipos.mockReturnValue(consulta);
    const f = crear();
    expect(consulta.observed).toBe(true);
    f.destroy();
    expect(consulta.observed).toBe(false);
  });
});
function pulsar(root: HTMLElement, texto: string) {
  const boton = Array.from(root.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === texto,
  );
  expect(boton).toBeDefined();
  boton!.click();
}
function pulsarEtiqueta(root: HTMLElement, etiqueta: string) {
  const boton = root.querySelector<HTMLButtonElement>(`button[aria-label="${etiqueta}"]`);
  expect(boton).not.toBeNull();
  boton!.click();
}
function escribir(root: HTMLElement, selector: string, valor: string) {
  const input = root.querySelector<HTMLInputElement>(selector)!;
  input.value = valor;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
