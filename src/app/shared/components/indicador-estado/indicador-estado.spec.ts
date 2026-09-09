import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndicadorEstado } from './indicador-estado';

describe('IndicadorEstado', () => {
  let fixture: ComponentFixture<IndicadorEstado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IndicadorEstado] }).compileComponents();
    fixture = TestBed.createComponent(IndicadorEstado);
  });

  it('representa el texto con el tono y la presentación solicitados', () => {
    fixture.componentRef.setInput('texto', 'Inactivo');
    fixture.componentRef.setInput('tono', 'advertencia');
    fixture.componentRef.setInput('presentacion', 'etiqueta');
    fixture.detectChanges();

    const indicador = fixture.nativeElement.querySelector('.indicador-estado') as HTMLElement;
    expect(indicador.textContent).toContain('Inactivo');
    expect(indicador.classList).toContain('indicador-estado--advertencia');
    expect(indicador.classList).toContain('indicador-estado--etiqueta');
    expect(indicador.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
