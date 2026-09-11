import { convertToParamMap } from '@angular/router';
import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';
import {
  mapearParametrosConsultaProyectos,
  obtenerEstadoCatalogoProyecto,
} from './parametros-consulta-proyectos.mapper';

describe('parametros-consulta-proyectos.mapper', () => {
  it('normaliza los filtros y la página provenientes de la URL', () => {
    expect(
      mapearParametrosConsultaProyectos(
        convertToParamMap({
          nombre: ' Portal ',
          responsable: ' María ',
          estado: EstadoCatalogoProyecto.EnProgreso,
          pagina: '3',
        }),
      ),
    ).toEqual({
      nombre: 'Portal',
      responsable: 'María',
      estado: EstadoCatalogoProyecto.EnProgreso,
      pagina: 3,
      paginaTamano: 10,
    });
  });

  it('descarta estados y páginas que no pertenecen al contrato', () => {
    expect(
      mapearParametrosConsultaProyectos(convertToParamMap({ estado: 'Todos', pagina: '-2' })),
    ).toEqual({ nombre: '', responsable: '', estado: null, pagina: 1, paginaTamano: 10 });
    expect(obtenerEstadoCatalogoProyecto('Archivado')).toBeNull();
  });

  it('descarta términos con menos de tres caracteres', () => {
    expect(
      mapearParametrosConsultaProyectos(convertToParamMap({ nombre: 'IA', responsable: 'QA' })),
    ).toEqual(jasmine.objectContaining({ nombre: '', responsable: '' }));
  });
});
