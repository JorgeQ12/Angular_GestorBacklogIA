import { ClaveSeccionProyecto, SECCIONES_PROYECTO } from './secciones-proyecto.config';

describe('SECCIONES_PROYECTO', () => {
  it('contiene únicamente las ocho secciones reutilizables del dominio', () => {
    expect(SECCIONES_PROYECTO.map((seccion) => seccion.clave)).toEqual(
      Object.values(ClaveSeccionProyecto),
    );
    expect(SECCIONES_PROYECTO.some((seccion) => `${seccion.clave}`.includes('azure'))).toBe(false);
  });
});
