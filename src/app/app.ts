import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertModalComponent } from './shared/components/alert-modal/alert-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('product-frontend');
}
