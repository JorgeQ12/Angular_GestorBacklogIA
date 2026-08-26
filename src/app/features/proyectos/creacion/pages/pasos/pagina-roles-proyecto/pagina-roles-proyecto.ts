import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Reserva el destino estable para continuar con Roles. */
@Component({
  selector: 'app-pagina-roles-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagina-roles-proyecto.html',
  styleUrl: './pagina-roles-proyecto.css',
})
export class PaginaRolesProyecto {}
