import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);


 // 1. Verifica se o usuário está logado
  if (!authService.isLoggedIn()) {
    // Se não estiver, manda pro login
    router.navigate(['/login']);
    return false;
  }

  // 2. Pega os dados do usuário
  const user = authService.getUser();

  // 3. A TRAVA DO PRIMEIRO ACESSO!
  // Se ele estiver tentando ir para qualquer página (que não seja a de trocar senha)
  // e a flag primeiro_acesso for TRUE, nós bloqueamos e mandamos ele pra tela obrigatória!
  if (user?.primeiro_acesso && state.url !== '/first-access') {
    router.navigate(['/first-access']);
    return false;
  }

  // 4. Trava inversa: Se ele já trocou a senha (primeiro_acesso: false) 
  // e tentar acessar a tela de /first-access digitando na URL, a gente manda ele pro dashboard
  if (!user?.primeiro_acesso && state.url === '/first-access') {
    router.navigate(['/matia/chat']);
    return false;
  }
  // Se passou por todas as travas, o acesso está liberado!
  return true;
};
