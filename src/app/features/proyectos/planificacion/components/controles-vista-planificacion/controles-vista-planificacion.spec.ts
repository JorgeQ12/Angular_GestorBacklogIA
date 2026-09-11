import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlesVistaPlanificacionComponent } from './controles-vista-planificacion';

describe('ControlesVistaPlanificacionComponent', () => {
  let fixture: ComponentFixture<ControlesVistaPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlesVistaPlanificacionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlesVistaPlanificacionComponent);
    fixture.detectChanges();
  });

  it('comunica la inclusión de elementos eliminados desde el checkbox compartido', () => {
    const cambiar = jasmine.createSpy();
    fixture.componentInstance.inclusionEliminadosCambiada.subscribe(cambiar);
    abrirPanelVista();
    const control = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#incluir-eliminados-planificacion',
    );

    control?.click();

    expect(cambiar).toHaveBeenCalledWith(true);
  });

  it('representa el filtro activo y bloquea cambios durante otra operación', () => {
    fixture.componentRef.setInput('incluirEliminados', true);
    fixture.detectChanges();
    abrirPanelVista();
    fixture.componentRef.setInput('deshabilitado', true);
    fixture.detectChanges();
    const control = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#incluir-eliminados-planificacion',
    );

    expect(control?.checked).toBe(true);
    expect(control?.disabled).toBe(true);
  });

  it('comunica el término escrito mediante el campo de búsqueda compartido', () => {
    const buscar = jasmine.createSpy();
    fixture.componentInstance.busquedaCambiada.subscribe(buscar);
    const control = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'app-campo-busqueda input',
    );

    if (control) {
      control.value = 'dirección';
      control.dispatchEvent(new Event('input'));
    }

    expect(buscar).toHaveBeenCalledWith('dirección');
  });

  it('solicita expandir todas las ramas y bloquea la acción durante una búsqueda', () => {
    const cambiarExpansion = jasmine.createSpy();
    fixture.componentInstance.expansionCompletaCambiada.subscribe(cambiarExpansion);
    abrirPanelVista();
    const control = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#expandir-planificacion',
    );

    control?.click();
    expect(cambiarExpansion).toHaveBeenCalledWith(true);

    fixture.componentRef.setInput('expansionDeshabilitada', true);
    fixture.detectChanges();
    expect(control?.disabled).toBe(true);
  });

  it('oculta la inclusión de eliminados cuando la versión no la admite', () => {
    fixture.componentRef.setInput('mostrarInclusionEliminados', false);
    fixture.detectChanges();
    abrirPanelVista();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#incluir-eliminados-planificacion'),
    ).toBeNull();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('app-campo-busqueda input'),
    ).not.toBeNull();
  });

  it('comunica el cambio a la vista Gantt', () => {
    const abrirGantt = jasmine.createSpy();
    fixture.componentInstance.ganttSolicitado.subscribe(abrirGantt);
    abrirPanelVista();
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')]
      .find((elemento) => elemento.textContent?.includes('Vista Gantt'));

    (boton as HTMLButtonElement | undefined)?.click();

    expect(abrirGantt).toHaveBeenCalledTimes(1);
  });

  it('comunica la apertura del asistente de generación desde la barra', () => {
    const alternar = jasmine.createSpy();
    fixture.componentInstance.generacionAlternada.subscribe(alternar);
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (elemento) => elemento.textContent?.includes('Generar con IA'),
    );

    (boton as HTMLButtonElement | undefined)?.click();

    expect(alternar).toHaveBeenCalledTimes(1);
  });

  function abrirPanelVista(): void {
    const boton = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (elemento) => elemento.textContent?.trim().startsWith('Vista'),
    );
    (boton as HTMLButtonElement | undefined)?.click();
    fixture.detectChanges();
  }
});
