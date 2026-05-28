// footer.component.ts — Static footer with dynamic year
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  // Automatically updates every year
  currentYear = new Date().getFullYear();
}
