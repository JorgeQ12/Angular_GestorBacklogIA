import { mapearUsuario } from './usuario.mapper';

describe('Mapeo de usuario', () => {
  it('conserva identidades, perfil, límite y fechas entregadas por el backend', () => {
    const dto = {
      id: 7,
      idAzure: 'azure-7',
      nombre: 'Ada Lovelace',
      correo: 'ada@empresa.com',
      perfilTecnicoId: 32,
      perfilTecnicoCodigo: 'perfil_arquitectura',
      perfilTecnicoNombre: 'Arquitectura',
      limiteTokensMensual: 100000,
      activo: true,
      fechaCreacion: '2026-09-01T12:00:00Z',
      fechaActualizacion: null,
    };

    expect(mapearUsuario(dto)).toEqual(dto);
  });

  it('conserva valores opcionales nulos sin inventar información', () => {
    const dto = {
      id: 8,
      idAzure: null,
      nombre: 'Persona sincronizada',
      correo: null,
      perfilTecnicoId: null,
      perfilTecnicoCodigo: null,
      perfilTecnicoNombre: null,
      limiteTokensMensual: null,
      activo: false,
      fechaCreacion: '2026-09-02T12:00:00Z',
      fechaActualizacion: '2026-09-03T12:00:00Z',
    };

    expect(mapearUsuario(dto)).toEqual(dto);
  });
});
