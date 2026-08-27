import {
  combinarEquipoConAzure,
  deserializarEquipoProyecto,
  serializarEquipoProyecto,
} from './equipo-proyecto.mapper';

describe('mapeadores de Equipo', () => {
  it('recupera únicamente el contrato canónico en español', () => {
    expect(
      deserializarEquipoProyecto(
        '[{"idAzure":"u1","nombre":"Jorge","correo":null,"esAdministradorAzure":true,"perfilTecnicoCodigo":"devops","dedicacionCodigo":"100"}]',
      ),
    ).toEqual({
      integrantes: [
        {
          idAzure: 'u1',
          nombre: 'Jorge',
          correo: null,
          esAdministradorAzure: true,
          perfilTecnicoCodigo: 'devops',
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
            idAzure: ' u1 ',
            nombre: ' Jorge ',
            correo: ' jorge@interia.co ',
            esAdministradorAzure: false,
            perfilTecnicoCodigo: ' devops ',
            dedicacionCodigo: ' 100 ',
          },
        ],
      }),
    ).toBe(
      '[{"idAzure":"u1","nombre":"Jorge","correo":"jorge@interia.co","esAdministradorAzure":false,"perfilTecnicoCodigo":"devops","dedicacionCodigo":"100"}]',
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
            idAzure: 'u1',
            nombre: 'Nombre actualizado',
            correo: 'nuevo@interia.co',
            esAdministradorAzure: true,
          },
          {
            idAzure: 'u2',
            nombre: 'Nueva persona',
            correo: null,
            esAdministradorAzure: false,
          },
        ],
      },
      {
        integrantes: [
          {
            idAzure: 'u1',
            nombre: 'Nombre anterior',
            correo: null,
            esAdministradorAzure: false,
            perfilTecnicoCodigo: 'qa',
            dedicacionCodigo: '50',
          },
          {
            idAzure: 'retirado',
            nombre: 'Retirado',
            correo: null,
            esAdministradorAzure: false,
            perfilTecnicoCodigo: 'devops',
            dedicacionCodigo: '100',
          },
        ],
      },
    );

    expect(combinado.integrantes).toEqual([
      expect.objectContaining({
        idAzure: 'u1',
        nombre: 'Nombre actualizado',
        perfilTecnicoCodigo: 'qa',
        dedicacionCodigo: '50',
      }),
      expect.objectContaining({
        idAzure: 'u2',
        perfilTecnicoCodigo: '',
        dedicacionCodigo: '',
      }),
    ]);
  });
});
