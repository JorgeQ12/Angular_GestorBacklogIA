import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { PanelLateralFlujoProyecto } from './panel-lateral-flujo-proyecto';

describe('PanelLateralFlujoProyecto', () => {
  let fixture: ComponentFixture<PanelLateralFlujoProyecto>;
  let estado: EstadoEditorFlujoProyectoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelLateralFlujoProyecto],
      providers: [EstadoEditorFlujoProyectoService],
    }).compileComponents();
    fixture = TestBed.createComponent(PanelLateralFlujoProyecto);
    estado = TestBed.inject(EstadoEditorFlujoProyectoService);
    fixture.detectChanges();
  });

  it('solo monta la paleta mientras está abierta y permite cerrarla desde el fondo', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('aside')).toBeNull();

    estado.abrirPaletaBloques();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('aside')).toBeTruthy();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.panel-lateral-flujo__fondo')
      ?.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('aside')).toBeNull();
  });
});
