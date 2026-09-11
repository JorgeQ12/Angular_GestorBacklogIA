import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MensajesService } from '../../../../../../core/mensajes/services/mensajes.service';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { LienzoFlujoProyecto } from './lienzo-flujo-proyecto';

describe('LienzoFlujoProyecto', () => {
  let fixture: ComponentFixture<LienzoFlujoProyecto>;
  let estado: EstadoEditorFlujoProyectoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LienzoFlujoProyecto],
      providers: [
        EstadoEditorFlujoProyectoService,
        { provide: MensajesService, useValue: { confirmarDestructiva: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LienzoFlujoProyecto);
    estado = TestBed.inject(EstadoEditorFlujoProyectoService);
    fixture.detectChanges();
  });

  it('presenta el estado vacío y emite la generación con IA', () => {
    const generar = vi.fn();
    fixture.componentInstance.generarConIASolicitado.subscribe(generar);
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (actual) => actual.textContent?.includes('Generar con IA'),
    );
    boton?.click();
    expect(generar).toHaveBeenCalledOnce();
  });

  it('conecta los controles de escala con el estado local', () => {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[aria-label="Acercar"]')
      ?.click();
    fixture.detectChanges();
    expect(estado.vista().escala).toBe(1.1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('110%');
  });
});
