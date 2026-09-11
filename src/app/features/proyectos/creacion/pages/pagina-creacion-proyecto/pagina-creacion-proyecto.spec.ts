import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { SEGMENTOS_RUTA, URL_INICIO_PANEL } from '../../../../../core/navegacion/rutas';
import { PasoEquipoProyecto } from '../../../components/pasos/paso-equipo-proyecto/paso-equipo-proyecto';
import { PasoFlujoProyecto } from '../../../components/pasos/paso-flujo-proyecto/paso-flujo-proyecto';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import { BorradorProyecto } from '../../models/borrador-proyecto.model';
import type { DatosVinculacionAzure } from '../../../models/vinculacion-azure-proyecto.model';
import type { EquipoProyecto } from '../../../secciones/equipo/models/equipo-proyecto.model';
import {
  FlujoProyecto,
  TipoBloqueFlujo,
} from '../../../secciones/flujo/models/flujo-proyecto.model';
import { CreacionProyectoService } from '../../services/creacion-proyecto.service';
import { EstadoCreacionProyectoService } from '../../services/estado-creacion-proyecto.service';
import { PaginaCreacionProyecto } from './pagina-creacion-proyecto';
import {
  AsistenteIAFlotante,
  EstadoAsistenteIAService,
} from '../../../../inteligencia-artificial/asistente-ia/public-api';

const RUTAS: Routes = [
  {
    path: `${SEGMENTOS_RUTA.proyectos}/${SEGMENTOS_RUTA.creacion}`,
    component: PaginaCreacionProyecto,
    providers: [EstadoCreacionProyectoService, EstadoAsistenteIAService],
  },
];

describe('PaginaCreacionProyecto', () => {
  const creacionProyecto = {
    obtenerBorrador: vi.fn(),
    validarVinculacionAzure: vi.fn(),
    crearBorrador: vi.fn(),
    actualizarBorrador: vi.fn(),
    generarDiagramaFlujoIA: vi.fn(),
    guardarProyecto: vi.fn(),
    sincronizarEquipoAzure: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR_AVANZADO));
    creacionProyecto.crearBorrador.mockReturnValue(of({ id: 42, revision: 1, pasoActual: 1 }));
    creacionProyecto.actualizarBorrador.mockReturnValue(
      of({ ...BORRADOR_FLUJO, revision: 5, pasoActual: 9 }),
    );
    creacionProyecto.guardarProyecto.mockReturnValue(of(undefined));
    creacionProyecto.generarDiagramaFlujoIA.mockReturnValue(of(FLUJO_GENERADO_IA));

    TestBed.configureTestingModule({
      imports: [PaginaCreacionProyecto],
      providers: [
        provideRouter(RUTAS),
        provideHttpClient(),
        { provide: CreacionProyectoService, useValue: creacionProyecto },
      ],
    });
  });

  it('presenta Azure en la única ruta de creación sin un router-outlet interno', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion');
    const elemento = harness.routeNativeElement as HTMLElement;

    expect(obtenerPosicionRecorrido(elemento)).toBe('Paso 1 de 9');
    expect(elemento.querySelector('[aria-current="step"]')?.textContent).toContain('Azure DevOps');
    expect(elemento.querySelector('app-paso-vinculacion-azure-proyecto')).not.toBeNull();
    expect(elemento.querySelector('router-outlet')).toBeNull();
  });

  it('reanuda el último paso alcanzado mediante proyectoId como query param', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const elemento = harness.routeNativeElement as HTMLElement;

    expect(creacionProyecto.obtenerBorrador).toHaveBeenCalledWith(42);
    expect(obtenerPosicionRecorrido(elemento)).toBe('Paso 5 de 9');
    expect(elemento.querySelector('[aria-current="step"]')?.textContent).toContain('Objetivos');
    expect(elemento.querySelector('app-paso-objetivos-proyecto')).not.toBeNull();
    expect(elemento.querySelector('app-asistente-ia-flotante')).not.toBeNull();
  });

  it('mantiene oculto el Asistente IA antes de alcanzar necesidad de negocio', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValueOnce(
      of({ ...BORRADOR_AVANZADO, pasoActual: 2 }),
    );
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');

    expect(
      (harness.routeNativeElement as HTMLElement).querySelector('app-asistente-ia-flotante'),
    ).toBeNull();
  });

  it.each(['Contexto del proyecto', 'Tipo de solución'])(
    'oculta el asistente al volver a %s y lo muestra al regresar a Necesidad',
    async (tituloPaso) => {
      const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
      const elemento = harness.routeNativeElement as HTMLElement;
      const estadoIA = harness.routeDebugElement!.injector.get(EstadoAsistenteIAService);

      expect(elemento.querySelector('app-asistente-ia-flotante')).not.toBeNull();

      const botonAnterior = Array.from(
        elemento.querySelectorAll<HTMLButtonElement>('.recorrido-proyecto__boton'),
      ).find((boton) => boton.textContent?.includes(tituloPaso));
      expect(botonAnterior).toBeDefined();
      botonAnterior!.click();
      harness.detectChanges();

      expect(elemento.querySelector('[aria-current="step"]')?.textContent).toContain(tituloPaso);
      expect(elemento.querySelector('app-asistente-ia-flotante')).toBeNull();

      const botonNecesidad = Array.from(
        elemento.querySelectorAll<HTMLButtonElement>('.recorrido-proyecto__boton'),
      ).find((boton) => boton.textContent?.includes('Necesidad de negocio'));
      expect(botonNecesidad).toBeDefined();
      botonNecesidad!.click();
      harness.detectChanges();

      const asistente = harness.routeDebugElement!.query(By.directive(AsistenteIAFlotante));
      expect(asistente).not.toBeNull();
      expect(asistente.componentInstance.contexto().seccionActiva).toBe(
        ClaveSeccionProyecto.Necesidad,
      );
      expect(asistente.injector.get(EstadoAsistenteIAService)).toBe(estadoIA);
      expect(creacionProyecto.obtenerBorrador).toHaveBeenCalledTimes(1);
    },
  );

  it('recarga el borrador después de aplicar una propuesta de IA', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const asistente = harness.routeDebugElement?.query(By.directive(AsistenteIAFlotante));

    asistente?.componentInstance.contextoActualizado.emit(42);

    expect(creacionProyecto.obtenerBorrador).toHaveBeenCalledTimes(2);
  });

  it('ignora una propuesta resuelta para un proyecto que ya no está activo', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const asistente = harness.routeDebugElement?.query(By.directive(AsistenteIAFlotante));

    asistente?.componentInstance.contextoActualizado.emit(84);

    expect(creacionProyecto.obtenerBorrador).toHaveBeenCalledTimes(1);
  });

  it('oculta el encabezado y el recorrido cuando falla la carga del borrador', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValueOnce(
      throwError(() => new Error('Error de carga')),
    );

    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const elemento = harness.routeNativeElement as HTMLElement;

    expect(elemento.querySelector('app-estado-error')?.classList).toContain(
      'estado-error--pagina-completa',
    );
    expect(elemento.querySelector('app-encabezado-pagina')).toBeNull();
    expect(elemento.querySelector('app-recorrido-proyecto')).toBeNull();
  });

  it('cambia solo el componente del paso y conserva la URL', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const elemento = harness.routeNativeElement as HTMLElement;
    const router = TestBed.inject(Router);
    const botonContexto = Array.from(
      elemento.querySelectorAll<HTMLButtonElement>('.recorrido-proyecto__boton'),
    ).find((boton) => boton.textContent?.includes('Contexto del proyecto'));

    botonContexto?.click();
    harness.detectChanges();

    expect(elemento.querySelector('app-paso-contexto-proyecto')).not.toBeNull();
    expect(router.url).toBe('/proyectos/creacion?proyectoId=42');
  });

  it('habilita solo los pasos alcanzados por el borrador', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const botones = (harness.routeNativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      '.recorrido-proyecto__boton',
    );

    expect(botones[1].disabled).toBe(false);
    expect(botones[3].disabled).toBe(false);
    expect(botones[4].disabled).toBe(true);
    expect(botones[5].disabled).toBe(true);
  });

  it('crea el borrador y agrega su id a la misma ruta', async () => {
    const harness = await RouterTestingHarness.create('/proyectos/creacion');
    const componente = harness.routeDebugElement?.componentInstance as PaginaCreacionProyecto;
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate');

    (
      componente as unknown as { datosVinculacion: { set: (datos: DatosVinculacionAzure) => void } }
    ).datosVinculacion.set(DATOS_VINCULACION);
    (componente as unknown as { crearBorrador: () => void }).crearBorrador();

    expect(creacionProyecto.crearBorrador).toHaveBeenCalledWith(DATOS_VINCULACION);
    expect(navegar).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { proyectoId: 42 },
      replaceUrl: true,
    });
  });

  it('actualiza el flujo, guarda con la nueva revisión y luego regresa al inicio', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR_FLUJO));
    const confirmacionGuardado = new Subject<void>();
    creacionProyecto.guardarProyecto.mockReturnValueOnce(confirmacionGuardado.asObservable());
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const pasoFlujo = harness.routeDebugElement?.query(By.directive(PasoFlujoProyecto))
      .componentInstance as PasoFlujoProyecto;

    pasoFlujo.guardar.emit(pasoFlujo.datos());

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalled();
    expect(creacionProyecto.guardarProyecto).toHaveBeenCalledWith({
      proyectoId: 42,
      revisionEsperada: 5,
    });
    expect(navegar).not.toHaveBeenCalled();

    confirmacionGuardado.next();
    confirmacionGuardado.complete();

    expect(navegar).toHaveBeenCalledWith(URL_INICIO_PANEL);
  });

  it('reemplaza el canvas con el diagrama generado sin persistirlo automáticamente', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR_FLUJO));
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const pasoFlujo = harness.routeDebugElement?.query(By.directive(PasoFlujoProyecto))
      .componentInstance as PasoFlujoProyecto;

    pasoFlujo.generarConIA.emit();
    harness.detectChanges();

    expect(creacionProyecto.generarDiagramaFlujoIA).toHaveBeenCalledWith(42);
    expect(pasoFlujo.datos()).toEqual(FLUJO_GENERADO_IA);
    expect(creacionProyecto.actualizarBorrador).not.toHaveBeenCalled();
  });

  it('guarda los cambios del canvas en el borrador sin finalizar ni abandonar el proyecto', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR_FLUJO));
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const pasoFlujo = harness.routeDebugElement?.query(By.directive(PasoFlujoProyecto))
      .componentInstance as PasoFlujoProyecto;

    pasoFlujo.guardarBorrador.emit(FLUJO_GENERADO_IA);

    expect(creacionProyecto.actualizarBorrador).toHaveBeenCalledWith(
      BORRADOR_FLUJO,
      {
        seccion: ClaveSeccionProyecto.Flujo,
        datos: FLUJO_GENERADO_IA,
      },
      9,
    );
    expect(creacionProyecto.guardarProyecto).not.toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('recupera las asignaciones de Equipo al volver después de guardarlas', async () => {
    creacionProyecto.obtenerBorrador.mockReturnValue(of(BORRADOR_EQUIPO));
    creacionProyecto.sincronizarEquipoAzure.mockReturnValue(of(ORIGEN_EQUIPO));
    creacionProyecto.actualizarBorrador.mockReturnValueOnce(
      of({
        ...BORRADOR_EQUIPO,
        revision: 5,
        pasoActual: 8,
        equipoJson: JSON.stringify(EQUIPO_CONFIGURADO.integrantes),
      }),
    );
    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    const pasoEquipoInicial = harness.routeDebugElement?.query(By.directive(PasoEquipoProyecto))
      .componentInstance as PasoEquipoProyecto;

    pasoEquipoInicial.guardar.emit(EQUIPO_CONFIGURADO);
    harness.detectChanges();

    const botonEquipo = Array.from(
      (harness.routeNativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.recorrido-proyecto__boton',
      ),
    ).find((boton) => boton.textContent?.includes('Equipo'));
    botonEquipo?.click();
    harness.detectChanges();

    const pasoEquipoRestaurado = harness.routeDebugElement?.query(By.directive(PasoEquipoProyecto))
      .componentInstance as PasoEquipoProyecto;
    expect(pasoEquipoRestaurado.datos()).toEqual(EQUIPO_CONFIGURADO);
  });

  it('sincroniza al entrar a Equipo para precargar el perfil almacenado en Usuario', async () => {
    const origenConPerfilUsuario = {
      ...ORIGEN_EQUIPO,
      integrantes: [
        {
          ...ORIGEN_EQUIPO.integrantes[0],
          perfilTecnicoId: 40,
          perfilTecnicoNombre: 'INGENIERO DEVOPS',
        },
      ],
    };
    creacionProyecto.obtenerBorrador.mockReturnValue(
      of({ ...BORRADOR_EQUIPO, equipoAzure: ORIGEN_EQUIPO }),
    );
    creacionProyecto.sincronizarEquipoAzure.mockReturnValue(of(origenConPerfilUsuario));

    const harness = await RouterTestingHarness.create('/proyectos/creacion?proyectoId=42');
    harness.detectChanges();

    expect(creacionProyecto.sincronizarEquipoAzure).toHaveBeenCalledWith(42);
    const pasoEquipo = harness.routeDebugElement?.query(By.directive(PasoEquipoProyecto))
      .componentInstance as PasoEquipoProyecto;
    expect(pasoEquipo.datos().integrantes[0]).toEqual(
      expect.objectContaining({
        perfilTecnicoId: 40,
        perfilTecnicoNombre: 'INGENIERO DEVOPS',
        dedicacionCodigo: '',
      }),
    );
  });

  function obtenerPosicionRecorrido(elemento: HTMLElement): string {
    return elemento.querySelector('.recorrido-proyecto__posicion')?.textContent?.trim() ?? '';
  }
});

const DATOS_VINCULACION: DatosVinculacionAzure = {
  urlBoard: 'https://dev.azure.com/interia/plataforma',
  idEpica: 123,
  idEquipo: null,
};

const BORRADOR_AVANZADO: BorradorProyecto = {
  id: 42,
  revision: 4,
  pasoActual: 4,
  equipoAzure: null,
  contexto: {
    nombre: 'InterIA',
    responsable: 'Jorge',
    descripcion: 'Gestión inteligente del backlog.',
    prioridadCatalogoId: 14,
    fechaObjetivo: '2026-09-30',
  },
  estadoCatalogoId: null,
  tipoSolucionJson: '{"tieneInterfaz":true,"plataforma":"Web"}',
  necesidadJson:
    '{"situacionActual":"Registro manual","problemas":"Reprocesos","impacto":"Costos"}',
  objetivosJson: '{}',
  alcanceJson: '{}',
  rolesJson: '[]',
  equipoJson: '[]',
  diagramFlujoJson: '{}',
  fechaUltimoGuardado: '2026-08-25T12:00:00Z',
};

const BORRADOR_FLUJO: BorradorProyecto = {
  ...BORRADOR_AVANZADO,
  pasoActual: 8,
  diagramFlujoJson: '{}',
};

const BORRADOR_EQUIPO: BorradorProyecto = {
  ...BORRADOR_AVANZADO,
  pasoActual: 7,
  equipoAzure: null,
  equipoJson: '[]',
};

const ORIGEN_EQUIPO = {
  idEquipo: 'equipo-azure-1',
  nombreEquipo: 'Producto digital',
  integrantes: [
    {
      idUsuario: 10,
      idAzure: 'usuario-1',
      nombre: 'María Gómez',
      correo: 'maria@interia.co',
      esAdministradorAzure: false,
      perfilTecnicoId: null,
      perfilTecnicoNombre: null,
    },
  ],
  fechaSincronizacion: '2026-09-07T10:00:00.000Z',
};

const EQUIPO_CONFIGURADO: EquipoProyecto = {
  integrantes: [
    {
      ...ORIGEN_EQUIPO.integrantes[0],
      perfilTecnicoId: 36,
      perfilTecnicoNombre: 'QA',
      dedicacionCodigo: '75',
    },
  ],
};

const FLUJO_GENERADO_IA: FlujoProyecto = {
  proyectoId: '42',
  roles: [],
  nodos: [
    {
      id: 'accion-priorizar-iniciativa',
      tipo: TipoBloqueFlujo.Accion,
      titulo: 'Priorizar iniciativa',
      descripcion: 'Ordena la iniciativa según el valor esperado.',
      criteriosAceptacion: ['La iniciativa recibe una prioridad.'],
      posicion: { x: 80, y: 80 },
      idsRoles: [],
      fechaCreacion: '2026-09-04T10:00:00.000Z',
      fechaActualizacion: '2026-09-04T10:00:00.000Z',
      datos: {},
    },
  ],
  conexiones: [],
  fechaActualizacion: '2026-09-04T10:00:00.000Z',
};
