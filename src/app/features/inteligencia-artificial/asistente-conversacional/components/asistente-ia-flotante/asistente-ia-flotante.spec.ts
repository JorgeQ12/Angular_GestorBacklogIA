import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EMPTY, Observable, of } from 'rxjs';
import {
  EstadoPropuestaAsistenteIa,
  type ResultadoResolucionPropuestaIa,
} from '../../models/asistente-ia.model';
import { EstadoAsistenteIaService } from '../../services/estado-asistente-ia.service';
import { AsistenteIaFlotante } from './asistente-ia-flotante';

describe('AsistenteIaFlotante', () => {
  const estado = {
    mensajes: signal([]),
    cargando: signal(false),
    errorCarga: signal(false),
    enviando: signal(false),
    mensajePendiente: signal<string | null>(null),
    propuestaProcesando: signal<number | null>(null),
    seleccionarProyecto: vi.fn(),
    cargar: vi.fn(),
    enviar: vi.fn(() => EMPTY),
    aplicar: vi.fn((): Observable<ResultadoResolucionPropuestaIa> => EMPTY),
    rechazar: vi.fn(() => EMPTY),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [AsistenteIaFlotante],
      providers: [{ provide: EstadoAsistenteIaService, useValue: estado }],
    });
  });

  it('reemplaza el acceso flotante por el panel mientras la conversación está abierta', () => {
    const fixture = TestBed.createComponent(AsistenteIaFlotante);
    fixture.componentRef.setInput('contexto', {
      proyectoId: 10,
      revisionContexto: 2,
      seccionActiva: 'necesidad',
      nombreSeccion: 'Necesidad de negocio',
    });
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const activador = elemento.querySelector<HTMLButtonElement>(
      '.asistente-ia-flotante__activador',
    );

    expect(activador?.getAttribute('aria-label')).toBe('Abrir Asistente IA');
    expect(activador?.getAttribute('data-etiqueta')).toBe('Asistente IA');
    activador?.click();
    fixture.detectChanges();

    expect(estado.cargar).toHaveBeenCalledWith(10);
    expect(elemento.querySelector('.asistente-ia-flotante__activador')).toBeNull();
    expect(elemento.querySelector('app-panel-asistente-ia')).not.toBeNull();
  });

  it('selecciona el proyecto de entrada y emite su identidad después de aplicar', () => {
    estado.aplicar.mockReturnValueOnce(
      of({
        proyectoId: 10,
        mensajeId: 9,
        estado: EstadoPropuestaAsistenteIa.Aplicada,
        revision: 3,
      }),
    );
    const fixture = TestBed.createComponent(AsistenteIaFlotante);
    fixture.componentRef.setInput('contexto', {
      proyectoId: 10,
      revisionContexto: 2,
      seccionActiva: 'necesidad',
      nombreSeccion: 'Necesidad de negocio',
    });
    fixture.detectChanges();
    const actualizado = vi.fn();
    fixture.componentInstance.contextoActualizado.subscribe(actualizado);

    (fixture.componentInstance as unknown as { aplicarPropuesta(id: number): void })
      .aplicarPropuesta(9);

    expect(estado.seleccionarProyecto).toHaveBeenCalledWith(10);
    expect(actualizado).toHaveBeenCalledWith(10);
  });

  it('restaura el foco en el acceso flotante al cerrar el panel', async () => {
    const fixture = TestBed.createComponent(AsistenteIaFlotante);
    fixture.componentRef.setInput('contexto', {
      proyectoId: 10,
      revisionContexto: 2,
      seccionActiva: 'necesidad',
      nombreSeccion: 'Necesidad de negocio',
    });
    fixture.detectChanges();
    (fixture.nativeElement.querySelector(
      '.asistente-ia-flotante__activador',
    ) as HTMLButtonElement).click();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.panel-asistente__cerrar') as HTMLButtonElement).click();
    fixture.detectChanges();
    await Promise.resolve();

    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('.asistente-ia-flotante__activador'),
    );
  });
});
