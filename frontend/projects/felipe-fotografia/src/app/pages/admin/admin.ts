// admin.component.ts — Admin panel for photo management
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AdminUploadComponent } from '../../components/admin-upload/admin-upload.component';
import { AdminLoginComponent } from '../../components/admin-login/admin-login.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  imports: [AdminLoginComponent, AdminUploadComponent],
})
export class AdminComponent {
  protected authService = inject(AuthService);
}
