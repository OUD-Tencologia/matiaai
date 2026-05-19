import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn & CanActivateChildFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const FIRST_ACCESS = '/first-access';
  const CHAT = '/matia/chat';
  const currentUrl = state.url.split('?')[0].split('#')[0];

  // Não está logado de jeito nenhum
  if (!authService.isLoggedIn() || !authService.getToken()) {
    return router.createUrlTree(['/login']);
  }

  // Token ainda válido → deixa passar normalmente
  if (!authService.isTokenExpired()) {
    return checkFirstAccess(authService, currentUrl, FIRST_ACCESS, CHAT, router);
  }

  // Token expirado → tenta renovar silenciosamente antes de decidir
  return authService.refreshToken().pipe(
    map(() => {
      // Refresh OK → deixa passar
      return checkFirstAccess(authService, currentUrl, FIRST_ACCESS, CHAT, router);
    }),
    catchError(() => {
      // Refresh falhou → desloga e manda pro login
      authService.logout();
      return of(router.createUrlTree(['/login']));
    })
  );
};

function checkFirstAccess(
  authService: AuthService,
  currentUrl: string,
  FIRST_ACCESS: string,
  CHAT: string,
  router: Router
) {
  const user = authService.getUser();
  if (!user) return router.createUrlTree(['/login']);

  if (user.primeiro_acesso && currentUrl !== FIRST_ACCESS) {
    return router.createUrlTree([FIRST_ACCESS]);
  }

  if (!user.primeiro_acesso && currentUrl === FIRST_ACCESS) {
    return router.createUrlTree([CHAT]);
  }

  return true;
}