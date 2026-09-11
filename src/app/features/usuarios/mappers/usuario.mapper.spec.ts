import { mapearUsuario } from './usuario.mapper';

describe('Mapeador de usuario', () => {
  it('conserva identidad, perfil, límites, estado y auditoría del contrato remoto', () => {
    const dto = {
      id: 12,
      idAzure: 'azure-12',
      nombre: 'Ana Torres',
      correo: 'ana@empresa.com',
      perfilTecnicoId: 36,
      perfilTecnicoCodigo: 'perfil_qa',
      perfilTecnicoNombre: 'Ingeniero automatizador de calidad',
      limiteTokensMensual: 250000,
      activo: true,
      fechaCreacion: '2026-09-10T10:00:00Z',
      fechaActualizacion: null,
    };

    expect(mapearUsuario(dto)).toEqual(dto);
  });
});
