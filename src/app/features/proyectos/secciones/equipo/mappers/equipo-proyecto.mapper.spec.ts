import {
  combinarEquipoConAzure,
  deserializarEquipoProyecto,
  mapearPerfilesTecnicosEquipo,
  serializarEquipoProyecto,
} from './equipo-proyecto.mapper';

describe('mapeadores de Equipo', () => {
  it('recupera únicamente el contrato canónico en español', () => {
    expect(
      deserializarEquipoProyecto(
        '[{"idAzure":"u1","nombre":"Jorge","correo":null,"esAdministradorAzure":true,"perfilTecnicoId":32,"dedicacionCodigo":"100"}]',
      ),
    ).toEqual({
      integrantes: [
        {
          idAzure: 'u1',
          nombre: 'Jorge',
          correo: null,
          esAdministradorAzure: true,
          perfilTecnicoId: 32,
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
            perfilTecnicoId: 32,
            dedicacionCodigo: ' 100 ',
          },
        ],
      }),
    ).toBe(
      '[{"idAzure":"u1","nombre":"Jorge","correo":"jorge@interia.co","esAdministradorAzure":false,"perfilTecnicoId":32,"dedicacionCodigo":"100"}]',
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
            perfilTecnicoId: 33,
          },
          {
            idAzure: 'u2',
            nombre: 'Nueva persona',
            correo: null,
            esAdministradorAzure: false,
            perfilTecnicoId: 34,
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
            perfilTecnicoId: 36,
            dedicacionCodigo: '50',
          },
          {
            idAzure: 'retirado',
            nombre: 'Retirado',
            correo: null,
            esAdministradorAzure: false,
            perfilTecnicoId: 32,
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
        dedicacionCodigo: '50',
      }),
      expect.objectContaining({
        idAzure: 'u2',
        perfilTecnicoId: 34,
        dedicacionCodigo: '',
      }),
    ]);
  });

  it('usa el ID del catálogo remoto como valor del selector de perfiles', () => {
    expect(
      mapearPerfilesTecnicosEquipo([
        { id: 32, nombre: 'Ingeniero senior cloud', descripcion: 'Perfil técnico' },
      ]),
    ).toEqual([
      { valor: 32, etiqueta: 'Ingeniero senior cloud', descripcion: 'Perfil técnico' },
    ]);
  });
});
