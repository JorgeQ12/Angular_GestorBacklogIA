import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegionDesplazable } from './region-desplazable';

@Component({
  imports: [RegionDesplazable],
  template: `
    <app-region-desplazable etiqueta="Resultados disponibles">
      <div class="contenido-proyectado">Contenido</div>
    </app-region-desplazable>
  `,
})
class AnfitrionRegionDesplazable {}

describe('RegionDesplazable', () => {
  let fixture: ComponentFixture<AnfitrionRegionDesplazable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionRegionDesplazable],
    }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionRegionDesplazable);
    fixture.detectChanges();
  });

  it('conserva una región nativa accesible alrededor del contenido proyectado', () => {
    const viewport = fixture.nativeElement.querySelector(
      '.region-desplazable__viewport',
    ) as HTMLElement;

    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Resultados disponibles');
    expect(viewport.tabIndex).toBe(0);
    expect(viewport.querySelector('.contenido-proyectado')?.textContent).toContain('Contenido');
  });

  it('presenta temporalmente el indicador al desplazar y lo oculta al abandonar la región', () => {
    const region = fixture.nativeElement.querySelector('app-region-desplazable') as HTMLElement;
    const viewport = fixture.nativeElement.querySelector(
      '.region-desplazable__viewport',
    ) as HTMLElement;
    const pista = fixture.nativeElement.querySelector('.region-desplazable__pista') as HTMLElement;
    const control = fixture.nativeElement.querySelector(
      '.region-desplazable__control',
    ) as HTMLElement;
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 100, writable: true },
    });
    Object.defineProperty(pista, 'clientHeight', { configurable: true, value: 100 });

    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(control.classList).toContain('region-desplazable__control--visible');
    expect(control.classList).toContain('region-desplazable__control--activo');
    expect(control.style.height).not.toBe('');
    expect(control.style.transform).not.toBe('translateY(0px)');

    region.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();

    expect(control.classList).not.toContain('region-desplazable__control--activo');
  });
});
