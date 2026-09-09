import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { DetalleElementoPlanificacion } from '../models/detalle-elemento-planificacion.model';
import { TipoElementoPlanificacion, type PlanificacionProyecto } from '../models/planificacion-proyecto.model';
import { ElementoPlanificacionService } from './elemento-planificacion.service';
import { GanttPlanificacionService } from './gantt-planificacion.service';

describe('GanttPlanificacionService', () => {
  const obtener = vi.fn();
  let servicio: GanttPlanificacionService;

  beforeEach(() => {
    obtener.mockReset();
    obtener.mockImplementation((tipo: DetalleElementoPlanificacion['tipo'], id: number) =>
      of(crearDetalle(tipo, id)),
    );
    TestBed.configureTestingModule({
      providers: [
        GanttPlanificacionService,
        { provide: ElementoPlanificacionService, useValue: { obtener } },
      ],
    });
    servicio = TestBed.inject(GanttPlanificacionService);
  });

  it('consulta cada detalle de la jerarquía principal y conserva su orden', () => {
    let resultado: unknown;
    servicio.obtener(PLANIFICACION).subscribe((datos) => (resultado = datos));

    expect(obtener).toHaveBeenNthCalledWith(1, TipoElementoPlanificacion.Epica, 1, null);
    expect(obtener).toHaveBeenNthCalledWith(2, TipoElementoPlanificacion.Caracteristica, 2, null);
    expect(resultado).toMatchObject({
      proyectoId: 42,
      elementos: [
        { clave: 'epica:1', orden: 0 },
        { clave: 'caracteristica:2', orden: 1 },
      ],
    });
  });

  it('solicita la fotografía histórica al consultar sus detalles', () => {
    servicio.obtener({ ...PLANIFICACION, esHistorica: true }).subscribe();

    expect(obtener).toHaveBeenCalledWith(TipoElementoPlanificacion.Epica, 1, 9);
    expect(obtener).toHaveBeenCalledWith(TipoElementoPlanificacion.Caracteristica, 2, 9);
  });
});

const CAPACIDADES = {
  puedeConsultar: true,
  puedeEditar: false,
  puedeEliminar: false,
  puedeCrearHijo: false,
  puedeSincronizar: false,
  soloLectura: true,
};

const PLANIFICACION: PlanificacionProyecto = {
  proyectoId: 42,
  nombre: 'Proyecto',
  versionId: 9,
  numeroVersion: 4,
  esHistorica: false,
  resumen: { epicas: 1, caracteristicas: 1, historias: 0, tareas: 0, totalElementos: 2 },
  publicacionAzure: { puedePublicar: false, bloqueos: [] },
  elementos: [{
    clave: 'epica:1', id: 1, tipo: TipoElementoPlanificacion.Epica, titulo: 'Épica', detalle: null,
    terminosBusqueda: [], activo: true, numeroVersion: 1, vinculadaAzure: false, capacidades: CAPACIDADES,
    hijos: [{
      clave: 'caracteristica:2', id: 2, tipo: TipoElementoPlanificacion.Caracteristica,
      titulo: 'Característica', detalle: null, terminosBusqueda: [], activo: true, numeroVersion: 1,
      vinculadaAzure: false, capacidades: CAPACIDADES, hijos: [],
    }],
  }],
};

function crearDetalle(tipo: DetalleElementoPlanificacion['tipo'], id: number): DetalleElementoPlanificacion {
  return {
    tipo, id, proyectoId: 42, activo: true, numeroVersion: 1, titulo: `Elemento ${id}`,
    descripcion: '', estimacionHoras: 8, fechaInicio: '2026-09-01', fechaFinal: '2026-09-05',
    fechaCreacion: '2026-09-01T00:00:00Z', fechaInactivacion: null, motivoInactivacion: null,
    urlAzure: null,
    capacidades: { puedeEditar: false, puedeVerHistorial: true, puedeSincronizar: false, soloLectura: true },
    alcance: '', riesgos: '', criteriosExito: '', prioridadCatalogoId: null, riesgoCatalogoId: null,
    objetivo: '', criteriosAceptacion: '', dependencias: '', actividadCatalogoId: null, complejidad: 0,
    prioridad: 0, discusion: '', responsable: '', requisito: '',
  };
}
