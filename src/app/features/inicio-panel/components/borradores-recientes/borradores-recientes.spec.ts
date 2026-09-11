import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BorradorInicioPanel } from '../../models/resumen-inicio-panel.model';
import { BorradoresRecientes } from './borradores-recientes';

describe('BorradoresRecientes', () => {
  let fixture: ComponentFixture<BorradoresRecientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BorradoresRecientes] }).compileComponents();
    fixture = TestBed.createComponent(BorradoresRecientes);
    fixture.componentRef.setInput('borradores', [BORRADOR]);
    fixture.componentRef.setInput('total', 1);
    fixture.detectChanges();
  });

  it('presenta el avance real y emite el borrador que se desea continuar', () => {
    const continuar = vi.fn();
    fixture.componentInstance.continuarBorrador.subscribe(continuar);
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.borrador-reciente',
    );
    expect(boton?.textContent).toContain('Paso 5 de 9');

    boton?.click();

    expect(continuar).toHaveBeenCalledWith(BORRADOR);
  });

  it('distingue una colección vacía', () => {
    fixture.componentRef.setInput('borradores', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay borradores pendientes',
    );
  });
});

const BORRADOR: BorradorInicioPanel = {
  id: 42,
  nombre: 'Portal de clientes',
  responsable: 'Jorge',
  pasoActual: 4,
  fechaUltimoGuardado: '2026-09-10T10:00:00Z',
};
