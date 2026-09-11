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

  it('oculta el indicador cuando el contenido cabe por completo en el viewport', () => {
    const viewport = fixture.nativeElement.querySelector(
      '.region-desplazable__viewport',
    ) as HTMLElement;
    const control = fixture.nativeElement.querySelector(
      '.region-desplazable__control',
    ) as HTMLElement;
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 0, writable: true },
    });

    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(control.classList).not.toContain('region-desplazable__control--visible');
    expect(control.style.height).toBe('0px');
  });

  it('permite arrastrar el indicador para desplazar el contenido de forma proporcional', () => {
    spyOn(Element.prototype, 'setPointerCapture').and.stub();
    spyOn(Element.prototype, 'releasePointerCapture').and.stub();
    spyOn(Element.prototype, 'hasPointerCapture').and.returnValue(true);

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
      scrollTop: { configurable: true, value: 0, writable: true },
    });
    Object.defineProperty(pista, 'clientHeight', { configurable: true, value: 100 });

    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    control.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientY: 0, bubbles: true }),
    );
    fixture.detectChanges();
    expect(control.classList).toContain('region-desplazable__control--arrastrado');

    control.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientY: 20, bubbles: true }),
    );
    fixture.detectChanges();
    expect(viewport.scrollTop).toBeGreaterThan(0);

    control.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));
    fixture.detectChanges();
    expect(control.classList).not.toContain('region-desplazable__control--arrastrado');
  });

  it('ignora el arrastre cuando el indicador no está visible', () => {
    spyOn(Element.prototype, 'setPointerCapture').and.stub();
    const control = fixture.nativeElement.querySelector(
      '.region-desplazable__control',
    ) as HTMLElement;

    control.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientY: 0, bubbles: true }),
    );
    fixture.detectChanges();

    expect(control.classList).not.toContain('region-desplazable__control--arrastrado');
    expect(Element.prototype.setPointerCapture).not.toHaveBeenCalled();
  });

  it('ignora los movimientos de punteros ajenos al arrastre activo', () => {
    spyOn(Element.prototype, 'setPointerCapture').and.stub();
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
      scrollTop: { configurable: true, value: 0, writable: true },
    });
    Object.defineProperty(pista, 'clientHeight', { configurable: true, value: 100 });

    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    control.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientY: 0, bubbles: true }),
    );
    fixture.detectChanges();

    control.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 2, clientY: 50, bubbles: true }),
    );
    fixture.detectChanges();

    expect(viewport.scrollTop).toBe(0);
  });

  it('conserva el indicador activo mientras se arrastra aunque abandone la región', () => {
    spyOn(Element.prototype, 'setPointerCapture').and.stub();
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
      scrollTop: { configurable: true, value: 0, writable: true },
    });
    Object.defineProperty(pista, 'clientHeight', { configurable: true, value: 100 });

    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    control.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientY: 0, bubbles: true }),
    );
    fixture.detectChanges();

    region.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();

    expect(control.classList).toContain('region-desplazable__control--activo');
  });

  it('sincroniza el indicador al pasar el puntero por encima de la región', () => {
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
      scrollTop: { configurable: true, value: 0, writable: true },
    });
    Object.defineProperty(pista, 'clientHeight', { configurable: true, value: 100 });

    region.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    expect(control.classList).toContain('region-desplazable__control--visible');
  });

  it('libera los recursos al destruir el componente sin lanzar errores', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });
});
