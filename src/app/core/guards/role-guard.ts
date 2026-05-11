import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models/user.models';
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const CHAT = '/matia/chat';

  const user = authService.currentUser();
  const allowedRoles: UserRole[] = route.data['roles'] ?? [];

  if (user && allowedRoles.includes(user.role)) {
    return true;
  }
  return router.createUrlTree([CHAT]);
};