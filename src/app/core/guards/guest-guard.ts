import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const CHAT = '/matia/chat';
  if(!authService.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree([CHAT]);
};
