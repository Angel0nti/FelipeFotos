// photo.service.ts - Handles all photo-related HTTP requests
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

// Interface that matches MongoDB photo document
export interface Photo {
  _id: string;
  url: string;
  publicId: string;
  category: string;
  order: number;
  photoTitle?: string;
  active: boolean;
}

// Interface for the about section content
export interface About {
  _id: string;
  title: string;
  bio: string;
  photoUrl: string;
  publicId: string;
}

// Interface for the hero section
export interface Hero {
  _id: string;
  photoUrl: string;
  publicId: string;
}

// Interface for Cloudinary signature response
export interface CloudinarySignature {
  timestamp: number;
  signature: string;
  folder: string;
  api_key: string;
  cloud_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  // Modern Angular way to inject dependencies
  private http = inject(HttpClient);
  private apiUrl = 'https://felipe-fotos.vercel.app/api/photos';
  // private apiUrl = 'http://localhost:3000/api/photos'; // local test
  private authService = inject(AuthService);

  //   Fetch all active photos
  getPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.apiUrl);
  }

  // Fetch ALL photos including inactive ones (admin only)
  getAllPhotos(): Observable<Photo[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.get<Photo[]>(`https://felipe-fotos.vercel.app/api/admin/photos`, { headers });
  }

  getPhotosByCategory(category: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/${category}`);
  }

  uploadPhoto(formData: FormData): Observable<Photo> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.post<Photo>(`https://felipe-fotos.vercel.app/api/admin/photos`, formData, {
      headers,
    });
  }
  // Request a signed upload from the backend
  getUploadSignature(folder: string): Observable<CloudinarySignature> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.get<CloudinarySignature>(
      `https://felipe-fotos.vercel.app/api/admin/sign-upload?folder=${folder}`,
      { headers },
    );
  }

  // Save photo metadata to MongoDB after Cloudinary upload
  savePhoto(data: {
    url: string;
    publicId: string;
    category: string;
    order: number;
    photoTitle: string;
  }): Observable<Photo> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.post<Photo>(`https://felipe-fotos.vercel.app/api/admin/photos`, data, {
      headers,
    });
  }
  // Update photo metadata (admin only)
  updatePhoto(
    id: string,
    data: { order?: number; photoTitle?: string; active?: boolean },
  ): Observable<Photo> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.patch<Photo>(`https://felipe-fotos.vercel.app/api/admin/photos/${id}`, data, {
      headers,
    });
  }

  deletePhoto(id: string): Observable<{ message: string }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.delete<{ message: string }>(
      `https://felipe-fotos.vercel.app/api/admin/photos/${id}`,
      { headers },
    );
  }
  // Fetch the about section content
  getAbout(): Observable<About> {
    return this.http.get<About>(`${this.apiUrl.replace('/photos', '/about')}`);
  }

  // Update the about section content (admin only)
  updateAbout(formData: FormData): Observable<About> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.put<About>(`${this.apiUrl.replace('/photos', '/about')}`, formData, {
      headers,
    });
  }

  // Fetch the hero image
  getHero(): Observable<Hero> {
    return this.http.get<Hero>(`${this.apiUrl.replace('/photos', '/hero')}`);
  }

  // Update the hero image (admin only)
  updateHero(formData: FormData): Observable<Hero> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.put<Hero>(`${this.apiUrl.replace('/photos', '/hero')}`, formData, { headers });
  }
}
