// app.routes.ts — Application routes
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // Lazy load the home page
    loadComponent: () => import('../pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'admin',
    // Lazy load the admin panel
    loadComponent: () => import('../pages/admin/admin').then((m) => m.AdminComponent),
  },
  {
    // Redirect any unknown route to home
    path: '**',
    redirectTo: '',
  },
];
