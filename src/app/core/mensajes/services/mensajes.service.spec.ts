import { TestBed } from '@angular/core/testing';
import { MensajesService } from './mensajes.service';

describe('MensajesService', () => {
  let servicio: MensajesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servicio = TestBed.inject(MensajesService);
  });

  it('normaliza una confirmación como una decisión no descartable', async () => {
    const decision = servicio.confirmar('Crear proyecto', 'Se creará un nuevo borrador.');

    expect(servicio.mensajeActual()).toEqual(
      expect.objectContaining({
        variante: 'confirmacion',
        mostrarCancelar: true,
        descartable: false,
        textoConfirmar: 'Confirmar',
      }),
    );

    servicio.aceptar();

    await expect(decision).resolves.toBe(true);
    expect(servicio.mensajeActual()).toBeNull();
  });

  it('resuelve como cancelada la acción destructiva', async () => {
    const decision = servicio.confirmarDestructiva(
      'Eliminar proyecto',
      'Esta acción no puede deshacerse.',
    );

    servicio.cancelar();

    await expect(decision).resolves.toBe(false);
  });

  it('impide descartar un mensaje que requiere decisión explícita', () => {
    void servicio.confirmar('Publicar proyecto', 'Confirma la publicación.');

    servicio.descartar();

    expect(servicio.mensajeActual()).not.toBeNull();
    servicio.cancelar();
  });

  it('resuelve el mensaje anterior antes de presentar uno nuevo', async () => {
    const primeraDecision = servicio.confirmar('Primera acción', 'Primer mensaje.');
    const segundaDecision = servicio.confirmar('Segunda acción', 'Segundo mensaje.');

    await expect(primeraDecision).resolves.toBe(false);
    expect(servicio.mensajeActual()?.titulo).toBe('Segunda acción');

    servicio.aceptar();
    await expect(segundaDecision).resolves.toBe(true);
  });
});
