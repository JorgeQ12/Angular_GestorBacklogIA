import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OMITIR_CARGA_GLOBAL } from '../../../../core/carga-global/contextos/carga-global.contexto';
import { environment } from '../../../../../environments/environment';
import { ENDPOINTS_ASISTENTE_IA } from '../config/endpoints-asistente-ia.config';
import type { ContextoAsistenteIA } from '../models/asistente-ia.model';
import { AsistenteIAApiService } from './asistente-ia-api.service';

describe('AsistenteIAApiService', () => {
  let servicio: AsistenteIAApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(AsistenteIAApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('recupera y adapta el historial asociado al proyecto', () => {
    let cantidadMensajes = 0;
    servicio.obtenerConversacion(42).subscribe((conversacion) => {
      cantidadMensajes = conversacion.mensajes.length;
      expect(conversacion.mensajes[0]?.rol).toBe('asistente');
    });

    const solicitud = httpTesting.expectOne(
      (request) =>
        request.url === ENDPOINTS_ASISTENTE_IA.obtenerConversacion &&
        request.params.get('proyectoId') === '42',
    );
    expect(solicitud.request.url).toBe(
      `${environment.apiBaseUrl}/GeneracionIA/Asistente/ObtenerConversacion`,
    );
    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.context.get(OMITIR_CARGA_GLOBAL)).toBe(true);
    solicitud.flush({
      exitoso: true,
      tipo: 1,
      datos: {
        proyectoId: 42,
        conversacionId: 7,
        mensajes: [
          {
            id: 1,
            rol: 'Asistente',
            texto: '¿En qué te ayudo?',
            orden: 1,
            fechaCreacion: '2026-09-04T12:00:00Z',
            seccionContexto: 'necesidad',
            revisionContexto: 4,
            propuesta: null,
          },
        ],
      },
      mensaje: null,
      codigoError: null,
      errores: null,
    });

    expect(cantidadMensajes).toBe(1);
  });

  it('envía únicamente el contexto mínimo y el mensaje normalizado', () => {
    const contexto: ContextoAsistenteIA = {
      proyectoId: 42,
      revisionContexto: 4,
      seccionActiva: 'objetivos',
      nombreSeccion: 'Objetivos',
    };
    let textoRespuesta = '';
    servicio.enviarMensaje(contexto, '  Ayúdame  ').subscribe((respuesta) => {
      textoRespuesta = respuesta.mensajeAsistente.texto;
    });

    const solicitud = httpTesting.expectOne(ENDPOINTS_ASISTENTE_IA.enviarMensaje);
    expect(solicitud.request.url).toBe(
      `${environment.apiBaseUrl}/GeneracionIA/Asistente/EnviarMensaje`,
    );
    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({
      proyectoId: 42,
      revisionContexto: 4,
      seccionContexto: 'objetivos',
      mensaje: 'Ayúdame',
    });
    expect(solicitud.request.context.get(OMITIR_CARGA_GLOBAL)).toBe(true);
    solicitud.flush({
      exitoso: true,
      tipo: 1,
      datos: {
        conversacionId: 7,
        mensajeUsuario: crearMensaje(2, 'Usuario'),
        mensajeAsistente: crearMensaje(3, 'Asistente', 'Completemos la situación actual.'),
      },
      mensaje: null,
      codigoError: null,
      errores: null,
    });

    expect(textoRespuesta).toBe('Completemos la situación actual.');
  });

  it('aplica una propuesta con la revisión observada por el cliente', () => {
    let revision = 0;
    servicio.aplicarPropuesta(CONTEXTO, 9).subscribe((resultado) => {
      revision = resultado.revision;
    });

    const solicitud = httpTesting.expectOne(ENDPOINTS_ASISTENTE_IA.aplicarPropuesta);
    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({
      proyectoId: 42,
      mensajeId: 9,
      revisionEsperada: 4,
    });
    expect(solicitud.request.context.get(OMITIR_CARGA_GLOBAL)).toBe(true);
    solicitud.flush(crearResultadoResolucion('Aplicada', 5));

    expect(revision).toBe(5);
  });

  it('rechaza una propuesta identificando proyecto y mensaje', () => {
    servicio.rechazarPropuesta(42, 9).subscribe();

    const solicitud = httpTesting.expectOne(ENDPOINTS_ASISTENTE_IA.rechazarPropuesta);
    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({ proyectoId: 42, mensajeId: 9 });
    expect(solicitud.request.context.get(OMITIR_CARGA_GLOBAL)).toBe(true);
    solicitud.flush(crearResultadoResolucion('Rechazada', 4));
  });

  it('propaga como error una respuesta funcional sin datos', () => {
    const error = vi.fn();
    servicio.obtenerConversacion(42).subscribe({ error });

    httpTesting
      .expectOne(
        (request) =>
          request.url === ENDPOINTS_ASISTENTE_IA.obtenerConversacion &&
          request.params.get('proyectoId') === '42',
      )
      .flush({
        exitoso: false,
        tipo: 3,
        datos: null,
        mensaje: 'No encontramos el borrador.',
        codigoError: 'asistente_ia.borrador_no_encontrado',
        errores: null,
      });

    expect(error).toHaveBeenCalledOnce();
  });
});

const CONTEXTO: ContextoAsistenteIA = {
  proyectoId: 42,
  revisionContexto: 4,
  seccionActiva: 'objetivos',
  nombreSeccion: 'Objetivos',
};

function crearResultadoResolucion(estado: string, revision: number) {
  return {
    exitoso: true,
    tipo: 1,
    datos: { proyectoId: 42, mensajeId: 9, estado, revision },
    mensaje: null,
    codigoError: null,
    errores: null,
  };
}

function crearMensaje(id: number, rol: string, texto = 'Mensaje') {
  return {
    id,
    rol,
    texto,
    orden: id,
    fechaCreacion: '2026-09-04T12:00:00Z',
    seccionContexto: 'objetivos',
    revisionContexto: 4,
    propuesta: null,
  };
}
