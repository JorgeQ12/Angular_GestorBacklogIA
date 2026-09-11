import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CargadorGlobal } from './core/carga-global/components/cargador-global/cargador-global';
import { ModalMensaje } from './core/mensajes/components/modal-mensaje/modal-mensaje';

/** Compone la infraestructura global y el contenido resuelto por el enrutador. */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, CargadorGlobal, ModalMensaje],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
