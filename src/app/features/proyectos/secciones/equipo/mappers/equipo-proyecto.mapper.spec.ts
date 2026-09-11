import {
  combinarEquipoConAzure,
  deserializarEquipoProyecto,
  serializarEquipoProyecto,
} from './equipo-proyecto.mapper';

describe('mapeadores de Equipo', () => {
  it('recupera únicamente el contrato canónico en español', () => {
    expect(
      deserializarEquipoProyecto(
        JSON.stringify([
          {
            idUsuario: 10,
            idAzure: 'u1',
            nombre: 'Jorge',
            correo: null,
            esAdministradorAzure: true,
            perfilTecnicoId: 32,
            perfilTecnicoNombre: 'DevOps',
            dedicacionCodigo: '100',
          },
        ]),
      ),
    ).toEqual({
      integrantes: [
        {
          idUsuario: 10,
          idAzure: 'u1',
          nombre: 'Jorge',
          correo: null,
          esAdministradorAzure: true,
          perfilTecnicoId: 32,
          perfilTecnicoNombre: 'DevOps',
          dedicacionCodigo: '100',
        },
      ],
    });
    expect(deserializarEquipoProyecto('[{"name":"Jorge","role":"DevOps"}]')).toBeNull();
  });

  it('normaliza los textos al serializar', () => {
    expect(
      serializarEquipoProyecto({
        integrantes: [
          {
            idUsuario: 10,
            idAzure: ' u1 ',
            nombre: ' Jorge ',
            correo: ' jorge@interia.co ',
            esAdministradorAzure: false,
            perfilTecnicoId: 32,
            perfilTecnicoNombre: ' DevOps ',
            dedicacionCodigo: ' 100 ',
          },
        ],
      }),
    ).toBe(
      JSON.stringify([
        {
          idUsuario: 10,
          idAzure: 'u1',
          nombre: 'Jorge',
          correo: 'jorge@interia.co',
          esAdministradorAzure: false,
          perfilTecnicoId: 32,
          perfilTecnicoNombre: 'DevOps',
          dedicacionCodigo: '100',
        },
      ]),
    );
  });

  it('renueva identidades, conserva asignaciones y descarta integrantes retirados', () => {
    const combinado = combinarEquipoConAzure(
      {
        idEquipo: 'team-1',
        nombreEquipo: 'Producto',
        fechaSincronizacion: null,
        integrantes: [
          {
            idUsuario: 10,
            idAzure: 'u1',
            nombre: 'Nombre actualizado',
            correo: 'nuevo@interia.co',
            esAdministradorAzure: true,
            perfilTecnicoId: 32,
            perfilTecnicoNombre: 'DevOps',
          },
          {
            idUsuario: 11,
            idAzure: 'u2',
            nombre: 'Nueva persona',
            correo: null,
            esAdministradorAzure: false,
            perfilTecnicoId: 32,
            perfilTecnicoNombre: 'DevOps',
          },
        ],
      },
      {
        integrantes: [
          {
            idUsuario: 10,
            idAzure: 'u1',
            nombre: 'Nombre anterior',
            correo: null,
            esAdministradorAzure: false,
            perfilTecnicoId: 36,
            perfilTecnicoNombre: 'QA',
            dedicacionCodigo: '50',
          },
          {
            idUsuario: 99,
            idAzure: 'retirado',
            nombre: 'Retirado',
            correo: null,
            esAdministradorAzure: false,
            perfilTecnicoId: 32,
            perfilTecnicoNombre: 'DevOps',
            dedicacionCodigo: '100',
          },
        ],
      },
    );

    expect(combinado.integrantes).toEqual([
      expect.objectContaining({
        idAzure: 'u1',
        nombre: 'Nombre actualizado',
        perfilTecnicoId: 36,
        perfilTecnicoNombre: 'QA',
        dedicacionCodigo: '50',
      }),
      expect.objectContaining({
        idAzure: 'u2',
        perfilTecnicoId: 32,
        perfilTecnicoNombre: 'DevOps',
        dedicacionCodigo: '',
      }),
    ]);
  });
});
