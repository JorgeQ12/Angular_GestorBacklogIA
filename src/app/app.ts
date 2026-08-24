import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CargadorGlobal } from './core/carga-global/components/cargador-global/cargador-global';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CargadorGlobal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
