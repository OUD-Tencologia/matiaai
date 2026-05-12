import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Variáveis de estado fora da função principal para manterem o valor entre as requisições
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req.clone({
    withCredentials: true 
  });

  // Se o token existir, "carimbamos" a requisição
  if (token) {
    authReq = addTokenHeader(authReq, token);
  }

  // Segue o fluxo normal, mas observando erros
  return next(authReq).pipe(
    catchError((error) => {
      // Se der 401, e NÃO for a rota de login ou refresh (para evitar loop infinito)
      if (
        error instanceof HttpErrorResponse && 
        error.status === 401 && 
        !req.url.includes('auth/login') && 
        !req.url.includes('auth/refresh')
      ) {
        return handle401Error(req, next, authService);
      }
      
      // Se for outro erro, apenas repassa
      return throwError(() => error);
    })
  );
};

// --- Funções Auxiliares ---

// Função para clonar a requisição injetando o Bearer token
function addTokenHeader(request: HttpRequest<unknown>, token: string) {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    },
    withCredentials: true
  });
}

// A mágica acontece aqui: Lida com o 401 e enfileira requisições
function handle401Error(req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService) {
  if (!isRefreshing) {
    // 1º requisição que falhou bloqueia as outras
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Dispara a chamada de refresh no AuthService
    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        
        // Avisa as requisições que estavam na fila qual é o novo token
        refreshTokenSubject.next(response.token);
        
        // Refaz a requisição original que falhou, agora com o token novo
        return next(addTokenHeader(req, response.token));
      }),
      catchError((err) => {
        // Se o próprio refresh der erro (token expirou de vez), desloga tudo
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Se o refresh JÁ ESTÁ acontecendo, as próximas requisições 401 entram numa fila (esperam)
    return refreshTokenSubject.pipe(
      filter(token => token !== null), // Só continua quando o token não for mais nulo
      take(1),                         // Pega o token 1 vez e finaliza o observável
      switchMap(token => {
        // Refaz a requisição com o token novo que chegou na fila
        return next(addTokenHeader(req, token as string));
      })
    );
  }
}