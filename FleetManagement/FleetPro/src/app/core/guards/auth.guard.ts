import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppModule } from '../models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

export const permissionGuard = (module: AppModule, action: 'View' | 'Read' | 'Write' | 'Edit' = 'Read'): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }
    if (auth.hasPermission(module, action)) return true;
    router.navigate(['/dashboard']);
    return false;
  };
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  if (auth.isAdminOrSuperAdmin()) return true;
  router.navigate(['/dashboard']);
  return false;
};
