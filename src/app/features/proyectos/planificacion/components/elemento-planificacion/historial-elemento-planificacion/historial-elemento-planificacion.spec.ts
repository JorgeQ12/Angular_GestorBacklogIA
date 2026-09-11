import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { VersionElementoPlanificacion } from '../../../models/historial-elemento-planificacion.model';
import { TipoElementoPlanificacion } from '../../../models/planificacion-proyecto.model';
import { HistorialElementoPlanificacionComponent } from './historial-elemento-planificacion';

describe('HistorialElementoPlanificacionComponent', () => {
  let fixture: ComponentFixture<HistorialElementoPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialElementoPlanificacionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HistorialElementoPlanificacionComponent);
    fixture.componentRef.setInput('versiones', [
      { versionId: 91, numeroVersion: 3, fechaCreacion: '2026-09-02T10:00:00' },
    ]);
    fixture.componentRef.setInput('versionSeleccionadaId', 91);
    fixture.componentRef.setInput('versionSeleccionada', VERSION_TAREA);
    fixture.componentRef.setInput('catalogos', {
      prioridades: [],
      riesgos: [],
      actividadesTarea: [{ id: 19, nombre: 'Desarrollo', descripcion: '' }],
      actividadesRequisito: [],
    });
    fixture.detectChanges();
  });

  it('presenta la línea de tiempo y el contenido exacto de la versión seleccionada', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent;

    expect(texto).toContain('Versiones anteriores');
    expect(texto).toContain('Versión 3');
    expect(texto).toContain('Versión anterior del servicio.');
    expect(texto).toContain('Desarrollo');
    expect(texto).toContain('3 de 5');
  });

  it('emite la versión elegida desde la línea de tiempo', () => {
    const seleccionar = vi.fn();
    fixture.componentInstance.seleccionar.subscribe(seleccionar);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.historial-elemento__version')
      ?.click();

    expect(seleccionar).toHaveBeenCalledWith({
      versionId: 91,
      numeroVersion: 3,
      fechaCreacion: '2026-09-02T10:00:00',
    });
  });

  it('distingue un historial válido sin versiones anteriores', () => {
    fixture.componentRef.setInput('versiones', []);
    fixture.componentRef.setInput('versionSeleccionadaId', null);
    fixture.componentRef.setInput('versionSeleccionada', null);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Esta es la primera versión',
    );
  });
});

const VERSION_TAREA: VersionElementoPlanificacion = {
  tipo: TipoElementoPlanificacion.Tarea,
  versionId: 91,
  elementoId: 783,
  numeroVersion: 3,
  titulo: 'Implementar servicio',
  descripcion: 'Versión anterior del servicio.',
  estimacionHoras: 8,
  fechaInicio: '2026-09-01T00:00:00',
  fechaFinal: '2026-09-05T00:00:00',
  fechaCreacion: '2026-09-02T10:00:00',
  dependencias: 'API disponible',
  actividadCatalogoId: 19,
  complejidad: 3,
};
