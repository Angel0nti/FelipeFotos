import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { PhotoService, Photo } from '../../core/services/photo.service';
import { AnimationService } from '../../core/services/animation.service';
import { AfterViewInit } from '@angular/core';
import { LightboxComponent } from '../lightbox/lightbox.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [LightboxComponent],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnInit, AfterViewInit {
  private animationService = inject(AnimationService);
  private photoService = inject(PhotoService);

  // Receives the category name from the parent component
  @Input() category!: string;

  // 'masonry' or 'grid' - determines the layout style
  @Input() layout!: 'masonry' | 'grid';

  // Optional section title displayed above the gallery
  @Input() title!: string;

  photos = signal<Photo[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Add signals for the lightbox
  lightboxOpen = signal<boolean>(false);
  lightboxIndex = signal<number>(0);

  // Transforms the Cloudinary URL to add automatic format and quality optimization
  getOptimizedUrl(url: string): string {
    return url.replace('/upload/', '/upload/f_auto,q_auto:good,w_1200/');
  }

  ngOnInit(): void {
    // Fetches photos filtered by the received category
    this.photoService.getPhotosByCategory(this.category).subscribe({
      next: (data) => {
        this.photos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error loading photos');
        this.loading.set(false);
      },
    });
  }

  // Called after the view is fully rendered
  ngAfterViewInit(): void {
    this.animationService.observeElements('.gallery-section');
  }

  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }
}
