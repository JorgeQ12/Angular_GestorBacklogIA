import { ClaveSeccionProyecto } from '../config/secciones-proyecto.config';
import { PlataformaSolucion } from '../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { mapearCambioSeccionProyecto } from './actualizacion-seccion-proyecto.mapper';

describe('mapearCambioSeccionProyecto', () => {
  it.each([
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
  ] as const)('reemplaza únicamente $actualizacion.seccion', ({ actualizacion, esperado }) => {
    expect(mapearCambioSeccionProyecto(actualizacion)).toEqual(esperado);
  });
});
