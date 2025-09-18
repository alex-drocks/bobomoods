import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CardGeneratorComponent } from './components/card-generator.component';
import { FloatingCardsComponent } from './components/floating-cards.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CardGeneratorComponent, NgOptimizedImage, FloatingCardsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('bobomoods');
}
