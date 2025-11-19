import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    RouterOutlet,
    NgxSonnerToaster
  ],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('baumate-app');
}
