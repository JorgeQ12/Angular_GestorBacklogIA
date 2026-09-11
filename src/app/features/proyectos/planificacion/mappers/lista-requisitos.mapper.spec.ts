import { agruparRequisitos, mapearCatalogoRequisitos, mapearRequisitoProyecto } from './lista-requisitos.mapper';

describe('lista-requisitos.mapper', () => {
  it('adapta y agrupa requisitos por área y sección', () => {
    const base = { idRequisito: 1, codigo: 'REQ-1', area: 'Arquitectura', seccion: 'Integración', nombre: 'Trazabilidad', descripcion: 'Detalle', transversal: false, aplica: true, responsable: 'Arquitecto', nombreResponsable: null, validador: 'Líder', tipoRequisito: 'Funcional', agrupador: 'Diseño', orden: 1, cumple: false };
    const items = [mapearRequisitoProyecto(base), mapearRequisitoProyecto({ ...base, idRequisito: 2, codigo: 'REQ-2', seccion: 'Seguridad' })];
    expect(agruparRequisitos(items)).toEqual([{ nombre: 'Arquitectura', total: 2, secciones: [{ nombre: 'Integración', requisitos: [items[0]] }, { nombre: 'Seguridad', requisitos: [items[1]] }] }]);
  });

  it('convierte el catálogo a opciones compartidas', () => {
    const catalogo = mapearCatalogoRequisitos({ areas: [{ id: 1, nombre: 'Arquitectura', secciones: [{ id: 2, nombre: 'Integración', clasificacionRequisitoId: 1 }] }], tiposRequisito: [{ id: 3, nombre: 'Funcional' }], responsables: [{ valor: 'arquitecto', nombre: 'Arquitecto', nombreSugerido: 'Ana' }], validadores: [{ valor: 'lider', nombre: 'Líder' }], agrupadores: [{ valor: 'diseno', nombre: 'Diseño' }] });
    expect(catalogo.tipos).toEqual([{ valor: 3, etiqueta: 'Funcional' }]); expect(catalogo.nombresResponsables['arquitecto']).toBe('Ana');
  });
});