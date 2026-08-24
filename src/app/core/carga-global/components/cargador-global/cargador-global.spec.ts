import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargaGlobalService } from '../../services/carga-global.service';
import { CargadorGlobal } from './cargador-global';

describe('CargadorGlobal', () => {
  let fixture: ComponentFixture<CargadorGlobal>;
  let cargaGlobal: CargaGlobalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CargadorGlobal] }).compileComponents();
    fixture = TestBed.createComponent(CargadorGlobal);
    cargaGlobal = TestBed.inject(CargaGlobalService);
    fixture.detectChanges();
  });

  it('presenta el camión y el estado mientras existe una operación pendiente', () => {
    cargaGlobal.iniciar();
    fixture.detectChanges();

    const estado = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    const camion = fixture.nativeElement.querySelector('.cargador-global__camion') as HTMLImageElement;

    expect(estado.textContent).toContain('Procesando información');
    expect(camion.getAttribute('src')).toBe('/brand/camion_carga.webp');
    expect(fixture.nativeElement.querySelectorAll('.cargador-global__humo')).toHaveLength(4);
  });

  it('no presenta el overlay cuando no existen operaciones pendientes', () => {
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeFalsy();
  });
});
