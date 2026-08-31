import { convertToParamMap } from '@angular/router';
import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';
import {
  mapearParametrosListadoProyectos,
  obtenerEstadoCatalogoProyecto,
} from './parametros-listado-proyectos.mapper';

describe('parametros-listado-proyectos.mapper', () => {
  it('normaliza los filtros y la página provenientes de la URL', () => {
    expect(
      mapearParametrosListadoProyectos(
        convertToParamMap({
          nombre: ' Portal ',
          responsable: ' María ',
          estado: EstadoCatalogoProyecto.Activo,
          pagina: '3',
        }),
      ),
    ).toEqual({
      nombre: 'Portal',
      responsable: 'María',
      estado: EstadoCatalogoProyecto.Activo,
      pagina: 3,
      paginaTamano: 10,
    });
  });

  it('descarta estados y páginas que no pertenecen al contrato', () => {
    expect(
      mapearParametrosListadoProyectos(convertToParamMap({ estado: 'Todos', pagina: '-2' })),
    ).toEqual({ nombre: '', responsable: '', estado: null, pagina: 1, paginaTamano: 10 });
    expect(obtenerEstadoCatalogoProyecto('Archivado')).toBeNull();
  });

  it('descarta términos con menos de tres caracteres', () => {
    expect(
      mapearParametrosListadoProyectos(convertToParamMap({ nombre: 'IA', responsable: 'QA' })),
    ).toMatchObject({ nombre: '', responsable: '' });
  });
});
