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
    obtenerConversacion: jasmine.createSpy('obtenerConversacion'),
    enviarMensaje: jasmine.createSpy('enviarMensaje'),
    aplicarPropuesta: jasmine.createSpy('aplicarPropuesta'),
    rechazarPropuesta: jasmine.createSpy('rechazarPropuesta'),
  };
  const notificador = { comunicar: jasmine.createSpy('comunicar') };
  let servicio: EstadoAsistenteIAService;

  beforeEach(() => {
    api.obtenerConversacion.calls.reset();
    api.enviarMensaje.calls.reset();
    api.aplicarPropuesta.calls.reset();
    api.rechazarPropuesta.calls.reset();
    notificador.comunicar.calls.reset();
    api.obtenerConversacion.and.returnValue(
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
    api.obtenerConversacion.and.returnValues(cargaAnterior, cargaVigente);

    servicio.cargar(42);
    servicio.cargar(84);
    cargaAnterior.next({ proyectoId: 42, conversacionId: null, mensajes: [crearMensaje(1)] });
    cargaVigente.next({ proyectoId: 84, conversacionId: null, mensajes: [crearMensaje(2)] });

    expect(servicio.mensajes().map((mensaje) => mensaje.id)).toEqual([2]);
  });

  it('descarta un envío pendiente cuando cambia el proyecto activo', () => {
    const respuesta = new Subject<RespuestaEnvioAsistenteIA>();
    api.enviarMensaje.and.returnValue(respuesta);
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
    api.obtenerConversacion.and.returnValue(
      of({ proyectoId: 42, conversacionId: 7, mensajes: [crearMensaje(9, undefined, true)] }),
    );
    api.aplicarPropuesta.and.returnValue(
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
    api.enviarMensaje.and.returnValue(new Subject<RespuestaEnvioAsistenteIA>());
    servicio.cargar(42);
    servicio.enviar(CONTEXTO, 'Primer mensaje').subscribe();
    servicio.enviar(CONTEXTO, 'Segundo mensaje').subscribe();
    servicio.aplicar(CONTEXTO, 9).subscribe();

    expect(api.enviarMensaje).toHaveBeenCalledTimes(1);
    expect(api.aplicarPropuesta).not.toHaveBeenCalled();
  });

  it('rechaza una resolución que pertenece a un proyecto diferente', () => {
    api.obtenerConversacion.and.returnValue(
      of({ proyectoId: 42, conversacionId: 7, mensajes: [crearMensaje(9, undefined, true)] }),
    );
    api.aplicarPropuesta.and.returnValue(
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
    expect(notificador.comunicar).toHaveBeenCalledTimes(1);
  });

  it('presenta el error de carga y permite reintentar explícitamente', () => {
    api.obtenerConversacion.and.returnValues(
      throwError(() => new Error('Sin conexión')),
      of({ proyectoId: 42, conversacionId: null, mensajes: [] }),
    );

    servicio.cargar(42);
    expect(servicio.errorCarga()).toBe(true);
    expect(notificador.comunicar).not.toHaveBeenCalled();

    servicio.cargar(42, true);
    expect(servicio.errorCarga()).toBe(false);
    expect(api.obtenerConversacion).toHaveBeenCalledTimes(2);
  });

  it('ignora seleccionar el proyecto que ya está activo', () => {
    servicio.cargar(42);
    servicio.seleccionarProyecto(42);
    expect(api.obtenerConversacion).toHaveBeenCalledTimes(1);
  });

  it('envía un turno y agrega los mensajes confirmados', async () => {
    api.enviarMensaje.and.returnValue(
      of({
        conversacionId: 7,
        mensajeUsuario: crearMensaje(2, RolMensajeAsistenteIA.Usuario),
        mensajeAsistente: crearMensaje(3),
      }),
    );
    servicio.cargar(42);

    await firstValueFrom(servicio.enviar(CONTEXTO, ' Hola '));

    expect(api.enviarMensaje).toHaveBeenCalledWith(CONTEXTO, 'Hola');
    expect(servicio.mensajes().map((m) => m.id)).toEqual([2, 3]);
    expect(servicio.enviando()).toBe(false);
    expect(servicio.mensajePendiente()).toBeNull();
  });

  it('no envía cuando el texto queda vacío tras recortarlo', () => {
    servicio.cargar(42);
    servicio.enviar(CONTEXTO, '   ').subscribe();
    expect(api.enviarMensaje).not.toHaveBeenCalled();
  });

  it('no envía cuando el proyecto del contexto no está activo', () => {
    servicio.cargar(84);
    servicio.enviar(CONTEXTO, 'Mensaje').subscribe();
    expect(api.enviarMensaje).not.toHaveBeenCalled();
  });

  it('no envía mientras el historial está en error de carga', () => {
    api.obtenerConversacion.and.returnValue(throwError(() => new Error('fallo')));
    servicio.cargar(42);
    expect(servicio.errorCarga()).toBe(true);
    servicio.enviar(CONTEXTO, 'Mensaje').subscribe();
    expect(api.enviarMensaje).not.toHaveBeenCalled();
  });

  it('notifica y limpia el estado cuando el envío falla', async () => {
    api.enviarMensaje.and.returnValue(throwError(() => new Error('fallo envío')));
    servicio.cargar(42);

    await firstValueFrom(servicio.enviar(CONTEXTO, 'Mensaje'), { defaultValue: undefined });

    expect(notificador.comunicar).toHaveBeenCalledTimes(1);
    expect(servicio.enviando()).toBe(false);
    expect(servicio.mensajePendiente()).toBeNull();
  });

  it('notifica cuando aplicar una propuesta falla', () => {
    api.obtenerConversacion.and.returnValue(
      of({ proyectoId: 42, conversacionId: 7, mensajes: [crearMensaje(9, undefined, true)] }),
    );
    api.aplicarPropuesta.and.returnValue(throwError(() => new Error('fallo aplicar')));
    servicio.cargar(42);

    servicio.aplicar(CONTEXTO, 9).subscribe();

    expect(notificador.comunicar).toHaveBeenCalledTimes(1);
    expect(servicio.propuestaProcesando()).toBeNull();
  });

  it('no aplica cuando el proyecto del contexto no está activo', () => {
    servicio.cargar(84);
    servicio.aplicar(CONTEXTO, 9).subscribe();
    expect(api.aplicarPropuesta).not.toHaveBeenCalled();
  });

  it('rechaza una propuesta pendiente y actualiza su estado', async () => {
    api.obtenerConversacion.and.returnValue(
      of({ proyectoId: 42, conversacionId: 7, mensajes: [crearMensaje(9, undefined, true)] }),
    );
    api.rechazarPropuesta.and.returnValue(
      of({
        proyectoId: 42,
        mensajeId: 9,
        estado: EstadoPropuestaAsistenteIA.Rechazada,
        revision: 6,
      }),
    );
    servicio.cargar(42);

    await firstValueFrom(servicio.rechazar(42, 9));

    expect(servicio.mensajes()[0]?.propuesta?.estado).toBe(EstadoPropuestaAsistenteIA.Rechazada);
    expect(servicio.propuestaProcesando()).toBeNull();
  });

  it('notifica cuando rechazar una propuesta pertenece a otro proyecto', () => {
    api.obtenerConversacion.and.returnValue(
      of({ proyectoId: 42, conversacionId: 7, mensajes: [crearMensaje(9, undefined, true)] }),
    );
    api.rechazarPropuesta.and.returnValue(
      of({
        proyectoId: 84,
        mensajeId: 9,
        estado: EstadoPropuestaAsistenteIA.Rechazada,
        revision: 6,
      }),
    );
    servicio.cargar(42);

    servicio.rechazar(42, 9).subscribe();

    expect(servicio.mensajes()[0]?.propuesta?.estado).toBe(EstadoPropuestaAsistenteIA.Pendiente);
    expect(notificador.comunicar).toHaveBeenCalledTimes(1);
  });

  it('notifica cuando rechazar una propuesta falla', () => {
    api.obtenerConversacion.and.returnValue(
      of({ proyectoId: 42, conversacionId: 7, mensajes: [crearMensaje(9, undefined, true)] }),
    );
    api.rechazarPropuesta.and.returnValue(throwError(() => new Error('fallo rechazar')));
    servicio.cargar(42);

    servicio.rechazar(42, 9).subscribe();

    expect(notificador.comunicar).toHaveBeenCalledTimes(1);
    expect(servicio.propuestaProcesando()).toBeNull();
  });

  it('no rechaza cuando el proyecto no está activo', () => {
    servicio.cargar(84);
    servicio.rechazar(42, 9).subscribe();
    expect(api.rechazarPropuesta).not.toHaveBeenCalled();
  });

  it('bloquea aplicar y rechazar mientras otra propuesta está en curso', () => {
    api.obtenerConversacion.and.returnValue(
      of({ proyectoId: 42, conversacionId: 7, mensajes: [crearMensaje(9, undefined, true)] }),
    );
    api.aplicarPropuesta.and.returnValue(new Subject());
    servicio.cargar(42);

    servicio.aplicar(CONTEXTO, 9).subscribe();
    servicio.rechazar(42, 9).subscribe();

    expect(api.aplicarPropuesta).toHaveBeenCalledTimes(1);
    expect(api.rechazarPropuesta).not.toHaveBeenCalled();
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
