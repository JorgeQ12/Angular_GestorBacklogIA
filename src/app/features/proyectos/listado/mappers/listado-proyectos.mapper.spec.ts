import type { PaginadoDto } from '../../../../core/http/models/paginado.dto';
import type { ProyectoListadoDto } from '../models/proyecto-listado.dto';
import { mapearPaginaListadoProyectos, mapearProyectoListado } from './listado-proyectos.mapper';

describe('listado-proyectos.mapper', () => {
  it('separa el registro HTTP del modelo presentado', () => {
    expect(mapearProyectoListado(PROYECTO_CONFIRMADO)).toEqual({
      id: 42,
      nombre: 'Portal de clientes',
      responsable: 'María Gómez',
      estado: 'Activo',
      prioridad: 'Alta',
      fechaObjetivo: '2026-09-30T00:00:00',
      tieneBacklog: true,
      esBorrador: false,
      progresoCreacion: null,
    });
  });

  it('proyecta el avance visual de un borrador y normaliza textos vacíos', () => {
    const proyecto = mapearProyectoListado({
      ...PROYECTO_CONFIRMADO,
      nombre: ' ',
      responsable: '',
      estado: 'Borrador',
      esBorrador: true,
      pasoActual: 4,
    });

    expect(proyecto.nombre).toBe('Proyecto sin nombre');
    expect(proyecto.responsable).toBe('Equipo por completar');
    expect(proyecto.progresoCreacion).toMatchObject({ posicion: 5, total: 9 });
  });

  it('conserva los metadatos del paginado remoto', () => {
    const pagina = mapearPaginaListadoProyectos({
      registros: [PROYECTO_CONFIRMADO],
      paginaActual: 2,
      paginaTamano: 10,
      totalRegistros: 17,
      paginas: 2,
    } satisfies PaginadoDto<ProyectoListadoDto>);

    expect(pagina).toMatchObject({
      paginaActual: 2,
      paginaTamano: 10,
      totalRegistros: 17,
      totalPaginas: 2,
    });
    expect(pagina.proyectos).toHaveLength(1);
  });

  it('normaliza como vacío un paginado sin registros', () => {
    const pagina = mapearPaginaListadoProyectos({
      registros: null,
      paginaActual: 1,
      paginaTamano: 10,
      totalRegistros: 0,
      paginas: 0,
    });

    expect(pagina.proyectos).toEqual([]);
  });

  it('tolera catálogos ausentes en respuestas parciales', () => {
    const proyecto = mapearProyectoListado({
      ...PROYECTO_CONFIRMADO,
      estado: '',
      estadoCatalogo: null,
      prioridadCatalogo: null,
    });

    expect(proyecto.estado).toBe('Sin estado');
    expect(proyecto.prioridad).toBe('Sin prioridad');
  });
});

const PROYECTO_CONFIRMADO: ProyectoListadoDto = {
  id: 42,
  nombre: 'Portal de clientes',
  responsable: 'María Gómez',
  prioridadCatalogoId: 3,
  prioridadCatalogo: { id: 3, codigo: 'alta', nombre: 'Alta', descripcion: '' },
  estadoCatalogoId: 7,
  estadoCatalogo: { id: 7, codigo: 'activo', nombre: 'Activo', descripcion: '' },
  estado: 'Activo',
  fechaObjetivo: '2026-09-30T00:00:00',
  tieneBacklog: true,
  esBorrador: false,
  pasoActual: null,
};
