import { CrearBorradorProyectoRespuestaDto } from '../models/borrador-proyecto.dto';
import { ValidarVinculacionAzureRespuestaDto } from '../models/vinculacion-azure.dto';
import {
  mapearActualizacionBorrador,
  mapearBorradorProyecto,
  mapearBorradorProyectoCreado,
  mapearResultadoVinculacionAzure,
  mapearSolicitudVinculacionAzure,
} from './creacion-proyecto.mapper';

const VINCULACION_DTO: ValidarVinculacionAzureRespuestaDto = {
  organizacion: 'Interrapidísimo',
  proyectoAzureId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  proyectoAzureNombre: 'InterIA',
  teamId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  teamNombre: 'Producto',
  boardUrl: 'https://dev.azure.com/interia/proyecto',
  areaPath: 'InterIA',
  iterationPath: null,
  epicaAzureId: 321,
  tipoWorkItemEpica: 'Epic',
  urlEpica: 'https://dev.azure.com/interia/_workitems/edit/321',
  miembros: [{ id: 'usuario-1', nombre: 'Jorge', correo: null, esAdministrador: true }],
  revisiones: [
    {
      revision: 1,
      titulo: 'Primera versión',
      descripcion: '',
      estado: 'Nuevo',
      areaPath: null,
      iterationPath: null,
      autorCambio: null,
      fechaCambio: '2026-08-24T10:00:00Z',
      camposJson: '{}',
    },
    {
      revision: 2,
      titulo: 'Épica vigente',
      descripcion: '',
      estado: 'Activo',
      areaPath: null,
      iterationPath: null,
      autorCambio: 'Jorge',
      fechaCambio: '2026-08-24T11:00:00Z',
      camposJson: '{}',
    },
  ],
};

describe('mapeadores de creación de proyecto', () => {
  it('traduce los nombres del formulario al contrato de Azure', () => {
    expect(
      mapearSolicitudVinculacionAzure({
        urlBoard: 'https://dev.azure.com/interia/proyecto',
        idEpica: 321,
        idEquipo: null,
      }),
    ).toEqual({
      boardUrl: 'https://dev.azure.com/interia/proyecto',
      epicaAzureId: 321,
      teamId: null,
    });
  });

  it('presenta la revisión más reciente y los totales encontrados', () => {
    expect(mapearResultadoVinculacionAzure(VINCULACION_DTO)).toEqual({
      organizacion: 'Interrapidísimo',
      nombreProyecto: 'InterIA',
      idEpica: 321,
      tituloEpica: 'Épica vigente',
      cantidadRevisiones: 2,
      nombreEquipo: 'Producto',
      cantidadMiembros: 1,
    });
  });

  it('reduce el borrador al estado requerido para navegar', () => {
    const dto = {
      proyectoId: 42,
      revision: 3,
      pasoActual: 1,
    } as CrearBorradorProyectoRespuestaDto;

    expect(mapearBorradorProyectoCreado(dto)).toEqual({ id: 42, revision: 3, pasoActual: 1 });
  });

  it('normaliza la fecha del backend y conserva la fotografía editable', () => {
    const borrador = mapearBorradorProyecto({
      ...crearBorradorDto(),
      fechaObjetivo: '2026-09-30T00:00:00',
    });

    expect(borrador.contexto).toEqual({
      nombre: 'InterIA',
      responsable: 'Jorge',
      descripcion: 'Gestión del backlog.',
      prioridadCatalogoId: 14,
      fechaObjetivo: '2026-09-30',
    });
    expect(borrador.tipoSolucionJson).toBe('{"tieneInterfaz":true}');
    expect(borrador.equipoAzure).toEqual({
      idEquipo: VINCULACION_DTO.teamId,
      nombreEquipo: 'Producto',
      integrantes: [
        {
          idAzure: 'usuario-1',
          nombre: 'Jorge',
          correo: null,
          esAdministradorAzure: true,
        },
      ],
      fechaSincronizacion: null,
    });
  });

  it('combina Contexto con las secciones no modificadas del borrador', () => {
    const borrador = mapearBorradorProyecto(crearBorradorDto());
    const solicitud = mapearActualizacionBorrador(
      borrador,
      {
        contexto: {
          nombre: 'InterIA renovado',
          responsable: 'María',
          descripcion: 'Nuevo contexto.',
          prioridadCatalogoId: 13,
          fechaObjetivo: '2026-10-10',
        },
      },
      2,
    );

    expect(solicitud).toMatchObject({
      proyectoId: 42,
      revisionEsperada: 3,
      pasoActual: 2,
      nombre: 'InterIA renovado',
      tipoSolucionJson: '{"tieneInterfaz":true}',
      rolesJson: '[]',
    });
  });

  it('reemplaza únicamente el JSON de Necesidad', () => {
    const borrador = mapearBorradorProyecto(crearBorradorDto());
    const solicitud = mapearActualizacionBorrador(
      borrador,
      { necesidadJson: '{"situacionActual":"Registro manual"}' },
      4,
    );

    expect(solicitud).toMatchObject({
      pasoActual: 4,
      tipoSolucionJson: '{"tieneInterfaz":true}',
      necesidadJson: '{"situacionActual":"Registro manual"}',
      objetivosJson: '{}',
    });
  });

  it('reemplaza únicamente el JSON de Objetivos', () => {
    const borrador = mapearBorradorProyecto(crearBorradorDto());
    const solicitud = mapearActualizacionBorrador(
      borrador,
      {
        objetivosJson:
          '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar"]}',
      },
      5,
    );

    expect(solicitud).toMatchObject({
      pasoActual: 5,
      necesidadJson: '{}',
      objetivosJson: '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar"]}',
      alcanceJson: '{}',
    });
  });

  it('reemplaza únicamente el JSON de Alcance', () => {
    const borrador = mapearBorradorProyecto(crearBorradorDto());
    const solicitud = mapearActualizacionBorrador(
      borrador,
      { alcanceJson: '{"incluido":"Seguimiento","excluido":"Pagos"}' },
      6,
    );

    expect(solicitud).toMatchObject({
      pasoActual: 6,
      objetivosJson: '{}',
      alcanceJson: '{"incluido":"Seguimiento","excluido":"Pagos"}',
      rolesJson: '[]',
    });
  });

  it('reemplaza únicamente el JSON de Roles', () => {
    const borrador = mapearBorradorProyecto(crearBorradorDto());
    const rolesJson = '[{"nombre":"Administrador","descripcion":"Configura"}]';
    const solicitud = mapearActualizacionBorrador(borrador, { rolesJson }, 7);

    expect(solicitud).toMatchObject({
      pasoActual: 7,
      alcanceJson: '{}',
      rolesJson,
      equipoJson: '[]',
    });
  });

  it('reemplaza únicamente el JSON de Equipo', () => {
    const borrador = mapearBorradorProyecto(crearBorradorDto());
    const equipoJson = '[{"idAzure":"u1","perfilTecnicoCodigo":"qa"}]';
    const solicitud = mapearActualizacionBorrador(borrador, { equipoJson }, 8);

    expect(solicitud).toMatchObject({
      pasoActual: 8,
      rolesJson: '[]',
      equipoJson,
      diagramFlujoJson: '{}',
    });
  });

  it('reemplaza únicamente el JSON de Flujo', () => {
    const borrador = mapearBorradorProyecto(crearBorradorDto());
    const diagramFlujoJson =
      '{"projectId":"42","roles":[],"nodes":[],"connections":[],"updatedAt":"2026-08-28T10:00:00.000Z"}';
    const solicitud = mapearActualizacionBorrador(borrador, { diagramFlujoJson }, 9);

    expect(solicitud).toMatchObject({
      pasoActual: 9,
      equipoJson: '[]',
      diagramFlujoJson,
    });
  });
});

function crearBorradorDto(): CrearBorradorProyectoRespuestaDto {
  return {
    proyectoId: 42,
    revision: 3,
    pasoActual: 1,
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión del backlog.',
    prioridadCatalogoId: 14,
    prioridadCodigo: 'media',
    estadoCatalogoId: null,
    estadoCodigo: null,
    fechaObjetivo: null,
    tipoSolucionJson: '{"tieneInterfaz":true}',
    necesidadJson: '{}',
    objetivosJson: '{}',
    alcanceJson: '{}',
    rolesJson: '[]',
    equipoJson: '[]',
    diagramFlujoJson: '{}',
    fechaUltimoGuardado: '2026-08-25T12:00:00Z',
    azure: VINCULACION_DTO,
    insumos: [],
  };
}
