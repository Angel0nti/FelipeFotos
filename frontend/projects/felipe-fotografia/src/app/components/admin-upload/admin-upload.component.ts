// admin-upload.component.ts — Photo upload panel for the admin
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhotoService, Photo } from '../../core/services/photo.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-upload',
  templateUrl: './admin-upload.component.html',
  styleUrl: './admin-upload.component.css',
  imports: [FormsModule],
})
export class AdminUploadComponent implements OnInit {
  private photoService = inject(PhotoService);
  protected authService = inject(AuthService);

  //   Form fields
  selectedFile = signal<File | null>(null);
  category = signal<string>('weddings');
  photoTitle = signal<string>('');
  order = signal<number>(0);

  // Track which photo is being edited
  editingId = signal<string | null>(null);
  editTitle = signal<string>('');
  editOrder = signal<number>(0);
  editActive = signal<boolean>(true);

  //   State
  photos = signal<Photo[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // About section signals
  aboutTitle = signal<string>('');
  aboutBio = signal<string>('');
  aboutFile = signal<File | null>(null);
  loadingAbout = signal<boolean>(false);

  // Hero section signals
  heroFile = signal<File | null>(null);
  loadingHero = signal<boolean>(false);

  //   Available categories matching the backend enum
  categories = ['weddings', 'outdoors', 'graduations', 'studio', 'events'];

  ngOnInit(): void {
    this.loadPhotos();

    // Load existing about content on init
    this.photoService.getAbout().subscribe({
      next: (data) => {
        this.aboutTitle.set(data.title);
        this.aboutBio.set(data.bio);
      },
      error: () => {
        // No about content yet, leave fields empty
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  loadPhotos(): void {
    this.photoService.getPhotos().subscribe({
      next: (data) => this.photos.set(data),
      error: () => this.error.set('Error loading photos'),
    });
  }

  onUpload(): void {
    if (!this.selectedFile()) {
      this.error.set('Please select a photo');
      return;
    }

    // Build formData to send file and metadata to the backend
    const formData = new FormData();
    formData.append('photo', this.selectedFile()!);
    formData.append('category', this.category());
    formData.append('photoTitle', this.photoTitle());
    formData.append('order', this.order().toString());

    this.loading.set(true);
    this.error.set(null);

    this.photoService.uploadPhoto(formData).subscribe({
      next: () => {
        this.success.set('Photo uploaded successfully');
        this.loading.set(false);
        this.loadPhotos();
      },
      error: () => {
        this.error.set('Error uploading photo');
        this.loading.set(false);
      },
    });
  }

  // Open edit form for a photo
  onEdit(photo: Photo): void {
    this.editingId.set(photo._id);
    this.editTitle.set(photo.photoTitle || '');
    this.editOrder.set(photo.order);
    this.editActive.set(photo.active);
  }

  // Cancel editing
  onCancelEdit(): void {
    this.editingId.set(null);
  }

  // Save photo changes
  onSaveEdit(id: string): void {
    this.photoService
      .updatePhoto(id, {
        photoTitle: this.editTitle(),
        order: this.editOrder(),
        active: this.editActive(),
      })
      .subscribe({
        next: () => {
          this.success.set('Photo updated successfully');
          this.editingId.set(null);
          this.loadPhotos();
        },
        error: () => {
          this.error.set('Error updating photo');
        },
      });
  }

  onDelete(id: string): void {
    this.photoService.deletePhoto(id).subscribe({
      next: () => this.loadPhotos(),
      error: () => this.error.set('Error deleting photo'),
    });
  }

  onAboutFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.aboutFile.set(input.files[0]);
    }
  }
  onUpdateAbout(): void {
    this.loadingAbout.set(true);

    const formData = new FormData();
    formData.append('title', this.aboutTitle());
    formData.append('bio', this.aboutBio());
    if (this.aboutFile()) {
      formData.append('photo', this.aboutFile()!);
    }

    this.photoService.updateAbout(formData).subscribe({
      next: () => {
        this.success.set('About section updated successfully');
        this.loadingAbout.set(false);
      },
      error: () => {
        this.error.set('Error updating about section');
        this.loadingAbout.set(false);
      },
    });
  }

  onHeroFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.heroFile.set(input.files[0]);
    }
  }

  onUpdateHero(): void {
    if (!this.heroFile()) {
      this.error.set('Please select a photo');
      return;
    }

    const formData = new FormData();
    formData.append('photo', this.heroFile()!);

    this.loadingHero.set(true);
    this.error.set(null);

    this.photoService.updateHero(formData).subscribe({
      next: () => {
        this.success.set('Hero image updated successfully');
        this.loadingHero.set(false);
      },
      error: () => {
        this.error.set('Error updating hero image');
        this.loadingHero.set(false);
      },
    });
  }
}
