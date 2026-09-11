import {
  mapearHistorialElementoPlanificacion,
  mapearVersionElementoPlanificacion,
} from './historial-elemento-planificacion.mapper';
import type { VersionTareaDto } from '../models/historial-elemento-planificacion.dto';
import { TipoElementoPlanificacionDto } from '../models/planificacion-proyecto.dto';
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
