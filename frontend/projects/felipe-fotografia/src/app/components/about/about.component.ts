// about.component.ts — About section, loads content from backend
import { Component, inject, OnInit, signal } from '@angular/core';
import { PhotoService, About } from '../../core/services/photo.service';
import { AfterViewInit } from '@angular/core';
import { AnimationService } from '../../core/services/animation.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit, AfterViewInit {
  private photoService = inject(PhotoService);
  private animationService = inject(AnimationService);

  about = signal<About | null>(null);
  loading = signal<boolean>(true);

  ngAfterViewInit(): void {
    this.animationService.observeElements('.about');
  }

  ngOnInit(): void {
    this.photoService.getAbout().subscribe({
      next: (data) => {
        this.about.set(data);
        this.loading.set(false);
      },
      error: () => {
        // If no about content exists yet, just hide the section
        this.loading.set(false);
      },
    });
  }
}
