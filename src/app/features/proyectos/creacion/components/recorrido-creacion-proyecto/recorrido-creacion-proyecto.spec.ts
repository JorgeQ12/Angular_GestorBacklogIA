import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { RecorridoCreacionProyecto } from './recorrido-creacion-proyecto';

describe('RecorridoCreacionProyecto', () => {
  let fixture: ComponentFixture<RecorridoCreacionProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecorridoCreacionProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(RecorridoCreacionProyecto);
    fixture.componentRef.setInput('etapaActual', 'necesidad');
    fixture.componentRef.setInput('etapasCompletadas', [
      'vinculacion-azure',
      'contexto',
      'tipo-solucion',
    ]);
    fixture.componentRef.setInput('etapasNavegables', ['contexto', 'tipo-solucion']);
    fixture.detectChanges();
  });

  it('presenta Azure y las ocho secciones vigentes del proyecto', () => {
    const elemento = obtenerElemento();

    expect(elemento.querySelectorAll('li')).toHaveLength(9);
    expect(elemento.textContent).toContain('Azure DevOps');
    expect(elemento.textContent).toContain('Vinculación de origen');
    expect(elemento.textContent).toContain('Flujo de usuario');
    expect(elemento.textContent).not.toContain('Demanda esperada');
  });

  it('utiliza el icono centralizado de Azure DevOps en la primera etapa', () => {
    const primerIcono = fixture.debugElement.queryAll(By.directive(IconoComponent))[0]
      .componentInstance as IconoComponent;

    expect(primerIcono.nombre()).toBe('azureDevOps');
  });

  it('comunica la etapa actual y el avance del recorrido', () => {
    const actual = obtenerElemento().querySelector('[aria-current="step"]');
    const progreso = obtenerElemento().querySelector<HTMLElement>('[role="progressbar"]');
    const indicador = progreso?.querySelector<HTMLElement>('span');

    expect(actual?.textContent).toContain('Necesidad de negocio');
    expect(progreso?.getAttribute('aria-valuemin')).toBe('1');
    expect(progreso?.getAttribute('aria-valuenow')).toBe('4');
    expect(progreso?.getAttribute('aria-valuemax')).toBe('9');
    expect(progreso?.getAttribute('aria-valuetext')).toBe('Paso 4 de 9');
    expect(indicador?.style.width).toBe('44.44444444444444%');
    expect(obtenerElemento().querySelector('.recorrido-creacion__posicion')?.textContent).toContain(
      'Paso 4 de 9',
    );
    expect(obtenerElemento().textContent).toContain('Definición del proyecto');
  });

  it('separa las etapas completadas de las que permiten navegación', () => {
    const seleccionar = vi.fn();
    fixture.componentInstance.etapaSeleccionada.subscribe(seleccionar);
    const botones = obtenerElemento().querySelectorAll('button');

    expect(botones[0].disabled).toBe(true);
    expect(botones[1].disabled).toBe(false);
    expect(botones[3].disabled).toBe(true);

    botones[0].click();
    botones[1].click();

    expect(seleccionar).toHaveBeenCalledOnce();
    expect(seleccionar).toHaveBeenCalledWith('contexto');
  });

  it('presenta estado y dirección únicamente cuando aportan información', () => {
    const botones = obtenerElemento().querySelectorAll('button');

    expect(botones[0].textContent).toContain('Etapa completada');
    expect(botones[0].querySelector('.recorrido-creacion__direccion')).toBeNull();
    expect(botones[1].querySelector('.recorrido-creacion__direccion')).not.toBeNull();
    expect(botones[3].textContent).not.toContain('En curso');
  });

  function obtenerElemento(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
