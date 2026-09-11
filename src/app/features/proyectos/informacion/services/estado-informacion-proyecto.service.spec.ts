import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { PlataformaSolucion } from '../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import type { InformacionProyecto } from '../models/informacion-proyecto.model';
import { EstadoInformacionProyectoService } from './estado-informacion-proyecto.service';
import { InformacionProyectoService } from './informacion-proyecto.service';

describe('EstadoInformacionProyectoService', () => {
  const api = {
    obtenerProyecto: jasmine.createSpy('obtenerProyecto'),
    obtenerVersiones: jasmine.createSpy('obtenerVersiones'),
    obtenerVersion: jasmine.createSpy('obtenerVersion'),
    actualizarProyecto: jasmine.createSpy('actualizarProyecto'),
  };
  const notificador = { comunicar: jasmine.createSpy('comunicar') };
  let servicio: EstadoInformacionProyectoService;

  beforeEach(() => {
    api.obtenerProyecto.calls.reset();
    api.obtenerVersiones.calls.reset();
    api.obtenerVersion.calls.reset();
    api.actualizarProyecto.calls.reset();
    notificador.comunicar.calls.reset();
    api.obtenerProyecto.and.returnValue(of(PROYECTO));
    api.obtenerVersiones.and.returnValue(
      of([{ id: 81, numero: 4, fechaCreacion: '2026-09-01', esActual: true }]),
    );
    TestBed.configureTestingModule({
      providers: [
        EstadoInformacionProyectoService,
        { provide: InformacionProyectoService, useValue: api },
        { provide: NotificadorErroresApiService, useValue: notificador },
      ],
    });
    servicio = TestBed.inject(EstadoInformacionProyectoService);
  });

  it('carga en conjunto el proyecto y su historial', () => {
    servicio.cargar(42, null);
    expect(servicio.proyectoPresentado()).toEqual(PROYECTO);
    expect(servicio.versiones().length).toBe(1);
    expect(servicio.errorCarga()).toBe(false);
  });

  it('distingue una falla de carga', () => {
    api.obtenerProyecto.and.returnValue(throwError(() => new Error('fallo')));
    servicio.cargar(42, null);
    expect(servicio.errorCarga()).toBe(true);
    expect(servicio.proyectoPresentado()).toBeNull();
  });

  it('rehidrata la fotografía presentada con la respuesta del guardado', () => {
    const proyectoActualizado: InformacionProyecto = {
      ...PROYECTO,
      versionId: 82,
      numeroVersion: 5,
      contexto: {
        ...PROYECTO.contexto,
        responsable: 'María Gómez',
        prioridadCatalogoId: 3,
        fechaObjetivo: '2026-08-30',
      },
      prioridad: 'Media',
    };
    const actualizacion = {
      seccion: ClaveSeccionProyecto.Contexto,
      datos: proyectoActualizado.contexto,
    } as const;
    const completado = jasmine.createSpy('completado');
    api.actualizarProyecto.and.returnValue(of(proyectoActualizado));
    servicio.cargar(42, null);

    servicio.guardar(actualizacion, completado);

    expect(servicio.proyectoActual()).toEqual(proyectoActualizado);
    expect(servicio.proyectoPresentado()).toEqual(proyectoActualizado);
    expect(completado).toHaveBeenCalledTimes(1);
  });
});

const PROYECTO: InformacionProyecto = {
  id: 42,
  versionId: 81,
  numeroVersion: 4,
  fechaVersion: null,
  esVersionActual: true,
  contexto: {
    nombre: 'Portal',
    responsable: 'Jorge',
    descripcion: 'Descripción',
    prioridadCatalogoId: 2,
    fechaObjetivo: '2026-12-10',
  },
  estadoCatalogoId: 3,
  estado: 'En Progreso',
  prioridad: 'Alta',
  azure: null,
  tipoSolucion: { tieneInterfaz: true, plataforma: PlataformaSolucion.Web },
  necesidad: { situacionActual: 'Manual', problemas: 'Retrasos', impacto: 'Costos' },
  objetivos: { objetivoGeneral: 'Mejorar', objetivosEspecificos: ['Automatizar'] },
  alcance: { incluido: 'Portal', excluido: 'Pagos' },
  roles: { roles: [] },
  equipo: { integrantes: [] },
  flujo: {
    proyectoId: '42',
    roles: [],
    nodos: [],
    conexiones: [],
    fechaActualizacion: '2026-09-01',
  },
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson: '{"situacionActual":"Manual","problemas":"Retrasos","impacto":"Costos"}',
  objetivosJson: '{"objetivoGeneral":"Mejorar","objetivosEspecificos":["Automatizar"]}',
  alcanceJson: '{"incluido":"Portal","excluido":"Pagos"}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
};
