import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated and has org_admin role
  if (authService.isAuthenticated() && authService.hasRole('org_admin')) {
    return true;
  }

  // Redirect to sites page if not org_admin
  router.navigate(['/sites']);
  return false;
};
