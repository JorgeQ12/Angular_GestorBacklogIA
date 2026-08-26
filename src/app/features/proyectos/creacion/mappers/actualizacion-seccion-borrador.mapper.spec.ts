import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
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
      datos: { tieneInterfaz: true, plataforma: 'Web' as const },
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
  ] as const)('serializa la sección $seccion con su mapper canónico', (caso) => {
    expect(mapearCambioSeccionBorrador(caso)).toEqual(caso.cambio);
  });
});
