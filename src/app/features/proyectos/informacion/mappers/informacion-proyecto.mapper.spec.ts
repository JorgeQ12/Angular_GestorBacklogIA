import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { PlataformaSolucion } from '../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import type { ProyectoInformacionDto } from '../models/informacion-proyecto.dto';
import {
  mapearActualizacionProyecto,
  mapearInformacionProyecto,
} from './informacion-proyecto.mapper';

describe('mapeadores de Información del proyecto', () => {
  it('construye una fotografía con las ocho secciones canónicas', () => {
    const proyecto = mapearInformacionProyecto(DTO);

    expect(proyecto.id).toBe(42);
    expect(proyecto.versionId).toBe(81);
    expect(proyecto.tipoSolucion.plataforma).toBe(PlataformaSolucion.Web);
    expect(proyecto.equipo.integrantes[0]?.nombre).toBe('María');
    expect(proyecto.flujo.proyectoId).toBe('42');
  });

  it('reemplaza una sola sección y exige la versión vigente al actualizar', () => {
    const proyecto = mapearInformacionProyecto(DTO);
    const solicitud = mapearActualizacionProyecto(proyecto, {
      seccion: ClaveSeccionProyecto.Necesidad,
      datos: { situacionActual: 'Nueva', problemas: 'Problema', impacto: 'Impacto' },
    });

    expect(solicitud.versionActualIdEsperada).toBe(81);
    expect(solicitud.necesidadJson).toBe(
      '{"situacionActual":"Nueva","problemas":"Problema","impacto":"Impacto"}',
    );
    expect(solicitud.objetivosJson).toBe(DTO.objetivosJson);
  });
});

const DTO: ProyectoInformacionDto = {
  id: 42,
  versionActualId: 81,
  nombre: 'Portal',
  responsable: 'Jorge',
  descripcion: 'Descripción',
  prioridadCatalogoId: 2,
  prioridadCatalogo: { id: 2, codigo: 'alta', nombre: 'Alta', descripcion: '' },
  estadoCatalogoId: 3,
  estadoCatalogo: { id: 3, codigo: 'en_progreso', nombre: 'En Progreso', descripcion: '' },
  fechaObjetivo: '2026-12-10',
  numeroVersionActual: 4,
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson: '{"situacionActual":"Actual","problemas":"Problema","impacto":"Impacto"}',
  objetivosJson: '{"objetivoGeneral":"Mejorar","objetivosEspecificos":["Automatizar"]}',
  alcanceJson: '{"incluido":"Portal","excluido":"Pagos"}',
  rolesJson: '[{"nombre":"Administrador","descripcion":"Configura"}]',
  equipoJson:
    '[{"idAzure":"u1","nombre":"María","correo":null,"esAdministradorAzure":true,"perfilTecnicoCodigo":"qa","dedicacionCodigo":"100"}]',
  diagramFlujoJson: '{}',
  azure: {
    organizacion: 'interia',
    proyectoAzureNombre: 'PoC',
    teamNombre: 'Team',
    boardUrl: 'https://azure.test',
    epicaAzureId: 385296,
    urlEpica: 'https://azure.test/385296',
    tituloEpica: 'Pruebas',
  },
};
