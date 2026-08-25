import { CrearBorradorProyectoRespuestaDto } from '../models/borrador-proyecto.dto';
import { ValidarVinculacionAzureRespuestaDto } from '../models/vinculacion-azure.dto';
import {
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
});
