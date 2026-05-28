// auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'https://felipe-fotos-eloljb18a-angel-portfolio-project.vercel.app/api/auth';

  private hasToken(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  //   Signal to track login state across the app
  isLoggedIn = signal<boolean>(this.hasToken());

  //   Send password to backend and store the returned token
  login(password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { password }).pipe(
      tap((response) => {
        localStorage.setItem('admin_token', response.token);
        this.isLoggedIn.set(true);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    this.isLoggedIn.set(false);
  }

  //   Retrieve the token to attach to admin requests
  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }
}
