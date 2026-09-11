import {
  OrigenVersionPlanificacionDto,
  type VersionPlanificacionDto,
} from '../models/version-planificacion.dto';
import { OrigenVersionPlanificacion } from '../models/version-planificacion.model';
import { mapearVersionesPlanificacion } from './version-planificacion.mapper';

describe('mapearVersionesPlanificacion', () => {
  it('adapta la identidad, las fechas y el origen de cada versión', () => {
    expect(mapearVersionesPlanificacion(VERSIONES_DTO)).toEqual([
      {
        id: 82,
        numero: 5,
        fechaInicio: '2026-09-03T10:00:00',
        fechaCierre: null,
        origen: OrigenVersionPlanificacion.GeneracionHistorias,
        esActual: true,
      },
      {
        id: 81,
        numero: 4,
        fechaInicio: '2026-09-02T08:00:00',
        fechaCierre: '2026-09-03T10:00:00',
        origen: OrigenVersionPlanificacion.Inicial,
        esActual: false,
      },
    ]);
  });

  it('rechaza un origen desconocido recibido desde el backend', () => {
    expect(() =>
      mapearVersionesPlanificacion([
        {
          ...VERSIONES_DTO[0],
          origen: 'desconocido' as OrigenVersionPlanificacionDto,
        },
      ]),
    ).toThrowError(/Origen de versión de planificación no compatible/);
  });

  ([
    [OrigenVersionPlanificacionDto.Inicial, OrigenVersionPlanificacion.Inicial],
    [
      OrigenVersionPlanificacionDto.GeneracionCaracteristicas,
      OrigenVersionPlanificacion.GeneracionCaracteristicas,
    ],
    [
      OrigenVersionPlanificacionDto.GeneracionHistorias,
      OrigenVersionPlanificacion.GeneracionHistorias,
    ],
    [OrigenVersionPlanificacionDto.GeneracionTareas, OrigenVersionPlanificacion.GeneracionTareas],
    [OrigenVersionPlanificacionDto.GeneracionEpicas, OrigenVersionPlanificacion.GeneracionEpicas],
    [OrigenVersionPlanificacionDto.ReemplazoManual, OrigenVersionPlanificacion.ReemplazoManual],
    [
      OrigenVersionPlanificacionDto.SincronizacionAzure,
      OrigenVersionPlanificacion.SincronizacionAzure,
    ],
  ] as const).forEach(([dto, esperado]) => {
    it(`traduce el origen ${dto} al valor interno de dominio`, () => {
      const [version] = mapearVersionesPlanificacion([{ ...VERSIONES_DTO[0], origen: dto }]);
      expect(version.origen).toBe(esperado);
    });
  });
});

const VERSIONES_DTO: readonly VersionPlanificacionDto[] = [
  {
    id: 82,
    numeroVersion: 5,
    fechaInicio: '2026-09-03T10:00:00',
    fechaCierre: null,
    origen: OrigenVersionPlanificacionDto.GeneracionHistorias,
    esActual: true,
  },
  {
    id: 81,
    numeroVersion: 4,
    fechaInicio: '2026-09-02T08:00:00',
    fechaCierre: '2026-09-03T10:00:00',
    origen: OrigenVersionPlanificacionDto.Inicial,
    esActual: false,
  },
];
