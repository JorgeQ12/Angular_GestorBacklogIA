import { ClaveSeccionProyecto } from '../config/secciones-proyecto.config';
import { PlataformaSolucion } from '../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import type { ContenidoPersistibleProyecto } from '../models/actualizacion-seccion-proyecto.model';
import {
  aplicarActualizacionSeccionProyecto,
  mapearCambioSeccionProyecto,
} from './actualizacion-seccion-proyecto.mapper';

describe('mapearCambioSeccionProyecto', () => {
  ([
    {
      actualizacion: {
        seccion: ClaveSeccionProyecto.Contexto,
        datos: {
          nombre: 'Portal',
          responsable: 'María',
          fechaObjetivo: '2026-10-01',
          prioridadCatalogoId: 2,
          descripcion: 'Autoservicio',
        },
      },
      esperado: {
        contexto: {
          nombre: 'Portal',
          responsable: 'María',
          fechaObjetivo: '2026-10-01',
          prioridadCatalogoId: 2,
          descripcion: 'Autoservicio',
        },
      },
    },
    {
      actualizacion: {
        seccion: ClaveSeccionProyecto.TipoSolucion,
        datos: { tieneInterfaz: true, plataforma: PlataformaSolucion.Web },
      },
      esperado: { tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}' },
    },
    {
      actualizacion: {
        seccion: ClaveSeccionProyecto.Necesidad,
        datos: { situacionActual: 'Manual', problemas: 'Retrasos', impacto: 'Costos' },
      },
      esperado: {
        necesidadJson: '{"situacionActual":"Manual","problemas":"Retrasos","impacto":"Costos"}',
      },
    },
    {
      actualizacion: {
        seccion: ClaveSeccionProyecto.Objetivos,
        datos: { objetivoGeneral: '  Mejorar  ', objetivosEspecificos: [' Automatizar '] },
      },
      esperado: {
        objetivosJson: '{"objetivoGeneral":"Mejorar","objetivosEspecificos":["Automatizar"]}',
      },
    },
    {
      actualizacion: {
        seccion: ClaveSeccionProyecto.Alcance,
        datos: { incluido: ' Portal ', excluido: ' Pagos ' },
      },
      esperado: { alcanceJson: '{"incluido":"Portal","excluido":"Pagos"}' },
    },
    {
      actualizacion: {
        seccion: ClaveSeccionProyecto.Roles,
        datos: { roles: [{ nombre: ' Admin ', descripcion: ' Configura ' }] },
      },
      esperado: { rolesJson: '[{"nombre":"Admin","descripcion":"Configura"}]' },
    },
    {
      actualizacion: {
        seccion: ClaveSeccionProyecto.Equipo,
        datos: {
          integrantes: [
            {
              idAzure: ' az-1 ',
              nombre: ' Ana ',
              correo: ' ana@x.com ',
              esAdministradorAzure: true,
              perfilTecnicoId: 3,
              dedicacionCodigo: ' full ',
            },
          ],
        },
      },
      esperado: {
        equipoJson:
          '[{"idAzure":"az-1","nombre":"Ana","correo":"ana@x.com","esAdministradorAzure":true,"perfilTecnicoId":3,"dedicacionCodigo":"full"}]',
      },
    },
  ] as const).forEach(({ actualizacion, esperado }) => {
    it(`reemplaza únicamente ${actualizacion.seccion}`, () => {
      expect(mapearCambioSeccionProyecto(actualizacion)).toEqual(esperado);
    });
  });

  it('serializa la sección Flujo recortando el identificador de proyecto', () => {
    const flujo = {
      proyectoId: ' 42 ',
      roles: [],
      nodos: [],
      conexiones: [],
      fechaActualizacion: '2026-01-01T00:00:00.000Z',
    };

    expect(
      mapearCambioSeccionProyecto({ seccion: ClaveSeccionProyecto.Flujo, datos: flujo }),
    ).toEqual({
      diagramFlujoJson:
        '{"proyectoId":"42","roles":[],"nodos":[],"conexiones":[],"fechaActualizacion":"2026-01-01T00:00:00.000Z"}',
    });
  });
});

describe('aplicarActualizacionSeccionProyecto', () => {
  const CONTENIDO: ContenidoPersistibleProyecto = {
    contexto: {
      nombre: 'Portal',
      responsable: 'María',
      descripcion: 'Autoservicio',
      prioridadCatalogoId: 2,
      fechaObjetivo: '2026-10-01',
    },
    tipoSolucionJson: '{"tieneInterfaz":false,"plataforma":"Web"}',
    necesidadJson: '{}',
    objetivosJson: '{}',
    alcanceJson: '{"incluido":"Antes","excluido":""}',
    rolesJson: '[]',
    equipoJson: '[]',
    diagramFlujoJson: '{}',
  };

  it('reemplaza sólo la sección indicada y conserva el resto del contenido', () => {
    const resultado = aplicarActualizacionSeccionProyecto(CONTENIDO, {
      seccion: ClaveSeccionProyecto.Alcance,
      datos: { incluido: 'Nuevo', excluido: 'Pagos' },
    });

    expect(resultado.alcanceJson).toBe('{"incluido":"Nuevo","excluido":"Pagos"}');
    expect(resultado.tipoSolucionJson).toBe(CONTENIDO.tipoSolucionJson);
    expect(resultado.rolesJson).toBe(CONTENIDO.rolesJson);
    expect(resultado.contexto).toEqual(CONTENIDO.contexto);
  });

  it('reemplaza el contexto conservando las secciones serializadas', () => {
    const contextoNuevo = {
      nombre: 'Renovado',
      responsable: 'Jorge',
      descripcion: 'Nueva descripción',
      prioridadCatalogoId: 1,
      fechaObjetivo: '2027-01-01',
    };

    const resultado = aplicarActualizacionSeccionProyecto(CONTENIDO, {
      seccion: ClaveSeccionProyecto.Contexto,
      datos: contextoNuevo,
    });

    expect(resultado.contexto).toEqual(contextoNuevo);
    expect(resultado.alcanceJson).toBe(CONTENIDO.alcanceJson);
  });
});
