import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';
import {
  mapearValoresFormularioFiltrosProyectos,
  normalizarTerminoBusquedaProyectos,
  sonFiltrosProyectosIguales,
} from './filtros-proyectos.mapper';

describe('filtros-proyectos.mapper', () => {
  it('normaliza la búsqueda única y conserva el estado seleccionado', () => {
    expect(
      mapearValoresFormularioFiltrosProyectos({
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
    expect(normalizarTerminoBusquedaProyectos(' IA ')).toBe('');
  });

  it('compara la fotografía completa de los filtros', () => {
    const filtros = {
      nombre: 'Portal',
      responsable: '',
      estado: EstadoCatalogoProyecto.Borrador,
    } as const;

    expect(sonFiltrosProyectosIguales(filtros, { ...filtros })).toBe(true);
    expect(
      sonFiltrosProyectosIguales(filtros, {
        ...filtros,
        estado: EstadoCatalogoProyecto.Cerrado,
      }),
    ).toBe(false);
  });
});
