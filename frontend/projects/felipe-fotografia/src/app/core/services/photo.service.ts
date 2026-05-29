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
}
