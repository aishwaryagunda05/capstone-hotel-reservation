import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const managerGuard: CanActivateFn = () => {

  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  const role = localStorage.getItem('role');

  if (role === 'Manager') {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
