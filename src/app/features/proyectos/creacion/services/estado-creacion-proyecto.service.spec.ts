import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { ActualizacionSeccionBorrador } from '../models/actualizacion-seccion-borrador.model';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { CreacionProyectoService } from './creacion-proyecto.service';
import { EstadoCreacionProyectoService } from './estado-creacion-proyecto.service';

describe('EstadoCreacionProyectoService', () => {
  const creacionProyecto = {
    obtenerBorrador: vi.fn(),
    actualizarBorrador: vi.fn(),
  };
  let servicio: EstadoCreacionProyectoService;

  beforeEach(() => {
    vi.clearAllMocks();
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR));
    creacionProyecto.actualizarBorrador.mockImplementation(
      (
        borrador: BorradorProyecto,
        actualizacion: ActualizacionSeccionBorrador,
        pasoActual: number,
      ) =>
        of({
          ...borrador,
          revision: pasoActual + 2,
          pasoActual,
          contexto:
            actualizacion.seccion === ClaveSeccionProyecto.Contexto
              ? actualizacion.datos
              : borrador.contexto,
        }),
    );
    TestBed.configureTestingModule({
      providers: [
        EstadoCreacionProyectoService,
        { provide: CreacionProyectoService, useValue: creacionProyecto },
      ],
    });
    servicio = TestBed.inject(EstadoCreacionProyectoService);
  });

  it('reutiliza la fotografía cargada durante el mismo recorrido', async () => {
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(servicio.cargar(42));

    expect(creacionProyecto.obtenerBorrador).toHaveBeenCalledTimes(1);
    expect(servicio.borrador()?.id).toBe(42);
    expect(servicio.nombreProyecto()).toBe('InterIA');
  });

  it('conserva el nombre escrito para el encabezado del recorrido', () => {
    servicio.actualizarNombreProyecto('  Portal de clientes  ');

    expect(servicio.nombreProyecto()).toBe('Portal de clientes');
  });

  it('conserva la revisión devuelta al guardar Contexto', async () => {
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarSeccion({
        seccion: ClaveSeccionProyecto.Contexto,
        datos: {
          nombre: 'InterIA',
          responsable: 'María',
          descripcion: 'Contexto actualizado.',
          prioridadCatalogoId: 13,
          fechaObjetivo: '2026-09-30',
        },
      }),
    );

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      BORRADOR,
      {
        seccion: ClaveSeccionProyecto.Contexto,
        datos: expect.objectContaining({ responsable: 'María' }),
      },
      2,
    );
    expect(servicio.borrador()?.revision).toBe(4);
  });

  it('no hace retroceder el avance al editar Contexto desde un paso posterior', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of({ ...BORRADOR, pasoActual: 5 }));
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarSeccion({
        seccion: ClaveSeccionProyecto.Contexto,
        datos: BORRADOR.contexto,
      }),
    );

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      expect.objectContaining({ pasoActual: 5 }),
      { seccion: ClaveSeccionProyecto.Contexto, datos: BORRADOR.contexto },
      5,
    );
  });

  it('conserva la revisión devuelta al guardar Tipo de solución', async () => {
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarSeccion({
        seccion: ClaveSeccionProyecto.TipoSolucion,
        datos: { tieneInterfaz: true, plataforma: 'Web' },
      }),
    );

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      BORRADOR,
      {
        seccion: ClaveSeccionProyecto.TipoSolucion,
        datos: { tieneInterfaz: true, plataforma: 'Web' },
      },
      3,
    );
    expect(servicio.borrador()?.revision).toBe(5);
  });

  it('conserva la revisión devuelta al guardar Necesidad', async () => {
    const necesidad = {
      situacionActual: 'Registro manual',
      problemas: 'Reprocesos',
      impacto: 'Costos',
    };
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarSeccion({ seccion: ClaveSeccionProyecto.Necesidad, datos: necesidad }),
    );

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      BORRADOR,
      { seccion: ClaveSeccionProyecto.Necesidad, datos: necesidad },
      4,
    );
    expect(servicio.borrador()?.revision).toBe(6);
  });

  it('no hace retroceder el avance al editar Necesidad desde un paso posterior', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of({ ...BORRADOR, pasoActual: 7 }));
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarSeccion({
        seccion: ClaveSeccionProyecto.Necesidad,
        datos: {
          situacionActual: 'Registro manual',
          problemas: 'Reprocesos',
          impacto: 'Costos',
        },
      }),
    );

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      expect.objectContaining({ pasoActual: 7 }),
      expect.objectContaining({ seccion: ClaveSeccionProyecto.Necesidad }),
      7,
    );
  });

  it('conserva la revisión devuelta al guardar Objetivos', async () => {
    const objetivos = {
      objetivoGeneral: 'Reducir tiempos',
      objetivosEspecificos: ['Automatizar'],
    };
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarSeccion({ seccion: ClaveSeccionProyecto.Objetivos, datos: objetivos }),
    );

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      BORRADOR,
      { seccion: ClaveSeccionProyecto.Objetivos, datos: objetivos },
      5,
    );
    expect(servicio.borrador()?.revision).toBe(7);
  });

  it('no hace retroceder el avance al editar Objetivos desde un paso posterior', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of({ ...BORRADOR, pasoActual: 8 }));
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarSeccion({
        seccion: ClaveSeccionProyecto.Objetivos,
        datos: {
          objetivoGeneral: 'Reducir tiempos',
          objetivosEspecificos: ['Automatizar'],
        },
      }),
    );

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      expect.objectContaining({ pasoActual: 8 }),
      expect.objectContaining({ seccion: ClaveSeccionProyecto.Objetivos }),
      8,
    );
  });

  it('conserva la revisión devuelta al guardar Alcance', async () => {
    const alcance = {
      incluido: 'Seguimiento',
      excluido: 'Pagos',
    };
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarSeccion({ seccion: ClaveSeccionProyecto.Alcance, datos: alcance }),
    );

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      BORRADOR,
      { seccion: ClaveSeccionProyecto.Alcance, datos: alcance },
      6,
    );
    expect(servicio.borrador()?.revision).toBe(8);
  });

  it('no hace retroceder el avance al editar Alcance desde un paso posterior', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of({ ...BORRADOR, pasoActual: 8 }));
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarSeccion({
        seccion: ClaveSeccionProyecto.Alcance,
        datos: { incluido: 'Seguimiento', excluido: 'Pagos' },
      }),
    );

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      expect.objectContaining({ pasoActual: 8 }),
      expect.objectContaining({ seccion: ClaveSeccionProyecto.Alcance }),
      8,
    );
  });
});

const BORRADOR: BorradorProyecto = {
  id: 42,
  revision: 3,
  pasoActual: 1,
  contexto: {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión del backlog.',
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
};
