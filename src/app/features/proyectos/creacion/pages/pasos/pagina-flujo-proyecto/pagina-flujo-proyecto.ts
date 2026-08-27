import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';

/** Reserva el destino estable de Flujo mientras se completa su migración. */
@Component({
  selector: 'app-pagina-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './pagina-flujo-proyecto.html',
  styleUrl: './pagina-flujo-proyecto.css',
})
export class PaginaFlujoProyecto {}
