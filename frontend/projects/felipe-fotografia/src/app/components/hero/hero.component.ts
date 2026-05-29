// hero.component.ts — Hero section, loads image from backend
import { Component, inject, OnInit, signal } from '@angular/core';
import { PhotoService, Hero } from '../../core/services/photo.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements OnInit {
  private photoService = inject(PhotoService);

  hero = signal<Hero | null>(null);

  // Fallback image in case no hero is set in the database
  fallbackUrl = 'images/hero/humbe1.avif';

  ngOnInit(): void {
    this.photoService.getHero().subscribe({
      next: (data) => this.hero.set(data),
      error: () => {
        // Use fallback image if no hero is set
      },
    });
  }

  getHeroUrl(): string {
    return this.hero()?.photoUrl ?? this.fallbackUrl;
  }
}
