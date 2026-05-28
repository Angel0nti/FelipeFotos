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

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  // Modern Angular way to inject dependencies
  private http = inject(HttpClient);
  private apiUrl = 'https://felipe-fotos-eloljb18a-angel-portfolio-project.vercel.app/api/photos';
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
    return this.http.post<Photo>(`http://localhost:3000/api/admin/photos`, formData, { headers });
  }

  deletePhoto(id: string): Observable<{ message: string }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.delete<{ message: string }>(`http://localhost:3000/api/admin/photos/${id}`, {
      headers,
    });
  }
}
