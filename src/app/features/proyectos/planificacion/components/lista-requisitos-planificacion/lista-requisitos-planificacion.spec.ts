import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MensajesService } from '../../../../../core/mensajes/services/mensajes.service';
import { NotificadorErroresApiService } from '../../../../../core/mensajes/services/notificador-errores-api.service';
import type { CatalogoRequisitos, RequisitoProyecto } from '../../models/lista-requisitos.model';
import { ListaRequisitosPlanificacionService } from '../../services/lista-requisitos-planificacion.service';
import { ListaRequisitosPlanificacion } from './lista-requisitos-planificacion';

describe('ListaRequisitosPlanificacion', () => {
  let fixture: ComponentFixture<ListaRequisitosPlanificacion>;

  const requisito: RequisitoProyecto = {
    id: 1,
    codigo: 'REQ-1',
    area: 'Arquitectura',
    seccion: 'Integración',
    titulo: 'Trazabilidad',
    descripcion: 'Registrar trazabilidad.',
    transversal: false,
    responsable: 'Arquitecto',
    nombreResponsable: 'Ana',
    validador: 'Líder',
    aplica: true,
    tipo: 'Funcional',
    agrupador: 'Diseño',
    orden: 1,
    cumple: false,
  };
  const catalogo: CatalogoRequisitos = {
    areas: [],
    tipos: [],
    responsables: [],
    validadores: [],
    agrupadores: [],
    nombresResponsables: {},
  };
  const api = {
    obtener: vi.fn(() => of([requisito])),
    obtenerCatalogo: vi.fn(() => of(catalogo)),
    crear: vi.fn(),
    actualizar: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ListaRequisitosPlanificacion],
      providers: [
        { provide: ListaRequisitosPlanificacionService, useValue: api },
        { provide: MensajesService, useValue: { confirmar: vi.fn(), exito: vi.fn() } },
        { provide: NotificadorErroresApiService, useValue: { comunicar: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ListaRequisitosPlanificacion);
    fixture.componentRef.setInput('proyectoId', 42);
    fixture.detectChanges();
  });

  it('carga y agrupa la lista completa del proyecto', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    expect(api.obtener).toHaveBeenCalledWith(42);
    expect(api.obtenerCatalogo).toHaveBeenCalledOnce();
    expect(elemento.textContent).toContain('Arquitectura');
    expect(elemento.textContent).toContain('REQ-1 · Funcional');
    expect(elemento.textContent).toContain('Trazabilidad');
  });

  it('abre el detalle funcional del requisito', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.fila-requisito__contenido',
    );
    boton?.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Información del requisito',
    );
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Registrar trazabilidad.');
  });

  it('presenta errores compartidos y evita crear cuando el formulario es inválido', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    elemento.querySelector<HTMLButtonElement>('.lista-requisitos__acciones button')?.click();
    fixture.detectChanges();

    elemento
      .querySelector<HTMLFormElement>('#formulario-nuevo-requisito')
      ?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(api.crear).not.toHaveBeenCalled();
    expect(elemento.querySelector('.ui-field-error')?.textContent).toContain('Selecciona un área');
  });
});
