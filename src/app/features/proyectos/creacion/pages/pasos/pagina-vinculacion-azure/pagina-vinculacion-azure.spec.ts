import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../../../core/mensajes/services/notificador-errores-api.service';
import { crearUrlContextoProyecto } from '../../../../../../core/navegacion/rutas';
import { BorradorProyectoCreado } from '../../../models/borrador-proyecto.model';
import {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../../../models/vinculacion-azure.model';
import { CreacionProyectoService } from '../../../services/creacion-proyecto.service';
import { PaginaVinculacionAzure } from './pagina-vinculacion-azure';

const DATOS: DatosVinculacionAzure = {
  urlBoard: 'https://dev.azure.com/interia/proyecto',
  idEpica: 321,
  idEquipo: null,
};

const RESULTADO: ResultadoVinculacionAzure = {
  organizacion: 'Interrapidísimo',
  nombreProyecto: 'InterIA',
  idEpica: 321,
  tituloEpica: 'Épica vigente',
  cantidadRevisiones: 2,
  nombreEquipo: 'Producto',
  cantidadMiembros: 5,
};

describe('PaginaVinculacionAzure', () => {
  let fixture: ComponentFixture<PaginaVinculacionAzure>;
  let validacion$: Subject<ResultadoVinculacionAzure>;
  let borrador$: Subject<BorradorProyectoCreado>;
  const notificadorErrores = { comunicar: vi.fn() };

  beforeEach(async () => {
    validacion$ = new Subject<ResultadoVinculacionAzure>();
    borrador$ = new Subject<BorradorProyectoCreado>();
    notificadorErrores.comunicar.mockClear();

    await TestBed.configureTestingModule({
      imports: [PaginaVinculacionAzure],
      providers: [
        provideRouter([]),
        { provide: NotificadorErroresApiService, useValue: notificadorErrores },
        {
          provide: CreacionProyectoService,
          useValue: {
            validarVinculacionAzure: vi.fn(() => validacion$),
            crearBorrador: vi.fn(() => borrador$),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaVinculacionAzure);
    fixture.detectChanges();
  });

  it('presenta el contenido sin duplicar la superficie administrada por el recorrido', () => {
    expect(obtenerElemento().querySelectorAll('app-vinculacion-azure')).toHaveLength(1);
    expect(obtenerElemento().querySelector('form')).toBeTruthy();
    expect(obtenerElemento().querySelector('.ui-card')).toBeNull();
    expect(obtenerElemento().querySelector('header')).toBeNull();
  });

  it('presenta la confirmación dentro del mismo componente después de validar Azure', () => {
    validar();
    validacion$.next(RESULTADO);
    fixture.detectChanges();

    expect(obtenerElemento().querySelector('app-vinculacion-azure')).toBeTruthy();
    expect(obtenerElemento().querySelector('form')).toBeNull();
    expect(obtenerElemento().textContent).toContain('Épica vigente');
    expect(obtenerElemento().textContent).toContain('5 integrantes encontrados');
  });

  it('crea el borrador y navega al paso Contexto', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    validar();
    validacion$.next(RESULTADO);
    validacion$.complete();
    fixture.detectChanges();

    (fixture.componentInstance as unknown as { crearBorrador(): void }).crearBorrador();
    borrador$.next({ id: 42, revision: 1, pasoActual: 1 });

    expect(navegar).toHaveBeenCalledWith(crearUrlContextoProyecto(42));
  });

  it('solicita el mensaje global cuando Azure no puede ser consultado', () => {
    validar();
    validacion$.error(new Error('Azure no disponible'));

    expect(notificadorErrores.comunicar).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ titulo: 'No fue posible consultar Azure' }),
    );
  });

  function validar(): void {
    (
      fixture.componentInstance as unknown as {
        validarVinculacion(datos: DatosVinculacionAzure): void;
      }
    ).validarVinculacion(DATOS);
  }

  function obtenerElemento(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
