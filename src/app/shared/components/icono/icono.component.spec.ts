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
});
