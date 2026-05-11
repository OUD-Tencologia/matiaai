import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const FIRST_ACCESS = '/first-access';
  const CHAT = '/matia/chat';


  const currentUrl = state.url.split('?')[0].split('#')[0];

  // 1. Verifica se o usuário está logado
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const user = authService.getUser();
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const isFirstAccess = user?.primeiro_acesso;
  const isFirstAccessRoute = currentUrl === FIRST_ACCESS;

  // 2. Força ir para first-access se for primeiro acesso
  if (isFirstAccess && !isFirstAccessRoute) {
    return router.createUrlTree([FIRST_ACCESS]);
  }

  // 3. Impede voltar para first-access depois
  if (!isFirstAccess && isFirstAccessRoute) {
    return router.createUrlTree([CHAT]);
  }
  return true;
};