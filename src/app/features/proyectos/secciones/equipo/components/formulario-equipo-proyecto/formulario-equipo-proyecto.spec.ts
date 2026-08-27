import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ControlesAsignacionMasivaEquipoProyecto } from '../../models/formulario-equipo-proyecto.model';
import { EquipoProyecto } from '../../models/equipo-proyecto.model';
import { FormularioEquipoProyecto } from './formulario-equipo-proyecto';

describe('FormularioEquipoProyecto', () => {
  let fixture: ComponentFixture<FormularioEquipoProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioEquipoProyecto],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioEquipoProyecto);
    fixture.componentRef.setInput('datosIniciales', EQUIPO);
    fixture.componentRef.setInput('nombreEquipo', 'Producto digital');
    fixture.detectChanges();
  });

  it('presenta progreso, identidad y Team de origen', () => {
    const elemento = obtenerElemento();

    expect(elemento.textContent).toContain('Producto digital');
    expect(elemento.textContent).toContain('1 configurados · 1 pendientes');
    expect(elemento.textContent).toContain('Jorge Quintero');
    expect(elemento.textContent).toContain('María Gómez');
  });

  it('actualiza los totales cuando los integrantes llegan después de la primera renderización', () => {
    const fixtureTardia = TestBed.createComponent(FormularioEquipoProyecto);
    fixtureTardia.detectChanges();
    fixtureTardia.componentRef.setInput('datosIniciales', EQUIPO);
    fixtureTardia.detectChanges();

    expect((fixtureTardia.nativeElement as HTMLElement).textContent).toContain(
      '1 configurados · 1 pendientes',
    );
    expect(
      (fixtureTardia.nativeElement as HTMLElement).querySelectorAll('.formulario-equipo__fila'),
    ).toHaveLength(2);
  });

  it('busca por nombre y filtra por estado de configuración', () => {
    const busqueda = obtenerControl('input[type="search"]');
    busqueda.value = 'maria';
    busqueda.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(obtenerElemento().querySelectorAll('.formulario-equipo__fila')).toHaveLength(1);
    expect(obtenerElemento().textContent).toContain('María Gómez');

    busqueda.value = '';
    busqueda.dispatchEvent(new Event('input'));
    pulsarBoton('Configurados');
    fixture.detectChanges();

    expect(obtenerElemento().querySelectorAll('.formulario-equipo__fila')).toHaveLength(1);
    expect(obtenerElemento().textContent).toContain('Jorge Quintero');
  });

  it('asigna el mismo perfil y dedicación a varios integrantes', () => {
    obtenerElemento()
      .querySelectorAll<HTMLInputElement>('.formulario-equipo__seleccion input')
      .forEach((control) => {
        control.checked = true;
        control.dispatchEvent(new Event('change'));
      });
    fixture.detectChanges();

    const componente = fixture.componentInstance as unknown as {
      asignacionMasiva: FormGroup<ControlesAsignacionMasivaEquipoProyecto>;
    };
    componente.asignacionMasiva.setValue({
      perfilTecnicoCodigo: 'qa',
      dedicacionCodigo: '75',
    });
    fixture.detectChanges();
    pulsarBoton('Aplicar');
    fixture.detectChanges();

    const guardar = vi.fn();
    fixture.componentInstance.guardar.subscribe(guardar);
    enviarFormulario();
    expect(guardar).toHaveBeenCalledWith({
      integrantes: [
        expect.objectContaining({ perfilTecnicoCodigo: 'qa', dedicacionCodigo: '75' }),
        expect.objectContaining({ perfilTecnicoCodigo: 'qa', dedicacionCodigo: '75' }),
      ],
    });
  });

  it('muestra únicamente los pendientes al intentar guardar asignaciones incompletas', () => {
    enviarFormulario();
    fixture.detectChanges();

    expect(obtenerElemento().querySelectorAll('.formulario-equipo__fila')).toHaveLength(1);
    expect(obtenerElemento().textContent).toContain('María Gómez');
    expect(obtenerElemento().textContent).toContain('Completa esta asignación.');
  });

  it('entrega la edición vigente al solicitar sincronización', () => {
    const sincronizar = vi.fn();
    fixture.componentInstance.sincronizar.subscribe(sincronizar);
    pulsarBoton('Actualizar desde Azure');

    expect(sincronizar).toHaveBeenCalledWith(EQUIPO);
  });

  function pulsarBoton(texto: string): void {
    const boton = Array.from(obtenerElemento().querySelectorAll('button')).find((elemento) =>
      elemento.textContent?.includes(texto),
    );
    boton?.click();
  }

  function obtenerControl(selector: string): HTMLInputElement {
    return obtenerElemento().querySelector(selector) as HTMLInputElement;
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
      perfilTecnicoCodigo: 'devops',
      dedicacionCodigo: '100',
    },
    {
      idAzure: 'u2',
      nombre: 'María Gómez',
      correo: 'maria@interia.co',
      esAdministradorAzure: false,
      perfilTecnicoCodigo: '',
      dedicacionCodigo: '',
    },
  ],
};
