import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = (typeof window !== 'undefined' && window?.localStorage)
    ? localStorage.getItem('auth_token')
    : null;
  if (token) return true;
  router.navigate(['/login'], { replaceUrl: true });
  return false;
};