import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Presenta la etapa inicial de definición del proyecto creado. */
@Component({
  selector: 'app-pagina-contexto-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagina-contexto-proyecto.html',
  styleUrl: './pagina-contexto-proyecto.css',
})
export class PaginaContextoProyecto {}
