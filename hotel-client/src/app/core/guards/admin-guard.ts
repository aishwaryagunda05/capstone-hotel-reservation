import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (localStorage.getItem('role') === 'Admin') return true;

  router.navigate(['/']);
  return false;
};
