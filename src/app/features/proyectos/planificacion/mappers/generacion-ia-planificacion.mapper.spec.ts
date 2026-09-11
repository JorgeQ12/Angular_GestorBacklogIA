import { NivelGeneracionIaPlanificacionDto } from '../models/generacion-ia-planificacion.dto';
import { NivelGeneracionIaPlanificacion } from '../models/generacion-ia-planificacion.model';
import {
  crearSolicitudGeneracionIaPlanificacion,
  mapearResultadoGeneracionIaPlanificacion,
} from './generacion-ia-planificacion.mapper';

describe('generacionIaPlanificacionMapper', () => {
  it('construye el cuerpo contractual de la generación', () => {
    expect(
      crearSolicitudGeneracionIaPlanificacion(42, NivelGeneracionIaPlanificacion.Caracteristicas),
    ).toEqual({
      proyectoId: 42,
      nivel: NivelGeneracionIaPlanificacionDto.Caracteristicas,
    });
  });

  it('adapta el resultado remoto al modelo de planificación', () => {
    expect(
      mapearResultadoGeneracionIaPlanificacion({
        proyectoId: 42,
        nivel: NivelGeneracionIaPlanificacionDto.Historias,
        totalCreados: 8,
        mensaje: 'Generación completada.',
      }),
    ).toEqual({
      proyectoId: 42,
      nivel: NivelGeneracionIaPlanificacion.Historias,
      totalCreados: 8,
      mensaje: 'Generación completada.',
    });
  });

  it.each([
    [
      NivelGeneracionIaPlanificacionDto.Caracteristicas,
      NivelGeneracionIaPlanificacion.Caracteristicas,
    ],
    [NivelGeneracionIaPlanificacionDto.Historias, NivelGeneracionIaPlanificacion.Historias],
  ])(
    'adapta el nivel serializado por el backend sin convertir un éxito en error',
    (nivelDto, nivelEsperado) => {
      expect(
        mapearResultadoGeneracionIaPlanificacion({
          proyectoId: 42,
          nivel: nivelDto,
          totalCreados: 4,
          mensaje: 'Generación completada.',
        }),
      ).toMatchObject({ nivel: nivelEsperado, totalCreados: 4 });
    },
  );

  it('rechaza un nivel desconocido recibido desde el backend', () => {
    expect(() =>
      mapearResultadoGeneracionIaPlanificacion({
        proyectoId: 42,
        nivel: 'desconocido' as NivelGeneracionIaPlanificacionDto,
        totalCreados: 0,
        mensaje: '',
      }),
    ).toThrow('Nivel de generación mediante IA no compatible');
  });
});
