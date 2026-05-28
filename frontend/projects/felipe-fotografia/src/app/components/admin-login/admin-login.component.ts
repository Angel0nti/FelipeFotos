// admin-login.component.ts — Login form for the admin panel
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
  imports: [FormsModule],
})
export class AdminLoginComponent {
  private authService = inject(AuthService);

  password = signal<string>('');
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.password()).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.error.set('Invalid password');
        this.loading.set(false);
      },
    });
  }
}
