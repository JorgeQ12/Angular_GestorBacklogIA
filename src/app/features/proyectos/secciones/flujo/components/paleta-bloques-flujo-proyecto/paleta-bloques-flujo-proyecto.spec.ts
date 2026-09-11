import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoBloqueFlujo } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import { PaletaBloquesFlujoProyecto } from './paleta-bloques-flujo-proyecto';

describe('PaletaBloquesFlujoProyecto', () => {
  let fixture: ComponentFixture<PaletaBloquesFlujoProyecto>;
  let estado: EstadoEditorFlujoProyectoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletaBloquesFlujoProyecto],
      providers: [EstadoEditorFlujoProyectoService],
    }).compileComponents();
    fixture = TestBed.createComponent(PaletaBloquesFlujoProyecto);
    estado = TestBed.inject(EstadoEditorFlujoProyectoService);
    estado.abrirPaletaBloques();
    fixture.detectChanges();
  });

  it('presenta todos los tipos y abre el borrador seleccionado', () => {
    const opciones = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      '.paleta-bloques-flujo__elemento',
    );
    expect(opciones).toHaveLength(5);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>(`[data-tipo="${TipoBloqueFlujo.Decision}"]`)
      ?.click();

    expect(estado.estadoEditorNodo()?.tipo).toBe(TipoBloqueFlujo.Decision);
    expect(estado.paletaBloquesAbierta()).toBe(false);
  });
});
