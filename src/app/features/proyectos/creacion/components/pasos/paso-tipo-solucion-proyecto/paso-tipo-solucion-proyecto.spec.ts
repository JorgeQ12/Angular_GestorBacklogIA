import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { PlataformaSolucion } from '../../../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';
import { PasoTipoSolucionProyecto } from './paso-tipo-solucion-proyecto';

describe('PasoTipoSolucionProyecto', () => {
  let fixture: ComponentFixture<PasoTipoSolucionProyecto>;
  let proyectoId: ReturnType<typeof signal<number | null>>;
  const tipoSolucionJson = '{"tieneInterfaz":true,"plataforma":"Web"}';
  const estadoCreacion = {
    proyectoId: () => proyectoId(),
    cargar: vi.fn(),
    guardarSeccion: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    proyectoId = signal<number | null>(42);
    estadoCreacion.cargar.mockReturnValue(of({ tipoSolucionJson }));
    estadoCreacion.guardarSeccion.mockReturnValue(of({ tipoSolucionJson }));

    await TestBed.configureTestingModule({
      imports: [PasoTipoSolucionProyecto],
      providers: [
        { provide: EstadoCreacionProyectoService, useValue: estadoCreacion },
        {
          provide: NotificadorErroresBorradorProyectoService,
          useValue: { comunicar: vi.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PasoTipoSolucionProyecto);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('hidrata el formulario con el tipo de solución del borrador', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const interfaz = elemento.querySelector<HTMLInputElement>(
      '#tipo-solucion-interfaz input:checked',
    );
    const plataforma = elemento.querySelector<HTMLInputElement>(
      '#tipo-solucion-plataforma input:checked',
    );

    expect(estadoCreacion.cargar).toHaveBeenCalledWith(42);
    expect(interfaz?.value).toBe('true');
    expect(plataforma?.value).toBe(PlataformaSolucion.Web);
  });

  it('guarda Tipo de solución y comunica que el recorrido puede continuar', () => {
    const completado = vi.fn();
    fixture.componentInstance.completado.subscribe(completado);

    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));

    expect(estadoCreacion.guardarSeccion).toHaveBeenCalledWith({
      seccion: ClaveSeccionProyecto.TipoSolucion,
      datos: { tieneInterfaz: true, plataforma: PlataformaSolucion.Web },
    });
    expect(completado).toHaveBeenCalledOnce();
  });
});
