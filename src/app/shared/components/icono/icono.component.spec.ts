import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconoComponent } from './icono.component';

describe('IconoComponent', () => {
  let fixture: ComponentFixture<IconoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IconoComponent);
  });

  it('representa Azure DevOps sobre el viewBox compartido sin transformaciones externas', () => {
    fixture.componentRef.setInput('nombre', 'azureDevOps');
    fixture.detectChanges();

    const path = (fixture.nativeElement as HTMLElement).querySelector('path');

    expect(path?.getAttribute('d')).toContain('M22.667 5.333');
    expect(path?.getAttribute('transform')).toBeNull();
    expect(path?.getAttribute('fill')).toBe('currentColor');
  });

  it('representa una característica con el trofeo usado por Azure DevOps', () => {
    fixture.componentRef.setInput('nombre', 'caracteristica');
    fixture.detectChanges();

    const paths = (fixture.nativeElement as HTMLElement).querySelectorAll('path');

    expect(paths.length).toBe(2);
    expect(paths[0]?.getAttribute('d')).toBe('M8 4h8v4c0 3-1.8 5-4 5s-4-2-4-5V4Z');
    expect(paths[1]?.getAttribute('d')).toContain('M8 6H5v1c0 2');
  });
});
