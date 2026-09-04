import { TestBed } from '@angular/core/testing';
import { Subject, firstValueFrom, of, throwError } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import {
  EstadoPropuestaAsistenteIA,
  RolMensajeAsistenteIA,
  type ContextoAsistenteIA,
  type MensajeAsistenteIA,
  type RespuestaEnvioAsistenteIA,
} from '../models/asistente-ia.model';
import { AsistenteIAApiService } from './asistente-ia-api.service';
import { EstadoAsistenteIAService } from './estado-asistente-ia.service';

describe('EstadoAsistenteIAService', () => {
  const api = {
    obtenerConversacion: vi.fn(),
    enviarMensaje: vi.fn(),
    aplicarPropuesta: vi.fn(),
    rechazarPropuesta: vi.fn(),
  };
  const notificador = { comunicar: vi.fn() };
  let servicio: EstadoAsistenteIAService;

  beforeEach(() => {
    vi.clearAllMocks();
    api.obtenerConversacion.mockReturnValue(
      of({ proyectoId: 42, conversacionId: null, mensajes: [] }),
    );
    TestBed.configureTestingModule({
      providers: [
        EstadoAsistenteIAService,
        { provide: AsistenteIAApiService, useValue: api },
        { provide: NotificadorErroresApiService, useValue: notificador },
      ],
    });
    servicio = TestBed.inject(EstadoAsistenteIAService);
  });

  it('conserva un único historial cargado para el proyecto activo', () => {
    servicio.cargar(42);
    servicio.cargar(42);

    expect(api.obtenerConversacion).toHaveBeenCalledTimes(1);
    expect(servicio.cargando()).toBe(false);
    expect(servicio.errorCarga()).toBe(false);
  });

  it('cancela la carga anterior y acepta únicamente la respuesta del proyecto vigente', () => {
    const cargaAnterior = new Subject<{
      proyectoId: number;
      conversacionId: null;
      mensajes: readonly MensajeAsistenteIA[];
    }>();
    const cargaVigente = new Subject<{
      proyectoId: number;
      conversacionId: null;
      mensajes: readonly MensajeAsistenteIA[];
    }>();
    api.obtenerConversacion
      .mockReturnValueOnce(cargaAnterior)
      .mockReturnValueOnce(cargaVigente);

    servicio.cargar(42);
    servicio.cargar(84);
    cargaAnterior.next({ proyectoId: 42, conversacionId: null, mensajes: [crearMensaje(1)] });
    cargaVigente.next({ proyectoId: 84, conversacionId: null, mensajes: [crearMensaje(2)] });

    expect(servicio.mensajes().map((mensaje) => mensaje.id)).toEqual([2]);
  });

  it('descarta un envío pendiente cuando cambia el proyecto activo', () => {
    const respuesta = new Subject<RespuestaEnvioAsistenteIA>();
    api.enviarMensaje.mockReturnValue(respuesta);
    servicio.cargar(42);
    servicio.enviar(CONTEXTO, 'Analiza esta sección').subscribe();

    servicio.seleccionarProyecto(84);
    respuesta.next({
      conversacionId: 7,
      mensajeUsuario: crearMensaje(2, RolMensajeAsistenteIA.Usuario),
      mensajeAsistente: crearMensaje(3),
    });

    expect(servicio.mensajes()).toEqual([]);
    expect(servicio.enviando()).toBe(false);
    expect(servicio.mensajePendiente()).toBeNull();
  });

  it('aplica una propuesta y entrega el proyecto que debe recargarse', async () => {
    api.obtenerConversacion.mockReturnValue(
      of({ proyectoId: 42, conversacionId: 7, mensajes: [crearMensaje(9, undefined, true)] }),
    );
    api.aplicarPropuesta.mockReturnValue(
      of({
        proyectoId: 42,
        mensajeId: 9,
        estado: EstadoPropuestaAsistenteIA.Aplicada,
        revision: 5,
      }),
    );
    servicio.cargar(42);

    const resultado = await firstValueFrom(servicio.aplicar(CONTEXTO, 9));

    expect(resultado.proyectoId).toBe(42);
    expect(servicio.mensajes()[0]?.propuesta?.estado).toBe(EstadoPropuestaAsistenteIA.Aplicada);
    expect(servicio.propuestaProcesando()).toBeNull();
  });

  it('bloquea operaciones superpuestas mientras existe un envío pendiente', () => {
    api.enviarMensaje.mockReturnValue(new Subject<RespuestaEnvioAsistenteIA>());
    servicio.cargar(42);
    servicio.enviar(CONTEXTO, 'Primer mensaje').subscribe();
    servicio.enviar(CONTEXTO, 'Segundo mensaje').subscribe();
    servicio.aplicar(CONTEXTO, 9).subscribe();

    expect(api.enviarMensaje).toHaveBeenCalledTimes(1);
    expect(api.aplicarPropuesta).not.toHaveBeenCalled();
  });

  it('rechaza una resolución que pertenece a un proyecto diferente', () => {
    api.obtenerConversacion.mockReturnValue(
      of({ proyectoId: 42, conversacionId: 7, mensajes: [crearMensaje(9, undefined, true)] }),
    );
    api.aplicarPropuesta.mockReturnValue(
      of({
        proyectoId: 84,
        mensajeId: 9,
        estado: EstadoPropuestaAsistenteIA.Aplicada,
        revision: 5,
      }),
    );
    servicio.cargar(42);

    servicio.aplicar(CONTEXTO, 9).subscribe();

    expect(servicio.mensajes()[0]?.propuesta?.estado).toBe(EstadoPropuestaAsistenteIA.Pendiente);
    expect(notificador.comunicar).toHaveBeenCalledOnce();
  });

  it('presenta el error de carga y permite reintentar explícitamente', () => {
    api.obtenerConversacion
      .mockReturnValueOnce(throwError(() => new Error('Sin conexión')))
      .mockReturnValueOnce(of({ proyectoId: 42, conversacionId: null, mensajes: [] }));

    servicio.cargar(42);
    expect(servicio.errorCarga()).toBe(true);
    expect(notificador.comunicar).toHaveBeenCalledOnce();

    servicio.cargar(42, true);
    expect(servicio.errorCarga()).toBe(false);
    expect(api.obtenerConversacion).toHaveBeenCalledTimes(2);
  });
});

const CONTEXTO: ContextoAsistenteIA = {
  proyectoId: 42,
  revisionContexto: 4,
  seccionActiva: 'objetivos',
  nombreSeccion: 'Objetivos',
};

function crearMensaje(
  id: number,
  rol = RolMensajeAsistenteIA.Asistente,
  conPropuesta = false,
): MensajeAsistenteIA {
  return {
    id,
    rol,
    texto: 'Mensaje',
    orden: id,
    fechaCreacion: '2026-09-04T12:00:00Z',
    seccionContexto: 'objetivos',
    revisionContexto: 4,
    propuesta: conPropuesta
      ? {
          seccion: 'objetivos',
          resumen: 'Mejora los objetivos.',
          contenidoJson: '{}',
          estado: EstadoPropuestaAsistenteIA.Pendiente,
          detalles: [],
        }
      : null,
  };
}
