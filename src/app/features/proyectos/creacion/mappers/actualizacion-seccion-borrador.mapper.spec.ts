import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { PlataformaSolucion } from '../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { mapearCambioSeccionBorrador } from './actualizacion-seccion-borrador.mapper';

describe('mapearCambioSeccionBorrador', () => {
  it('mantiene Contexto como un reemplazo estructurado', () => {
    const contexto = {
      nombre: 'InterIA',
      responsable: 'Jorge',
      fechaObjetivo: '2026-09-30',
      prioridadCatalogoId: 14,
      descripcion: 'Gestión inteligente del backlog.',
    };

    expect(
      mapearCambioSeccionBorrador({
        seccion: ClaveSeccionProyecto.Contexto,
        datos: contexto,
      }),
    ).toEqual({ contexto });
  });

  it.each([
    {
      seccion: ClaveSeccionProyecto.TipoSolucion,
      datos: { tieneInterfaz: true, plataforma: PlataformaSolucion.Web },
      cambio: { tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}' },
    },
    {
      seccion: ClaveSeccionProyecto.Necesidad,
      datos: { situacionActual: 'Manual', problemas: 'Reprocesos', impacto: 'Demoras' },
      cambio: {
        necesidadJson: '{"situacionActual":"Manual","problemas":"Reprocesos","impacto":"Demoras"}',
      },
    },
    {
      seccion: ClaveSeccionProyecto.Objetivos,
      datos: { objetivoGeneral: 'Automatizar', objetivosEspecificos: ['Reducir tiempos'] },
      cambio: {
        objetivosJson:
          '{"objetivoGeneral":"Automatizar","objetivosEspecificos":["Reducir tiempos"]}',
      },
    },
    {
      seccion: ClaveSeccionProyecto.Alcance,
      datos: { incluido: 'Seguimiento', excluido: 'Pagos' },
      cambio: { alcanceJson: '{"incluido":"Seguimiento","excluido":"Pagos"}' },
    },
    {
      seccion: ClaveSeccionProyecto.Roles,
      datos: {
        roles: [{ nombre: 'Administrador', descripcion: 'Configura la solución.' }],
      },
      cambio: {
        rolesJson: '[{"nombre":"Administrador","descripcion":"Configura la solución."}]',
      },
    },
    {
      seccion: ClaveSeccionProyecto.Equipo,
      datos: {
        integrantes: [
          {
            idAzure: 'u1',
            nombre: 'Jorge',
            correo: null,
            esAdministradorAzure: true,
            perfilTecnicoCodigo: 'devops',
            dedicacionCodigo: '100',
          },
        ],
      },
      cambio: {
        equipoJson:
          '[{"idAzure":"u1","nombre":"Jorge","correo":null,"esAdministradorAzure":true,"perfilTecnicoCodigo":"devops","dedicacionCodigo":"100"}]',
      },
    },
  ] as const)('serializa la sección $seccion con su mapper canónico', (caso) => {
    expect(mapearCambioSeccionBorrador(caso)).toEqual(caso.cambio);
  });

  it('serializa Flujo dentro de diagramFlujoJson', () => {
    const flujo = {
      proyectoId: '42',
      roles: [],
      nodos: [],
      conexiones: [],
      fechaActualizacion: '2026-08-28T10:00:00.000Z',
    };

    const cambio = mapearCambioSeccionBorrador({
      seccion: ClaveSeccionProyecto.Flujo,
      datos: flujo,
    });

    expect(JSON.parse(cambio.diagramFlujoJson!)).toEqual({
      proyectoId: '42',
      roles: [],
      nodos: [],
      conexiones: [],
      fechaActualizacion: '2026-08-28T10:00:00.000Z',
    });
  });
});
