import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HlmButtonImports} from '@spartan-ng/helm/button';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('baumate-app');
}
