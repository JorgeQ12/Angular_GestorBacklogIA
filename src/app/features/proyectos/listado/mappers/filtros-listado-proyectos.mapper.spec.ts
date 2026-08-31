import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';
import {
  mapearValoresFormularioFiltrosListadoProyectos,
  normalizarTerminoBusquedaListadoProyectos,
  sonFiltrosListadoProyectosIguales,
} from './filtros-listado-proyectos.mapper';

describe('filtros-listado-proyectos.mapper', () => {
  it('normaliza la búsqueda única y conserva el estado seleccionado', () => {
    expect(
      mapearValoresFormularioFiltrosListadoProyectos({
        busqueda: '  Portal  ',
        estado: EstadoCatalogoProyecto.EnProgreso,
      }),
    ).toEqual({
      nombre: 'Portal',
      responsable: '',
      estado: EstadoCatalogoProyecto.EnProgreso,
    });
  });

  it('descarta términos por debajo de la longitud mínima', () => {
    expect(normalizarTerminoBusquedaListadoProyectos(' IA ')).toBe('');
  });

  it('compara la fotografía completa de los filtros', () => {
    const filtros = {
      nombre: 'Portal',
      responsable: '',
      estado: EstadoCatalogoProyecto.Borrador,
    } as const;

    expect(sonFiltrosListadoProyectosIguales(filtros, { ...filtros })).toBe(true);
    expect(
      sonFiltrosListadoProyectosIguales(filtros, {
        ...filtros,
        estado: EstadoCatalogoProyecto.Cerrado,
      }),
    ).toBe(false);
  });
});
