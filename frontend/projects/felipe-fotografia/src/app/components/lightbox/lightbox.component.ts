// lightbox.component.ts — Full screen photo viewer with navigation
import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  OnInit,
  HostListener,
} from '@angular/core';
import { Photo } from '../../core/services/photo.service';

@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.css',
})
export class LightboxComponent implements OnInit {
  // Photos array from the parent gallery
  @Input() photos: Photo[] = [];

  // Index of the photo that was clicked
  @Input() startIndex: number = 0;

  // Emits when the user closes the lightbox
  @Output() closed = new EventEmitter<void>();

  currentIndex = signal<number>(0);

  ngOnInit(): void {
    this.currentIndex.set(this.startIndex);
  }

  // Current photo based on index
  currentPhoto(): Photo {
    return this.photos[this.currentIndex()];
  }

  next(): void {
    // Loop back to first photo when reaching the end
    this.currentIndex.set((this.currentIndex() + 1) % this.photos.length);
  }

  prev(): void {
    // Loop to last photo when going back from first
    this.currentIndex.set((this.currentIndex() - 1 + this.photos.length) % this.photos.length);
  }

  close(): void {
    this.closed.emit();
  }

  // Close on Escape key
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.close();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }
}
