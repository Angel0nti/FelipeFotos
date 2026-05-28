// navbar.component.ts — Sticky nav and mobile menu logic
import { Component, signal, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true,
})
export class NavbarComponent {
  isSticky = signal<boolean>(false);
  isMenuOpen = signal<boolean>(false);

  // Listen to window scroll to activate sticky mode
  @HostListener('window:scroll')
  onScroll(): void {
    this.isSticky.set(window.scrollY > 80);
  }

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}
