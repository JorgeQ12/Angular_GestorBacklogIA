import { BorradorProyecto } from '../models/borrador-proyecto.model';

/** Crea una fotografía canónica y modificable para las pruebas del recorrido. */
export function crearBorradorProyectoPrueba(
  cambios: Partial<BorradorProyecto> = {},
): BorradorProyecto {
  return {
    id: 42,
    revision: 3,
    pasoActual: 1,
    equipoAzure: null,
    contexto: {
      nombre: 'InterIA',
      responsable: 'Jorge',
      descripcion: 'Gestión inteligente del backlog.',
      prioridadCatalogoId: 14,
      fechaObjetivo: '2026-09-30',
    },
    estadoCatalogoId: null,
    tipoSolucionJson: '{}',
    necesidadJson: '{}',
    objetivosJson: '{}',
    alcanceJson: '{}',
    rolesJson: '[]',
    equipoJson: '[]',
    diagramFlujoJson: '{}',
    fechaUltimoGuardado: '2026-08-25T12:00:00Z',
    ...cambios,
  };
}
