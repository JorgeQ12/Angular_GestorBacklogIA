import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CargadorGlobal } from './core/carga-global/components/cargador-global/cargador-global';
import { ModalMensaje } from './core/mensajes/components/modal-mensaje/modal-mensaje';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CargadorGlobal, ModalMensaje],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
