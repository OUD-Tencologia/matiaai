import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();
  const CHAT = '/matia/chat';

  if(user?.role === 'SUPER-ADMIN') {
    return true;
  }
  return router.createUrlTree([CHAT]);
};
