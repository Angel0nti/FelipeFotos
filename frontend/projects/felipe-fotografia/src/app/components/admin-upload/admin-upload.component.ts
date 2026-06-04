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
    this.photoService.getAllPhotos().subscribe({
      next: (data) => this.photos.set(data),
      error: () => this.error.set('Error loading photos'),
    });
  }

  async onUpload(): Promise<void> {
    if (!this.selectedFile()) {
      this.error.set('Please select a photo');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Compress image before uploading
    const compressedFile = await this.compressImage(this.selectedFile()!);

    // Step 1 request a signature from the backend
    this.photoService.getUploadSignature(this.category()).subscribe({
      next: async (sig) => {
        try {
          // Step 2 Build the form data for Cloudinary direct Upload
          const formData = new FormData();
          formData.append('file', compressedFile);
          formData.append('timestamp', sig.timestamp.toString());
          formData.append('signature', sig.signature);
          formData.append('api_key', sig.api_key);
          formData.append('folder', sig.folder);

          // Step 3 - upload directly to Cloudinary (bypasses vercel limit)
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
            { method: 'POST', body: formData },
          );

          const result = await response.json();
          if (!response.ok) throw new Error(result.error?.message || 'Upload failed');

          // Step 4 Save only the URL and metadata to MongoDB via backend
          this.photoService
            .savePhoto({
              url: result.secure_url,
              publicId: result.public_id,
              category: this.category(),
              order: this.order(),
              photoTitle: this.photoTitle(),
            })
            .subscribe({
              next: () => {
                this.success.set('Photo uploaded successfully');
                this.loading.set(false);
                this.loadPhotos();
                this.clearMessages();
              },
              error: () => {
                this.error.set('Error saving photo to database');
                this.loading.set(false);
                this.clearMessages();
              },
            });
        } catch (error) {
          this.error.set('Error uploading to Cloudinary');
          this.loading.set(false);
          this.clearMessages();
        }
      },
      error: () => {
        this.error.set('Error getting upload signature');
        this.loading.set(false);
        this.clearMessages();
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
          this.clearMessages();
        },
        error: () => {
          this.error.set('Error updating photo');
          this.clearMessages();
        },
      });
  }

  onDelete(id: string): void {
    this.photoService.deletePhoto(id).subscribe({
      next: () => {
        this.loadPhotos();
        this.clearMessages();
      },
      error: () => {
        this.error.set('Error deleting photo');
        this.clearMessages();
      },
    });
  }

  onAboutFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.aboutFile.set(input.files[0]);
    }
  }
  async onUpdateAbout(): Promise<void> {
    this.loadingAbout.set(true);
    this.error.set(null);

    let photoUrl = undefined;
    let publicId = undefined;

    // If a new photo was selected, upload it directly to Cloudinary
    if (this.aboutFile()) {
      try {
        const compressedFile = await this.compressImage(this.aboutFile()!);

        // Step 1 — get signature for about folder
        const sig = await new Promise<any>((resolve, reject) => {
          this.photoService.getUploadSignature('about').subscribe({
            next: resolve,
            error: reject,
          });
        });

        // Step 2 — upload directly to Cloudinary
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('timestamp', sig.timestamp.toString());
        formData.append('signature', sig.signature);
        formData.append('api_key', sig.api_key);
        formData.append('folder', sig.folder);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
          { method: 'POST', body: formData },
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || 'Upload failed');

        photoUrl = result.secure_url;
        publicId = result.public_id;
      } catch {
        this.error.set('Error uploading about photo');
        this.loadingAbout.set(false);
        this.clearMessages();
        return;
      }
    }

    // Step 3 — save to MongoDB
    this.photoService
      .updateAbout({
        title: this.aboutTitle(),
        bio: this.aboutBio(),
        photoUrl,
        publicId,
      })
      .subscribe({
        next: () => {
          this.success.set('About section updated successfully');
          this.loadingAbout.set(false);
          this.clearMessages();
        },
        error: () => {
          this.error.set('Error updating about section');
          this.loadingAbout.set(false);
          this.clearMessages();
        },
      });
  }

  onHeroFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.heroFile.set(input.files[0]);
    }
  }

  async onUpdateHero(): Promise<void> {
    if (!this.heroFile()) {
      this.error.set('Please select a photo');
      return;
    }

    this.loadingHero.set(true);
    this.error.set(null);

    try {
      const compressedFile = await this.compressImage(this.heroFile()!);

      // Step 1 — get signature for hero folder
      const sig = await new Promise<any>((resolve, reject) => {
        this.photoService.getUploadSignature('hero').subscribe({
          next: resolve,
          error: reject,
        });
      });

      // Step 2 — upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('timestamp', sig.timestamp.toString());
      formData.append('signature', sig.signature);
      formData.append('api_key', sig.api_key);
      formData.append('folder', sig.folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        { method: 'POST', body: formData },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Upload failed');

      // Step 3 — save URL to MongoDB
      this.photoService
        .updateHero({
          photoUrl: result.secure_url,
          publicId: result.public_id,
        })
        .subscribe({
          next: () => {
            this.success.set('Hero image updated successfully');
            this.loadingHero.set(false);
            this.clearMessages();
          },
          error: () => {
            this.error.set('Error updating hero image');
            this.loadingHero.set(false);
            this.clearMessages();
          },
        });
    } catch {
      this.error.set('Error uploading hero image');
      this.loadingHero.set(false);
      this.clearMessages();
    }
  }

  // Auto-clear success and error messages after 4 seconds
  private clearMessages(): void {
    setTimeout(() => {
      this.success.set(null);
      this.error.set(null);
    }, 4000);
  }

  // Compress image before uploading to stay under Cloudinary's 10MB limit
  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target!.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');

          // Max width of 3000px — enough for any screen
          const maxWidth = 3000;
          const scale = Math.min(1, maxWidth / img.width);

          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Export as JPG at 85% quality
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob!], file.name, {
                type: 'image/jpeg',
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.85,
          );
        };
      };
    });
  }
}
