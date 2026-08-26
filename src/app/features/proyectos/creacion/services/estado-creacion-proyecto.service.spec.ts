import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { CreacionProyectoService } from './creacion-proyecto.service';
import { EstadoCreacionProyectoService } from './estado-creacion-proyecto.service';

describe('EstadoCreacionProyectoService', () => {
  const creacionProyecto = {
    obtenerBorrador: vi.fn(),
    actualizarContexto: vi.fn(),
    actualizarAlcance: vi.fn(),
    actualizarNecesidad: vi.fn(),
    actualizarObjetivos: vi.fn(),
    actualizarTipoSolucion: vi.fn(),
  };
  let servicio: EstadoCreacionProyectoService;

  beforeEach(() => {
    vi.clearAllMocks();
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR));
    creacionProyecto.actualizarContexto.mockReturnValue(
      of({ ...BORRADOR, revision: 4, pasoActual: 2 }),
    );
    creacionProyecto.actualizarTipoSolucion.mockReturnValue(
      of({
        ...BORRADOR,
        revision: 5,
        pasoActual: 3,
        tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
      }),
    );
    creacionProyecto.actualizarNecesidad.mockReturnValue(
      of({
        ...BORRADOR,
        revision: 6,
        pasoActual: 4,
        necesidadJson:
          '{"situacionActual":"Registro manual","problemas":"Reprocesos","impacto":"Costos"}',
      }),
    );
    creacionProyecto.actualizarObjetivos.mockReturnValue(
      of({
        ...BORRADOR,
        revision: 7,
        pasoActual: 5,
        objetivosJson:
          '{"objetivoGeneral":"Reducir tiempos","objetivosEspecificos":["Automatizar"]}',
      }),
    );
    creacionProyecto.actualizarAlcance.mockReturnValue(
      of({
        ...BORRADOR,
        revision: 8,
        pasoActual: 6,
        alcanceJson: '{"incluido":"Seguimiento","excluido":"Pagos"}',
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
      servicio.guardarContexto({
        nombre: 'InterIA',
        responsable: 'María',
        descripcion: 'Contexto actualizado.',
        prioridadCatalogoId: 13,
        fechaObjetivo: '2026-09-30',
      }),
    );

    expect(creacionProyecto.actualizarContexto).toHaveBeenCalledWith(
      BORRADOR,
      expect.objectContaining({ responsable: 'María' }),
      2,
    );
    expect(servicio.borrador()?.revision).toBe(4);
  });

  it('no hace retroceder el avance al editar Contexto desde un paso posterior', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of({ ...BORRADOR, pasoActual: 5 }));
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(servicio.guardarContexto(BORRADOR.contexto));

    expect(creacionProyecto.actualizarContexto).toHaveBeenCalledWith(
      expect.objectContaining({ pasoActual: 5 }),
      BORRADOR.contexto,
      5,
    );
  });

  it('conserva la revisión devuelta al guardar Tipo de solución', async () => {
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(servicio.guardarTipoSolucion({ tieneInterfaz: true, plataforma: 'Web' }));

    expect(creacionProyecto.actualizarTipoSolucion).toHaveBeenCalledWith(
      BORRADOR,
      { tieneInterfaz: true, plataforma: 'Web' },
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
    await firstValueFrom(servicio.guardarNecesidad(necesidad));

    expect(creacionProyecto.actualizarNecesidad).toHaveBeenCalledWith(BORRADOR, necesidad, 4);
    expect(servicio.borrador()?.revision).toBe(6);
  });

  it('no hace retroceder el avance al editar Necesidad desde un paso posterior', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of({ ...BORRADOR, pasoActual: 7 }));
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarNecesidad({
        situacionActual: 'Registro manual',
        problemas: 'Reprocesos',
        impacto: 'Costos',
      }),
    );

    expect(creacionProyecto.actualizarNecesidad).toHaveBeenCalledWith(
      expect.objectContaining({ pasoActual: 7 }),
      expect.any(Object),
      7,
    );
  });

  it('conserva la revisión devuelta al guardar Objetivos', async () => {
    const objetivos = {
      objetivoGeneral: 'Reducir tiempos',
      objetivosEspecificos: ['Automatizar'],
    };
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(servicio.guardarObjetivos(objetivos));

    expect(creacionProyecto.actualizarObjetivos).toHaveBeenCalledWith(BORRADOR, objetivos, 5);
    expect(servicio.borrador()?.revision).toBe(7);
  });

  it('no hace retroceder el avance al editar Objetivos desde un paso posterior', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of({ ...BORRADOR, pasoActual: 8 }));
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(
      servicio.guardarObjetivos({
        objetivoGeneral: 'Reducir tiempos',
        objetivosEspecificos: ['Automatizar'],
      }),
    );

    expect(creacionProyecto.actualizarObjetivos).toHaveBeenCalledWith(
      expect.objectContaining({ pasoActual: 8 }),
      expect.any(Object),
      8,
    );
  });

  it('conserva la revisión devuelta al guardar Alcance', async () => {
    const alcance = {
      incluido: 'Seguimiento',
      excluido: 'Pagos',
    };
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(servicio.guardarAlcance(alcance));

    expect(creacionProyecto.actualizarAlcance).toHaveBeenCalledWith(BORRADOR, alcance, 6);
    expect(servicio.borrador()?.revision).toBe(8);
  });

  it('no hace retroceder el avance al editar Alcance desde un paso posterior', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of({ ...BORRADOR, pasoActual: 8 }));
    await firstValueFrom(servicio.cargar(42));
    await firstValueFrom(servicio.guardarAlcance({ incluido: 'Seguimiento', excluido: 'Pagos' }));

    expect(creacionProyecto.actualizarAlcance).toHaveBeenCalledWith(
      expect.objectContaining({ pasoActual: 8 }),
      expect.any(Object),
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
