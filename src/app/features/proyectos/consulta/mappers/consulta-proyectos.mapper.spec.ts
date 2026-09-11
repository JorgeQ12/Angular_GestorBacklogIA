import type { PaginadoDto } from '../../../../core/http/models/paginado.dto';
import type { ResumenProyectoDto } from '../models/resumen-proyecto.dto';
import { mapearPaginaProyectos, mapearResumenProyecto } from './consulta-proyectos.mapper';

describe('consulta-proyectos.mapper', () => {
  it('separa el registro HTTP del modelo presentado', () => {
    expect(mapearResumenProyecto(PROYECTO_CONFIRMADO)).toEqual({
      id: 42,
      nombre: 'Portal de clientes',
      responsable: 'María Gómez',
      estado: 'En Progreso',
      prioridad: 'Alta',
      fechaObjetivo: '2026-09-30T00:00:00',
      tieneBacklog: true,
      esBorrador: false,
      progresoCreacion: null,
    });
  });

  it('proyecta el avance visual de un borrador y normaliza textos vacíos', () => {
    const proyecto = mapearResumenProyecto({
      ...PROYECTO_CONFIRMADO,
      nombre: ' ',
      responsable: '',
      estado: 'Borrador',
      esBorrador: true,
      pasoActual: 4,
    });

    expect(proyecto.nombre).toBe('Proyecto sin nombre');
    expect(proyecto.responsable).toBe('Equipo por completar');
    expect(proyecto.progresoCreacion).toEqual(jasmine.objectContaining({ posicion: 5, total: 9 }));
  });

  it('conserva los metadatos del paginado remoto', () => {
    const pagina = mapearPaginaProyectos({
      registros: [PROYECTO_CONFIRMADO],
      paginaActual: 2,
      paginaTamano: 10,
      totalRegistros: 17,
      paginas: 2,
    } satisfies PaginadoDto<ResumenProyectoDto>);

    expect(pagina).toEqual(jasmine.objectContaining({
      paginaActual: 2,
      paginaTamano: 10,
      totalRegistros: 17,
      totalPaginas: 2,
    }));
    expect(pagina.proyectos.length).toBe(1);
  });

  it('normaliza como vacío un paginado sin registros', () => {
    const pagina = mapearPaginaProyectos({
      registros: null,
      paginaActual: 1,
      paginaTamano: 10,
      totalRegistros: 0,
      paginas: 0,
    });

    expect(pagina.proyectos).toEqual([]);
  });

  it('tolera catálogos ausentes en respuestas parciales', () => {
    const proyecto = mapearResumenProyecto({
      ...PROYECTO_CONFIRMADO,
      estado: '',
      estadoCatalogo: null,
      prioridadCatalogo: null,
    });

    expect(proyecto.estado).toBe('Sin estado');
    expect(proyecto.prioridad).toBe('Sin prioridad');
  });
});

const PROYECTO_CONFIRMADO: ResumenProyectoDto = {
  id: 42,
  nombre: 'Portal de clientes',
  responsable: 'María Gómez',
  prioridadCatalogoId: 3,
  prioridadCatalogo: { id: 3, codigo: 'alta', nombre: 'Alta', descripcion: '' },
  estadoCatalogoId: 7,
  estadoCatalogo: { id: 7, codigo: 'en_progreso', nombre: 'En Progreso', descripcion: '' },
  estado: 'En Progreso',
  fechaObjetivo: '2026-09-30T00:00:00',
  tieneBacklog: true,
  esBorrador: false,
  pasoActual: null,
};
