import {
  mapearHistorialElementoPlanificacion,
  mapearVersionElementoPlanificacion,
} from './historial-elemento-planificacion.mapper';
import type {
  VersionCaracteristicaDto,
  VersionEpicaDto,
  VersionHistoriaDto,
  VersionTareaDto,
} from '../models/historial-elemento-planificacion.dto';
import { OrigenEpicaDto, TipoElementoPlanificacionDto } from '../models/planificacion-proyecto.dto';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';

describe('historialElementoPlanificacionMapper', () => {
  it('conserva la paginación cursorizada y elimina datos de transporte innecesarios', () => {
    expect(
      mapearHistorialElementoPlanificacion({
        registros: [
          {
            versionId: 91,
            numeroVersion: 3,
            fechaCreacion: '2026-09-01T10:00:00',
            esActual: false,
          },
        ],
        siguienteCursor: 3,
        hayMas: true,
      }),
    ).toEqual({
      registros: [
        {
          versionId: 91,
          numeroVersion: 3,
          fechaCreacion: '2026-09-01T10:00:00',
        },
      ],
      siguienteCursor: 3,
      hayMas: true,
    });
  });

  it('mapea exhaustivamente el contenido histórico de una tarea', () => {
    expect(mapearVersionElementoPlanificacion(VERSION_TAREA_DTO)).toEqual({
      tipo: TipoElementoPlanificacion.Tarea,
      versionId: 91,
      elementoId: 783,
      numeroVersion: 3,
      titulo: 'Implementar servicio',
      descripcion: 'Versión anterior del servicio.',
      estimacionHoras: 8,
      fechaInicio: '2026-09-01T00:00:00',
      fechaFinal: '2026-09-05T00:00:00',
      fechaCreacion: '2026-09-02T10:00:00',
      dependencias: 'API disponible',
      actividadCatalogoId: 19,
      complejidad: 3,
    });
  });

  it('mapea una versión histórica de épica con textos nulos como cadenas vacías', () => {
    const epica: VersionEpicaDto = {
      tipo: TipoElementoPlanificacionDto.Epica,
      versionId: 80,
      itemTrabajoId: 100,
      numeroVersion: 1,
      titulo: 'Épica',
      descripcion: 'Descripción de la épica.',
      estimacionHoras: 40,
      fechaInicio: '2026-08-01T00:00:00',
      fechaFinal: '2026-08-30T00:00:00',
      fechaCreacion: '2026-08-01T10:00:00',
      esActual: false,
      origen: OrigenEpicaDto.Manual,
      alcance: null,
      riesgos: null,
      criteriosExito: null,
      prioridadCatalogoId: null,
      riesgoCatalogoId: null,
      estadoExterno: null,
      areaPath: null,
      iterationPath: null,
      azureRevision: null,
      autorCambio: null,
      fechaEfectiva: null,
    };

    expect(mapearVersionElementoPlanificacion(epica)).toEqual(
      jasmine.objectContaining({
        tipo: TipoElementoPlanificacion.Epica,
        alcance: '',
        riesgos: '',
        criteriosExito: '',
        prioridadCatalogoId: null,
        riesgoCatalogoId: null,
      }),
    );
  });

  it('mapea una versión histórica de épica conservando sus textos presentes', () => {
    const epica: VersionEpicaDto = {
      tipo: TipoElementoPlanificacionDto.Epica,
      versionId: 81,
      itemTrabajoId: 101,
      numeroVersion: 2,
      titulo: 'Épica con datos',
      descripcion: 'Descripción.',
      estimacionHoras: 40,
      fechaInicio: '2026-08-01T00:00:00',
      fechaFinal: '2026-08-30T00:00:00',
      fechaCreacion: '2026-08-01T10:00:00',
      esActual: false,
      origen: OrigenEpicaDto.Manual,
      alcance: 'Alcance',
      riesgos: 'Riesgos',
      criteriosExito: 'Éxito',
      prioridadCatalogoId: 3,
      riesgoCatalogoId: 4,
      estadoExterno: null,
      areaPath: null,
      iterationPath: null,
      azureRevision: null,
      autorCambio: null,
      fechaEfectiva: null,
    };

    expect(mapearVersionElementoPlanificacion(epica)).toEqual(
      jasmine.objectContaining({
        alcance: 'Alcance',
        riesgos: 'Riesgos',
        criteriosExito: 'Éxito',
        prioridadCatalogoId: 3,
        riesgoCatalogoId: 4,
      }),
    );
  });

  it('mapea una versión histórica de característica conservando su alcance', () => {
    const caracteristica: VersionCaracteristicaDto = {
      tipo: TipoElementoPlanificacionDto.Caracteristica,
      versionId: 82,
      itemTrabajoId: 102,
      numeroVersion: 1,
      titulo: 'Característica',
      descripcion: 'Descripción.',
      estimacionHoras: 16,
      fechaInicio: '2026-08-01T00:00:00',
      fechaFinal: '2026-08-15T00:00:00',
      fechaCreacion: '2026-08-01T10:00:00',
      esActual: false,
      alcance: 'Alcance de la característica',
    };

    expect(mapearVersionElementoPlanificacion(caracteristica)).toEqual(
      jasmine.objectContaining({
        tipo: TipoElementoPlanificacion.Caracteristica,
        alcance: 'Alcance de la característica',
      }),
    );
  });

  it('mapea una versión histórica de historia con objetivo, alcance y criterios', () => {
    const historia: VersionHistoriaDto = {
      tipo: TipoElementoPlanificacionDto.Historia,
      versionId: 83,
      itemTrabajoId: 103,
      numeroVersion: 1,
      titulo: 'Historia',
      descripcion: 'Descripción.',
      estimacionHoras: 8,
      fechaInicio: '2026-08-01T00:00:00',
      fechaFinal: '2026-08-10T00:00:00',
      fechaCreacion: '2026-08-01T10:00:00',
      esActual: false,
      objetivo: 'Objetivo',
      alcance: 'Alcance',
      criteriosAceptacion: 'Criterios',
    };

    expect(mapearVersionElementoPlanificacion(historia)).toEqual(
      jasmine.objectContaining({
        tipo: TipoElementoPlanificacion.Historia,
        objetivo: 'Objetivo',
        alcance: 'Alcance',
        criteriosAceptacion: 'Criterios',
      }),
    );
  });

  it('rechaza un tipo histórico no compatible', () => {
    expect(() =>
      mapearVersionElementoPlanificacion({
        ...VERSION_TAREA_DTO,
        tipo: 'desconocido' as TipoElementoPlanificacionDto.Tarea,
      }),
    ).toThrowError(/Tipo histórico de elemento no compatible/);
  });
});

export const VERSION_TAREA_DTO: VersionTareaDto = {
  tipo: TipoElementoPlanificacionDto.Tarea,
  versionId: 91,
  itemTrabajoId: 783,
  numeroVersion: 3,
  titulo: 'Implementar servicio',
  descripcion: 'Versión anterior del servicio.',
  estimacionHoras: 8,
  fechaInicio: '2026-09-01T00:00:00',
  fechaFinal: '2026-09-05T00:00:00',
  fechaCreacion: '2026-09-02T10:00:00',
  esActual: false,
  dependencias: 'API disponible',
  actividadCatalogoId: 19,
  complejidad: 3,
};
