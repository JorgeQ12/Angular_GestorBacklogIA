import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';

/** Conserva el destino visible de Flujo mientras se completa su migración funcional. */
@Component({
  selector: 'app-paso-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './paso-flujo-proyecto.html',
  styleUrl: './paso-flujo-proyecto.css',
})
export class PasoFlujoProyecto {}
