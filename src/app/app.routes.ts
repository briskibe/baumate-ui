import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        redirectTo: 'sites',
        pathMatch: 'full'
      },
      {
        path: 'sites',
        loadComponent: () => import('./pages/sites/sites-list.component').then(m => m.SitesListComponent)
      },
      {
        path: 'sites/:id',
        loadComponent: () => import('./pages/sites/site-detail.component').then(m => m.SiteDetailComponent)
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
