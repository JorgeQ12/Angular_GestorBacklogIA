import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import type { VersionamientoPasoProyecto } from '../../../models/versionamiento-proyecto.model';
import { FormularioRolesProyecto } from '../../../secciones/roles/components/formulario-roles-proyecto/formulario-roles-proyecto';
import type { RolesProyecto } from '../../../secciones/roles/models/roles-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';

/** Presenta Roles con la misma composición en cualquier caso de uso. */
@Component({
  selector: 'app-paso-roles-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormularioRolesProyecto, TarjetaPasoProyecto],
  templateUrl: './paso-roles-proyecto.html',
})
export class PasoRolesProyecto {
  public readonly datos = input.required<RolesProyecto | null>();
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  public readonly editable = input(false);
  public readonly procesando = input(false);
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  public readonly versionamiento = input<VersionamientoPasoProyecto | null>(null);
  public readonly editar = output<void>();
  public readonly cancelar = output<void>();
  public readonly guardar = output<RolesProyecto>();
  public readonly versionCambiada = output<number>();
  protected readonly paso = ClaveSeccionProyecto.Roles;
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
