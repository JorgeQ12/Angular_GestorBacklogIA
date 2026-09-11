import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModoFormularioProyecto } from '../../../../models/modo-formulario-proyecto.model';
import { EquipoProyecto } from '../../models/equipo-proyecto.model';
import { FiltroEquipoProyecto } from '../../models/formulario-equipo-proyecto.model';
import { FormularioEquipoProyecto } from './formulario-equipo-proyecto';

describe('FormularioEquipoProyecto', () => {
  let fixture: ComponentFixture<FormularioEquipoProyecto>;
  let overlay: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioEquipoProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioEquipoProyecto);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.componentRef.setInput('perfilesTecnicos', PERFILES_TECNICOS);
    fixture.componentRef.setInput('datosIniciales', EQUIPO);
    fixture.detectChanges();
  });

  it('presenta los integrantes y sus filtros de configuración', () => {
    const elemento = obtenerElemento();

    expect(elemento.textContent).toContain('Todos 2');
    expect(elemento.textContent).toContain('Pendientes 1');
    expect(elemento.textContent).toContain('Configurados 1');
    expect(elemento.textContent).toContain('Jorge Quintero');
    expect(elemento.textContent).toContain('María Gómez');
  });

  it('presenta la administración de Azure debajo del correo del integrante', () => {
    const datos = obtenerElemento().querySelector('.formulario-equipo__datos-persona');

    expect(datos?.querySelector(':scope > span')?.textContent).toContain('jorge@interia.co');
    expect(datos?.querySelector(':scope > small')?.textContent).toBe('Administrador Azure');
  });

  it('actualiza la lista cuando los integrantes llegan después de la primera renderización', () => {
    const fixtureTardia = TestBed.createComponent(FormularioEquipoProyecto);
    fixtureTardia.detectChanges();
    fixtureTardia.componentRef.setInput('datosIniciales', EQUIPO);
    fixtureTardia.detectChanges();

    expect((fixtureTardia.nativeElement as HTMLElement).textContent).toContain('Todos 2');
    expect(
      (fixtureTardia.nativeElement as HTMLElement).querySelectorAll('.formulario-equipo__fila')
        .length,
    ).toBe(2);
  });

  it('busca por nombre y filtra por estado de configuración', () => {
    const busqueda = obtenerControl('input[type="search"]');
    busqueda.value = 'maria';
    busqueda.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(obtenerElemento().querySelectorAll('.formulario-equipo__fila').length).toBe(1);
    expect(obtenerElemento().textContent).toContain('María Gómez');

    busqueda.value = '';
    busqueda.dispatchEvent(new Event('input'));
    pulsarBoton('Configurados');
    fixture.detectChanges();

    expect(obtenerElemento().querySelectorAll('.formulario-equipo__fila').length).toBe(1);
    expect(obtenerElemento().textContent).toContain('Jorge Quintero');
  });

  it('distingue la selección parcial y completa de integrantes visibles', () => {
    const controles = obtenerElemento().querySelectorAll<HTMLInputElement>(
      '.formulario-equipo__seleccion input',
    );
    const controlGeneral = obtenerElemento().querySelector<HTMLInputElement>(
      '.formulario-equipo__columnas input',
    )!;

    controles[0].checked = true;
    controles[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(controlGeneral.indeterminate).toBe(true);
    expect(controlGeneral.checked).toBe(false);

    controles[1].checked = true;
    controles[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(controlGeneral.indeterminate).toBe(false);
    expect(controlGeneral.checked).toBe(true);
  });

  it('bloquea la edición individual mientras existe una selección masiva', () => {
    const seleccion = obtenerElemento().querySelector<HTMLInputElement>(
      '.formulario-equipo__seleccion input',
    )!;

    seleccion.checked = true;
    seleccion.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(obtenerControlesAsignacionIndividual().every((control) => control.disabled)).toBe(true);
    expect(obtenerControlBoton('#equipo-perfil-masivo-control').disabled).toBe(false);
    expect(obtenerControlBoton('#equipo-dedicacion-masiva-control').disabled).toBe(false);
    expect(seleccion.disabled).toBe(false);

    seleccion.checked = false;
    seleccion.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(obtenerControlesAsignacionIndividual().every((control) => !control.disabled)).toBe(true);
  });

  it('no guarda asignaciones pendientes aunque sus controles estén bloqueados por la selección', () => {
    const seleccionPendiente = obtenerElemento().querySelectorAll<HTMLInputElement>(
      '.formulario-equipo__seleccion input',
    )[1];
    const guardar = jasmine.createSpy();
    fixture.componentInstance.guardar.subscribe(guardar);

    seleccionPendiente.checked = true;
    seleccionPendiente.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    enviarFormulario();

    expect(guardar).not.toHaveBeenCalled();
  });

  it('asigna el mismo perfil y dedicación a varios integrantes', () => {
    obtenerElemento()
      .querySelectorAll<HTMLInputElement>('.formulario-equipo__seleccion input')
      .forEach((control) => {
        control.checked = true;
        control.dispatchEvent(new Event('change'));
      });
    fixture.detectChanges();

    seleccionarOpcionMasiva('equipo-perfil-masivo-control', 'QA');
    seleccionarOpcionMasiva('equipo-dedicacion-masiva-control', '75%');
    fixture.detectChanges();
    expect(obtenerBoton('Aplicar').disabled).toBe(false);
    pulsarBoton('Aplicar');
    fixture.detectChanges();

    const guardar = jasmine.createSpy();
    fixture.componentInstance.guardar.subscribe(guardar);
    enviarFormulario();
    expect(guardar).toHaveBeenCalledWith({
      integrantes: [
        jasmine.objectContaining({ perfilTecnicoId: 36, dedicacionCodigo: '75' }),
        jasmine.objectContaining({ perfilTecnicoId: 36, dedicacionCodigo: '75' }),
      ],
    });
  });

  it('reactiva la asignación masiva después de sincronizar los integrantes', () => {
    fixture.componentRef.setInput('sincronizando', true);
    fixture.detectChanges();
    fixture.componentRef.setInput('datosIniciales', EQUIPO);
    fixture.detectChanges();
    fixture.componentRef.setInput('sincronizando', false);
    fixture.detectChanges();

    obtenerElemento()
      .querySelectorAll<HTMLInputElement>('.formulario-equipo__seleccion input')
      .forEach((control) => {
        control.checked = true;
        control.dispatchEvent(new Event('change'));
      });
    fixture.detectChanges();

    expect(obtenerControlBoton('#equipo-perfil-masivo-control').disabled).toBe(false);
    expect(obtenerControlBoton('#equipo-dedicacion-masiva-control').disabled).toBe(false);
  });

  it('muestra únicamente los pendientes al intentar guardar asignaciones incompletas', () => {
    enviarFormulario();
    fixture.detectChanges();

    expect(obtenerElemento().querySelectorAll('.formulario-equipo__fila').length).toBe(1);
    expect(obtenerElemento().textContent).toContain('María Gómez');
    expect(obtenerElemento().textContent).toContain('Completa esta asignación.');
  });

  it('entrega la edición vigente a la página coordinadora', () => {
    expect(fixture.componentInstance.obtenerDatosVigentes()).toEqual(EQUIPO);
  });

  it('presenta todos los integrantes sin selección ni herramientas en modo lectura', () => {
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Lectura);
    fixture.detectChanges();

    const elemento = obtenerElemento();
    expect(elemento.querySelector('.formulario-equipo__herramientas')).toBeNull();
    expect(elemento.querySelector('.ui-checkbox')).toBeNull();
    expect(elemento.querySelectorAll('.formulario-equipo__fila').length).toBe(2);
    expect(elemento.querySelector('#equipo-perfil-u1-control')?.getAttribute('aria-readonly')).toBe(
      'true',
    );
  });

  it('ignora los cambios de filtro y selección en modo lectura', () => {
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Lectura);
    fixture.detectChanges();
    const componente = fixture.componentInstance as unknown as {
      cambiarFiltro: (filtro: FiltroEquipoProyecto) => void;
      filtro: () => FiltroEquipoProyecto;
      alternarSeleccion: (idAzure: string, seleccionado: boolean) => void;
      alternarSeleccionVisible: (seleccionar: boolean) => void;
      seleccionados: () => ReadonlySet<string>;
    };

    componente.cambiarFiltro(FiltroEquipoProyecto.Configurados);
    componente.alternarSeleccion('u1', true);
    componente.alternarSeleccionVisible(true);

    expect(componente.filtro()).toBe(FiltroEquipoProyecto.Todos);
    expect(componente.seleccionados().size).toBe(0);
  });

  it('no envía el formulario en modo lectura', () => {
    fixture.componentRef.setInput('modo', ModoFormularioProyecto.Lectura);
    fixture.detectChanges();
    const guardar = jasmine.createSpy();
    fixture.componentInstance.guardar.subscribe(guardar);

    (fixture.componentInstance as unknown as { enviar: () => void }).enviar();

    expect(guardar).not.toHaveBeenCalled();
  });

  it('bloquea los controles mientras el formulario está procesando', () => {
    fixture.componentRef.setInput('procesando', true);
    fixture.detectChanges();

    expect(obtenerControl('input[type="search"]').disabled).toBe(true);
  });

  it('no aplica una asignación masiva sin selección ni valores elegidos', () => {
    const componente = fixture.componentInstance as unknown as {
      aplicarAsignacionMasiva: () => void;
      obtenerDatosVigentes: () => EquipoProyecto;
    };

    componente.aplicarAsignacionMasiva();

    expect(componente.obtenerDatosVigentes()).toEqual(EQUIPO);
  });

  it('aplica solo la dedicación cuando no se elige un perfil masivo', () => {
    obtenerElemento()
      .querySelectorAll<HTMLInputElement>('.formulario-equipo__seleccion input')
      .forEach((control) => {
        control.checked = true;
        control.dispatchEvent(new Event('change'));
      });
    fixture.detectChanges();

    seleccionarOpcionMasiva('equipo-dedicacion-masiva-control', '75%');
    fixture.detectChanges();
    pulsarBoton('Aplicar');
    fixture.detectChanges();

    const vigentes = (
      fixture.componentInstance as unknown as { obtenerDatosVigentes: () => EquipoProyecto }
    ).obtenerDatosVigentes();
    expect(vigentes.integrantes[0].dedicacionCodigo).toBe('75');
    expect(vigentes.integrantes[0].perfilTecnicoId).toBe(32);
    expect(vigentes.integrantes[1].perfilTecnicoId).toBeNull();
  });

  function pulsarBoton(texto: string): void {
    obtenerBoton(texto).click();
  }

  function obtenerBoton(texto: string): HTMLButtonElement {
    return Array.from(obtenerElemento().querySelectorAll('button')).find((elemento) =>
      elemento.textContent?.includes(texto),
    ) as HTMLButtonElement;
  }

  function seleccionarOpcionMasiva(idControl: string, texto: string): void {
    obtenerElemento().querySelector<HTMLButtonElement>(`#${idControl}`)?.click();
    fixture.detectChanges();
    const opcion = Array.from(overlay.querySelectorAll<HTMLButtonElement>('[role="option"]')).find(
      (elemento) => elemento.textContent?.includes(texto),
    );
    opcion?.click();
    fixture.detectChanges();
  }

  function obtenerControl(selector: string): HTMLInputElement {
    return obtenerElemento().querySelector(selector) as HTMLInputElement;
  }

  function obtenerControlBoton(selector: string): HTMLButtonElement {
    return obtenerElemento().querySelector(selector) as HTMLButtonElement;
  }

  function obtenerControlesAsignacionIndividual(): HTMLButtonElement[] {
    return Array.from(
      obtenerElemento().querySelectorAll<HTMLButtonElement>(
        '.formulario-equipo__fila app-selector-campo button',
      ),
    );
  }

  function obtenerElemento(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function enviarFormulario(): void {
    obtenerElemento().querySelector('form')?.dispatchEvent(new Event('submit'));
  }
});

const EQUIPO: EquipoProyecto = {
  integrantes: [
    {
      idAzure: 'u1',
      nombre: 'Jorge Quintero',
      correo: 'jorge@interia.co',
      esAdministradorAzure: true,
      perfilTecnicoId: 32,
      dedicacionCodigo: '100',
    },
    {
      idAzure: 'u2',
      nombre: 'María Gómez',
      correo: 'maria@interia.co',
      esAdministradorAzure: false,
      perfilTecnicoId: null,
      dedicacionCodigo: '',
    },
  ],
};

const PERFILES_TECNICOS = [
  { valor: 32, etiqueta: 'DevOps' },
  { valor: 36, etiqueta: 'QA' },
] as const;
